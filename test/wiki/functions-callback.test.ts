import $$ from '../TestHelpers'
import fs from 'fs'
import { resolve } from 'path'
import { promisify } from 'util'

const open = promisify(fs.open)
const write = promisify(fs.write)
const close = promisify(fs.close)
const readFile = promisify(fs.readFile)

describe('examples in the callback function reference wiki page', () => {

  test('documentCB()', async (done) => {
    const filename = resolve(__dirname, 'functions-documentCB.test.out')
    const outFile = await open(filename, 'w')
    
    const xmlStream = $$.createCB({ 
      data: async (chunk) => await write(outFile, chunk),
      end: async () => {
        await close(outFile)
        const result = await readFile(filename, { encoding: 'utf8' })
        expect(result).toBe('<root><foo/><bar fizz="buzz"/></root>')
        done()
      }
    })
    
    xmlStream.ele("root")
      .ele("foo").up()
      .ele("bar").att("fizz", "buzz").up()
      .end()
  })

  test('fragmentCB()', async (done) => {
    const filename = resolve(__dirname, 'functions-fragmentCB.test.out')
    const outFile = await open(filename, 'w')
    
    const xmlStream = $$.fragmentCB({ 
      data: async (chunk) => await write(outFile, chunk),
      end: async () => {
        await close(outFile)
        const result = await readFile(filename, { encoding: 'utf8' })
        expect(result).toBe('<foo/><foo fizz="buzz"/><foo/>')
        done()
      }
    })
    
    xmlStream.ele("foo").up()
      .ele("foo").att("fizz", "buzz").up()
      .ele("foo").up()
      .end()
  })

})
