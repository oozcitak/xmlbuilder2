import $$ from '../TestHelpers'

describe('ObjectWriter', () => {

  test('basic', () => {
    const obj = {
      ele: "simple element",
      person: {
        name: "John",
        '@age': 35,
        '?': 'pi mypi',
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

    const result = $$.document({ version: "1.0", encoding: "UTF-8", standalone: true })
      .ele('root').ele(obj).end({ format: "object" })

    expect($$.printMap(result)).toBe($$.t`
      {
        root: {
          ele: simple element,
          person: {
            @age: 35,
            name: John,
            ?: pi mypi,
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

  test('consecutive text nodes', () => {
    const result = $$.document().ele('root')
      .txt("text1")
      .txt("text2")
      .ele("node").txt("text3").up()
      .end({ format: "object" })

    expect($$.printMap(result)).toBe($$.t`
      {
        root: {
          #: [
            text1,
            text2
          ],
          node: text3
        }
      }
      `)
  })

  test('consecutive comment nodes', () => {
    const result = $$.document().ele('root')
      .com("text1")
      .com("text2")
      .ele("node").com("text3").up()
      .end({ format: "object" })

    expect($$.printMap(result)).toBe($$.t`
      {
        root: {
          !: [
            text1,
            text2
          ],
          node: { !: text3 }
        }
      }
      `)
  })

  test('consecutive cdata nodes', () => {
    const result = $$.document().ele('root')
      .dat("text1")
      .dat("text2")
      .ele("node").dat("text3").up()
      .end({ format: "object" })

    expect($$.printMap(result)).toBe($$.t`
      {
        root: {
          $: [
            text1,
            text2
          ],
          node: { $: text3 }
        }
      }
      `)
  })

  test('consecutive instruction nodes', () => {
    const result = $$.document().ele('root')
      .ins("target1", "text1")
      .ins("target2", "text2")
      .ele("node").ins("target3", "text3").up()
      .end({ format: "object" })

    expect($$.printMap(result)).toBe($$.t`
      {
        root: {
          ?: [
            target1 text1,
            target2 text2
          ],
          node: { ?: target3 text3 }
        }
      }
      `)
  })

  test('duplicate tag names', () => {
    const result = $$.document().ele('people')
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
    const result = $$.document().ele('people')
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
    const result = $$.document().ele('people')
      .txt('text1')
      .ele('person', { name: "xxx" }).up()
      .ele('person', { name: "yyy" }).up()
      .txt('text2')
      .txt('text3')
      .end({ format: "object" })

    expect($$.printMap(result)).toBe($$.t`
      {
        people: {
          #1: text1,
          person: [
            { @name: xxx },
            { @name: yyy }
          ],
          #2: [
            text2,
            text3
          ]
        }
      }
      `)
  })

  test('mixed content and interspersed duplicate tags', () => {
    const result = $$.document().ele('people')
      .txt('hello')
      .ele('person', { name: "xxx" }).up()
      .txt('world')
      .ele('person', { name: "yyy" }).up()
      .end({ format: "object" })

    expect($$.printMap(result)).toBe($$.t`
      {
        people: {
          #: [
            { #: hello },
            { person: { @name: xxx } },
            { #: world },
            { person: { @name: yyy } }
          ]
        }
      }
      `)
  })

  test('doctype', () => {
    const result = $$.document()
      .dtd({ pubID: "pub", sysID: "sys" }).ele('root').end({ format: "object" })

    expect($$.printMap(result)).toBe($$.t`
      { root: { } }
      `)
  })

  test('namespaces', () => {
    const result = $$.document().ele('root', { xmlns: "myns" })
      .ele('foo').up()
      .ele('bar').up()
      .doc()
      .end({ format: "object" })

    expect($$.printMap(result)).toBe($$.t`
      {
        root: {
          @xmlns: myns,
          foo: { },
          bar: { }
        }
      }
      `)
  })

  test('unknown node', () => {
    const ele = $$.document().ele('root').ele('alien')
    Object.defineProperty(ele, "nodeType", { value: 1001, writable: false })
    expect(() => ele.end({ format: "object" })).toThrow()
  })
  
})
