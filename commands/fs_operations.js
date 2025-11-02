import fs from "fs";
import os from "os";
import path from "path";
import fsp from "fs/promises";
import { resolveSafe } from "../helpers/resolve_safe.js";

let currentDir = os.homedir();

const catFile = async (filePath, pipe) => {
  const resolved = resolveSafe(filePath);
  const stat = await fsp.stat(resolved);
  if (!stat.isFile()) throw new Error("Not a file");
  const rs = fs.createReadStream(resolved, { encoding: "utf8" });
  await pipe(rs, process.stdout);
  process.stdout.write("\n");
};

const addFile = async (name) => {
  if (!name) throw new Error("Invalid input");
  const resolved = resolveSafe(name);
  // Ensure create in current directory only (spec)
  if (path.dirname(resolved) !== path.normalize(currentDir))
    throw new Error("Invalid input");
  await fsp.writeFile(resolved, "", { flag: "wx" }); // fail if exists
};

const makeDir = async (name) => {
  if (!name) throw new Error("Invalid input");
  const resolved = resolveSafe(name);
  if (path.dirname(resolved) !== path.normalize(currentDir))
    throw new Error("Invalid input");
  await fsp.mkdir(resolved, { recursive: false });
};

const renameFile = async (sourcePath, newFilename) => {
  if (!sourcePath || !newFilename) throw new Error("Invalid input");
  const resolvedSource = resolveSafe(sourcePath);
  const stat = await fsp.stat(resolvedSource);
  if (!stat.isFile()) throw new Error("Source is not a file");
  const dest = path.join(path.dirname(resolvedSource), newFilename);
  const resolvedDest = resolveSafe(dest);
  await fsp.rename(resolvedSource, resolvedDest);
};

const copyFile = async (sourcePath, destDirPath, pipe) => {
  if (!sourcePath || !destDirPath) throw new Error("Invalid input");
  const resolvedSource = resolveSafe(sourcePath);
  const sstat = await fsp.stat(resolvedSource);
  if (!sstat.isFile()) throw new Error("Source is not a file");
  const resolvedDestDir = resolveSafe(destDirPath);
  const destStat = await fsp.stat(resolvedDestDir).catch(() => null);
  if (!destStat || !destStat.isDirectory())
    throw new Error("Destination must be an existing directory");
  const destFile = path.join(resolvedDestDir, path.basename(resolvedSource));
  await fsp
    .access(destFile)
    .then(() => {
      throw new Error("Destination exists");
    })
    .catch(() => {});
  const rs = fs.createReadStream(resolvedSource);
  const ws = fs.createWriteStream(destFile, { flags: "wx" });
  await pipe(rs, ws);
};

const moveFile = async (sourcePath, destDirPath, pipe) => {
  await copyFile(sourcePath, destDirPath, pipe);
  const resolvedSource = resolveSafe(sourcePath);
  await fsp.unlink(resolvedSource);
};

const removeFile = async (filePath) => {
  if (!filePath) throw new Error("Invalid input");
  const resolved = resolveSafe(filePath);
  const stat = await fsp.stat(resolved);
  if (!stat.isFile()) throw new Error("Not a file");
  await fsp.unlink(resolved);
};

export {
  makeDir,
  catFile,
  addFile,
  moveFile,
  copyFile,
  renameFile,
  removeFile,
};
