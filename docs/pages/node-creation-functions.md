---
title: "Node Creation Functions"
keywords: node creation function api
sidebar: api_sidebar
permalink: node-creation-functions.html
toc: false
comments: false
---

Once a document or document fragment node is created with [`create`]({{ site.baseurl }}{% link pages/builder-functions.md %}#create) or
`fragment`({{ site.baseurl }}{% link pages/builder-functions.md %}#fragment) functions, further nodes can be created and inserted into the XML
tree using the following functions which are defined on XML nodes.

###  att

Creates or updates an attribute node and adds it into its parent element node.

<details markdown="1">
<summary><code><strong>att</strong>(<code>namespace</code>: string, <code>name</code>: string, <code>value</code>: string)</code></summary>
<br/>

Creates or updates an element attribute with the given namespace URI, name and 
value and returns its parent element node. If an attribute with the same namespace
URI and name exists, its value will be updated, otherwise a new attribute
will be created.

* `namespace` - namespace URI
* `name` - attribute name
* `value` - attribute value

```js
const { create } = require('xmlbuilder2');

const root = create().ele("root").att("http://example.com/ns1", "att", "val");
console.log(root.end({ prettyPrint: true }));
```
```xml
<?xml version="1.0"?>
<root xmlns:ns1="http://example.com/ns1" ns1:att="val"/>
```

</details>

<details markdown="1">
<summary><code><strong>att</strong>(<code>name</code>: string, <code>value</code>: string)</code></summary>
<br/>

Creates or updates an element attribute with the given name and value returns 
its parent element node. If an attribute with the same name exists, its value
will be updated, otherwise a new attribute will be created.

* `name` - attribute name
* `value` - attribute value

```js
const { create } = require('xmlbuilder2');

const root = create().ele("root").att("att", "val");
console.log(root.end({ prettyPrint: true }));
```
```xml
<?xml version="1.0"?>
<root att="val"/>
```

</details>

<details markdown="1">
<summary><code><strong>att</strong>(<code>obj</code>: object)</code></summary>
<br/>

Creates element attributes from each key/value pair of the given object and 
returns the parent element node.

* `obj` - a JS object containing element attributes and values

```js
const { create } = require('xmlbuilder2');

const root = create().ele("root").att({ "att1": "val1", "att2": "val2" });
console.log(root.end({ prettyPrint: true }));
```
```xml
<?xml version="1.0"?>
<root att1="val1" att2="val2"/>
```

</details>

___

###  com

Creates a new comment node, appends it to the list of child nodes and returns
the parent element node.

<details markdown="1">
<summary><code><strong>com</strong>(<code>content</code>: string)</code></summary>
<br/>

* `content` - node content

```js
const { create } = require('xmlbuilder2');

const root = create().ele("root").com("val");
console.log(root.end({ prettyPrint: true }));
```
```xml
<?xml version="1.0"?>
<root>
  <!--val-->
</root>
```

</details>

___

###  dat

Creates a new CDATA node and appends it to the list of child nodes and returns
the parent element node.

<details markdown="1">
<summary><code><strong>dat</strong>(<code>content</code>: string)</code></summary>
<br/>

* `content` - node content

```js
const { create } = require('xmlbuilder2');

const root = create().ele("root").dat("val");
console.log(root.end({ prettyPrint: true }));
```
```xml
<?xml version="1.0"?>
<root>
  <![CDATA[val]]>
</root>
```

</details>

___

###  dec

Creates or updates the XML declaration and returns the current node.

<details markdown="1">
<summary><code><strong>dec</strong>(<code>options</code>: object)</code></summary>
<br/>

* `options` - declaration options
  * `version` - a version number string. Defaults to `"1.0"` if omitted.
  * `encoding` - Encoding declaration, e.g. `"UTF-8"`. No encoding declaration will be produced if omitted.
  * `standalone` - standalone document declaration: `true` or `false`. No standalone document declaration will be produced if omitted.

```js
const { create } = require('xmlbuilder2');

const root = create().ele("root").dec({ "encoding": "UTF-8", standalone: true });
console.log(root.end({ prettyPrint: true }));
```
```xml
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<root/>
```

</details>

___

###  dtd

Creates or updates the DocType node of the document. If the
document already contains a DocType node it will be replaced by the new
node. Otherwise it will be inserted before the document element node.

<details markdown="1">
<summary><code><strong>dtd</strong>(<code>options</code>: object)</code></summary>
<br/>

Creates a new DocType node and inserts it into the document.

* `options` - DocType options
  * `pubID` - public identifier of the DTD (optional)
  * `sysID` - system identifier of the DTD (optional)

```js
const { create } = require('xmlbuilder2');

const root = create().ele("HTML").dtd({ 
  pubID: "-//W3C//DTD HTML 4.01//EN",
  sysID: "http://www.w3.org/TR/html4/strict.dtd"} );
console.log(root.end({ prettyPrint: true }));
```
```xml
<?xml version="1.0"?>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<HTML/>
```

</details>

___

###  ele

Creates a new element node and appends it to the list of child nodes.

{% capture cb_note %}
  The `ele` function returns the newly created element node. If multiple
  element nodes are created with a single `ele` call, it returns the last top
  level element node created.
{% endcapture %}
{% include note.html content=cb_note %}

<details markdown="1">
<summary><code><strong>ele</strong>(<code>namespace</code>: string, <code>name</code>: string, <code>attributes</code>?: object)</code></summary>
<br/>

Creates a new element node with the given namespace URI, tag name and 
attributes and returns it.

* `namespace` - namespace URI
* `name` - tag name
* `attributes` - a JS object containing key/value pairs of element attributes (optional)

```js
const { create } = require('xmlbuilder2');

const child = create().ele("root").ele("http://example.com/ns1", "child", {
  "att": "val"
});
console.log(child.end({ prettyPrint: true }));
```
```xml
<?xml version="1.0"?>
<root>
  <child xmlns="http://example.com/ns1" att="val"/>
</root>
```

</details>

<details markdown="1">
<summary><code><strong>ele</strong>(<code>name</code>: string, <code>attributes</code>?: object)</code></summary>
<br/>

Creates a new element node with the given tag name and attributes and returns 
it.

* `name` - tag name
* `attributes` - a JS object containing key/value pairs of element attributes (optional)

```js
const { create } = require('xmlbuilder2');

const child = create().ele("root").ele("child", { "att": "val" });
console.log(child.end({ prettyPrint: true }));
```
```xml
<?xml version="1.0"?>
<root>
  <child att="val"/>
</root>
```

</details>

<details markdown="1">
<summary><code><strong>ele</strong>(<code>contents</code>: string | object)</code></summary>
<br/>

Creates a new element node by converting the given JS object into XML nodes and
returns the last top level element node created. See the
[object conversion]({{ site.baseurl }}{% link pages/object-conversion.md %})
page for details.

* `contents` - a JS object representing nodes to insert or a string containing an XML document in either XML or JSON format

```js
const { create } = require('xmlbuilder2');

const baz = create().ele("root").ele({
  foo: {
     bar: "foobar"
  },
  baz: ""
});
console.log(baz.end({ prettyPrint: true }));
```
```xml
<?xml version="1.0"?>
<root>
  <foo>
    <bar>foobar</bar>
  </foo>
  <baz/>
</root>
```

If the `contents` argument contains an XML or JSON string, `ele` parses
the string and creates new nodes under the current node.
```js
const doc = create().ele("root")
  .ele("<foo><bar>foobar</bar></foo>")
  .doc();
console.log(doc.end({ prettyPrint: true }));
```
```xml
<?xml version="1.0"?>
<root>
  <foo>
    <bar>foobar</bar>
  </foo>
</root>
```
</details>

___

###  import

Imports a node as a child node of this node. Descendant nodes and
attributes will also be imported. Returns the current element node.

{% capture cb_note %}
  The node will be cloned before being imported and this clone will be 
  inserted into the document; not the original node.
{% endcapture %}
{% include note.html content=cb_note %}

{% capture cb_note %}
  If the imported node is a document, its document element node will be
  imported. If the imported node is a document fragment, its child nodes will be
  imported. 
{% endcapture %}
{% include note.html content=cb_note %}

<details markdown="1">
<summary><code><strong>import</strong>(<code>node</code>: XMLBuilderNode)</code></summary>
<br/>

* `node` - the node to import

```js
import { create, fragment } from "xmlbuilder2";

const root = create().ele("root");
const frag = fragment().ele("node1").up().ele("node2").up();
root.import(frag);
console.log(root.end({ prettyPrint: true }));
```
```xml
<?xml version="1.0"?>
<root>
  <node1/>
  <node2/>
</root>
```

</details>

___

###  ins

Creates a new processing instruction node, appends it to the list of child nodes
and returns the parent element node.

<details markdown="1">
<summary><code><strong>ins</strong>(<code>target</code>: string, <code>content</code>: string)</code></summary>
<br/>

Creates a new processing instruction node with the given target and content, appends it to the list of child nodes
and returns the parent element node.

* `target` - instruction target
* `content` - node content (optional)

```js
const { create } = require('xmlbuilder2');

const root = create().ele("root").ins('bar', 'version="13.0"');
console.log(root.end({ prettyPrint: true }));
```
```xml
<?xml version="1.0"?>
<root>
  <?bar version="13.0"?>
</root>
```

</details>

<details markdown="1">
<summary><code><strong>ins</strong>(<code>obj</code>: object)</code></summary>
<br/>

Creates new processing instructions from the key/value pairs of the given object, appends them to the list of child nodes
and returns the parent element node.

* `obj` - a JS object containing key/value pairs of processing instruction targets and values

```js
const { create } = require('xmlbuilder2');

const root = create().ele("root")
  .ins({ bar: 'version="13.0"', baz: 'public=true' });
console.log(root.end({ prettyPrint: true }));
```
```xml
<?xml version="1.0"?>
<root>
  <?bar version="13.0"?>
  <?baz public=true?>
</root>
```

</details>

<details markdown="1">
<summary><code><strong>ins</strong>(<code>arr</code>: string[])</code></summary>
<br/>

Creates new processing instructions from the given string array, appends them to the list of child nodes
and returns the parent element node.

* `arr` - a string array containing space concatenated processing instruction targets and values

```js
const { create } = require('xmlbuilder2');

const root = create().ele("root")
  .ins(['bar version="13.0"', 'bar public=true']);
console.log(root.end({ prettyPrint: true }));
```
```xml
<?xml version="1.0"?>
<root>
  <?bar version="13.0"?>
  <?bar public=true?>
</root>
```

</details>

___

###  remove

Removes a node from the XML document and returns its parent element node.

<details markdown="1">
<summary><code><strong>remove</strong>()</code></summary>
<br/>

```js
const { create } = require('xmlbuilder2');

const root = create().ele("root").ele("foo").remove();
console.log(root.end({ prettyPrint: true }));
```
```xml
<?xml version="1.0"?>
<root/>
```

</details>

___

###  removeAtt

Removes an attribute.

<details markdown="1">
<summary><code><strong>removeAtt</strong>(<code>namespace</code>: string, <code>name</code>: string | string[])</code></summary>
<br/>

Removes an attribute or a list of attributes optionally with the given namespace.
Returns the parent element node.

* `namespace` - namespace URI
* `name` - attribute name or an array of attribute names to remove

```js
const { create } = require('xmlbuilder2');

const root = create().ele("root")
  .att("http://example.com/ns1", "att", "val");
  .att({ "att1": "val1", "att2": "val2", "att3": "val3" })
  .removeAtt("http://example.com/ns1", "att");
console.log(root.end({ prettyPrint: true }));
```
```xml
<?xml version="1.0"?>
<root att1="val1" att2="val2" att3="val3"/>
```

</details>

<details markdown="1">
<summary><code><strong>removeAtt</strong>(<code>name</code>: string | string[])</code></summary>
<br/>

Removes an attribute or a list of attributes and returns the parent element node.

* `name` - attribute name or an array of attribute names to remove

```js
const { create } = require('xmlbuilder2');

const root = create().ele("root")
  .att({ "att1": "val1", "att2": "val2", "att3": "val3" })
  .removeAtt(["att1", "att3"]);
console.log(root.end({ prettyPrint: true }));
```
```xml
<?xml version="1.0"?>
<root att2="val2"/>
```

</details>

___

###  txt

Creates a new text node and appends it to the list of child nodes and returns
the parent element node.

<details markdown="1">
<summary><code><strong>txt</strong>(<code>content</code>: string)</code></summary>
<br/>

* `content` - node content

```js
const { create } = require('xmlbuilder2');

const root = create().ele("root").txt("val");
console.log(root.end({ prettyPrint: true }));
```
```xml
<?xml version="1.0"?>
<root>val</root>
```

</details>
