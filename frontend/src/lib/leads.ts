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
  product: z
    .string()
    .trim()
    .min(1, "Choose a product")
    .max(80, "Product is too long")
    .default("milk"),
  requestType: z.enum(["subscription", "order"]).default("subscription"),
  quantity: z.coerce
    .number()
    .int("Enter a whole number")
    .min(1, "Enter a valid quantity")
    .max(50, "Quantity is too high"),
  plan: z.preprocess((val) => val || "daily", z.enum(["daily", "alternate", "custom"])),
  source: z
    .string()
    .trim()
    .min(2, "Source is too short")
    .max(40, "Source is too long")
    .default("website"),
  notes: z.string().trim().max(500, "Notes are too long").optional().default(""),
});

export type LeadSubmission = z.infer<typeof leadSubmissionSchema>;
