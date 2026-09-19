import type { IconType } from 'react-icons';
import { FaJava } from 'react-icons/fa6';
import {
  SiHtml5,
  SiJavascript,
  SiJson,
  SiMarkdown,
  SiPhp,
  SiPython,
  SiReact,
  SiToml,
  SiTypescript,
  SiYaml,
} from 'react-icons/si';
import {
  TbBrandCSharp,
  TbBrandCss3,
  TbFileText,
  TbFileTypeSql,
} from 'react-icons/tb';
import { VscFile } from 'react-icons/vsc';

import { fileKind, type FileKind } from '@/lib/files';

const glyphs: Record<FileKind, { icon: IconType; label: string }> = {
  tsx: { icon: SiReact, label: 'TSX' },
  jsx: { icon: SiReact, label: 'JSX' },
  ts: { icon: SiTypescript, label: 'TypeScript' },
  js: { icon: SiJavascript, label: 'JavaScript' },
  json: { icon: SiJson, label: 'JSON' },
  yaml: { icon: SiYaml, label: 'YAML' },
  toml: { icon: SiToml, label: 'TOML' },
  log: { icon: TbFileText, label: 'Log' },
  csharp: { icon: TbBrandCSharp, label: 'C#' },
  python: { icon: SiPython, label: 'Python' },
  java: { icon: FaJava, label: 'Java' },
  php: { icon: SiPhp, label: 'PHP' },
  sql: { icon: TbFileTypeSql, label: 'SQL' },
  markdown: { icon: SiMarkdown, label: 'Markdown' },
  html: { icon: SiHtml5, label: 'HTML' },
  css: { icon: TbBrandCss3, label: 'CSS' },
  unknown: { icon: VscFile, label: 'File' },
};

export function FileGlyph({
  filename,
  size,
}: {
  filename: string;
  size: number;
}) {
  const kind = fileKind(filename);
  const { icon: Icon, label } = glyphs[kind];
  return (
    <Icon
      aria-hidden="true"
      className={`file-glyph file-glyph-${kind}`}
      size={size}
      title={label}
    />
  );
}
