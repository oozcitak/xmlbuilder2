import $$ from "../TestHelpers";

describe("Replicate issue", () => {
  // https://github.com/oozcitak/xmlbuilder2/issues/2
  test(`#2 - Reconsider allowing XML file creation in chunks`, (done) => {
    const xmlStream = $$.createCB({ prettyPrint: true })

    const item1 = $$.create({
      item: {
        sku: '001',
        name: 'Product name 1',
      }
    });
    const item2 = $$.create({
      item: {
        sku: '002',
        name: 'Product name 2',
      }
    });

    xmlStream.dec().ele('rss').import(item1).import(item2).end()

    $$.expectCBResult(xmlStream, $$.t`
    <?xml version="1.0"?>
    <rss>
      <item>
        <sku>
          001
        </sku>
        <name>
          Product name 1
        </name>
      </item>
      <item>
        <sku>
          002
        </sku>
        <name>
          Product name 2
        </name>
      </item>
    </rss>
    `, done)
  })

})
