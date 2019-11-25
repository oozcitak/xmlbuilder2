const jsdom = require("jsdom");
const { document } = require("../../lib");

const { JSDOM } = jsdom;
const impl = new JSDOM().window.document.implementation
perf('xmlbuilder2 vs jsdom: parser', 10000, () => {
  const root = document().ele('root');
  const node1 = root.ele('node1');
  node1.ele('node1-1');
  node1.ele('node1-2');
  const node2 = root.ele('node2');
  node2.ele('node2-1');
  node2.ele('node2-2');
  node2.ele('node2-3');
}, () => {
  const doc = impl.createDocument(null, 'root')
  const root = doc.documentElement;
  const node1 = doc.createElement('node1'); root.appendChild(node1);
  const node11 = doc.createElement('node1-1'); node1.appendChild(node11);
  const node12 = doc.createElement('node1-2'); node1.appendChild(node12);
  const node2 = doc.createElement('node2'); root.appendChild(node2);
  const node21 = doc.createElement('node2-1'); node1.appendChild(node21);
  const node22 = doc.createElement('node2-2'); node1.appendChild(node22);
});
