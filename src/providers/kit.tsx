import type { ComponentProps, ReactNode } from 'react'
import { ThemeProvider, type Theme } from './theme'
import { TooltipProvider } from '../components/ui/tooltip'
import { Toaster } from '../components/ui/sonner'

/**
 * UIKitProvider —— 一次把本库运行所需的基础环境包好。
 *
 * 为什么需要它：外壳（AppShell/DockNav）和 IconButton 内部都用 Tooltip，
 * 而 Radix 的 Tooltip 必须在 TooltipProvider 里才能渲染 —— 少了这层，
 * 表现是整个应用白屏 + 控制台一句 `Tooltip must be used within TooltipProvider`。
 * 这种"你得先记得包一层"的坑不该丢给使用者，所以在这里一次性收口。
 *
 * 用法（唯一需要包的一层）：
 *   <UIKitProvider>
 *       <App />
 *   </UIKitProvider>
 *
 * 需要定制时各自都有出口：主题相关传 themeProps，吐司传 toasterProps，
 * 想自己控制 Provider 层次就别用本组件，直接组合 ThemeProvider / TooltipProvider。
 */
export function UIKitProvider({
    children,
    themeProps,
    toasterProps,
    tooltipDelay = 300,
}: {
    children: ReactNode
    /** 透传给 ThemeProvider：{ defaultTheme, storageKey } */
    themeProps?: { defaultTheme?: Theme; storageKey?: string }
    /** 透传给 Toaster（sonner 的原生 props） */
    toasterProps?: ComponentProps<typeof Toaster>
    /** 提示气泡出现延迟（毫秒） */
    tooltipDelay?: number
}) {
    return (
        <ThemeProvider defaultTheme={themeProps?.defaultTheme} storageKey={themeProps?.storageKey}>
            <TooltipProvider delayDuration={tooltipDelay}>
                {children}
                <Toaster {...toasterProps} />
            </TooltipProvider>
        </ThemeProvider>
    )
}
