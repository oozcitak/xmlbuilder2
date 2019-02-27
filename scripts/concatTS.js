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
 *   4. Removes all import directives:
 *       - import { Node } from "./Node"; -> entire line is removed
 *   5. Saves the resulting string under `outputFile`.
 */

const path = require("path");
const fs = require("fs");
const options = require('../package.json').concatTS;

const ConcatTS = class ConcatTS {
  constructor(options) {
    this.options = options;
  }

  // Returns an array of input files in the `sourceDir` directory
  getFiles(sourceDir, options) {
    const files = fs.readdirSync(sourceDir).filter(name =>
      name.endsWith('.ts') ||
      name.endsWith('.tsx')
    );

    files.sort(function (x, y) {
      let ix = (options.order ? options.order.indexOf(x) : -1);
      let iy = (options.order ? options.order.indexOf(y) : -1);

      if (ix === -1 && iy === -1)
        return x.localeCompare(y);
      else if (ix === -1)
        return 1;
      else if (iy === -1)
        return -1;
      else
        return (ix == iy ? 0 : ix < iy ? -1 : 1);
    });

    return files;
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
    const packageFile = path.resolve(__dirname, '..', 'package.json');
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

  // Returs the current date string.
  dateString()
  {
    const date = new Date();
    const year = date.getFullYear().toString();
    const month = this.padStr((date.getMonth() + 1).toString());
    const day = this.padStr(date.getDate().toString());
    return [ year, month, day].join('.');
  }

  // Returs the current time string.
  timeString()
  {
    const date = new Date();
    const hour = this.padStr(date.getHours().toString());
    const minute = this.padStr(date.getMinutes().toString());
    const second = this.padStr(date.getSeconds().toString());
    return [hour, minute, second].join(':');
  }

  padStr(str)
  {
    const len = str.length
    if(len == 0)
      return '00';
    else if (len == 1)
      return '0' + str;
    else
      return str;
  }

  // Processes all input entries
  run() {
    for (let entry of this.options)
      this.processDir(entry);
  }

  // Processes `entry`
  processDir(entry) {
    if (!entry || !entry.sourceDir)
      throw new Error("Please specify source directory in package.json.");

    if (!entry || !entry.outputFile)
      throw new Error("Please specify an output filename in package.json.");

    // list all TypeScript files in the `sourceDir` directory
    const absSourceDir = path.resolve(__dirname, '..', entry.sourceDir);
    if (!fs.existsSync(absSourceDir))
      throw new Error(`Source directory ${entry.sourceDir} (${absSourceDir}) does not exist.`);

    const sourceFiles = this.getFiles(absSourceDir, entry);
    const absSourceFiles = [];
    for (const file of sourceFiles) {
      const absSourceFile = path.resolve(absSourceDir, file);
      absSourceFiles.push(absSourceFile);
    }

    // process and output each file
    const absOutputFile = path.resolve(__dirname, '..', entry.outputFile);
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
    for (let i = 0; i < sourceFiles.length; i++) {
      const file = sourceFiles[i];
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
