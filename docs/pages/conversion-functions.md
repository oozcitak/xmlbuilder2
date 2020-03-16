---
title: "Conversion Functions"
keywords: node conversion serialization function api
sidebar: api_sidebar
permalink: conversion-functions.html
toc: false
comments: false
---

Following functions can be used to convert an XML document into a string or an
object. See
[serialization settings]({{ site.baseurl }}{% link pages/serialization.md %}#serialization-settings)
page for the settings object used by these functions.

{% capture cb_note %}
  `end` function converts the _entire_ XML document, where `toString` and `toObject` functions convert only the node they are called with.
{% endcapture %}
{% include note.html content=cb_note %}

###  end

Converts the entire XML document into its string or object representation. `end`
can be called from anywhere in the document.

<details markdown="1">
<summary><code><strong>end</strong>(<code>options</code>?: object)</code></summary>
<br/>

* `options` - serialization options (optional)

```js
const { create } = require('xmlbuilder2');

const doc = create()
  .ele("root", { "att", "val" })
    .ele("foo")
      .ele("bar").txt("foobar")
    .up()
    .ele("baz")
    .doc();
console.log(doc.end({ prettyPrint: true }));
```
```xml
<?xml version="1.0"?>
<root att="val">
  <foo>
    <bar>foobar</bar>
  </foo>
  <baz/>
</root>
```

</details>

___

###  toObject

Converts the node into its object representation.

<details markdown="1">
<summary><code><strong>toObject</strong>(<code>options</code>?: object)</code></summary>
<br/>

* `options` - serialization options (optional)

```js
const { create } = require('xmlbuilder2');

const doc = create()
  .ele("root", { "att", "val" })
    .ele("foo")
      .ele("bar").txt("foobar")
    .up()
    .ele("baz")
    .doc();
const foo = doc.first().first();
console.log(foo.toObject());
```
```js
{ 
  foo: {
    bar: "foobar"
  }
}
```

</details>

___

###  toString

Converts the node into its string representation.

<details markdown="1">
<summary><code><strong>toString</strong>(<code>options</code>?: object)</code></summary>
<br/>

* `options` - serialization options (optional)

```js
const { create } = require('xmlbuilder2');

const doc = create()
  .ele("root", { "att", "val" })
    .ele("foo")
      .ele("bar").txt("foobar")
    .up()
    .ele("baz")
    .doc();
const foo = doc.first().first();
console.log(foo.toString({ prettyPrint: true }));
```
```xml
<foo>
  <bar>foobar</bar>
</foo>
```

</details>
