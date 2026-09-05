import { lazy, PropsWithChildren, Suspense, useEffect, useState } from "react";
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
import Work from "./Work";
import setSplitText from "./utils/splitText";

const TechStack = lazy(() => import("./TechStack"));

const MainContainer = ({ children }: PropsWithChildren) => {
  const [isDesktopView, setIsDesktopView] = useState<boolean>(
    window.innerWidth > 1024
  );
  /**
   * The tech-stack canvas is a 2.2MB chunk (Rapier physics + its WASM). Mounted
   * eagerly it parses and initialises during the initial load, which was
   * stalling the main thread for most of a second and making the loader and
   * intro stutter. It lives far down the page, so defer it until the visitor
   * scrolls toward it.
   */
  const [showTechStack, setShowTechStack] = useState(false);

  useEffect(() => {
    if (!isDesktopView || showTechStack) return;
    const onScroll = () => {
      if (window.scrollY > window.innerHeight) setShowTechStack(true);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [isDesktopView, showTechStack]);

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
            {/* The placeholder carries the same `.techstack` class so it
                reserves identical height. The old `<div>Loading....</div>`
                fallback reserved none, so the page grew by a full viewport
                when the chunk resolved and every ScrollTrigger measured
                before that point was left pointing at the wrong offset. */}
            {isDesktopView &&
              (showTechStack ? (
                <Suspense fallback={<div className="techstack"></div>}>
                  <TechStack />
                </Suspense>
              ) : (
                <div className="techstack"></div>
              ))}
            <div className="section-divider" />
            <Contact />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainContainer;
