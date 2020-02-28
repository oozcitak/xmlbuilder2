import $$ from '../TestHelpers'
import { promises } from 'fs'
import { resolve } from 'path'

describe('examples in the function reference wiki page', () => {

  test('document()', () => {
    const doc1 = $$.create()
    expect(doc1.end()).toBe('<?xml version="1.0"?>')

    const doc2 = $$.create({ version: "1.0" })
    expect(doc2.end()).toBe('<?xml version="1.0"?>')
    
    const doc3 = $$.create('<root><foo><bar>foobar</bar></foo></root>')
    expect(doc3.end({ headless: true }))
      .toBe('<root><foo><bar>foobar</bar></foo></root>')
    
    expect(() => $$.create({ version: "1.0" }, '<root>text\x00</root>')).toThrow()
    expect(() => $$.create({ version: "1.0" }, '<root>text\x01</root>')).toThrow()
  })

  test('fragment()', () => {
    const frag1 = $$.fragment()
    expect(frag1.toString()).toBe('')

    const frag2 = $$.fragment({ version: "1.0" })
    expect(frag2.toString()).toBe('')
    
    const frag3 = $$.fragment('<foo1>bar</foo1><foo2>baz</foo2>')
    expect(frag3.toString())
      .toBe('<foo1>bar</foo1><foo2>baz</foo2>')
    
    expect(() => $$.fragment({ version: "1.0" }, '<root>text\x00</root>')).toThrow()
    expect(() => $$.fragment({ version: "1.0" }, '<root>text\x01</root>')).toThrow()
  })

  test('ele()', () => {
    const doc1 = $$.create()
      .ele("http://myschema.com", "m:root", { "att1": "value1", "att2": "value2" })
    expect(doc1.end({ prettyPrint: true, headless: true }))
      .toBe('<m:root xmlns:m="http://myschema.com" att1="value1" att2="value2"/>')

    const doc2 = $$.create()
      .ele("root", { "att1": "value1", "att2": "value2" })
    expect(doc2.end({ prettyPrint: true, headless: true }))
      .toBe('<root att1="value1" att2="value2"/>')

    const doc3 = $$.create()
      .ele({ "root": { "@att1": "value1", "@att2": "value2", "#": "text" }})
    expect(doc3.end({ prettyPrint: true, headless: true }))
      .toBe('<root att1="value1" att2="value2">text</root>')
  })

})
