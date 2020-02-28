import $$ from '../TestHelpers'
import fs from 'fs'
import { resolve } from 'path'
import { promisify } from 'util'

const open = promisify(fs.open)
const write = promisify(fs.write)
const close = promisify(fs.close)
const readFile = promisify(fs.readFile)

describe('examples in the callback function reference wiki page', () => {

  test('documentCB()', async () => {
    const filename = resolve(__dirname, 'functions-documentCB.test.out')
    const outFile = await open(filename, 'w')
    
    const xmlStream = $$.createCB({ 
      data: async (chunk) => await write(outFile, chunk),
      end: async () => await close(outFile)
    })
    
    xmlStream.ele("root")
      .ele("foo").up()
      .ele("bar").att("fizz", "buzz").up()
      .end()

    const result = await readFile(filename, { encoding: 'utf8' })
    expect(result).toBe('<root><foo/><bar fizz="buzz"/></root>')
  })

  test('fragmentCB()', async () => {
    const filename = resolve(__dirname, 'functions-fragmentCB.test.out')
    const outFile = await open(filename, 'w')
    
    const xmlStream = $$.fragmentCB({ 
      data: async (chunk) => await write(outFile, chunk),
      end: async () => await close(outFile)
    })
    
    xmlStream.ele("foo").up()
      .ele("foo").att("fizz", "buzz").up()
      .ele("foo").up()
      .end()

    const result = await readFile(filename, { encoding: 'utf8' })
    expect(result).toBe('<foo/><foo fizz="buzz"/><foo/>')
  })

})
