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
          city: "Istanbul",
          street: "End of long and winding road"
        },
        contact: {
          phone: [ "555-1234", "555-1235" ]
        },
        id: () => 42,
        details: {
          '#': 'classified'
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

})
