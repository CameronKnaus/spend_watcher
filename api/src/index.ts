import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { PROD_DOMAIN, LOCAL_DOMAIN } from './lib/ENVIRONMENT_SETTINGS.json';
import routes from '@routes/routes';
import HttpErrorHandler from '@utils/ErrorHandling/HttpErrorHandler';
import logRouteList from '@utils/Logging/logRouteList';

const isDevMode = process.env.ENVIRONMENT === 'DEV';
const allowedOrigin = isDevMode ? LOCAL_DOMAIN : PROD_DOMAIN;

// Define the express app
const app = express();

// Provide ability to parse cookies (for JWT tokens)
app.use(cookieParser());

// Cross Origin Resource Sharing (CORS) settings
app.use((req, res, next) => {
  res.set('Access-Control-Allow-Origin', allowedOrigin);
  res.set('Access-Control-Allow-Methods: GET, POST, OPTIONS');
  res.set('Access-Control-Request-Method: GET, POST');
  res.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, x-token, Authorization');
  res.set('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    res.end();
  } else {
    next();
  }
});

// Equip app with json manipulation capabilities
app.use(express.json());

// Enhance security of the app with helmet
app.use(helmet());

// Add routes
app.use(routes);

// Add error handling
app.use(HttpErrorHandler);

// Define the port
const PORT = process.env.PORT || 4000;

// Starting our server.
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

if (isDevMode) {
  console.log('\x1b[35mDevelopment Mode Enabled \x1b[0m');
  logRouteList(app);
  console.log(`\x1b[33mListening for requests from ${allowedOrigin}...\x1b[0m`);
}
