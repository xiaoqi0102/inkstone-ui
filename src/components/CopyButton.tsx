import { useCallback, useEffect, useRef, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '../lib/utils'

/** 复制按钮：两个图标叠在同一格里（grid 同行同列），靠 scale + 延迟做交叉淡换。
 *  比切换单个图标再重排更稳 —— 图标尺寸不同也不会造成按钮宽度跳动。
 *  toast 可在不需要全局提示的场景关掉（showToast={false}），只留图标勾选反馈。 */
export function CopyButton({
    text,
    className,
    copyIconClassName,
    checkIconClassName,
    successMessage = '已复制',
    emptyMessage = '没有可复制的内容',
    showToast = true,
    resetDelay = 2000,
    onClick,
    ...props
}: {
    text: string | undefined
    className?: string
    copyIconClassName?: string
    checkIconClassName?: string
    successMessage?: string
    emptyMessage?: string
    showToast?: boolean
    /** 复制成功后多少毫秒恢复图标 */
    resetDelay?: number
    onClick?: () => void
} & Omit<React.ComponentProps<'button'>, 'onClick' | 'children'>) {
    const [copied, setCopied] = useState(false)
    const timerRef = useRef<number | null>(null)

    useEffect(() => {
        return () => {
            if (timerRef.current) window.clearTimeout(timerRef.current)
        }
    }, [])

    const handleClick = useCallback(async () => {
        onClick?.()
        if (!text) {
            if (showToast) toast.error(emptyMessage)
            return
        }
        try {
            await navigator.clipboard.writeText(text)
            setCopied(true)
            if (showToast) toast.success(successMessage)
            if (timerRef.current) window.clearTimeout(timerRef.current)
            timerRef.current = window.setTimeout(() => setCopied(false), resetDelay)
        } catch (error) {
            const description = error instanceof Error ? error.message : String(error)
            if (showToast) toast.error('复制失败', { description })
        }
    }, [text, onClick, showToast, successMessage, emptyMessage, resetDelay])

    return (
        <button type="button" onClick={handleClick} aria-label="复制" className={cn(className)} {...props}>
            <span className="grid place-items-center">
                <Copy
                    className={cn(
                        'col-start-1 row-start-1 transition-transform duration-200 motion-reduce:transition-none',
                        copied ? 'scale-0 delay-0 ease-in' : 'scale-100 delay-200 ease-out',
                        copyIconClassName,
                    )}
                />
                <Check
                    className={cn(
                        'col-start-1 row-start-1 transition-transform duration-200 motion-reduce:transition-none',
                        copied ? 'scale-100 delay-200 ease-out' : 'scale-0 delay-0 ease-in',
                        checkIconClassName,
                    )}
                />
            </span>
        </button>
    )
}
