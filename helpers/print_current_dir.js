import os from "os";

let currentDir = os.homedir();

export const printCurrentDir = () => {
  console.log(`You are currently in ${currentDir}`);
};
