"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import Button from "./Button"

export function ThemeToggle() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    // Avoid hydration mismatch
    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <Button variant="secondary" size="sm" className="w-10 h-10 p-0 rounded-full opacity-0">
                <div className="h-4 w-4" />
            </Button>
        )
    }

    const isDark = theme === "dark"

    return (
        <Button
            variant="secondary"
            size="sm"
            className="w-10 h-10 p-0 rounded-full bg-brand-secondary/80 backdrop-blur-sm border-brand-secondary-hover/20 hover:scale-110 active:scale-95 transition-all duration-300 shadow-sm"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            aria-label="Toggle theme"
        >
            <div className="relative h-[1.2rem] w-[1.2rem] flex items-center justify-center">
                <Sun className={`h-full w-full transition-all duration-500 absolute ${isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}`} />
                <Moon className={`h-full w-full transition-all duration-500 absolute ${isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0 text-slate-400'}`} />
            </div>
        </Button>
    )
}
