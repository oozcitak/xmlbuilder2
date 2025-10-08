import $$ from '../TestHelpers'

$$.suite('MapWriter', () => {

  $$.test('basic', () => {
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
          phone: ["555-1234", "555-1235"]
        },
        id: () => 42,
        details: {
          '#text': 'classified'
        }
      }
    }

    const result = $$.create({ version: "1.0", encoding: "UTF-8", standalone: true })
      .ele('root').ele(obj).end({ format: "map" })

    $$.deepEqual($$.printMap(result), $$.t`
      M{
        root: M{
          ele: simple element,
          person: M{
            @age: 35,
            name: John,
            ?: pi mypi,
            !: Good guy,
            $: well formed!,
            address: M{
              city: Istanbul,
              street: End of long and winding road
            },
            contact: M{
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

  $$.test('duplicate tag names', () => {
    const result = $$.create().ele('people')
      .ele('person', { name: "xxx" }).up()
      .ele('person', { name: "yyy" }).up()
      .end({ format: "map" })

    $$.deepEqual($$.printMap(result), $$.t`
      M{
        people: M{
          person: [
            M{ @name: xxx },
            M{ @name: yyy }
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
      .end({ format: "map" })

    $$.deepEqual($$.printMap(result), $$.t`
      M{
        people: M{
          #1: hello,
          person: M{ @name: xxx },
          #2: world
        }
      }
      `)
  })

  $$.test('mixed content and duplicate tags', () => {
    const result = $$.create().ele('people')
      .txt('hello')
      .ele('person', { name: "xxx" }).up()
      .ele('person', { name: "yyy" }).up()
      .txt('world')
      .end({ format: "map" })

    $$.deepEqual($$.printMap(result), $$.t`
      M{
        people: M{
          #1: hello,
          person: [
            M{ @name: xxx },
            M{ @name: yyy }
          ],
          #2: world
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
      .end({ format: "map" })

    $$.deepEqual($$.printMap(result), $$.t`
      M{
        people: M{
          #: [
            M{ #: hello },
            M{ person: M{ @name: xxx } },
            M{ #: world },
            M{ person: M{ @name: yyy } }
          ]
        }
      }
      `)
  })

  $$.test('doctype', () => {
    const result = $$.create()
      .dtd({ pubID: "pub", sysID: "sys" }).ele('root').end({ format: "map" })

    $$.deepEqual($$.printMap(result), $$.t`
      M{ root: M{ } }
      `)
  })

  $$.test('namespaces', () => {
    const result = $$.create().ele('root', { xmlns: "myns" })
      .ele('foo').up()
      .ele('bar').up()
      .doc()
      .end({ format: "map" })

    $$.deepEqual($$.printMap(result), $$.t`
      M{
        root: M{
          @xmlns: myns,
          foo: M{ },
          bar: M{ }
        }
      }
      `)
  })

  $$.test('unknown node', () => {
    const ele = $$.create().ele('root').ele('alien')
    Object.defineProperty(ele.node, "nodeType", { value: 1001, writable: false })
    $$.throws(() => ele.end({ format: "map" }))
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
    </data>`

    const result2 = $$.convert(input2, { format: 'map', verbose: true })
    $$.deepEqual($$.printMap(result2), $$.t`
      M{
        data: [
          M{
            row: [
              M{
                @id: 0,
                TYPE: [ X ],
                ID: [ 123 ]
              },
              M{
                @id: 1,
                TYPE: [ Y ],
                ID: [ 321 ]
              }
            ]
          }
        ]
      }`)
    $$.deepEqual($$.create(result2).end({ headless: true, prettyPrint: true }), input2)

    const input1 = $$.t`
    <data>
      <row id="0">
        <TYPE>X</TYPE>
        <ID>123</ID>
      </row>
    </data>`
    const result1 = $$.convert(input1, { format: 'map', verbose: true })
    $$.deepEqual($$.printMap(result1), $$.t`
      M{
        data: [
          M{
            row: [
              M{
                @id: 0,
                TYPE: [ X ],
                ID: [ 123 ]
              }
            ]
          }
        ]
      }`)
    $$.deepEqual($$.create(result1).end({ headless: true, prettyPrint: true }), input1)
  })

})
