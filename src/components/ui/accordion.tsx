import type { ComponentProps } from 'react'
import { Accordion as AccordionPrimitive } from 'radix-ui'
import { ChevronDown } from 'lucide-react'
import { cn } from '../../lib/utils'

/**
 * Accordion —— 折叠面板（表单分区、设置项分组、长文档目录）。
 *
 * `type="single"` + `collapsible` 适合设置页（同时只展开一段，视线不散）；
 * `type="multiple"` 适合对照查看（如两边参数要同时展开比对）。
 *
 * ⚠ 表单里用 Accordion 时，收起的面板内容仍在 DOM 中（Radix 只做视觉收起），
 * 所以表单提交不会丢字段 —— 这点比手写 display:none 切换更省事，但因此
 * 也不要用它做「大数据量列表的懒加载」。
 */
export function Accordion(props: ComponentProps<typeof AccordionPrimitive.Root>) {
    return <AccordionPrimitive.Root data-slot="accordion" {...props} />
}

export function AccordionItem({
    className,
    ...props
}: ComponentProps<typeof AccordionPrimitive.Item>) {
    return (
        <AccordionPrimitive.Item
            data-slot="accordion-item"
            className={cn('border-b border-border last:border-b-0', className)}
            {...props}
        />
    )
}

export function AccordionTrigger({
    className,
    children,
    ...props
}: ComponentProps<typeof AccordionPrimitive.Trigger>) {
    return (
        <AccordionPrimitive.Header className="flex">
            <AccordionPrimitive.Trigger
                data-slot="accordion-trigger"
                className={cn(
                    'flex flex-1 cursor-pointer items-start justify-between gap-3 rounded-md py-3 text-left text-sm font-medium transition-colors',
                    'hover:text-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
                    'disabled:pointer-events-none disabled:opacity-50',
                    '[&[data-state=open]>svg]:rotate-180',
                    className,
                )}
                {...props}
            >
                {children}
                <ChevronDown className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform duration-200" />
            </AccordionPrimitive.Trigger>
        </AccordionPrimitive.Header>
    )
}

export function AccordionContent({
    className,
    children,
    ...props
}: ComponentProps<typeof AccordionPrimitive.Content>) {
    return (
        <AccordionPrimitive.Content
            data-slot="accordion-content"
            className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
            {...props}
        >
            <div className={cn('pt-0 pb-3', className)}>{children}</div>
        </AccordionPrimitive.Content>
    )
}
