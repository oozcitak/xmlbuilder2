import $$ from '../TestHelpers'

$$.suite('Replicate issue', () => {

  // https://github.com/oozcitak/xmlbuilder2/issues/13
  $$.test('#13 - Parsing JS object with default namespace declaration attribute throws error', () => {
    const str = $$.convert(
      { feed: { "@xmlns": "http://www.w3.org/2005/Atom" } },
      { headless: true, wellFormed: true }
    )

    $$.deepEqual(str, `<feed xmlns="http://www.w3.org/2005/Atom"/>`)
  })

  $$.test('#13 - with prefix', () => {
    const str = $$.convert(
      { "p:feed": { "@xmlns:p": "http://www.w3.org/2005/Atom" } },
      { headless: true, wellFormed: true }
    )

    $$.deepEqual(str, `<p:feed xmlns:p="http://www.w3.org/2005/Atom"/>`)
  })

})
