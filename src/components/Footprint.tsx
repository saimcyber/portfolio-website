import { useEffect, useState } from "react";
import "./styles/Footprint.css";
import {
  FullReport,
  PreciseLocation,
  getFullReport,
  requestPreciseLocation,
} from "./utils/footprint";

/**
 * The full card grid renders immediately with "…" placeholders rather than
 * swapping in from a short "gathering signals…" state once data resolves —
 * avoids a layout jump/flash once getFullReport() completes, same idea as
 * TechStack reserving its canvas height up front. (ScrollSmoother's own
 * `speed: 1.7` config compresses native scroll distance relative to content
 * movement — confirmed real scrolling reaches every section regardless of
 * this section's height at any given moment, so this is purely a visual
 * smoothness choice, not something load-bearing for scroll to work.)
 */
function emptyReport(): FullReport {
  return {
    network: {
      ip: null, city: null, region: null, country: null, postal: null,
      isp: null, asn: null, ipTimezone: null, error: null,
    },
    browser: {
      browser: "", browserVersion: "", os: "", deviceType: "desktop",
      languages: [], doNotTrack: "unspecified", globalPrivacyControl: "unsupported",
      cookiesEnabled: false, referrer: "",
    },
    hardware: {
      cpuCores: null, deviceMemoryGB: null, screenWidth: 0, screenHeight: 0,
      availWidth: 0, availHeight: 0, colorDepth: 0, pixelRatio: 0,
      touchSupport: false, maxTouchPoints: 0, connectionType: null,
      effectiveBandwidth: null, roundTripTimeMs: null,
    },
    preferences: {
      colorScheme: "no-preference", reducedMotion: false, highContrast: false,
      browserTimezone: "", utcOffsetMinutes: 0,
    },
    fingerprint: {
      canvasHash: null, webglVendor: null, webglRenderer: null,
      audioHash: null, combinedHash: null,
    },
    webrtc: { supported: false, localCandidate: null, mdnsObfuscated: false },
  };
}

function Row({
  label,
  value,
  loading,
}: {
  label: string;
  value: React.ReactNode;
  loading: boolean;
}) {
  return (
    <div className="fp-row">
      <span className="fp-label">{label}</span>
      <span className="fp-value">
        {loading ? "…" : value ?? "not exposed by this browser"}
      </span>
    </div>
  );
}

function yesNo(v: boolean) {
  return v ? "yes" : "no";
}

