---
title: "Builder Functions"
keywords: builder document fragment function api
sidebar: api_sidebar
permalink: builder-functions.html
toc: false
comments: false
---

Following functions exported by `xmlbuilder2` are typically imported with:
```js
const { create, fragment, convert, builder } = require('xmlbuilder2');
```

### create
The `create` function creates and returns a new XML document. When called without arguments, `create` creates an empty XML document (one without any child nodes). `create` accepts an optional parameters object for customizing its behavior. These parameters are explained in [this page]({{ site.baseurl }}{% link pages/builder-options.md %}). `create` also accepts an optional argument defining an XML document to be parsed as detailed in [this page]({{ site.baseurl }}{% link pages/parsing.md %}).

<details markdown="1">
<summary><code><strong>create</strong>(<code>options</code>: object, <code>contents</code>: string | object)</code></summary>
<br/>

Creates a new XML document by parsing the `contents` argument with the given `options` and returns the document node.

* `options` - builder options
* `contents` - a string containing an XML document in either XML or JSON format or a JS object representing nodes to insert

```js
const { create } = require('xmlbuilder2');

const doc = create({ encoding: "UTF-8" }, '<root><node/></root>');
console.log(doc.end({ prettyPrint: true }));
```
```xml
<?xml version="1.0" encoding="UTF-8"?>
<root>
  <node/>
</root>
```

</details>

<details markdown="1">
<summary><code><strong>create</strong>(<code>options</code>: object)</code></summary>
<br/>

Creates an empty XML document with the given `options` and returns the document node.

* `options` - builder options

```js
const { create } = require('xmlbuilder2');

const doc = create({ encoding: 'UTF-8' });
console.log(doc.end({ prettyPrint: true }));
```
```xml
<?xml version="1.0" encoding="UTF-8"?>
```

</details>

<details markdown="1">
<summary><code><strong>create</strong>(<code>contents</code>: string | object)</code></summary>
<br/>

Creates a new XML document by parsing the `contents` argument with the default options and returns the document node.

* `contents` - a string containing an XML document in either XML or JSON format or a JS object representing nodes to insert

```js
const { create } = require('xmlbuilder2');

const doc = create('<root><foo><bar>foobar</bar></foo></root>');
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

<details markdown="1">
<summary><code><strong>create</strong>()</code></summary>
<br/>

Creates an empty XML document with the default options and returns the document node.

```js
const { create } = require('xmlbuilder2');

const doc = create();
console.log(doc.end({ prettyPrint: true }));
```
```xml
<?xml version="1.0"?>
```

</details>

___

### fragment
The `fragment` function creates and returns a document fragment node. `fragment` accepts the same types of arguments as with the `document` function.

<details markdown="1">
<summary><code><strong>fragment</strong>(<code>options</code>: object, <code>contents</code>: string | object)</code></summary>
<br/>

Creates a new document fragment by parsing the `contents` argument with the given `options` and returns the document fragment node.

* `options` - builder options
* `contents` - a string containing an XML document in either XML or JSON format or a JS object representing nodes to insert

```js
const { fragment } = require('xmlbuilder2');

const frag = fragment({ encoding: 'UTF-8' }, '<node/><node>text</node>');
console.log(frag.toString({ prettyPrint: true }));
```
```xml
<node/>
<node>text</node>
```

</details>

<details markdown="1">
<summary><code><strong>fragment</strong>(<code>options</code>: object)</code></summary>
<br/>

Creates an empty document fragment with the given `options` and returns the document fragment node.

* `options` - builder options

```js
const { fragment } = require('xmlbuilder2');

const frag = fragment({ encoding: 'UTF-8' });
frag.ele('node');
console.log(frag.toString({ prettyPrint: true }));
```
```xml
<node/>
```

</details>

<details markdown="1">
<summary><code><strong>fragment</strong>(<code>contents</code>: string | object)</code></summary>
<br/>

Creates a new document fragment by parsing the `contents` argument with the default options and returns the document fragment node.

* `contents` - a string containing an XML document in either XML or JSON format or a JS object representing nodes to insert

```js
const { fragment } = require('xmlbuilder2');

const frag = fragment('<foo>foo</foo><foo>foobar</foo><bar/>');
console.log(frag.toString({ prettyPrint: true }));
```
```xml
<foo>foo</foo>
<foo>foobar</foo>
<bar/>
```

</details>

<details markdown="1">
<summary><code><strong>fragment</strong>()</code></summary>
<br/>

Creates an empty document fragment with the default options and returns the document fragment node.

```js
const { fragment } = require('xmlbuilder2');

