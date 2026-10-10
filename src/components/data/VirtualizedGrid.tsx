import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { cn } from '../../lib/utils'

/**
 * VirtualizedGrid —— 卡片网格的虚拟滚动（渠道列表、模型列表这类"卡片墙"）。
 *
 * 比 VirtualizedList 多两件事：
 *  1. **响应式列数**：列数由容器实际宽度决定（ResizeObserver），不是由窗口宽度。
 *     窗口宽度在侧栏折叠、面板拖拽时是不准的，只有容器自己的宽度才对。
 *  2. **行容器**：虚拟化单位是"行"，一行里放 columnCount 个卡片，行高自动测量。
 *
 * 三个踩过的坑，改代码时别省：
 *  ① **行 key 必须由该行首项的 key 生成**。如果用行序号，日志流从头部插入新数据时，
 *    行内容整体后移、key 全变，虚拟化器的实测高度缓存全失效，间距会退化成估值来回抖。
 *  ② `measureElement` 用 `offsetHeight` 而不是 `getBoundingClientRect().height`。
 *     页面进场有 scale 动画时，后者会被缩放影响，测出来的高度是错的。
 *  ③ 触底加载要 `reachEndOffset` 提前量 + 一次性 ref 守卫，否则会连环触发。
 */

const BREAKPOINTS = { sm: 640, md: 768, lg: 960, xl: 1280, '2xl': 1536 } as const

type Breakpoint = keyof typeof BREAKPOINTS
export type ResponsiveColumns = Partial<Record<Breakpoint | 'default', number>>

function getColumnsForWidth(width: number, columns: ResponsiveColumns): number {
    if (width >= BREAKPOINTS['2xl'] && columns['2xl'] !== undefined) return columns['2xl']
    if (width >= BREAKPOINTS.xl && columns.xl !== undefined) return columns.xl
    if (width >= BREAKPOINTS.lg && columns.lg !== undefined) return columns.lg
    if (width >= BREAKPOINTS.md && columns.md !== undefined) return columns.md
    if (width >= BREAKPOINTS.sm && columns.sm !== undefined) return columns.sm
    return columns.default ?? 1
}

