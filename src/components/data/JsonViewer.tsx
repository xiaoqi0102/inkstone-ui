import { useState, type ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'
import { cn } from '../../lib/utils'
import { CopyButton } from '../CopyButton'

/**
 * JsonViewer —— 自研 JSON 树（不引第三方，省一个依赖）。
 *
 * 与原前端用 `@uiw/react-json-view` 的效果对齐，但更轻：
 *  - 可折叠节点，按类型着色（string / number / boolean / null / key）
 *  - `defaultExpandDepth` 控制默认展开层数（大对象只展开前两层，避免刷屏）
 *  - 顶部一键复制整份 JSON（复制的是原始字符串，不是渲染后的 HTML）
 *  - 数组/对象显示子项数量，折叠时也能看出规模
 */
type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }

const TYPE_STYLES = {
    key: 'text-sky-600 dark:text-sky-400',
    string: 'text-emerald-600 dark:text-emerald-400',
    number: 'text-amber-600 dark:text-amber-400',
    boolean: 'text-violet-600 dark:text-violet-400',
    null: 'text-muted-foreground',
} as const

export function JsonViewer({
    value,
    name,
    defaultExpandDepth = 1,
    className,
    maxHeight,
}: {
    value: unknown
    /** 根节点名，如 "data"；不给则不渲染根名 */
    name?: string
    defaultExpandDepth?: number
    className?: string
    /** 超出则内部滚动（px） */
    maxHeight?: number
}) {
    const text = typeof value === 'string' ? value : JSON.stringify(value, null, 2) ?? ''

    return (
        <div className={cn('rounded-lg border border-border bg-muted/40', className)}>
            <div className="flex items-center justify-between gap-2 border-b border-border/60 px-3 py-1.5">
                <span className="text-xs font-medium text-muted-foreground">{name ?? 'JSON'}</span>
                <CopyButton
                    text={text}
                    showToast={false}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                    copyIconClassName="size-3.5"
                    checkIconClassName="size-3.5"
                />
            </div>
            <div className="overflow-auto px-3 py-2 font-mono text-xs leading-relaxed" style={maxHeight ? { maxHeight } : undefined}>
                <Node value={value as JsonValue} depth={0} defaultExpandDepth={defaultExpandDepth} />
            </div>
        </div>
    )
}

function Node({
    value,
    depth,
    defaultExpandDepth,
    label,
}: {
    value: JsonValue
    depth: number
    defaultExpandDepth: number
    label?: string
}): ReactNode {
    const [expanded, setExpanded] = useState(depth < defaultExpandDepth)

    const keyPart = label !== undefined && (
        <>
            <span className={TYPE_STYLES.key}>"{label}"</span>
            <span className="text-muted-foreground">: </span>
        </>
    )

    if (value === null) {
        return (
            <div>
                {keyPart}
                <span className={TYPE_STYLES.null}>null</span>
            </div>
        )
    }

    if (Array.isArray(value) || typeof value === 'object') {
        const entries = Array.isArray(value)
            ? value.map((item, index) => [String(index), item] as const)
            : Object.entries(value)
        const isArray = Array.isArray(value)
        const open = isArray ? '[' : '{'
        const close = isArray ? ']' : '}'

        return (
            <div>
                <button
                    type="button"
                    onClick={() => setExpanded((prev) => !prev)}
                    className="inline-flex cursor-pointer items-center gap-0.5 text-left hover:text-foreground"
                >
                    <ChevronRight className={cn('size-3 shrink-0 text-muted-foreground transition-transform', expanded && 'rotate-90')} />
                    {keyPart}
                    <span className="text-muted-foreground">{open}</span>
                    {!expanded && (
                        <>
                            <span className="text-muted-foreground/60">…{entries.length} 项…</span>
                            <span className="text-muted-foreground">{close}</span>
                        </>
                    )}
                </button>
                {expanded && (
                    <>
                        <div className="ml-3 border-l border-border/60 pl-3">
                            {entries.map(([entryKey, entryValue]) => (
                                <Node
                                    key={entryKey}
                                    value={entryValue as JsonValue}
                                    depth={depth + 1}
                                    defaultExpandDepth={defaultExpandDepth}
                                    label={isArray ? undefined : entryKey}
                                />
                            ))}
                        </div>
                        <div className="text-muted-foreground">{close}</div>
                    </>
                )}
            </div>
        )
    }

    if (typeof value === 'string') {
        return (
            <div>
                {keyPart}
                <span className={TYPE_STYLES.string}>"{value}"</span>
            </div>
        )
    }

    if (typeof value === 'number') {
        return (
            <div>
                {keyPart}
                <span className={TYPE_STYLES.number}>{String(value)}</span>
            </div>
        )
    }

    return (
        <div>
            {keyPart}
            <span className={TYPE_STYLES.boolean}>{String(value)}</span>
        </div>
    )
}
