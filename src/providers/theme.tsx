import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'

export type Theme = 'light' | 'dark' | 'system'
export type ResolvedTheme = Exclude<Theme, 'system'>

interface ThemeContextValue {
    /** 用户选择（可能是 system） */
    theme: Theme
    /** 实际生效（永远 light 或 dark） */
    resolvedTheme: ResolvedTheme
    setTheme: (theme: string) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

/** 主题色 meta 的取值：跟随令牌里的浅/深底色，移动端状态栏才不跳色。 */
const THEME_COLOR: Record<ResolvedTheme, string> = {
    light: '#e5ecf2',
    dark: '#1e1b19',
}

export function ThemeProvider({
    children,
    storageKey = 'theme',
    defaultTheme = 'system',
}: {
    children: ReactNode
    storageKey?: string
    defaultTheme?: Theme
}) {
    // 初始值都做了 typeof window 守卫：这套组件要能在 SSR / 预渲染环境里 import 而不炸。
    const [theme, setThemeState] = useState<Theme>(() => {
        if (typeof window === 'undefined') return defaultTheme
        const stored = window.localStorage.getItem(storageKey)
        return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : defaultTheme
    })

    const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(() =>
        typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light',
    )

    const resolvedTheme: ResolvedTheme = theme === 'system' ? systemTheme : theme

    // 跟随系统：用户在系统设置里切了深浅，页面要实时跟。
    useEffect(() => {
        if (typeof window === 'undefined') return
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        const handleChange = (event: MediaQueryListEvent) => setSystemTheme(event.matches ? 'dark' : 'light')
        mediaQuery.addEventListener('change', handleChange)
        return () => mediaQuery.removeEventListener('change', handleChange)
    }, [])

    // 落到 DOM：class + color-scheme（让原生滚动条/表单控件跟着变色）+ 持久化。
    useEffect(() => {
        const root = document.documentElement
        root.classList.toggle('dark', resolvedTheme === 'dark')
        root.style.colorScheme = resolvedTheme
        document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[resolvedTheme])
        window.localStorage.setItem(storageKey, theme)
    }, [resolvedTheme, theme, storageKey])

    const setTheme = useCallback((value: string) => {
        if (value === 'light' || value === 'dark' || value === 'system') setThemeState(value)
    }, [])

    return <ThemeContext value={{ theme, resolvedTheme, setTheme }}>{children}</ThemeContext>
}

export function useTheme() {
    const context = useContext(ThemeContext)
    if (!context) throw new Error('useTheme 必须在 <ThemeProvider> 内使用')
    return context
}
