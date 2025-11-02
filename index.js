#!/usr/bin/env node
import fs from "fs";
import zlib from "zlib";
import path from "path";
import crypto from "crypto";
import fsp from "fs/promises";
import readline from "readline";

import { pipeline } from "stream";
import { promisify } from "util";
import { fileURLToPath } from "url";

// helpers
import { getUsername } from "./helpers/get_args.js";
import { resolveSafe } from "./helpers/resolve_safe.js";
import { printCurrentDir } from "./helpers/print_current_dir.js";

// commands
import { ls } from "./commands/ls.js";
import { osInfo } from "./commands/os_info.js";
import { hashFile } from "./commands/hash_file.js";
import { goUp, changeDir } from "./commands/navigation.js";
import {
  compressFile,
  decompressFile,
} from "./commands/compress_operations.js";
import {
  makeDir,
  addFile,
  catFile,
  copyFile,
  moveFile,
  renameFile,
  removeFile,
} from "./commands/fs_operations.js";

const pipe = promisify(pipeline);
const username = getUsername() || "Anonymous";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "",
});

const handleCommand = async (line) => {
  const trimmed = (line || "").trim();
  if (!trimmed) return;

  if (trimmed === ".exit") {
    await shutdown();
    return;
  }

  const tokens = trimmed.split(/\s+/);
  const cmd = tokens[0];

  try {
    switch (cmd) {
      case "cat":
        if (tokens.length !== 2) throw new Error("Invalid input");
        await catFile(tokens[1], pipe);
        break;
      case "add":
        if (tokens.length !== 2) throw new Error("Invalid input");
        await addFile(tokens[1]);
        break;
      case "mkdir":
        if (tokens.length !== 2) throw new Error("Invalid input");
        await makeDir(tokens[1]);
        break;
      case "rn":
        if (tokens.length !== 3) throw new Error("Invalid input");
        await renameFile(tokens[1], tokens[2]);
        break;
      case "cp":
        if (tokens.length !== 3) throw new Error("Invalid input");
        await copyFile(tokens[1], tokens[2], pipe);
        break;
      case "mv":
        if (tokens.length !== 3) throw new Error("Invalid input");
        await moveFile(tokens[1], tokens[2], pipe);
        break;
      case "rm":
        if (tokens.length !== 2) throw new Error("Invalid input");
        await removeFile(tokens[1]);
        break;

      case "ls":
        await ls();
        break;
      case "up":
        goUp();
        break;

      case "cd":
        if (tokens.length !== 2) throw new Error("Invalid input");
        await changeDir(tokens[1]);
        break;

      case "os":
        if (tokens.length !== 2) throw new Error("Invalid input");
        await osInfo(tokens[1]);
        break;

      case "hash":
        if (tokens.length !== 2) throw new Error("Invalid input");
        await hashFile(tokens[1]);
        break;

      case "compress":
        if (tokens.length !== 3) throw new Error("Invalid input");
        await compressFile(tokens[1], tokens[2], pipe);
        break;
      case "decompress":
        if (tokens.length !== 3) throw new Error("Invalid input");
        await decompressFile(tokens[1], tokens[2], pipe);
        break;

      default:
        console.log("Invalid input");
        return;
    }
  } catch (err) {
    if (err.message === "Invalid input") {
      console.log("Invalid input");
    } else {
      console.log("Operation failed. ", err.message);
    }
  }
};

const shutdown = async () => {
  console.log(`Thank you for using File Manager, ${username}, goodbye!`);
  rl.close();
};

process.on("SIGINT", async () => {
  await shutdown();
});

rl.on("close", () => {
  console.log(`Thank you for using File Manager, ${username}, goodbye!`);
  process.exit(0);
});

console.log(`Welcome to the File Manager, ${username}!`);
printCurrentDir();
rl.setPrompt("> ");
rl.prompt();

rl.on("line", async (input) => {
  await handleCommand(input);
  printCurrentDir();
  rl.prompt();
});
