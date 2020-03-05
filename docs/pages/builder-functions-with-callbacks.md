---
title: "Builder Functions with Callbacks"
keywords: builder documentCB fragmentCB callback function api
sidebar: api_sidebar
permalink: builder-functions-with-callbacks.html
toc: false
comments: false
---

Following functions exported by `xmlbuilder2` are imported with:
```js
const { createCB, fragmentCB } = require('xmlbuilder2');
```

These functions return a callback document builder object (an instance of the class [`XMLBuilderCB`](https://github.com/oozcitak/xmlbuilder2/blob/master/src/callback/XMLBuilderCBImpl.ts)) which is a different object from the builder object returned by `create` (an instance of the class [`XMLBuilder`](https://github.com/oozcitak/xmlbuilder2/blob/master/src/builder/XMLBuilderImpl.ts)). Although `XMLBuilderCB` methods have similar method signatures, they are not XML node wrappers but the same  object instance whose state is altered with each call. Use these functions if you need to create an XML document in chunks and you are only interested in the final XML document string. If you need to process intermediate nodes, use the `create` function.

### createCB
The `createCB` function serializes an XML document in chunks with the provided callback functions.

<details markdown="1">
<summary><code><strong>createCB</strong>(<code>options</code>: object)</code></summary>
<br/>

* `options` - builder options and callback functions

```js
const { createCB } = require('xmlbuilder2');
const { promises } = require('fs)';

const filename = 'path/to/output/file';
const outFile = await promises.open(filename, 'w');

const xmlBuilder = createCB({ 
  data: async (chunk) => await outFile.write(chunk),
  end: async () => await outFile.close(),
  prettyPrint: true
});

xmlBuilder.ele("root")
  .ele("foo").up()
  .ele("bar").att("fizz", "buzz").up()
  .end();
```
```xml
<root>
  <foo/>
  <bar fizz="buzz"/>
</root>
```

</details>

___

### fragmentCB
The `fragmentCB` function serializes an XML document fragment in chunks with the provided callback functions.

<details markdown="1">
<summary><code><strong>fragmentCB</strong>(<code>options</code>: object)</code></summary>
<br/>

* `options` - builder options and callback functions

```js
const { fragmentCB } = require('xmlbuilder2');
const { promises } = require('fs)';

const filename = 'path/to/output/file';
const outFile = await promises.open(filename, 'w');

const xmlBuilder = fragmentCB({ 
  data: async (chunk) => await outFile.write(chunk),
  end: async () => await outFile.close(),
  prettyPrint: true
});

xmlBuilder.ele("foo").up()
  .ele("foo").att("fizz", "buzz").up()
  .ele("foo").up()
  .end();
```
```xml
<foo/>
<foo fizz="buzz"/>
<foo/>
```

</details>
