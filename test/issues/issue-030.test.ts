import $$ from "../TestHelpers";

describe("Replicate issue", () => {
  // https://github.com/oozcitak/xmlbuilder2/issues/30
  test("#30 - Conversion from XML to JSON array inconsistency", () => {
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

    const obj2 = $$.convert(input2, { format: 'object', verbose: true })
    expect(obj2).toEqual(
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
              }
            ]
          }
        ]
      })
    expect($$.create(obj2).end({ headless: true, prettyPrint: true })).toBe(input2)

    const input1 = $$.t`
    <data>
      <row id="0">
        <TYPE>X</TYPE>
        <ID>123</ID>
      </row>
    </data>`
    const obj1 = $$.convert(input1, { format: 'object', verbose: true })
    expect(obj1).toEqual(
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
    expect($$.create(obj1).end({ headless: true, prettyPrint: true })).toBe(input1)
  })

})
