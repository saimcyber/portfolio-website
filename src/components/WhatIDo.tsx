import { skillCards } from "../data/content";
import "./styles/WhatIDo.css";

const WhatIDo = () => (
  <section className="whatIDO" id="services" aria-labelledby="services-heading">
    <div className="what-box">
      <h2 className="title" id="services-heading">W<span className="hat-h2">HAT</span><br />I<span className="do-h2"> DO</span></h2>
    </div>
    <div className="what-box">
      <div className="what-box-in">
        {skillCards.map((card) => (
          <article className="what-content" key={card.title}>
            <h3>{card.title}</h3>
            <p>{card.description}</p>
            <p className="what-tools-label">Skillset &amp; tools</p>
            <div className="what-content-flex">
              {card.tags.map((tag) => <span className="what-tags" key={tag}>{tag}</span>)}
            </div>
          </article>
        ))}
      </div>
    </div>
  </section>
);
export default WhatIDo;
