---
title: "Using with External Libraries"
keywords: external library
sidebar: api_sidebar
permalink: using-with-external-libraries.html
toc: false
comments: false
---
Since `xmlbuilder2` implements the DOM specification, it should be readily usable with any external library compatible with DOM interfaces.

### xpath

For example, by using the [`xpath`](https://github.com/goto100/xpath) module:

```js
const { create } = require('xmlbuilder2');
const { select } = require('xpath');

const doc = create("<book><title>The Book</title></book>");
const nodes = select("//title", doc.node);

console.log(nodes[0].localName); // "title"
console.log(nodes[0].firstChild.data); // "The Book"
console.log(nodes[0].toString()); // "<title>The Book</title>"
```

Namespaces are supported:
```js
const { create } = require('xmlbuilder2');
const { select } = require('xpath');

const doc = create("<book><title xmlns='myns'>Harry Potter</title></book>")
const node = select("//*[local-name(.)='title' and namespace-uri(.)='myns']", doc.node)
    
console.log(node[0].namespaceURI); // "myns"
```

### libxmljs

Validating against an XSD by using the [`libxmljs`](https://github.com/libxmljs/libxmljs) module:

```js
const { create } = require('xmlbuilder2');
const { parseXml } = require('libxmljs');

// create our schema
const xsdDoc = create()
  .ele('xs:schema', { 'xmlns:xs': 'http://www.w3.org/2001/XMLSchema' })
    .ele('xs:element', { name: 'book' })
  .doc();
// and our document
const xmlDoc = create().ele('book').doc();

// parse and validate with libxml
const xsd = parseXml(xsdDoc.end());
const xml = parseXml(xmlDoc.end());
  
const result = xml.validate(xsd); // true
```

{% capture ts_tip %}
  `XMLBuilder2` uses its own TypeScript interfaces for DOM nodes; which typically will not be compatible withe the interfaces exported by other libraries. TypeScript users should cast those interfaces accordingly to prevent TS 2345 errors.
{% endcapture %}
{% include warning.html content=ts_tip %}