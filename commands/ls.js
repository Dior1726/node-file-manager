import fs from "fs/promises";
import os from "os";
import path from "path";
import { currentDir } from "../helpers/print_current_dir.js";

export async function ls() {
  try {
    const items = await fs.readdir(currentDir, { withFileTypes: true });

    const sortedItems = items.sort((a, b) => {
      if (a.isDirectory() && !b.isDirectory()) return -1;
      if (!a.isDirectory() && b.isDirectory()) return 1;
      return a.name.localeCompare(b.name);
    });

    const tableData = sortedItems.map((item, index) => ({
      name: item.name,
      type: item.isDirectory() ? "directory" : "file",
    }));

    console.table(tableData);
  } catch (err) {
    console.log("Operation failed");
  }
}
