---
title: "Traversal Functions"
keywords: node traversal function api
sidebar: api_sidebar
permalink: traversal-functions.html
toc: false
comments: false
---

Following functions are used to traverse the document tree.

###  doc

Returns the document node. `doc` can be called from anywhere in the document.

<details markdown="1">
<summary><code><strong>doc</strong>()</code></summary>

```js
const { create } = require('xmlbuilder2');

const root = create().ele("root");
const doc = root.doc();
```

</details>

___

###  first

Returns the first child node.

<details markdown="1">
<summary><code><strong>first</strong>()</code></summary>

```js
const { create } = require('xmlbuilder2');

const root = create().ele("root")
  .ele("node1").up()
  .ele("node2").up();
const node1 = root.first();
```

</details>

___

###  last

Returns the last child node.

<details markdown="1">
<summary><code><strong>last</strong>()</code></summary>

```js
const { create } = require('xmlbuilder2');

const root = create().ele("root")
  .ele("node1").up()
  .ele("node2").up();
const node2 = root.last();
```

</details>

___

###  next

Returns the next sibling node.

<details markdown="1">
<summary><code><strong>next</strong>()</code></summary>

```js
const { create } = require('xmlbuilder2');

const root = create().ele("root")
  .ele("node1").up()
  .ele("node2").up();
const node1 = root.first();
const node2 = node1.next();
```

</details>

___

###  prev

Returns the previous sibling node.

<details markdown="1">
<summary><code><strong>prev</strong>()</code></summary>

```js
const { create } = require('xmlbuilder2');

const root = create().ele("root")
  .ele("node1").up()
  .ele("node2").up();
const node2 = root.last();
const node1 = node2.prev();
```

</details>

___

###  root

Returns the root element node. Root element node is the document element node of
the XML document. `root` can be called from anywhere in the document.

<details markdown="1">
<summary><code><strong>root</strong>()</code></summary>

```js
const { create } = require('xmlbuilder2');

const grandChild = create().ele("root").ele("child").ele("grandchild");
const root = grandchild.root();
```

</details>

___

###  up

Returns the parent element node.

<details markdown="1">
<summary><code><strong>up</strong>()</code></summary>

```js
const { create } = require('xmlbuilder2');

const grandChild = create().ele("root").ele("child").ele("grandchild");
const child = grandchild.up();
const root = child.up();
```

</details>
