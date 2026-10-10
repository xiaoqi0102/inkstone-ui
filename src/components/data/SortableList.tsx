import type { ReactNode } from 'react'
import { DragDropContext, Draggable, Droppable, type DropResult } from '@hello-pangea/dnd'
import { cn } from '../../lib/utils'

/**
 * SortableList —— 可拖拽排序的列表（渠道成员排序、字段顺序这类场景）。
 *
 * 用 @hello-pangea/dnd（react-beautiful-dnd 的维护分支）：
 *   它自带键盘拖拽与读屏支持，比手搓 HTML5 DnD 省一大截，而且在触屏上能正常滚。
 *
 * 约定：调用方给 `items`（每项必须有唯一 id）与 `onReorder(nextItems)`，
 * 组件负责 index 计算与"拖完才回调"，中途不打断渲染。
 */
export function SortableList<T extends { id: string }>({
    items,
    onReorder,
    renderItem,
    className,
    direction = 'vertical',
}: {
    items: T[]
    onReorder: (items: T[]) => void
    /** index 可用于显示序号；index===0 时通常要隐藏"上移"这类按钮 */
    renderItem: (item: T, index: number, isDragging: boolean) => ReactNode
    className?: string
    direction?: 'vertical' | 'horizontal'
}) {
    const handleDragEnd = (result: DropResult) => {
        if (!result.destination) return
        const sourceIndex = result.source.index
        const targetIndex = result.destination.index
        if (sourceIndex === targetIndex) return

        const next = Array.from(items)
        const [moved] = next.splice(sourceIndex, 1)
        next.splice(targetIndex, 0, moved)
        onReorder(next)
    }

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="sortable-list" direction={direction}>
                {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} className={className}>
                        {items.map((item, index) => (
                            <Draggable key={item.id} draggableId={item.id} index={index}>
                                {(dragProvided, snapshot) => (
                                    <div
                                        ref={dragProvided.innerRef}
                                        {...dragProvided.draggableProps}
                                        {...dragProvided.dragHandleProps}
                                        className={cn('select-none', snapshot.isDragging && 'z-50 opacity-90 shadow-lg')}
                                        style={dragProvided.draggableProps.style}
                                    >
                                        {renderItem(item, index, snapshot.isDragging)}
                                    </div>
                                )}
                            </Draggable>
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </DragDropContext>
    )
}
