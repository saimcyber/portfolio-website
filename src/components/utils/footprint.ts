/**
 * "Your Digital Footprint" — data module.
 *
 * Everything here runs entirely in the visitor's own browser. Nothing is
 * persisted (no localStorage, no cookies) and nothing is transmitted
 * anywhere except one call to resolve the visitor's public IP into a
 * city/ISP — that lookup is unavoidable (a browser cannot resolve its own
 * public-facing IP to a location without asking someone), and it receives
 * nothing but the IP address the request naturally carries. ipapi.co is
 * primary, with an automatic fallback to ipwho.is if it's unreachable or
 * rate-limited — no third-party service is guaranteed to answer, and that
 * shouldn't be a reason to show the visitor an error.
 *
 * Shared by both consumers, same pattern as Cluster/clusterStore.ts being
 * read by both the 3D scene and the terminal's `kubectl` commands:
 *   - src/components/Footprint.tsx   (the visible section)
 *   - src/components/Terminal.tsx    (the `recon` command)
 *
 * Every hardware/network field that isn't universally supported is
 * individually feature-detected and typed as optional. A missing field
 * renders as "not exposed by this browser" — never as a thrown error.
 */

/* ------------------------------------------------------------- network */

export interface NetworkInfo {
  ip: string | null;
  city: string | null;
  region: string | null;
  country: string | null;
  postal: string | null;
  isp: string | null;
  asn: string | null;
  ipTimezone: string | null;
  error: string | null;
}

