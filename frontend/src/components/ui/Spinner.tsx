import React from 'react'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'white' | 'gray'
}

const sizes = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-3',
  lg: 'w-12 h-12 border-4',
}

const colors = {
  primary: 'border-[#8DBF2E] border-t-transparent',
  white: 'border-white border-t-transparent',
  gray: 'border-gray-400 border-t-transparent',
}

const Spinner: React.FC<SpinnerProps> = ({ size = 'md', color = 'primary' }) => {
  return (
    <div
      className={`rounded-full animate-spin ${sizes[size]} ${colors[color]}`}
      style={{ borderStyle: 'solid' }}
      aria-label="Loading"
    />
  )
}

export default Spinner
