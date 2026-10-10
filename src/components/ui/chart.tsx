import * as React from 'react'
import * as RechartsPrimitive from 'recharts'
import type { TooltipValueType } from 'recharts'
import { cn } from '../../lib/utils'

/**
 * 图表封装（基于 recharts）。形态沿用 shadcn/ui 官方 chart 组件（MIT），
 * 样式改走本库令牌，因此主题切换不用改任何图表配置。
 *
 * 核心机制：把 `config` 里每个数据系列的色值，按主题注入成 CSS 变量
 * `--color-<key>`。图上各处（折线、区域、图例点）都用 `var(--color-xxx)`，
 * 于是亮/暗两套色只要在 config 里给 `theme: { light, dark }` 就行，
 * 不需要在 JS 里读当前主题。
 *
 * 用法：
 *   const config = {
 *     tokens: { label: '消耗', theme: { light: 'oklch(...)', dark: 'oklch(...)' } },
 *   } satisfies ChartConfig
 *   <ChartContainer config={config} className="h-56 w-full">
 *     <AreaChart data={data}>
 *       <CartesianGrid vertical={false} />
 *       <XAxis dataKey="day" tickLine={false} axisLine={false} />
 *       <ChartTooltip content={<ChartTooltipContent />} />
 *       <Area dataKey="tokens" fill="var(--color-tokens)" stroke="var(--color-tokens)" />
 *     </AreaChart>
 *   </ChartContainer>
 */

const THEMES = { light: '', dark: '.dark' } as const

const INITIAL_DIMENSION = { width: 320, height: 200 } as const
type TooltipNameType = number | string

export type ChartConfig = Record<
    string,
    {
        label?: React.ReactNode
        icon?: React.ComponentType
    } & ({ color?: string; theme?: never } | { color?: never; theme: Record<keyof typeof THEMES, string> })
>

type ChartContextProps = { config: ChartConfig }

const ChartContext = React.createContext<ChartContextProps | null>(null)

export function useChart() {
    const context = React.useContext(ChartContext)
    if (!context) throw new Error('useChart 必须在 <ChartContainer /> 内使用')
    return context
}

export function ChartContainer({
    id,
    className,
    children,
    config,
    initialDimension = INITIAL_DIMENSION,
    ...props
}: React.ComponentProps<'div'> & {
    config: ChartConfig
    children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>['children']
    /** 容器测量出真实尺寸前的兜底尺寸，避免首帧图表高度塌成 0 */
    initialDimension?: { width: number; height: number }
}) {
    const uniqueId = React.useId()
    const chartId = `chart-${id ?? uniqueId.replace(/:/g, '')}`

    return (
        <ChartContext.Provider value={{ config }}>
            <div
                data-slot="chart"
                data-chart={chartId}
                className={cn(
                    'flex aspect-video justify-center text-xs',
                    // recharts 内部元素（刻度字/网格线/光标/圆点）的取色统一移到 base.css，
                    // 那里用正确类名 + var(--令牌) 落死。这里只留确实生效的两条。
                    // 坑：recharts 3 的类名是连字符式（.recharts-cartesian-axis-tick-value），
                    // 网上大量教程与旧版 shadcn 用的是下划线式（..._text）—— 在本版本**命中不了**，
                    // 静默失效后刻度字会退回框架自带的 #666，深色主题下几乎看不清。
                    '[&_.recharts-layer]:outline-hidden [&_.recharts-surface]:outline-hidden',
                    className,
                )}
                {...props}
            >
                <ChartStyle id={chartId} config={config} />
                <RechartsPrimitive.ResponsiveContainer initialDimension={initialDimension}>
                    {children}
                </RechartsPrimitive.ResponsiveContainer>
            </div>
        </ChartContext.Provider>
    )
}

