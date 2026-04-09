import React from 'react'
import Spinner from './Spinner'

type Variant = 'primary' | 'outline' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  children: React.ReactNode
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-[#8DBF2E] hover:bg-[#6FA12A] text-white font-semibold shadow-sm',
  outline:
    'border-2 border-[#8DBF2E] text-[#8DBF2E] hover:bg-[#8DBF2E] hover:text-white font-semibold',
  ghost:
    'text-[#333333] hover:bg-[#F2F2F2] font-medium',
  danger:
    'bg-red-600 hover:bg-red-700 text-white font-semibold shadow-sm',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-8 py-3.5 text-base rounded-xl',
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  className = '',
  ...props
}) => {
  return (
    <button
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2
        transition-all duration-200 cursor-pointer
        disabled:opacity-60 disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      {...props}
    >
      {loading && <Spinner size="sm" color="white" />}
      {children}
    </button>
  )
}

export default Button
