---
title: "Upgrading from xmlbuilder"
keywords: upgrade xmlbuilder
sidebar: api_sidebar
permalink: upgrading-from-xmlbuilder.html
toc: false
comments: false
---
### Implementation Changes

Please note the following changes if you are upgrading from [xmlbuilder](https://github.com/oozcitak/xmlbuilder-js).

#### XML 1.1 is not supported

`xmlbuilder2` implements [XML 1.0 (Fifth Edition)](http://www.w3.org/TR/2008/REC-xml-20081126/) and [Namespaces in XML 1.0 (Third Edition)](http://www.w3.org/TR/2009/REC-xml-names-20091208/) but it does not support XML 1.1.

#### `xmlbuilder2` is a wrapper

`xmlbuilder2` is a wrapper over a DOM node, while `xmlbuilder` extends the node prototype. The difference should only matter if builder objects are used in other libraries. In `xmlbuilder` builder objects can be passed directly to a DOM library as node objects. In `xmlbuilder2` the underlying DOM node can be accessed using the `node` property.
<div class="row">
  <div class="col-md-6">

{% highlight js %}
// xmlbuilder
const { select } = require("xpath");
const builder = require("xmlbuilder");

const root = builder.create("root");
select("//root", doc);
{% endhighlight %}

  </div>
  <div class="col-md-6">

{% highlight js %}
// xmlbuilder2 equivalent
const { select } = require("xpath");
const { create } = require("xmlbuilder2");

const root = create().ele("root");
select("//root", doc.node);
{% endhighlight %}

  </div>
</div>


#### `create` and `begin` functions are replaced by `create`

`xmlbuilder` exports two functions for creating a new XML document: `create` and `begin`. `create` creates a document with a root element node and returns this node and `begin` creates and returns an empty XML document. In `xmlbuilder2` there is a single [`create`]({{ site.baseurl }}{% link pages/builder-functions.md %}#create) function which creates an empty XML document and returns the document node.

<div class="row">
  <div class="col-md-6">

{% highlight js %}
// xmlbuilder
const builder = require("xmlbuilder");
const root = builder.create("root");
{% endhighlight %}

  </div>
  <div class="col-md-6">

{% highlight js %}
// xmlbuilder2 equivalent
const { create } = require("xmlbuilder2");
const root = create().ele("root");
{% endhighlight %}

  </div>
</div>

#### `begin` with callback is renamed to `createCB`

`xmlbuilder` can create an XML document in chunks by passing a callback function to its `begin` function. This functionality also exists in `xmlbuilder2` with the [`createCB`]({{ site.baseurl }}{% link pages/builder-functions-with-callbacks.md %}#createCB) and [`fragmentCB`]({{ site.baseurl }}{% link pages/builder-functions-with-callbacks.md %}#fragmentCB) functions.

#### `ele` function does not accept a string argument for a default text node

In `xmlbuilder`, the `ele` function can create a default text node if a string is passed as its third argument. In `xmlbuilder2`, text nodes are always explicitly created with the [`txt`]({{ site.baseurl }}{% link pages/node-creation-functions.md %}#txt) function.

<div class="row">
  <div class="col-md-6">

{% highlight js %}
// xmlbuilder
const builder = require("xmlbuilder");
const root = builder.begin()
  .ele("root", { att: "val" }, "text");
{% endhighlight %}

  </div>
  <div class="col-md-6">

{% highlight js %}
// xmlbuilder2 equivalent
const { create } = require("xmlbuilder2");
const root = create()
  .ele("root", { att: "val" })
  .txt("text");
{% endhighlight %}

  </div>
</div>

#### raw text nodes are removed

`xmlbuilder` allows bypassing of XML character escaping rules with the `raw` function. This functionality does not exist in `xmlbuilder2` as it can potentially result in invalid XML documents.

#### JS object conversion syntax of processing instruction nodes is changed

In `xmlbuilder`, a processing instruction node is created from a JS object key/value pair when the key starts with `"?"`. In `xmlbuilder2`, both the instruction target and value is extracted from the object value.

<div class="row">
  <div class="col-md-6">

{% highlight js %}
// xmlbuilder
const builder = require("xmlbuilder");
const root = builder.create("root")
  .ele({ "?target": "content" });
{% endhighlight %}

  </div>
  <div class="col-md-6">

{% highlight js %}
// xmlbuilder2 equivalent
const { create } = require("xmlbuilder2");
const root = create().ele("root")
  .ele({ "?": "target content" });
{% endhighlight %}

  </div>
</div>

#### JS object conversion syntax of CDATA section nodes is changed

In `xmlbuilder`, a CDATA section node is created from a JS object value when its key starts with `"#cdata"`. In `xmlbuilder2`, the key should be `"$"`.

<div class="row">
  <div class="col-md-6">

{% highlight js %}
// xmlbuilder
const builder = require("xmlbuilder");
const root = builder.create("root")
  ele({ "#cdata": "value" });
{% endhighlight %}

  </div>
  <div class="col-md-6">

{% highlight js %}
// xmlbuilder2 equivalent
const { create } = require("xmlbuilder2");
const root = create().ele("root")
  .ele({ "$": "value" });
// or alternatively override the converter string
// note that we also override the text converter
// since it also begins with "#"
const root = create({ convert: { text: "#text", cdata: "#cdata" } })
  .ele("root").ele({ "#cdata": "value" });
{% endhighlight %}

  </div>
</div>

#### JS object conversion syntax of comment nodes is changed

In `xmlbuilder`, a comment node is created from a JS object value when its key starts with `"#comment"`. In `xmlbuilder2`, the key should be `"!"`.

<div class="row">
  <div class="col-md-6">

{% highlight js %}
// xmlbuilder
const builder = require("xmlbuilder");
const root = builder.create("root")
  .ele({ "#comment": "value" });
{% endhighlight %}

  </div>
  <div class="col-md-6">

{% highlight js %}
// xmlbuilder2 equivalent
const { create } = require("xmlbuilder2");
const root = document().ele("root")
  .ele({ "!": "value" });
// or alternatively override the converter string
// note that we also override the text converter
// since it also begins with "#"
const root = create({ convert: { text: "#text", comment: "#comment" } })
  .ele("root").ele({ "#comment": "value" });
{% endhighlight %}

  </div>
</div>

#### output format setting `pretty` is changed to `prettyPrint`

The `pretty` setting in [`end`]({{ site.baseurl }}{% link pages/conversion-functions.md %}#end) function is renamed to `prettyPrint` in `xmlbuilder2`.

<div class="row">
  <div class="col-md-6">

{% highlight js %}
// xmlbuilder
const builder = require("xmlbuilder");
const xml = builder.create("root")
  .ele("foo")
  .end({ pretty: true });
{% endhighlight %}

  </div>
  <div class="col-md-6">

{% highlight js %}
// xmlbuilder2 equivalent
const { create } = require("xmlbuilder2");
const xml = create().ele("root")
  .ele("foo")
  .end({ prettyPrint: true });
{% endhighlight %}

  </div>
</div>

#### `importDocument` function is renamed to `import`

The `xmlbuilder` function `importDocument` is renamed to `import` in `xmlbuilder2`.

#### Custom serializer functions are removed

`xmlbuilder2` does not allow customizing the output of its serializers. Please open an issue if you require this feature.

#### Internal DTDs are not supported

It is not possible create an internal DTD with `xmlbuilder2`. Also, when an XML document containing an internal DTD is parsed, the internal subset will be silently ignored.

### New Features

Following features are new in `xmlbuilder2`.

#### Full DOM implementation

`xmlbuilder2` implements the DOM specification in its entirety. So it should be readily usable with any other library compatible with DOM interfaces.

#### XML document parser

`xmlbuilder2` can parse documents from an XML document string, JS object or a JSON string. The value to be parsed should be passed to the `document` or `fragment` functions.

```js
const { create } = require('xmlbuilder2');

// parse an XML document string
const xmlStr = '<root att="val"><foo><bar>foobar</bar></foo></root>';
const doc = create(xmlStr);

// parse a JS object
const xmlObj = { root: { '@att': 'val', foo: { bar: 'foobar' } } };
const doc = create(xmlObj);

// parse a JSON string
const jsonStr = `{ "root": { "@att": "val", "foo": { "bar": "foobar" } } }`;
const doc = create(jsonStr);
```

#### XML document serializer

Similarly, `xmlbuilder2` can serialize documents into an XML document string, JS object or a JSON string with the `end` function.

```js
const { create } = require('xmlbuilder2');

// create the XML document
const doc = create().ele("root", { att: "val" }).ele("foo").ele("bar").txt("foobar");

// serialize as an XML document string
doc.end({format: "xml" }); // '<root att="val"><foo><bar>foobar</bar></foo></root>'

// serialize as a JS object
doc.end({ format: "object"}); // { root: { '@att': 'val', foo: { bar: 'foobar' } } }

// serialize as a JSON string
doc.end({ format: "json"}); // `{ "root": { "@att": "val", "foo": { "bar": "foobar" } } }`
```

#### Support for document fragment nodes

`xmlbuilder2` can create document fragment nodes with the [`fragment`]({{ site.baseurl }}{% link pages/builder-functions.md %}#fragment) function.

```js
const { fragment } = require('xmlbuilder2');

// create a document fragment node
const frag = fragment().ele("node").up().ele("node", { att: "val" }).up();

// parse a fragment from an XML document string
const xmlStr = '<node/><node att="val"/>';
const frag = fragment(xmlStr);

// parse a JS object
const xmlObj = { node: [ {}, { "@att": "val"} ] };
const frag = fragment(xmlObj);

// parse a JSON string
const jsonStr = `{ "node": [ {}, { "@att": "val"} ] }`;
const frag = fragment(jsonStr);
```

#### One step conversion

`xmlbuilder2` can convert an XML document between different formats with the [`convert`]({{ site.baseurl }}{% link pages/builder-functions.md %}#convert) function.

```js
const { convert } = require('xmlbuilder2');

const xmlStr = '<root att="val"><foo><bar>foobar</bar></foo></root>';
const obj = convert(xmlStr, { format: 'object' });
console.log(obj);
```
```js
{
  root: {
    '@att': 'val',
    foo: {
      bar: 'foobar'
    }
  }
};
```

#### Support for XML namespaces

XML namespaces are fully supported in `xmlbuilder2`. [`ele`]({{ site.baseurl }}{% link pages/node-creation-functions.md %}#ele) and [`att`]({{ site.baseurl }}{% link pages/node-creation-functions.md %}#att) functions accepts an optional argument for specifying an XML namespace.

```js
const { create } = require('xmlbuilder2');

const root = create().ele('http://example.com/ns1', 'root');
```

#### Collection functions

`xmlbuilder2` introduces the collection functions [`each`]({{ site.baseurl }}{% link pages/collection-functions.md %}#each), [`map`]({{ site.baseurl }}{% link pages/collection-functions.md %}#map), [`reduce`]({{ site.baseurl }}{% link pages/collection-functions.md %}#reduce), [`find`]({{ site.baseurl }}{% link pages/collection-functions.md %}#find), [`filter`]({{ site.baseurl }}{% link pages/collection-functions.md %}#filter), [`every`]({{ site.baseurl }}{% link pages/collection-functions.md %}#every), [`some`]({{ site.baseurl }}{% link pages/collection-functions.md %}#some) and [`toArray`]({{ site.baseurl }}{% link pages/collection-functions.md %}#toArray). These functions can work on immediate child nodes or descendant nodes.

#### Custom parsers

The behavior of `xmlbuilder2`'s parsers can be customized with [custom parser functions]({{ site.baseurl }}{% link pages/custom-parsers.md %}).

### Comparison with `xmlbuilder`

Following table compares `xmlbuilder2` with its predecessor.

Feature | `xmlbuilder` | `xmlbuilder2` | Notes
----|----|----|----
XML 1.1 | <i class="fa fa-check fa-green"></i> | <i class="fa fa-times fa-red"> | 
DOM compatibility | <i class="fa fa-check fa-green"></i> | <i class="fa fa-check fa-green"></i> | `xmlbuilder` implements a subset of the DOM specification where `xmlbuilder2` is built on a full DOM implementation.
XML namespaces | <i class="fa fa-times fa-red"> | <i class="fa fa-check fa-green"></i> | 
Document fragment nodes | <i class="fa fa-times fa-red"> | <i class="fa fa-check fa-green"></i> | 
Parsing JS objects | <i class="fa fa-check fa-green"></i> | <i class="fa fa-check fa-green"></i> | 
Parsing XML strings | <i class="fa fa-times fa-red"> | <i class="fa fa-check fa-green"></i> | 
Serializing into JS objects | <i class="fa fa-times fa-red"> | <i class="fa fa-check fa-green"></i> | 
Serializing into XML strings | <i class="fa fa-check fa-green"></i> | <i class="fa fa-check fa-green"></i> | 
Performance | <i class="fa fa-check fa-green"></i> | <i class="fa fa-check fa-green"></i> | `xmlbuilder2` is 40-65% slower for some operations due to various validity checks of its full DOM implementation.
Creating an XML document in chunks | <i class="fa fa-check fa-green"></i> | <i class="fa fa-check fa-green"></i> | 
Custom parsers | <i class="fa fa-times fa-red"></i> | <i class="fa fa-check fa-green"></i> | 
Custom serializers | <i class="fa fa-check fa-green"></i> | <i class="fa fa-times fa-red"></i> | 
