import { promises as fs } from 'node:fs';
import path from 'node:path';

const root = path.resolve('src/content/docs');
const write = process.argv.includes('--write');

const dokuRouteOverrides = new Map([
  ['arrival:beli-karton', '/arrival/beli-karton/'],
  ['arrival:boravak', '/arrival/boravak/'],
  ['adaptation:consentid', '/adaptation/consentid/'],
  ['adaptation:russians', '/adaptation/russians/'],
  ['map:smallrf', '/map/smallrf/'],
  ['move:visarun', '/arrival/visarun/'],
]);

const directiveTypes = new Map([
  ['primary', 'note'],
  ['warning', 'caution'],
  ['success', 'tip'],
  ['info', 'note'],
  ['question', 'note'],
]);

async function walk(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(fullPath)));
    else if (entry.isFile() && entry.name.endsWith('.mdx')) files.push(fullPath);
  }
  return files;
}

function routeFromDoku(target) {
  const normalized = target.trim();
  const override = dokuRouteOverrides.get(normalized);
  if (override) return override;

  const [page, anchor] = normalized.split('#', 2);
  const route = page.replaceAll(':', '/').replace(/^\/+|\/+$/g, '');
  return `/${route}/${anchor ? `#${anchor}` : ''}`;
}

function normalizeNamedFootnotes(text) {
  const matches = [...text.matchAll(/\[\^([^\]\r\n]+)\]/g)];
  if (!matches.some((match) => !/^\d+$/.test(match[1]))) return text;

  const labels = [];
  const seen = new Set();
  for (const match of matches) {
    const label = match[1];
    if (!seen.has(label)) {
      seen.add(label);
      labels.push(label);
    }
  }

  const mapping = new Map(labels.map((label, index) => [label, String(index + 1)]));
  return text.replace(/\[\^([^\]\r\n]+)\]/g, (_match, label) => `[^${mapping.get(label)}]`);
}

function removeStrayFootnoteParens(text) {
  return text
    .split('\n')
    .map((line) =>
      line.replace(/\[\^(\d+)\]\)/g, (match, number, offset) => {
        const before = line.slice(0, offset);
        let balance = 0;
        for (const character of before) {
          if (character === '(') balance += 1;
          else if (character === ')') balance -= 1;
        }
        return balance <= 0 ? `[^${number}]` : match;
      }),
    )
    .join('\n');
}

function transform(source) {
  let text = source;
  const hadAiArtifact = /contentReference|oaicite/.test(text);

  text = text.replace(/<autott>([^|<]+)\|([^<]+)<\/autott>/gi, (_match, target, label) => {
    return `[${label.trim()}](${routeFromDoku(target)})`;
  });

  text = text.replace(/<barcode\b[^>]*\/?\s*>/gi, '');
  text = text.replace(/<badge>([\s\S]*?)<\/badge>/gi, (_match, content) => `**${content.trim()}**`);

  text = text.replace(/^::contentReference\[[^\n]*\]\{[^\n]*\}\s*$/gm, '');
  text = text.replace(/^tml\s*$/gm, '');

  text = text.replace(
    /^:::(primary|warning|success|info|question)(?:\s+\[([^\]]+)\])?\s*$/gm,
    (_match, type, title) => `:::${directiveTypes.get(type)}${title ? `[${title.trim()}]` : ''}`,
  );
  text = text.replace(
    /^:::(note|tip|caution|danger)\s+\[([^\]]+)\]\s*$/gm,
    (_match, type, title) => `:::${type}[${title.trim()}]`,
  );
  text = text.replace(
    /(^:::(?:note|tip|caution|danger)(?:\[[^\]]+\])?\s*\n)----\s*\n/gm,
    '$1',
  );

  text = text.replace(/\s*\(\(\s*(\[[^\]]+\]\([^\n]+?\))\s*\)\)/g, ' $1');
  text = normalizeNamedFootnotes(text);
  text = removeStrayFootnoteParens(text);

  if (hadAiArtifact) text = text.replace(/\n+$/, '\n');
  return text;
}

function audit(file, text) {
  const relative = path.relative(process.cwd(), file).replaceAll('\\', '/');
  const checks = [
    ['DokuWiki autott', /<\/?autott\b/i],
    ['DokuWiki barcode', /<barcode\b/i],
    ['lowercase badge', /<\/?badge>/i],
    ['AI contentReference', /contentReference|oaicite/],
    ['named footnote', /\[\^(?!\d+\])[^\]]+\]/],
    ['malformed numeric footnote', /\[\^\d+\]\)/],
    ['unsupported directive type', /^:::(?:primary|warning|success|info|question)\b/m],
    ['DokuWiki inline footnote', /\(\(\s*\[[^\]]+\]\(/],
    ['DokuWiki internal link', /\[\[[^\]]+\]\]/],
    ['DokuWiki media/include', /\{\{[^}]+\}\}/],
  ];

  const findings = [];
  for (const [label, pattern] of checks) {
    if (pattern.test(text)) findings.push(`${relative}: ${label}`);
  }
  return findings;
}

const files = await walk(root);
const changed = [];
const findings = [];

for (const file of files) {
  const relative = path.relative(process.cwd(), file).replaceAll('\\', '/');
  if (relative.includes('/playground/')) continue;

  const source = await fs.readFile(file, 'utf8');
  const output = transform(source);
  if (output !== source) {
    changed.push(relative);
    if (write) await fs.writeFile(file, output, 'utf8');
  }
  findings.push(...audit(file, output));
}

if (changed.length) {
  console.log(`${write ? 'Updated' : 'Would update'} ${changed.length} files:`);
  for (const file of changed) console.log(`- ${file}`);
}

if (findings.length) {
  console.error('\nUnresolved findings:');
  for (const finding of findings) console.error(`- ${finding}`);
  process.exitCode = 1;
} else {
  console.log('\nNo targeted legacy syntax or malformed footnotes remain outside playground fixtures.');
}
