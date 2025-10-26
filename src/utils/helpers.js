import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import moment from 'moment';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function loadJSON(fileName) {
  const filePath = path.join(__dirname, '../../data', fileName);
  try {
    const data = await readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading or parsing JSON file:', error);
  }
}

export function formatDate(dateStr) {
  return moment(dateStr, "DD/MM/YYYY HH:mm:ss").format("Do MMMM YYYY hh:mm A");
}
