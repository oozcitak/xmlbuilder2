import $$ from '../TestHelpers'
import { select } from "xpath"

$$.suite('Replicate issue', () => {

  // https://github.com/oozcitak/xmlbuilder2/issues/43
  $$.test('#43 - Add an Element (from XPath query) to xmlbuilder2 object', () => {
    const doc1 = $$.create()
      .ele("records")
        .ele("record", { id: 1 }).up()
        .ele("record", { id: 2 }).up()
      .doc()

    const doc2 = $$.create()
      .ele("results")
      .doc()

    const result = select("//record", doc1.node as any)
    if (result && result.length && result.length !== 0) {
      const recordNode = $$.builder(result[0] as any)
      doc2.root().import(recordNode)
    }
    $$.deepEqual(doc2.end({ prettyPrint: true }), $$.t`
    <?xml version="1.0"?>
    <results>
      <record id="1"/>
    </results>
    `)
  })
})
