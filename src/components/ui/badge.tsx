import type { ComponentProps } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'
import { cn } from '../../lib/utils'

/** 状态徽标：小圆角胶囊，用于"启用/停用/错误"这类短状态。
 *  soft 变体用色底 + 同色文字（/10 透明度），在深色主题下比实心更耐看。 */
const badgeVariants = cva(
    'inline-flex items-center justify-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&_svg]:size-3 transition-colors',
    {
        variants: {
            variant: {
                default: 'border-transparent bg-primary/15 text-primary',
                secondary: 'border-transparent bg-secondary text-secondary-foreground',
                outline: 'border-border text-foreground',
                success: 'border-transparent bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
                warning: 'border-transparent bg-amber-500/15 text-amber-700 dark:text-amber-400',
                destructive: 'border-transparent bg-destructive/15 text-destructive',
                muted: 'border-transparent bg-muted text-muted-foreground',
            },
        },
        defaultVariants: { variant: 'default' },
    },
)

function Badge({
    className,
    variant,
    asChild = false,
    ...props
}: ComponentProps<'span'> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
    const Comp = asChild ? Slot.Root : 'span'
    return <Comp data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
