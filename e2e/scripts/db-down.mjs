// Tears the throwaway MySQL container (and its volume) down. Used by the `db:down` script and by
// Playwright's globalTeardown.
import { compose } from './container.mjs';

compose(['down', '-v'], { allowFail: true });
