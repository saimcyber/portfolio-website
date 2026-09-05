import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import {
  getFlash,
  getNodes,
  getNodeCount,
  isMotionEnabled,
  podCutoverHeat,
  podTargetVersion,
  stepCluster,
} from "./clusterStore";

/**
 * Status color reads as a real Kubernetes dashboard would: green Ready,
 * amber degrading, red failed - the convention kubectl/Lens/K9s/Grafana all
 * share, and the one thing that actually makes "healthy" legible against a
 * purple site. Purple stays as the STRUCTURAL color (chassis, hub, edges) -
 * that split is what keeps the scene on-brand while making status scannable.
 */
const C_HEALTHY = new THREE.Color("#3ddc84");
const C_DEGRADING = new THREE.Color("#ffb066");
const C_FAILED = new THREE.Color("#ff4d6d");
const C_STARTING = new THREE.Color("#a8f5c8");
const C_WAVE = new THREE.Color("#ffffff");
const C_BODY = new THREE.Color("#241d30");
const C_STRUCTURE = new THREE.Color("#8f6fd4");
const C_FLASH_FAIL = new THREE.Color("#ff3355");
const C_FLASH_RECOVER = new THREE.Color("#6bffb0");

const MAX_PODS = 4;
const PARTICLES_PER_EDGE = 3;
const POD_STEP = 0.185;

function healthColor(h: string): THREE.Color {
  if (h === "degrading") return C_DEGRADING;
  if (h === "failed") return C_FAILED;
  if (h === "starting") return C_STARTING;
  return C_HEALTHY;
}

/* ------------------------------------------------------------------ node */

