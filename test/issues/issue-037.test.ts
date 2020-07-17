import $$ from "../TestHelpers";

describe("Replicate issue", () => {
  // https://github.com/oozcitak/xmlbuilder2/issues/37
  test("#37 - namespace error with AEM content fragment", () => {
    const cf = {
      'jcr:root': {
        '@xmlns:jcr': 'http://www.jcp.org/jcr/1.0',
        'jcr:content' :{
          data: {
            master: {
              '@id': '1234'
            }
          }
        }
      }
    }
    const doc = $$.create(cf);
    const xml = doc.end({ headless: true, prettyPrint: true });    
    expect(xml).toEqual($$.t`
    <jcr:root xmlns:jcr="http://www.jcp.org/jcr/1.0">
      <jcr:content>
        <data>
          <master id="1234"/>
        </data>
      </jcr:content>
    </jcr:root>
    `)

  })

})
