import { aboutText } from "../data/content";
import "./styles/About.css";

const About = () => {
  return (
    <section className="about-section section-container" id="about" aria-label="About me">
      <p className="section-eyebrow" data-reveal>01 / Behind the systems</p>
      <div className="about-me">
        <h2 className="title" data-reveal>About Me</h2>
        <p className="para">{aboutText.split(" ").map((word, index) => <span className="about-word" key={index}>{word}{" "}</span>)}</p>
        <nav className="section-links" aria-label="Explore my portfolio" data-reveal><a href="#work">Explore my cloud projects ↗</a><a href="#stack">Tools I use ↗</a></nav>
      </div>
    </section>
  );
};

export default About;
