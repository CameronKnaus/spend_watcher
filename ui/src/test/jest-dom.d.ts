// Loads the @testing-library/jest-dom matcher augmentations for TypeScript. The matchers are
// registered at runtime in `vitest.setup.ts`, but that file is outside the tsconfig `include`, so we
// pull the type augmentation in here (this file lives under `src/`, which is included) to make
// matchers like `toBeInTheDocument` / `toHaveTextContent` available on vitest's `expect`.
import '@testing-library/jest-dom/vitest';
