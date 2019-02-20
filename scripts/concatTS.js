/*
 * This script concatenate all files to workaround the circular
 * module dependencies problem. 
 * 
 * The script applies the following steps:
 * 
 *   1. Lists all TypeScript files in the `sourceDir` directory (files
 *      that end with *.tsx?).
 *   2. Sorts the files by their name in alphabetical order.
 *   3. Concatenates all files.
 *   4. Removes all internal import and export directives:
 *       - import { Node } from "Node"; -> entire line is removed
 *       - export * from './Node'; -> entire line is removed
 *       - export class .* -> export keyword is removed
 *   5. Saves the resulting string under `outFile`.
 */

const fs = require("fs");
const readline = require('readline');
const options = require('../package.json').concatTS;

const ConcatTS = class ConcatTS {
  constructor(options) {
    this.options = options;
  }

  // Returns an array of input files in the `sourceDir` directory
  getFiles(sourceDir) {
    const files = fs.readdirSync(sourceDir).filter(name =>
      name.endsWith('.ts') ||
      name.endsWith('.tsx')
    );

    files.sort();

    return files;
  }

  // Replaces the contents of a line of source
  replaceContent(line, removeExports) {
    // import { Node } from "Node"; -> entire line is removed
    line = line.replace(
      /^\s*import\s*{\s*(.*)\s*}\s*from\s*["'].*["'].*$/,
      '// $&');
    if (removeExports) {
      // export * from './Node'; -> entire line is removed
      line = line.replace(
        /^\s*export\s*\*\s*from\s*["'].*["'].*$/,
        '// $&');
      // export class .* -> export keyword is removed
      line = line.replace(
        /^(\s*)(export)(\s*(abstract)?\s*class\s*.*)/,
        '$1/* $2 */$3');
    }

    return line;
  }

  // Processes all input entries
  run() {
    for (let entry of this.options)
      this.processDir(entry)
  }

  // Processes `entry`
  processDir(entry) {
    if (!entry || !entry.sourceDir)
      throw new Error("Please specify source directory in package.json.");

    if (!entry || !entry.outputFile)
      throw new Error("Please specify an output filename in package.json.");

    // list all TypeScript files in the `sourceDir` directory
    const files = this.getFiles(entry.sourceDir);

    // process and output each file
    const outFile = fs.createWriteStream(entry.outputFile);

    for (const file of files) {
      const rl = readline.createInterface({
        input: fs.createReadStream(file),
        output: outFile,
        crlfDelay: Infinity
      });

      output.write('// ' + '-'.repeat(file.length));
      output.write('// ' + file);
      output.write('// ' + '-'.repeat(file.length));

      rl.on('line', (line) => {
        const newline = replaceContent(line, removeExports);
        output.write(newline);
      });

      rl.on('end', () => {
        rl.close();
      });
    }

    outFile.close();
  }
}

const concatTS = new ConcatTS(options);
concatTS.run();
