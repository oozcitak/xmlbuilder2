import $$ from '../TestHelpers'
import { createWriteStream, readFile } from 'fs'
import { resolve } from 'path'

$$.suite('Use callback API with fs async', () => {

  $$.test('basic', async () => {
    const xmlStr = `<root><foo/><bar fizz="buzz"/></root>`

    const filename = resolve(__dirname, 'async-basic.test.out')
    const outFile = createWriteStream(filename)

    const xmlStream = $$.createCB({
      'data': (chunk: string) => outFile.write(chunk),
      'end': () => outFile.end()
    })

    outFile.on('close', () => {
      readFile(filename, 'utf8', (err, result) => {
        $$.deepEqual(result, xmlStr)
      })
    })

    xmlStream.ele("root")
      .ele("foo").up()
      .ele("bar").att("fizz", "buzz").up()
      .end()
  })

  $$.test('many', async () => {
    const count = 1000
    let xmlStr = "<root>"
    for (let i = 1; i < count; i++) {
      xmlStr += "<node" + i.toString() + " att" + i.toString() + "=\"val" + i.toString() + "\"/>"
    }
    xmlStr += "</root>"

    const filename = resolve(__dirname, 'async-many.test.out')
    const outFile = createWriteStream(filename)

    const xmlStream = $$.createCB({
      'data': (chunk: string) => outFile.write(chunk),
      'end': () => outFile.end()
    })

    outFile.on('close', () => {
      readFile(filename, 'utf8', (err, result) => {
        $$.deepEqual(result, xmlStr)
      })
    })

    xmlStream.ele("root")
    for (let i = 1; i < count; i++) {
      xmlStream.ele("node" + i.toString()).att("att" + i.toString(), "val" + i.toString()).up()
    }
    xmlStream.end()
  })

})