/** 把 config 的色值渲染成 `<style>`：按 `{light: '', dark: '.dark'}` 前缀各出一套变量 */
export const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
    const colorConfig = Object.entries(config).filter(([, item]) => item.theme ?? item.color)
    if (!colorConfig.length) return null

    return (
        <style
            dangerouslySetInnerHTML={{
                __html: Object.entries(THEMES)
                    .map(
                        ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
    .map(([key, itemConfig]) => {
        const color = itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ?? itemConfig.color
        return color ? `  --color-${key}: ${color};` : null
    })
    .filter(Boolean)
    .join('\n')}
}
`,
                    )
                    .join('\n'),
            }}
        />
    )
}

export const ChartTooltip = RechartsPrimitive.Tooltip

export function ChartTooltipContent({
    active,
    payload,
    className,
    indicator = 'dot',
    hideLabel = false,
    hideIndicator = false,
    label,
    labelFormatter,
    labelClassName,
    formatter,
    color,
    nameKey,
    labelKey,
}: React.ComponentProps<typeof RechartsPrimitive.Tooltip> &
    React.ComponentProps<'div'> & {
        hideLabel?: boolean
        hideIndicator?: boolean
        indicator?: 'line' | 'dot' | 'dashed'
        nameKey?: string
        labelKey?: string
    } & Omit<
        RechartsPrimitive.DefaultTooltipContentProps<TooltipValueType, TooltipNameType>,
        'accessibilityLayer'
    >) {
    const { config } = useChart()

    const tooltipLabel = React.useMemo(() => {
        if (hideLabel || !payload?.length) return null

        const [item] = payload
        const key = `${labelKey ?? item?.dataKey ?? item?.name ?? 'value'}`
        const itemConfig = getPayloadConfigFromPayload(config, item, key)
        const value =
            !labelKey && typeof label === 'string' ? (config[label]?.label ?? label) : itemConfig?.label

        if (labelFormatter) {
            return <div className={cn('font-medium', labelClassName)}>{labelFormatter(value, payload)}</div>
        }
        if (!value) return null
        return <div className={cn('font-medium', labelClassName)}>{value}</div>
    }, [label, labelFormatter, payload, hideLabel, labelClassName, config, labelKey])

    if (!active || !payload?.length) return null

    const nestLabel = payload.length === 1 && indicator !== 'dot'

    return (
        <div
            className={cn(
                'grid min-w-32 items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl',
                className,
            )}
        >
            {!nestLabel ? tooltipLabel : null}
            <div className="grid gap-1.5">
                {payload
                    .filter((item) => item.type !== 'none')
                    .map((item, index) => {
                        const key = `${nameKey ?? item.name ?? item.dataKey ?? 'value'}`
                        const itemConfig = getPayloadConfigFromPayload(config, item, key)
                        const indicatorColor = color ?? item.payload?.fill ?? item.color

                        return (
                            <div
                                key={index}
                                className={cn(
                                    'flex w-full flex-wrap items-stretch gap-2 [&>svg]:size-2.5 [&>svg]:text-muted-foreground',
                                    indicator === 'dot' && 'items-center',
                                )}
                            >
                                {formatter && item?.value !== undefined && item.name ? (
                                    formatter(item.value, item.name, item, index, item.payload)
                                ) : (
                                    <>
                                        {itemConfig?.icon ? (
                                            <itemConfig.icon />
                                        ) : (
                                            !hideIndicator && (
                                                <div
                                                    className={cn('shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)', {
                                                        'size-2.5': indicator === 'dot',
                                                        'w-1': indicator === 'line',
                                                        'w-0 border-[1.5px] border-dashed bg-transparent': indicator === 'dashed',
                                                        'my-0.5': nestLabel && indicator === 'dashed',
                                                    })}
                                                    style={
                                                        {
                                                            '--color-bg': indicatorColor,
                                                            '--color-border': indicatorColor,
                                                        } as React.CSSProperties
                                                    }
                                                />
                                            )
                                        )}
                                        <div
                                            className={cn(
                                                'flex flex-1 justify-between leading-none',
                                                nestLabel ? 'items-end' : 'items-center',
                                            )}
                                        >
                                            <div className="grid gap-1.5">
                                                {nestLabel ? tooltipLabel : null}
                                                <span className="text-muted-foreground">
                                                    {itemConfig?.label ?? item.name}
                                                </span>
                                            </div>
                                            {item.value != null && (
                                                <span className="font-mono font-medium tabular-nums text-foreground">
                                                    {typeof item.value === 'number'
                                                        ? item.value.toLocaleString()
                                                        : String(item.value)}
                                                </span>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        )
                    })}
            </div>
        </div>
    )
}

export const ChartLegend = RechartsPrimitive.Legend

export function ChartLegendContent({
    className,
    hideIcon = false,
    payload,
    verticalAlign = 'bottom',
    nameKey,
}: React.ComponentProps<'div'> & {
    hideIcon?: boolean
    nameKey?: string
} & RechartsPrimitive.DefaultLegendContentProps) {
    const { config } = useChart()
    if (!payload?.length) return null

    return (
        <div
            className={cn(
                'flex items-center justify-center gap-4',
                verticalAlign === 'top' ? 'pb-3' : 'pt-3',
                className,
            )}
        >
            {payload
                .filter((item) => item.type !== 'none')
                .map((item, index) => {
                    const key = `${nameKey ?? item.dataKey ?? 'value'}`
                    const itemConfig = getPayloadConfigFromPayload(config, item, key)

                    return (
                        <div key={index} className="flex items-center gap-1.5 [&>svg]:size-3 [&>svg]:text-muted-foreground">
                            {itemConfig?.icon && !hideIcon ? (
                                <itemConfig.icon />
                            ) : (
                                <div className="size-2 shrink-0 rounded-[2px]" style={{ backgroundColor: item.color }} />
                            )}
                            {itemConfig?.label}
                        </div>
                    )
                })}
        </div>
    )
}

/** 从 tooltip/legend 的 payload 里反查 config：payload 可能把 key 包一层，故沿着 payload.payload 再探一次 */
function getPayloadConfigFromPayload(config: ChartConfig, payload: unknown, key: string) {
    if (typeof payload !== 'object' || payload === null) return undefined

    const payloadPayload =
        'payload' in payload && typeof payload.payload === 'object' && payload.payload !== null
            ? payload.payload
            : undefined

    let configLabelKey: string = key

    if (key in payload && typeof payload[key as keyof typeof payload] === 'string') {
        configLabelKey = payload[key as keyof typeof payload] as string
    } else if (
        payloadPayload &&
        key in payloadPayload &&
        typeof payloadPayload[key as keyof typeof payloadPayload] === 'string'
    ) {
        configLabelKey = payloadPayload[key as keyof typeof payloadPayload] as string
    }

    return configLabelKey in config ? config[configLabelKey] : config[key]
}
