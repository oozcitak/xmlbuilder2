---
title: "xmlbuilder2"
keywords: xmlbuilder2 introduction intro
sidebar: api_sidebar
permalink: index.html
toc: false
comments: false
---

![xmlbuilder2 logo]({{ site.baseurl }}{% link images/social-media-banner.png %} "xmlbuilder2 logo")

An XML builder for [node.js](https://nodejs.org/).

### Installation:

``` sh
npm install xmlbuilder2
```

### Usage:

`xmlbuilder2` is a wrapper around a [DOM implementation](https://github.com/oozcitak/dom) which adds chainable functions so that complex XML documents can be created easily. Since an XML document is a tree of nodes, function chaining naturally follows the structure of the document resulting in more readable source code. For example, the following XML document:
```xml
<?xml version='1.0'?>
<root att='val'>
  <foo>
    <bar>foobar</bar>
  </foo>
  <baz/>
</root>
```
can be created with:
```js
const { create } = require('xmlbuilder2');

const doc = create({ version: '1.0' })
  .ele('root', { att: 'val' })
    .ele('foo')
      .ele('bar').txt('foobar').up()
    .up()
    .ele('baz')
    .doc();

console.log(doc.end({ prettyPrint: true }));
```
`create` function is exported by the module, and it creates and returns a blank XML document node, `ele` function creates and returns an element node and `up` function returns its parent element node. You can think of `up` as the closing tag of its element node. `doc` function returns the document node of the XML document. Finally, the `end` function converts the XML document into its string representation. `end` can convert into other formats as explained [here](serialization.html).

{% capture cb_note %}
  You may have noticed that the `up` calls for the `'baz'` and `'root'` elements were omitted in the above example. This is possible because the `doc` function can be called from anywhere in the document tree. The same is true for the `root` function; it returns the root element node and be called from anywhere in the document.
{% endcapture %}
{% include note.html content=cb_note %}

___

A nested JS object can also be thought of as a tree (although with the restriction that its keys should be unique) so `xmlbuilder2` also supports converting to/from JS objects into XML nodes. The same example with JS objects becomes:
```js
const { create } = require('xmlbuilder2');

const doc = create({ version: '1.0' }, {
  root: {
    '@att': 'val',
    foo: {
      bar: "foobar"
    },
    baz: {}
  }
});

console.log(doc.end({ prettyPrint: true }));
```
___

`xmlbuilder2` can parse and serialize XML documents in different formats. For example:
```js
const { create } = require('xmlbuilder2');

const xmlStr = '<root att="val"><foo/><bar>foobar</bar></foo></root>';

const doc = create(xmlStr);
// append a 'baz' element to the root node of the document
doc.root().ele('baz');

console.log(doc.end({ prettyPrint: true }));
```
which would result in the XML document at the top of this page. See
[parsing](parsing.html) and 
[serialization](serialization.html) pages.

___

`xmlbuilder2` can convert between different formats. For example:
```js
const { convert } = require('xmlbuilder2');

const xmlStr = '<root att="val"><foo/><bar>foobar</bar></foo></root>';

const obj = convert(xmlStr, { format: 'object' });
console.log(obj);
```
```js
{
  root: {
    '@att': 'val',
    'foo': {
      'bar': 'foobar'
    }
  }
}
```
See the [convert](builder-functions.html#convert) function.