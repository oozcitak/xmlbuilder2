import { create as create2 } from "../lib"
import { create } from "xmlbuilder"
import { Suite } from "benchmark"
import { processBenchmark, benchmarkTitle } from "./"
import { join } from "path"
import { readFileSync } from "fs"

(function () {
  benchmarkTitle("dom")
})();

function createSmallDoc() {
  const root = create('root')
  for (let i = 0; i < 100; i++) {
    root.ele('node')
      .ele('node1-1', {att1: "val1", att2: "val2" }, "text")
      .ele('node1-2')
  }
  return root
}

function createSmallDoc2() {
  const root = create2().ele('root')
  for (let i = 0; i < 100; i++) {
    root.ele('node')
      .ele('node1-1', {att1: "val1", att2: "val2" }).txt("text")
      .ele('node1-2')
  }
  return root
}

function createMediumDoc(): any {
  const root = create('root')
  for (let i = 0; i < 10000; i++) {
    root.ele('node')
      .ele('node1-1', {att1: "val1", att2: "val2" }, "text")
      .ele('node1-2')
  }
  return root
}

function createMediumDoc2(): any {
  const root = create2().ele('root')
  for (let i = 0; i < 10000; i++) {
    root.ele('node')
      .ele('node1-1', {att1: "val1", att2: "val2" }).txt("text")
      .ele('node1-2')
  }
  return root
}

(function () {
  const suite = new Suite("small document with ele()")
   
  suite.add("xmlbuilder", () => createSmallDoc())
  suite.add("xmlbuilder2", () => createSmallDoc2())

  suite.on("complete", () => processBenchmark(suite, "xmlbuilder2"))
  suite.run()

})();

(function () {
  const suite = new Suite("medium document with ele()")
   
  suite.add("xmlbuilder", () => createMediumDoc())
  suite.add("xmlbuilder2", () => createMediumDoc2())

  suite.on("complete", () => processBenchmark(suite, "xmlbuilder2"))
  suite.run()

})();

const filename = join(__dirname, "./assets/small.json");
const str = readFileSync(filename, 'utf8');
const smallObj = JSON.parse(str);

(function () {
  const suite = new Suite("convert small JS object")
   
  suite.add("xmlbuilder", () => create("root").ele(smallObj))
  suite.add("xmlbuilder2", () => create2().ele("root").ele(smallObj))

  suite.on("complete", () => processBenchmark(suite, "xmlbuilder2"))
  suite.run()

})();

(function () {
  const suite = new Suite("serialize small document to XML string")
  
  const doc = create("root").ele(smallObj).doc()
  const doc2 = create2().ele("root").ele(smallObj).doc()

  suite.add("xmlbuilder", () => doc.end({ pretty: true }))
  suite.add("xmlbuilder2", () => doc2.end({ prettyPrint: true }))

  suite.on("complete", () => processBenchmark(suite, "xmlbuilder2"))
  suite.run()

})();

(function () {
  const suite = new Suite("serialize medium document to XML string")
  
  const doc = createMediumDoc().doc()
  const doc2 = createMediumDoc2().doc()

  suite.add("xmlbuilder", () => doc.end({ pretty: true }))
  suite.add("xmlbuilder2", () => doc2.end({ prettyPrint: true }))

  suite.on("complete", () => processBenchmark(suite, "xmlbuilder2"))
  suite.run()

})();