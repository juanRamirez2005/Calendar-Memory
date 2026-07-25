#!/usr/bin/env node
/**
 * Genera docs/PROJECT_STRUCTURE.md con el árbol de archivos del proyecto.
 *
 * Se ejecuta manualmente (`npm run tree`) y automáticamente vía el hook
 * PostToolUse configurado en .claude/settings.local.json cada vez que se
 * crea un archivo. NO edites el .md a mano: se sobrescribe en cada corrida.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUTPUT = path.join(ROOT, 'docs', 'PROJECT_STRUCTURE.md');

// Carpetas/archivos que nunca aparecen en el árbol (ruido o artefactos).
const IGNORE = new Set([
  'node_modules',
  '.git',
  '.gradle',
  '.cxx',
  'build',
  'Pods',
  'DerivedData',
  '.DS_Store',
  'Thumbs.db',
]);

/** Ordena: carpetas primero, luego archivos, ambos alfabéticamente. */
function sortEntries(entries) {
  return entries.sort((a, b) => {
    if (a.isDirectory() !== b.isDirectory()) {
      return a.isDirectory() ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });
}

/** Construye recursivamente las líneas del árbol. */
function buildTree(dir, prefix, lines) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  entries = sortEntries(entries.filter((e) => !IGNORE.has(e.name)));

  entries.forEach((entry, index) => {
    const isLast = index === entries.length - 1;
    const branch = isLast ? '└── ' : '├── ';
    const label = entry.isDirectory() ? `${entry.name}/` : entry.name;
    lines.push(`${prefix}${branch}${label}`);

    if (entry.isDirectory()) {
      const nextPrefix = prefix + (isLast ? '    ' : '│   ');
      buildTree(path.join(dir, entry.name), nextPrefix, lines);
    }
  });
}

function main() {
  const treeLines = [];
  buildTree(ROOT, '', treeLines);

  const projectName = path.basename(ROOT);
  const content = [
    '# Estructura del proyecto',
    '',
    '> ⚠️ **Archivo autogenerado por `scripts/generate-tree.js`.**',
    '> No lo edites a mano: se regenera solo al crear archivos (hook PostToolUse)',
    '> o al correr `npm run tree`. Excluye `node_modules`, `.git` y artefactos de build.',
    '',
    '```',
    `${projectName}/`,
    ...treeLines,
    '```',
    '',
  ].join('\n');

  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, content, 'utf8');
  process.stdout.write(`Árbol actualizado: ${path.relative(ROOT, OUTPUT)}\n`);
}

main();
