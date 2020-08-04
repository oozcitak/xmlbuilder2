import $$ from '../TestHelpers'

describe('convert()', () => {

  const matrix: { [key: string]: any } = {
    xml: `<?xml version="1.0"?><root att="val">text</root>`,
    object: { root: { "@att": "val", "#": "text" }},
    json: `{"root":{"@att":"val","#":"text"}}`,
    map: new Map([["root", new Map([["@att", "val"], ["#", "text" ]])]]),
    yaml: $$.t`
      ---
      "root":
        "@att": "val"
        "#": "text"
      `
  }

  test('Conversion matrix', () => {
    const formats = Object.keys(matrix)
    for (const inputFormat of formats)
    {
      const input = matrix[inputFormat]
      for (const outputFormat of formats)
      {
        const output = matrix[outputFormat]
        expect($$.convert(input, { format: outputFormat})).toEqual(output)
      }
    }
  })

  test('From XML string to XML string with default options', () => {
    const xml = $$.convert('<root att="val">text</root>')
    expect(xml).toBe(`<?xml version="1.0"?><root att="val">text</root>`)
  })

  test('Conversion to XML string with options', () => {
    const formats = Object.keys(matrix)
    for (const inputFormat of formats)
    {
      const input = matrix[inputFormat]
      expect($$.convert({ version: "1.0" }, input, { format: "xml" })).toBe(matrix["xml"])
    }
  })

})
