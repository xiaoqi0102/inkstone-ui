import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

/**
 * PageHeader —— 内容区顶部条：左标题/描述，右动作。
 *
 * 硬规则（踩过：标题一长就把按钮挤到第二行，整行高度跳变）：
 *   - 容器 `flex items-start justify-between gap-3`，**不换行**；
 *   - 标题列 `min-w-0` + 文本 `truncate`，让它自己截断；
 *   - 动作列 `shrink-0` + `whitespace-nowrap`，永远不缩、不折。
 * 同类区块（如日志页的①②两组标题+按钮）请用同一套，保证左右边缘对齐。
 */
export function PageHeader({
    title,
    description,
    actions,
    className,
}: {
    title: ReactNode
    description?: ReactNode
    actions?: ReactNode
    className?: string
}) {
    return (
        <div className={cn('flex flex-none flex-wrap items-center justify-between gap-2', className)}>
            <div className="flex min-w-0 flex-col gap-0.5">
                <div className="truncate text-base font-semibold">{title}</div>
                {description && <div className="truncate text-xs text-muted-foreground">{description}</div>}
            </div>
            {actions && <div className="flex shrink-0 items-center gap-1 whitespace-nowrap">{actions}</div>}
        </div>
    )
}
