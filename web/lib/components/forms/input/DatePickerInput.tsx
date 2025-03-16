'use client'

import { Controller } from 'react-hook-form'
import { useState } from 'react'
import { Label } from '../Label'

interface DatePickerInputProps {
  id: string
  label: string
  control: any
  errors?: any
  mandatory?: boolean
}

export function DatePickerInput({
  id,
  label,
  control,
  errors,
  mandatory = false,
}: DatePickerInputProps) {
  const [displayValue, setDisplayValue] = useState<string>('')

  const formatToCzech = (date: string) => {
    if (!date) {
      return ''
    }

    const [year, month, day] = date.split('-')
    return `${day}.${month}.${year}`
  }

  const formatToISO = (date: string) => {
    const parts = date.split('.')
    if (parts.length !== 3) {
      return ''
    }
    return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(
      2,
      '0'
    )}`
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
                const isoDate = formatToISO(inputDate)
                if (isoDate) {
                  field.onChange(isoDate) // SO formát pro backend
                }
              }}
              onBlur={() => {
                setDisplayValue(formatToCzech(field.value))
              }}
              className="pl-10 w-100 rounded-lg p0 text-gray-900 border-0 smj-input form-control p-0"
            />
          )}
        />
      </div>

      {errors?.[id] && (
        <p className="text-danger text-sm mt-1">{errors[id]?.message}</p>
      )}
    </div>
  )
}
