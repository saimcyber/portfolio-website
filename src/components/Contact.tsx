import { FaGithub, FaLinkedinIn } from "react-icons/fa6";
import { MdCopyright, MdMail, MdArrowOutward } from "react-icons/md";
import { personal } from "../data/content";
import "./styles/Contact.css";

const Contact = () => {
  return (
    <div className="contact-section" id="contact">
      <div className="contact-inner">
        <h3 className="contact-eyebrow">Get in touch</h3>
        <h2 className="contact-title">Let's build something secure.</h2>

        <a
          className="contact-email"
          href={`mailto:${personal.email}`}
          data-cursor="disable"
        >
          {personal.email}
        </a>

        <div className="contact-meta">
          <span>{personal.location}</span>
          <span className="contact-dot" aria-hidden="true">
            &middot;
          </span>
          <a href={`tel:${personal.phoneHref}`} data-cursor="disable">
            {personal.phone}
          </a>
          <a
            className="contact-resume-btn"
            href={personal.resume}
            target="_blank"
            rel="noopener"
            data-cursor="disable"
          >
            Resume <MdArrowOutward />
          </a>
        </div>

        <div className="contact-icons">
          <a
            className="contact-icon-btn"
            href={personal.github}
            target="_blank"
            rel="noopener"
            aria-label="GitHub"
            data-cursor="disable"
          >
            <FaGithub />
          </a>
          <a
            className="contact-icon-btn"
            href={personal.linkedin}
            target="_blank"
            rel="noopener"
            aria-label="LinkedIn"
            data-cursor="disable"
          >
            <FaLinkedinIn />
          </a>
          <a
            className="contact-icon-btn"
            href={`mailto:${personal.email}`}
            aria-label="Email"
            data-cursor="disable"
          >
            <MdMail />
          </a>
        </div>

        <div className="contact-bottom">
          <p>
            <MdCopyright /> {new Date().getFullYear()} {personal.fullName}
            <span className="contact-bottom-dot" aria-hidden="true">
              &middot;
            </span>
            Designed &amp; developed by{" "}
            <span className="contact-bottom-name">{personal.fullName}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Contact;
