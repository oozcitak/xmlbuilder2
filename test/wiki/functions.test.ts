import $$ from '../TestHelpers'

describe('examples in the function reference wiki page', () => {

  test('document()', () => {
    const doc1 = $$.document()
    expect(doc1.end()).toBe('<?xml version="1.0"?>')

    const doc2 = $$.document({ version: "1.1" })
    expect(doc2.end()).toBe('<?xml version="1.1"?>')
    
    const doc3 = $$.document('<root><foo><bar>foobar</bar></foo></root>')
    expect(doc3.end({ headless: true }))
      .toBe('<root><foo><bar>foobar</bar></foo></root>')
    
    const doc4 = $$.document({ version: "1.1" }, '<ሥር><ኤለመንት/></ሥር>')
    expect(doc4.end({ headless: true })).toBe('<ሥር><ኤለመንት/></ሥር>')
  })

  test('fragment()', () => {
    const frag1 = $$.fragment()
    expect(frag1.toString()).toBe('')

    const frag2 = $$.fragment({ version: "1.1" })
    expect(frag2.toString()).toBe('')
    
    const frag3 = $$.fragment('<foo1>bar</foo1><foo2>baz</foo2>')
    expect(frag3.toString())
      .toBe('<foo1>bar</foo1><foo2>baz</foo2>')
    
    const frag4 = $$.fragment({ version: "1.1" }, '<ሥር><ኤለመንት/></ሥር>')
    expect(frag4.toString()).toBe('<ሥር><ኤለመንት/></ሥር>')
  })

  test('ele()', () => {
    const doc1 = $$.document()
      .ele("http://myschema.com", "m:root", { "att1": "value1", "att2": "value2" })
    expect(doc1.end({ prettyPrint: true, headless: true }))
      .toBe('<m:root xmlns:m="http://myschema.com" att1="value1" att2="value2"/>')

    const doc2 = $$.document()
      .ele("root", { "att1": "value1", "att2": "value2" })
    expect(doc2.end({ prettyPrint: true, headless: true }))
      .toBe('<root att1="value1" att2="value2"/>')

    const doc3 = $$.document()
      .ele({ "root": { "@att1": "value1", "@att2": "value2", "#": "text" }})
    expect(doc3.end({ prettyPrint: true, headless: true }))
      .toBe('<root att1="value1" att2="value2">text</root>')
  })

})
