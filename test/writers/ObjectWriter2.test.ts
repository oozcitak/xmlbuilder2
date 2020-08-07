import $$ from '../TestHelpers'
import { ObjectWriter } from '../../src/writers/xx'
import { DefaultBuilderOptions } from '../../src/interfaces'

describe('ObjectWriter', () => {

  test('basic', () => {
    const doc = $$.create().ele('foo').ele('bar').doc()
    const w = new ObjectWriter(DefaultBuilderOptions, {})
    const obj = w.serialize(doc.node)
    expect(obj).toEqual({
      foo: {
        bar: {}
      }
    })

  })

})
