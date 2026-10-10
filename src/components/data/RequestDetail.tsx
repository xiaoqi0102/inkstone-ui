import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'
import { CopyButton } from '../CopyButton'
import { buildCurl, type CurlRequest } from '../../lib/curl'

/**
 * RequestDetail —— 请求/响应详情面板：把一次调用**完整还原**出来，便于排障。
 *
 * 设计要点（都是实际排障时踩出来的需求）：
 *  1. 提示词/请求体必须**多行原样展示**（whitespace-pre-wrap + break-all），
 *     绝不截断成一行 —— 一行展示等于没法看。
 *  2. 每个可复制的块右上角都有复制按钮，且 curl 与 body 分开复制：
 *     有时候只需要 curl，有时候要把 prompt 单独拿去改。
 *  3. 提供 `curl` 快捷块：由 method/url/headers/body 自动拼出可直接粘进终端的命令，
 *     不用再问"你当时到底发的什么"。
 *  4. 长内容块默认折叠（max-h + 展开按钮），避免一个超长 prompt 把页面撑爆。
 */
export function RequestDetail({
    fields,
    request,
    response,
    className,
}: {
    /** 顶部键值对：模型、耗时、状态码、token 数等 */
    fields?: { label: string; value: ReactNode; mono?: boolean }[]
    /** 请求信息，给了就自动渲染 请求体 / curl 两块 */
    request?: CurlRequest
    /** 响应原文（字符串） */
    response?: string
    className?: string
}) {
    return (
        <div className={cn('flex flex-col gap-3', className)}>
            {fields && fields.length > 0 && (
                <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-xs">
                    {fields.map((field) => (
                        <div key={field.label} className="contents">
                            <dt className="text-muted-foreground">{field.label}</dt>
                            <dd className={cn('min-w-0 break-all', field.mono && 'font-mono')}>{field.value}</dd>
                        </div>
                    ))}
                </dl>
            )}

            {request?.body !== undefined && (
                <CodeBlock
                    label="请求体"
                    content={typeof request.body === 'string' ? request.body : JSON.stringify(request.body, null, 2)}
                />
            )}

            {request && <CodeBlock label="curl（可直接执行）" content={buildCurl(request)} />}

            {response !== undefined && <CodeBlock label="响应" content={response} />}
        </div>
    )
}

/** 代码块：标题 + 复制按钮 + 可折叠的等宽多行内容 */
export function CodeBlock({
    label,
    content,
    className,
    collapsedHeight = 260,
}: {
    label: string
    content: string
    className?: string
    /** 超过这个高度就折叠，0 表示不折叠 */
    collapsedHeight?: number
}) {
    const collapsible = collapsedHeight > 0 && content.split('\n').length > 14

    return (
        <div className={cn('rounded-lg border border-border bg-muted/40', className)}>
            <div className="flex items-center justify-between gap-2 border-b border-border/60 px-3 py-1.5">
                <span className="text-xs font-medium text-muted-foreground">{label}</span>
                <CopyButton
                    text={content}
                    showToast={false}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                    copyIconClassName="size-3.5"
                    checkIconClassName="size-3.5"
                />
            </div>
            <div
                className={cn('overflow-y-auto px-3 py-2', collapsible && 'group/code')}
                style={collapsible ? { maxHeight: collapsedHeight } : undefined}
            >
                <pre className="whitespace-pre-wrap break-all font-mono text-xs leading-relaxed">{content}</pre>
            </div>
        </div>
    )
}
