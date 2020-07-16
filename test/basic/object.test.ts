import $$ from '../TestHelpers'

describe('object', () => {

  test('from JS object with decorators', () => {
    const obj = {
      ele: "simple element",
      person: {
        name: "John",
        '@age': 35,
        '?': 'pi mypi',
        '!': 'Good guy',
        '$': 'well formed!',
        address: {
          '?': 'pi',
          city: "Istanbul",
          street: "End of long and winding road"
        },
        contact: {
          phone: ["555-1234", "555-1235"]
        },
        id: () => 42,
        details: {
          '#': 'classified'
        }
      }
    }

    const doc = $$.create().ele('root').ele(obj).doc()

    expect($$.printTree(doc.node)).toBe($$.t`
      root
        ele
          # simple element
        person age="35"
          name
            # John
          ? pi mypi
          ! Good guy
          $ well formed!
          address
            ? pi
            city
              # Istanbul
            street
              # End of long and winding road
          contact
            phone
              # 555-1234
            phone
              # 555-1235
          id
            # 42
          details
            # classified
      `)
  })

  test('from map with decorators', () => {
    const obj = new Map<string, any>()
    obj.set("ele", "simple element")
    const person = new Map<string, any>()
    obj.set("person", person)
    person.set("name", "John")
    person.set("@age", 35)
    person.set("?", "pi mypi")
    person.set("!", "Good guy")
    person.set("$", "well formed!")
    const address = new Map<string, any>()
    person.set("address", address)
    address.set("city", "Istanbul")
    address.set("street", "End of long and winding road")
    const contact = new Map<string, any>()
    person.set("contact", contact)
    const numbers = new Array<string>()
    contact.set("phone", numbers)
    numbers.push("555-1234")
    numbers.push("555-1235")
    person.set("id", () => 42)
    const details = new Map<string, any>()
    person.set("details", details)
    details.set("#", "classified")

    const doc = $$.create().ele('root').ele(obj).doc()

    expect($$.printTree(doc.node)).toBe($$.t`
      root
        ele
          # simple element
        person age="35"
          name
            # John
          ? pi mypi
          ! Good guy
          $ well formed!
          address
            city
              # Istanbul
            street
              # End of long and winding road
          contact
            phone
              # 555-1234
            phone
              # 555-1235
          id
            # 42
          details
            # classified
      `)
  })

  test('from function', () => {
    const doc = $$.create().ele('root').ele(() => {
      const arr = []
      for (let i = 1; i < 5; i++) {
        arr.push({ "#": "ele" + i.toString() })
      }
      return { node: arr }
    }).doc()

    expect($$.printTree(doc.node)).toBe($$.t`
      root
        node
          # ele1
        node
          # ele2
        node
          # ele3
        node
          # ele4
    `)
  })

  test('multiple cdata nodes', () => {
    const doc = $$.create().ele('root').ele({
      '$': ['data1', 'data2']
    }).doc()

    expect($$.printTree(doc.node)).toBe($$.t`
      root
        $ data1
        $ data2
    `)
  })

  test('multiple comment nodes', () => {
    const doc = $$.create().ele('root').ele({
      '!': ['comment1', 'comment2']
    }).doc()

    expect($$.printTree(doc.node)).toBe($$.t`
      root
        ! comment1
        ! comment2
    `)
  })

  test('multiple processing instruction nodes', () => {
    const doc = $$.create().ele('root').ele({
      '?1': ['target0', 'target1 value1', 'target2 value2'],
      '?2': { target3: 'value3', target4: 'value4' }
    }).doc()

    expect($$.printTree(doc.node)).toBe($$.t`
      root
        ? target0
        ? target1 value1
        ? target2 value2
        ? target3 value3
        ? target4 value4
    `)
  })

  test('empty nodes', () => {
    const obj = {
      root: {
        node1: [],
        node2: {},
        node3: null
      }
    }
    const doc = $$.create().ele(obj).doc()

    expect($$.printTree(doc.node)).toBe($$.t`
      root
        node2
    `)
  })

  test('mixed content', () => {
    const obj = {
      root: {
        node1: "val1",
        "#": {
          "#1": "some text",
          node: "and a node",
          "#2": "more text"
        },
        node3: "val3"
      }
    }
    const doc = $$.create().ele(obj).doc()

    expect($$.printTree(doc.node)).toBe($$.t`
      root
        node1
          # val1
        # some text
        node
          # and a node
        # more text
        node3
          # val3
    `)
  })

  test('namespace', () => {
    const obj = {
      root: {
        "@xmlns": "myns",
        node: "val",
      }
    }
    const doc = $$.create().ele(obj).doc()

    expect($$.printTree(doc.node)).toBe($$.t`
      root (ns:myns) xmlns="myns" (ns:http://www.w3.org/2000/xmlns/)
        node (ns:myns)
          # val
    `)
  })

  test('default custom namespace', () => {
    const obj = { ele: { '@att': 'val' } }
    const doc = $$.create({ defaultNamespace: { ele: 'ele-ns', att: 'att-ns' } }).ele(obj).doc()

    expect($$.printTree(doc.node)).toBe($$.t`
      ele (ns:ele-ns) att="val" (ns:att-ns)
    `)
  })

  test('namespace prefix', () => {
    const obj = {
      "ns1:root": {
        "@xmlns:ns1": "myns",
        node: "val",
      }
    }
    const doc = $$.create().ele(obj).doc()

    expect($$.printTree(doc.node)).toBe($$.t`
      ns1:root (ns:myns) xmlns:ns1="myns" (ns:http://www.w3.org/2000/xmlns/)
        node
          # val
    `)
  })

  test('skip null and undefined att values', () => {
    const root = $$.create().ele({
      root: {
        node1: {
          '@att': 'val',
          '@att1': 'val1',
          '@att2': null,
          '@att3': undefined
        }
      }
    })
    expect($$.printTree(root.doc().node)).toBe($$.t`
      root
        node1 att="val" att1="val1"
      `)
  })

  test('keep null att value with keepNullAttributes flag', () => {
    const root = $$.create({ keepNullAttributes: true }).ele({
      root: {
        node1: {
          '@att': 'val',
          '@att1': 'val1',
          '@att2': null,
          '@att3': undefined
        }
      }
    })
    expect($$.printTree(root.doc().node)).toBe($$.t`
      root
        node1 att="val" att1="val1" att2="" att3=""
      `)
  })

  test('skip null and undefined node value', () => {
    const root = $$.create({ keepNullAttributes: true }).ele({
      root: {
        node1: '',
        node2: {},
        node3: null,
        node4: undefined
      }
    })
    expect($$.printTree(root.doc().node)).toBe($$.t`
      root
        node1
        node2
      `)
  })

  test('keep null node value with keepNullNodes flag', () => {
    const root = $$.create({ keepNullNodes: true }).ele({
      root: {
        node1: '',
        node2: {},
        node3: null,
        node4: undefined
      }
    })
    expect($$.printTree(root.doc().node)).toBe($$.t`
      root
        node1
        node2
        node3
        node4
      `)
  })

  test('invalid attributes', () => {
    const obj = {
      '@': [ 'att1 val1', 'att2 val2' ]
    }
    const root = $$.create({ keepNullNodes: true }).ele('root')
    expect(() => root.ele(obj)).toThrow()
  })

  test('custom converter', () => {
    const obj = {
      'root': {
        '_att': 'val',
        '#': '42'
      }
    }
    const doc = $$.create({ convert: { att: '_' } }).ele(obj).doc()
    expect(doc.end({ headless: true })).toBe('<root att="val">42</root>')
  })

  test('error if no nodes created', () => {
    expect(() => $$.create().ele({})).toThrow()
  })

  test('exec function', () => {
    const nums = [1, 2, 3, 4, 5]
    const obj = {
      squares: {
        '#': () => nums.map(i => ({ data: { '@x': i, '@y': i * i } }))
      }
    }
    expect($$.create(obj).end({ prettyPrint: true, headless: true })).toBe($$.t`
    <squares>
      <data x="1" y="1"/>
      <data x="2" y="4"/>
      <data x="3" y="9"/>
      <data x="4" y="16"/>
      <data x="5" y="25"/>
    </squares>
    `)
  })

  test('falsy values', () => {
    const obj = {
      value: {
        string: '',
        number: 0,
        boolean: false
      }
    }
    expect($$.create(obj).end({ prettyPrint: true, headless: true })).toBe($$.t`
    <value>
      <string/>
      <number>0</number>
      <boolean>false</boolean>
    </value>
    `)
  })

})
