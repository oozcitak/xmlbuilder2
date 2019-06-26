import $$ from '../TestHelpers'

describe('ObjectWriter', () => {

  test('basic', () => {
    const obj = {
      ele: "simple element",
      person: {
        name: "John",
        '@age': 35,
        '?pi': 'mypi',
        '!': 'Good guy',
        '$': 'well formed!',
        address: {
          city: "Istanbul",
          street: "End of long and winding road"
        },
        contact: {
          phone: [ "555-1234", "555-1235" ]
        },
        id: () => 42,
        details: {
          '#text': 'classified'
        }
      }
    }

    const result = $$.withOptions({ version: "1.0", encoding: "UTF-8", standalone: true })
      .create('root').ele(obj).end({ format: "object" })

    expect($$.printMap(result)).toBe($$.t`
      {
        root: {
          ele: simple element,
          person: {
            @age: 35,
            name: John,
            ?pi: mypi,
            !: Good guy,
            $: well formed!,
            address: {
              city: Istanbul,
              street: End of long and winding road
            },
            contact: {
              phone: [
                555-1234,
                555-1235
              ]
            },
            id: 42,
            details: classified
          }
        }
      }
      `)
  })

  test('duplicate tag names', () => {
    const result = $$.create('people')
      .ele('person', { name: "xxx" }).up()
      .ele('person', { name: "yyy" }).up()
      .end({ format: "object" })

    expect($$.printMap(result)).toBe($$.t`
      {
        people: {
          person: [
            { @name: xxx },
            { @name: yyy }
          ]
        }
      }
      `)
  })

  test('mixed content', () => {
    const result = $$.create('people')
      .txt('hello')
      .ele('person', { name: "xxx" }).up()
      .txt('world')
      .end({ format: "object" })

    expect($$.printMap(result)).toBe($$.t`
      {
        people: {
          #1: hello,
          person: { @name: xxx },
          #2: world
        }
      }
      `)
  })

  test('mixed content and duplicate tags', () => {
    const result = $$.create('people')
      .txt('hello')
      .ele('person', { name: "xxx" }).up()
      .ele('person', { name: "yyy" }).up()
      .txt('world')
      .end({ format: "object" })

    expect($$.printMap(result)).toBe($$.t`
      {
        people: {
          #1: hello,
          person: [
            { @name: xxx },
            { @name: yyy }
          ],
          #2: world
        }
      }
      `)
  })

  test('mixed content and interspersed duplicate tags - cannot preserve node order', () => {
    const result = $$.create('people')
      .txt('hello')
      .ele('person', { name: "xxx" }).up()
      .txt('world')
      .ele('person', { name: "yyy" }).up()
      .end({ format: "object" })

    expect($$.printMap(result)).toBe($$.t`
      {
        people: {
          #1: hello,
          person: [
            { @name: xxx },
            { @name: yyy }
          ],
          #2: world
        }
      }
      `)
  })

  test('doctype', () => {
    const result = $$.withOptions({ docType: { pubID: "pub", sysID: "sys" } })
      .create('root').end({ format: "object" })

    expect($$.printMap(result)).toBe($$.t`
      { root: { } }
      `)
  })

  test('namespaces', () => {
    const result = $$.create('root', { xmlns: "myns" })
      .ele('foo').up()
      .set({ inheritNS: false }).ele('bar').up()
      .doc()
      .end({ format: "object" })

    expect($$.printMap(result)).toBe($$.t`
      {
        root: {
          @xmlns: myns,
          foo: { },
          bar: { @xmlns:  }
        }
      }
      `)
  })

  test('unknown node', () => {
    const ele = $$.create('root').ele('alien')
    Object.defineProperty(ele, "nodeType", { value: 1001, writable: false })
    expect(() => ele.end({ format: "object" })).toThrow
  })
  
})
