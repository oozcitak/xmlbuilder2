/*
 * This script concatenate all files to workaround the circular
 * module dependencies problem. 
 * 
 * The script applies the following steps:
 * 
 *   1. Lists all files matching each item of `inputFiles`
 *   2. Sorts the files by their name in alphabetical order.
 *   3. Concatenates all files.
 *   4. Removes all import directives:
 *       - import { Node } from "./Node"; -> entire line is removed
 *   5. Saves the resulting string under `outputFile`.
 */

const path = require("path");
const fs = require("fs");
const glob = require("glob");
const options = require('../package.json')['concat-ts'];

const ConcatTS = class ConcatTS {
  constructor(options) {
    this.options = options;
  }

  // Returns an array of all input files
  getFiles(inputFiles) {
    let allFiles = [];
    for (const pattern of inputFiles) {
      const files = this.getFilesForPattern(pattern);
      allFiles = allFiles.concat(files);
    }
    return Array.from(new Set(allFiles));
  }

  // Returns an array of input files matching `filenamePattern`
  getFilesForPattern(filenamePattern) {
    const filename = filenamePattern;
    if (fs.existsSync(filename)) {
      return [filename];
    } else {
      let list = glob.sync(filenamePattern);
      list.sort(function (x, y) {
        return x.localeCompare(y);
      });
      return list;
    }
  }

  // Replaces the contents of source
  replaceContent(source, options) {
    if (options.removeImports) {
      // import { Node } from "./Node"; -> entire line is removed
      source = source.replace(
        /import\s*{[^{}]*}\s*from\s*["']\..*["']\s*;?/g,
        options.deleteText ? '' : '/* $& */');
    }

    return source;
  }

  // Returns true if any of the source files were modified after the
  // output file was last produced. Otherwise returns false.
  checkModified(output, files) {
    if (!fs.existsSync(output)) return true;

    const outputTime = fs.statSync(output).mtimeMs;

    // check package.json
    const packageFile = 'package.json';
    const packageTime = fs.statSync(packageFile).mtimeMs;
    if (outputTime < packageTime)
      return true;

    // check files
    for (const file of files) {
      const sourceTime = fs.statSync(file).mtimeMs;
      if (outputTime < sourceTime)
        return true;
    }

    return false;
  }

  // Returns the current date string.
  dateString() {
    const date = new Date();
    const year = date.getFullYear().toString();
    const month = this.padStr((date.getMonth() + 1).toString());
    const day = this.padStr(date.getDate().toString());
    return [year, month, day].join('.');
  }

  // Returns the current time string.
  timeString() {
    const date = new Date();
    const hour = this.padStr(date.getHours().toString());
    const minute = this.padStr(date.getMinutes().toString());
    const second = this.padStr(date.getSeconds().toString());
    return [hour, minute, second].join(':');
  }

  padStr(str) {
    const len = str.length
    if (len == 0)
      return '00';
    else if (len == 1)
      return '0' + str;
    else
      return str;
  }

  // Processes all input entries
  run() {
    const cwd = process.cwd();
    process.chdir(path.resolve(__dirname, '..'));
    for (let entry of this.options)
      this.processEntry(entry);
    process.chdir(cwd);
  }

  // Processes `entry`
  processEntry(entry) {
    if (!entry || !entry.inputFiles)
      throw new Error("Please specify input files in package.json.");

    if (!entry || !entry.outputFile)
      throw new Error("Please specify an output filename in package.json.");

    // list all TypeScript files in the `sourceDir` directory
    const absSourceFiles = this.getFiles(entry.inputFiles);

    // process and output each file
    const absOutputFile = entry.outputFile;
    const absOutputDir = path.dirname(absOutputFile);

    // ensure that any of the source files are modified after the
    // output file was last produced. otherwise exit.
    if (!this.checkModified(absOutputFile, absSourceFiles))
      return;

    // create folder and open output stream
    fs.mkdirSync(absOutputDir, { recursive: true });
    const outputStream = fs.createWriteStream(absOutputFile);

    const runStart = Date.now();

    // process each file
    for (let i = 0; i < absSourceFiles.length; i++) {
      const file = path.basename(absSourceFiles[i]);
      const absSourceFile = absSourceFiles[i];
      if (!fs.existsSync(absSourceFile))
        throw new Error(`Source file ${file} (${absSourceFile}) does not exist.`);

      // header
      outputStream.write('\n\n');
      outputStream.write('// ' + '-'.repeat(70) + '\n');
      outputStream.write('// ' + file.toUpperCase() + '\n');
      outputStream.write('// ' + '='.repeat(file.length) + '\n');
      outputStream.write('// ' + absSourceFile + '\n');
      outputStream.write('// ' + '-'.repeat(70) + '\n');
      outputStream.write('\n\n');

      // replace
      const sourceStr = fs.readFileSync(absSourceFile).toString();
      const outputStr = this.replaceContent(sourceStr, entry);
      outputStream.write(outputStr);
    }

    const runEnd = Date.now();
    outputStream.write('\n\n// Generated on ' + this.dateString() +
      ' at ' + this.timeString() +
      ' in ' + ((runEnd - runStart) / 1000).toFixed(2) + " seconds");

    outputStream.close();
  }
}

const concatTS = new ConcatTS(options);
concatTS.run();
