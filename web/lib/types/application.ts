import { z } from 'zod'

const today = new Date()
today.setHours(0, 0, 0, 0)

const minBirthDate = new Date()
minBirthDate.setFullYear(minBirthDate.getFullYear() - 18)

export const ApplicationCreateSchema = z
  .object({
    firstName: z.string().min(1, 'Jméno je povinné'),
    lastName: z.string().min(1, 'Příjmení je povinné'),
    birthDate: z.coerce
      .date()
      .refine(date => date <= minBirthDate, 'Musíte být starší 18 let')
      .refine(date => date <= today, 'Datum narození nemůže být v budoucnosti'),
    gender: z.enum(['Muž', 'Žena']),
    phone: z.string().min(9, 'Telefonní číslo je povinné'),
    email: z.string().email('Neplatný email'),
    address: z.string().min(1, 'Adresa je povinná'),
    pastParticipation: z.boolean(),
    arrivalDate: z.coerce
      .date()
      .refine(date => date >= today, 'Datum příjezdu nemůže být v minulosti'),
    departureDate: z.coerce
      .date()
      .refine(date => date >= today, 'Datum odjezdu nemůže být v minulosti'),
    foodAllergies: z.string().optional(),
    workAllergies: z.string().optional(),
    toolsSkills: z.string(),
    toolsBringing: z.string(),
    heardAboutUs: z.string().optional(),
    playsInstrument: z.string().optional(),
    tShirtSize: z.string().optional(),
    additionalInfo: z.string().optional(),
    accommodationPrice: z.string().min(1, 'Cena za ubytování je povinná'),
    ownsCar: z.boolean().default(false),
    canBeMedic: z.boolean().default(false),
    photo: z.string().optional(),
    photoFile: z
      .any()
      .refine(file => file instanceof File, 'Neplatný soubor')
      .refine(
        file => file.size <= 10 * 1024 * 1024,
        'Maximální velikost souboru je 10 MB'
      )
      .refine(
        file => file.type.startsWith('image'),
        'Pouze obrázky jsou povolené'
      )
      .nullable()
      .optional(),
    photoFileRemoved: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.departureDate < data.arrivalDate) {
      ctx.addIssue({
        path: ['departureDate'],
        code: 'custom',
        message: 'Datum odjezdu musí být po datu příjezdu',
      })
    }
  })
export type ApplicationCreateDataInput = z.infer<typeof ApplicationCreateSchema>

export const ApplicationUpdateSchema =
  ApplicationCreateSchema._def.schema.partial()

export type ApplicationUpdateDataInput = z.infer<typeof ApplicationUpdateSchema>

import { Serialized } from './serialize'

export function serializeApplication(
  application: ApplicationCreateDataInput
): Serialized {
  return { data: JSON.stringify(application) }
}

export function deserializeApplication(
  serialized: Serialized
): ApplicationCreateDataInput {
  return JSON.parse(serialized.data)
}

export function serializeApplications(
  applications: ApplicationCreateDataInput[]
): Serialized {
  return { data: JSON.stringify(applications) }
}

export function deserializeApplications(
  serialized: Serialized
): ApplicationCreateDataInput[] {
  return JSON.parse(serialized.data)
}
