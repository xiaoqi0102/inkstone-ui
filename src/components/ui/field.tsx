import type { ComponentProps, ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'
import { Label } from './label'
import { Separator } from './separator'

/** Field 家族：表单行的排版积木，把"标签 / 控件 / 说明 / 错误"的关系固定下来，
 *  避免每个表单都手写一遍间距和错误色。用法：
 *  <FieldGroup><Field orientation="responsive">
 *     <FieldLabel htmlFor="x">名称<FieldDescription>显示用</FieldDescription></FieldLabel>
 *     <Input id="x" />
 *     <FieldError errors={[{ message: '必填' }]} />
 *  </Field></FieldGroup> */

function FieldSet({ className, ...props }: ComponentProps<'fieldset'>) {
    return <fieldset data-slot="field-set" className={cn('flex flex-col gap-4', className)} {...props} />
}

function FieldGroup({ className, ...props }: ComponentProps<'div'>) {
    return <div data-slot="field-group" className={cn('flex w-full flex-col gap-5', className)} {...props} />
}

const fieldVariants = cva('group/field flex w-full gap-2', {
    variants: {
        orientation: {
            vertical: 'flex-col [&>*]:w-full',
            horizontal: 'flex-row items-center justify-between',
            responsive: 'flex-col @md/field-group:flex-row @md/field-group:items-center',
        },
    },
    defaultVariants: { orientation: 'vertical' },
})

function Field({
    className,
    orientation,
    ...props
}: ComponentProps<'div'> & VariantProps<typeof fieldVariants>) {
    return (
        <div
            role="group"
            data-slot="field"
            data-orientation={orientation ?? 'vertical'}
            className={cn(fieldVariants({ orientation }), className)}
            {...props}
        />
    )
}

function FieldContent({ className, ...props }: ComponentProps<'div'>) {
    return <div data-slot="field-content" className={cn('flex flex-1 flex-col gap-1', className)} {...props} />
}

function FieldLabel({ className, ...props }: ComponentProps<typeof Label>) {
    return (
        <Label
            data-slot="field-label"
            className={cn('flex w-fit items-center gap-2 leading-snug group-data-[invalid=true]/field:text-destructive', className)}
            {...props}
        />
    )
}

function FieldTitle({ className, ...props }: ComponentProps<'div'>) {
    return <div data-slot="field-title" className={cn('flex w-fit items-center gap-2 text-sm font-medium', className)} {...props} />
}

function FieldDescription({ className, ...props }: ComponentProps<'p'>) {
    return (
        <p
            data-slot="field-description"
            className={cn('text-xs font-normal text-muted-foreground leading-normal', className)}
            {...props}
        />
    )
}

function FieldSeparator({ children, className, ...props }: ComponentProps<'div'> & { children?: ReactNode }) {
    return (
        <div data-slot="field-separator" className={cn('relative -my-1 h-5 text-xs', className)} {...props}>
            <Separator className="absolute inset-0 top-1/2" />
            {children && (
                <span className="relative mx-auto block w-fit bg-background px-2 text-muted-foreground">{children}</span>
            )}
        </div>
    )
}

export type FieldErrorItem = { message?: string }

function FieldError({ className, errors, children, ...props }: ComponentProps<'div'> & { errors?: FieldErrorItem[] }) {
    const messages = errors?.map((e) => e.message).filter((m): m is string => Boolean(m))
    const content = children ?? (messages && messages.length ? messages.join('；') : null)
    if (!content) return null
    return (
        <div
            role="alert"
            data-slot="field-error"
            className={cn('text-xs font-normal text-destructive', className)}
            {...props}
        >
            {content}
        </div>
    )
}

export {
    FieldSet,
    FieldGroup,
    Field,
    FieldContent,
    FieldLabel,
    FieldTitle,
    FieldDescription,
    FieldSeparator,
    FieldError,
}
