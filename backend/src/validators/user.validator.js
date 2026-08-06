const { z } = require("zod");

const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Name must be at least 3 characters")
    .max(50, "Name cannot exceed 50 characters")
    .optional(),

  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Invalid phone number")
    .optional(),

  college: z.string().trim().max(100).optional(),

  gender: z.enum(["male", "female", "other"]).optional(),

  emergencyContact: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Invalid emergency contact")
    .optional(),

  profileImage: z.string().optional(),
});

module.exports = {
  updateProfileSchema,
};
