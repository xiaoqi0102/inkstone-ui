import { useRef, type ReactNode } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { cn } from '../../lib/utils'

/**
 * VirtualizedList —— 长列表虚拟滚动（日志、请求记录这类上千条的场景）。
 *
 * 只渲染视口内的行，DOM 节点数恒定，滚动不掉帧；行高可以给"估值"，
 * measureElement 会实测并纠正，所以展开/折叠的行也能用。
 *
 * 用法：容器需要有确定高度（父层给 h-full / flex-1 min-h-0），
 * 否则拿不到滚动高度，虚拟化会退化。
 */
export function VirtualizedList<T>({
    items,
    estimateSize = 56,
    overscan = 8,
    renderItem,
    getItemKey,
    className,
    gap = 0,
    footer,
}: {
    items: T[]
    /** 单行预估高度（px），实测后会修正 */
    estimateSize?: number
    overscan?: number
    renderItem: (item: T, index: number) => ReactNode
    getItemKey?: (item: T, index: number) => string | number
    className?: string
    /** 行间距（px） */
    gap?: number
    footer?: ReactNode
}) {
    const scrollRef = useRef<HTMLDivElement>(null)

    const virtualizer = useVirtualizer({
        count: items.length,
        getScrollElement: () => scrollRef.current,
        estimateSize: () => estimateSize + gap,
        overscan,
    })

    return (
        <div ref={scrollRef} className={cn('h-full min-h-0 overflow-y-auto', className)}>
            <div className="relative w-full" style={{ height: `${virtualizer.getTotalSize()}px` }}>
                {virtualizer.getVirtualItems().map((virtualRow) => {
                    const item = items[virtualRow.index]
                    return (
                        <div
                            key={getItemKey ? getItemKey(item, virtualRow.index) : virtualRow.key}
                            data-index={virtualRow.index}
                            ref={virtualizer.measureElement}
                            className="absolute left-0 top-0 w-full"
                            style={{ transform: `translateY(${virtualRow.start}px)`, paddingBottom: gap }}
                        >
                            {renderItem(item, virtualRow.index)}
                        </div>
                    )
                })}
            </div>
            {footer}
        </div>
    )
}
