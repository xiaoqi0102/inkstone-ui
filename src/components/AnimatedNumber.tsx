import { useEffect, useRef, useState } from 'react'
import { animate } from 'motion/react'

/** 数字滚动：值变化时从旧值补间到新值。
 *  统计面板里"数字自己跑上去"的观感比直接替换文本强很多，且能提示"这个值刚更新了"。
 *  只做数字补间，格式化交给调用方（或直接用 lib/utils 里的 formatCount/formatMoney）。 */
export function AnimatedNumber({
    value,
    duration = 800,
    format,
    className,
}: {
    value: string | number | undefined
    /** 毫秒 */
    duration?: number
    /** 自定义格式化，默认按传入值是否含小数决定保留 2 位 */
    format?: (value: number) => string
    className?: string
}) {
    const [displayValue, setDisplayValue] = useState(0)
    const prevValueRef = useRef(0)

    useEffect(() => {
        if (value === undefined || value === null || value === '-') {
            prevValueRef.current = 0
            return
        }

        const numericValue = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value
        if (Number.isNaN(numericValue)) return

        const controls = animate(prevValueRef.current, numericValue, {
            duration: duration / 1000, // motion 的时长单位是秒
            ease: 'easeOut',
            onUpdate: (latest) => {
                setDisplayValue(latest)
                prevValueRef.current = latest
            },
        })

        return () => controls.stop()
    }, [value, duration])

    if (value === undefined || value === null) return <span className={className}>-</span>

    const shouldShowDecimals = typeof value === 'string' && value.includes('.')
    const decimalPlaces = shouldShowDecimals ? 2 : 0
    const text = format
        ? format(displayValue)
        : displayValue.toLocaleString('en-US', {
              minimumFractionDigits: decimalPlaces,
              maximumFractionDigits: decimalPlaces,
          })

    return <span className={className}>{text}</span>
}
