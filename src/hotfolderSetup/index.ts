import chokidar from "chokidar";
import path from "path";
import fs from "fs";
import log from "../utils/logger";
import { processJsonFile } from "./processJsonFile";

const HOTFOLDER_PATH = path.resolve("hotfolder");
const PROCESSED_PATH = path.resolve(process.cwd(), "hotfolder/processed");
const ERROR_PATH = path.resolve(process.cwd(), "hotfolder/error");

function ensureDirectoryExist() {
  [HOTFOLDER_PATH, PROCESSED_PATH, ERROR_PATH].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      log.info(`Created directory: ${dir}`);
    }
  });
}

async function processNewFile(filePath: string) {
  const fileName = path.basename(filePath);

  log.info(`New file detected: ${fileName}`);

  try {
    await new Promise((resolve) => setTimeout(resolve, 5000));

    if (fileName.endsWith(".json")) {
      const success = await processJsonFile(filePath);
      if (!success) {
        throw new Error("JSON processing failed");
      }
    }

    const destinationPath = path.join(PROCESSED_PATH, fileName);
    fs.renameSync(filePath, destinationPath);
    log.info(`Successfully processed and moved file to: ${destinationPath}`);
  } catch (error) {
    log.error(`Error processing file ${fileName}: ${error}`);
    const errorPath = path.join(ERROR_PATH, fileName);
    fs.renameSync(filePath, errorPath);
    log.error(`Moved file to error folder: ${errorPath}`);
  }
}

function initHotfolder() {
  ensureDirectoryExist();

  const watcher = chokidar.watch(HOTFOLDER_PATH, {
    ignored: [/(^|[/\\])\../, "**/processed/**", "**/error/**"],
    persistent: true,
    depth: 0,
  });

  watcher
    .on("add", (filePath: string) => processNewFile(filePath))
    .on("error", (error: unknown) => log.error(`Watcher error: ${error}`));

  log.info(`Hotfolder watcher initialized at: ${HOTFOLDER_PATH}`);
  return watcher;
}

export default initHotfolder;
