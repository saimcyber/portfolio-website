/**
 * Live model of the cluster shown in the hero.
 *
 * This is deliberately a plain module rather than React state: it is stepped
 * from the render loop (so it pauses with the tab and respects reduced motion)
 * and read by two very different consumers - the 3D rig every frame, and the
 * hidden terminal's `kubectl` commands on demand. Keeping it outside React
 * means the terminal reports exactly what the scene is drawing.
 */

export type NodeHealth = "healthy" | "degrading" | "failed" | "starting";
export type PodVersion = "v1" | "v2";

export interface ClusterPod {
  id: string;
  app: string;
  version: PodVersion;
  ready: boolean;
  restarts: number;
}

export interface ClusterNode {
  id: string;
  name: string;
  health: NodeHealth;
  /** 0..1, drives emissive pulse and traffic density. */
  load: number;
  loadPhase: number;
  pods: ClusterPod[];
  position: [number, number, number];
  /** 0..1 spawn/despawn scale, animated during failure and restart. */
  presence: number;
}

const APPS = [
  "securekubeops-api",
  "awarenet-gateway",
  "trivy-scanner",
  "prometheus",
  "grafana",
  "argocd-repo",
];

const NODE_COUNT = 7;

/**
 * A vertical helix, not a ring.
 *
 * The hero leaves a free centre band of only ~38% of the viewport width
 * between the "SAIM ZAIB" block and the "DEVSECOPS ENGINEER" block (measured
 * at 1440 and 1920). A wide ring collides with both; a tall narrow column
 * occupies the same silhouette the character did. Max width here is
 * 2 * (1.05 + 0.28) + node width 0.78 = 3.44 units, against ~11.6 units of
 * visible width at the desktop camera - about 30%. Height is kept to ~4.8
 * units of the 7.2 visible so the top node clears the navbar.
 */
function nodePosition(i: number): [number, number, number] {
  const t = i / (NODE_COUNT - 1);
  const angle = t * Math.PI * 2 * 1.25 + 0.6;
  const r = 1.05 + Math.sin(t * Math.PI) * 0.28; // bulges at mid-column
  return [Math.cos(angle) * r, (t - 0.5) * 4.3, Math.sin(angle) * r];
}

function hash(n: number): number {
  const s = Math.sin(n * 127.1) * 43758.5453;
  return s - Math.floor(s);
}

let podSeq = 0;
function makePod(app: string, version: PodVersion): ClusterPod {
  podSeq += 1;
  const suffix = Math.floor(hash(podSeq * 7.3) * 0xfffff)
    .toString(36)
    .padStart(5, "0")
    .slice(0, 5);
  const rs = Math.floor(hash(podSeq * 3.1) * 0xffff)
    .toString(36)
    .padStart(4, "0")
    .slice(0, 4);
  return {
    id: `${app}-${rs}-${suffix}`,
    app,
    version,
    ready: true,
    restarts: 0,
  };
}

let nodeSeq = 0;
function makeNode(i: number): ClusterNode {
  nodeSeq += 1;
  const podCount = 2 + Math.floor(hash(nodeSeq * 5.7) * 3); // 2..4
  const pods: ClusterPod[] = [];
  for (let p = 0; p < podCount; p++) {
    pods.push(makePod(APPS[(i + p) % APPS.length], "v1"));
  }
  return {
    id: `n${i}`,
    name: `ip-10-0-${i + 1}-${10 + Math.floor(hash(nodeSeq * 9.4) * 80)}`,
    health: "healthy",
    load: 0.35 + hash(nodeSeq * 2.2) * 0.4,
    loadPhase: hash(nodeSeq * 11.7) * Math.PI * 2,
    pods,
    position: nodePosition(i),
    presence: 1,
  };
}

const nodes: ClusterNode[] = Array.from({ length: NODE_COUNT }, (_, i) =>
  makeNode(i)
);

/* ---------------------------------------------------------------- rollout */

/** 0..1, driven by the scroll timeline. Pods flip to v2 as the wave passes. */
let rollout = 0;
export const setRollout = (v: number) => {
  rollout = Math.max(0, Math.min(1, v));
};
export const getRollout = () => rollout;

/** Global pod ordering so the update sweeps the cluster rather than each node
 *  updating independently - that wave is the whole point of the effect. */
function podWaveIndex(nodeIndex: number, podIndex: number): number {
  return nodeIndex + podIndex / 6;
}
const WAVE_MAX = NODE_COUNT + 1;

export function podTargetVersion(
  nodeIndex: number,
  podIndex: number
): PodVersion {
  return podWaveIndex(nodeIndex, podIndex) / WAVE_MAX <= rollout ? "v2" : "v1";
}

/**
 * 1 while this pod is mid-cutover, for the white flash.
 *
 * `d <= 0` rather than `d < 0`: at rollout 0 the first pod's wave index is
 * also 0, so a `< 0` test left it permanently at full heat - a single pod
 * stuck glowing pure white on page load.
 */
