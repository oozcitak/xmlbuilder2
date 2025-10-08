import $$ from '../TestHelpers'
import { select } from "xpath"

$$.suite('Replicate issue', () => {

  // https://github.com/oozcitak/xmlbuilder2/issues/44
  $$.test('#44 - Converting XML to JSON does not escape invalid string characters', () => {
    const jsonStr = $$.convert('<a>b\nc</a>', { format: 'json' })
    $$.deepEqual(jsonStr, `{"a":"b\\nc"}`)

    const invalidChars = Array.from(Array(0x20), (_, i) => {
      return String.fromCharCode(i);
    }).concat('"', '\\')

    const xml = $$.convert(
      `<a>${invalidChars.map((c) => `<b>_${c}_</b>`).join('\n')}</a>`
    )
    const json = $$.convert(xml, { format: 'json' })
    $$.doesNotThrow(() => JSON.parse(json))

    const obj = $$.convert(xml, { format: 'object' })
    $$.deepEqual(JSON.stringify(obj), json)
  })
})
