import $$ from '../TestHelpers'
import { promises } from 'fs'
import { resolve } from 'path'

describe('Use XMLStream with async stream', () => {

  test('basic', async () => {
    const filename = resolve(__dirname, 'async-basic.test.out')
    const outFile = await promises.open(filename, 'w')
    
    const xmlStream = $$.documentStream({ 
      data: async (chunk) => await outFile.write(chunk),
      end: async () => await outFile.close()
    })

    xmlStream.ele("root")
      .ele("foo").up()
      .ele("bar").att("fizz", "buzz").up()
      .end()

    const result = await promises.readFile(filename, { encoding: 'utf8' })
    expect(result).toBe(`<root><foo/><bar fizz="buzz"/></root>`)
  })

})