async function fetchJson(url: string, timeoutMs = 6000): Promise<Record<string, unknown>> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`${url} responded ${res.status}`);
    return await res.json();
  } catch (err) {
    // An abort surfaces as the browser's own "signal is aborted without
    // reason", which was reaching the page verbatim as
    // "location lookup unavailable (signal is aborted without reason)".
    // Say what actually happened instead.
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error(`timed out after ${timeoutMs / 1000}s`);
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * ipapi.co is primary, per the decided provider. It's occasionally fronted
 * by a Cloudflare bot-check that 403s automated/datacenter traffic (observed
 * in testing) — a third-party service is never guaranteed to answer, which is
 * exactly why this falls back rather than surfacing an error for something
 * out of the visitor's control. ipwho.is is the fallback: no key, CORS-open,
 * same no-persistence guarantee.
 */
export async function getNetworkInfo(): Promise<NetworkInfo> {
  try {
    const d = await fetchJson("https://ipapi.co/json/");
    if (d.error) throw new Error((d.reason as string) || "ipapi.co returned an error");
    return {
      ip: (d.ip as string) ?? null,
      city: (d.city as string) ?? null,
      region: (d.region as string) ?? null,
      country: (d.country_name as string) ?? null,
      postal: (d.postal as string) ?? null,
      isp: (d.org as string) ?? null,
      asn: (d.asn as string) ?? null,
      ipTimezone: (d.timezone as string) ?? null,
      error: null,
    };
  } catch {
    try {
      const d = await fetchJson("https://ipwho.is/");
      if (d.success === false) throw new Error((d.message as string) || "ipwho.is returned an error");
      const connection = (d.connection ?? {}) as Record<string, unknown>;
      const timezone = (d.timezone ?? {}) as Record<string, unknown>;
      return {
        ip: (d.ip as string) ?? null,
        city: (d.city as string) ?? null,
        region: (d.region as string) ?? null,
        country: (d.country as string) ?? null,
        postal: (d.postal as string) ?? null,
        isp: (connection.isp as string) ?? (connection.org as string) ?? null,
        asn: connection.asn != null ? String(connection.asn) : null,
        ipTimezone: (timezone.id as string) ?? null,
        error: null,
      };
    } catch (err) {
      return {
        ip: null,
        city: null,
        region: null,
        country: null,
        postal: null,
        isp: null,
        asn: null,
        ipTimezone: null,
        error:
          err instanceof Error
            ? `location lookup unavailable (${err.message})`
            : "location lookup unavailable",
      };
    }
  }
}

/* --------------------------------------------------------------- browser */

export interface BrowserInfo {
  browser: string;
  browserVersion: string;
  os: string;
  deviceType: "mobile" | "tablet" | "desktop";
  languages: string[];
  doNotTrack: boolean | "unspecified";
  globalPrivacyControl: boolean | "unsupported";
  cookiesEnabled: boolean;
  referrer: string;
}

function parseUserAgent(ua: string) {
  let browser = "Unknown";
  let browserVersion = "";
  if (/Edg\//.test(ua)) {
    browser = "Edge";
    browserVersion = ua.match(/Edg\/([\d.]+)/)?.[1] ?? "";
  } else if (/OPR\//.test(ua)) {
    browser = "Opera";
    browserVersion = ua.match(/OPR\/([\d.]+)/)?.[1] ?? "";
  } else if (/Chrome\//.test(ua) && !/Chromium/.test(ua)) {
    browser = "Chrome";
    browserVersion = ua.match(/Chrome\/([\d.]+)/)?.[1] ?? "";
  } else if (/Firefox\//.test(ua)) {
    browser = "Firefox";
    browserVersion = ua.match(/Firefox\/([\d.]+)/)?.[1] ?? "";
  } else if (/Safari\//.test(ua) && /Version\//.test(ua)) {
    browser = "Safari";
    browserVersion = ua.match(/Version\/([\d.]+)/)?.[1] ?? "";
  }

  let os = "Unknown";
  if (/Windows NT/.test(ua)) os = "Windows";
  else if (/Mac OS X/.test(ua) && !/iPhone|iPad/.test(ua)) os = "macOS";
  else if (/Android/.test(ua)) os = "Android";
  else if (/iPhone|iPad|iPod/.test(ua)) os = "iOS";
  else if (/Linux/.test(ua)) os = "Linux";

  const deviceType: BrowserInfo["deviceType"] = /iPad|Tablet/.test(ua)
    ? "tablet"
    : /Mobi|Android(?!.*Tablet)|iPhone/.test(ua)
    ? "mobile"
    : "desktop";

  return { browser, browserVersion, os, deviceType };
}

export function getBrowserInfo(): BrowserInfo {
  const ua = navigator.userAgent;
  const { browser, browserVersion, os, deviceType } = parseUserAgent(ua);
  return {
    browser,
    browserVersion,
    os,
    deviceType,
    languages: [...(navigator.languages ?? [navigator.language])],
    doNotTrack:
      navigator.doNotTrack === "1"
        ? true
        : navigator.doNotTrack === "0"
        ? false
        : "unspecified",
    globalPrivacyControl:
      "globalPrivacyControl" in navigator
        ? Boolean((navigator as unknown as { globalPrivacyControl: boolean }).globalPrivacyControl)
        : "unsupported",
    cookiesEnabled: navigator.cookieEnabled,
    referrer: document.referrer || "(direct visit, no referrer)",
  };
}

/* -------------------------------------------------------------- hardware */

export interface HardwareInfo {
  cpuCores: number | null;
  deviceMemoryGB: number | null;
  screenWidth: number;
  screenHeight: number;
  availWidth: number;
  availHeight: number;
  colorDepth: number;
  pixelRatio: number;
  touchSupport: boolean;
  maxTouchPoints: number;
  connectionType: string | null;
  effectiveBandwidth: string | null;
  roundTripTimeMs: number | null;
}

export function getHardwareInfo(): HardwareInfo {
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: {
      type?: string;
      effectiveType?: string;
      downlink?: number;
      rtt?: number;
    };
  };
  const conn = nav.connection;
  return {
    cpuCores: nav.hardwareConcurrency ?? null,
    deviceMemoryGB: nav.deviceMemory ?? null, // Chromium-only by design
    screenWidth: screen.width,
    screenHeight: screen.height,
    availWidth: screen.availWidth,
    availHeight: screen.availHeight,
    colorDepth: screen.colorDepth,
    pixelRatio: window.devicePixelRatio,
    touchSupport: "ontouchstart" in window || navigator.maxTouchPoints > 0,
    maxTouchPoints: navigator.maxTouchPoints ?? 0,
    connectionType: conn?.effectiveType ?? null, // Chromium-only, experimental
    effectiveBandwidth: conn?.downlink ? `${conn.downlink} Mbps` : null,
    roundTripTimeMs: conn?.rtt ?? null,
  };
}

