export const SECOND_BRAIN_PATH_PATTERN = /(^|[\\/])second-brain(?:[\\/]|$)/;

export function isDocumentationFile(filePath: string): boolean {
  return filePath.endsWith(".md");
}

export interface ScannedFile {
  path: string;
  content: string;
}

export function findSecondBrainPathViolations(files: ScannedFile[]): string[] {
  return files
    .filter((file) => !isDocumentationFile(file.path))
    .filter((file) => SECOND_BRAIN_PATH_PATTERN.test(file.content))
    .map((file) => file.path);
}
