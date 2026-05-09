import { Router } from 'express';
import verifyAuthToken from 'src/middleware/verifyAuthToken';
import AccountsController from './accounts/accounts.controller';
import AuthController from './authentication/auth.controller';
import SpendingController from './spending/spending.controller';
import TripsController from './trips/trips.controller';

const api = Router()
    .use('/user', AuthController)
    // TODO: Verify that the auth token validation is occurring when passing in here
    .use('/accounts', verifyAuthToken, AccountsController)
    .use('/spending', verifyAuthToken, SpendingController)
    .use('/trips', verifyAuthToken, TripsController);

export default Router().use('/api', api);
