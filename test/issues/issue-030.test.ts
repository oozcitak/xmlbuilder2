import $$ from "../TestHelpers";

$$.suite("Replicate issue", () => {
  // https://github.com/oozcitak/xmlbuilder2/issues/30
  $$.test("#30 - Conversion from XML to JSON array inconsistency", () => {
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
              }
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
  })

})
