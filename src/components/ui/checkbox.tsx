import type { ComponentProps } from 'react'
import { Checkbox as CheckboxPrimitive } from 'radix-ui'
import { Check } from 'lucide-react'
import { cn } from '../../lib/utils'

/**
 * Checkbox —— 复选（多选、批量操作、表头全选）。
 *
 * 单选场景别用它：互斥选择用 RadioGroup，或者选项 ≤ 4 个且需要一眼看全时用
 * MetricTabs 那种分段控件。Checkbox 的语义是「可以多选」。
 *
 * 三态由 Radix 原生支持：`checked="indeterminate"` 用于「部分选中」的表头全选框。
 */
export function Checkbox({
    className,
    ...props
}: ComponentProps<typeof CheckboxPrimitive.Root>) {
    return (
        <CheckboxPrimitive.Root
            data-slot="checkbox"
            className={cn(
                'peer size-4 shrink-0 cursor-pointer rounded-[4px] border border-input bg-transparent transition-colors',
                'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
                'data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
                'data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground',
                'disabled:cursor-not-allowed disabled:opacity-50',
                'aria-invalid:border-destructive aria-invalid:ring-destructive/20',
                className,
            )}
            {...props}
        >
            <CheckboxPrimitive.Indicator
                data-slot="checkbox-indicator"
                className="flex items-center justify-center text-current transition-none"
            >
                {props.checked === 'indeterminate' ? (
                    <span className="block size-2 rounded-[1px] bg-current" />
                ) : (
                    <Check className="size-3.5" strokeWidth={3} />
                )}
            </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>
    )
}
