import { PropsWithChildren, useEffect, useState } from "react";
import About from "./About";
import Career from "./Career";
import Contact from "./Contact";
import Cursor from "./Cursor";
import Footprint from "./Footprint";
import Landing from "./Landing";
import Navbar from "./Navbar";
import SocialIcons from "./SocialIcons";
import Terminal from "./Terminal";
import WhatIDo from "./WhatIDo";
import TechStack from "./TechStack";
import Work from "./Work";
import setSplitText from "./utils/splitText";

const MainContainer = ({ children }: PropsWithChildren) => {
  const [isDesktopView, setIsDesktopView] = useState<boolean>(
    window.innerWidth > 1024
  );
  useEffect(() => {
    const resizeHandler = () => {
      setSplitText();
      setIsDesktopView(window.innerWidth > 1024);
    };
    resizeHandler();
    window.addEventListener("resize", resizeHandler);
    return () => {
      window.removeEventListener("resize", resizeHandler);
    };
  }, [isDesktopView]);

  return (
    <div className="container-main">
      <Cursor />
      <Navbar />
      <SocialIcons />
      <Terminal />
      {isDesktopView && children}
      <div id="smooth-wrapper">
        <div id="smooth-content">
          <div className="container-main">
            {/* Landing -> About has no divider: that transition is already a
                crafted GSAP sequence (rig rotates away, gradient mask on
                .character-model, sliding text) - a static line there would
                compete with a designed transition rather than support one. */}
            <Landing>{!isDesktopView && children}</Landing>
            <About />
            <div className="section-divider" />
            <WhatIDo />
            <div className="section-divider" />
            <Career />
            <div className="section-divider" />
            <Work />
            <div className="section-divider" />
            <Footprint />
            <div className="section-divider" />
            {/* Rendered unconditionally, on every viewport. It used to be
                desktop-only and lazily mounted behind a scroll threshold,
                because it was a 2.2MB Rapier physics canvas. Now that it is
                plain markup there is nothing to defer - and gating it left
                phones with two adjacent `.section-divider` hairlines and
                nothing between them. */}
            <TechStack />
            <div className="section-divider" />
            <Contact />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainContainer;
