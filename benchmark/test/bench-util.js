import { readdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { bench, group, summary, compact, do_not_optimize } from 'mitata';

const formatFilename = function (name) {
  return name?.split('.')?.[0]?.replaceAll(/[-_]/g, ' ') ?? '';
}

const isTestFile = function (name) {
  const parts = name?.split('.') ?? [];
  return parts[1]?.localeCompare('bench', undefined, { sensitivity: 'base' }) === 0 && parts[2]?.localeCompare('js', undefined, { sensitivity: 'base' }) === 0;
}

async function getBenchMarks () {
    const benchmarks = [];
    const testFolderPath = resolve(import.meta.dirname);
    const tests = await readdir(testFolderPath, { withFileTypes: true });
    for (const test of tests) {
      if (!test.isDirectory()) continue;
      const benchmarkItems = [];
      const folderPath = join(testFolderPath, test.name);
      const files = await readdir(folderPath, { withFileTypes: true });
      for (const file of files) {
        if (!file.isFile() || !isTestFile(file.name)) continue;
        const filePath = join(folderPath, file.name);
        const benchFunc = (await import(filePath)).default;
        benchmarkItems.push({ name: formatFilename(file.name), test: benchFunc });
      }
      benchmarkItems.sort((a, b) => a.name.localeCompare(b.name));
      benchmarks.push({ name: formatFilename(test.name), items: benchmarkItems });
    }
    benchmarks.sort((a, b) => a.name.localeCompare(b.name));
    return benchmarks;
}

export async function configureBenchMarks () {
  const benchmarks = await getBenchMarks();

  compact(() => {
    for (const benchGroup of benchmarks) {
      group(benchGroup.name, () => {
        summary(() => {
          for (const benchItem of benchGroup.items) {
            bench(benchItem.name, () => do_not_optimize(benchItem.test()));
          }
        });
      });
    }
  });
}