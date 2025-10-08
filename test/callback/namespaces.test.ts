import $$ from '../TestHelpers'

$$.suite('namespaces', () => {

  $$.test('default namespace', async () => {
    const xmlStream = $$.createCB({ prettyPrint: true })

    xmlStream.ele('root', { xmlns: "ns" })
      .ele('foo').up()
      .ele('bar').up().end()

    await $$.expectCBResult(xmlStream, $$.t`
      <root xmlns="ns">
        <foo/>
        <bar/>
      </root>`)
  })

  $$.test('XML namespace', async () => {
    const xmlStream = $$.createCB({ prettyPrint: true })

    xmlStream.ele('http://www.w3.org/XML/1998/namespace', 'root')
      .ele('foo').up()
      .ele('bar').up()
      .end()

      await $$.expectCBResult(xmlStream, $$.t`
        <xml:root>
          <foo/>
          <bar/>
        </xml:root>`)
  })

  $$.test('duplicate namespaces', async () => {
    const xmlStream = $$.createCB({ prettyPrint: true })

    xmlStream.ele('d:root', { "xmlns:d": "ns1" })
      .ele('e:foo', { "xmlns:e": "ns1" }).up()
      .ele('bar').up()
      .end()

    await $$.expectCBResult(xmlStream, $$.t`
      <d:root xmlns:d="ns1">
        <e:foo xmlns:e="ns1"/>
        <bar/>
      </d:root>
      `)
  })

  $$.test('attribute with namespace and no prefix', async () => {
    const xmlStream = $$.createCB({ prettyPrint: true })

    xmlStream.ele('r', { "xmlns:x0": "ns", "xmlns:x2": "ns" })
      .ele('b', { "xmlns:x1": "ns" })
      .att('ns', 'name', 'v')
      .end()

    await $$.expectCBResult(xmlStream, $$.t`
      <r xmlns:x0="ns" xmlns:x2="ns">
        <b xmlns:x1="ns" x1:name="v"/>
      </r>`)
  })

  $$.test('nested default namespace declaration attributes with same namespace are ignored', async () => {
    const xmlStream = $$.createCB({ prettyPrint: true })

    xmlStream.ele('ns', 'r')
      .att('http://www.w3.org/2000/xmlns/', 'xmlns', 'ns')
      .ele('ns', 'n')
      .att('http://www.w3.org/2000/xmlns/', 'xmlns', 'ns')
      .end()

    await $$.expectCBResult(xmlStream, $$.t`
      <r xmlns="ns">
        <n/>
      </r>`)
  })

  $$.test('prefix of an attribute is replaced with another existing prefix mapped to the same namespace URI - 1', async () => {
    const xmlStream = $$.createCB({ prettyPrint: true })

    xmlStream.ele('r')
      .att('xmlns:xx', 'uri')
      .att('uri', 'p:name', 'v')
      .end()

    await $$.expectCBResult(xmlStream, $$.t`
      <r xmlns:xx="uri" xx:name="v"/> `)
  })

  $$.test('prefix of an attribute is replaced with another existing prefix mapped to the same namespace URI - 2', async () => {
    const xmlStream = $$.createCB({ prettyPrint: true })

    xmlStream.ele('r', { "xmlns:xx": "uri" })
      .ele('b')
      .att('uri', 'p:name', 'value')
      .end()

    await $$.expectCBResult(xmlStream, $$.t`
      <r xmlns:xx="uri">
        <b xx:name="value"/>
      </r> `)
  })

  $$.test('prefix of an attribute is NOT preserved if neither its prefix nor its namespace URI is not already used', async () => {
    const xmlStream = $$.createCB({ prettyPrint: true })

    xmlStream.ele('r')
      .att('xmlns:xx', 'uri')
      .att('uri2', 'p:name', 'value')
      .end()

    await $$.expectCBResult(xmlStream, $$.t`
      <r xmlns:xx="uri" xmlns:p="uri2" p:name="value"/> `)
  })

  $$.test('same prefix declared in an ancestor element', async () => {
    const xmlStream = $$.createCB({ prettyPrint: true })

    xmlStream.ele('uri1', 'p:root')
      .ele('child')
      .att('uri2', 'p:foobar', 'value')
      .end()

    await $$.expectCBResult(xmlStream, $$.t`
      <p:root xmlns:p="uri1">
        <child xmlns:ns1="uri2" ns1:foobar="value"/>
      </p:root> `)
  })

  $$.test('drop element prefix if the namespace is same as inherited default namespace', async () => {
    const xmlStream = $$.createCB({ prettyPrint: true })

    xmlStream.ele('uri', 'root')
      .ele('uri', 'p:child')
      .end()

    await $$.expectCBResult(xmlStream, $$.t`
      <root xmlns="uri">
        <child/>
      </root> `)
  })

  $$.test('find an appropriate prefix', async () => {
    const xmlStream = $$.createCB({ prettyPrint: true })

    xmlStream.ele('u1', 'p1:root')
      .ele('u1', 'p2:child')
      .ele('u1', 'child2')
      .end()

    await $$.expectCBResult(xmlStream, $$.t`
      <p1:root xmlns:p1="u1">
        <p1:child>
          <p1:child2/>
        </p1:child>
      </p1:root> `)
  })

  $$.test('xmlns:* attributes', async () => {
    const xmlStream = $$.createCB({ prettyPrint: true })

    xmlStream.ele('uri1', 'p:root')
      .att('http://www.w3.org/2000/xmlns/', 'xmlns:p', 'uri2')
      .end()

    await $$.expectCBResult(xmlStream, $$.t`
      <ns1:root xmlns:ns1="uri1" xmlns:p="uri2"/> `)
  })

  $$.test('prefix re-declared in ancestor element', async () => {
    const xmlStream = $$.createCB({ prettyPrint: true })

    xmlStream.ele('root')
      .att('http://www.w3.org/2000/xmlns/', 'xmlns:p', 'uri2')
      .ele('uri1', 'p:child')
      .end()

    await $$.expectCBResult(xmlStream, $$.t`
      <root xmlns:p="uri2">
        <p:child xmlns:p="uri1"/>
      </root> `)
  })

  $$.test('default namespace does not apply if was declared in an ancestor', async () => {
    const xmlStream = $$.createCB({ prettyPrint: true })

    xmlStream.ele('root', { "xmlns:x": "uri1" })
      .ele('table', { xmlns: "uri1" })
      .end()

    await $$.expectCBResult(xmlStream, $$.t`
      <root xmlns:x="uri1">
        <table xmlns="uri1"/>
      </root> `)
  })

  $$.test('multiple generated prefixes', async () => {
    const xmlStream = $$.createCB({ prettyPrint: true })

    xmlStream.ele('root')
      .ele('child1').att('uri1', 'attr1', 'value1').att('uri2', 'attr2', 'value2').up()
      .ele('child2').att('uri3', 'attr3', 'value3')
      .end()

    await $$.expectCBResult(xmlStream, $$.t`
      <root>
        <child1 xmlns:ns1="uri1" ns1:attr1="value1" xmlns:ns2="uri2" ns2:attr2="value2"/>
        <child2 xmlns:ns3="uri3" ns3:attr3="value3"/>
      </root> `)
  })

  $$.test('attributes in same namespace', async () => {
    const xmlStream = $$.createCB({ prettyPrint: true })

    xmlStream.ele('root')
      .ele('child').att('uri', 'attr', 'value').up()
      .ele('child').att('uri', 'attr', 'value')
      .end()

    await $$.expectCBResult(xmlStream, $$.t`
      <root>
        <child xmlns:ns1="uri" ns1:attr="value"/>
        <child xmlns:ns2="uri" ns2:attr="value"/>
      </root> `)
  })

  $$.test('attributes in same namespace in a single element', async () => {
    const xmlStream = $$.createCB({ prettyPrint: true })

    xmlStream.ele('root')
      .att('uri', 'attr1', 'value1').att('uri', 'attr2', 'value2')
      .end()

    await $$.expectCBResult(xmlStream, $$.t`
      <root xmlns:ns1="uri" ns1:attr1="value1" ns1:attr2="value2"/>`)
  })

  $$.test('redundant xmlns is dropped - 1', async () => {
    const xmlStream = $$.createCB()
    xmlStream.ele('root').ele('', 'child').end()
    await $$.expectCBResult(xmlStream, '<root><child/></root>')
  })

  $$.test('redundant xmlns is dropped - 2', async () => {
    const xmlStream = $$.createCB()
    xmlStream.ele('', 'root').ele('', 'child').end()
    await $$.expectCBResult(xmlStream, '<root><child/></root>')
  })

  $$.test('redundant xmlns is dropped - 3', async () => {
    const xmlStream = $$.createCB()
    xmlStream.ele('u1', 'root').ele('u1', 'child').end()
    await $$.expectCBResult(xmlStream, '<root xmlns="u1"><child/></root>')
  })

  $$.test('attribute with no prefix and namespace - 1', async () => {
    const xmlStream = $$.createCB({ prettyPrint: true })

    xmlStream.ele('r', { 'xmlns:x0': 'uri', 'xmlns:x2': 'uri' })
      .ele('b', { 'xmlns:x1': 'uri' })
      .att('uri', 'name', 'v')
      .end()

    await $$.expectCBResult(xmlStream, $$.t`
      <r xmlns:x0="uri" xmlns:x2="uri">
        <b xmlns:x1="uri" x1:name="v"/>
      </r>`)
  })

  $$.test('attribute with no prefix and namespace - 2', async () => {
    const xmlStream = $$.createCB({ prettyPrint: true })

    xmlStream.ele('el1', { 'xmlns:p': 'u1', 'xmlns:q': 'u1' })
      .ele('el2', { 'xmlns:q': 'u2' })
      .att('u1', 'name', 'v')
      .end()

    await $$.expectCBResult(xmlStream, $$.t`
      <el1 xmlns:p="u1" xmlns:q="u1">
        <el2 xmlns:q="u2" q:name="v"/>
      </el1>`)
  })

  $$.test('element prefix is dropped if the namespace is same as inherited default namespace', async () => {
    const xmlStream = $$.createCB({ prettyPrint: true })

    xmlStream.ele('u1', 'root')
      .ele('u1', 'p:child')
      .end()

    await $$.expectCBResult(xmlStream, $$.t`
      <root xmlns="u1">
        <child/>
      </root>`)
  })

  $$.test('xmlns element prefix', async () => {
    const xmlStream = $$.createCB({ prettyPrint: true })

    xmlStream.ele('http://www.w3.org/2000/xmlns/', 'xmlns:root')
      .end()

    await $$.expectCBResult(xmlStream, $$.t`
      <xmlns:root/>`)
  })

  $$.test('XML namespace inherited - 1', async () => {
    const xmlStream = $$.createCB({ prettyPrint: true })
    xmlStream.ele('http://www.w3.org/XML/1998/namespace', 'xml:root')
      .ele('http://www.w3.org/XML/1998/namespace', 'xml:foo')
      .end()
    await $$.expectCBResult(xmlStream, $$.t`
      <xml:root>
        <xml:foo/>
      </xml:root>
      `)
  })

  $$.test('XML namespace inherited - 2', async () => {
    const xmlStream = $$.createCB({ prettyPrint: true })
    xmlStream.ele('ns', 'z:r')
      .att('http://www.w3.org/2000/xmlns/', 'xmlns', 'http://www.w3.org/XML/1998/namespace')
      .ele('http://www.w3.org/XML/1998/namespace', 'n')
      .end()

    await $$.expectCBResult(xmlStream, $$.t`
      <z:r xmlns:z="ns">
        <xml:n/>
      </z:r>
      `)
  })

  $$.test('void HTML element', async () => {
    const xmlStream = $$.createCB({ prettyPrint: true })
    xmlStream.ele('root')
      .ele('http://www.w3.org/1999/xhtml', 'hr')
      .end()
    await $$.expectCBResult(xmlStream, $$.t`
      <root>
        <hr xmlns="http://www.w3.org/1999/xhtml" />
      </root>`)
  })

  $$.test('built-in namespace alias 1', async () => {
    const xmlStream = $$.createCB()
    xmlStream.ele('@xml', 'root').att('@xml', 'att', 'val').end()
    await $$.expectCBResult(xmlStream, '<xml:root xml:att="val"/>')
  })

  $$.test('built-in namespace alias 2', async () => {
    const xmlStream = $$.createCB()
    xmlStream.ele('@svg', 'root').end()
    await $$.expectCBResult(xmlStream, '<root xmlns="http://www.w3.org/2000/svg"/>')
  })

  $$.test('custom namespace alias', async () => {
    const xmlStream = $$.createCB({ namespaceAlias: { ns: "ns1" } })
    xmlStream.ele('@ns', 'p:root').att('@ns', 'p:att', 'val').end()
    await $$.expectCBResult(xmlStream, '<p:root xmlns:p="ns1" p:att="val"/>')
  })

  $$.test('invalid namespace alias', async () => {
    const xmlStream = $$.createCB({ namespaceAlias: { ns: "ns1" } })
    await $$.expectCBError(xmlStream, () => xmlStream.ele('@ns1', 'root'))
  })

})