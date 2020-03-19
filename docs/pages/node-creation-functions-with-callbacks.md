---
title: "Node Creation Functions with Callbacks"
keywords: node creation function documentCB fragmentCB callback api
sidebar: api_sidebar
permalink: node-creation-functions-with-callbacks.html
toc: false
comments: false
---

Once a callback document builder object is created with [`createCB`]({{ site.baseurl }}{% link pages/builder-functions-with-callbacks.md %}#createCB) or
[`fragmentCB`]({{ site.baseurl }}{% link pages/builder-functions-with-callbacks.md %}#fragmentCB) functions, further nodes can be created and serialized using the following functions.

###  att

Creates and serializes an attribute node.

<details markdown="1">
<summary><code><strong>att</strong>(<code>namespace</code>: string, <code>name</code>: string, <code>value</code>: string)</code></summary>

Creates and serializes an element attribute with the given namespace URI, name and 
value.

* `namespace` - namespace URI
* `name` - attribute name
* `value` - attribute value

```js
const { createCB } = require('xmlbuilder2');

const xmlBuilder = createCB({ 
  data: (chunk) => console.log(chunk)
  end: () => { },
  prettyPrint: true
});

xmlBuilder.ele('root').att('http://example.com/ns1', 'att', 'val').end();
```
```xml
<root xmlns:ns1="http://example.com/ns1" ns1:att="val"/>
```

</details>

<details markdown="1">
<summary><code><strong>att</strong>(<code>name</code>: string, <code>value</code>: string)</code></summary>

Creates and serializes an element attribute with the given name and 
value.

* `name` - attribute name
* `value` - attribute value

```js
const { createCB } = require('xmlbuilder2');

const xmlBuilder = createCB({ 
  data: (chunk) => console.log(chunk)
  end: () => { },
  prettyPrint: true
});

xmlBuilder.ele('root').att('att', 'val').end();
```
```xml
<root att="val"/>
```

</details>

<details markdown="1">
<summary><code><strong>att</strong>(<code>obj</code>: object)</code></summary>

Creates element attributes from each key/value pair of the given object.

* `obj` - a JS object containing element attributes and values

```js
const { createCB } = require('xmlbuilder2');

const xmlBuilder = createCB({ 
  data: (chunk) => console.log(chunk)
  end: () => { },
  prettyPrint: true
});

xmlBuilder.ele('root').att({ 'att1': 'val1', 'att2': 'val2' }).end();
```
```xml
<root att1="val1" att2="val2"/>
```

</details>

___

###  com

Creates and serializes a new comment node.

<details markdown="1">
<summary><code><strong>com</strong>(<code>content</code>: string)</code></summary>

* `content` - node content

```js
const { createCB } = require('xmlbuilder2');

const xmlBuilder = createCB({ 
  data: (chunk) => console.log(chunk)
  end: () => { },
  prettyPrint: true
});

xmlBuilder.ele('root').com('val').end();
```
```xml
<root>
  <!--val-->
</root>
```

</details>

___

###  dat

Creates and serializes a new CDATA node.

<details markdown="1">
<summary><code><strong>dat</strong>(<code>content</code>: string)</code></summary>

* `content` - node content

```js
const { createCB } = require('xmlbuilder2');

const xmlBuilder = createCB({ 
  data: (chunk) => console.log(chunk)
  end: () => { },
  prettyPrint: true
});

xmlBuilder.ele('root').dat('val').end();
```
```xml
<root>
  <![CDATA[val]]>
</root>
```

</details>

___

###  dec

Creates and serializes the XML declaration.

<details markdown="1">
<summary><code><strong>dec</strong>(<code>options</code>: object)</code></summary>

* `options` - declaration options
  * `version` - a version number string. Defaults to `'1.0'` if omitted.
  * `encoding` - Encoding declaration, e.g. `'UTF-8'`. No encoding declaration will be produced if omitted.
  * `standalone` - standalone document declaration: `true` or `false`. No standalone document declaration will be produced if omitted.

```js
const { createCB } = require('xmlbuilder2');

const xmlBuilder = createCB({ 
  data: (chunk) => console.log(chunk)
  end: () => { },
  prettyPrint: true
});

xmlBuilder.dec({ 'encoding': 'UTF-8', standalone: true })
  .ele('root').end();
```
```xml
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<root/>
```

</details>

___

###  dtd

Creates and serializes the DocType node.

<details markdown="1">
<summary><code><strong>dtd</strong>(<code>options</code>: object)</code></summary>

Creates a new DocType node and inserts it into the document.

* `options` - DocType options
  * `name` - name of the DTD
  * `pubID` - public identifier of the DTD (optional)
  * `sysID` - system identifier of the DTD (optional)

```js
const { createCB } = require('xmlbuilder2');

const xmlBuilder = createCB({ 
  data: (chunk) => console.log(chunk)
  end: () => { },
  prettyPrint: true
});

xmlBuilder.dtd({ 
    name: 'HTML',
    pubID: '-//W3C//DTD HTML 4.01//EN',
    sysID: 'http://www.w3.org/TR/html4/strict.dtd'}
  )
  .ele('HTML').end();
```
```xml
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<HTML/>
```

</details>

___

###  ele

Creates and serializes a new element node.

<details markdown="1">
<summary><code><strong>ele</strong>(<code>namespace</code>: string, <code>name</code>: string, <code>attributes</code>?: object)</code></summary>

Creates a new element node with the given namespace URI, tag name and 
attributes.

* `namespace` - namespace URI
* `name` - tag name
* `attributes` - a JS object containing key/value pairs of element attributes (optional)

```js
const { createCB } = require('xmlbuilder2');

const xmlBuilder = createCB({ 
  data: (chunk) => console.log(chunk)
  end: () => { },
  prettyPrint: true
});

xmlBuilder.ele('root')
  .ele('http://example.com/ns1', 'child', { 'att': 'val' }).up()
  .end();
```
```xml
<root>
  <child xmlns="http://example.com/ns1" att="val"/>
</root>
```

</details>

<details markdown="1">
<summary><code><strong>ele</strong>(<code>name</code>: string, <code>attributes</code>?: object)</code></summary>

Creates a new element node with the given tag name and attributes.

* `name` - tag name
* `attributes` - a JS object containing key/value pairs of element attributes (optional)

```js
const { createCB } = require('xmlbuilder2');

const xmlBuilder = createCB({ 
  data: (chunk) => console.log(chunk)
  end: () => { },
  prettyPrint: true
});

xmlBuilder.ele('root')
  .ele('child', { 'att': 'val' }).up()
  .end();
```
```xml
<root>
  <child att="val"/>
</root>
```

</details>

<details markdown="1">
<summary><code><strong>ele</strong>(<code>contents</code>: string | object)</code></summary>

Creates a new element node by converting the given JS object into XML nodes. See the
[object conversion]({{ site.baseurl }}{% link pages/object-conversion.md %})
page for details.

* `contents` - a JS object representing nodes to insert or a string containing an XML document in either XML or JSON format

```js
const { createCB } = require('xmlbuilder2');

const xmlBuilder = createCB({ 
  data: (chunk) => console.log(chunk)
  end: () => { },
  prettyPrint: true
});

xmlBuilder.ele('root')
  .ele({
    foo: {
       bar: 'foobar'
    },
    baz: ''
  }).end();
```
```xml
<root>
  <foo>
    <bar>
      foobar
    </bar>
  </foo>
  <baz/>
</root>
```

If the `contents` argument contains an XML or JSON string, `ele` parses
the string and creates new nodes under the current node.
```js
const { createCB } = require('xmlbuilder2');

const xmlBuilder = createCB({ 
  data: (chunk) => console.log(chunk)
  end: () => { },
  prettyPrint: true
});

xmlBuilder.ele('root')
  .ele('<foo><bar>foobar</bar></foo>')
  .end();
```
```xml
<root>
  <foo>
    <bar>
      foobar
    </bar>
  </foo>
</root>
```
</details>

___

###  ins

Creates and serializes a new processing instruction node.

<details markdown="1">
<summary><code><strong>ins</strong>(<code>target</code>: string, <code>content</code>: string)</code></summary>

Creates a new processing instruction node with the given target and content.

* `target` - instruction target
* `content` - node content (optional)

```js
const { createCB } = require('xmlbuilder2');

const xmlBuilder = createCB({ 
  data: (chunk) => console.log(chunk)
  end: () => { },
  prettyPrint: true
});

xmlBuilder.ele('root').ins('bar', 'version="13.0"').end();
```
```xml
<root>
  <?bar version="13.0"?>
</root>
```

</details>

<details markdown="1">
<summary><code><strong>ins</strong>(<code>obj</code>: object)</code></summary>

Creates new processing instructions from the key/value pairs of the given object.

* `obj` - a JS object containing key/value pairs of processing instruction targets and values

```js
const { createCB } = require('xmlbuilder2');

const xmlBuilder = createCB({ 
  data: (chunk) => console.log(chunk)
  end: () => { },
  prettyPrint: true
});

xmlBuilder.ele('root').ins({ bar: 'version="13.0"', baz: 'public=true' }).end();
```
```xml
<root>
  <?bar version="13.0"?>
  <?baz public=true?>
</root>
```

</details>

<details markdown="1">
<summary><code><strong>ins</strong>(<code>arr</code>: string[])</code></summary>

Creates new processing instructions from the given string array.

* `arr` - a string array containing space concatenated processing instruction targets and values

```js
const { createCB } = require('xmlbuilder2');

const xmlBuilder = createCB({ 
  data: (chunk) => console.log(chunk)
  end: () => { },
  prettyPrint: true
});

xmlBuilder.ele('root').ins(['bar version="13.0"', 'bar public=true']).end();
```
```xml
<root>
  <?bar version="13.0"?>
  <?bar public=true?>
</root>
```

</details>

___

###  txt

Creates and serializes a new text node.

<details markdown="1">
<summary><code><strong>txt</strong>(<code>content</code>: string)</code></summary>

* `content` - node content

```js
const { createCB } = require('xmlbuilder2');

const xmlBuilder = createCB({ 
  data: (chunk) => console.log(chunk)
  end: () => { },
  prettyPrint: true
});

xmlBuilder.ele('root').txt('val').end();
```
```xml
<root>
  val
</root>
```

</details>
