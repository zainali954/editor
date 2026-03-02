/**
 * Fabric.js v7 type extensions.
 * Adds the `data` custom property to FabricObject for metadata storage.
 */

import "fabric";

declare module "fabric" {
    interface FabricObject {
        data?: Record<string, unknown>;
    }

    interface SerializedObjectProps {
        data?: Record<string, unknown>;
    }
}
