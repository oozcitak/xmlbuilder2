/**
 * Contains static properties to produce `Error` objects used by this
 * module.
 */
export class DOMExceptionImpl extends Error {

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

  static IndexSizeError = new DOMExceptionImpl("IndexSizeError", "The index is not in the allowed range.")
  static DOMStringSizeError = new DOMExceptionImpl("DOMStringSizeError", "")
  static HierarchyRequestError = new DOMExceptionImpl("HierarchyRequestError", "The operation would yield an incorrect node tree.")
  static WrongDocumentError = new DOMExceptionImpl("WrongDocumentError", "The object is in the wrong document.")
  static InvalidCharacterError = new DOMExceptionImpl("InvalidCharacterError", "The string contains invalid characters.")
  static NoDataAllowedError = new DOMExceptionImpl("NoDataAllowedError", "")
  static NoModificationAllowedError = new DOMExceptionImpl("NoModificationAllowedError", "The object can not be modified.")
  static NotFoundError = new DOMExceptionImpl("NotFoundError", "The object can not be found here.")
  static NotSupportedError = new DOMExceptionImpl("NotSupportedError", "The operation is not supported.")
  static InUseAttributeError = new DOMExceptionImpl("InUseAttributeError", "")
  static InvalidStateError = new DOMExceptionImpl("InvalidStateError", "The object is in an invalid state.")
  static SyntaxError = new DOMExceptionImpl("SyntaxError", "The string did not match the expected pattern.")
  static InvalidModificationError = new DOMExceptionImpl("InvalidModificationError", "The object can not be modified in this way.")
  static NamespaceError = new DOMExceptionImpl("NamespaceError", "The operation is not allowed by Namespaces in XML. [XMLNS]")
  static InvalidAccessError = new DOMExceptionImpl("InvalidAccessError", "The object does not support the operation or argument.")
  static ValidationError = new DOMExceptionImpl("ValidationError", "")
  static TypeMismatchError = new DOMExceptionImpl("TypeMismatchError", "")
  static SecurityError = new DOMExceptionImpl("SecurityError", "The operation is insecure.")
  static NetworkError = new DOMExceptionImpl("NetworkError", "A network error occurred.")
  static AbortError = new DOMExceptionImpl("AbortError", "The operation was aborted.")
  static URLMismatchError = new DOMExceptionImpl("URLMismatchError", "The given URL does not match another URL.")
  static QuotaExceededError = new DOMExceptionImpl("QuotaExceededError", "The quota has been exceeded.")
  static TimeoutError = new DOMExceptionImpl("TimeoutError", "The operation timed out.")
  static InvalidNodeTypeError = new DOMExceptionImpl("InvalidNodeTypeError", "The supplied node is incorrect or has an incorrect ancestor for this operation.")
  static DataCloneError = new DOMExceptionImpl("DataCloneError", "The object can not be cloned.")
  static NotImplementedError = new DOMExceptionImpl("NotImplementedError", "The DOM method is not implemented by this module.")
}