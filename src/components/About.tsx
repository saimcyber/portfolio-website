import { aboutText } from "../data/content";
import "./styles/About.css";

const About = () => {
  return (
    <div className="about-section" id="about">
      <div className="about-me">
        <h3 className="title">About Me</h3>
        <p className="para">{aboutText}</p>
      </div>
    </div>
  );
};

export default About;
