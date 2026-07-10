/// <reference types="vite/client" />

// Vite's own ImportMetaEnv/ImportMeta are interfaces; augmenting them requires declaration
// merging, which only works with `interface`, not `type`.
/* eslint-disable @typescript-eslint/consistent-type-definitions */
interface ImportMetaEnv {
  readonly VITE_DOMAIN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