export function VirtualizedGrid<T>({
    items,
    layout = 'grid',
    columns,
    estimateItemHeight,
    gap = 16,
    overscan = 4,
    getItemKey,
    renderItem,
    footer = null,
    onReachEnd,
    reachEndEnabled = false,
    reachEndOffset = 1,
    className,
}: {
    items: T[]
    /** list 模式强制单列（窄容器里卡片不该被压成两列） */
    layout?: 'grid' | 'list'
    columns: ResponsiveColumns
    /** 卡片预估高度（px），实测后会修正 */
    estimateItemHeight: number
    gap?: number
    overscan?: number
    getItemKey: (item: T, index: number) => string | number
    renderItem: (item: T, index: number) => ReactNode
    /** 追加在最后一个数据行后面的额外一行（如"加载更多"） */
    footer?: ReactNode
    onReachEnd?: () => void
    reachEndEnabled?: boolean
    /** 距底部还剩几行时触发 */
    reachEndOffset?: number
    className?: string
}) {
    const [containerWidth, setContainerWidth] = useState(() =>
        typeof window === 'undefined' ? 1024 : window.innerWidth,
    )
    const containerRef = useRef<HTMLDivElement | null>(null)
    const reachEndTriggeredRef = useRef(false)

    useEffect(() => {
        const element = containerRef.current
        if (!element) return

        const updateWidth = () => {
            const nextWidth = element.clientWidth
            setContainerWidth((prev) => (prev === nextWidth ? prev : nextWidth))
        }

        updateWidth()
        if (typeof ResizeObserver === 'undefined') return
        const observer = new ResizeObserver(updateWidth)
        observer.observe(element)
        return () => observer.disconnect()
    }, [])

    const columnCount = useMemo(() => {
        if (layout === 'list') return 1
        return Math.max(1, getColumnsForWidth(containerWidth, columns))
    }, [layout, containerWidth, columns])

    const itemRowCount = useMemo(
        () => (items.length === 0 ? 0 : Math.ceil(items.length / columnCount)),
        [items.length, columnCount],
    )
    const hasFooterRow = footer !== null
    const rowCount = itemRowCount + (hasFooterRow ? 1 : 0)

    // 见组件注释 ①：行 key 必须锚定到该行首项
    const getVirtualRowKey = useCallback(
        (rowIndex: number) => {
            if (hasFooterRow && rowIndex === itemRowCount) return '__virtual-footer__'
            const rowStartIndex = rowIndex * columnCount
            const firstItem = items[rowStartIndex]
            if (!firstItem) return `row-empty-${rowIndex}`
            return `row-${String(getItemKey(firstItem, rowStartIndex))}`
        },
        [hasFooterRow, itemRowCount, columnCount, items, getItemKey],
    )

    const rowVirtualizer = useVirtualizer({
        count: rowCount,
        getScrollElement: () => containerRef.current,
        getItemKey: getVirtualRowKey,
        estimateSize: () => estimateItemHeight + gap,
        // 见组件注释 ②：用布局高度，避开进场 scale 动画
        measureElement: (element) =>
            element instanceof HTMLElement ? element.offsetHeight : element.getBoundingClientRect().height,
        overscan,
    })

    const virtualRows = rowVirtualizer.getVirtualItems()

    useEffect(() => {
        if (!onReachEnd || !reachEndEnabled || itemRowCount === 0) return

        const lastVirtualIndex = virtualRows.length > 0 ? virtualRows[virtualRows.length - 1]!.index : -1
        const triggerIndex = Math.max(0, itemRowCount - 1 - reachEndOffset)
        if (lastVirtualIndex < triggerIndex) {
            reachEndTriggeredRef.current = false
            return
        }
        if (reachEndTriggeredRef.current) return

        reachEndTriggeredRef.current = true
        onReachEnd()
    }, [onReachEnd, reachEndEnabled, itemRowCount, reachEndOffset, virtualRows])

    return (
        <div className={cn('relative h-full min-h-0 w-full', className)}>
            <div ref={containerRef} className="relative h-full w-full overflow-y-auto overscroll-contain rounded-t-3xl">
                {rowCount === 0 ? null : (
                    <div className="relative w-full" style={{ height: `${rowVirtualizer.getTotalSize()}px` }}>
                        {virtualRows.map((virtualRow) => {
                            if (hasFooterRow && virtualRow.index === itemRowCount) {
                                return (
                                    <div
                                        key={virtualRow.key}
                                        data-index={virtualRow.index}
                                        ref={rowVirtualizer.measureElement}
                                        className="absolute left-0 top-0 w-full"
                                        style={{ transform: `translateY(${virtualRow.start}px)` }}
                                    >
                                        {footer}
                                    </div>
                                )
                            }

                            const rowStartIndex = virtualRow.index * columnCount
                            const rowEndIndex = Math.min(rowStartIndex + columnCount, items.length)
                            const rowItems = items.slice(rowStartIndex, rowEndIndex)
                            const rowPaddingBottom =
                                virtualRow.index === itemRowCount - 1 && !hasFooterRow ? 0 : gap

                            return (
                                <div
                                    key={virtualRow.key}
                                    data-index={virtualRow.index}
                                    ref={rowVirtualizer.measureElement}
                                    className="absolute left-0 top-0 w-full"
                                    style={{ transform: `translateY(${virtualRow.start}px)` }}
                                >
                                    <div
                                        className="grid"
                                        style={{
                                            gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
                                            gap: `${gap}px`,
                                            paddingBottom: `${rowPaddingBottom}px`,
                                        }}
                                    >
                                        {rowItems.map((item, columnIndex) => {
                                            const itemIndex = rowStartIndex + columnIndex
                                            return (
                                                <div key={String(getItemKey(item, itemIndex))} className="min-w-0">
                                                    {renderItem(item, itemIndex)}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
