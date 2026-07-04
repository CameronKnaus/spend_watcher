import { http, HttpResponse } from 'msw';
import { authVerifyResponse } from '../mocks/auth/authVerifyResponse';

export const authHandlers = [http.get('*/api/auth/verify', () => HttpResponse.json(authVerifyResponse))];
