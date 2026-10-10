import type { ComponentProps } from 'react'
import { cn } from '../../lib/utils'

/** 卡片：默认是"实底 + 描边 + 轻阴影"。
 *  两个可选增强（用户偏好：卡片渐变 / 悬浮微动效）：
 *   - glow：叠一层极淡的主色径向渐变，让卡片中心更亮，视觉上"浮"起来一点
 *   - interactive：hover 轻微上浮 + 阴影加深，用于可点击卡片
 *  注意互动态只用 transform/box-shadow，不碰布局属性，避免列表里逐项重排。 */
function Card({
    className,
    glow = false,
    interactive = false,
    ...props
}: ComponentProps<'div'> & { glow?: boolean; interactive?: boolean }) {
    return (
        <div
            data-slot="card"
            className={cn(
                'relative flex flex-col gap-4 rounded-xl border border-border bg-card py-5 text-card-foreground shadow-sm',
                glow &&
                    'before:pointer-events-none before:absolute before:inset-0 before:rounded-xl before:bg-[radial-gradient(120%_100%_at_0%_0%,color-mix(in_oklab,var(--primary)_8%,transparent),transparent_60%)]',
                interactive &&
                    'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:border-primary/30',
                className,
            )}
            {...props}
        />
    )
}

function CardHeader({ className, ...props }: ComponentProps<'div'>) {
    return <div data-slot="card-header" className={cn('flex flex-col gap-1.5 px-5', className)} {...props} />
}

function CardTitle({ className, ...props }: ComponentProps<'div'>) {
    return <div data-slot="card-title" className={cn('font-semibold leading-none', className)} {...props} />
}

function CardDescription({ className, ...props }: ComponentProps<'div'>) {
    return <div data-slot="card-description" className={cn('text-sm text-muted-foreground', className)} {...props} />
}

function CardContent({ className, ...props }: ComponentProps<'div'>) {
    return <div data-slot="card-content" className={cn('px-5', className)} {...props} />
}

function CardFooter({ className, ...props }: ComponentProps<'div'>) {
    return <div data-slot="card-footer" className={cn('flex items-center px-5', className)} {...props} />
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
