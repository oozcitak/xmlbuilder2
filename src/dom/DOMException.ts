/**
 * Contains static properties to produce `Error` objects used by this
 * module.
 */
export class DOMException extends Error {

  /**
   * Returns the name of the error message.
   */
  readonly name: string

  /**
   * 
   * @param name - message name
   * @param message - error message
   */
  constructor(name: string, message: string) {
    super(message)

    this.name = name
  }

  static IndexSizeError = new DOMException("IndexSizeError", "The index is not in the allowed range.")
  static DOMStringSizeError = new DOMException("DOMStringSizeError", "")
  static HierarchyRequestError = new DOMException("HierarchyRequestError", "The operation would yield an incorrect node tree.")
  static WrongDocumentError = new DOMException("WrongDocumentError", "The object is in the wrong document.")
  static InvalidCharacterError = new DOMException("InvalidCharacterError", "The string contains invalid characters.")
  static NoDataAllowedError = new DOMException("NoDataAllowedError", "")
  static NoModificationAllowedError = new DOMException("NoModificationAllowedError", "The object can not be modified.")
  static NotFoundError = new DOMException("NotFoundError", "The object can not be found here.")
  static NotSupportedError = new DOMException("NotSupportedError", "The operation is not supported.")
  static InUseAttributeError = new DOMException("InUseAttributeError", "")
  static InvalidStateError = new DOMException("InvalidStateError", "The object is in an invalid state.")
  static SyntaxError = new DOMException("SyntaxError", "The string did not match the expected pattern.")
  static InvalidModificationError = new DOMException("InvalidModificationError", "The object can not be modified in this way.")
  static NamespaceError = new DOMException("NamespaceError", "The operation is not allowed by Namespaces in XML. [XMLNS]")
  static InvalidAccessError = new DOMException("InvalidAccessError", "The object does not support the operation or argument.")
  static ValidationError = new DOMException("ValidationError", "")
  static TypeMismatchError = new DOMException("TypeMismatchError", "")
  static SecurityError = new DOMException("SecurityError", "The operation is insecure.")
  static NetworkError = new DOMException("NetworkError", "A network error occurred.")
  static AbortError = new DOMException("AbortError", "The operation was aborted.")
  static URLMismatchError = new DOMException("URLMismatchError", "The given URL does not match another URL.")
  static QuotaExceededError = new DOMException("QuotaExceededError", "The quota has been exceeded.")
  static TimeoutError = new DOMException("TimeoutError", "The operation timed out.")
  static InvalidNodeTypeError = new DOMException("InvalidNodeTypeError", "The supplied node is incorrect or has an incorrect ancestor for this operation.")
  static DataCloneError = new DOMException("DataCloneError", "The object can not be cloned.")
  static NotImplementedError = new DOMException("NotImplementedError", "The DOM method is not implemented by this module.")
}