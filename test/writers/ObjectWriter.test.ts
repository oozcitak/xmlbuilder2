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

  test('consecutive attributes', () => {
    const result = $$.document().ele('root')
      .att("att1", "val1")
      .att("att2", "val2")
      .att("att3", "val3")
      .ele("node").att("att", "val").up()
      .end({ format: "object" })

    expect($$.printMap(result)).toBe($$.t`
      {
        root: {
          @: {
            att1: val1,
            att2: val2,
            att3: val3
          },
          node: { @att: val }
        }
      }
      `)
  })

  test('consecutive text nodes', () => {
    const result = $$.document().ele('root')
      .txt("text1")
      .txt("text2")
      .txt("text3")
      .ele("node").txt("text").up()
      .end({ format: "object" })

    expect($$.printMap(result)).toBe($$.t`
      {
        root: {
          #: [
            text1,
            text2,
            text3
          ],
          node: text
        }
      }
      `)
  })

  test('consecutive comment nodes', () => {
    const result = $$.document().ele('root')
      .com("text1")
      .com("text2")
      .com("text3")
      .ele("node").com("text").up()
      .end({ format: "object" })

    expect($$.printMap(result)).toBe($$.t`
      {
        root: {
          !: [
            text1,
            text2,
            text3
          ],
          node: { !: text }
        }
      }
      `)
  })

  test('consecutive cdata nodes', () => {
    const result = $$.document().ele('root')
      .dat("text1")
      .dat("text2")
      .dat("text3")
      .ele("node").dat("text").up()
      .end({ format: "object" })

    expect($$.printMap(result)).toBe($$.t`
      {
        root: {
          $: [
            text1,
            text2,
            text3
          ],
          node: { $: text }
        }
      }
      `)
  })

  test('consecutive instruction nodes', () => {
    const result = $$.document().ele('root')
      .ins("target1", "text1")
      .ins("target2", "text2")
      .ins("target3", "text3")
      .ele("node").ins("target", "text").up()
      .end({ format: "object" })

    expect($$.printMap(result)).toBe($$.t`
      {
        root: {
          ?: [
            target1 text1,
            target2 text2,
            target3 text3
          ],
          node: { ?: target text }
        }
      }
      `)
  })

  test('duplicate tag names', () => {
    const result = $$.document().ele('people')
      .ele('person').up()
      .ele('person').up()
      .end({ format: "object" })

    expect(result).toEqual( { people: { person: [ {}, {} ] } } )
  })

  test('duplicate tag names with attributes', () => {
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

  test('duplicate tag names with text child nodes', () => {
    const result = $$.document().ele('people')
      .ele('person').txt("text").up()
      .ele('person').txt("text").up()
      .end({ format: "object" })

    expect($$.printMap(result)).toBe($$.t`
      {
        people: {
          person: [
            text,
            text
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
      .ele('person', { name: "zzz" }).up()
      .txt('text2')
      .txt('text3')
      .end({ format: "object" })

    expect($$.printMap(result)).toBe($$.t`
      {
        people: {
          #1: text1,
          person: [
            { @name: xxx },
            { @name: yyy },
            { @name: zzz }
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
      .ele('person', { name: "zzz" }).up()
      .ele('person', { name: "aaa" }).up()
      .end({ format: "object" })

    expect($$.printMap(result)).toBe($$.t`
      {
        people: {
          #: [
            { #: hello },
            { person: { @name: xxx } },
            { #: world },
            {
              person: [
                { @name: yyy },
                { @name: zzz },
                { @name: aaa }
              ]
            }
          ]
        }
      }
      `)
  })

  test('mixed content - attributes', () => {
    const result = $$.document().ele('root')
      .att("att", "val")
      .ele("node").att("att", "val").up()
      .txt("text")
      .ele("node").up()
      .end({ format: "object" })

    expect($$.printMap(result)).toBe($$.t`
      {
        root: {
          #: [
            { @att: val },
            { node: { @att: val } },
            { #: text },
            { node: { } }
          ]
        }
      }
      `)
  })

  test('mixed content - consecutive attributes', () => {
    const result = $$.document().ele('root')
      .att("att1", "val1")
      .att("att2", "val2")
      .att("att3", "val3")
      .ele("node").att("att", "val").up()
      .txt("text")
      .ele("node").up()
      .end({ format: "object" })

    expect($$.printMap(result)).toBe($$.t`
      {
        root: {
          #: [
            {
              @: {
                att1: val1,
                att2: val2,
                att3: val3
              }
            },
            { node: { @att: val } },
            { #: text },
            { node: { } }
          ]
        }
      }
      `)
  })

  test('mixed content - consecutive text nodes', () => {
    const result = $$.document().ele('root')
      .txt("text1")
      .txt("text2")
      .txt("text3")
      .ele("node").txt("text").up()
      .txt("text")
      .ele("node").up()
      .end({ format: "object" })

    expect($$.printMap(result)).toBe($$.t`
      {
        root: {
          #: [
            {
              #: [
                text1,
                text2,
                text3
              ]
            },
            { node: text },
            { #: text },
            { node: { } }
          ]
        }
      }
      `)
  })

  test('mixed content - consecutive comment nodes', () => {
    const result = $$.document().ele('root')
      .com("text1")
      .com("text2")
      .com("text3")
      .ele("node").com("text").up()
      .txt("text")
      .ele("node").up()
      .end({ format: "object" })

    expect($$.printMap(result)).toBe($$.t`
      {
        root: {
          #: [
            {
              !: [
                text1,
                text2,
                text3
              ]
            },
            { node: { !: text } },
            { #: text },
            { node: { } }
          ]
        }
      }
      `)
  })

  test('mixed content - consecutive cdata nodes', () => {
    const result = $$.document().ele('root')
      .dat("text1")
      .dat("text2")
      .dat("text3")
      .ele("node").dat("text").up()
      .txt("text")
      .ele("node").up()
      .end({ format: "object" })

    expect($$.printMap(result)).toBe($$.t`
      {
        root: {
          #: [
            {
              $: [
                text1,
                text2,
                text3
              ]
            },
            { node: { $: text } },
            { #: text },
            { node: { } }
          ]
        }
      }
      `)
  })

  test('mixed content - consecutive instruction nodes', () => {
    const result = $$.document().ele('root')
      .ins("target1", "text1")
      .ins("target2", "text2")
      .ins("target3", "text3")
      .ele("node").ins("target", "text").up()
      .txt("text")
      .ele("node").up()
      .end({ format: "object" })

    expect($$.printMap(result)).toBe($$.t`
      {
        root: {
          #: [
            {
              ?: [
                target1 text1,
                target2 text2,
                target3 text3
              ]
            },
            { node: { ?: target text } },
            { #: text },
            { node: { } }
          ]
        }
      }
      `)
  })

  test('mixed content - text suffix', () => {
    const result = $$.document().ele('people')
      .txt('text1')
      .ele('person').up()
      .txt('text2')
      .end({ format: "object" })

    expect($$.printMap(result)).toBe($$.t`
      {
        people: {
          #1: text1,
          person: { },
          #2: text2
        }
      }
      `)
  })

  test('mixed content - comment suffix', () => {
    const result = $$.document().ele('people')
      .com('text1')
      .ele('person').up()
      .com('text2')
      .end({ format: "object" })

    expect($$.printMap(result)).toBe($$.t`
      {
        people: {
          !1: text1,
          person: { },
          !2: text2
        }
      }
      `)
  })

  test('mixed content - cdata suffix', () => {
    const result = $$.document().ele('people')
      .dat('text1')
      .ele('person').up()
      .dat('text2')
      .end({ format: "object" })

    expect($$.printMap(result)).toBe($$.t`
      {
        people: {
          $1: text1,
          person: { },
          $2: text2
        }
      }
      `)
  })

  test('mixed content - processing instruction suffix', () => {
    const result = $$.document().ele('people')
      .ins('target1', 'text1')
      .ele('person').up()
      .ins('target2', 'text2')
      .end({ format: "object" })

    expect($$.printMap(result)).toBe($$.t`
      {
        people: {
          ?1: target1 text1,
          person: { },
          ?2: target2 text2
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
    Object.defineProperty(ele.node, "nodeType", { value: 1001, writable: false })
    expect(() => ele.end({ format: "object" })).toThrow()
  })
  
})
