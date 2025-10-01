import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix for ES modules to get __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Project root directory (two levels up from src/tools)
const ROOT_DIR = path.resolve(__dirname, '..', '..');

// File extensions to include
const INCLUDE_EXTENSIONS = ['.tsx', '.ts', '.js', '.jsx'];

// Source directory to collect all files from
const SRC_DIR = path.join(ROOT_DIR, 'src');

/**
 * Get all files recursively from a directory with included extensions
 */
function getFilesRecursively(dir) {
  let files = [];
  try {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        files = files.concat(getFilesRecursively(fullPath));
      } else if (stat.isFile()) {
        const ext = path.extname(item).toLowerCase();
        if (INCLUDE_EXTENSIONS.includes(ext)) {
          files.push(fullPath);
        }
      }
    }
  } catch (error) {
    console.warn(`Error reading directory ${dir}: ${error.message}`);
  }
  return files;
}

/**
 * Collect all files from the src directory
 */
function collectAllSrcFiles() {
  if (!fs.existsSync(SRC_DIR)) {
    console.warn(`Source directory does not exist: ${SRC_DIR}`);
    return [];
  }
  return getFilesRecursively(SRC_DIR);
}

/**
 * Combine all src files into one output file
 */
function combineAllSrcFiles() {
  try {
    const files = collectAllSrcFiles();

    if (files.length === 0) {
      console.log('No files found in src directory with specified extensions.');
      return;
    }

    let combinedContent = '';
    console.log('Combining the following files from src:');
    for (const filePath of files) {
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const relativePath = path.relative(ROOT_DIR, filePath);
        console.log(`- ${relativePath}`);
        combinedContent += `\n/* ===== ${relativePath} ===== */\n`;
        combinedContent += content + '\n';
      } catch (error) {
        console.warn(`Skipping ${filePath}: ${error.message}`);
      }
    }

    if (combinedContent) {
      const outputPath = path.join(__dirname, 'output-combined-src-files.txt');
      fs.writeFileSync(outputPath, combinedContent.trim(), 'utf-8');
      console.log(`✅ Combined ${files.length} files => ${outputPath}`);
    } else {
      console.log('No content to write. All provided files were skipped.');
    }
  } catch (error) {
    console.error('Error combining src files:', error.message);
  }
}

combineAllSrcFiles();

/**
 * 실행 명령어:
 * node src/tools/combine-all-src-files.js
 */