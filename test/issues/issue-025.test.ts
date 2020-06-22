import $$ from "../TestHelpers";

describe("Replicate issue", () => {
  // https://github.com/oozcitak/xmlbuilder2/issues/25
  test("#25 - Custom converter", () => {
    const obj = {
        'root': {
            '@xmlns:ns': 'some/uri',
            'ns:node1': 'Some text',
            'ns:node2': 1234
        }  
    }
    const doc = $$.create(obj);
    
    expect(doc.end({ headless: true, prettyPrint: true })).toBe($$.t`
      <root xmlns:ns="some/uri">
        <ns:node1>Some text</ns:node1>
        <ns:node2>1234</ns:node2>
      </root>
    `)

    expect((doc.root().first().node as any).namespaceURI).toBe('some/uri')
    expect((doc.root().last().node as any).namespaceURI).toBe('some/uri')
  })

})
