import $$ from '../TestHelpers'

$$.suite('ObjectWriter', () => {

  $$.test('basic', () => {
    const obj = {
      ele: "simple element",
      person: {
        name: "John",
        '@age': 35,
        '?1': 'pi mypi',
        '?2': 'pi',
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

    const result = $$.create({ version: "1.0", encoding: "UTF-8", standalone: true })
      .ele('root').ele(obj).end({ format: "object", group: true })

    $$.deepEqual($$.printMap(result), $$.t`
      {
        root: {
          ele: simple element,
          person: {
            @age: 35,
            name: John,
            ?: [
              pi mypi,
              pi
            ],
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

  $$.test('consecutive attributes', () => {
    const result = $$.create().ele('root')
      .att("att1", "val1")
      .att("att2", "val2")
      .att("att3", "val3")
      .ele("node").att("att", "val").up()
      .end({ format: "object", group: true })

    $$.deepEqual($$.printMap(result), $$.t`
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

  $$.test('consecutive text nodes', () => {
    const result = $$.create().ele('root')
      .txt("text1")
      .txt("text2")
      .txt("text3")
      .ele("node").txt("text").up()
      .end({ format: "object", group: true })

    $$.deepEqual($$.printMap(result), $$.t`
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

  $$.test('consecutive comment nodes', () => {
    const result = $$.create().ele('root')
      .com("text1")
      .com("text2")
      .com("text3")
      .ele("node").com("text").up()
      .end({ format: "object", group: true })

    $$.deepEqual($$.printMap(result), $$.t`
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

  $$.test('consecutive cdata nodes', () => {
    const result = $$.create().ele('root')
      .dat("text1")
      .dat("text2")
      .dat("text3")
      .ele("node").dat("text").up()
      .end({ format: "object", group: true })

    $$.deepEqual($$.printMap(result), $$.t`
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

  $$.test('consecutive instruction nodes', () => {
    const result = $$.create().ele('root')
      .ins("target1", "text1")
      .ins("target2", "text2")
      .ins("target3", "text3")
      .ele("node").ins("target", "text").up()
      .end({ format: "object", group: true })

    $$.deepEqual($$.printMap(result), $$.t`
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

  $$.test('duplicate tag names', () => {
    const result = $$.create().ele('people')
      .ele('person').up()
      .ele('person').up()
      .end({ format: "object" })

    $$.deepEqual(result,  { people: { person: [ {}, {} ] } } )
  })

  $$.test('duplicate tag names with attributes', () => {
    const result = $$.create().ele('people')
      .ele('person', { name: "xxx" }).up()
      .ele('person', { name: "yyy" }).up()
      .end({ format: "object" })

    $$.deepEqual($$.printMap(result), $$.t`
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

  $$.test('duplicate tag names with text child nodes', () => {
    const result = $$.create().ele('people')
      .ele('person').txt("text").up()
      .ele('person').txt("text").up()
      .end({ format: "object" })

    $$.deepEqual($$.printMap(result), $$.t`
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

  $$.test('mixed content', () => {
    const result = $$.create().ele('people')
      .txt('hello')
      .ele('person', { name: "xxx" }).up()
      .txt('world')
      .end({ format: "object" })

    $$.deepEqual($$.printMap(result), $$.t`
      {
        people: {
          #1: hello,
          person: { @name: xxx },
          #2: world
        }
      }
      `)
  })

  $$.test('mixed content and duplicate tags', () => {
    const result = $$.create().ele('people')
      .txt('text1')
      .ele('person', { name: "xxx" }).up()
      .ele('person', { name: "yyy" }).up()
      .ele('person', { name: "zzz" }).up()
      .txt('text2')
      .txt('text3')
      .end({ format: "object" })

    $$.deepEqual($$.printMap(result), $$.t`
      {
        people: {
          #1: text1,
          person: [
            { @name: xxx },
            { @name: yyy },
            { @name: zzz }
          ],
          #2: text2,
          #3: text3
        }
      }
      `)
  })

  $$.test('mixed content and interspersed duplicate tags', () => {
    const result = $$.create().ele('people')
      .txt('hello')
      .ele('person', { name: "xxx" }).up()
      .txt('world')
      .ele('person', { name: "yyy" }).up()
      .ele('person', { name: "zzz" }).up()
      .ele('person', { name: "aaa" }).up()
      .end({ format: "object" })

    $$.deepEqual($$.printMap(result), $$.t`
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

  $$.test('mixed content - attributes', () => {
    const result = $$.create().ele('root')
      .att("att", "val")
      .ele("node").att("att", "val").up()
      .txt("text")
      .ele("node").up()
      .end({ format: "object" })

    $$.deepEqual($$.printMap(result), $$.t`
      {
        root: {
          @att: val,
          #: [
            { node: { @att: val } },
            { #: text },
            { node: { } }
          ]
        }
      }
      `)
  })

  $$.test('mixed content - consecutive attributes', () => {
    const result = $$.create().ele('root')
      .att("att1", "val1")
      .att("att2", "val2")
      .att("att3", "val3")
      .ele("node").att("att", "val").up()
      .txt("text")
      .ele("node").up()
      .end({ format: "object", group: true })

    $$.deepEqual($$.printMap(result), $$.t`
      {
        root: {
          @: {
            att1: val1,
            att2: val2,
            att3: val3
          },
          #: [
            { node: { @att: val } },
            { #: text },
            { node: { } }
          ]
        }
      }
      `)
  })

  $$.test('mixed content - consecutive text nodes', () => {
    const result = $$.create().ele('root')
      .txt("text1")
      .txt("text2")
      .txt("text3")
      .ele("node").txt("text").up()
      .txt("text")
      .ele("node").up()
      .end({ format: "object", group: true })

    $$.deepEqual($$.printMap(result), $$.t`
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

  $$.test('mixed content - consecutive comment nodes', () => {
    const result = $$.create().ele('root')
      .com("text1")
      .com("text2")
      .com("text3")
      .ele("node").com("text").up()
      .txt("text")
      .ele("node").up()
      .end({ format: "object", group: true })

    $$.deepEqual($$.printMap(result), $$.t`
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

  $$.test('mixed content - consecutive cdata nodes', () => {
    const result = $$.create().ele('root')
      .dat("text1")
      .dat("text2")
      .dat("text3")
      .ele("node").dat("text").up()
      .txt("text")
      .ele("node").up()
      .end({ format: "object", group: true })

    $$.deepEqual($$.printMap(result), $$.t`
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

  $$.test('mixed content - consecutive instruction nodes', () => {
    const result = $$.create().ele('root')
      .ins("target1", "text1")
      .ins("target2", "text2")
      .ins("target3", "text3")
      .ele("node").ins("target", "text").up()
      .txt("text")
      .ele("node").up()
      .end({ format: "object", group: true })

    $$.deepEqual($$.printMap(result), $$.t`
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

  $$.test('mixed content - consecutive nodes without group', () => {
    const result = $$.create().ele('root')
      .att("att1", "val1")
      .att("att2", "val2")
      .ins("target1", "text1")
      .ins("target2", "text2")
      .ele("node")
        .ins("t", "tt")
        .txt("hello")
        .dat("dat1")
        .txt("world")
        .ins("t", "tt")
        .dat("dat2")
      .up()
      .ins("target3", "text3")
      .com("com1")
      .com("com2")
      .ins("target4", "text4")
      .txt("text")
      .end({ format: "object", group: false })

    $$.deepEqual($$.printMap(result), $$.t`
      {
        root: {
          @att1: val1,
          @att2: val2,
          ?1: target1 text1,
          ?2: target2 text2,
          node: {
            ?1: t tt,
            #1: hello,
            $1: dat1,
            #2: world,
            ?2: t tt,
            $2: dat2
          },
          ?3: target3 text3,
          !1: com1,
          !2: com2,
          ?4: target4 text4,
          #: text
        }
      }
      `)
  })

  $$.test('mixed content - text suffix', () => {
    const result = $$.create().ele('people')
      .txt('text1')
      .ele('person').up()
      .txt('text2')
      .end({ format: "object" })

    $$.deepEqual($$.printMap(result), $$.t`
      {
        people: {
          #1: text1,
          person: { },
          #2: text2
        }
      }
      `)
  })

  $$.test('mixed content - comment suffix', () => {
    const result = $$.create().ele('people')
      .com('text1')
      .ele('person').up()
      .com('text2')
      .end({ format: "object" })

    $$.deepEqual($$.printMap(result), $$.t`
      {
        people: {
          !1: text1,
          person: { },
          !2: text2
        }
      }
      `)
  })

  $$.test('mixed content - cdata suffix', () => {
    const result = $$.create().ele('people')
      .dat('text1')
      .ele('person').up()
      .dat('text2')
      .end({ format: "object" })

    $$.deepEqual($$.printMap(result), $$.t`
      {
        people: {
          $1: text1,
          person: { },
          $2: text2
        }
      }
      `)
  })

  $$.test('mixed content - processing instruction suffix', () => {
    const result = $$.create().ele('people')
      .ins('target1', 'text1')
      .ele('person').up()
      .ins('target2', 'text2')
      .end({ format: "object" })

    $$.deepEqual($$.printMap(result), $$.t`
      {
        people: {
          ?1: target1 text1,
          person: { },
          ?2: target2 text2
        }
      }
      `)
  })

  $$.test('doctype', () => {
    const result = $$.create()
      .dtd({ pubID: "pub", sysID: "sys" }).ele('root').end({ format: "object" })

    $$.deepEqual($$.printMap(result), $$.t`
      { root: { } }
      `)
  })

  $$.test('namespaces', () => {
    const result = $$.create().ele('root', { xmlns: "myns" })
      .ele('foo').up()
      .ele('bar').up()
      .doc()
      .end({ format: "object" })

    $$.deepEqual($$.printMap(result), $$.t`
      {
        root: {
          @xmlns: myns,
          foo: { },
          bar: { }
        }
      }
      `)
  })

  $$.test('unknown node', () => {
    const ele = $$.create().ele('root').ele('alien')
    Object.defineProperty(ele.node, "nodeType", { value: 1001, writable: false })
    $$.throws(() => ele.end({ format: "object" }))
  })

  $$.test('auto group', () => {
    const root = $$.create().ele('root')
      .ele('node').up()
      .txt('text')
      .ele('node').up()
      .up()
    $$.deepEqual(root.end({ format: "object", group: false }), {
      root: {
        '#': [
          { node: {} },
          { '#' : 'text' },
          { node: {} }
        ]
      }
    })
  })

  $$.test('fragment', () => {
    const result = $$.fragment()
      .ele('foo', { att: "val" }).up()
      .ele('foo').up()
      .ele('bar').up()
      .ele('foo').up()
      .end({ format: "object" })

    $$.deepEqual($$.printMap(result), $$.t`
      {
        #: [
          {
            foo: [
              { @att: val },
              { }
            ]
          },
          { bar: { } },
          { foo: { } }
        ]
      }
      `)
  })

  $$.test('fragment with unique keys', () => {
    const result = $$.fragment()
      .ele('foo').up()
      .ele('bar').up()
      .end({ format: "object" })

    $$.deepEqual(result, { foo: { }, bar: { } })
  })

  $$.test("verbose", () => {
    const input2 = $$.t`
    <data>
      <row id="0">
        <TYPE>X</TYPE>
        <ID>123</ID>
      </row>
      <row id="1">
        <TYPE>Y</TYPE>
        <ID>321</ID>
      </row>
      <row/>
    </data>`

    const obj2 = $$.convert(input2, { format: 'object', verbose: true })
    $$.deepEqual(obj2,
      {
        "data": [
          {
            "row": [
              {
                "@id": "0",
                "TYPE": [ "X" ],
                "ID": [ "123" ]
              },
              {
                "@id": "1",
                "TYPE": [ "Y" ],
                "ID": [ "321" ]
              },
              {}
            ]
          }
        ]
      })
    $$.deepEqual($$.create(obj2).end({ headless: true, prettyPrint: true }), input2)

    const input1 = $$.t`
    <data>
      <row id="0">
        <TYPE>X</TYPE>
        <ID>123</ID>
      </row>
    </data>`
    const obj1 = $$.convert(input1, { format: 'object', verbose: true })
    $$.deepEqual(obj1,
      {
        "data": [
          {
            "row": [
              {
                "@id": "0",
                "TYPE": [ "X" ],
                "ID": [ "123" ]
              }
            ]
          }
        ]
      })
    $$.deepEqual($$.create(obj1).end({ headless: true, prettyPrint: true }), input1)

    const input3 = $$.t`
    <data>
      <row/>
    </data>`
    const obj3 = $$.convert(input3, { format: 'object', verbose: true })
    $$.deepEqual(obj3,
      {
        "data": [
          {
            "row": [ {} ]
          }
        ]
      })
    $$.deepEqual($$.create(obj1).end({ headless: true, prettyPrint: true }), input1)
  })

  $$.test('fragment with verbose', () => {
    const obj = $$.fragment()
      .ele('foo', { att: "val" }).up()
      .ele('foo').up()
      .ele('bar').up()
      .ele('foo').up()
      .end({ format: "object", verbose: true })

    $$.deepEqual($$.printMap(obj), $$.t`
      {
        #: [
          {
            foo: [
              { @att: val },
              { }
            ]
          },
          { bar: [ { } ] },
          { foo: [ { } ] }
        ]
      }
      `)
  })

})
