import { useState } from "react";
import { MdArrowOutward, MdChevronLeft, MdChevronRight } from "react-icons/md";
import { projects } from "../data/content";
import media from "virtual:project-media";
import WorkImage from "./WorkImage";
import "./styles/Work.css";

const Work = () => {
  const [active, setActive] = useState(0);
  const nextProject = (direction: number, label: string) => {
    setActive((index) => (index + direction + projects.length) % projects.length);
    requestAnimationFrame(() => document.querySelector<HTMLButtonElement>(`.project-panel:not([hidden]) button[aria-label="${label}"]`)?.focus({ preventScroll: true }));
  };
  return (
    <section className="work-section section-container" id="work" aria-labelledby="work-heading">
      <div className="work-heading-row" data-reveal>
        <div><p className="section-eyebrow">03 / Selected projects</p><h2 id="work-heading">Built to <span>ship.</span></h2></div>
        <p className="work-intro">Cloud infrastructure. Secure pipelines.<br />Systems that work together.</p>
      </div>
      <div className="project-selectors" role="group" aria-label="Select a project" data-reveal>
        {projects.map((project, index) => (
          <button type="button" key={project.slug} className={`project-selector${active === index ? " is-active" : ""}`}
            aria-pressed={active === index} aria-controls={`project-${project.slug}`} onClick={() => setActive(index)}>
            <span>0{index + 1}</span>{project.name}<MdArrowOutward aria-hidden="true" />
          </button>
        ))}
      </div>
      {projects.map((project, index) => (
        <article className={`project-panel project-theme-${index}`} id={`project-${project.slug}`} key={project.slug}
          hidden={active !== index} aria-labelledby={`project-title-${project.slug}`}>
          <WorkImage project={project} media={media[project.slug] ?? []} active={active === index} />
          <div className="work-info">
            <p className="work-category">{project.category}</p>
            <h3 id={`project-title-${project.slug}`}>{project.name}</h3>
            <p className="work-description">{project.description}</p>
            <div className="work-tools" aria-label="Project tools">
              {project.tools.split(",").map((tool) => <span key={tool} className="work-tool">{tool.trim()}</span>)}
            </div>
            {project.link && <a className="work-link-btn" href={project.link} target="_blank" rel="noopener noreferrer">View project <MdArrowOutward aria-hidden="true" /></a>}
            <div className="project-pagination">
              <span aria-live="polite">0{active + 1} <span className="pagination-total">/ 0{projects.length}</span></span>
              <div>
                <button type="button" aria-label="Previous project" onClick={() => nextProject(-1, "Previous project")}><MdChevronLeft /></button>
                <button type="button" aria-label="Next project" onClick={() => nextProject(1, "Next project")}><MdChevronRight /></button>
              </div>
            </div>
          </div>
        </article>
      ))}
    </section>
  );
};
export default Work;
