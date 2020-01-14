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

    const result = $$.document({ version: "1.0", encoding: "UTF-8", standalone: true })
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

    expect($$.document().ele('root').ele(obj).root().
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

    expect($$.document().ele('root').ele(obj).root().
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
    const result = $$.document().ele('people')
      .ele('person', { name: "xxx" }).up()
      .ele('person', { name: "yyy" }).up()
      .end({ format: "json" })

    expect(result).toBe('{"people":{"person":[{"@name":"xxx"},{"@name":"yyy"}]}}')
  })

  test('mixed content', () => {
    const result = $$.document().ele('people')
      .txt('hello')
      .ele('person', { name: "xxx" }).up()
      .txt('world')
      .end({ format: "json" })

    expect(result).toBe('{"people":{"#1":"hello","person":{"@name":"xxx"},"#2":"world"}}')
  })

  test('mixed content and duplicate tags', () => {
    const result = $$.document().ele('people')
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
    const result = $$.document().ele('people')
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
    const result = $$.document()
      .dtd({ pubID: "pub", sysID: "sys" }).ele('root').end({ format: "json" })

    expect(result).toBe('{"root":{}}')
  })

  test('namespaces', () => {
    const result = $$.document().ele('root', { xmlns: "myns" })
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
    const ele = $$.document().ele('root').ele('alien')
    Object.defineProperty(ele, "nodeType", { value: 1001, writable: false })
    expect(() => ele.end({ format: "json" })).toThrow()
  })
  
})
