import $$ from "../TestHelpers";

describe("Replicate issue", () => {
  // https://github.com/oozcitak/xmlbuilder2/issues/29
  test("#29 - Attribute is a node", () => {
    const input = $$.t`
    <resources>
      <string name="countdown">
        <xliff:g id="count" example="2 days">%1$s</xliff:g>
        until holiday
        <xliff:g id="time" example="5 days">%1$s</xliff:g>
        anything
      </string>
    </resources>`

    // test with default converter
    expect($$.convert(input, { format: 'object' })).toEqual(
      {
        resources: {
          string: {
            '@name': 'countdown',
            '#': [
              {
                'xliff:g': {
                  '@id': 'count',
                  '@example': '2 days',
                  '#': '%1$s'
                }
              },
              { '#': '\n    until holiday\n    ' },
              {
                'xliff:g': {
                  '@id': 'time',
                  '@example': '5 days',
                  '#': '%1$s'
                }
              },
              { '#': '\n    anything\n  ' },
            ]
          }
        }
      }
    )

    // test with custom converter
    const obj = $$.convert({ encoding: 'UTF-8', convert: { text: 'value' } }, input, { format: 'object' })

    expect(obj).toEqual(
      {
        resources: {
          string: {
            '@name': 'countdown',
            value: [
              {
                'xliff:g': {
                  '@id': 'count',
                  '@example': '2 days',
                  value: '%1$s'
                }
              },
              { value: '\n    until holiday\n    ' },
              {
                'xliff:g': {
                  '@id': 'time',
                  '@example': '5 days',
                  value: '%1$s'
                }
              },
              { value: '\n    anything\n  ' },
            ]
          }
        }
      }
    )
  })

})
