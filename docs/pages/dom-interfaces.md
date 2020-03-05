---
title: "DOM Interfaces"
keywords: dom interface
sidebar: api_sidebar
permalink: dom-interfaces.html
toc: false
comments: false
---
`xmlbuilder2` works on top of a DOM implementation. Each node created by `xmlbuilder2` is a DOM node. If required, DOM interfaces can be accessed with the `node` property of the builder object. For example:

```js
const { create } = require('xmlbuilder2');

const child = create().ele('root').ele('child');
const tagName = child.node.tagName;
```
The `node` property exposes the DOM [Node](https://dom.spec.whatwg.org/#interface-node) interface.
