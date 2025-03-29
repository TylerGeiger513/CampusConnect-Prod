/**
 * @file env.validation.ts
 * @description Validates environment variables using Joi.
 */
import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3000),
  API_PREFIX: Joi.string().default('api'),
  CORS_ORIGIN: Joi.string().default('*'),

  // Mongo configuration
  MONGO_HOST: Joi.string().required(),
  MONGO_PORT: Joi.number().required(),
  MONGO_DB: Joi.string().required(),

  // Redis configuration
  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().required(),

  SESSION_SECRET: Joi.string().required(),
  ENCRYPTION_KEY: Joi.string().required(),
  COOKIE_SECURE: Joi.boolean().default(false),
  COOKIE_SAME_SITE: Joi.string().default('strict'),
});
