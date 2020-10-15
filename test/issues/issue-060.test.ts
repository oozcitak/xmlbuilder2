import $$ from "../TestHelpers";

describe("Replicate issue", () => {
  // https://github.com/oozcitak/xmlbuilder2/issues/60
  test(`#60 - How to add stylesheet for sitemap?`, () => {
    const doc = $$.create({ version: '1.0', encoding: 'UTF-8' })
      .ins('xml-stylesheet', 'type="text/xsl" href="//example.com/sitemap.xsl"')
      .ele('sitemapindex', { xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9' })
        .ele('sitemap')
          .ele('loc').txt('https://example.com/sitemap-posts.xml').up()
          .ele('lastmod').txt('2020-10-06T14:04:09.000Z').up()
        .up()
      .up()
    .doc()

    expect(doc.end({prettyPrint: true })).toBe($$.t`
    <?xml version="1.0" encoding="UTF-8"?>
    <?xml-stylesheet type="text/xsl" href="//example.com/sitemap.xsl"?>
    <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <sitemap>
        <loc>https://example.com/sitemap-posts.xml</loc>
        <lastmod>2020-10-06T14:04:09.000Z</lastmod>
      </sitemap>
    </sitemapindex>
    `)
  })

})
