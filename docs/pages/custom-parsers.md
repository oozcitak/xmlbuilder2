---
title: "Custom Parsers"
keywords: custom parser parsers
sidebar: api_sidebar
permalink: custom-parsers.html
toc: false
comments: false
---
`xmlbuilder2` has built-in parsers for different serialization formats. These parsers
can be modified or even completely replaced with custom parser functions. Custom parser
functions are passed to `xmlbuilder2` with [builder options]({{ site.baseurl }}{% link pages/builder-functions.md %}#builder-options) while creating the document. 

Here is a simple custom parser function which skips comment nodes while parsing:

```js
const { create } = require('xmlbuilder2');

const xmlString = `
<?xml version="1.0"?>
<!-- 3 records read from database -->
<records>
  <!-- node 1 found -->
  <record id="1"/>
  <!-- node 2 found -->
  <record id="2"/>
  <!-- node 3 not found -->
  <!-- node 4 found -->
  <record id="4"/>
</records>`;

const doc = create({ parser: { comment: () => undefined } }, xmlString);
console.log(doc.end({ prettyPrint: true }));
```
```xml
<?xml version="1.0"?>
<records>
  <record id="1"/>
  <record id="2"/>
  <record id="4"/>
</records>
```

{% capture converter_note %}
  The parser uses [converter strings]({{ site.baseurl }}{% link pages/builder-functions.md %}#settings-related-to-value-conversions) to determine the type of node while parsing
  JS objects. If this is not desired, you can disable converter strings with the
  `ignoreConverters` option. In this case, the parser will only call `element` and `text`
  functions.
{% endcapture %}
{% include note.html content=converter_note %}

{% capture base_functions_note %}
  The `this` object inside a custom parser function points to the parser object. You can use
  the parser object to call original parser functions by prepending function names with
  an underscore (e.g. `this._element` or `this._text`).
{% endcapture %}
{% include note.html content=base_functions_note %}

Following parser functions can be overwritten:

### parse
The `parse` function parses the given serialized document and creates an XML tree.
As it parses the document, it will call specialized parser functions below depending
on the type of node parsed.

<details markdown="1">
<summary><code><strong>parse</strong>(<code>parent</code>: XMLBuilder, <code>contents</code>: string | object)</code></summary>
<br/>

Creates an XML tree by parsing the `contents` argument under the given parent `node` and returns the last top level node created.

* `parent` - parent builder object to receive parsed content
* `contents` - a string containing a serialized XML document

{% capture parse_note %}
  `parse` is the main parser function. It can be used to replace the parser entirely
  with a custom implemention. Once overwritten, the parser will not call other parser
  functions unless you explicity call them.
{% endcapture %}
{% include important.html content=parse_note %}

</details>

### docType

<details markdown="1">
<summary><code><strong>docType</strong>(<code>parent</code>: XMLBuilder, <code>name</code>: string, <code>publicId</code>: string, <code>systemId</code>: string)</code></summary>
<br/>

Creates a DocType node. The function should return its parent node (usually the `parent` argument). The node will be skipped if the function returns `undefined`.

* `parent` - parent builder object (the document node) to receive parsed content
* `name` - node name
* `publicId` - public identifier
* `systemId` - system identifier

</details>

### element

<details markdown="1">
<summary><code><strong>element</strong>(<code>parent</code>: XMLBuilder, <code>namespace</code>: string | null | undefined, <code>name</code>: string)</code></summary>
<br/>

Creates an element node. The function should return the new element node. The node 
along with its child nodes will be skipped if the function returns `undefined`.

* `parent` - parent builder object (the document or an element node) to receive parsed content
* `namespace` - element namespace
* `name` - node name

Following custom element parser function allows namespace scopes:
```js
const { create } = require('xmlbuilder2');

const obj = {
  'root': {
    '-ns1:some/uri': { // namespace scope - prefix: ns1, ns: some/uri
      'node1': '',
      'node2': ''
    },
    '-': { // no namespace
      'node3': ''
    }    
  }
};

let prefix;
let ns;
const elementParser = function (parent, namespace, name) {
  if (name.startsWith('-')) {
    let [elePrefix, eleNS] = name.substring(1).split(':');
    if (eleNS === undefined) {
      prefix = undefined;
      ns = undefined;
      return parent;
    }
    else {
      prefix = elePrefix;
      ns = eleNS;
      return parent.att('xmlns:' + prefix, eleNS);
    }
  }
  else {
    return prefix ? parent.ele(prefix + ':' + name) : parent.ele(name);
  }
}

const doc = create({ parser: { element: elementParser } }, obj);
console.log(doc.end({ prettyPrint: true }));
```
```xml
<?xml version="1.0"?>
<root xmlns:ns1="some/uri">
  <ns1:node1/>
  <ns1:node2/>
  <node3/>
</root>
```

</details>

### attribute

<details markdown="1">
<summary><code><strong>attribute</strong>(<code>parent</code>: XMLBuilder, <code>namespace</code>: string | null | undefined, <code>name</code>: string, <code>value</code>: string)</code></summary>
<br/>

Creates an element attribute. The function should return the parent element node (usually the `parent` argument). The attribute will be skipped if the function returns `undefined`.

* `parent` - parent builder object (an element node) to receive parsed content
* `namespace` - attribute namespace
* `name` - attribute name
* `value` - attribute value

</details>

### text

<details markdown="1">
<summary><code><strong>text</strong>(<code>parent</code>: XMLBuilder, <code>data</code>: string)</code></summary>
<br/>

Creates a text node. The function should return the parent element node (usually the `parent` argument). The node will be skipped if the function returns `undefined`.

* `parent` - parent builder object (an element node) to receive parsed content
* `data` - node data

</details>

### comment

<details markdown="1">
<summary><code><strong>comment</strong>(<code>parent</code>: XMLBuilder, <code>data</code>: string)</code></summary>
<br/>

Creates a comment node. The function should return the parent element node (usually the `parent` argument). The node will be skipped if the function returns `undefined`.

* `parent` - parent builder object (an element node) to receive parsed content
* `data` - node data

</details>

### cdata

<details markdown="1">
<summary><code><strong>cdata</strong>(<code>parent</code>: XMLBuilder, <code>data</code>: string)</code></summary>
<br/>

Creates a CData node. The function should return the parent element node (usually the `parent` argument). The node will be skipped if the function returns `undefined`.

* `parent` - parent builder object (an element node) to receive parsed content
* `data` - node data

</details>

### instruction

<details markdown="1">
<summary><code><strong>instruction</strong>(<code>parent</code>: XMLBuilder, <code>target</code>: string, <code>data</code>: string)</code></summary>
<br/>

Creates a processing instruction node. The function should return the parent element node (usually the `parent` argument). The node will be skipped if the function returns `undefined`.

* `parent` - parent builder object (an element node) to receive parsed content
* `target` - instruction target
* `data` - node data

</details>

### sanitize

<details markdown="1">
<summary><code><strong>sanitize</strong>(<code>str</code>: string)</code></summary>
<br/>

Sanitizes the given string by removing invalid characters as defined in the [XML spec](https://www.w3.org/TR/xml/#charsets).

* `str` - string to sanitize

</details>