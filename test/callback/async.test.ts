import $$ from '../TestHelpers'
import fs from 'fs'
import { resolve } from 'path'
import { promisify } from 'util'

const open = promisify(fs.open)
const write = promisify(fs.write)
const close = promisify(fs.close)
const readFile = promisify(fs.readFile)

describe('Use callback API with fs async', () => {

  test('basic', async (done) => {
    const filename = resolve(__dirname, 'async-basic.test.out')
    const outFile = await open(filename, 'w')
    
    const xml = $$.createCB({ 
      data: async (chunk) => await write(outFile, chunk),
      end: async () => {
        await close(outFile)
        const result = await readFile(filename, { encoding: 'utf8' })
        expect(result).toBe(`<root><foo/><bar fizz="buzz"/></root>`)
        done()
      }
    })

    xml.ele("root")
      .ele("foo").up()
      .ele("bar").att("fizz", "buzz").up()
      .end()
  })

})
