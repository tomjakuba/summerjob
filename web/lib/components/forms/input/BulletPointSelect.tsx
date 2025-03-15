import { useState } from 'react'
import {
  FieldErrors,
  UseFormSetValue,
  UseFormGetValues,
  UseFormSetError,
  UseFormClearErrors,
  UseFormRegisterReturn,
} from 'react-hook-form'
import { Label } from '../Label'

interface Option {
  value: number
  label: string
}

interface BulletPointSelectProps {
  id: string
  label: string
  options: Option[]
  register: () => UseFormRegisterReturn
  setValue: UseFormSetValue<any>
  getValues: UseFormGetValues<any>
  errors: FieldErrors<any>
  mandatory?: boolean
  minCustomValue: number
  labelClassName?: string
  margin?: boolean
  setError: UseFormSetError<any>
  clearErrors: UseFormClearErrors<any>
}

export const BulletPointSelect = ({
  id,
  label,
  options,
  register,
  setValue,
  setError,
  clearErrors,
  errors,
  labelClassName = '',
  margin,
  mandatory = false,
  minCustomValue,
}: BulletPointSelectProps) => {
  const [customValue, setCustomValue] = useState<string>('')
  const [textInput, setTextInput] = useState<boolean>(false)

  return (
    <div className="d-flex flex-column gap-2">
      <Label
        id={id}
        label={label}
        className={labelClassName}
        margin={margin}
        mandatory={mandatory}
      />

      {/* Standardní možnosti */}
      {options.map(option => (
        <label key={option.value} className="d-flex align-items-center gap-2">
          <input
            type="radio"
            {...register()}
            value={option.value.toString()}
            onChange={e => {
              setValue(id, e.target.value)
              setTextInput(false)
            }}
          />
          {option.label}
        </label>
      ))}

      {/* custom input */}
      <label className="d-flex align-items-center gap-2">
        <input
          type="radio"
          {...register()}
          value="custom"
          checked={textInput}
          onChange={() => {
            setTextInput(true)
          }}
        />
        <input
          type="number"
          className="form-control smj-input p-0 fs-5 custom-input"
          placeholder="Vlastní částka (větší než 1 600 Kč)"
          onFocus={() => {
            setTextInput(true)
          }}
          value={customValue}
          onChange={e => {
            const value = e.target.value
            setTextInput(true)
            console.log('Input value:', value)

            setCustomValue(value)
            if (value && parseInt(value) < minCustomValue) {
              setError(id, {
                type: 'manual',
                message: `Částka musí být minimálně ${minCustomValue} Kč`,
              })
            } else {
              clearErrors(id)
              setValue(id, value)
            }
          }}
        />
      </label>

      {errors[id] && (
        <p className="text-danger">{errors[id]?.message as string}</p>
      )}
    </div>
  )
}
