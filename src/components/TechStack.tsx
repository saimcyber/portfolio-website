import * as THREE from "three";
import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { EffectComposer, N8AO } from "@react-three/postprocessing";
import {
  BallCollider,
  Physics,
  RigidBody,
  CuboidCollider,
  RapierRigidBody,
} from "@react-three/rapier";
import { RoundedBoxGeometry } from "three-stdlib";

const textureLoader = new THREE.TextureLoader();
// Simple generated tiles (color + wordmark, no reproduced logo iconography)
// standing in for the real DevOps stack until branded assets are supplied -
// these were still the template's original MERN-stack images (React/Next/
// Node/Express/Mongo/MySQL/TS/JS), which is what "wrong logos" meant.
const imageUrls = [
  "/images/stack/docker.svg",
  "/images/stack/k8s.svg",
  "/images/stack/terraform.svg",
  "/images/stack/aws.svg",
  "/images/stack/actions.svg",
  "/images/stack/linux.svg",
  "/images/stack/prometheus.svg",
  "/images/stack/grafana.svg",
];
const textures = imageUrls.map((url) => textureLoader.load(url));

/* Containers, not spheres. The tumbling-sphere ball pit is one of the most
   cloned react-three-fiber demos going, so it read as borrowed; rounded cubes
   also suit a DevOps stack far better. */
const containerGeometry = new RoundedBoxGeometry(1.5, 1.5, 1.5, 4, 0.18);

// Fewer, more settled containers read as a deliberate cluster rather than a
// chaotic pile — 30 tightly homing bodies overlapped and jittered constantly.
const spheres = [...Array(22)].map(() => ({
  scale: [0.7, 1, 0.8, 1, 1][Math.floor(Math.random() * 5)],
}));

type SphereProps = {
  vec?: THREE.Vector3;
  scale: number;
  r?: typeof THREE.MathUtils.randFloatSpread;
  material: THREE.MeshPhysicalMaterial;
  isActive: boolean;
};

function SphereGeo({
  vec = new THREE.Vector3(),
  scale,
  r = THREE.MathUtils.randFloatSpread,
  material,
  isActive,
}: SphereProps) {
  const api = useRef<RapierRigidBody | null>(null);

  useFrame((_state, delta) => {
    // `isActive` can flip true in the same tick the rigid body is torn down
    // (scroll-away unmount racing the physics step), and the `!` here used to
    // assert past that instead of guarding it — an uncaught
    // "Cannot read properties of null (reading 'translation')" on unmount.
    if (!isActive || !api.current) return;
    delta = Math.min(0.1, delta);
    // Softer and less Y-biased than before (was -50/-150/-50): that strong,
    // constant homing pull is what kept every body crushed together at the
    // centre, fighting the collision solver every frame — the "bouncing"
    // came from cubes with flat, sharp-edged faces (unlike spheres, which
    // glance smoothly off each other) being continuously shoved back into
    // contact and flashing different faces as they spun.
    const impulse = vec
      .copy(api.current.translation())
      .normalize()
      .multiply(
        new THREE.Vector3(
          -22 * delta * scale,
          -55 * delta * scale,
          -22 * delta * scale
        )
      );

    api.current?.applyImpulse(impulse, true);
  });

  return (
    <RigidBody
      linearDamping={0.85}
      // Was 0.15 - nearly free spin. Cube faces flashing between logos as
      // they tumbled read as erratic "bouncing"; a sphere hides this because
      // its surface has no facets to flash. Damping the spin hard is what
      // actually calms it, more than anything about the attraction force.
      angularDamping={0.7}
      friction={0.45}
      restitution={0}
      position={[r(20), r(20) - 25, r(20) - 10]}
      ref={api}
      colliders={false}
    >
      <CuboidCollider args={[0.78 * scale, 0.78 * scale, 0.78 * scale]} />
      <mesh
        castShadow
        receiveShadow
        scale={scale}
        geometry={containerGeometry}
        material={material}
        rotation={[0.3, 1, 1]}
      />
    </RigidBody>
  );
}

type PointerProps = {
  vec?: THREE.Vector3;
  isActive: boolean;
};

function Pointer({ vec = new THREE.Vector3(), isActive }: PointerProps) {
  const ref = useRef<RapierRigidBody>(null);

  useFrame(({ pointer, viewport }) => {
    if (!isActive) return;
    const targetVec = vec.lerp(
      new THREE.Vector3(
        (pointer.x * viewport.width) / 2,
        (pointer.y * viewport.height) / 2,
        0
      ),
      0.2
    );
    ref.current?.setNextKinematicTranslation(targetVec);
  });

  return (
    <RigidBody
      position={[100, 100, 100]}
      type="kinematicPosition"
      colliders={false}
      ref={ref}
    >
      <BallCollider args={[2]} />
    </RigidBody>
  );
}

const TechStack = () => {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const threshold = document
        .getElementById("work")!
        .getBoundingClientRect().top;
      setIsActive(scrollY > threshold);
    };
    document.querySelectorAll(".header a").forEach((elem) => {
      const element = elem as HTMLAnchorElement;
      element.addEventListener("click", () => {
        const interval = setInterval(() => {
          handleScroll();
        }, 10);
        setTimeout(() => {
          clearInterval(interval);
        }, 1000);
      });
    });
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  const materials = useMemo(() => {
    return textures.map(
      (texture) =>
        new THREE.MeshPhysicalMaterial({
          map: texture,
          emissive: "#ffffff",
          emissiveMap: texture,
          emissiveIntensity: 0.3,
          metalness: 0.5,
          roughness: 1,
          clearcoat: 0.1,
        })
    );
  }, []);

  return (
    <div className="techstack">
      <h2> My Techstack</h2>

      <Canvas
        shadows
        gl={{ alpha: true, stencil: false, depth: false, antialias: false }}
        camera={{ position: [0, 0, 20], fov: 32.5, near: 1, far: 100 }}
        onCreated={(state) => (state.gl.toneMappingExposure = 1.5)}
        className="tech-canvas"
      >
        <ambientLight intensity={1} />
        <spotLight
          position={[20, 20, 25]}
          penumbra={1}
          angle={0.2}
          color="white"
          castShadow
          shadow-mapSize={[512, 512]}
        />
        <directionalLight position={[0, 5, -4]} intensity={2} />
        <Physics gravity={[0, 0, 0]}>
          <Pointer isActive={isActive} />
          {spheres.map((props, i) => (
            <SphereGeo
              key={i}
              {...props}
              material={materials[Math.floor(Math.random() * materials.length)]}
              isActive={isActive}
            />
          ))}
        </Physics>
        <Environment
          files="/models/char_enviorment.hdr"
          environmentIntensity={0.5}
          environmentRotation={[0, 4, 2]}
        />
        <EffectComposer enableNormalPass={false}>
          <N8AO color="#0f002c" aoRadius={2} intensity={1.15} />
        </EffectComposer>
      </Canvas>
    </div>
  );
};

export default TechStack;
