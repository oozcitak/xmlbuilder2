import { Node } from './Node'

export class Utility {
  /**
   * Applies the given function to all descendant nodes of the given
   * node.
   * 
   * @param node - the node whose descendants will be traversed
   * @param func - the function to apply to the descendant nodes. The
   * function receives each descendant node as an argument and should
   * return a truthy value to stop iteration, or falsey value to
   * continue with the next descendant.
   * 
   * @returns the value returned from `func`
   */
  static forEachDescendant(node: Node, func: (node: Node) => any): any {
    for (let child of node.childNodes) {
      let res = func(child)
      if (res) {
        return res
      } else {
        let res = Utility.forEachDescendant(child, func)
        if(res) return res
      }
    }
  }
}