const { z } = require("zod");
const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const createGroupSchema = z.object({
  body: z.object({
    name: z.string({ required_error: "Grup ismi zorunludur" }).min(3),

    publicGroupKey: z.string({ required_error: "Grup Public Key eksik" }),

    members: z
      .array(
        z.object({
          user: z.string().regex(objectIdRegex, { message: "Geçersiz Üye ID" }),
          encryptedKey: z.string({ required_error: "Üye için şifreli anahtar eksik" }),
          role: z.enum(["admin", "member"]).default("member"),
        })
      )
      .min(1, { message: "Grup en az 1 üyeden oluşmalıdır" }), // En azından kendisi olmalı

    profilePic: z.string().optional(),
  }),
});

module.exports = { createGroupSchema };
