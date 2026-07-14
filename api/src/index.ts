import 'dotenv/config';
import { env } from '@lib/env'; // Validates process.env at boot — keep this first.
import { OpenAPIHandler } from '@orpc/openapi/node';
import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import cors from 'cors';
import { router } from './orpc/router';
import HttpErrorHandler from '@utils/ErrorHandling/HttpErrorHandler';

const isDevMode = env.ENVIRONMENT === 'DEV';

// Define the express app
const app = express();

// Security headers
app.use(helmet());

// Cors
app.use(
  cors({
    origin: env.DOMAIN,
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept'],
  }),
);

// Parse cookies (for JWT tokens) and JSON request bodies.
app.use(cookieParser());
app.use(express.json());

// Init orpc with `router` contract
const orpcHandler = new OpenAPIHandler(router);
app.use('/api{/*path}', async (request, response, next) => {
  const { matched } = await orpcHandler.handle(request, response, {
    prefix: '/api',
    context: { cookies: request.cookies, response },
  });

  if (matched) {
    return;
  }

  // Nothing in the contract matched — let Express fall through to its default 404.
  next();
});

// Error handler — must stay LAST, after all routes, so thrown errors reach it.
app.use(HttpErrorHandler);

// Start the server.
const server = app.listen(env.PORT, () => {
  console.log(`Listening on port ${env.PORT}`);

  if (isDevMode) {
    console.log('\x1b[35mDevelopment Mode Enabled \x1b[0m');
    console.log(`\x1b[33mListening for requests from ${env.DOMAIN}...\x1b[0m`);
  }
});

process.on('SIGINT', () => {
  console.log(`\n'SIGINT' received — shutting down gracefully...`);
  server.close(() => process.exit(0));
});

process.on('SIGTERM', () => {
  console.log(`\n'SIGTERM' received — shutting down gracefully...`);
  server.close(() => process.exit(0));
});
