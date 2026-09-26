import sharp from 'sharp';
import { readFile, writeFile } from 'node:fs/promises';

for (const path of ['public/og-image.png', 'public/images/placeholder.webp']) {
  const input = await readFile(path);
  const pipeline = sharp(input);
  const output = path.endsWith('.png')
    ? await pipeline.png({ palette: true, quality: 90, effort: 10 }).toBuffer()
    : await pipeline.resize({ width: 640, withoutEnlargement: true }).webp({ quality: 80, effort: 6 }).toBuffer();
  if (output.length < input.length) await writeFile(path, output);
  console.log(`${path}: ${input.length} → ${Math.min(input.length, output.length)} bytes`);
}
