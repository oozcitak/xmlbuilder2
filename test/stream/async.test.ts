import $$ from '../TestHelpers'
import { promises } from 'fs'
import { resolve } from 'path'

describe('Use callback API with fs async', () => {

  test('basic', async () => {
    const filename = resolve(__dirname, 'async-basic.test.out')
    const outFile = await promises.open(filename, 'w')
    
    const xml = $$.createCB({ 
      data: async (chunk) => await outFile.write(chunk),
      end: async () => await outFile.close()
    })

    xml.ele("root")
      .ele("foo").up()
      .ele("bar").att("fizz", "buzz").up()
      .end()

    const result = await promises.readFile(filename, { encoding: 'utf8' })
    expect(result).toBe(`<root><foo/><bar fizz="buzz"/></root>`)
  })

})
