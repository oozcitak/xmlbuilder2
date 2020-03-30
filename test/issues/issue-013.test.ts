import $$ from '../TestHelpers'

describe('Replicate issue', () => {

  // https://github.com/oozcitak/xmlbuilder2/issues/13
  test('#13 - Parsing JS object with default namespace declaration attribute throws error', () => {
    const str = $$.convert(
      { feed: { "@xmlns": "http://www.w3.org/2005/Atom" } },
      { headless: true, wellFormed: true }
    )
      
    expect(str).toBe(`<feed xmlns="http://www.w3.org/2005/Atom"/>`)
  })

  test('#13 - with prefix', () => {
    const str = $$.convert(
      { "p:feed": { "@xmlns:p": "http://www.w3.org/2005/Atom" } },
      { headless: true, wellFormed: true }
    )
      
    expect(str).toBe(`<p:feed xmlns:p="http://www.w3.org/2005/Atom"/>`)
  })

})
