import $$ from '../TestHelpers'

describe('namespaces', () => {

  test('default namespace', (done) => {
    const xmlStream = $$.documentStream({ prettyPrint: true })

    xmlStream.ele('root', { xmlns: "ns" })
      .ele('foo').up()
      .ele('bar').up().end()

    $$.expectStreamResult(xmlStream, $$.t`
      <root xmlns="ns">
        <foo/>
        <bar/>
      </root>`, done)
  })

  test('XML namespace', (done) => {
    const xmlStream = $$.documentStream({ prettyPrint: true })

    xmlStream.ele('http://www.w3.org/XML/1998/namespace', 'root')
      .ele('foo').up()
      .ele('bar').up()
      .end()

      $$.expectStreamResult(xmlStream, $$.t`
        <xml:root>
          <foo/>
          <bar/>
        </xml:root>`, done)
  })

  test('duplicate namespaces', (done) => {
    const xmlStream = $$.documentStream({ prettyPrint: true })
    
    xmlStream.ele('d:root', { "xmlns:d": "ns1" })
      .ele('e:foo', { "xmlns:e": "ns1" }).up()
      .ele('bar').up()
      .end()

    $$.expectStreamResult(xmlStream, $$.t`
      <d:root xmlns:d="ns1">
        <e:foo xmlns:e="ns1"/>
        <bar/>
      </d:root>
      `, done)
  })

  test('attribute with namespace and no prefix', (done) => {
    const xmlStream = $$.documentStream({ prettyPrint: true })
    
    xmlStream.ele('r', { "xmlns:x0": "ns", "xmlns:x2": "ns" })
      .ele('b', { "xmlns:x1": "ns" })
      .att('ns', 'name', 'v')
      .end()

    $$.expectStreamResult(xmlStream, $$.t`
      <r xmlns:x0="ns" xmlns:x2="ns">
        <b xmlns:x1="ns" xmlns:ns1="ns" ns1:name="v"/>
      </r>`, done)
  })

  test('nested default namespace declaration attributes with same namespace are ignored', (done) => {
    const xmlStream = $$.documentStream({ prettyPrint: true })
    
    xmlStream.ele('ns', 'r')
      .att('http://www.w3.org/2000/xmlns/', 'xmlns', 'ns')
      .ele('ns', 'n')
      .att('http://www.w3.org/2000/xmlns/', 'xmlns', 'ns')
      .end()

    $$.expectStreamResult(xmlStream, $$.t`
      <r xmlns="ns">
        <n/>
      </r>`, done)
  })

  test('prefix of an attribute is replaced with another existing prefix mapped to the same namespace URI', (done) => {
    const xmlStream = $$.documentStream({ prettyPrint: true })
    
    xmlStream.ele('r')
      .att('xmlns:xx', 'uri')
      .att('uri', 'p:name', 'v')
      .end()

    $$.expectStreamResult(xmlStream, $$.t`
      <r xmlns:xx="uri" xmlns:p="uri" p:name="v"/> `, done)
  })

  test('prefix of an attribute is replaced with another existing prefix mapped to the same namespace URI - 2', (done) => {
    const xmlStream = $$.documentStream({ prettyPrint: true })

    xmlStream.ele('r', { "xmlns:xx": "uri" })
      .ele('b')
      .att('uri', 'p:name', 'value')
      .end()

    $$.expectStreamResult(xmlStream, $$.t`
      <r xmlns:xx="uri">
        <b xmlns:p="uri" p:name="value"/>
      </r> `, done)
  })

  test('prefix of an attribute is NOT preserved if neither its prefix nor its namespace URI is not already used', (done) => {
    const xmlStream = $$.documentStream({ prettyPrint: true })
    
    xmlStream.ele('r')
      .att('xmlns:xx', 'uri')
      .att('uri2', 'p:name', 'value')
      .end()

    $$.expectStreamResult(xmlStream, $$.t`
      <r xmlns:xx="uri" xmlns:p="uri2" p:name="value"/> `, done)
  })

  test('same prefix declared in an ancestor element', (done) => {
    const xmlStream = $$.documentStream({ prettyPrint: true })
    
    xmlStream.ele('uri1', 'p:root')
      .ele('child')
      .att('uri2', 'p:foobar', 'value')
      .end()

    $$.expectStreamResult(xmlStream, $$.t`
      <p:root xmlns:p="uri1">
        <child xmlns:ns1="uri2" ns1:foobar="value"/>
      </p:root> `, done)
  })

  test('drop element prefix if the namespace is same as inherited default namespace', (done) => {
    const xmlStream = $$.documentStream({ prettyPrint: true })
    
    xmlStream.ele('uri', 'root')
      .ele('uri', 'p:child')
      .end()

    $$.expectStreamResult(xmlStream, $$.t`
      <root xmlns="uri">
        <child/>
      </root> `, done)
  })

  test('find an appropriate prefix', (done) => {
    const xmlStream = $$.documentStream({ prettyPrint: true })
    
    xmlStream.ele('u1', 'p1:root')
      .ele('u1', 'p2:child')
      .ele('u1', 'child2')
      .end()

    $$.expectStreamResult(xmlStream, $$.t`
      <p1:root xmlns:p1="u1">
        <p1:child>
          <p1:child2/>
        </p1:child>
      </p1:root> `, done)
  })

  test('xmlns:* attributes', (done) => {
    const xmlStream = $$.documentStream({ prettyPrint: true })
    
    xmlStream.ele('uri1', 'p:root')
      .att('http://www.w3.org/2000/xmlns/', 'xmlns:p', 'uri2')
      .end()

    $$.expectStreamResult(xmlStream, $$.t`
      <ns1:root xmlns:ns1="uri1" xmlns:p="uri2"/> `, done)
  })

  test('prefix re-declared in ancestor element', (done) => {
    const xmlStream = $$.documentStream({ prettyPrint: true })
    
    xmlStream.ele('root')
      .att('http://www.w3.org/2000/xmlns/', 'xmlns:p', 'uri2')
      .ele('uri1', 'p:child')
      .end()

    $$.expectStreamResult(xmlStream, $$.t`
      <root xmlns:p="uri2">
        <p:child xmlns:p="uri1"/>
      </root> `, done)
  })

  test('default namespace does not apply if was declared in an ancestor', (done) => {
    const xmlStream = $$.documentStream({ prettyPrint: true })
    
    xmlStream.ele('root', { "xmlns:x": "uri1" })
      .ele('table', { xmlns: "uri1" })
      .end()

    $$.expectStreamResult(xmlStream, $$.t`
      <root xmlns:x="uri1">
        <table xmlns="uri1"/>
      </root> `, done)
  })

  test('multiple generated prefixes', (done) => {
    const xmlStream = $$.documentStream({ prettyPrint: true })
    
    xmlStream.ele('root')
      .ele('child1').att('uri1', 'attr1', 'value1').att('uri2', 'attr2', 'value2').up()
      .ele('child2').att('uri3', 'attr3', 'value3')
      .end()

    $$.expectStreamResult(xmlStream, $$.t`
      <root>
        <child1 xmlns:ns1="uri1" ns1:attr1="value1" xmlns:ns2="uri2" ns2:attr2="value2"/>
        <child2 xmlns:ns3="uri3" ns3:attr3="value3"/>
      </root> `, done)
  })

  test('attributes in same namespace', (done) => {
    const xmlStream = $$.documentStream({ prettyPrint: true })
    
    xmlStream.ele('root')
      .ele('child').att('uri', 'attr', 'value').up()
      .ele('child').att('uri', 'attr', 'value')
      .end()

    $$.expectStreamResult(xmlStream, $$.t`
      <root>
        <child xmlns:ns1="uri" ns1:attr="value"/>
        <child xmlns:ns2="uri" ns2:attr="value"/>
      </root> `, done)
  })

  test('attributes in same namespace in a single element', (done) => {
    const xmlStream = $$.documentStream({ prettyPrint: true })
    
    xmlStream.ele('root')
      .att('uri', 'attr1', 'value1').att('uri', 'attr2', 'value2')
      .end()

    $$.expectStreamResult(xmlStream, $$.t`
      <root xmlns:ns1="uri" ns1:attr1="value1" ns1:attr2="value2"/>`, done)
  })

  test('redundant xmlns is dropped - 1', (done) => {
    const xmlStream = $$.documentStream()
    xmlStream.ele('root').ele('', 'child').end()
    $$.expectStreamResult(xmlStream, '<root><child/></root>', done)
  })

  test('redundant xmlns is dropped - 2', (done) => {
    const xmlStream = $$.documentStream()
    xmlStream.ele('', 'root').ele('', 'child').end()
    $$.expectStreamResult(xmlStream, '<root><child/></root>', done)
  })

  test('redundant xmlns is dropped - 3', (done) => {
    const xmlStream = $$.documentStream()
    xmlStream.ele('u1', 'root').ele('u1', 'child').end()
    $$.expectStreamResult(xmlStream, '<root xmlns="u1"><child/></root>', done)
  })

  test('attribute with no prefix and namespace - 1', (done) => {
    const xmlStream = $$.documentStream({ prettyPrint: true })

    xmlStream.ele('r', { 'xmlns:x0': 'uri', 'xmlns:x2': 'uri' })
      .ele('b', { 'xmlns:x1': 'uri' })
      .att('uri', 'name', 'v')
      .end()

    $$.expectStreamResult(xmlStream, $$.t`
      <r xmlns:x0="uri" xmlns:x2="uri">
        <b xmlns:x1="uri" xmlns:ns1="uri" ns1:name="v"/>
      </r>`, done)    
  })

  test('attribute with no prefix and namespace - 2', (done) => {
    const xmlStream = $$.documentStream({ prettyPrint: true })

    xmlStream.ele('el1', { 'xmlns:p': 'u1', 'xmlns:q': 'u1' })
      .ele('el2', { 'xmlns:q': 'u2' })
      .att('u1', 'name', 'v')
      .end()

    $$.expectStreamResult(xmlStream, $$.t`
      <el1 xmlns:p="u1" xmlns:q="u1">
        <el2 xmlns:q="u2" xmlns:ns1="u1" ns1:name="v"/>
      </el1>`, done)
  })

  test('element prefix is dropped if the namespace is same as inherited default namespace', (done) => {
    const xmlStream = $$.documentStream({ prettyPrint: true })
    
    xmlStream.ele('u1', 'root')
      .ele('u1', 'p:child')
      .end()

    $$.expectStreamResult(xmlStream, $$.t`
      <root xmlns="u1">
        <child/>
      </root>`, done)
  })

  test('xmlns element prefix', (done) => {
    const xmlStream = $$.documentStream({ prettyPrint: true })
    
    xmlStream.ele('http://www.w3.org/2000/xmlns/', 'xmlns:root')
      .end()

    $$.expectStreamResult(xmlStream, $$.t`
      <xmlns:root/>`, done)
  })

  test('void HTML element', (done) => {
    const xmlStream = $$.documentStream({ prettyPrint: true })
    xmlStream.ele('root')
      .ele('http://www.w3.org/1999/xhtml', 'hr')
      .end()
    $$.expectStreamResult(xmlStream, $$.t`
      <root>
        <hr xmlns="http://www.w3.org/1999/xhtml" />
      </root>`, done)      
  })

  test('built-in namespace alias', (done) => {
    const xmlStream1 = $$.documentStream()
    xmlStream1.ele('@xml', 'root').att('@xml', 'att', 'val').end()
    $$.expectStreamResult(xmlStream1, '<xml:root xml:att="val"/>', done)

    const xmlStream2 = $$.documentStream()
    xmlStream2.ele('@svg', 'root').end()
    $$.expectStreamResult(xmlStream2, '<root xmlns="http://www.w3.org/2000/svg"/>', done)
  })

  test('custom namespace alias', (done) => {
    const xmlStream = $$.documentStream({ namespaceAlias: { ns: "ns1" } })
    xmlStream.ele('@ns', 'p:root').att('@ns', 'p:att', 'val').end()
    $$.expectStreamResult(xmlStream, '<p:root xmlns:p="ns1" p:att="val"/>', done)
  })

  test('invalid namespace alias', (end) => {
    const xmlStream = $$.documentStream({ namespaceAlias: { ns: "ns1" } })
    $$.expectStreamError(xmlStream, () => xmlStream.ele('@ns1', 'root'), end)
  })

})