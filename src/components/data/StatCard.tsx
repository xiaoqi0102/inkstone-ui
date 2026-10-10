import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '../../lib/utils'
import { AnimatedNumber } from '../AnimatedNumber'
import { Card } from '../ui/card'

/**
 * StatCard —— 统计卡：图标 + 标题 + 大数字（滚动）+ 可选单位/趋势/脚注。
 *
 * 排版上有意把"数值"和"单位"分开渲染：数值用大号等宽感觉的字重，单位缩到小号
 * 次要色。这样 1234 和 12.3 两种量级的卡片高度、视觉重量是一致的（都靠 formatCount
 * 拆出 value/unit）。数值变化时只有数字在滚，单位不动，页面不会抖。
 */
export function StatCard({
    label,
    value,
    unit,
    icon: Icon,
    trend,
    footer,
    className,
    glow = true,
}: {
    label: string
    value: string | number | undefined
    /** 单独渲染的单位，如 "M$" / "次" */
    unit?: string
    icon?: LucideIcon
    /** 趋势，正数向上绿、负数向下红 */
    trend?: number
    footer?: ReactNode
    className?: string
    glow?: boolean
}) {
    const trendUp = (trend ?? 0) >= 0

    return (
        <Card glow={glow} className={cn('gap-2 py-4', className)}>
            <div className="flex items-center justify-between px-5">
                <span className="text-xs font-medium text-muted-foreground">{label}</span>
                {Icon && <Icon className="size-4 text-muted-foreground" />}
            </div>
            <div className="flex items-baseline gap-1 px-5">
                <span className="text-2xl font-semibold tabular-nums tracking-tight">
                    <AnimatedNumber value={value} />
                </span>
                {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
                {trend !== undefined && (
                    <span
                        className={cn(
                            'ml-auto text-xs font-medium tabular-nums',
                            trendUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive',
                        )}
                    >
                        {trendUp ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}%
                    </span>
                )}
            </div>
            {footer && <div className="px-5 text-xs text-muted-foreground">{footer}</div>}
        </Card>
    )
}
