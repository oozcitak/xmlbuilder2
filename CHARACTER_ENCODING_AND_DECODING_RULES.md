# Character Encoding and Decoding Rules

This document establishes the rules of encoding and decoding entities. XML specifies five predefined entities which are `&amp;`, `&lt;`, `&gt;` ,`&apos;` and `&quot;`.

## Parsing XML

While parsing the string representing of an XML document:

* For the value of CDATA, comment and processing instruction nodes; no special processing is needed and all characters from the input string is passed to the node value as-is.
* For the value of text and attribute nodes; all five predefined entitites, numeric character references (`&#nnnn;`) and hexadecimal numeric character references (`&#xhhhh;`) are decoded (note that the `x` must be lowercase). The two examples given below for the Yen character applies to all numeric character references.

| Value    | Decoded Value |
|----------|---------------|
| `&amp;`  | `&`           |
| `&lt;`   | `<`           |
| `&gt;`   | `>`           |
| `&apos;` | `'`           |
| `&quot;` | `"`           |
| `&#9;`   | `\t`          |
| `&#10;`  | `\n`          |
| `&#xA;`  | `\n`          |
| `&#13;`  | `\r`          |
| `&#xD;`  | `\r`          |
| `&#165;` | `¥` (e.g.)    |
| `&#xA5;` | `¥` (e.g.)    |

## Serializing XML

While serializing an XML document to its string representation:

* For the value of CDATA, comment and processing instruction nodes; no special processing is needed.
* For the value of text nodes; `&`, `<` and `>` are encoded into predefined entitites, other characters are left as-is.

| Value | Encoded Value |
|-------|---------------|
| `&`   | `&amp;`       |
| `<`   | `&lt;`        |
| `>`   | `&gt;`        |

* For the value of attribute nodes, `&`, `<`, `>` and `"` are encoded (apostrophe is not encoded since attribute values are always serialized with double quotes). In additition, `\t`, `\n`and `\r` are also encoded into numeric character references.

| Value | Encoded Value |
|-------|---------------|
| `&`   | `&amp;`       |
| `<`   | `&lt;`        |
| `>`   | `&gt;`        |
| `"`   | `&quot;`      |
| `\t`  | `&#9;`        |
| `\n`  | `&#10;`       |
| `\r`  | `&#13;`       |

## Round Trip: String -> XML -> String

A round trip will potentially result in different string representations as described below.

* CDATA, comment and processing instruction nodes can safely round trip as their values are not processed at all.
* Value of text nodes may potentially change due to differences in parsing and serialization.

| Value    | Decoded Value | Encoded Value | Same? |
|----------|---------------|---------------|-------|
| `&amp;`  | `&`           | `&amp;`       | ✓     |
| `&lt;`   | `<`           | `&lt;`        | ✓     |
| `&gt;`   | `>`           | `&gt;`        | ✓     |
| `&apos;` | `'`           | `'`           | ✗     |
| `&quot;` | `"`           |`"`            | ✗     |
| `&#9;`   | `\t`          |`\t`           | ✗     |
| `&#10;`  | `\n`          |`\n`           | ✗     |
| `&#xA;`  | `\n`          |`\n`           | ✗     |
| `&#13;`  | `\r`          |`\r`           | ✗     |
| `&#xD;`  | `\r`          |`\r`           | ✗     |
| `&#165;` | `¥`           |`¥`            | ✗     |
| `&#xA5;` | `¥`           |`¥`            | ✗     |

* Value of attribute nodes may also change as below.

| Value    | Decoded Value | Encoded Value | Same? |
|----------|---------------|---------------|-------|
| `&amp;`  | `&`           | `&amp;`       | ✓     |
| `&lt;`   | `<`           | `&lt;`        | ✓     |
| `&gt;`   | `>`           | `&gt;`        | ✓     |
| `&apos;` | `'`           | `'`           | ✗     |
| `&quot;` | `"`           | `&quot;`      | ✓     |
| `&#9;`   | `\t`          | `&#9;`        | ✓     |
| `&#10;`  | `\n`          | `&#10;`       | ✓     |
| `&#xA;`  | `\n`          | `&#10;`       | ✗     |
| `&#13;`  | `\r`          | `&#13;`       | ✓     |
| `&#xD;`  | `\r`          | `&#13;`       | ✗     |
| `&#165;` | `¥`           | `¥`           | ✗     |
| `&#xA5;` | `¥`           | `¥`           | ✗     |

## Round Trip: XML -> String -> XML

A round from an XML document to its string representation and back to an XML document is safe.

* CDATA, comment and processing instruction can safely round trip as their values are not processed at all.
* Text nodes are safe because all encoded values are decoded back to their original character representations.

| Value | Encoded Value | Decoded Value | Same? |
|-------|---------------|---------------|-------|
| `&`   | `&amp;`       | `&`           | ✓     |
| `<`   | `&lt;`        | `<`           | ✓     |
| `>`   | `&gt;`        | `>`           | ✓     |

* Attribute nodes are also safe.

| Value | Encoded Value | Decoded Value | Same? |
|-------|---------------|---------------|-------|
| `&`   | `&amp;`       | `&`           | ✓     |
| `<`   | `&lt;`        | `<`           | ✓     |
| `>`   | `&gt;`        | `>`           | ✓     |
| `"`   | `&quot;`      | `"`           | ✓     |
| `\t`  | `&#9;`        | `\t`          | ✓     |
| `\n`  | `&#10;`       | `\n`          | ✓     |
| `\r`  | `&#13;`       | `\r`          | ✓     |
