import type { AuthVerifyResponse } from '@spend-watcher/contract';

export const authVerifyResponse = { authenticated: true, message: 'ok' } satisfies AuthVerifyResponse;
