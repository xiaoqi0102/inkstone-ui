import type { ComponentProps } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'
import { cn } from '../../lib/utils'

/** 按钮：所有变体都共享 focus-visible 环 + 禁用态 + 150ms 过渡。
 *  - default：实心主色，主操作
 *  - gradient：主色→强调色渐变，用于页面唯一的关键动作（一屏最多一个）
 *  - outline / secondary / ghost：层级递减
 *  - destructive：危险操作（删除等），hover 才上红色，平时不抢眼
 *  - link：文字按钮
 * 加 `asChild` 可把样式交给子元素（常用于包 <a> 或路由 Link）。 */
const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-150 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:border-ring cursor-pointer",
    {
        variants: {
            variant: {
                default: 'bg-primary text-primary-foreground hover:brightness-110 active:scale-[0.98] shadow-sm',
                gradient:
                    'bg-linear-to-r from-primary to-accent text-primary-foreground hover:brightness-110 active:scale-[0.98] shadow-md hover:shadow-lg',
                secondary: 'bg-secondary text-secondary-foreground hover:brightness-105 active:scale-[0.98]',
                outline: 'border border-border bg-transparent hover:bg-secondary/60 active:scale-[0.98]',
                ghost: 'hover:bg-secondary/60 hover:text-foreground active:scale-[0.98]',
                destructive:
                    'bg-destructive/10 text-destructive border border-destructive/25 hover:bg-destructive hover:text-destructive-foreground active:scale-[0.98]',
                link: 'text-primary underline-offset-4 hover:underline',
            },
            size: {
                sm: 'h-8 px-3 text-xs',
                default: 'h-9 px-4',
                lg: 'h-10 px-6 text-base',
                icon: 'size-9 p-0',
                'icon-sm': 'size-8 p-0',
            },
        },
        defaultVariants: { variant: 'default', size: 'default' },
    },
)

function Button({
    className,
    variant,
    size,
    asChild = false,
    ...props
}: ComponentProps<'button'> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
    const Comp = asChild ? Slot.Root : 'button'
    return (
        <Comp
            data-slot="button"
            className={cn(buttonVariants({ variant, size }), className)}
            {...props}
        />
    )
}

export { Button, buttonVariants }