/* ----------------------------------------------------------- preferences */

export interface Preferences {
  colorScheme: "dark" | "light" | "no-preference";
  reducedMotion: boolean;
  highContrast: boolean;
  browserTimezone: string;
  utcOffsetMinutes: number;
}

export function getPreferences(): Preferences {
  const mq = (q: string) => window.matchMedia(q).matches;
  return {
    colorScheme: mq("(prefers-color-scheme: dark)")
      ? "dark"
      : mq("(prefers-color-scheme: light)")
      ? "light"
      : "no-preference",
    reducedMotion: mq("(prefers-reduced-motion: reduce)"),
    highContrast: mq("(prefers-contrast: more)"),
    browserTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    utcOffsetMinutes: -new Date().getTimezoneOffset(),
  };
}

/* ----------------------------------------------------------- fingerprint */

export interface FingerprintInfo {
  canvasHash: string | null;
  webglVendor: string | null;
  webglRenderer: string | null;
  audioHash: string | null;
  combinedHash: string | null;
}

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function canvasSample(): string | null {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 240;
    canvas.height = 60;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.textBaseline = "top";
    ctx.font = "16px 'Arial'";
    ctx.fillStyle = "#c2a4ff";
    ctx.fillRect(0, 0, 240, 60);
    ctx.fillStyle = "#0b080c";
    ctx.fillText("Saim Zaib — recon 🔒", 4, 4);
    ctx.strokeStyle = "#7d5bbe";
    ctx.beginPath();
    ctx.arc(200, 30, 18, 0, Math.PI * 1.4);
    ctx.stroke();
    return canvas.toDataURL();
  } catch {
    return null;
  }
}

function webglInfo(): { vendor: string | null; renderer: string | null } {
  try {
    const canvas = document.createElement("canvas");
    const gl = (canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    if (!gl) return { vendor: null, renderer: null };
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    if (!ext) {
      // Extension disabled/unavailable — fall back to the generic (masked) strings.
      return {
        vendor: gl.getParameter(gl.VENDOR) ?? null,
        renderer: gl.getParameter(gl.RENDERER) ?? null,
      };
    }
    return {
      vendor: gl.getParameter(ext.UNMASKED_VENDOR_WEBGL) ?? null,
      renderer: gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) ?? null,
    };
  } catch {
    return { vendor: null, renderer: null };
  }
}

/** Renders a short waveform through an offline audio context and samples the
 *  output — hardware-level DSP quirks make this reproducibly different across
 *  devices, the same technique amiunique.org and browserleaks.com use. */
async function audioSample(): Promise<string | null> {
  try {
    const Ctx =
      window.OfflineAudioContext ||
      (window as unknown as { webkitOfflineAudioContext?: typeof OfflineAudioContext })
        .webkitOfflineAudioContext;
    if (!Ctx) return null;
    const ctx = new Ctx(1, 5000, 44100);
    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.value = 1000;
    const compressor = ctx.createDynamicsCompressor();
    osc.connect(compressor);
    compressor.connect(ctx.destination);
    osc.start(0);
    const buffer = await ctx.startRendering();
    const data = buffer.getChannelData(0);
    let sum = 0;
    for (let i = 4500; i < data.length; i++) sum += Math.abs(data[i]);
    return sum.toString();
  } catch {
    return null;
  }
}

export async function getFingerprint(): Promise<FingerprintInfo> {
  const canvasData = canvasSample();
  const { vendor, renderer } = webglInfo();
  const audioData = await audioSample();

  const [canvasHash, audioHash] = await Promise.all([
    canvasData ? sha256Hex(canvasData) : Promise.resolve(null),
    audioData ? sha256Hex(audioData) : Promise.resolve(null),
  ]);

  const combined = [
    canvasHash,
    renderer,
    audioHash,
    navigator.userAgent,
    screen.width + "x" + screen.height,
  ]
    .filter(Boolean)
    .join("|");
  const combinedHash = combined ? await sha256Hex(combined) : null;

  return {
    canvasHash: canvasHash ? canvasHash.slice(0, 16) : null,
    webglVendor: vendor,
    webglRenderer: renderer,
    audioHash: audioHash ? audioHash.slice(0, 16) : null,
    combinedHash: combinedHash ? combinedHash.slice(0, 24) : null,
  };
}

