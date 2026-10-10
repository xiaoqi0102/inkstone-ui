import type { ComponentProps } from 'react'
import { Progress as ProgressPrimitive } from 'radix-ui'
import { cn } from '../../lib/utils'

/** 进度条：value 传 0-100。轨道用 muted，填充用主色渐变。 */
function Progress({
    className,
    value,
    ...props
}: ComponentProps<typeof ProgressPrimitive.Root>) {
    return (
        <ProgressPrimitive.Root
            data-slot="progress"
            className={cn('relative h-2 w-full overflow-hidden rounded-full bg-muted', className)}
            value={value}
            {...props}
        >
            <ProgressPrimitive.Indicator
                data-slot="progress-indicator"
                className="h-full w-full flex-1 rounded-full bg-linear-to-r from-primary to-accent transition-transform duration-300"
                style={{ transform: `translateX(-${100 - (value ?? 0)}%)` }}
            />
        </ProgressPrimitive.Root>
    )
}

export { Progress }
