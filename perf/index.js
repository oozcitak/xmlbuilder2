const git = require('git-state');
const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');

global.perf = function(description, count, func, funcBase) {
  const averageTime = runPerfCase(count, func);
  let baseTime = undefined
  if (funcBase) {
    baseTime = runPerfCase(count, funcBase);
  }
  let version = require('../package.json').version;
  const working = gitWorking(gitDir);
  if (working) {
    version = version + "*";
  }
  if (!perfObj[version]) {
    perfObj[version] = {};
  }
  if (baseTime === this.undefined)
    perfObj[version][description] = [averageTime.toFixed(4)];
  else
  perfObj[version][description] = [averageTime.toFixed(4), baseTime.toFixed(4)];
};

const runPerfCase = function(count, func) {
  let totalTime = 0;
  for (let i = 0; i< count; i++) {
    const startTime = performance.now();
    func();
    const endTime = performance.now();
    totalTime += endTime - startTime;
  }
  return totalTime / count;
};

const readPerf = function(filename) {
  if (!fs.existsSync(filename)) {
    fs.closeSync(fs.openSync(filename, 'w'));
  }
  const str = fs.readFileSync(filename, 'utf8');
  if (str) {
    return JSON.parse(str);
  } else {
    return {};
  }
};

const runPerf = function(dirPath) {
  for (const file of walkDir(dirPath)) {
    const filename = path.basename(file);
    if (filename === "index.js" || filename === "perf.list") {
      continue;
    }
    require(file);
  }
};

const walkDir = function*(dirPath) {
  for (const file of fs.readdirSync(dirPath)) {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);
    if (stat.isFile()) {
      yield filePath;
    } else if (stat.isDirectory()) {
      yield* walkDir(filePath);
    }
  }
};

const gitWorking = function(dirPath) {
  return git.isGitSync(dirPath) && git.dirtySync(dirPath);
};

const printPerf = function(perfObj) {
  const sorted = sortByVersion(perfObj);
  
  for (const sortedItems of sorted) {
    const version = sortedItems.version;
    const items = sortedItems.item;
    const sortedItem = sortByDesc(items);
    if (parseVersion(version)[3]) {
      console.log("\x1b[4mv%s (Working Tree):\x1b[0m", version);
    } else {
      console.log("\x1b[4mv%s:\x1b[0m", version);
    }
    let longestDescription = 0;
    for (let k = 0; k < sortedItem.length; k++) {
      const item = sortedItem[k];
      const descriptionLength = item.description.length;
      if (descriptionLength > longestDescription) {
        longestDescription = descriptionLength;
      }
    }
    for (let l = 0; l < sortedItem.length; l++) {
      const item = sortedItem[l];
      const description = item.description;
      const times = item.times;
      const averageTime = times[0];
      const baseTime = times[1];
      const prevItem = findPrevPerf(sorted, version, description);
      if (prevItem) {
        const prevTime = prevItem.item[description][0];
        if (averageTime < prevTime) {
          console.log("  - \x1b[36m%s\x1b[0m \x1b[1m\x1b[32m%s\x1b[0m ms (v%s was \x1b[1m%s\x1b[0m ms, -\x1b[1m%s\x1b[0m%) %s", padRight(description, longestDescription), averageTime, prevItem.version, prevTime, (-100 * (averageTime - prevTime) / prevTime).toFixed(0), baseTime === undefined ? "" : averageTime + " ms / " + baseTime + " ms");
        } else if (averageTime > prevTime) {
          console.log("  - \x1b[36m%s\x1b[0m \x1b[1m\x1b[31m%s\x1b[0m ms (v%s was \x1b[1m%s\x1b[0m ms, +\x1b[1m%s\x1b[0m%) %s", padRight(description, longestDescription), averageTime, prevItem.version, prevTime, (100 * (averageTime - prevTime) / prevTime).toFixed(0), baseTime === undefined ? "" : averageTime + " ms / " + baseTime + " ms");
        } else {
          console.log("  - \x1b[36m%s\x1b[0m \x1b[1m%s\x1b[0m ms (v%s was \x1b[1m%s\x1b[0m ms,  \x1b[1m%s\x1b[0m%) %s", padRight(description, longestDescription), averageTime, prevItem.version, prevTime, (100 * (averageTime - prevTime) / prevTime).toFixed(0), baseTime === undefined ? "" : averageTime + " ms / " + baseTime + " ms");
        }
      } else {
        console.log("  - \x1b[36m%s\x1b[0m \x1b[1m%s\x1b[0m ms (no previous result) %s", padRight(description, longestDescription), averageTime, baseTime === undefined ? "" : averageTime + " ms / " + baseTime + " ms");
      }
    }
  }
};

const padRight = function(str, len) {
  return str + " ".repeat(len - str.length);
};

const writePerf = function(filename, perfObj) {
  const writePerfObj = {};
  for (const version in perfObj) {
    const items = perfObj[version];
    if (!parseVersion(version)[3]) {
      writePerfObj[version] = items;
    }
  }
  fs.writeFileSync(filename, JSON.stringify(writePerfObj, null, 2), 'utf-8');
};

const findPrevPerf = function(sorted, version, description) {
  let prev = undefined
  for (const item of sorted) {
    if (compareVersion(item.version, version) === -1) {
      if (item.item[description]) {
        prev = item;
      }
    }
  }
  return prev;
};

const sortByVersion = function(perfObj) {
  const sorted = [];
  for (version in perfObj) {
    const items = perfObj[version];
    sorted.push({
      version: version,
      item: items
    });
  }
  return sorted.sort(
    (item1, item2) => compareVersion(item1.version, item2.version)
  );
};

const sortByDesc = function(item) {
  const sorted = [];
  for (description in item) {
    const times = item[description];
    sorted.push({
      description: description,
      times: times
    });
  }
  return sorted.sort(
    (item1, item2) => (item1.description < item2.description ? -1 : 1)
  );
};

const parseVersion = function(version) {
  const isDirty = version[version.length - 1] === "*";
  if (isDirty) {
    version = version.substr(0, version.length - 1);
  }
  const v = version.split('.');
  v.push(isDirty);
  return v;
};

const compareVersion = function(v1, v2) {
  v1 = parseVersion(v1);
  v2 = parseVersion(v2);
  if (v1[0] < v2[0]) {
    return -1;
  } else if (v1[0] > v2[0]) {
    return 1; // v1[0] = v2[0]
  } else {
    if (v1[1] < v2[1]) {
      return -1;
    } else if (v1[1] > v2[1]) {
      return 1; // v1[1] = v2[1]
    } else {
      if (v1[2] < v2[2]) {
        return -1;
      } else if (v1[2] > v2[2]) {
        return 1; // v1[2] = v2[2]
      } else {
        if (v1[3] && !v2[3]) {
          return 1;
        } else if (v2[3] && !v1[3]) {
          return -1;
        } else {
          return 0;
        }
      }
    }
  }
};

const perfDir = __dirname;
const gitDir = path.resolve(__dirname, '..');
const perfFile = path.join(perfDir, './perf.list');
const perfObj = readPerf(perfFile);

runPerf(perfDir);
printPerf(perfObj);
writePerf(perfFile, perfObj);
