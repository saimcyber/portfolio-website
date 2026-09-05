import { MdArrowOutward } from "react-icons/md";

interface Props {
  image: string;
  alt?: string;
  link?: string;
}

/**
 * A project card's image. Renders as a link only when the project actually has
 * one: an unlinked project used to render `<a target="_blank">` with no `href`,
 * which is a focusable element that does nothing when activated (and reads to a
 * screen reader as a link with no destination).
 */
const WorkImage = ({ image, alt, link }: Props) => {
  const figure = <img src={image} alt={alt} loading="lazy" decoding="async" />;

  return (
    <div className="work-image">
      {link ? (
        <a
          className="work-image-in"
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          data-cursor="disable"
        >
          <div className="work-link">
            <MdArrowOutward />
          </div>
          {figure}
        </a>
      ) : (
        <div className="work-image-in">{figure}</div>
      )}
    </div>
  );
};

export default WorkImage;
