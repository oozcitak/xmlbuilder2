---
title: "Node Functions"
keywords: node function api
sidebar: api_sidebar
permalink: node-functions.html
toc: false
comments: false
---

Once a document or document fragment node is created with `create` or
`fragment` functions, further nodes can be created and inserted into the XML
tree using the following functions which are defined on XML nodes.

## Node Creation

###  att

Creates or updates an attribute node and adds it into its parent element node.

<details>
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

<details>
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

<details>
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

<details>
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

<details>
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

<details>
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

<details>
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

_Note:_ The `ele` function returns the newly created element node. If multiple
element nodes are created with a single `ele` call, it returns the last top
level element node created.

<details>
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

<details>
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

<details>
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

_Note:_ The node will be cloned before being imported and this clone will be 
inserted into the document; not the original node.

_Note:_ If the imported node is a document, its document element node will be
imported. If the imported node is a document fragment, its child nodes will be
imported. 

<details>
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

<details>
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

<details>
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

<details>
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

<details>
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

<details>
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

<details>
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

<details>
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


## Traversal

###  doc

Returns the document node. `doc` can be called from anywhere in the document.

<details>
<summary><code><strong>doc</strong>()</code></summary>
<br/>

```js
const { create } = require('xmlbuilder2');

const root = create().ele("root");
const doc = root.doc();
```

</details>

___

###  first

Returns the first child node.

<details>
<summary><code><strong>first</strong>()</code></summary>
<br/>

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

<details>
<summary><code><strong>last</strong>()</code></summary>
<br/>

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

<details>
<summary><code><strong>next</strong>()</code></summary>
<br/>

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

<details>
<summary><code><strong>prev</strong>()</code></summary>
<br/>

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

<details>
<summary><code><strong>root</strong>()</code></summary>
<br/>

```js
const { create } = require('xmlbuilder2');

const grandChild = create().ele("root").ele("child").ele("grandchild");
const root = grandchild.root();
```

</details>

___

###  up

Returns the parent element node.

<details>
<summary><code><strong>up</strong>()</code></summary>
<br/>

```js
const { create } = require('xmlbuilder2');

const grandChild = create().ele("root").ele("child").ele("grandchild");
const child = grandchild.up();
const root = child.up();
```

</details>

## Collection Functions

###  each

Applies a callback function to child nodes of the current node.  Returns the 
current node.

<details>
<summary><code><strong>each</strong>(<code>callback</code>: (node: XMLBuilder, index: number) => void, <code>self</code>?: boolean, <code>recursive</code>?: boolean, <code>thisArg</code>?: any)</code></summary>
<br/>

* `callback` - a callback function which receives each child node as its first argument and the node index as its second argument
* `self` - whether to visit the current node along with child nodes (optional)
* `recursive` - whether to visit all descendant nodes in tree-order or only the immediate child nodes (optional)
* `thisArg` - value to use as this when executing callback (optional)

```js
const { create } = require('xmlbuilder2');

const root = create().ele("root");
root.ele("a").up()
    .ele("b").up()
    .ele("c").up();
const names = [];
root.each(n => names.push(n.node.nodeName));
console.log(names); // ["a", "b", "c"]
```

</details>

___

###  map

Produces an array of values by transforming each child node with the given callback function.

<details>
<summary><code><strong>map</strong>(<code>callback</code>: (node: XMLBuilder, index: number) => any, <code>self</code>?: boolean, <code>recursive</code>?: boolean, <code>thisArg</code>?: any)</code></summary>
<br/>

* `callback` - a callback function which receives each child node as its first argument and the node index as its second argument
* `self` - whether to visit the current node along with child nodes (optional)
* `recursive` - whether to visit all descendant nodes in tree-order or only the immediate child nodes (optional)
* `thisArg` - value to use as this when executing callback (optional)

```js
const { create } = require('xmlbuilder2');

const root = create().ele("root");
root.ele("a").up()
    .ele("b").up()
    .ele("c").up();
const names = root.map(n => n.node.nodeName);
console.log(names); // ["a", "b", "c"]
```

</details>

___

###  reduce

Reduces child nodes into a single value by applying the given callback function.

<details>
<summary><code><strong>reduce</strong>(<code>callback</code>: (value: any, node: XMLBuilder, index: number) => any, <code>initialValue</code>: any, <code>self</code>?: boolean, <code>recursive</code>?: boolean, <code>thisArg</code>?: any)</code></summary>
<br/>

* `callback` - a callback function which receives the current value as its first argument, each child node as its second argument and the node index as its third argument
* `initialValue` - initial value
* `self` - whether to visit the current node along with child nodes (optional)
* `recursive` - whether to visit all descendant nodes in tree-order or only the immediate child nodes (optional)
* `thisArg` - value to use as this when executing callback (optional)

```js
const { create } = require('xmlbuilder2');

const root = create().ele("root");
root.ele("a").up()
    .ele("b").up()
    .ele("c").up();
const names = root.reduce((val, n) => val + n.node.nodeName, "");
console.log(names); // "abc"
```

</details>

___

