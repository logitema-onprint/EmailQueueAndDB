import chokidar from "chokidar";
import path from "path";
import fs from "fs";
import log from "../utils/logger";
import { processJsonFile } from "./processJsonFile";

const HOTFOLDER_PATH = path.resolve("hotfolder");
const PROCESSED_PATH = path.resolve(process.cwd(), "hotfolder/processed");
const ERROR_PATH = path.resolve(process.cwd(), "hotfolder/error");

const fileQueue: string[] = [];
let isProcessing = false;

function ensureDirectoryExist() {
  [HOTFOLDER_PATH, PROCESSED_PATH, ERROR_PATH].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      log.info(`Created directory: ${dir}`);
    }
  });
}

async function processFileQueue() {
  if (isProcessing || fileQueue.length === 0) return;

  isProcessing = true;
  const filePath = fileQueue.shift()!;
  const fileName = path.basename(filePath);

  log.info(`Processing file from queue: ${fileName}`);

  try {
    if (!fs.existsSync(filePath)) {
      log.warn(`File no longer exists: ${fileName}, skipping processing`);
      isProcessing = false;
      processFileQueue(); 
      return;
    }

    if (fileName.endsWith(".json")) {
      const success = await processJsonFile(filePath);
      if (!success) {
        throw new Error("JSON processing failed");
      }
    }

    if (fs.existsSync(filePath)) {
      const destinationPath = path.join(PROCESSED_PATH, fileName);
      fs.renameSync(filePath, destinationPath);
      log.info(`Successfully processed and moved file to: ${destinationPath}`);
    } else {
      log.warn(`File disappeared after processing: ${fileName}`);
    }
  } catch (error) {
    log.error(`Error processing file ${fileName}: ${error}`);

    try {
      if (fs.existsSync(filePath)) {
        const errorPath = path.join(ERROR_PATH, fileName);
        fs.renameSync(filePath, errorPath);
        log.error(`Moved file to error folder: ${errorPath}`);
      } else {
        log.warn(`Cannot move non-existent file to error folder: ${fileName}`);
      }
    } catch (moveError) {
      log.error(`Failed to move file to error folder: ${moveError}`);
    }
  } finally {
    isProcessing = false;
    setTimeout(() => processFileQueue(), 100);
  }
}

function initHotfolder() {
  ensureDirectoryExist();

  const watcher = chokidar.watch(HOTFOLDER_PATH, {
    ignored: [/(^|[/\\])\../, "**/processed/**", "**/error/**"],
    persistent: true,
    depth: 0,
    awaitWriteFinish: {
      stabilityThreshold: 2000,
      pollInterval: 100
    }
  });

  watcher
    .on("add", (filePath: string) => {
      const fileName = path.basename(filePath);
      log.info(`New file detected: ${fileName}`);

      if (!fileQueue.includes(filePath)) {
        fileQueue.push(filePath);
        processFileQueue();
      }
    })
    .on("unlink", (filePath: string) => {
      const index = fileQueue.indexOf(filePath);
      if (index !== -1) {
        fileQueue.splice(index, 1);
        log.info(`Removed deleted file from queue: ${path.basename(filePath)}`);
      }
    })
    .on("error", (error: unknown) => log.error(`Watcher error: ${error}`));

  log.info(`Hotfolder watcher initialized at: ${HOTFOLDER_PATH}`);
  return watcher;
}

export default initHotfolder;