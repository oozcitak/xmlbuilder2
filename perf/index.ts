import chalk from "chalk"
import { existsSync, closeSync, openSync, readFileSync, writeFileSync } from "fs"
import { join } from "path"
import { execSync } from "child_process"

export function processBenchmark(suite: any, baseCase: string): void {
  const items: any[] = []
  suite.forEach((item: any) => { items.push(item) })
  items.sort((a, b) => a.hz > b.hz ? -1 : a.hz < b.hz ? 1 : 0)

  const fastest = items[0]
  const slowest = items[items.length - 1]

  let len = 0
  items.forEach((item: any) => len = Math.max(len, item.name.length as number))

  const perfCase: PerfCase = { }
  items.forEach((item: any) => perfCase[item.name] = item.hz)

  const suiteName: string = suite.name

  console.log(`${chalk.bold.underline(`Benchmark: ${suiteName}`)}`)

  // print current suite cases
  for (const caseName in perfCase) {
    const hz = perfCase[caseName]
    let name = ""
    let comp = ""
    if (caseName === fastest.name) {
       name = chalk.bold.green(caseName.padEnd(len))
    } else if (caseName === slowest.name) {
      name = chalk.bold.red(caseName.padEnd(len))
      comp = ` (${fastest.name} is ${((fastest.hz / hz)).toFixed(2)} times faster)`
    } else {
      name = chalk.bold(caseName.padEnd(len))
      comp = ` (${fastest.name} is ${((fastest.hz / hz)).toFixed(2)} times faster)`
    }
    console.log(`  • ${name} ${hz.toFixed(2)} ops/sec${comp}`)
  }

  // find previous suite
  const perfList = readPerfList()
  const prev = findPrevious(suiteName, baseCase, perfList)
  const baseHz = perfCase[baseCase]
  if (prev !== null) {
    if (prev[1] < baseHz) {
      console.log(`  ${baseCase} improved ${chalk.bold.green((((baseHz - prev[1]) / prev[1] * 100)).toFixed(2) + "%")} from v${prev[0]}`)
    } else if (prev[1] > baseHz) {
      console.log(`  ${baseCase} regressed ${chalk.bold.red((((prev[1] - baseHz) / prev[1] * 100)).toFixed(2) + "%")} from v${prev[0]}`)      
    } else {
      console.log(`  ${baseCase} same with v${prev[0]}`)      
    }
  }

  // save result
  const version = currentVersion()
  const perfSuite: PerfSuite = perfList[version] || { }
  perfSuite[suiteName] = perfCase
  perfList[version] = perfSuite
  savePerf(perfList)
}

type PerfList = { [key: string]: PerfSuite }
type PerfSuite = { [key: string]: PerfCase }
type PerfCase = { [key: string]: number }
type Version = [number, number, number, boolean]

const readPerfList = function(): PerfList {
  const perfFile = join(__dirname, './perf.list')

  if (!existsSync(perfFile)) {
    closeSync(openSync(perfFile, 'w'))
  }
  const str = readFileSync(perfFile, 'utf8')
  if (str) {
    return JSON.parse(str)
  } else {
    return {}
  }
}

const savePerf = function(perfObj: PerfList): void {
  const perfFile = join(__dirname, './perf.list')
  writeFileSync(perfFile, JSON.stringify(perfObj, null, 2), 'utf-8')
}

const gitWorking = function(): boolean {
  const version = require('../package.json').version  
  const commitMessage = execSync("git log -1 HEAD --pretty=format:%s").toString()
  if (version !== commitMessage) return true
  const diff = execSync("git diff --name-only").toString()
  if (diff === "" || diff.includes("perf/perf.list")) return false
  return true
}


const currentVersion = function(): string {
  let version = require('../package.json').version
  const working = gitWorking()
  if (working) {
    version = version + "*"
  }
  return version
}

const findPrevious = function(suiteName: string, caseName: string, perfObj: PerfList): [string, number] | null {
  const version = currentVersion()
  let closestVersion = "0.0.0"
  let closestMetric = 0
  let found = false
  for (const ver in perfObj) {
    if (compareVersion(ver, version) !== -1) continue
    if (compareVersion(ver, closestVersion) !== 1) continue
    const suite = perfObj[ver][suiteName]
    if (suite === undefined) continue
    for (const key in suite) {
      if (key === caseName) {
        found = true
        closestVersion = ver
        closestMetric = suite[key]
      }
    }
  }
  return found ? [closestVersion, closestMetric] : null
}

const parseVersion = function(version: string): Version {
  const isDirty = version[version.length - 1] === "*"
  if (isDirty) {
    version = version.substr(0, version.length - 1)
  }
  const v = version.split('.')
  return [parseInt(v[0]), parseInt(v[1]), parseInt(v[2]), isDirty]
}

const compareVersion = function(ver1: string, ver2: string): number {
  const v1 = parseVersion(ver1)
  const v2 = parseVersion(ver2)
  if (v1[0] < v2[0]) {
    return -1
  } else if (v1[0] > v2[0]) {
    return 1 // v1[0] = v2[0]
  } else {
    if (v1[1] < v2[1]) {
      return -1
    } else if (v1[1] > v2[1]) {
      return 1 // v1[1] = v2[1]
    } else {
      if (v1[2] < v2[2]) {
        return -1
      } else if (v1[2] > v2[2]) {
        return 1 // v1[2] = v2[2]
      } else {
        if (v1[3] && !v2[3]) {
          return 1
        } else if (v2[3] && !v1[3]) {
          return -1
        } else {
          return 0
        }
      }
    }
  }
}
