import { z as zod } from 'zod';

const MIN_USERNAME_LENGTH = 8;
const MIN_PASSWORD_LENGTH = 8;

// Validation schema for login service request params
export const loginRequestParamsSchema = zod
  .object({
    email: zod.string().email().or(zod.literal('')),
    username: zod
      .string()
      .min(MIN_USERNAME_LENGTH, { message: `Username must be at least ${MIN_USERNAME_LENGTH} characters` })
      .or(zod.literal('')),
    password: zod
      .string()
      .min(MIN_PASSWORD_LENGTH, { message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` }),
  })
  .partial({
    email: true,
    username: true,
  })
  .refine(({ email, username }) => email || username, {
    message: 'Either email or username must be provided',
  });

export type LoginRequestParams = zod.infer<typeof loginRequestParamsSchema>;

// Validation schema for registration service request params
export const registerRequestParamSchema = zod.object({
  email: zod.string().email(),
  password: zod
    .string()
    .min(MIN_PASSWORD_LENGTH, { message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` }),
  username: zod
    .string()
    .min(MIN_USERNAME_LENGTH, { message: `Username must be at least ${MIN_USERNAME_LENGTH} characters` }),
});

export type RegisterRequestParams = zod.infer<typeof registerRequestParamSchema>;
