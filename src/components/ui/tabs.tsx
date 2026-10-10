import type { ComponentProps } from 'react'
import { Tabs as TabsPrimitive } from 'radix-ui'
import { cn } from '../../lib/utils'

/**
 * Tabs —— 标签页。
 *
 * 为什么这个库还要自己写一遍（而不用 shadcn CLI 生成）：CLI 生成的是
 * `@radix-ui/react-tabs` 单包版本，本库统一用 `radix-ui` 聚合包（一个依赖
 * 覆盖 20 多个基元）。混装两套 radix 是这类项目最常见的坑，别重蹈。
 *
 * 用法：`<Tabs defaultValue="a"><TabsList><TabsTrigger value="a">…</TabsTrigger></TabsList><TabsContent value="a">…</TabsContent></Tabs>`
 * ⚠ 每个 TabsTrigger 必须给 value，且与 TabsContent 一一对应 —— 缺一个该面板就永远点不开。
 */
export function Tabs({ className, ...props }: ComponentProps<typeof TabsPrimitive.Root>) {
    return (
        <TabsPrimitive.Root
            data-slot="tabs"
            className={cn('flex flex-col gap-3', className)}
            {...props}
        />
    )
}

/** 标签条。`variant="line"` 适用于嵌在卡片头部里的场景（无底色、只留指示线） */
export function TabsList({
    className,
    variant = 'default',
    ...props
}: ComponentProps<typeof TabsPrimitive.List> & { variant?: 'default' | 'line' }) {
    return (
        <TabsPrimitive.List
            data-slot="tabs-list"
            data-variant={variant}
            className={cn(
                'group inline-flex w-fit items-center justify-center',
                variant === 'default' && 'h-9 gap-1 rounded-lg bg-muted p-1 text-muted-foreground',
                variant === 'line' && 'gap-4 border-b border-border bg-transparent p-0',
                className,
            )}
            {...props}
        />
    )
}

export function TabsTrigger({
    className,
    ...props
}: ComponentProps<typeof TabsPrimitive.Trigger>) {
    return (
        <TabsPrimitive.Trigger
            data-slot="tabs-trigger"
            className={cn(
                'inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap text-sm font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
                'disabled:pointer-events-none disabled:opacity-50',
                '[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=size-])]:size-4',
                // default 变体：选中项用卡片底色「浮起来」，配阴影比纯色块更贴合本库的柔光气质
                'group-data-[variant=default]:h-7 group-data-[variant=default]:flex-1 group-data-[variant=default]:rounded-md group-data-[variant=default]:px-2.5',
                'group-data-[variant=default]:data-[state=active]:bg-raised group-data-[variant=default]:data-[state=active]:text-raised-foreground group-data-[variant=default]:data-[state=active]:font-semibold group-data-[variant=default]:data-[state=active]:shadow-sm',
                // line 变体：下方 2px 指示线
                'group-data-[variant=line]:rounded-none group-data-[variant=line]:border-b-2 group-data-[variant=line]:border-transparent group-data-[variant=line]:px-0.5 group-data-[variant=line]:pb-2',
                'group-data-[variant=line]:data-[state=active]:border-primary group-data-[variant=line]:data-[state=active]:text-foreground',
                'text-muted-foreground hover:text-foreground',
                className,
            )}
            {...props}
        />
    )
}

export function TabsContent({
    className,
    ...props
}: ComponentProps<typeof TabsPrimitive.Content>) {
    return (
        <TabsPrimitive.Content
            data-slot="tabs-content"
            className={cn(
                'flex-1 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
                className,
            )}
            {...props}
        />
    )
}
