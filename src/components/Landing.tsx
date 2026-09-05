import { PropsWithChildren } from "react";
import { personal } from "../data/content";
import ScrollCue from "./ScrollCue";
import "./styles/Landing.css";

const Landing = ({ children }: PropsWithChildren) => {
  return (
    <>
      <div className="landing-section" id="landingDiv">
        <div className="landing-container">
          <div className="landing-intro">
            <h2>Hello! I'm</h2>
            <h1>
              {personal.firstName}
              <br />
              <span>{personal.lastName}</span>
            </h1>
          </div>
          <div className="landing-info">
            <h3>I</h3>
            {/* Line 1 swaps between the two verbs on a loop (see LoopText in
                utils/initialFX.ts) while line 2 holds, so the stack reads
                "I automate at scale" then "I secure at scale". The verbs
                mirror the AUTOMATE / SECURE cards further down the page. */}
            <h2 className="landing-info-h2">
              <div className="landing-h2-1">Automate</div>
              <div className="landing-h2-2">Secure</div>
            </h2>
            <h2>
              <div className="landing-h2-info">At Scale</div>
              <div className="landing-h2-info-1">At Scale</div>
            </h2>
          </div>
        </div>
        <ScrollCue />
        {children}
      </div>
    </>
  );
};

export default Landing;
