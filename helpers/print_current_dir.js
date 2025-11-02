import os from "os";

export let currentDir = os.homedir();

export const printCurrentDir = () => {
  console.log(`You are currently in ${currentDir}`);
};

export const setCurrentDir = (dir) => {
  currentDir = dir;
};
