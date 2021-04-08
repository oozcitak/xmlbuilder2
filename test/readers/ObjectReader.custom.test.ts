import $$ from '../TestHelpers'

describe('custom ObjectReader', () => {

  test('skip comments', () => {
    const obj = {
      ele: 'element',
      '!': 'comment'
    }

    const doc = $$.create({ parser: { comment: () => undefined } }).ele('root').ele(obj).doc()

    expect($$.printTree(doc.node)).toBe($$.t`
      root
        ele
          # element
      `)
  })

  test('skip all nodes', () => {
    const obj = {
      ele: "simple element",
      person: {
        name: "John",
        '@': { 'age': 35, 'weight': 75 },
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

    const doc = $$.create({
      parser: {
        attribute: () => undefined,
        cdata: () => undefined,
        docType: () => undefined,
        element: () => undefined,
        instruction: () => undefined,
        text: () => undefined,
        comment: () => undefined
      }
    }).ele('root').ele(obj).doc()

    expect($$.printTree(doc.node)).toBe($$.t`
      root
      `)
  })

  test('custom sanitizer', () => {
    const obj = {
      ele: 'element\0',
      '!': '\0comment'
    }

    const doc = $$.create({ parser: { sanitize: () => "clean" } }).ele('root').ele(obj).doc()

    expect($$.printTree(doc.node)).toBe($$.t`
      root
        clean
          # clean
        ! clean
      `)
  })

})
