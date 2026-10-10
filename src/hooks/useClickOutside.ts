import { useEffect, type RefObject } from 'react'

/** 点击/触摸元素外部时触发 handler。
 *  - 用捕获阶段（第三个参数 true）：即使内部元素 stopPropagation 也能收到，避免"点组件内部算外部"。
 *  - 同时监听 pointerdown 与 touchstart：只监听 click 的话，长按拖拽/移动端手势会漏。
 *  - shouldIgnore 用来放行浮层（select/popover 的弹层渲染在 portal 里，DOM 上算"外部"）。
 */
export function useClickOutside<T extends HTMLElement>(
    ref: RefObject<T | null>,
    handler: (event: PointerEvent | TouchEvent) => void,
    shouldIgnore?: (event: PointerEvent | TouchEvent) => boolean,
): void {
    useEffect(() => {
        const handle = (event: PointerEvent | TouchEvent) => {
            if (shouldIgnore?.(event)) return
            if (!ref?.current || ref.current.contains(event.target as Node)) return
            handler(event)
        }

        document.addEventListener('pointerdown', handle, true)
        document.addEventListener('touchstart', handle, true)
        return () => {
            document.removeEventListener('pointerdown', handle, true)
            document.removeEventListener('touchstart', handle, true)
        }
    }, [ref, handler, shouldIgnore])
}

export default useClickOutside
