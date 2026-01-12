const { z } = require("zod");

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const friendRequestSchema = z.object({
  body: z.object({
    recipientId: z.string({ required_error: "Recipient ID is required" }).regex(objectIdRegex, { message: "Invalid Recipient ID format" }),
  }),
});

const acceptFriendSchema = z.object({
  body: z.object({
    requestId: z.string({ required_error: "Sender ID is required" }).regex(objectIdRegex, { message: "Invalid Sender ID format" }),
  }),
});
const searchUserSchema = z.object({
  query: z.object({
    query: z
      .string({ required_error: "Arama metni gereklidir." })
      .min(1, { message: "En az 1 karakter girmelisiniz." })
      .max(50, { message: "Arama metni çok uzun." })
      .regex(/^[a-zA-Z0-9 ]+$/, "Arama sadece harf ve rakam içerebilir."),
  }),
});

module.exports = { friendRequestSchema, acceptFriendSchema, searchUserSchema };
