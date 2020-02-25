import { create as create2 } from "../lib"
import { create, XMLElement } from "xmlbuilder"
import { Suite } from "benchmark"
import { processBenchmark, benchmarkTitle } from "./"
import { XMLBuilder } from "../lib/interfaces"

const smallObj = createSmallDoc2().end({ format: "object", group: false });
const mediumObj = createMediumDoc2().end({ format: "object", group: false });

(function () {
  benchmarkTitle("dom")
})();

function createSmallDoc(): XMLElement {
  const root = create('root')
  for (let i = 0; i < 100; i++) {
    root.ele('node')
      .ele('node11', {att1: "val1", att2: "val2" }, "text")
      .ele('node12')
  }
  return root
}

function createSmallDoc2(): XMLBuilder {
  const root = create2({ convert: { text: "#text" } }).ele('root')
  for (let i = 0; i < 100; i++) {
    root.ele('node')
      .ele('node11', {att1: "val1", att2: "val2" }).txt("text")
      .ele('node12')
  }
  return root
}

function createMediumDoc(): XMLElement {
  const root = create('root')
  for (let i = 0; i < 10000; i++) {
    root.ele('node')
      .ele('node11', {att1: "val1", att2: "val2" }, "text")
      .ele('node12')
  }
  return root
}

function createMediumDoc2(): XMLBuilder {
  const root = create2({ convert: { text: "#text" } }).ele('root')
  for (let i = 0; i < 10000; i++) {
    root.ele('node')
      .ele('node11', {att1: "val1", att2: "val2" }).txt("text")
      .ele('node12')
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

(function () {
  const suite = new Suite("convert small JS object")
   
  suite.add("xmlbuilder", () => create(smallObj as any))
  suite.add("xmlbuilder2", () => create2(smallObj))

  suite.on("complete", () => processBenchmark(suite, "xmlbuilder2"))
  suite.run()

})();

(function () {
  const suite = new Suite("convert medium JS object")
   
  suite.add("xmlbuilder", () => create(mediumObj as any))
  suite.add("xmlbuilder2", () => create2(mediumObj))

  suite.on("complete", () => processBenchmark(suite, "xmlbuilder2"))
  suite.run()

})();

(function () {
  const suite = new Suite("serialize small document to XML string")
  
  const doc = createSmallDoc().doc()
  const doc2 = createSmallDoc2().doc()

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