import { createCB } from "../lib"
import { resolve } from "path"
import { createWriteStream, unlink } from "fs"
import { memoryUsage, hrtime } from "process"
import chalk from "chalk"

(async function () {
  const filename = resolve(__dirname, 'stream-perf.log')
  const outFile = createWriteStream(filename)

  const xmlStream = createCB({
    data: (chunk) => outFile.write(chunk),
    end: () => {
      outFile.close()
      unlink(filename, () => { })
    },
    error: (err) => { throw err },
    prettyPrint: true
  })

  console.log(`${chalk.bold.underline(`Callback API Benchmark`)}`)
  let maxMem = 0
  const t0 = hrtime.bigint()
  outFile.on("close", () => {
    const t2 = hrtime.bigint()
    console.log("Completed writing to disk in " + (Number(t2 - t1) / 1000000).toFixed(0) + " ms")
    console.log("Maximum heap memory used is " + (maxMem / 1024 / 1024).toFixed(2) + " MB")
  })

  xmlStream.ele("root")
  for (let n = 0; n < 10; n++) {
    const heap = memoryUsage().heapUsed
    if (heap > maxMem) maxMem = heap
    const mem = (heap / 1024 / 1024).toFixed(2)
    console.log(`  ${n + 1}: ${mem} MB`)
    xmlStream.ele("node").att("id", n.toString())
    for (let i = 0; i < 10000; i++) {
      xmlStream.ele("foo").att("id", i.toString()).txt("lorem ipsum").up()
    }
    xmlStream.up()
  }
  xmlStream.end()
  const t1 = hrtime.bigint()
  console.log("Completed serialization in " + (Number(t1 - t0) / 1000000).toFixed(0) + " ms")
})()
