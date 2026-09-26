import { careerData } from "../data/content";
import "./styles/Career.css";

const Career = () => {
  return (
    <div className="career-section section-container" id="career">
      <div className="career-container">
        <h2>
          My career <span>&</span>
          <br /> experience
        </h2>
        <div className="career-info">
          <div className="career-timeline">
            <div className="career-dot"></div>
          </div>
          {careerData.map((entry) => (
            <div className="career-info-box" key={entry.role}>
              <div className="career-info-in">
                <div className="career-role">
                  <h3 className="career-role-title">{entry.role}</h3>
                  <p className="career-organization">{entry.organization}</p>
                </div>
                <p className="career-period">{entry.period}</p>
              </div>
              <p>{entry.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Career;