const Footprint = () => {
  const [report, setReport] = useState<FullReport | null>(null);
  const loading = !report;
  const r = report ?? emptyReport();

  const [gpsState, setGpsState] = useState<
    | { status: "idle" }
    | { status: "loading" }
    | { status: "done"; data: PreciseLocation }
    | { status: "error"; message: string }
  >({ status: "idle" });

  useEffect(() => {
    let cancelled = false;
    getFullReport().then((rep) => {
      if (!cancelled) setReport(rep);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleGpsClick = async () => {
    setGpsState({ status: "loading" });
    try {
      const data = await requestPreciseLocation();
      setGpsState({ status: "done", data });
    } catch (err) {
      setGpsState({
        status: "error",
        message: err instanceof Error ? err.message : "Location request failed",
      });
    }
  };

  const tzMismatch =
    !loading &&
    r.network.ipTimezone &&
    r.preferences.browserTimezone &&
    r.network.ipTimezone !== r.preferences.browserTimezone;

  return (
    <div className="footprint-section section-container" id="footprint">
      <div className="fp-intro">
        <h3 className="fp-eyebrow">Digital Footprint</h3>
        <h2 className="fp-title">
          Here's what I can already see <span>about you.</span>
        </h2>
      </div>

      <div className="fp-grid">
        <div className="fp-card">
          <h4>Network</h4>
          <Row label="Public IP" value={r.network.ip} loading={loading} />
          <Row label="City" value={r.network.city} loading={loading} />
          <Row label="Region" value={r.network.region} loading={loading} />
          <Row label="Country" value={r.network.country} loading={loading} />
          <Row label="Postal code" value={r.network.postal} loading={loading} />
          <Row label="ISP / org" value={r.network.isp} loading={loading} />
          <Row label="ASN" value={r.network.asn} loading={loading} />
          {!loading && r.network.error && (
            <p className="fp-note fp-warn">{r.network.error}</p>
          )}
        </div>

        <div className="fp-card">
          <h4>Browser &amp; device</h4>
          <Row
            label="Browser"
            value={loading ? null : `${r.browser.browser} ${r.browser.browserVersion}`}
            loading={loading}
          />
          <Row label="OS" value={r.browser.os || null} loading={loading} />
          <Row label="Device type" value={r.browser.deviceType} loading={loading} />
          <Row
            label="Languages"
            value={r.browser.languages.length ? r.browser.languages.join(", ") : null}
            loading={loading}
          />
          <Row label="Referrer" value={r.browser.referrer || null} loading={loading} />
          <Row
            label="Do Not Track"
            value={
              r.browser.doNotTrack === "unspecified"
                ? "not set"
                : yesNo(r.browser.doNotTrack)
            }
            loading={loading}
          />
          <Row
            label="Global Privacy Control"
            value={
              r.browser.globalPrivacyControl === "unsupported"
                ? "unsupported"
                : yesNo(r.browser.globalPrivacyControl)
            }
            loading={loading}
          />
          <Row label="Cookies enabled" value={yesNo(r.browser.cookiesEnabled)} loading={loading} />
        </div>

        <div className="fp-card">
          <h4>Hardware</h4>
          <Row label="CPU cores" value={r.hardware.cpuCores} loading={loading} />
          <Row
            label="Device memory"
            value={r.hardware.deviceMemoryGB ? `~${r.hardware.deviceMemoryGB} GB` : null}
            loading={loading}
          />
          <Row
            label="Screen"
            value={
              loading
                ? null
                : `${r.hardware.screenWidth}×${r.hardware.screenHeight} @ ${r.hardware.pixelRatio}x`
            }
            loading={loading}
          />
          <Row
            label="Color depth"
            value={r.hardware.colorDepth ? `${r.hardware.colorDepth}-bit` : null}
            loading={loading}
          />
          <Row
            label="Touch support"
            value={
              loading
                ? null
                : r.hardware.touchSupport
                ? `yes (${r.hardware.maxTouchPoints} points)`
                : "no"
            }
            loading={loading}
          />
          <Row label="Connection" value={r.hardware.connectionType} loading={loading} />
          <Row label="Bandwidth" value={r.hardware.effectiveBandwidth} loading={loading} />
        </div>

        <div className="fp-card">
          <h4>Preferences</h4>
          <Row label="Color scheme" value={r.preferences.colorScheme} loading={loading} />
          <Row
            label="Reduced motion"
            value={yesNo(r.preferences.reducedMotion)}
            loading={loading}
          />
          <Row
            label="Browser timezone"
            value={
              <>
                {r.preferences.browserTimezone}
                {tzMismatch && (
                  <span className="fp-flag">
                    {" "}
                    ≠ IP timezone ({r.network.ipTimezone}) — possible VPN
                  </span>
                )}
              </>
            }
            loading={loading}
          />
          <Row
            label="UTC offset"
            value={
              loading
                ? null
                : `UTC${r.preferences.utcOffsetMinutes >= 0 ? "+" : ""}${
                    r.preferences.utcOffsetMinutes / 60
                  }`
            }
            loading={loading}
          />
        </div>

        <div className="fp-card fp-card-wide">
          <h4>Fingerprint</h4>
          <Row label="GPU" value={r.fingerprint.webglRenderer} loading={loading} />
          <Row label="Canvas hash" value={r.fingerprint.canvasHash} loading={loading} />
          <Row label="Audio hash" value={r.fingerprint.audioHash} loading={loading} />
          <Row
            label="Combined fingerprint"
            value={<span className="fp-hash">{r.fingerprint.combinedHash}</span>}
            loading={loading}
          />
        </div>

        <div className="fp-card fp-card-wide">
          <h4>WebRTC posture check</h4>
          {loading ? (
            <p className="fp-note">…</p>
          ) : r.webrtc.supported ? (
            r.webrtc.mdnsObfuscated ? (
              <p className="fp-note fp-good">
                ✓ Masked — <span className="fp-hash">{r.webrtc.localCandidate}</span>
              </p>
            ) : (
              <p className="fp-note fp-warn">
                Exposed — <span className="fp-hash">{r.webrtc.localCandidate}</span>
              </p>
            )
          ) : (
            <p className="fp-note">unsupported</p>
          )}
        </div>
      </div>

      <div className="fp-divider" />

      <div className="fp-gps">
        <button className="fp-gps-btn" onClick={handleGpsClick} data-cursor="disable">
          {gpsState.status === "loading" ? "Requesting…" : "Show my precise location"}
        </button>
        {gpsState.status === "done" && (
          <p className="fp-note fp-good">
            {gpsState.data.latitude.toFixed(4)}, {gpsState.data.longitude.toFixed(4)} (±
            {gpsState.data.accuracyMeters}m)
          </p>
        )}
        {gpsState.status === "error" && (
          <p className="fp-note fp-warn">{gpsState.message}</p>
        )}
      </div>
    </div>
  );
};

export default Footprint;
