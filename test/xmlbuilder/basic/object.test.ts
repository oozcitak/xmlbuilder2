import $$ from '../TestHelpers'

describe('object', () => {

  test('from JS object - decorators', () => {
    const obj = {
      ele: "simple element",
      person: {
        name: "John",
        '@age': 35,
        '?pi': 'mypi',
        '#comment': 'Good guy',
        '#cdata': 'well formed!',
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

    const doc = $$.create('root').ele(obj).doc()

    expect($$.printTree(doc)).toBe($$.t`
      root
        ele
          # simple element
        person age="35"
          name
            # John
          ? pi mypi
          ! Good guy
          [ well formed!
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

})
