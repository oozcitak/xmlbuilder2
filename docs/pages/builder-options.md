---
title: "Builder Options"
keywords: options settings
sidebar: api_sidebar
permalink: builder-options.html
toc: false
comments: false
---

This page documents the various options that can be used to customize the behavior of XML builder.

### Settings related to XML declaration

* `version` - a version number string. Defaults to `"1.0"` if omitted.
* `encoding` - encoding declaration, e.g. `"UTF-8"`. No encoding declaration will be produced if omitted.
* `standalone` - standalone document declaration: `true` or `false`. No standalone document declaration will be produced if omitted.

_Note:_ XML declaration can be specified later with the `dec` function.

### Settings related to value conversions

* `keepNullNodes` - whether nodes with `null` and `undefined` values will be kept or ignored: `true` or `false`. Defaults to `false`, which silently ignores nodes with `null` and `undefined` values. When set to `true`, `null` will be treated as an empty string.
* `keepNullAttributes` - whether attributes with `null` and `undefined` values will be kept or ignored: `true` or `false`. Defaults to `false`, which silently ignores attributes with `null` and `undefined` values. When set to `true`, `null` will be treated as an empty string.
* `ignoreConverters` - whether converter strings will be ignored when converting JS objects: `true` or `false`. Defaults to `false`.
* `convert` - an object defining converter strings. Default converter strings are described below.
  * `att` -  When prepended to a JS object key, converts its key-value pair to an attribute. Defaults to `"@"`.
  * `ins` - When prepended to a JS object key, converts its value to a processing instruction node. Defaults to `"?"`.
  * `text` - When prepended to a JS object key, converts its value to a text node. Defaults to `"#"`.
  * `cdata` - When prepended to a JS object key, converts its value to a CDATA section node. Defaults to `"$"`.
  * `comment` - When prepended to a JS object key, converts its value to a comment node. Defaults to `"!"`.
* `defaultNamespace` - contains default namespaces to apply to all elements and attributes (see: [`example`]({{ site.baseurl }}{% link pages/namespaces.md %}#namespace-defaults))
  * `ele` - default namespace for element nodes
  * `att` - default namespace for attributes
* `namespaceAlias` - contains namespace aliases where object keys are namespace aliases and object values are namespaces (see: [`example`]({{ site.baseurl }}{% link pages/namespaces.md %}#namespace-aliases))
