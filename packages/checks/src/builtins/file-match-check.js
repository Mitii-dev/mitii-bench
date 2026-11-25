import { runFileMatchCheck } from "./file-match.js";

export const type = "file_match";
export const yamlKey = "fileMatch";

export function tryCompile(item) {
  if (!item.fileMatch) return null;
  const paths =
    item.fileMatch.files ?? (item.fileMatch.file ? [item.fileMatch.file] : []);
  return {
    type,
    paths,
    patterns: item.fileMatch.patterns,
    mode: item.fileMatch.mode ?? "all",
  };
}

export async function verify(check, context) {
  return runFileMatchCheck(check, context.workspace);
}
