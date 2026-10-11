const { z } = require('zod');

const email = z.string().trim().toLowerCase().pipe(z.email().max(150));
const registerSchema = z
  .object({
    nombre: z.string().trim().min(2).max(100),
    apellido: z.string().trim().max(100).default(''),
    email,
    password: z.string().min(10).max(128),
  })
  .strict();
const loginSchema = z
  .object({
    email,
    password: z.string().min(1).max(128),
  })
  .strict();

module.exports = { registerSchema, loginSchema };
