import { MdArrowOutward } from "react-icons/md";
import "./styles/Work.css";
import WorkImage from "./WorkImage";
import { projects } from "../data/content";

const Work = () => {
  return (
    <div className="work-section section-container" id="work">
      <div className="work-head">
        <h3 className="work-eyebrow">Selected Projects</h3>
        <h2>
          My <span>Work</span>
        </h2>
      </div>

      <div className="work-list">
        {projects.map((project, index) => (
          <div className="work-card" key={project.name}>
            <div className="work-card-media">
              <WorkImage
                image={project.image}
                alt={project.name}
                link={project.link}
              />
            </div>
            <div className="work-card-body">
              <span className="work-index">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="work-name">{project.name}</h3>
              <p className="work-category">{project.category}</p>

              <h4 className="work-tools-label">Tools and features</h4>
              <div className="work-tools">
                {project.tools.split(", ").map((tool) => (
                  <span className="work-tool-chip" key={tool}>
                    {tool}
                  </span>
                ))}
              </div>

              {project.link && (
                <a
                  className="work-cta"
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor="disable"
                >
                  View project <MdArrowOutward />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Work;
