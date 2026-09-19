export type FileKind =
  | 'tsx'
  | 'jsx'
  | 'ts'
  | 'js'
  | 'json'
  | 'yaml'
  | 'toml'
  | 'log'
  | 'csharp'
  | 'python'
  | 'java'
  | 'php'
  | 'sql'
  | 'markdown'
  | 'html'
  | 'css'
  | 'unknown';

const EXTENSION_KIND: Record<string, FileKind> = {
  tsx: 'tsx',
  jsx: 'jsx',
  ts: 'ts',
  js: 'js',
  json: 'json',
  yml: 'yaml',
  yaml: 'yaml',
  toml: 'toml',
  log: 'log',
  cs: 'csharp',
  py: 'python',
  java: 'java',
  php: 'php',
  sql: 'sql',
  md: 'markdown',
  html: 'html',
  css: 'css',
};

export function fileExtension(filename: string) {
  const slash = Math.max(filename.lastIndexOf('/'), filename.lastIndexOf('\\'));
  const base = slash >= 0 ? filename.slice(slash + 1) : filename;
  const dot = base.lastIndexOf('.');
  return dot > 0 ? base.slice(dot + 1).toLowerCase() : '';
}

export function fileKind(filename: string): FileKind {
  return EXTENSION_KIND[fileExtension(filename)] ?? 'unknown';
}
