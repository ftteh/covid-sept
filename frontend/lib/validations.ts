import { z } from 'zod';

// Base schema without refinements
const baseHealthDeclarationSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters long')
    .max(100, 'Name must not exceed 100 characters')
    .regex(/^[a-zA-Z\s\-',.]+$/, 'Name can only contain letters, spaces, hyphens, apostrophes, commas, and periods')
    .transform((val) => val.trim()),

  temperature: z
    .number({
      required_error: 'Temperature is required',
      invalid_type_error: 'Temperature must be a number',
    })
    .min(30, 'Temperature must be at least 30°C')
    .max(45, 'Temperature must not exceed 45°C')
    .multipleOf(0.01, 'Temperature can have at most 2 decimal places'),

  hasSymptoms: z
    .union([z.boolean(), z.string()])
    .transform((val) => {
      if (typeof val === 'string') {
        return val === 'true';
      }
      return val;
    })
    .pipe(z.boolean({
      required_error: 'Please indicate if you have symptoms',
    })),

  symptoms: z
    .string()
    .max(500, 'Symptoms description must not exceed 500 characters')
    .optional()
    .transform((val) => val?.trim() || undefined),

  hasContact: z
    .union([z.boolean(), z.string()])
    .transform((val) => {
      if (typeof val === 'string') {
        return val === 'true';
      }
      return val;
    })
    .pipe(z.boolean({
      required_error: 'Please indicate if you have had contact with COVID-19 cases',
    })),

  contactDetails: z
    .string()
    .max(1000, 'Contact details must not exceed 1000 characters')
    .optional()
    .transform((val) => val?.trim() || undefined),
});

// Main schema with refinements
export const healthDeclarationSchema = baseHealthDeclarationSchema
.refine((data) => {
  // If hasSymptoms is true, symptoms must be provided
  if (data.hasSymptoms && !data.symptoms) {
    return false;
  }
  return true;
}, {
  message: 'Please provide symptom details when you have symptoms',
  path: ['symptoms'],
})
.refine((data) => {
  // If hasContact is true, contactDetails must be provided
  if (data.hasContact && !data.contactDetails) {
    return false;
  }
  return true;
}, {
  message: 'Please provide contact details when you have had contact with COVID-19 cases',
  path: ['contactDetails'],
});

export type HealthDeclarationFormData = z.infer<typeof healthDeclarationSchema>;

// Schema for updating health declarations (mainly for status updates)
export const updateHealthDeclarationSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  name: baseHealthDeclarationSchema.shape.name.optional(),
  temperature: baseHealthDeclarationSchema.shape.temperature.optional(),
  hasSymptoms: baseHealthDeclarationSchema.shape.hasSymptoms.optional(),
  symptoms: baseHealthDeclarationSchema.shape.symptoms,
  hasContact: baseHealthDeclarationSchema.shape.hasContact.optional(),
  contactDetails: baseHealthDeclarationSchema.shape.contactDetails,
});

export type UpdateHealthDeclarationFormData = z.infer<typeof updateHealthDeclarationSchema>; 