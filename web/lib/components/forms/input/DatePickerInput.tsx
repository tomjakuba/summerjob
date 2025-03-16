'use client'

import {
  Controller,
  UseFormClearErrors,
  UseFormSetError,
} from 'react-hook-form'
import { useState } from 'react'
import { Label } from '../Label'

interface DatePickerInputProps {
  id: string
  label: string
  control: any
  errors?: any
  mandatory?: boolean
  minDate?: string // YYYY-MM-DD
  maxDate?: string // YYYY-MM-DD
  setError: UseFormSetError<any>
  clearErrors: UseFormClearErrors<any>
}

export function DatePickerInput({
  id,
  label,
  control,
  errors,
  mandatory = false,
  minDate,
  maxDate,
  setError,
  clearErrors,
}: DatePickerInputProps) {
  const [displayValue, setDisplayValue] = useState<string>('')

  const formatToCzech = (date: string) => {
    if (!date) return ''
    const [year, month, day] = date.split('-')
    return `${day}.${month}.${year}`
  }

  const formatToISO = (date: string) => {
    const parts = date.split('.')
    if (parts.length !== 3) return ''
    return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(
      2,
      '0'
    )}`
  }

  const isValidDate = (dateStr: string) => {
    const regex = /^\d{1,2}\.\d{1,2}\.\d{4}$/ // Ověří správný formát DD.MM.YYYY
    if (!regex.test(dateStr)) return false

    const [day, month, year] = dateStr.split('.').map(Number)
    if (year < 1900 || year > 2100) return false // rozsah let

    const date = new Date(year, month - 1, day)
    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    )
  }

  const isWithinRange = (isoDate: string) => {
    const selectedDate = new Date(isoDate)
    const min = minDate ? new Date(minDate.split('T')[0]) : null
    const max = maxDate ? new Date(maxDate.split('T')[0]) : null

    console.log(selectedDate)
    console.log(min)
    console.log(max)

    if (min && selectedDate < min) {
      return false
    }

    if (max && selectedDate > max) {
      return false
    }

    return true
  }

  return (
    <div className="relative w-full">
      <Label id={id} label={label} mandatory={mandatory} />
      <div className="relative flex items-center">
        <Controller
          control={control}
          name={id}
          render={({ field }) => (
            <input
              id={id}
              type="text"
              value={displayValue}
              placeholder="DD.MM.YYYY"
              onChange={e => {
                const inputDate = e.target.value
                setDisplayValue(inputDate) // český formát do UI

                if (!isValidDate(inputDate)) {
                  setError(id, { message: 'Neplatné datum' })
                  return
                }

                const isoDate = formatToISO(inputDate)
                if (!isWithinRange(isoDate) && minDate && maxDate) {
                  setError(id, {
                    message: `Datum musí být mezi ${formatToCzech(
                      minDate!.split('T')[0]
                    )} a ${formatToCzech(maxDate!.split('T')[0])}`,
                  })
                  return
                }

                // Pokud je datum správné, uložíme jej
                clearErrors(id)
                field.onChange(isoDate)
              }}
              onBlur={() => {
                if (
                  isValidDate(displayValue) &&
                  isWithinRange(formatToISO(displayValue))
                ) {
                  setDisplayValue(formatToCzech(field.value))
                } else {
                  setDisplayValue(displayValue) // Nenechá hodnotu zmizet
                }
              }}
              className="pl-10 w-100 rounded-lg p0 text-gray-900 border-0 smj-input form-control p-0"
            />
          )}
        />
      </div>

      {errors?.[id] && (errors[id]?.message as string) !== 'Invalid date' && (
        <p className="text-danger text-sm mt-1">{errors[id]?.message}</p>
      )}
    </div>
  )
}
