interface Props {
  image: string;
  alt?: string;
}

/**
 * A project card's image. Purely visual now - the clickable "View project"
 * link lives as its own pill button in Work.tsx, so this no longer wraps the
 * image in an `<a>` (having both a corner badge and a button link to the same
 * place was redundant, and an unlinked project used to render `<a
 * target="_blank">` with no `href`, a focusable element that did nothing).
 */
const WorkImage = ({ image, alt }: Props) => {
  return (
    <div className="work-image">
      <img src={image} alt={alt} loading="lazy" decoding="async" />
    </div>
  );
};

export default WorkImage;
