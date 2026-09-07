import { useEffect, useRef, useState } from "react";
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
  fallback = "not exposed by this browser",
}: {
  label: string;
  value: React.ReactNode;
  loading: boolean;
  /** Override for rows whose blankness has a different cause - a failed IP
   *  lookup is not the browser withholding anything. */
  fallback?: string;
}) {
  return (
    <div className="fp-row">
      <span className="fp-label">{label}</span>
      <span className="fp-value">{loading ? "…" : value ?? fallback}</span>
    </div>
  );
}

function yesNo(v: boolean) {
  return v ? "yes" : "no";
}

const Footprint = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [report, setReport] = useState<FullReport | null>(null);
  const loading = !report;
  const r = report ?? emptyReport();

  const [gpsState, setGpsState] = useState<
    | { status: "idle" }
    | { status: "loading" }
    | { status: "done"; data: PreciseLocation }
    | { status: "error"; message: string }
  >({ status: "idle" });

  /**
   * Deferred until the section is within a viewport of being seen.
   *
   * This used to run on mount, i.e. during the initial page load, where it put
   * a third-party IP request plus a canvas raster, a WebGL context, an
   * OfflineAudioContext render and an ICE gathering round on the critical path
   * of a page that is already loading a WebGL hero. The section sits five
   * screens down, so none of that is needed until the visitor heads that way.
   * `rootMargin` gives it a full screen of runway so the values are in place
   * before the cards are actually read.
   */
  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    let cancelled = false;

    const start = () => {
      getFullReport().then((rep) => {
        if (!cancelled) setReport(rep);
      });
    };

    if (typeof IntersectionObserver === "undefined") {
      start();
      return () => {
        cancelled = true;
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          observer.disconnect();
          start();
        }
      },
      { rootMargin: "100% 0px" }
    );
    observer.observe(node);

    return () => {
      cancelled = true;
      observer.disconnect();
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

  const netFallback = r.network.error
    ? "lookup unavailable"
    : "not exposed by this browser";

  return (
    <div
      className="footprint-section section-container"
      id="footprint"
      ref={sectionRef}
    >
      <div className="fp-intro">
        <h3 className="fp-eyebrow">Digital Footprint</h3>
        <h2 className="fp-title">
          Here's what I can already see <span>about you.</span>
        </h2>
      </div>

      {/*
        Summary band. Restates the two facts that land hardest - where the
        visitor is coming from, and the hash that identifies their machine -
        before the detail cards break everything down. The repetition is the
        point: the cards are a table, this is the headline.

        Reads only from fields already on FullReport, so it adds no request
        and no extra fingerprinting work. The location half degrades on a
        failed lookup while the fingerprint half keeps working, because that
        half is computed locally and never depended on the third party.
      */}
      <div className="fp-band">
        <div className="fp-band-status">
          <span className="fp-band-dot" aria-hidden="true" />
          <span>{loading ? "Scanning" : "Live"}</span>
        </div>
        <div className="fp-band-split">
          <div className="fp-band-half">
            <span className="fp-band-label">Coming from</span>
            <p className="fp-band-value">
              {loading ? "\u2026" : r.network.ip ?? "lookup unavailable"}
            </p>
            <p className="fp-band-sub">
              {loading
                ? "\u2026"
                : [r.network.city, r.network.region, r.network.country]
                    .filter(Boolean)
                    .join(", ") ||
                  (r.network.error ? "location unavailable" : "location unknown")}
              {!loading && r.network.isp ? ` \u00b7 ${r.network.isp}` : ""}
            </p>
          </div>
          <div className="fp-band-half">
            <span className="fp-band-label">Your fingerprint</span>
            <p className="fp-band-value fp-band-hash">
              {loading ? "\u2026" : r.fingerprint.combinedHash ?? "unavailable"}
            </p>
            <p className="fp-band-sub">
              Derived from your GPU, canvas and audio stack — no cookies
              involved.
            </p>
          </div>
        </div>
      </div>

      <div className="fp-grid">
        {/* When the IP lookup fails every row here is blank for one reason -
            the lookup - so they say so rather than each blaming the browser
            for withholding data it never had a chance to expose. */}
        <div className="fp-card">
          <h4>Network</h4>
          <Row label="Public IP" value={r.network.ip} loading={loading} fallback={netFallback} />
          <Row label="City" value={r.network.city} loading={loading} fallback={netFallback} />
          <Row label="Region" value={r.network.region} loading={loading} fallback={netFallback} />
          <Row label="Country" value={r.network.country} loading={loading} fallback={netFallback} />
          <Row label="Postal code" value={r.network.postal} loading={loading} fallback={netFallback} />
          <Row label="ISP / org" value={r.network.isp} loading={loading} fallback={netFallback} />
          <Row label="ASN" value={r.network.asn} loading={loading} fallback={netFallback} />
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

        <div className="fp-card fp-card-mid">
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
          {/* `supported && !mdnsObfuscated` used to render "Exposed —" on its
              own whenever no candidate was gathered at all (blocked by an
              extension, no network interface, or simply timed out). A blank
              candidate is the opposite of a leak, and calling it "Exposed" on
              a security-themed page is a false alarm about the visitor's own
              setup - so the no-candidate case is now its own verdict. */}
          {loading ? (
            <p className="fp-note">…</p>
          ) : !r.webrtc.supported ? (
            <p className="fp-note">unsupported</p>
          ) : !r.webrtc.localCandidate ? (
            <p className="fp-note fp-good">
              ✓ No host candidate gathered, nothing leaked
            </p>
          ) : r.webrtc.mdnsObfuscated ? (
            <p className="fp-note fp-good">
              ✓ Masked: <span className="fp-hash">{r.webrtc.localCandidate}</span>
            </p>
          ) : (
            <p className="fp-note fp-warn">
              Exposed: <span className="fp-hash">{r.webrtc.localCandidate}</span>
            </p>
          )}
        </div>
      </div>

      {/* .fp-divider is styled as a labelled rule - two flex lines with a
          14px gap for a caption between them. It was rendered self-closing,
          so the gap sat there as a visible notch in the middle of an
          otherwise unbroken line. It has its label now. */}
      <div className="fp-divider">
        <span>with your permission</span>
      </div>

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
