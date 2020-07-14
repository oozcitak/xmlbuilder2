import $$ from '../TestHelpers'

describe('JSONWriter', () => {

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

    const result = $$.create({ version: "1.0", encoding: "UTF-8", standalone: true })
      .ele('root').ele(obj).end({ format: "json", prettyPrint: true })

    expect(result).toBe($$.t`
      {
        "root": {
          "ele": "simple element",
          "person": {
            "@age": "35",
            "name": "John",
            "?": "pi mypi",
            "!": "Good guy",
            "$": "well formed!",
            "address": {
              "city": "Istanbul",
              "street": "End of long and winding road"
            },
            "contact": {
              "phone": [
                "555-1234",
                "555-1235"
              ]
            },
            "id": "42",
            "details": "classified"
          }
        }
      }
      `)
  })

  test('offset', () => {
    const obj = {
      ele: "simple element",
      person: {
        name: "John",
        '@age': 35,
      }
    }

    expect($$.create().ele('root').ele(obj).root().
      toString({ format: "json", prettyPrint: true, offset: 2 })).toBe(
      '    {\n' +
      '      "root": {\n' +
      '        "ele": "simple element",\n' +
      '        "person": {\n' +
      '          "@age": "35",\n' +
      '          "name": "John"\n' +
      '        }\n' +
      '      }\n' +
      '    }'
      )
  })

  test('negative offset', () => {
    const obj = {
      ele: "simple element",
      person: {
        name: "John",
        '@age': 35,
      }
    }

    expect($$.create().ele('root').ele(obj).root().
      toString({ format: "json", prettyPrint: true, offset: -4 })).toBe(
      '{\n' +
      '"root": {\n' +
      '"ele": "simple element",\n' +
      '"person": {\n' +
      '"@age": "35",\n' +
      '"name": "John"\n' +
      '}\n' +
      '}\n' +
      '}'
      )
  })

  test('duplicate tag names', () => {
    const result = $$.create().ele('people')
      .ele('person', { name: "xxx" }).up()
      .ele('person', { name: "yyy" }).up()
      .end({ format: "json" })

    expect(result).toBe('{"people":{"person":[{"@name":"xxx"},{"@name":"yyy"}]}}')
  })

  test('mixed content', () => {
    const result = $$.create().ele('people')
      .txt('hello')
      .ele('person', { name: "xxx" }).up()
      .txt('world')
      .end({ format: "json" })

    expect(result).toBe('{"people":{"#1":"hello","person":{"@name":"xxx"},"#2":"world"}}')
  })

  test('mixed content and duplicate tags', () => {
    const result = $$.create().ele('people')
      .txt('hello')
      .ele('person', { name: "xxx" }).up()
      .ele('person', { name: "yyy" }).up()
      .txt('world')
      .end({ format: "json", prettyPrint: true })

    expect(result).toBe($$.t`
      {
        "people": {
          "#1": "hello",
          "person": [
            { "@name": "xxx" },
            { "@name": "yyy" }
          ],
          "#2": "world"
        }
      }
      `)
  })

  test('mixed content and interspersed duplicate tags', () => {
    const result = $$.create().ele('people')
      .txt('hello')
      .ele('person', { name: "xxx" }).up()
      .txt('world')
      .ele('person', { name: "yyy" }).up()
      .end({ format: "json", prettyPrint: true })

    expect(result).toBe($$.t`
      {
        "people": {
          "#": [
            { "#": "hello" },
            { "person": { "@name": "xxx" } },
            { "#": "world" },
            { "person": { "@name": "yyy" } }
          ]
        }
      }
      `)
  })

  test('doctype', () => {
    const result = $$.create()
      .dtd({ pubID: "pub", sysID: "sys" }).ele('root').end({ format: "json" })

    expect(result).toBe('{"root":{}}')
  })

  test('namespaces', () => {
    const result = $$.create().ele('root', { xmlns: "myns" })
      .ele('foo').up()
      .ele('bar').up()
      .doc()
      .end({ format: "json", prettyPrint: true })

    expect(result).toBe($$.t`
      {
        "root": {
          "@xmlns": "myns",
          "foo": { },
          "bar": { }
        }
      }
      `)
  })

  test('unknown node', () => {
    const ele = $$.create().ele('root').ele('alien')
    Object.defineProperty(ele.node, "nodeType", { value: 1001, writable: false })
    expect(() => ele.end({ format: "json" })).toThrow()
  })
  
  test("verbose", () => {
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

    const json2 = $$.convert(input2, { format: 'json', verbose: true, prettyPrint: true })
    expect(json2).toBe($$.t`
      {
        "data": [
          {
            "row": [
              {
                "@id": "0",
                "TYPE": [
                  "X"
                ],
                "ID": [
                  "123"
                ]
              },
              {
                "@id": "1",
                "TYPE": [
                  "Y"
                ],
                "ID": [
                  "321"
                ]
              }
            ]
          }
        ]
      }`)
    expect($$.create(json2).end({ headless: true, prettyPrint: true })).toBe(input2)

    const input1 = $$.t`
    <data>
      <row id="0">
        <TYPE>X</TYPE>
        <ID>123</ID>
      </row>
    </data>`
    const json1 = $$.convert(input1, { format: 'json', verbose: true, prettyPrint: true })
    expect(json1).toEqual($$.t`
      {
        "data": [
          {
            "row": [
              {
                "@id": "0",
                "TYPE": [
                  "X"
                ],
                "ID": [
                  "123"
                ]
              }
            ]
          }
        ]
      }`)
    expect($$.create(json1).end({ headless: true, prettyPrint: true })).toBe(input1)
  })

})
