import { readdirSync, existsSync } from 'node:fs';
import { resolve, relative, sep } from 'node:path';

const images = /\.(avif|webp|png|jpe?g|gif|svg)$/i;
const videos = /\.(mp4|webm|mov|m4v)$/i;

/** Public assets stay unhashed so adding media only requires dropping files into a folder. */
export function readProjectMedia(publicDir) {
  const root = resolve(publicDir, 'projects');
  const manifest = {};
  if (!existsSync(root)) return manifest;
  for (const folder of readdirSync(root, { withFileTypes: true })) {
    if (!folder.isDirectory()) continue;
    const files = [];
    const walk = (directory) => {
      for (const entry of readdirSync(directory, { withFileTypes: true })) {
        const path = resolve(directory, entry.name);
        if (entry.isDirectory()) walk(path);
        else if (images.test(entry.name) || videos.test(entry.name)) {
          const file = relative(root, path).split(sep).join('/');
          files.push({
            src: '/projects/' + file.split('/').map(encodeURIComponent).join('/'),
            type: videos.test(entry.name) ? 'video' : 'image',
            label: entry.name.replace(/\.[^.]+$/, '').replace(/^\d+[-_ ]*/, '').replace(/[-_]/g, ' '),
            cover: /^cover\./i.test(entry.name),
          });
        }
      }
    };
    walk(resolve(root, folder.name));
    manifest[folder.name] = files.sort((a, b) => Number(b.cover) - Number(a.cover) || a.src.localeCompare(b.src, undefined, { numeric: true }));
  }
  return manifest;
}

export function projectMediaPlugin() {
  const id = 'virtual:project-media';
  const resolvedId = '\0' + id;
  let publicDir;
  return {
    name: 'project-media',
    configResolved(config) { publicDir = config.publicDir; },
    resolveId(source) { if (source === id) return resolvedId; },
    load(source) {
      if (source === resolvedId) return `export default ${JSON.stringify(readProjectMedia(publicDir))}`;
    },
    configureServer(server) {
      const root = resolve(publicDir, 'projects');
      server.watcher.add(root);
      const refresh = (file) => {
        if (!resolve(file).startsWith(root + sep)) return;
        const module = server.moduleGraph.getModuleById(resolvedId);
        if (module) server.moduleGraph.invalidateModule(module);
        server.ws.send({ type: 'full-reload' });
      };
      server.watcher.on('add', refresh).on('unlink', refresh).on('change', refresh);
    },
  };
}