function NodeMesh({
  index,
  hoveredRef,
}: {
  index: number;
  hoveredRef: React.MutableRefObject<number>;
}) {
  const group = useRef<THREE.Group>(null!);
  const body = useRef<THREE.MeshStandardMaterial>(null!);
  const led = useRef<THREE.MeshStandardMaterial>(null!);
  const pods = useRef<(THREE.Mesh | null)[]>([]);
  const tmp = useMemo(() => new THREE.Color(), []);
  const podTmp = useMemo(() => new THREE.Color(), []);
  const scaleTarget = useMemo(() => new THREE.Vector3(), []);
  const pos = getNodes()[index].position;

  useFrame((state) => {
    const node = getNodes()[index];
    if (!group.current || !body.current) return;

    const hovered = hoveredRef.current === index;
    const t = state.clock.elapsedTime;
    const s = node.presence;

    group.current.scale.setScalar(s);
    group.current.position.y =
      node.position[1] +
      (isMotionEnabled() ? Math.sin(t * 0.6 + node.loadPhase) * 0.07 : 0) +
      (hovered ? 0.16 : 0);

    // Body keeps a fixed structural purple tint regardless of health - it's
    // the chassis, not a status readout. Only the LED strip and pods report
    // status color, the way a server's own case stays neutral while its
    // drive-bay lights do the talking.
    body.current.emissive.lerp(C_STRUCTURE, 0.12);
    body.current.emissiveIntensity =
      (0.1 + node.load * 0.26) * (hovered ? 2.6 : 1) * s;

    const flash = getFlash(index);
    const col = healthColor(node.health);
    if (flash) tmp.copy(col).lerp(flash.type === "fail" ? C_FLASH_FAIL : C_FLASH_RECOVER, flash.intensity);
    else tmp.copy(col);

    // Front-face status strip: reads as a server LED bar and gives the node a
    // silhouette detail that a plain rounded box lacks.
    if (led.current) {
      led.current.emissive.lerp(tmp, 0.35);
      led.current.emissiveIntensity =
        (node.health === "failed" ? 0.1 : 0.7 + node.load * 0.5) *
        (1 + (flash ? flash.intensity * 2.2 : 0)) *
        (hovered ? 1.7 : 1) *
        s;
    }

    for (let p = 0; p < MAX_PODS; p++) {
      const mesh = pods.current[p];
      if (!mesh) continue;
      const pod = node.pods[p];
      if (!pod) {
        mesh.scale.setScalar(0);
        continue;
      }
      const mat = mesh.material as THREE.MeshStandardMaterial;
      const heat = podCutoverHeat(index, p);
      const v2 = podTargetVersion(index, p) === "v2";

      const podBase = pod.ready ? (v2 ? C_STARTING : C_HEALTHY) : C_FAILED;
      podTmp.copy(podBase).lerp(C_WAVE, heat);
      if (flash) podTmp.lerp(flash.type === "fail" ? C_FLASH_FAIL : C_FLASH_RECOVER, flash.intensity * 0.7);
      mat.emissive.lerp(podTmp, 0.3);
      mat.emissiveIntensity =
        (pod.ready ? 0.55 : 0.08) + heat * 2.4 + (flash ? flash.intensity * 1.4 : 0) + (hovered ? 0.2 : 0);

      const target = (pod.ready ? 1 : 0.5) * s;
      scaleTarget.setScalar(target);
      mesh.scale.lerp(scaleTarget, 0.15);
      mesh.position.y = 0.26 + heat * 0.09;
      if (isMotionEnabled()) mesh.rotation.y += 0.004 + heat * 0.04;
    }
  });

  return (
    <group ref={group} position={pos}>
      <RoundedBox args={[0.78, 0.23, 0.58]} radius={0.055} smoothness={3}>
        <meshStandardMaterial
          ref={body}
          color={C_BODY}
          metalness={0.72}
          roughness={0.34}
          emissive={C_STRUCTURE}
          emissiveIntensity={0.12}
        />
      </RoundedBox>

      <mesh position={[-0.09, 0, 0.3]}>
        <boxGeometry args={[0.44, 0.028, 0.012]} />
        <meshStandardMaterial
          ref={led}
          color="#0d0a14"
          emissive={C_HEALTHY}
          emissiveIntensity={0.8}
          toneMapped={false}
        />
      </mesh>

      {Array.from({ length: MAX_PODS }, (_, p) => (
        <mesh
          key={p}
          ref={(el) => {
            pods.current[p] = el;
          }}
          position={[(p - (MAX_PODS - 1) / 2) * POD_STEP, 0.26, 0]}
        >
          <boxGeometry args={[0.115, 0.115, 0.115]} />
          <meshStandardMaterial
            color="#0f0b16"
            metalness={0.15}
            roughness={0.55}
            emissive={C_HEALTHY}
            emissiveIntensity={0.55}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ------------------------------------------------------- edges + traffic */

function Network() {
  const traffic = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const count = getNodeCount();

  // Node positions never move, so curves are built once.
  const curves = useMemo(() => {
    const list: THREE.QuadraticBezierCurve3[] = [];
    const ns = getNodes();
    for (let i = 0; i < count; i++) {
      const a = new THREE.Vector3(0, 0, 0);
      const b = new THREE.Vector3(...ns[i].position);
      const mid = a.clone().add(b).multiplyScalar(0.5);
      // Bow the spoke outward from the column axis so it doesn't pass through
      // the control plane.
      const outward = new THREE.Vector3(b.x, 0, b.z).normalize().multiplyScalar(0.45);
      list.push(new THREE.QuadraticBezierCurve3(a, mid.add(outward), b));
    }
    for (let i = 0; i < count - 1; i++) {
      const a = new THREE.Vector3(...ns[i].position);
      const b = new THREE.Vector3(...ns[i + 1].position);
      const mid = a.clone().add(b).multiplyScalar(0.5).multiplyScalar(1.18);
      list.push(new THREE.QuadraticBezierCurve3(a, mid, b));
    }
    return list;
  }, [count]);

  const tubes = useMemo(
    () => curves.map((c) => new THREE.TubeGeometry(c, 26, 0.008, 6, false)),
    [curves]
  );

  const total = curves.length * PARTICLES_PER_EDGE;
  const offsets = useMemo(
    () => Array.from({ length: total }, (_, i) => (i % 97) / 97),
    [total]
  );

  useFrame((state, delta) => {
    stepCluster(delta);
    if (!traffic.current) return;
    const t = isMotionEnabled() ? state.clock.elapsedTime : 0;
    const ns = getNodes();
    let k = 0;
    for (let e = 0; e < curves.length; e++) {
      // Spokes carry their node's traffic; links carry the node they leave.
      // A failed node visibly stops emitting and its edges go quiet.
      const node = ns[e < count ? e : e - count];
      const alive = node.health !== "failed" ? node.presence : 0;
      // A touch faster and more load-reactive than before so the flow reads
      // as active traffic rather than a slow ambient drift.
      const speed = 0.14 + node.load * 0.24;
      for (let p = 0; p < PARTICLES_PER_EDGE; p++) {
        const u = (t * speed + offsets[k]) % 1;
        dummy.position.copy(curves[e].getPoint(u));
        dummy.scale.setScalar(alive * (0.6 + node.load * 0.75) * 0.046);
        dummy.updateMatrix();
        traffic.current.setMatrixAt(k, dummy.matrix);
        k++;
      }
    }
    traffic.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      {tubes.map((g, i) => (
        <mesh key={i} geometry={g}>
          <meshBasicMaterial color="#5b3f8f" transparent opacity={0.42} />
        </mesh>
      ))}
      <instancedMesh
        ref={traffic}
        args={[undefined, undefined, total]}
        frustumCulled={false}
      >
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial color="#e4d8ff" />
      </instancedMesh>
    </>
  );
}

/* ---------------------------------------------------------- control plane */

function ControlPlane() {
  const core = useRef<THREE.Mesh>(null!);
  const shell = useRef<THREE.Mesh>(null!);
  const mat = useRef<THREE.MeshStandardMaterial>(null!);

  useFrame((state, delta) => {
    if (!isMotionEnabled()) {
      if (mat.current) mat.current.emissiveIntensity = 0.62;
      return;
    }
    const t = state.clock.elapsedTime;
    if (core.current) {
      core.current.rotation.y += delta * 0.25;
      core.current.rotation.x += delta * 0.1;
    }
    if (shell.current) {
      shell.current.rotation.y -= delta * 0.16;
      shell.current.rotation.z += delta * 0.06;
    }
    if (mat.current) {
      mat.current.emissiveIntensity = 0.62 + Math.sin(t * 1.4) * 0.12;
    }
  });

  return (
    <group>
      <mesh ref={core}>
        <icosahedronGeometry args={[0.34, 1]} />
        <meshStandardMaterial
          ref={mat}
          color="#2a2035"
          metalness={0.9}
          roughness={0.22}
          emissive="#e6d9ff"
          emissiveIntensity={0.62}
        />
      </mesh>
      <mesh ref={shell}>
        <icosahedronGeometry args={[0.62, 1]} />
        <meshBasicMaterial color="#8f6fd4" wireframe transparent opacity={0.28} />
      </mesh>
    </group>
  );
}

/* -------------------------------------------------------------------- rig */

export default function ClusterRig({
  rigRef,
  mouseRef,
  reduced,
}: {
  rigRef: React.MutableRefObject<THREE.Group | null>;
  mouseRef: React.MutableRefObject<{ x: number; y: number; moved: boolean }>;
  reduced: boolean;
}) {
  const hoveredRef = useRef(-1);
  const spin = useRef<THREE.Group>(null!);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const ndc = useMemo(() => new THREE.Vector2(), []);
  const nodeCount = getNodeCount();

  useFrame((state, delta) => {
    const rig = rigRef.current;
    if (!rig) return;
    const nearTop = window.scrollY < 240;

    // Constant slow drift, independent of the cursor and of the scroll
    // timeline (which owns `rig.rotation`), so the cluster is never static.
    if (spin.current && !reduced) spin.current.rotation.y += delta * 0.06;

    // Parallax: the rig leans toward the cursor, but only near the top of the
    // page - past that the scroll timeline owns the rotation.
    if (nearTop && !reduced) {
      const tx = mouseRef.current.y * 0.12;
      const ty = mouseRef.current.x * 0.3;
      rig.rotation.x += (tx - rig.rotation.x) * 0.05;
      rig.rotation.y += (ty - rig.rotation.y) * 0.05;
    }

    // Hover is raycast by hand: the canvas is `pointer-events: none` so the
    // hero text stays selectable, which R3F's own pointer events would break.
    if (nearTop && mouseRef.current.moved) {
      ndc.set(mouseRef.current.x, mouseRef.current.y);
      raycaster.setFromCamera(ndc, state.camera);
      const hits = raycaster.intersectObjects(rig.children, true);
      let found = -1;
      if (hits.length) {
        let o: THREE.Object3D | null = hits[0].object;
        while (o && o !== rig) {
          if (typeof o.userData.nodeIndex === "number") {
            found = o.userData.nodeIndex;
            break;
          }
          o = o.parent;
        }
      }
      hoveredRef.current = found;
    } else {
      hoveredRef.current = -1;
    }
  });

  return (
    <group ref={rigRef as React.RefObject<THREE.Group>}>
      <group ref={spin}>
        <ControlPlane />
        <Network />
        {Array.from({ length: nodeCount }, (_, i) => (
          <group key={i} userData={{ nodeIndex: i }}>
            <NodeMesh index={i} hoveredRef={hoveredRef} />
          </group>
        ))}
      </group>
    </group>
  );
}