###  find

Returns the first child node satisfying the given predicate, or `undefined` if there are no child nodes that satisfy the predicate.

_Note:_ `find` returns as soon as a node satisfies the predicate, without necessarily visiting all child nodes.

<details>
<summary><code><strong>find</strong>(<code>predicate</code>: (node: XMLBuilder, index: number) => boolean, <code>self</code>?: boolean, <code>recursive</code>?: boolean, <code>thisArg</code>?: any)</code></summary>
<br/>

* `predicate` - a predicate function which receives each child node as its first argument and the node index as its second argument and returns a boolean value indicating if the current node is the node sought
* `self` - whether to visit the current node along with child nodes (optional)
* `recursive` - whether to visit all descendant nodes in tree-order or only the immediate child nodes (optional)
* `thisArg` - value to use as this when executing callback (optional)

```js
const { create } = require('xmlbuilder2');

const root = create().ele("root");
root.ele("a").up()
    .ele("b").up()
    .ele("c").up();
const bNode = root.find(n => n.node.nodeName === "b");
console.log(bNode.node.nodeName); // "b"
```

</details>

___

###  filter

Produces an array of child nodes which pass the given predicate test.

<details>
<summary><code><strong>filter</strong>(<code>predicate</code>: (node: XMLBuilder, index: number) => boolean, <code>self</code>?: boolean, <code>recursive</code>?: boolean, <code>thisArg</code>?: any)</code></summary>
<br/>

* `predicate` - a predicate function which receives each child node as its first argument and the node index as its second argument and returns a boolean value indicating if the current node is the node sought
* `self` - whether to visit the current node along with child nodes (optional)
* `recursive` - whether to visit all descendant nodes in tree-order or only the immediate child nodes (optional)
* `thisArg` - value to use as this when executing callback (optional)

```js
const { create } = require('xmlbuilder2');

const root = create().ele("root");
root.ele("node1").up()
    .txt("text")
    .ele("node2").up()
    .txt("more text");
const textNodes = root.filter(n => n.node.nodeType === 3); // contains "text" and "more text" nodes
```

</details>

___

###  every

Returns `true` if all child nodes pass the given predicate test.

<details>
<summary><code><strong>every</strong>(<code>predicate</code>: (node: XMLBuilder, index: number) => boolean, <code>self</code>?: boolean, <code>recursive</code>?: boolean, <code>thisArg</code>?: any)</code></summary>
<br/>

* `predicate` - a predicate function which receives each child node as its first argument and the node index as its second argument and returns a boolean value indicating if the current node is the node sought
* `self` - whether to visit the current node along with child nodes (optional)
* `recursive` - whether to visit all descendant nodes in tree-order or only the immediate child nodes (optional)
* `thisArg` - value to use as this when executing callback (optional)

```js
const { create } = require('xmlbuilder2');

const root = create().ele("root");
root.ele("node1").up()
    .ele("node2").up()
root.every(n => n.node.nodeName.startsWith("n")); // true
```

</details>

___

###  some

Returns `true` if any of the child nodes pass the given predicate test.

_Note:_ `some` returns as soon as a node satisfies the predicate, without necessarily visiting all child nodes

<details>
<summary><code><strong>some</strong>(<code>predicate</code>: (node: XMLBuilder, index: number) => boolean, <code>self</code>?: boolean, <code>recursive</code>?: boolean, <code>thisArg</code>?: any)</code></summary>
<br/>

* `predicate` - a predicate function which receives each child node as its first argument and the node index as its second argument and returns a boolean value indicating if the current node is the node sought
* `self` - whether to visit the current node along with child nodes (optional)
* `recursive` - whether to visit all descendant nodes in tree-order or only the immediate child nodes (optional)
* `thisArg` - value to use as this when executing callback (optional)

```js
const { create } = require('xmlbuilder2');

const root = create().ele("root");
root.ele("node1").up()
    .ele("child").up()
    .ele("node2").up()
root.some(n => n.node.nodeName.startsWith("n")); // true
```

</details>

___

###  toArray

Produces an array of child nodes.

<details>
<summary><code><strong>toArray</strong>(<code>self</code>?: boolean, <code>recursive</code>?: boolean)</code></summary>
<br/>

* `self` - whether to visit the current node along with child nodes (optional)
* `recursive` - whether to visit all descendant nodes in tree-order or only the immediate child nodes (optional)

```js
const { create } = require('xmlbuilder2');

const root = create().ele("root");
root.ele("a").up()
    .ele("b").up()
    .ele("c").up()
const nodes = root.toArray(); // contains nodes a, b and c
```

</details>

## Conversion

Following functions can be used to convert an XML document into a string or an
object. See
[serialization settings]({{ site.baseurl }}{% link pages/serialization.md %}#serialization-settings)
page for the settings object used by these functions.

_Note:_ `end` function converts the **entire** XML document, 
where `toString` and `toObject` functions convert only the node they are called with.

###  end

Converts the entire XML document into its string or object representation. `end`
can be called from anywhere in the document.

<details>
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

<details>
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

<details>
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
