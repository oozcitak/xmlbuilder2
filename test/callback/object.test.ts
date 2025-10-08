import $$ from '../TestHelpers'

$$.suite('object', () => {

  $$.test('from JS object with decorators', async () => {
    const obj = {
      root: {
        ele: "simple element",
        person: {
          name: "John",
          '@age': 35,
          '?1': 'pi val',
          '?2': 'pi',
          '!': 'Good guy',
          '$': 'well formed!',
          address: {
            '?': 'pi',
            city: "Istanbul",
            street: "End of long and winding road"
          },
          contact: {
            phone: ["555-1234", "555-1235"]
          },
          id: () => 42,
          details: {
            '#': 'classified'
          }
        }
      }
    }

    const xmlStream = $$.createCB({ prettyPrint: true })

    xmlStream.ele(obj).end()

    await $$.expectCBResult(xmlStream, $$.t`
    <root>
      <ele>
        simple element
      </ele>
      <person age="35">
        <name>
          John
        </name>
        <?pi val?>
        <?pi?>
        <!--Good guy-->
        <![CDATA[well formed!]]>
        <address>
          <?pi?>
          <city>
            Istanbul
          </city>
          <street>
            End of long and winding road
          </street>
        </address>
        <contact>
          <phone>
            555-1234
          </phone>
          <phone>
            555-1235
          </phone>
        </contact>
        <id>
          42
        </id>
        <details>
          classified
        </details>
      </person>
    </root>
    `)
  })

  $$.test('namespace', async () => {
    const obj = {
      root: {
        "@xmlns": "ns"
      }
    }

    const xmlStream = $$.createCB({ prettyPrint: true })

    xmlStream.ele(obj).end()

    await $$.expectCBResult(xmlStream, $$.t`
    <root xmlns="ns"/>
    `)
  })

  $$.test('element with namespace', async () => {
    const obj = {
      "root@ns": {}
    }

    const xmlStream = $$.createCB({ prettyPrint: true })

    xmlStream.ele(obj).end()

    await $$.expectCBResult(xmlStream, $$.t`
    <root xmlns="ns"/>
    `)
  })

  $$.test('attribute with namespace', async () => {
    const obj = {
      root: {
        "@isbn@book": "111"
      }
    }

    const xmlStream = $$.createCB({ prettyPrint: true })

    xmlStream.ele(obj).end()

    await $$.expectCBResult(xmlStream, $$.t`
    <root xmlns:ns1="book" ns1:isbn="111"/>
    `)
  })

})