export function podCutoverHeat(nodeIndex: number, podIndex: number): number {
  if (rollout <= 0) return 0;
  const d = rollout * WAVE_MAX - podWaveIndex(nodeIndex, podIndex);
  if (d <= 0 || d > 0.85) return 0;
  return 1 - d / 0.85;
}

/* -------------------------------------------------------- failure/healing */

type Phase = "idle" | "degrading" | "failed" | "starting";

let phase: Phase = "idle";
let phaseT = 0;
let victim = -1;
let elapsed = 0;
let nextEventAt = 4;
let enabled = true;

/**
 * A short, decaying pulse fired at the exact moment a node fails or a
 * replacement comes back online - a plain color lerp made those transitions
 * read as a slow, easy-to-miss fade. This gives each one a real "beat":
 * a sharp flash that decays over ~0.6s, independent of the ongoing
 * degrading/starting color blend.
 */
export type FlashType = "fail" | "recover";
let flashNode = -1;
let flashType: FlashType | null = null;
let flashT = 0;
const FLASH_DECAY = 0.6;

export function getFlash(nodeIndex: number): { type: FlashType; intensity: number } | null {
  if (flashNode !== nodeIndex || !flashType) return null;
  const intensity = 1 - flashT / FLASH_DECAY;
  if (intensity <= 0) return null;
  return { type: flashType, intensity };
}

/** Reduced-motion users get a stable, healthy cluster. */
export const isMotionEnabled = () => enabled;

export const setSimulationEnabled = (on: boolean) => {
  enabled = on;
  if (!on && victim >= 0) {
    const n = nodes[victim];
    n.health = "healthy";
    n.presence = 1;
    n.pods.forEach((p) => (p.ready = true));
    phase = "idle";
    victim = -1;
  }
};

const DEGRADE = 1.6;
const FAILED = 2.2;
const STARTING = 1.8;

export function stepCluster(delta: number) {
  const d = Math.min(delta, 0.1);

  // Reduced motion: hold the cluster completely still rather than merely
  // skipping the failure cycle - a steadily pulsing, rotating scene is still
  // continuous motion.
  if (!enabled) {
    for (const n of nodes) n.load = 0.55;
    return;
  }

  elapsed += d;
  flashT += d;

  for (const n of nodes) {
    n.loadPhase += d * 0.7;
    const wave = (Math.sin(n.loadPhase) + 1) / 2;
    const target =
      n.health === "healthy" ? 0.3 + wave * 0.55 : n.health === "degrading" ? 0.9 : 0;
    n.load += (target - n.load) * Math.min(1, d * 2.5);
  }

  if (phase === "idle") {
    if (elapsed >= nextEventAt) {
      const candidates = nodes
        .map((n, i) => ({ n, i }))
        .filter((c) => c.n.health === "healthy");
      if (candidates.length > 2) {
        const pick =
          candidates[Math.floor(Math.random() * candidates.length)];
        victim = pick.i;
        nodes[victim].health = "degrading";
        phase = "degrading";
        phaseT = 0;
      }
      // Re-arm regardless, so a skipped event does not busy-loop. Tighter
      // than the original 7-11s window - the scene reads as noticeably more
      // alive with events roughly every 6-9s instead of long idle stretches.
      nextEventAt = elapsed + 6 + Math.random() * 3;
    }
    return;
  }

  phaseT += d;
  const n = nodes[victim];
  if (!n) {
    phase = "idle";
    return;
  }

  if (phase === "degrading") {
    if (phaseT >= DEGRADE) {
      n.health = "failed";
      n.pods.forEach((p) => (p.ready = false));
      phase = "failed";
      phaseT = 0;
      flashNode = victim;
      flashType = "fail";
      flashT = 0;
    }
  } else if (phase === "failed") {
    n.presence = Math.max(0, 1 - phaseT / (FAILED * 0.7));
    if (phaseT >= FAILED) {
      // Replacement joins in the same slot: reads as a fresh node without
      // reflowing the whole layout.
      const i = victim;
      const fresh = makeNode(i);
      fresh.health = "starting";
      fresh.presence = 0;
      fresh.position = nodes[i].position;
      nodes[i] = fresh;
      phase = "starting";
      phaseT = 0;
    }
  } else if (phase === "starting") {
    n.presence = Math.min(1, phaseT / (STARTING * 0.8));
    if (phaseT >= STARTING) {
      n.health = "healthy";
      n.presence = 1;
      flashNode = victim;
      flashType = "recover";
      flashT = 0;
      phase = "idle";
      victim = -1;
      nextEventAt = elapsed + 6 + Math.random() * 3;
    }
  }
}

/* ------------------------------------------------------------------ reads */

export const getNodes = (): ClusterNode[] => nodes;
export const getNodeCount = () => NODE_COUNT;

/** Snapshot for the terminal - plain data, safe to format. */
export function snapshot() {
  return nodes.map((n, i) => ({
    index: i,
    name: n.name,
    health: n.health,
    load: n.load,
    pods: n.pods.map((p, pi) => ({
      name: p.id,
      app: p.app,
      ready: p.ready,
      restarts: p.restarts,
      version: podTargetVersion(i, pi),
    })),
  }));
}
