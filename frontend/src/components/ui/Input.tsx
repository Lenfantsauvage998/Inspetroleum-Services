import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-[#333333]"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={`
            w-full px-4 py-2.5 rounded-xl border text-sm
            outline-none transition-all duration-200
            ${error
              ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
              : 'border-gray-200 focus:border-[#8DBF2E] focus:ring-2 focus:ring-[#8DBF2E]/20'
            }
            disabled:bg-gray-50 disabled:cursor-not-allowed
            placeholder:text-gray-400
            ${className}
          `}
          {...props}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
        {helperText && !error && <p className="text-xs text-gray-500">{helperText}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input

// Textarea variant
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-[#333333]">
            {label}
          </label>
        )}
        <textarea
          id={inputId}
          ref={ref}
          className={`
            w-full px-4 py-2.5 rounded-xl border text-sm
            outline-none transition-all duration-200 resize-none
            ${error
              ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
              : 'border-gray-200 focus:border-[#8DBF2E] focus:ring-2 focus:ring-[#8DBF2E]/20'
            }
            ${className}
          `}
          {...props}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'
