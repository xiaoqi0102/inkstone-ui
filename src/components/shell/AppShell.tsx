import { type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'

/**
 * AppShell —— 应用外壳：导航 + 顶栏（Logo / 会滚动的页面名 / 右侧动作区）+ 内容区。
 *
 * 布局用 grid 而不是 flex：桌面端要让导航占满整列高度、顶栏和内容分两行，
 * `md:grid-cols-[auto_1fr] md:grid-rows-[auto_minmax(0,1fr)]` 一行说清，
 * minmax(0,1fr) 是为了让内容区能真正滚动（不加的话子元素会把行高撑破）。
 *
 * 页面名切换动画：按导航顺序算方向 direction，新标题从下方进、旧标题向上出，
 * 于是"往下翻页"和"往上翻页"的动态方向相反，和导航顺序对得上。
 */
export function AppShell({
    children,
    nav,
    logo,
    title,
    previousTitle,
    actions,
}: {
    children: ReactNode
    /** 导航节点，通常传 <DockNav /> */
    nav: ReactNode
    logo?: ReactNode
    /** 当前页面名（会做切换动画） */
    title: string
    /** 上一个页面名，用于判断滚动方向；不给则一律向下 */
    previousTitle?: string
    actions?: ReactNode
}) {
    const direction = previousTitle === title ? 0 : 1

    return (
        <div className="mx-auto flex h-dvh max-w-6xl flex-col overflow-hidden px-3 animate-in fade-in duration-300 md:grid md:grid-cols-[auto_1fr] md:grid-rows-[auto_minmax(0,1fr)] md:gap-x-6 md:px-6">
            <div className="relative z-50 md:row-span-2 md:min-h-screen">{nav}</div>

            <header className="my-3 flex flex-none items-center gap-x-2 px-2 md:my-6">
                {logo}
                <div className="min-w-0 flex-1 overflow-hidden">
                    <AnimatePresence mode="wait" custom={direction}>
                        <motion.div
                            key={title}
                            custom={direction}
                            variants={{
                                initial: (value: number) => ({ y: 32 * value, opacity: 0 }),
                                animate: { y: 0, opacity: 1 },
                                exit: (value: number) => ({ y: -32 * value, opacity: 0 }),
                            }}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            transition={{ duration: 0.3 }}
                            className="flex items-center"
                        >
                            <span className="mt-1 truncate text-3xl font-bold">{title}</span>
                        </motion.div>
                    </AnimatePresence>
                </div>
                {/* 动作区固定在右侧：flex-none + 不换行，标题再长也只截断自己 */}
                {actions && <div className="ml-auto flex shrink-0 items-center gap-1">{actions}</div>}
            </header>

            <main className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden">
                {children}
            </main>
        </div>
    )
}
