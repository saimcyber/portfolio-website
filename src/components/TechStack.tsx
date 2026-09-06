import { IconType } from "react-icons";
import {
  SiAnsible,
  SiArgo,
  SiAmazonwebservices,
  SiDocker,
  SiGit,
  SiGithub,
  SiGithubactions,
  SiGrafana,
  SiHelm,
  SiJenkins,
  SiKubernetes,
  SiLinux,
  SiNginx,
  SiPrometheus,
  SiPython,
  SiSonarqube,
  SiTerraform,
  SiTrivy,
} from "react-icons/si";
import { stackFoundation, stackStages } from "../data/content";
import "./styles/TechStack.css";

/**
 * Maps the string keys in `data/content.ts` onto glyphs.
 *
 * These come from react-icons' Simple Icons set, which is already a
 * dependency - no new package, and the glyphs tree-shake individually. They
 * are rendered monochrome and inherit `currentColor`, so each stage tints its
 * own tools rather than dragging eighteen brand palettes into a page built on
 * two accent colours.
 */
const ICONS: Record<string, IconType> = {
  actions: SiGithubactions,
  ansible: SiAnsible,
  argo: SiArgo,
  aws: SiAmazonwebservices,
  docker: SiDocker,
  git: SiGit,
  github: SiGithub,
  grafana: SiGrafana,
  helm: SiHelm,
  jenkins: SiJenkins,
  kubernetes: SiKubernetes,
  linux: SiLinux,
  nginx: SiNginx,
  prometheus: SiPrometheus,
  python: SiPython,
  sonarqube: SiSonarqube,
  terraform: SiTerraform,
  trivy: SiTrivy,
};

function ToolIcon({ icon }: { icon: string }) {
  const Glyph = ICONS[icon];
  // A key with no glyph falls back to a dot rather than throwing, so adding a
  // tool to content.ts can never white-screen the section.
  if (!Glyph) return <span className="stack-dot" aria-hidden="true" />;
  return <Glyph aria-hidden="true" />;
}

/**
 * The stack as the pipeline it forms.
 *
 * Replaces a Rapier physics canvas of 22 tumbling cubes. That cost 2.24MB
 * (854KB gzipped), ~89% of it Rapier's WebAssembly binary inlined as base64 -
 * which also defeats streaming compilation - and it was desktop-only, so
 * phones got no stack section at all. This renders everywhere, weighs
 * essentially nothing, and says something about how the tools fit together
 * rather than just which ones he has used.
 */
const TechStack = () => {
  return (
    <section className="techstack" id="stack" aria-labelledby="stack-heading">
      <div className="stack-inner">
        <header className="stack-head">
          <h3 className="stack-eyebrow">My Stack</h3>
          <h2 className="stack-title" id="stack-heading">
            Commit to production, <span>one pipeline.</span>
          </h2>
        </header>

        <ol className="stack-flow">
          {stackStages.map((stage, i) => (
            <li className="stack-stage" key={stage.name}>
              <div className="stack-stage-head">
                <span className="stack-index">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h4>{stage.name}</h4>
                <p>{stage.summary}</p>
              </div>
              <ul className="stack-tools">
                {stage.tools.map((tool) => (
                  <li className="stack-tool" key={tool.name}>
                    <ToolIcon icon={tool.icon} />
                    <span>{tool.name}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>

        <div className="stack-foundation">
          <span className="stack-foundation-label">Runs on</span>
          <ul>
            {stackFoundation.map((tool) => (
              <li className="stack-chip" key={tool.name}>
                <ToolIcon icon={tool.icon} />
                <span>{tool.name}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default TechStack;
