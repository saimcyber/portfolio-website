import { useEffect, useRef, useState } from "react";
import { MdClose, MdFullscreen, MdPlayArrow } from "react-icons/md";
import { SiAmazonwebservices, SiDocker, SiKubernetes } from "react-icons/si";
import type { Project } from "../data/content";
import type { ProjectMedia } from "virtual:project-media";

const glyphs = [SiKubernetes, SiDocker, SiAmazonwebservices];
function Architecture({ project }: { project: Project }) {
  const Glyph = glyphs[project.slug === "securekubeops-pipeline" ? 0 : project.slug === "awarenet-platform" ? 1 : 2];
  return (
    <div className="project-architecture" role="img" aria-label={`${project.name} concept: ${project.stages.join(" to ")}`}>
      <div className="architecture-top"><span><i /> System architecture</span><span>Concept / 0{project.stages.length}</span></div>
      <div className="architecture-orbit" aria-hidden="true"><div className="orbit-ring" /><div className="orbit-ring orbit-ring-two" /><div className="architecture-core"><Glyph /></div><span className="orbit-node node-one" /><span className="orbit-node node-two" /><span className="orbit-node node-three" /></div>
      <div className="architecture-flow" aria-hidden="true">{project.stages.map((stage, i) => <div key={stage}><span>0{i + 1}</span>{stage}</div>)}</div>
      <p className="architecture-caption">{project.category}</p>
    </div>
  );
}

const WorkImage = ({ project, media, active }: { project: Project; media: ProjectMedia[]; active: boolean }) => {
  const [selected, setSelected] = useState(0);
  const [failed, setFailed] = useState<string[]>([]);
  const dialog = useRef<HTMLDialogElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const item = media[selected];
  const hasMedia = item && !failed.includes(item.src);
  useEffect(() => { if (!active) video.current?.pause(); }, [active]);
  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    const unlock = () => document.body.style.removeProperty("overflow");
    element.addEventListener("close", unlock);
    return () => { element.removeEventListener("close", unlock); unlock(); };
  }, []);
  return (
    <div className="project-visual">
      <div className="work-image">
        {hasMedia ? item.type === "video" ? (
          <video ref={video} key={item.src} src={active ? item.src : undefined} controls playsInline preload="none"
            poster={media.find((file) => file.type === "image")?.src} aria-label={`${project.name}: ${item.label}`}
            onError={() => setFailed((files) => [...files, item.src])} />
        ) : (
          <img key={item.src} src={item.src} alt={`${project.name}: ${item.label}`} width={960} height={600} loading="lazy" decoding="async"
            onError={() => setFailed((files) => [...files, item.src])} />
        ) : <Architecture project={project} />}
        {hasMedia && item.type === "image" && <button className="media-expand" type="button" aria-label={`Enlarge ${item.label}`} onClick={() => { dialog.current?.showModal(); document.body.style.overflow = "hidden"; }}><MdFullscreen /></button>}
      </div>
      {media.length > 0 && <div className="media-gallery" role="group" aria-label={`${project.name} media`}>
        {media.map((file, index) => <button type="button" key={file.src} aria-pressed={index === selected} aria-label={`Show ${file.label}`} onClick={() => setSelected(index)}>
          {file.type === "image" ? <img src={file.src} alt="" width={96} height={60} loading="lazy" /> : <MdPlayArrow aria-hidden="true" />}
          <span>{file.label}</span>
        </button>)}
      </div>}
      {item && <p className="media-caption" aria-live="polite">{failed.includes(item.src) ? "This file could not be loaded. Try another preview." : `${selected + 1} / ${media.length} — ${item.label}`}</p>}
      <dialog className="media-dialog" ref={dialog} aria-label={`${project.name} image preview`} onClick={(e) => { if (e.target === e.currentTarget) dialog.current?.close(); }}>
        <button type="button" className="media-close" aria-label="Close image preview" onClick={() => dialog.current?.close()}><MdClose /></button>
        {item?.type === "image" && <img src={item.src} alt={`${project.name}: ${item.label}`} width={1600} height={1000} loading="lazy" />}
        <p>{item?.label}</p>
      </dialog>
    </div>
  );
};
export default WorkImage;
