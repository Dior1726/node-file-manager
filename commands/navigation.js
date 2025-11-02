import path from "path";
import fsp from "fs/promises";
import os from "os";
import { currentDir, setCurrentDir } from "../helpers/print_current_dir.js";

const homeDir = os.homedir();

export const goUp = () => {
  try {
    const parent = path.resolve(currentDir, "..");

    // 🛡️ Запрет выхода за пределы homeDir
    if (!parent.startsWith(homeDir)) {
      console.log("You cannot go above your home directory.");
      return;
    }

    // Если уже на homedir
    if (parent === currentDir) {
      console.log("You are already at the home directory.");
      return;
    }

    process.chdir(parent);
    setCurrentDir(process.cwd());
  } catch {
    console.log("Operation failed");
  }
};

export const changeDir = async (targetPath) => {
  try {
    const resolvedPath = path.resolve(currentDir, targetPath);
    const stat = await fsp.stat(resolvedPath);

    if (!stat.isDirectory()) {
      console.log("Operation failed: Target is not a directory");
      return;
    }

    // 🛡️ Запрет перехода за пределы homeDir
    if (!resolvedPath.startsWith(homeDir)) {
      console.log(
        "Operation failed: Access outside home directory is not allowed"
      );
      return;
    }

    process.chdir(resolvedPath);
    setCurrentDir(process.cwd());
  } catch (err) {
    if (err.code === "ENOENT") {
      console.log("Operation failed: Directory not found");
    } else {
      console.log("Operation failed");
    }
  }
};
