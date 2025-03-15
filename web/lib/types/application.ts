import { z } from 'zod'

export const ApplicationCreateSchema = z.object({
  firstName: z.string().min(1, 'Jméno je povinné'),
  lastName: z.string().min(1, 'Příjmení je povinné'),
  birthDate: z.coerce.date(),
  gender: z.enum(['Muž', 'Žena']),
  phone: z.string().min(1, 'Telefonní číslo je povinné'),
  email: z.string().email('Neplatný email'),
  address: z.string().min(1, 'Adresa je povinná'),
  pastParticipation: z.boolean(),
  arrivalDate: z.coerce.date(),
  departureDate: z.coerce.date(),
  allergies: z.string(),
  toolsSkills: z.string(),
  toolsBringing: z.string(),
  heardAboutUs: z.string().optional(),
  playsInstrument: z.boolean(),
  tShirtSize: z.string().optional(),
  additionalInfo: z.string().optional(),
  photo: z.string(),
  accommodationPrice: z.string().min(1, 'Cena za ubytování je povinná'),
  ownsCar: z.boolean().default(false),
  canBeMedic: z.boolean().default(false),
})

export type ApplicationCreateDataInput = z.infer<typeof ApplicationCreateSchema>

export const ApplicationUpdateSchema = ApplicationCreateSchema.partial()

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
