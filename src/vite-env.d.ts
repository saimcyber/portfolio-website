/// <reference types="vite/client" />

declare module "virtual:project-media" {
  export interface ProjectMedia {
    src: string;
    type: "image" | "video";
    label: string;
    cover: boolean;
  }
  const media: Record<string, ProjectMedia[]>;
  export default media;
}
