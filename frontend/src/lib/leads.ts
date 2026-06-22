import { z } from "zod";

export const leadSubmissionSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(80, "Name is too long"),
  phone: z
    .string()
    .trim()
    .min(7, "Enter a valid phone number")
    .max(20, "Phone number is too long")
    .regex(/^[+()\d\s-]+$/, "Use a valid phone number"),
  area: z.string().trim().min(2, "Enter your area or pincode").max(120, "Area is too long"),
  notes: z.string().trim().max(500, "Notes are too long").optional().default(""),
});

export type LeadSubmission = z.infer<typeof leadSubmissionSchema>;
