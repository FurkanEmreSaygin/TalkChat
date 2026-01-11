const { z } = require("zod");

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const sendMessageSchema = z.object({
  body: z.object({
    recipientId: z.string({ required_error: "Recipient ID is required" }).regex(objectIdRegex, { message: "Invalid Recipient ID format" }),

    content: z.string({ required_error: "Message content is required" }).min(1, { message: "Message cannot be empty" }),

    senderContent: z.string().min(1),

    type: z.enum(["text", "image", "file"], {
      errorMap: () => ({ message: "Invalid message type (must be text, image, or file)" }),
    }),
  }),
});

module.exports = { sendMessageSchema };
