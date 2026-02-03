export const nonEntityAmpersandRegex = /&(?![A-Za-z]+;|#\d+;)/g;
export const entityNumberRegex = /&#(?:x([a-fA-F0-9]+)|([0-9]+));/g;

/* Regex patterns for parsing XML
 * ------------------------------
 * For the value of text and attribute nodes; all five predefined entitites, numeric character references (`&#nnnn;`)
 * and hexadecimal numeric character references (`&#xhhhh;`) are decoded (note that the `x` must be lowercase).
 * The two examples given below for the Yen character applies to all numeric character references.
 * The five predefined entities are `&amp;`, `&lt;`, `&gt;` ,`&apos;` and `&quot;`.
 *
 * | Value    | Decoded Value |
 * |----------|---------------|
 * | `&amp;`  | `&`           |
 * | `&lt;`   | `<`           |
 * | `&gt;`   | `>`           |
 * | `&apos;` | `'`           |
 * | `&quot;` | `"`           |
 * | `&#9;`   | `\t`          |
 * | `&#10;`  | `\n`          |
 * | `&#xA;`  | `\n`          |
 * | `&#13;`  | `\r`          |
 * | `&#xD;`  | `\r`          |
 * | `&#165;` | `¥` (e.g.)    |
 * | `&#xA5;` | `¥` (e.g.)    |
 */
export const decodeValueRegex = /&(amp|lt|gt|apos|quot);/g
export const decodeValueLookup : { [key: string]: string } = {
  "amp": "&",
  "lt": "<",
  "gt": ">",
  "apos": "'",
  "quot": '"',
}
export const decodeNumberedEntityRegex = /&#(?:x([a-fA-F0-9]+)|([0-9]+));/g;

/* Regex patterns for serializing XML
 * ----------------------------------
 * For the value of text nodes; `&`, `<` and `>` are encoded into predefined entitites, other characters are left as-is.
 *
 * | Value | Encoded Value |
 * |-------|---------------|
 * | `&`   | `&amp;`       |
 * | `<`   | `&lt;`        |
 * | `>`   | `&gt;`        |
 *
 * & is handled by the nonEntityAmpersandRegex above.
 */
export const encodeTextValueRegex = /<|>/g
export const encodeTextValueLookup: { [key: string]: string } = {
  "<": "&lt;",
  ">": "&gt;",
}

/* For the value of attribute nodes, `&`, `<`, `>` and `"` are encoded (apostrophe is not encoded since attribute values
 * are always serialized with double quotes). In additition, `\t`, `\n`and `\r` are also encoded into numeric character
 * references.
 *
 * | Value | Encoded Value |
 * |-------|---------------|
 * | `&`   | `&amp;`       |
 * | `<`   | `&lt;`        |
 * | `>`   | `&gt;`        |
 * | `"`   | `&quot;`      |
 * | `\t`  | `&#9;`        |
 * | `\n`  | `&#10;`       |
 * | `\r`  | `&#13;`       |
 *
 * & is handled by the nonEntityAmpersandRegex above.
 */
export const encodeAttributeValueRegex = /<|>|"|\t|\n|\r/g
export const encodeAttributeValueLookup: { [key: string]: string } = {
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "\t": "&#9;",
  "\n": "&#10;",
  "\r": "&#13;",
}
