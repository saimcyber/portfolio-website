import { aboutText } from "../data/content";
import "./styles/About.css";

const About = () => {
  return (
    <div className="about-section" id="about">
      <div className="about-me">
        <h2 className="title">About Me</h2>
        <p className="para">{aboutText}</p>
        <nav className="section-links" aria-label="Explore my portfolio"><a href="#work">Explore my cloud projects</a><a href="#stack">Tools I use</a><a href="#contact">Contact me</a></nav>
      </div>
    </div>
  );
};

export default About;
