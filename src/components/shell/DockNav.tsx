import { useRef, useState, type CSSProperties } from 'react'
import { flushSync } from 'react-dom'
import type { LucideIcon } from 'lucide-react'
import { cn } from '../../lib/utils'

export type DockNavItem = {
    id: string
    label: string
    icon: LucideIcon
}

/**
 * DockNav —— 悬浮胶囊导航（这套 UI 的门面）。
 *
 * 形态：手机端固定在底部居中横排，桌面端（md 以上）变成左侧竖排吸顶。
 * 同一份 DOM、同一套类名靠 md: 断点切换方向，不做两套组件。
 *
 * 两个滑块：
 *   - 激活滑块（bg-sidebar-primary）：跟随当前页，随时间过渡。
 *   - 悬浮滑块（bg-sidebar-accent）：跟随鼠标指到的项。
 * ⚠ 关键细节：首次进入时必须先让悬浮滑块**在不可见状态下瞬移到目标位置**，
 *   再淡入。否则它从上一次的位置（或第 0 项）滑过去，鼠标一进导航就看到一条
 *   莫名其妙的横线扫过。做法是 flushSync 同步提交位置 + 读一次
 *   getBoundingClientRect() 强制样式落地，然后才把 opacity 打开。
 *
 * 竖向/横向的位移量靠 CSS 变量算：移动端步长 2.75rem（size-10 + gap-1），
 * 桌面端 3.75rem（md:size-12 + md:gap-3）。改尺寸时这两个数要跟着改。
 */
export function DockNav({
    items,
    value,
    onChange,
    onPrefetch,
    className,
    ariaLabel = '主导航',
}: {
    items: DockNavItem[]
    value: string
    onChange: (id: string) => void
    /** 鼠标移入/聚焦时预热，用于提前加载目标页代码或数据 */
    onPrefetch?: (id: string) => void
    className?: string
    ariaLabel?: string
}) {
    const activeIndex = Math.max(
        0,
        items.findIndex((item) => item.id === value),
    )
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
    const [isNavHovered, setIsNavHovered] = useState(false)
    const hoverIndicatorRef = useRef<HTMLSpanElement>(null)

    return (
        <nav
            aria-label={ariaLabel}
            className={cn(
                'isolate fixed bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-3xl border border-sidebar-border bg-sidebar p-3 text-sidebar-foreground',
                'md:sticky md:top-30 md:bottom-auto md:left-auto md:translate-x-0 md:flex-col md:gap-3',
                className,
            )}
            onMouseLeave={() => setIsNavHovered(false)}
        >
            <span
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-3 z-10 size-10 rounded-2xl bg-sidebar-primary transition-transform duration-300 ease-out md:size-12 [transform:translateX(var(--nav-offset-x))] md:[transform:translateY(var(--nav-offset-y))]"
                style={
                    {
                        '--nav-offset-x': `${activeIndex * 2.75}rem`,
                        '--nav-offset-y': `${activeIndex * 3.75}rem`,
                    } as CSSProperties
                }
            />
            <span
                ref={hoverIndicatorRef}
                aria-hidden="true"
                className={cn(
                    'pointer-events-none absolute left-3 top-3 z-0 size-10 md:size-12 [transform:translateX(var(--nav-offset-x))] md:[transform:translateY(var(--nav-offset-y))]',
                    isNavHovered ? 'transition-transform duration-300 ease-out' : 'transition-none',
                )}
                style={
                    {
                        '--nav-offset-x': `${(hoveredIndex ?? activeIndex) * 2.75}rem`,
                        '--nav-offset-y': `${(hoveredIndex ?? activeIndex) * 3.75}rem`,
                    } as CSSProperties
                }
            >
                <span
                    className="absolute inset-0 rounded-2xl bg-sidebar-accent transition-opacity duration-350 ease-linear"
                    style={{ opacity: isNavHovered ? 1 : 0 }}
                />
            </span>

            {items.map((item, index) => {
                const isActive = value === item.id
                const Icon = item.icon
                return (
                    <button
                        key={item.id}
                        type="button"
                        aria-label={item.label}
                        title={item.label}
                        aria-current={isActive ? 'page' : undefined}
                        onMouseEnter={() => {
                            if (isNavHovered) {
                                setHoveredIndex(index)
                            } else {
                                // 先瞬移再淡入：见组件注释
                                flushSync(() => setHoveredIndex(index))
                                hoverIndicatorRef.current?.getBoundingClientRect()
                                setIsNavHovered(true)
                            }
                            onPrefetch?.(item.id)
                        }}
                        onFocus={() => onPrefetch?.(item.id)}
                        onTouchStart={() => onPrefetch?.(item.id)}
                        onClick={() => {
                            onPrefetch?.(item.id)
                            onChange(item.id)
                        }}
                        className={cn(
                            'relative z-20 flex size-10 items-center justify-center rounded-2xl p-2 transition-[color,scale] duration-150 ease-linear hover:z-30 hover:scale-110 active:scale-95 md:size-12 md:p-3',
                            isActive ? 'text-sidebar-primary-foreground' : 'text-sidebar-foreground/60',
                        )}
                    >
                        <span className="relative z-10">
                            <Icon strokeWidth={2} />
                        </span>
                    </button>
                )
            })}
        </nav>
    )
}
