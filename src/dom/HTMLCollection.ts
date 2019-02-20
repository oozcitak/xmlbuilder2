import { Element } from "./internal"

/**
 * Represents a collection of elements.
 */
export class HTMLCollection extends Array<Element> {

  /** 
   * Returns the element with index `index` from the collection.
   * 
   * @param index - the zero-based index of the element to return
   */
  item(index: number): Element | null { return this[index] || null }

  /** 
   * Returns the first element with ID or name `name` from the
   * collection.
   * 
   * @param name - the name of the element to return
   */
  namedItem(name: string): Element | null {
    if (!name) return null

    for (let child of this) {
      let ele = <Element>child

      if (ele.id === name)
        return ele

      let nameAtt = ele.getAttribute('name')
      if (nameAtt === name)
        return ele
    }

    return null
  }
}