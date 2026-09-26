import { PropsWithChildren } from "react";
import { personal } from "../data/content";
import ScrollCue from "./ScrollCue";
import "./styles/Landing.css";

const Landing = ({ children, sceneEnabled, onEnableScene }: PropsWithChildren<{
  sceneEnabled: boolean;
  onEnableScene: () => void;
}>) => {
  return (
    <>
      <div className="landing-section" id="landingDiv">
        <div className="landing-container">
          <div className="landing-intro">
            <p className="landing-greeting">Hello! I'm</p>
            <h1>
              {personal.firstName}
              <br />{" "}
              <span>{personal.lastName}</span>
            </h1>
            <p className="landing-role">DevOps &amp; Cloud Engineer</p>
          </div>
          <div className="landing-info">
            <p className="landing-prefix">I</p>
            {/* Decorative typography uses body text so the page outline stays meaningful. */}
            <div className="landing-info-h2 landing-line" aria-label="Automate and secure">
              <div className="landing-h2-1">Automate</div>
              <div className="landing-h2-2" aria-hidden="true">Secure</div>
            </div>
            <div className="landing-line">
              <div className="landing-h2-info">At Scale</div>
              <div className="landing-h2-info-1" aria-hidden="true">At Scale</div>
            </div>
          </div>
        </div>
        {!sceneEnabled && <div className="hero-preview">
          <img src="/images/cloud-cluster.svg" width="400" height="400" alt="Connected cloud infrastructure nodes surrounding a central container" />
          <button className="scene-toggle" type="button" onClick={onEnableScene}>Explore 3D scene</button>
        </div>}
        <ScrollCue />
        {children}
      </div>
    </>
  );
};

export default Landing;
