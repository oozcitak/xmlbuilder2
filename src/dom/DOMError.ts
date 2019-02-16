/**
 * Contains static properties to produce `Error` objects used by this
 * module.
 */
export class DOMError {
  static IndexSizeError = new Error("IndexSizeError: The index is not in the allowed range.")
  static HierarchyRequestError = new Error("HierarchyRequestError: The operation would yield an incorrect node tree.")
  static WrongDocumentError = new Error("WrongDocumentError: The object is in the wrong document.")
  static InvalidCharacterError = new Error("InvalidCharacterError: The string contains invalid characters.")
  static NoModificationAllowedError = new Error("NoModificationAllowedError: The object can not be modified.")
  static NotFoundError = new Error("NotFoundError: The object can not be found here.")
  static NotSupportedError = new Error("NotSupportedError: The operation is not supported.")
  static InvalidStateError = new Error("InvalidStateError: The object is in an invalid state.")
  static SyntaxError = new Error("SyntaxError: The string did not match the expected pattern.")
  static InvalidModificationError = new Error("InvalidModificationError: The object can not be modified in this way.")
  static NamespaceError = new Error("NamespaceError: The operation is not allowed by Namespaces in XML. [XMLNS]")
  static InvalidAccessError = new Error("InvalidAccessError: The object does not support the operation or argument.")
  static SecurityError = new Error("SecurityError: The operation is insecure.")
  static NetworkError = new Error("NetworkError: A network error occurred.")
  static AbortError = new Error("AbortError: The operation was aborted.")
  static URLMismatchError = new Error("URLMismatchError: The given URL does not match another URL.")
  static QuotaExceededError = new Error("QuotaExceededError: The quota has been exceeded.")
  static TimeoutError = new Error("TimeoutError: The operation timed out.")
  static InvalidNodeTypeError = new Error("InvalidNodeTypeError: The supplied node is incorrect or has an incorrect ancestor for this operation.")
  static DataCloneError = new Error("DataCloneError: The object can not be cloned.")
  static EncodingError = new Error("EncodingError: The encoding operation (either encoded or decoding) failed.")
  static NotReadableError = new Error("NotReadableError: The I/O read operation failed.")    
}