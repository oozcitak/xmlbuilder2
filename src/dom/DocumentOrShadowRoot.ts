import { Utility } from './Utility'
import { Document } from './Document'
import { ShadowRoot } from './ShadowRoot'

/**
 * Represents a mixin for an interface to be used to share APIs between
 * documents and shadow roots. This mixin is implemented by
 * {@link Document} and {@link ShadowRoot}.
 */
class DocumentOrShadowRoot {

}

// Apply mixins
Utility.Internal.applyMixin(Document, DocumentOrShadowRoot)
Utility.Internal.applyMixin(ShadowRoot, DocumentOrShadowRoot)
