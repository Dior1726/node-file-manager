import fs from "fs";
import os from "os";
import path from "path";

let currentDir = os.homedir();

export const resolveSafe = (inputPath) => {
  const candidate = path.isAbsolute(inputPath)
    ? path.normalize(inputPath)
    : path.normalize(path.join(currentDir, inputPath));

  const driveRoot = path.parse(candidate).root;
  if (!isInsideRoot(candidate, driveRoot)) {
    throw new Error("Invalid path");
  }
  return candidate;
};

const isInsideRoot = (resolvedPath, root) => {
  const normRoot = path.normalize(root);
  const normResolved = path.normalize(resolvedPath);
  return normResolved === normRoot || normResolved.startsWith(normRoot);
};
