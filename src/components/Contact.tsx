import { MdArrowOutward, MdCopyright } from "react-icons/md";
import { personal } from "../data/content";
import "./styles/Contact.css";

const Contact = () => {
  return (
    <div className="contact-section section-container" id="contact">
      <div className="contact-container">
        <h3>Contact</h3>
        <div className="contact-flex">
          <div className="contact-box">
            <h4>Email</h4>
            <p>
              <a href={`mailto:${personal.email}`} data-cursor="disable">
                {personal.email}
              </a>
            </p>
            <h4>Phone</h4>
            <p>
              <a href={`tel:${personal.phoneHref}`} data-cursor="disable">
                {personal.phone}
              </a>
            </p>
            <h4>Location</h4>
            <p>{personal.location}</p>
          </div>
          <div className="contact-box">
            <h4>Social</h4>
            <a
              href={personal.github}
              target="_blank"
              data-cursor="disable"
              className="contact-social"
            >
              Github <MdArrowOutward />
            </a>
            <a
              href={personal.linkedin}
              target="_blank"
              data-cursor="disable"
              className="contact-social"
            >
              Linkedin <MdArrowOutward />
            </a>
            <a
              href={`mailto:${personal.email}`}
              data-cursor="disable"
              className="contact-social"
            >
              Email <MdArrowOutward />
            </a>
            <a
              href={personal.resume}
              target="_blank"
              rel="noopener"
              data-cursor="disable"
              className="contact-social"
            >
              Resume <MdArrowOutward />
            </a>
          </div>
          <div className="contact-box">
            <h2>
              Designed and Developed <br /> by <span>{personal.fullName}</span>
            </h2>
            <h5>
              <MdCopyright /> {new Date().getFullYear()}
            </h5>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
