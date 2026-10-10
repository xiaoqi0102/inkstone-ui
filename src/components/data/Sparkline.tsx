import { useId } from 'react'
import { Area, AreaChart, ResponsiveContainer } from 'recharts'
import { cn } from '../../lib/utils'

/**
 * Sparkline —— 迷你趋势图（嵌在统计卡里用）。
 *
 * 刻意不带坐标轴、不带 tooltip、不带网格：卡片角落里 40px 高的位置放不下这些，
 * 塞进去只会变成噪音。它要传达的只是"形状"。
 * 用 `--primary` 变量取色，自动跟随主题；渐变填充靠 <defs> 里的 linearGradient。
 */
export function Sparkline({
    data,
    dataKey,
    height = 40,
    className,
    strokeWidth = 1.5,
    color = 'var(--primary)',
}: {
    data: Record<string, unknown>[]
    dataKey: string
    height?: number
    className?: string
    strokeWidth?: number
    color?: string
}) {
    const gradientId = `spark-${useId().replace(/:/g, '')}`

    return (
        <div className={cn('w-full', className)} style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
                    <defs>
                        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                            <stop offset="100%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <Area
                        type="monotone"
                        dataKey={dataKey}
                        stroke={color}
                        strokeWidth={strokeWidth}
                        fill={`url(#${gradientId})`}
                        dot={false}
                        isAnimationActive
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}
