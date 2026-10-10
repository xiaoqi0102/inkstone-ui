import { useId } from 'react'
import { motion } from 'motion/react'
import { cn } from '../../lib/utils'

/** 分段切换（segmented control）：选中项背后有一块会滑动的底。
 *  比"按钮变色"更清楚地表达"这几个是同一维度的互斥选项"。
 *  底块用 layoutId 共享布局，切选项时是滑动而不是闪一下。 */
export function MetricTabs<T extends string>({
    options,
    value,
    onChange,
    className,
}: {
    options: { value: T; label: string; badge?: string | number }[]
    value: T
    onChange: (value: T) => void
    className?: string
}) {
    const layoutId = useId()

    return (
        <div className={cn('inline-flex items-center gap-0.5 rounded-lg bg-secondary/60 p-0.5', className)}>
            {options.map((option) => {
                const isActive = option.value === value
                return (
                    <button
                        key={option.value}
                        type="button"
                        onClick={() => onChange(option.value)}
                        className={cn(
                            'relative cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                            isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                        )}
                    >
                        {isActive && (
                            <motion.span
                                layoutId={layoutId}
                                className="absolute inset-0 rounded-md bg-card shadow-sm"
                                transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                            />
                        )}
                        <span className="relative z-10 flex items-center gap-1">
                            {option.label}
                            {option.badge !== undefined && (
                                <span className="tabular-nums text-[10px] text-muted-foreground">{option.badge}</span>
                            )}
                        </span>
                    </button>
                )
            })}
        </div>
    )
}
