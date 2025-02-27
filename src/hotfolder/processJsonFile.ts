import fs from 'fs';
import path from 'path';
import log from '../utils/logger';

export async function processJsonFile(filePath: string): Promise<boolean> {
    const fileName = path.basename(filePath);

    try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const jsonData = JSON.parse(fileContent);

        log.info(`Processing JSON data from file: ${fileName}`);
        log.info(`JSON keys found: ${Object.keys(jsonData).join(', ')}`);

        return true;
    } catch (error) {
        log.error(`Error processing JSON file ${fileName}: ${error}`);
        return false;
    }
}