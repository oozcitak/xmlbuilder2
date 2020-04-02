---
title: Other Functions
keywords: functions
sidebar: api_sidebar
permalink: other-functions.html
toc: false
comments: false
---

### set

Changes builder options. See [builder options]({{ site.baseurl }}{% link pages/builder-functions.md %}#builder-options)
for the options argument.

<details markdown="1">
<summary><code><strong>set</strong>(<code>options</code>: object)</code></summary>
<br/>

* `options` - builder options
</details>


### node (property)

Returns the DOM node wrapped by `xmlbuilder2`.

{% include warning.html content="`node` is a _property_; not a function." %}

<details markdown="1">
<summary><code><strong>node</strong></code></summary>
<br/>

```js
const { create } = require('xmlbuilder2');

const ele = create().ele('http:/example.com', 'root');
console.log(ele.node.namespaceURI); // 'http:/example.com'
```
</details>
