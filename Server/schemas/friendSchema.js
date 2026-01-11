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

module.exports = { friendRequestSchema, acceptFriendSchema };
