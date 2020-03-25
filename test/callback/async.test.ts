import $$ from '../TestHelpers'
import { createWriteStream, readFile } from 'fs'
import { resolve } from 'path'

describe('Use callback API with fs async', () => {

  test('basic', (done) => {
    const xmlStr = `<root><foo/><bar fizz="buzz"/></root>`

    const filename = resolve(__dirname, 'async-basic.test.out')
    const outFile = createWriteStream(filename)

    const xmlStream = $$.createCB({
      'data': (chunk: string) => outFile.write(chunk),
      'end': () => outFile.end()
    })

    outFile.on('close', () => {
      readFile(filename, 'utf8', (err, result) => {
        expect(result).toBe(xmlStr)
        done()
      })
    })

    xmlStream.ele("root")
      .ele("foo").up()
      .ele("bar").att("fizz", "buzz").up()
      .end()
  })

  test('many', (done) => {
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
        expect(result).toBe(xmlStr)
        done()
      })
    })

    xmlStream.ele("root")
    for (let i = 1; i < count; i++) {
      xmlStream.ele("node" + i.toString()).att("att" + i.toString(), "val" + i.toString()).up()
    }
    xmlStream.end()
  })

})
