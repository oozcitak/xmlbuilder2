const { JSDOM } = require("jsdom");
const { fragment } = require("../../lib");

const xmlStr = `<root>
  <node1>
    <node1-1/>
    <node1-2/>
  </node1>
  <node2>
    <node2-1/>
    <node2-2/>
    <node2-3/>
  </node2>
</root>`

perf('xmlbuilder2 vs jsdom: parser', 10000, () => {
  fragment(xmlStr);
}, () => {
  JSDOM.fragment(xmlStr)
});