/* ------------------------------------------------------------------ webrtc */

export interface WebRTCCheck {
  supported: boolean;
  localCandidate: string | null;
  mdnsObfuscated: boolean;
}

/**
 * Creating an RTCPeerConnection and gathering ICE candidates does NOT trigger
 * a permission prompt — only requesting camera/mic access does. Every modern
 * browser (Chrome, Firefox, Edge, Safari, Brave) has shipped mDNS obfuscation
 * since ~2019-2020, so the candidate this surfaces is a random `.local`
 * hostname, not a real LAN IP. Shown as a posture check, not an exploit.
 */
export function getWebRTCCheck(): Promise<WebRTCCheck> {
  return new Promise((resolve) => {
    const RTCPeerConnectionCtor =
      window.RTCPeerConnection ||
      (window as unknown as { webkitRTCPeerConnection?: typeof RTCPeerConnection })
        .webkitRTCPeerConnection;
    if (!RTCPeerConnectionCtor) {
      resolve({ supported: false, localCandidate: null, mdnsObfuscated: false });
      return;
    }
    try {
      const pc = new RTCPeerConnectionCtor({ iceServers: [] });
      let resolved = false;
      const finish = (candidate: string | null) => {
        if (resolved) return;
        resolved = true;
        pc.close();
        resolve({
          supported: true,
          localCandidate: candidate,
          mdnsObfuscated: !!candidate && /\.local$/.test(candidate),
        });
      };
      pc.onicecandidate = (e) => {
        const cand = e.candidate?.candidate;
        if (!cand) {
          finish(null);
          return;
        }
        const match = cand.match(/(\d{1,3}(?:\.\d{1,3}){3}|[a-f0-9-]+\.local)/i);
        finish(match ? match[1] : null);
      };
      pc.createDataChannel("recon");
      pc
        .createOffer()
        .then((offer) => pc.setLocalDescription(offer))
        .catch(() => finish(null));
      setTimeout(() => finish(null), 2500);
    } catch {
      resolve({ supported: false, localCandidate: null, mdnsObfuscated: false });
    }
  });
}

/* ------------------------------------------------------------ opt-in GPS */

export interface PreciseLocation {
  latitude: number;
  longitude: number;
  accuracyMeters: number;
}

/** Only called on explicit visitor click — this is the one call in the whole
 *  module that triggers a real OS/browser permission prompt. */
export function requestPreciseLocation(): Promise<PreciseLocation> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracyMeters: Math.round(pos.coords.accuracy),
        }),
      (err) => reject(new Error(err.message || "Location request denied")),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  });
}

/* -------------------------------------------------------------- aggregate */

export interface FullReport {
  network: NetworkInfo;
  browser: BrowserInfo;
  hardware: HardwareInfo;
  preferences: Preferences;
  fingerprint: FingerprintInfo;
  webrtc: WebRTCCheck;
}

/**
 * Cached across callers.
 *
 * Both the Footprint section and the terminal's `recon` command ask for this,
 * and each call re-ran the whole battery: an IP lookup over the network, a
 * canvas raster, a WebGL context, a 5000-sample OfflineAudioContext render and
 * an ICE gathering round. Running that twice cost a second network round trip
 * and duplicated work for an identical answer, so the promise is memoised. A
 * failed run is not cached, so a visitor who opens `recon` after a network
 * blip gets a fresh attempt.
 */
let reportPromise: Promise<FullReport> | null = null;

export function getFullReport(): Promise<FullReport> {
  if (!reportPromise) {
    reportPromise = buildFullReport().catch((err) => {
      reportPromise = null;
      throw err;
    });
  }
  return reportPromise;
}

async function buildFullReport(): Promise<FullReport> {
  const [network, fingerprint, webrtc] = await Promise.all([
    getNetworkInfo(),
    getFingerprint(),
    getWebRTCCheck(),
  ]);
  return {
    network,
    browser: getBrowserInfo(),
    hardware: getHardwareInfo(),
    preferences: getPreferences(),
    fingerprint,
    webrtc,
  };
}
