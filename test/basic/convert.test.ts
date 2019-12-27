import $$ from '../TestHelpers'

describe('convert()', () => {

  test('From XML string to XML string', () => {
    const xml = $$.convert('<root att="val">text</root>', { format: "xml" })
    expect(xml).toBe(`<?xml version="1.0"?><root att="val">text</root>`)
  })

  test('From XML string to XML string with options', () => {
    const xml = $$.convert({ version: "1.1" }, '<root att="val">text</root>', { format: "xml" })
    expect(xml).toBe(`<?xml version="1.1"?><root att="val">text</root>`)
  })

  test('From XML string to JS object', () => {
    const xml = $$.convert('<root att="val">text</root>', { format: "object" })
    expect(xml).toEqual({ root: { "@att": "val", "#": "text" }})
  })

  test('From XML string to JSON string', () => {
    const xml = $$.convert('<root att="val">text</root>', { format: "json" })
    expect(xml).toBe(`{"root":{"@att":"val","#":"text"}}`)
  })

  test('From XML string to Map', () => {
    const xml = $$.convert('<root att="val">text</root>', { format: "map" })
    expect(xml).toEqual(new Map([["root", new Map([["@att", "val"], ["#", "text" ]])]]))
  })

  test('From JS object to XML string', () => {
    const xml = $$.convert({ root: { "@att": "val", "#": "text" }}, { format: "xml" })
    expect(xml).toBe(`<?xml version="1.0"?><root att="val">text</root>`)
  })

  test('From JS object to XML string with options', () => {
    const xml = $$.convert({ version: "1.1" }, { root: { "@att": "val", "#": "text" }}, { format: "xml" })
    expect(xml).toBe(`<?xml version="1.1"?><root att="val">text</root>`)
  })

  test('From JS object to JS object', () => {
    const xml = $$.convert({ root: { "@att": "val", "#": "text" }}, { format: "object" })
    expect(xml).toEqual({ root: { "@att": "val", "#": "text" }})
  })

  test('From JS object to JSON string', () => {
    const xml = $$.convert({ root: { "@att": "val", "#": "text" }}, { format: "json" })
    expect(xml).toBe(`{"root":{"@att":"val","#":"text"}}`)
  })

  test('From JS object to Map', () => {
    const xml = $$.convert({ root: { "@att": "val", "#": "text" }}, { format: "map" })
    expect(xml).toEqual(new Map([["root", new Map([["@att", "val"], ["#", "text" ]])]]))
  })

  test('From JSON string to XML string', () => {
    const xml = $$.convert(`{ "root": { "@att": "val", "#": "text" }}`, { format: "xml" })
    expect(xml).toBe(`<?xml version="1.0"?><root att="val">text</root>`)
  })

  test('From JSON string to XML string with options', () => {
    const xml = $$.convert({ version: "1.1" }, `{ "root": { "@att": "val", "#": "text" }}`, { format: "xml" })
    expect(xml).toBe(`<?xml version="1.1"?><root att="val">text</root>`)
  })

  test('From JSON string to JS object', () => {
    const xml = $$.convert(`{ "root": { "@att": "val", "#": "text" }}`, { format: "object" })
    expect(xml).toEqual({ root: { "@att": "val", "#": "text" }})
  })

  test('From JSON string to JSON string', () => {
    const xml = $$.convert(`{ "root": { "@att": "val", "#": "text" }}`, { format: "json" })
    expect(xml).toBe(`{"root":{"@att":"val","#":"text"}}`)
  })

  test('From JSON string to Map', () => {
    const xml = $$.convert(`{ "root": { "@att": "val", "#": "text" }}`, { format: "map" })
    expect(xml).toEqual(new Map([["root", new Map([["@att", "val"], ["#", "text" ]])]]))
  })

  test('From Map to XML string', () => {
    const xml = $$.convert(new Map([["root", new Map([["@att", "val"], ["#", "text" ]])]]), { format: "xml" })
    expect(xml).toBe(`<?xml version="1.0"?><root att="val">text</root>`)
  })

  test('From Map to XML string with options', () => {
    const xml = $$.convert({ version: "1.1" }, new Map([["root", new Map([["@att", "val"], ["#", "text" ]])]]), { format: "xml" })
    expect(xml).toBe(`<?xml version="1.1"?><root att="val">text</root>`)
  })

  test('From Map to JS object', () => {
    const xml = $$.convert(new Map([["root", new Map([["@att", "val"], ["#", "text" ]])]]), { format: "object" })
    expect(xml).toEqual({ root: { "@att": "val", "#": "text" }})
  })

  test('From Map to JSON string', () => {
    const xml = $$.convert(new Map([["root", new Map([["@att", "val"], ["#", "text" ]])]]), { format: "json" })
    expect(xml).toBe(`{"root":{"@att":"val","#":"text"}}`)
  })

  test('From Map to Map', () => {
    const xml = $$.convert(new Map([["root", new Map([["@att", "val"], ["#", "text" ]])]]), { format: "map" })
    expect(xml).toEqual(new Map([["root", new Map([["@att", "val"], ["#", "text" ]])]]))
  })

})
