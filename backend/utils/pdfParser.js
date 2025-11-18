// utils/pdfParser.js
/**
 * This module uses createRequire to import the CommonJS package cleanly from ESM.
 */
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");
import fs from "fs";

export async function extractTextFromPdf(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(dataBuffer);
  return data.text || "";
}
