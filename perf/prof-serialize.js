const { document } = require("../lib")

const doc = document()
const root = doc.ele("root")
for (let i = 0; i < 100; i++) {
  const node = root.ele("node" + i.toString())
  for (let j = 0; j < 10; j++) {
    node.att("att" + j.toString(), "val" + j.toString())
    node.txt("text" + j.toString())
  }
}
for (let i = 0; i < 10000; i++) {
    doc.end({ prettyPrint: true })
}
