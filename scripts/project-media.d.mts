import type { Plugin } from 'vite';
export function projectMediaPlugin(): Plugin;
export function readProjectMedia(publicDir: string): Record<string, { src: string; type: 'image' | 'video'; label: string; cover: boolean }[]>;
