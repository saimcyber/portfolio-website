import { PropsWithChildren, useEffect, useRef } from "react";
import { MdArrowOutward } from "react-icons/md";
import { personal } from "../data/content";
import ScrollCue from "./ScrollCue";
import "./styles/Landing.css";

const Landing = ({ children, sceneEnabled, onEnableScene }: PropsWithChildren<{ sceneEnabled: boolean; onEnableScene: () => void }>) => {
  const hero = useRef<HTMLElement>(null);
  useEffect(() => {
    const element = hero.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      element.classList.toggle("hero-sleeping", !entry.isIntersecting);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return (
    <section className={`landing-section${sceneEnabled ? " scene-ready" : ""}`} id="landingDiv" ref={hero} aria-label="Introduction">
      <div className="hero-grid" aria-hidden="true" />
      <div className="landing-container section-container">
        <div className="landing-intro">
          <p className="landing-greeting" data-intro><span /> DevOps &amp; Cloud Engineer</p>
          <h1 data-intro>{personal.firstName}<br />{" "}<span>{personal.lastName}</span><span className="hero-period">.</span></h1>
          <p className="hero-statement" data-intro>I <span className="hero-word-window" aria-label="automate and secure"><span aria-hidden="true">automate.<br />secure.<br />automate.</span></span><br />{" "}You build at scale.</p>
          <p className="hero-description" data-intro>Infrastructure in code. Security in the pipeline.<br />{" "}From the first commit to production.</p>
          <div className="hero-actions" data-intro><a className="hero-primary" href="#work">Explore my work <MdArrowOutward aria-hidden="true" /></a><a className="hero-secondary" href="#contact">Let's connect <MdArrowOutward aria-hidden="true" /></a></div>
        </div>
        <div className="hero-visual">
          <div className="hero-orbit orbit-outer" aria-hidden="true" /><div className="hero-orbit orbit-inner" aria-hidden="true" />
          <div className="hero-preview" aria-hidden={sceneEnabled}><img src="/images/cloud-cluster.svg" width="400" height="400" alt="Connected cloud infrastructure nodes surrounding a central container" /></div>
          {children}
          <div className="hero-node-label label-top" aria-hidden="true"><i /> cloud / orchestrated</div>
          <div className="hero-node-label label-bottom" aria-hidden="true">commit → build → deploy <span>↗</span></div>
          <button className="scene-toggle" type="button" aria-pressed={sceneEnabled} onClick={onEnableScene}>{sceneEnabled ? "Pause 3D" : "Enable 3D"}</button>
        </div>
        <div className="hero-bottom"><span>{personal.location} <span className="hero-coordinate">/ 33.69° N, 73.04° E</span></span><ScrollCue /><span className="hero-bottom-right">Code. Cloud. Control.</span></div>
      </div>
    </section>
  );
};
export default Landing;
