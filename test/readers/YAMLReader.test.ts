import $$ from '../TestHelpers'

$$.suite('YAMLReader', () => {

  $$.test('basic', () => {
    const yaml = $$.t`
    # yaml test
    %YAML 1.2
    # comment
    ---
    "root":
      "ele": "simple element"
      "person":
        "@age": "35"
        "name": "John"
        "?": "pi mypi"
        "!": "Good guy"
        "$": "well formed!"
        "address":
          "city": "Istanbul"
          "street": "End of long and winding road"
        "contact":
          "phone":
          - "555-1234"
          - "555-1235"
        "id": "42"
        "details": "classified"
    `
    const obj = {
      root: {
        ele: "simple element",
        person: {
          name: "John",
          '@age': '35',
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
          id: '42',
          details: 'classified'
        }
      }
    }

    const result = $$.create(yaml).end({ format: "object" })
    $$.deepEqual(result, obj)
  })

  $$.test('empty document', () => {
    const doc = $$.create('---')
    $$.deepEqual(doc.end(), '<?xml version="1.0"?>')
  })

})
