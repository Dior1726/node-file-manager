import os from "os";

export const osInfo = async (flag) => {
  switch (flag) {
    case "--EOL":
      console.log(JSON.stringify(os.EOL));
      break;
    case "--cpus": {
      const cpus = os.cpus();
      console.log(`Total CPUs: ${cpus.length}`);
      cpus.forEach((c, i) => {
        const ghz = (c.speed / 1000).toFixed(2);
        console.log(`CPU ${i + 1}: ${c.model.trim()}, ${ghz} GHz`);
      });
      break;
    }
    case "--homedir":
      console.log(os.homedir());
      break;
    case "--username":
      try {
        console.log(os.userInfo().username);
      } catch {
        console.log("Operation failed");
      }
      break;
    case "--architecture":
      console.log(process.arch);
      break;
    default:
      throw new Error("Invalid input");
  }
};
