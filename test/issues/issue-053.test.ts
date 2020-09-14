import $$ from "../TestHelpers";

describe("Replicate issue", () => {
  // https://github.com/oozcitak/xmlbuilder2/issues/53
  test("#53 - NamespaceError: The operation is not allowed by Namespaces in XML", () => {
    const requestXML = $$.create({ version: "1.0", encoding: "UTF-8" })
        .ele("tns1:READ_WRITE_REQ_GBO")
        .att("xmlns:wsa", "http://www.w3.org/2005/08/addressing")
        .att("xmlns:cct", "urn:un:unece:uncefact:documentation:standard:CoreComponentType:2")
        .att("xmlns:ccts", "urn:un:unece:uncefact:documentation:standard:CoreComponentsTechnicalSpecification:2")
        .att("xmlns:xsi", "http://www.w3.org/2001/XMLSchema-instance")
        .att("xmlns:cmn", "http://single.xxyyzz.com/schema/common/v1")
        .att("xmlns:tns", "http://single.xxyyzz.com/schema/vbo/order/service-order/v1")
        .att("xmlns:extvbo", "http://single.xxyyzz.com/schema/extension/vbo/order/service-order/v1")
        .att("xmlns:tns1", "http://single.xxyyzz.com/schema/order/service/v1")
        .att("xmlns:vbm", "http://single.xxyyzz.com/schema/vbm/order/service-order/v1")
        .att("xmlns:hed", "http://single.xxyyzz.com/contract/vho/header/v1")
        .att("xmlns:flt", "http://single.xxyyzz.com/contract/vfo/fault/v1")
        .att("xmlns:bf", "http://docs.oasis-open.org/wsrf/bf-2")
    
    const headerNodeXML = $$.create()
        .ele("Header") // Header
        .ele("RouteInfo") // RouteInfo
        .ele("hed:Route")
        .ele("hed:ID").txt("ServiceOrder.Create").up()
        .ele("hed:Keys")
        .ele("hed:Key").up().up().up().up()
        .ele("Correlation") // Correlation
        .ele("hed:ConversationID").txt("TransactionUUID").up().up()
        .ele("Destination") // Destination
        .ele("hed:Operator").txt("").up()
        .ele("hed:Division").txt("").up()
        .ele("hed:System").txt("FES.CreateFeasibility").up().up()
        .ele("Source") // Source
        .ele("hed:Division").txt("").up()
        .ele("hed:System").txt("ESMS").up().up().up()
    
    requestXML.import(headerNodeXML)
    
    const xml = requestXML.end({ prettyPrint: true })

    expect(xml).toBe($$.t`
    <?xml version="1.0" encoding="UTF-8"?>
    <tns1:READ_WRITE_REQ_GBO xmlns:wsa="http://www.w3.org/2005/08/addressing" xmlns:cct="urn:un:unece:uncefact:documentation:standard:CoreComponentType:2" xmlns:ccts="urn:un:unece:uncefact:documentation:standard:CoreComponentsTechnicalSpecification:2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:cmn="http://single.xxyyzz.com/schema/common/v1" xmlns:tns="http://single.xxyyzz.com/schema/vbo/order/service-order/v1" xmlns:extvbo="http://single.xxyyzz.com/schema/extension/vbo/order/service-order/v1" xmlns:tns1="http://single.xxyyzz.com/schema/order/service/v1" xmlns:vbm="http://single.xxyyzz.com/schema/vbm/order/service-order/v1" xmlns:hed="http://single.xxyyzz.com/contract/vho/header/v1" xmlns:flt="http://single.xxyyzz.com/contract/vfo/fault/v1" xmlns:bf="http://docs.oasis-open.org/wsrf/bf-2">
      <Header>
        <RouteInfo>
          <hed:Route>
            <hed:ID>ServiceOrder.Create</hed:ID>
            <hed:Keys>
              <hed:Key/>
            </hed:Keys>
          </hed:Route>
        </RouteInfo>
        <Correlation>
          <hed:ConversationID>TransactionUUID</hed:ConversationID>
        </Correlation>
        <Destination>
          <hed:Operator/>
          <hed:Division/>
          <hed:System>FES.CreateFeasibility</hed:System>
        </Destination>
        <Source>
          <hed:Division/>
          <hed:System>ESMS</hed:System>
        </Source>
      </Header>
    </tns1:READ_WRITE_REQ_GBO>
    `)
  })

})
