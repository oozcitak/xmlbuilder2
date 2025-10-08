import $$ from '../TestHelpers'

$$.suite('dec()', () => {

  $$.test('version', () => {
    const doc = $$.create().ele('root').dec({ encoding: "UTF-8" }).doc()
    $$.deepEqual(doc.end(), '<?xml version="1.0" encoding="UTF-8"?><root/>')
  })

  $$.test('all params', () => {
    const doc = $$.create().ele('root').dec({ version: "1.0", encoding: "UTF-8", standalone: false }).doc()
    $$.deepEqual(doc.end(), '<?xml version="1.0" encoding="UTF-8" standalone="no"?><root/>')
  })

})
