import type { ComponentProps } from 'react'
import { Slot } from 'radix-ui'
import { cn } from '../lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'

/**
 * 图标按钮：无背景，hover 变亮；给了 tip 就自动套 Tooltip。
 *
 * 为什么不直接用 <Button variant="ghost">：ghost 自带背景色与内边距，要用它做
 * 纯图标反而得写三个类把它抵消掉；而且 Button 基础样式里有 transition-all，
 * 会和 asChild 承载的 motion 子元素抢 transform。图标按钮就该是另一条路。
 *
 * 删除类按钮：传 className="hover:text-destructive" 覆盖默认的 hover 变亮。
 * 尺寸由调用方给（如 size-8 / size-4），组件不预设，避免上下文不同还得覆盖。
 */
export function IconButton({
    tip,
    asChild,
    className,
    ...props
}: ComponentProps<'button'> & {
    /** 为空则不套 Tooltip */
    tip?: string
    /** 由子元素出标签，用于承载 motion 元素或自带 button 的组件 */
    asChild?: boolean
}) {
    const Comp = asChild ? Slot.Root : 'button'
    const button = (
        <Comp
            type={asChild ? undefined : 'button'}
            className={cn(
                'inline-flex items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
                className,
            )}
            {...props}
        />
    )

    if (!tip) return button
    return (
        <Tooltip>
            <TooltipTrigger asChild>{button}</TooltipTrigger>
            <TooltipContent>{tip}</TooltipContent>
        </Tooltip>
    )
}
