---
title: "Namespaces"
keywords: namespaces
sidebar: api_sidebar
permalink: namespaces.html
toc: false
comments: false
---
Following examples are adopted from [Martin Honnen's blog](https://blogs.msmvps.com/martin-honnen/2009/04/13/creating-xml-with-namespaces-with-javascript-and-the-w3c-dom/). Also see [namespaces]({{ site.baseurl }}{% link pages/object-conversion.md %}#namespaces) in JS object conversion page.

### Default Namespace

A default namespace declaration attribute can be specified as follows:
```js
const { create } = require('xmlbuilder2');

const ns1 = 'http://example.com/ns1';
const doc = create()
  .ele(ns1, 'root')
    .ele(ns1, 'foo').txt('bar').doc();

const xmlString = doc.end({ headless: true });
console.log(xmlString);
```
which would result in the following:
```xml
<root xmlns="http://example.com/ns1"><foo>bar</foo></root>
```
### Namespace Declaration Attribute

A namespace declaration attribute can be specified as follows:
```js
const { create } = require('xmlbuilder2');

const ns1 = 'http://example.com/ns1'
const xsi = 'http://www.w3.org/2001/XMLSchema-instance'

const doc = create().ele(ns1, 'root')
  .att(xsi, 'xsi:schemaLocation', 'http://example.com/n1 schema.xsd')
  .ele(ns1, 'foo').txt('bar').doc()

const xmlString = doc.end({ headless: true, prettyPrint: true });
console.log(xmlString);
```
which would result in the following:
```xml
<root xmlns="http://example.com/ns1"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://example.com/n1 schema.xsd">
 <foo xmlns="">bar</foo>
</root>
```
### Element with Namespace

An element with a namespace declaration can be specified as follows:
```js
const { create } = require('xmlbuilder2');

const svgNs = 'http://www.w3.org/2000/svg'
const xlinkNs = 'http://www.w3.org/1999/xlink'

const doc = create().ele(svgNs, 'svg')
  .att('http://www.w3.org/2000/xmlns/', 'xmlns:xlink', xlinkNs)
  .ele(svgNs, 'script')
    .att('type', 'text/ecmascript')
    .att(xlinkNs, 'xlink:href', 'foo.js')
  .doc()

const xmlString = doc.end({ headless: true, prettyPrint: true });
console.log(xmlString);
```
which would result in the following:
```xml
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <script xmlns="" type="text/ecmascript" xlink:href="foo.js"/>
</svg>
```
### Attribute with Namespace

An attribute with a namespace declaration can be specified as follows:
```js
const { create } = require('xmlbuilder2');

const ns1 = 'http://example.com/ns1'
const doc = create()
  .ele('root').att(ns1, 'att', 'val').doc()

const xmlString = doc.end({ headless: true, prettyPrint: true });
console.log(xmlString);
```
which would result in the following:
```xml
<root xmlns:ns1="http://example.com/ns1" ns1:att="val"/>
```

### Namespace Defaults

`xmlbuilder2` can automatically insert namespace defaults for all element and attributes. This is especially useful for MathML and SVG documents. For example, to create the yin and yang svg:
```js
const { create } = require('xmlbuilder2');

const svgDoc = create({ defaultNamespace: { ele: 'http://www.w3.org/2000/svg', att: null } });
// all svg elements below will be created in the 'http://www.w3.org/2000/svg' namespace
// all attributes will be created with the null namespace
svgDoc.ele('svg').att('viewBox', '0 0 100 100')
  .ele('circle').att({ cx: 50, cy: 50, r: 48, fill: 'none', stroke: '#000' }).up()
  .ele('path').att('d', 'M50,2a48,48 0 1 1 0,96a24 24 0 1 1 0-48a24 24 0 1 0 0-48').up()
  .ele('circle').att({ cx: 50, cy: 26, r: 6 }).up()
  .ele('circle').att({ cx: 50, cy: 74, r: 6, fill: '#FFF' }).up();
console.log(svgDoc.end({ prettyPrint: true }));
```
which would result in the following:
```xml
<?xml version="1.0"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="48" fill="none" stroke="#000"/>
  <path d="M50,2a48,48 0 1 1 0,96a24 24 0 1 1 0-48a24 24 0 1 0 0-48"/>
  <circle cx="50" cy="26" r="6"/>
  <circle cx="50" cy="74" r="6" fill="#FFF"/>
</svg>
```

### Namespace Aliases

Namespace aliases can be used instead of actual namespaces by prepending them with the `'@'` character. The following well-known namespaces are built-in and can be used without being declared:
```
html: 'http://www.w3.org/1999/xhtml'
xml: 'http://www.w3.org/XML/1998/namespace'
xmlns: 'http://www.w3.org/2000/xmlns/'
mathml: 'http://www.w3.org/1998/Math/MathML'
svg: 'http://www.w3.org/2000/svg'
xlink: 'http://www.w3.org/1999/xlink'
```
For example:
```js
const { create } = require('xmlbuilder2');

const ele = create().ele('@xml', 'root').att('@xml', 'att', 'val');
console.log(ele.toString()); // '<xml:root xml:att='val'/>'
```
Custom aliases can be declared while calling the `create` function:
```js
const { create } = require('xmlbuilder2');

const ele = create({ namespaceAlias: { ns: 'ns1' } }).ele('@ns', 'p:root').att('@ns', 'p:att', 'val')
console.log(ele.toString()); // '<p:root xmlns:p='ns1' p:att='val'/>'
```

Namespace aliases can also be used while converting JS objects. In that case, element name and alias should be separated by `'@@'`:
```js
const { create } = require('xmlbuilder2');

const ele = create().ele({ 'root@@xml': { '@att@@xml': 'val' }})
console.log(ele.toString()); // '<xml:root xml:att='val'/>'
```

### Namespace Inheritance

Child element nodes automatically inherit their parent element's namespace. For example:
```js
const { create } = require('xmlbuilder2');

const root = create()
  .ele('http:/example.com', 'root')
    .ele('node')
  .up();
const node = root.node.firstElementChild;
console.log(node.namespaceURI); // 'http:/example.com'
```
