import { createServer } from 'vite';
import { readFile, writeFile } from 'node:fs/promises';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';

// Render the same React tree that the browser hydrates, at build time.
// No user-agent detection or duplicate crawler-only content.
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
try {
  const { default: App } = await server.ssrLoadModule('/src/App.tsx');
  const { personal, projects } = await server.ssrLoadModule('/src/data/content.ts');
  const origin = 'https://saimzaib.tech';
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person', '@id': `${origin}/#person`, name: personal.fullName,
        url: `${origin}/`, jobTitle: 'DevOps & Cloud Engineer',
        sameAs: [personal.github, personal.linkedin],
        address: { '@type': 'PostalAddress', addressLocality: 'Islamabad', addressCountry: 'PK' },
        knowsAbout: ['Kubernetes', 'Terraform', 'AWS', 'Docker', 'CI/CD', 'Cloud security'],
      },
      {
        '@type': 'WebSite', '@id': `${origin}/#website`, url: `${origin}/`,
        name: 'Saim Zaib | DevOps & Cloud Engineer', publisher: { '@id': `${origin}/#person` },
      },
      {
        '@type': 'ProfilePage', '@id': `${origin}/#webpage`, url: `${origin}/`,
        name: 'Saim Zaib | DevOps & Cloud Engineer',
        mainEntity: { '@id': `${origin}/#person` }, isPartOf: { '@id': `${origin}/#website` },
        hasPart: projects.map(project => ({ '@type': 'CreativeWork', name: project.name,
          description: `${project.category}. Tools: ${project.tools}.`,
          creator: { '@id': `${origin}/#person` }, url: `${origin}/#work` })),
      },
    ],
  };
  let html = await readFile('dist/index.html', 'utf8');
  html = html.replace('<div id="root"></div>', `<div id="root">${renderToString(createElement(App))}</div>`);
  html = html.replace('</head>', `<script type="application/ld+json">${JSON.stringify(schema).replaceAll('<', '\\u003c')}</script></head>`);
  await writeFile('dist/index.html', html);
  console.log('Prerendered portfolio content and Person, WebSite, ProfilePage structured data.');
} finally {
  await server.close();
}
