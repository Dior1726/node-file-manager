import fs from "fs";
import zlib from "zlib";
import path from "path";
import fsp from "fs/promises";
import { resolveSafe } from "../helpers/resolve_safe.js";

export const compressFile = async (sourcePath, destPath, pipe) => {
  if (!sourcePath || !destPath) throw new Error("Invalid input");
  const resolvedSource = resolveSafe(sourcePath);
  const resolvedDest = resolveSafe(destPath);

  const sstat = await fsp.stat(resolvedSource);
  if (!sstat.isFile()) throw new Error("Source is not a file");

  let finalDest = resolvedDest;
  try {
    const destStat = await fsp.stat(resolvedDest);
    if (destStat.isDirectory()) {
      finalDest = path.join(
        resolvedDest,
        path.basename(resolvedSource) + ".br"
      );
    } else {
      finalDest = resolvedDest;
    }
  } catch {
    finalDest = resolvedDest;
  }

  await fsp
    .access(finalDest)
    .then(() => {
      throw new Error("Destination exists");
    })
    .catch(() => {});

  const sourceStream = fs.createReadStream(resolvedSource);
  const brotli = zlib.createBrotliCompress();
  const destStream = fs.createWriteStream(finalDest, { flags: "wx" });

  await pipe(sourceStream, brotli, destStream);
};

export const decompressFile = async (sourcePath, destPath, pipe) => {
  if (!sourcePath || !destPath) throw new Error("Invalid input");
  const resolvedSource = resolveSafe(sourcePath);
  const resolvedDest = resolveSafe(destPath);

  const sstat = await fsp.stat(resolvedSource);
  if (!sstat.isFile()) throw new Error("Source is not a file");

  let finalDest = resolvedDest;
  try {
    const destStat = await fsp.stat(resolvedDest);
    if (destStat.isDirectory()) {
      const base = path.basename(resolvedSource);
      const maybeName = base.endsWith(".br")
        ? base.slice(0, -3)
        : base + ".decompressed";
      finalDest = path.join(resolvedDest, maybeName);
    } else {
      finalDest = resolvedDest;
    }
  } catch {
    finalDest = resolvedDest;
  }

  await fsp
    .access(finalDest)
    .then(() => {
      throw new Error("Destination exists");
    })
    .catch(() => {});

  const sourceStream = fs.createReadStream(resolvedSource);
  const degr = zlib.createBrotliDecompress();
  const destStream = fs.createWriteStream(finalDest, { flags: "wx" });

  await pipe(sourceStream, degr, destStream);
};
