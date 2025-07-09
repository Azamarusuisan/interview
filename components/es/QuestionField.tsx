'use client'

import { ChangeEvent } from 'react'

interface QuestionFieldProps {
  id: string
  label: string
  value: string
  onChange: (id: string, value: string) => void
  maxLength: number
  disabled?: boolean
}

export default function QuestionField({
  id,
  label,
  value,
  onChange,
  maxLength,
  disabled = false,
}: QuestionFieldProps) {
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(id, e.target.value)
  }

  const charCount = value.length
  const remainingChars = maxLength - charCount

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative">
        <textarea
          id={id}
          value={value}
          onChange={handleChange}
          maxLength={maxLength}
          disabled={disabled}
          rows={6}
          className={`w-full px-4 py-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 ${
            disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'
          } ${
            remainingChars < 50 ? 'border-orange-400' : 'border-gray-300'
          }`}
          placeholder={`${label}を入力してください`}
        />
        <div className={`absolute bottom-2 right-2 text-xs ${
          remainingChars < 50 ? 'text-orange-600' : 'text-gray-500'
        }`}>
          {charCount} / {maxLength} 文字 (残り {remainingChars} 文字)
        </div>
      </div>
    </div>
  )
}