const frag = fragment();
frag.ele('node');
console.log(frag.toString({ prettyPrint: true }));
```
```xml
<node/>
```

</details>

___

### convert
The `convert` function converts an XML document into a given format. See
[builder options]({{ site.baseurl }}{% link pages/builder-options.md %})
and [serialization settings]({{ site.baseurl }}{% link pages/serialization.md %}#serialization-settings)
for the options arguments. The input of the `convert` function should be a string containing an XML 
document in either XML or JSON format or a JS object representing XML nodes.

<details markdown="1">
<summary><code><strong>convert</strong>(<code>builderOptions</code>: object, <code>contents</code>: string | object, <code>convertOptions</code>: object)</code></summary>
<br/>

Converts an XML document by parsing the `contents` argument with the given 
`builderOptions` and returns the result formatted with the given `convertOptions`.

* `builderOptions` - builder options
* `contents` - a string containing an XML document in either XML or JSON format or a JS object representing nodes to insert
* `convertOptions` - conversion options

```js
const { convert } = require('xmlbuilder2');

const obj = convert({ encoding: 'UTF-8' }, '<root><node/></root>', { format: 'object' });
console.log(obj);
```
```js
{ root:
  node: { }
}
```

</details>

<details markdown="1">
<summary><code><strong>convert</strong>(<code>contents</code>: string | object, <code>convertOptions</code>: object)</code></summary>
<br/>

Converts an XML document by parsing the `contents` argument with the default 
builder options and returns the result formatted with the given `convertOptions`.

* `contents` - a string containing an XML document in either XML or JSON format or a JS object representing nodes to insert
* `convertOptions` - conversion options

```js
const { convert } = require('xmlbuilder2');

const obj = convert('<root><node/></root>', { format: 'object' });
console.log(obj);
```
```js
{ root:
  node: { }
}
```

</details>

<details markdown="1">
<summary><code><strong>convert</strong>(<code>builderOptions</code>: object, <code>contents</code>: string | object)</code></summary>
<br/>

Converts an XML document into the default output format by parsing the `contents` 
argument with the given `builderOptions` and returns the result.
The default output format is `'xml'` which returns an XML document string.

* `builderOptions` - builder options
* `contents` - a string containing an XML document in either XML or JSON format or a JS object representing nodes to insert

```js
const { convert } = require('xmlbuilder2');

const xml = convert({ encoding: 'UTF-8' }, { root: { node: { } });
console.log(xml);
```
```xml
<?xml version="1.0" encoding="UTF-8"?><root><node/></root>
```

</details>

<details markdown="1">
<summary><code><strong>convert</strong>(<code>contents</code>: string | object)</code></summary>
<br/>

Converts an XML document into the default output format by parsing the `contents` 
argument with the default builder options and returns the result.
The default output format is `'xml'` which returns an XML document string.

* `contents` - a string containing an XML document in either XML or JSON format or a JS object representing nodes to insert

```js
const { convert } = require('xmlbuilder2');

const xml = convert({ root: { node: { } });
console.log(xml);
```
```xml
<?xml version="1.0"?><root><node/></root>
```

</details>

___

### builder
The `builder` function wraps an existing DOM node and returns a builder object.

<details markdown="1">
<summary><code><strong>builder</strong>(<code>options</code>: object, <code>node</code>: Node)</code></summary>
<br/>

Wraps an existing DOM node with the given `options` and returns a builder object.

* `options` - builder options
* `node` - a DOM node

```js
const { builder } = require('xmlbuilder2');

const node = document.createElement('node');

const xml = builder({ version: '1.0' }, node)
  .ele('child')
  .end({ prettyPrint: true });

console.log(xml);
```
```xml
<node>
  <child/>
</node>
```

</details>

<details markdown="1">
<summary><code><strong>builder</strong>(<code>node</code>: Node)</code></summary>
<br/>

Wraps an existing DOM node with the default options and returns a builder object.

* `node` - a DOM node

```js
const { builder } = require('xmlbuilder2');

const node = document.createElement('node');

const xml = builder(node)
  .ele('child')
  .end({ prettyPrint: true });

console.log(xml);
```
```xml
<node>
  <child/>
</node>
```

</details>
