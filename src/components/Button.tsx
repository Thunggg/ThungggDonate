import React from 'react'
import { cn } from '../lib/ultils'

interface ButtonProps {
    children: React.ReactNode,
    className?: string,
    onClick: () => void
}

const Button = ({ children, className, onClick }: ButtonProps) => {
    return (
        <>
            <div className={cn("bg-slate-900 text-white py-2 px-3 rounded-lg hover:bg-slate-800 cursor-pointer", className)} onClick={onClick}>
                {children}
            </div>
        </>
    )
}

export default Button
