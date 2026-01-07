const { z } = require("zod");

// Strong Password Regex: At least 1 uppercase, 1 lowercase, 1 number, 1 special char
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.\-_#])[A-Za-z\d@$!%*?&.\-_#]+$/;

const minPassLength = Number(process.env.PASS_LENGTH) || 8;

const registerSchema = z.object({
  body: z.object({
    userName: z
      .string({ required_error: "Username is required" })
      .min(minPassLength, { message: "Username must be at least 3 characters long" })
      .max(20, { message: "Username cannot exceed 20 characters" }),

    email: z
      .string({ required_error: "Email is required" })
      .email({ message: "Invalid email address format" })
      .max(50, { message: "Email is too long" }),

    password: z
      .string({ required_error: "Password is required" })
      .min(8, { message: "Password must be at least 8 characters long" })
      .regex(passwordRegex, {
        message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      }),

    encryptedPrivateKey: z.string({ 
      required_error: "Encrypted Private Key is missing. Key generation failed on client side." 
    }),

    publicKey: z.string({ 
      required_error: "Public Key is missing. Key generation failed on client side." 
    }),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: "Email is required" })
      .email({ message: "Invalid email address format" }),
    
    password: z
      .string({ required_error: "Password is required" })
      .min(1, { message: "Password cannot be empty" }),
  }),
});

module.exports = { registerSchema, loginSchema };