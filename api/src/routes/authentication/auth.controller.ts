import { NextFunction, Request, Response, Router } from 'express';
import verifyAuthToken from 'src/middleware/verifyAuthToken';
import {
    LoginRequestParams,
    loginRequestParamsSchema,
    RegisterRequestParams,
    registerRequestParamSchema,
} from './auth.model';
import { handleLogin, handleRegistration } from './auth.service';

const api = Router();

api.post('/v1/login', async (request: Request<LoginRequestParams>, response: Response, next: NextFunction) => {
    try {
        loginRequestParamsSchema.parse(request.body);

        /* If this was a production level app we would not be sending passwords around in plain text */
        const { username, password } = request.body;

        await handleLogin(username, password, response);
        response.status(200).send({
            message: 'Login successful',
        });
    } catch (error) {
        next(error);
    }
});

api.post('/v1/register', async (request: Request<RegisterRequestParams>, response: Response, next: NextFunction) => {
    try {
        registerRequestParamSchema.parse(request.body);

        /* If this was a production level app we would not be sending passwords around in plain text */
        const { username, email, password } = request.body;
        await handleRegistration(username, email, password, response);
        response.status(200).send({
            message: 'Registration successful',
        });
    } catch (error) {
        next(error);
    }
});

api.get('/v1/verify', verifyAuthToken, async (request: Request, response: Response) => {
    response.status(200).json({
        message: 'Token is valid',
    });
});

export default api;
