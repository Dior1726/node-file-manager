import fs from "fs";
import crypto from "crypto";
import fsp from "fs/promises";
import { resolveSafe } from "../helpers/resolve_safe.js";

export const hashFile = async (filePath) => {
  if (!filePath) throw new Error("Invalid input");
  const resolved = resolveSafe(filePath);
  const stat = await fsp.stat(resolved);
  if (!stat.isFile()) throw new Error("Not a file");

  const rs = fs.createReadStream(resolved);
  const hash = crypto.createHash("sha256");

  await new Promise((resolve, reject) => {
    rs.on("error", reject);
    hash.on("error", reject);
    rs.on("data", (chunk) => hash.update(chunk));
    rs.on("end", () => {
      console.log(hash.digest("hex"));
      resolve();
    });
  });
};
