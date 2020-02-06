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
  const node1 = root.ele('node1')
  node1.ele('node1-1', {att1: "val1", att2: "val2" }, "text")
  node1.ele('node1-2')
  const node2 = root.ele('node2')
  node2.ele('node2-1', {att1: "val1", att2: "val2" }, "text")
  node2.ele('node2-2')
  node2.ele('node2-3')
}

function createSmallDoc2() {
  const root = create2().ele('root')
  const node1 = root.ele('node1')
  node1.ele('node1-1', {att1: "val1", att2: "val2" }).txt("text")
  node1.ele('node1-2')
  const node2 = root.ele('node2')
  node2.ele('node2-1', {att1: "val1", att2: "val2" }).txt("text")
  node2.ele('node2-2')
  node2.ele('node2-3')
}

(function () {
  const suite = new Suite("small document with ele()")
   
  suite.add("xmlbuilder", () => createSmallDoc())
  suite.add("xmlbuilder2", () => createSmallDoc2())

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
