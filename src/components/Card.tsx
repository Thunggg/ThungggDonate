import React from 'react'
import { cn } from '../lib/ultils'

interface CardProps {
    children: React.ReactNode,
    className?: string
}

const Card = ({ children, className }: CardProps) => {
    return (
        <>
            <div className={cn("px-2 py-4 shadow-lg  rounded-lg", className)}>
                {children}
            </div >
        </>
    )
}

export default Card
