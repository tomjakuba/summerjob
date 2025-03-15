'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  ApplicationCreateSchema,
  ApplicationCreateDataInput,
} from 'lib/types/application'
import { TextInput } from 'lib/components/forms/input/TextInput'
import { DateSelectionInput } from 'lib/components/forms/input/DateSelectionInput'
import { FilterSelectInput } from 'lib/components/forms/input/FilterSelectInput'
import { CheckboxInput } from 'lib/components/forms/input/CheckboxInput'
import { TextAreaInput } from 'lib/components/forms/input/TextAreaInput'
import { ImageUploader } from 'lib/components/forms/ImageUploader'
import { useAPIApplicationCreate } from 'lib/fetcher/application'
import { Form } from 'lib/components/forms/Form'
import dateSelectionMaker from 'lib/components/forms/dateSelectionMaker'
import { BulletPointSelect } from 'lib/components/forms/input/BulletPointSelect'
import { OtherAttributesInput } from 'lib/components/forms/input/OtherAttributesInput'

// TODO: change checkbox component
// TODO: change datepicker (or create new component?)
export default function ApplicationsPage() {
  const [isApplicationOpen, setIsApplicationOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const router = useRouter()

  const jobStart = new Date('2025-03-01T00:00:00')
  const jobEnd = new Date('2025-05-01T23:59:59')
  const allDates = dateSelectionMaker(jobStart.toJSON(), jobEnd.toJSON())

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    setError,
    clearErrors,
    formState: { errors, dirtyFields },
  } = useForm<ApplicationCreateDataInput>({
    resolver: zodResolver(ApplicationCreateSchema),
  })
  const { trigger, isMutating, error, reset } = useAPIApplicationCreate({
    onSuccess: () => setSubmitted(true),
  })

  useEffect(() => {
    const now = new Date()
    const applicationStart = new Date('2025-03-01T00:00:00')
    const applicationEnd = new Date('2025-05-01T23:59:59')
    setIsApplicationOpen(now >= applicationStart && now <= applicationEnd)
  }, [])

  const onSubmit = async (data: ApplicationCreateDataInput) => {
    console.log(data)

    try {
      await trigger(data)
    } catch (err) {
      console.error('Chyba při odesílání přihlášky:', err)
    }
  }

  const onConfirmationClosed = () => {
    setSubmitted(false)
    router.back()
  }

  if (!isApplicationOpen) {
    return (
      <p className="text-center text-lg font-semibold">
        Čas pro podání přihlášky již vypršel.
      </p>
    )
  }

  if (submitted) {
    return (
      <p className="text-center text-lg font-semibold">
        Přihláška byla úspěšně odeslána!
      </p>
    )
  }

  const registerPhoto = (fileList: FileList) => {
    if (fileList.length > 0) {
      const file = fileList[0]
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setValue('photo', reader.result, {
            shouldDirty: true,
            shouldValidate: true,
          })
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const removePhoto = () => {
    setValue('photo', '', { shouldDirty: true, shouldValidate: true })
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 border rounded-lg shadow-lg">
      <Form
        label="Přihláška na brigádu"
        isInputDisabled={isMutating}
        onConfirmationClosed={onConfirmationClosed}
        resetForm={reset}
        saved={submitted}
        error={error}
        formId="application-form"
        saveBar={false}
      >
        <form
          id="application-form"
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 mx-5 application"
        >
          <div className="d-flex flex-row w-100 justify-content-between">
            <div className="w-45">
              <TextInput
                id="firstName"
                label="Jméno"
                register={() => register('firstName')}
                placeholder="Vaše jméno"
                errors={errors}
                labelClassName="light-placeholder"
                mandatory
              />
            </div>
            <div className="w-45">
              <TextInput
                id="lastName"
                label="Příjmení"
                register={() => register('lastName')}
                placeholder="Vaše příjmení"
                errors={errors}
                labelClassName="light-placeholder"
                mandatory
              />
            </div>
          </div>
          <div className="d-flex flex-row w-100 justify-content-between">
            <div className="w-45">
              <DateSelectionInput
                id="birthDate"
                label="Datum narození"
                register={() => register('birthDate')}
                days={allDates}
              />
            </div>
            <div className="w-45">
              <FilterSelectInput
                id="gender"
                label="Pohlaví"
                placeholder="Vyberte pohlaví"
                labelClassName="light-placeholder"
                items={[
                  { id: 'Muž', name: 'Muž', searchable: 'Muž' },
                  { id: 'Žena', name: 'Žena', searchable: 'Žena' },
                ]}
                onSelected={id => setValue('gender', id as 'Muž' | 'Žena')}
                errors={errors}
                mandatory
              />
            </div>
          </div>
          <div className="d-flex flex-row w-100 justify-content-between">
            <div className="w-45">
              <TextInput
                id="phone"
                label="Telefon"
                register={() => register('phone')}
                placeholder="Váš telefon"
                labelClassName="light-placeholder"
                errors={errors}
                mandatory
              />
            </div>
            <div className="w-45">
              <TextInput
                id="email"
                label="Email"
                register={() => register('email')}
                labelClassName="light-placeholder"
                placeholder="Váš email"
                errors={errors}
                mandatory
              />
            </div>
          </div>
          <div className="d-flex flex-row w-100 justify-content-between">
            <div className="w-45">
              <TextInput
                id="address"
                label="Adresa"
                register={() => register('address')}
                labelClassName="light-placeholder"
                placeholder="Vaše adresa"
                errors={errors}
                mandatory
              />
            </div>
            <div className="w-45">
              <FilterSelectInput
                id="pastParticipation"
                label="Už jsem se v minulosti zúčastnil/a?"
                placeholder="Vyberte odpověď"
                labelClassName="light-placeholder"
                items={[
                  { id: 'true', name: 'Ano', searchable: 'Ano' },
                  { id: 'false', name: 'Ne', searchable: 'Ne' },
                ]}
                onSelected={id =>
                  setValue('pastParticipation', id === 'true' ? true : false)
                }
                errors={errors}
                mandatory
              />
            </div>
          </div>
          <div className="d-flex flex-row w-100 justify-content-between">
            <div className="w-45">
              <DateSelectionInput
                id="arrivalDate"
                label="Datum příjezdu"
                register={() => register('arrivalDate')}
                days={allDates}
              />
            </div>
            <div className="w-45">
              <DateSelectionInput
                id="departureDate"
                label="Datum odjezdu"
                register={() => register('departureDate')}
                days={allDates}
              />
            </div>
          </div>
          <TextInput
            id="toolsSkills"
            label="Nářadí, se kterým umím zacházet"
            register={() => register('toolsSkills')}
            placeholder="Nářadí - motorovka, křovinořez, cirkulárka..."
            labelClassName="light-placeholder"
            errors={errors}
            mandatory
          />
          <TextInput
            id="toolsBringing"
            label="Nářadí, které přivezu"
            register={() => register('toolsBringing')}
            placeholder="Nářadí - motorovka, křovinořez, kladivo..."
            labelClassName="light-placeholder"
            errors={errors}
            mandatory
          />
          <div className="d-flex flex-row w-100 justify-content-between">
            <div className="w-45">
              <TextInput
                id="allergies"
                label="Alergie"
                register={() => register('allergies')}
                placeholder="Vaše alergie na jídlo, pyl, zvířata..."
                labelClassName="light-placeholder"
                errors={errors}
                mandatory
              />
            </div>
            <div className="w-45">
              <TextInput
                id="heardAboutUs"
                label="Jak jste se o nás dozvěděl/a?"
                register={() => register('heardAboutUs')}
                placeholder="Řekl mi o vás kamarád..."
                labelClassName="light-placeholder"
                errors={errors}
              />
            </div>
          </div>
          <div className="d-flex flex-row w-100 justify-content-between">
            <div className="w-45">
              <TextInput
                id="tShirtSize"
                label="Velikost trička"
                register={() => register('tShirtSize')}
                labelClassName="light-placeholder"
                placeholder="S, M, L, XL, XXL"
                errors={errors}
              />
            </div>
            <div className="w-45">
              <TextInput
                id="playsInstrument"
                label="Umím hrát na hudební nástroj"
                register={() => register('playsInstrument')}
                labelClassName="light-placeholder"
                placeholder="Kytara, housle, klavír..."
                errors={errors}
              />
            </div>
          </div>
          <TextAreaInput
            id="additionalInfo"
            label="Dodatečné informace (speciální požadavky)"
            register={() => register('additionalInfo')}
            labelClassName="light-placeholder"
            placeholder="Vaše poznámka"
            errors={errors}
          />
          <div className="d-flex flex-row w-100 justify-content-between">
            <div className="w-45">
              <ImageUploader
                id="photo"
                label="Fotografie"
                secondaryLabel="Maximálně 1 soubor o maximální velikosti 10 MB."
                errors={errors}
                registerPhoto={registerPhoto}
                removeNewPhoto={removePhoto}
              />
            </div>
            <div className="w-45">
              <BulletPointSelect
                id="accommodationPrice"
                label="Cena za ubytování"
                labelClassName="light-placeholder"
                options={[
                  { value: 1600, label: '1600 Kč' },
                  { value: 2000, label: '2000 Kč' },
                ]}
                setError={setError}
                clearErrors={clearErrors}
                register={() => register('accommodationPrice')}
                setValue={setValue}
                getValues={getValues}
                errors={errors}
                mandatory
                minCustomValue={1600}
              />
            </div>
          </div>
          <OtherAttributesInput
            register={register}
            objects={[
              {
                id: 'ownsCar',
                icon: 'fa fa-car',
                label: 'Vlastním auto, které mohu použít',
              },
              {
                id: 'canBeMedic',
                icon: 'fa fa-briefcase-medical',
                label: 'Mohu se zúčastnit jako zdravotník',
              },
            ]}
          />
          <button
            type="submit"
            className="w-full btn btn-primary d-block m-auto
            my-5"
            disabled={isMutating}
          >
            {isMutating ? 'Odesílání...' : 'Odeslat přihlášku'}
          </button>
        </form>
      </Form>
    </div>
  )
}
