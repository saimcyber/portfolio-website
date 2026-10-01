import { PropsWithChildren, useEffect, useState } from "react";
import { debounce } from "./utils/debounce";
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
import Motion from "./Motion";
import "./styles/Experience.css";

const isCoarsePointer =
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(pointer: coarse)").matches;

const MainContainer = ({ children, sceneEnabled, onEnableScene }: PropsWithChildren<{
  sceneEnabled: boolean;
  onEnableScene: () => void;
}>) => {
  const [isDesktopView, setIsDesktopView] = useState<boolean>(
    false
  );
  useEffect(() => {
    const resizeHandler = () => {
      setIsDesktopView(window.innerWidth > 1024);
    };
    // Only update the scene/cursor breakpoint after a resize settles.
    resizeHandler();
    const onResize = debounce(resizeHandler, 150);
    window.addEventListener("resize", onResize);
    return () => {
      onResize.cancel();
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div className="container-main">
      {/* The custom cursor is invisible on touch devices (--size: 0) but its
          effect still ran a permanent rAF loop + document mousemove listener.
          Skip it entirely where there's no fine pointer. */}
      {isDesktopView && !isCoarsePointer && <Cursor />}
      <Motion />
      <a className="skip-link" href="#about">Skip to content</a>
      <Navbar />
      <SocialIcons />
      <Terminal />
      <div id="smooth-wrapper">
        <div id="smooth-content">
          <div className="container-main">
            <Landing sceneEnabled={sceneEnabled && isDesktopView} onEnableScene={onEnableScene}>{isDesktopView && children}</Landing>
            <About />
            <div className="section-divider" />
            <WhatIDo />
            <div className="section-divider" />
            <Career />
            <div className="section-divider" />
            <Work />
            <div className="section-divider" />
            <TechStack />
            <div className="section-divider" />
            <Footprint />
            <div className="section-divider" />
            <Contact />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainContainer;
