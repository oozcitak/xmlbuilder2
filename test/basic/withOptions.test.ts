import $$ from '../TestHelpers'

$$.suite('withOptions()', () => {

  $$.test('XML declaration', () => {
    $$.deepEqual(
      $$.create({ version: "1.0", encoding: "UTF-8", standalone: true })
        .ele('root').end(),
          '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><root/>'
        )

    $$.deepEqual(
      $$.create({ version: "1.0", encoding: "UTF-16", standalone: false })
        .ele('root').end(),
          '<?xml version="1.0" encoding="UTF-16" standalone="no"?><root/>'
        )
  })

  $$.test('zero length converter strings', () => {
    $$.throws(() => $$.create({ convert: { att: "" } }))
    $$.throws(() => $$.create({ convert: { ins: "" } }))
    $$.throws(() => $$.create({ convert: { text: "" } }))
    $$.throws(() => $$.create({ convert: { cdata: "" } }))
    $$.throws(() => $$.create({ convert: { comment: "" } }))
  })

})
