import $$ from "../TestHelpers";

describe("Replicate issue", () => {
  // https://github.com/oozcitak/xmlbuilder2/issues/78
  test(`#81 - Using the .Up() method does not really move up to the parent node`, () => {
    const messageReference = $$.fragment().ele('MessageReference')
      .ele('MessageType').txt('4005').up()
      .ele('MessageTypeVersion').txt('5.3.1.GB').up()
      .ele('MessageIdentifier').txt('414d51204e52504230303920202020205e504839247eb882').up()
      .ele('MessageDateTime').txt('2021-03-18T17:27:54.562').up()
      .doc().end({ prettyPrint: true });
    const messageHeader = $$.fragment().ele('MessageHeader')
      .ele(messageReference).up()
      .ele('SenderReference').txt('1B25LMJp-H5K').up()
      .ele('Sender', { 'ns0:CI_InstanceNumber': '01' }).txt('0070').up()
      .ele('Recipient', { 'ns0:CI_InstanceNumber': '99' }).txt('9999').up()
      .doc().end({ prettyPrint: true });
    const doc = $$.create().ele('TrainRunningInformationMessage').att('xmlns:ns0', 'http://www.era.europa.eu/schemes/TAFTSI/5.3')
      .att('xmlns:xsi', 'http://www.w3.org/2001/XMLSchema-instance').att('xsi:schemaLocation', 'http://www.era.europa.eu/schemes/TAFTSI/5.3 taf_cat_complete.xsd')
      .ele(messageHeader).root()
      .ele('<MessageStatus>1</MessageStatus>').root()
      .doc();

    expect(doc.end({ prettyPrint: true })).toBe($$.t`
    <?xml version="1.0"?>
    <TrainRunningInformationMessage xmlns:ns0="http://www.era.europa.eu/schemes/TAFTSI/5.3" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.era.europa.eu/schemes/TAFTSI/5.3 taf_cat_complete.xsd">
      <MessageHeader>
        <MessageReference>
          <MessageType>4005</MessageType>
          <MessageTypeVersion>5.3.1.GB</MessageTypeVersion>
          <MessageIdentifier>414d51204e52504230303920202020205e504839247eb882</MessageIdentifier>
          <MessageDateTime>2021-03-18T17:27:54.562</MessageDateTime>
        </MessageReference>
        <SenderReference>1B25LMJp-H5K</SenderReference>
        <Sender ns0:CI_InstanceNumber="01">0070</Sender>
        <Recipient ns0:CI_InstanceNumber="99">9999</Recipient>
      </MessageHeader>
      <MessageStatus>1</MessageStatus>
    </TrainRunningInformationMessage>
    `)
  })

})
