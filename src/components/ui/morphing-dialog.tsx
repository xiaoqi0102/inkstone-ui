import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useId,
    useMemo,
    useRef,
    useState,
    type CSSProperties,
    type Dispatch,
    type KeyboardEvent as ReactKeyboardEvent,
    type ReactNode,
    type RefObject,
    type SetStateAction,
} from 'react'
import { AnimatePresence, MotionConfig, motion, type Transition } from 'motion/react'
import { createPortal } from 'react-dom'
import { XIcon } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useClickOutside } from '../../hooks/useClickOutside'

/**
 * MorphingDialog —— 形变弹窗：触发器与弹窗**共用同一个 layoutId**，
 * motion 会把触发器的位置/尺寸插值到弹窗的位置/尺寸，于是列表里的卡片
 * 点开后“就地放大”成弹窗，关掉再缩回原卡片。列表→详情的交互用它比
 * 普通淡入弹窗的连续感强得多。
 *
 * 两个关键实现细节（踩过坑，别省）：
 *  1. 打开时触发器换成**等尺寸的普通占位元素**（visibility:hidden）而不是 motion 元素。
 *     否则 motion 在内部重排时会把触发器"闪回"原位，视觉上出现一下抽动。
 *  2. 关闭时用 AnimatePresence 包住容器，让缩回动画能播完再卸载。
 *
 * 用法：
 *  <MorphingDialog>
 *    <MorphingDialogTrigger><Card>…</Card></MorphingDialogTrigger>
 *    <MorphingDialogContainer>
 *      <MorphingDialogContent>…<MorphingDialogClose /></MorphingDialogContent>
 *    </MorphingDialogContainer>
 *  </MorphingDialog>
 */

type MorphingDialogContextValue = {
    isOpen: boolean
    setIsOpen: Dispatch<SetStateAction<boolean>>
    uniqueId: string
    triggerRef: RefObject<HTMLDivElement | null>
}

const MorphingDialogContext = createContext<MorphingDialogContextValue | null>(null)

function useMorphingDialog() {
    const context = useContext(MorphingDialogContext)
    if (!context) throw new Error('useMorphingDialog 必须在 <MorphingDialog> 内使用')
    return context
}

/** 弹窗内的浮层（下拉/气泡）渲染在 portal 里，DOM 上看算"组件外部"，
 *  点它们不该关弹窗 —— 这个默认守卫把它们放行。 */
function defaultIgnoreOutsideClick(event: PointerEvent | TouchEvent) {
    const target = event.target as HTMLElement | null
    const portalSelectors = ['[data-slot="select-content"]', '[data-slot="popover-content"]', '[data-slot="tooltip-content"]']
    if (target?.closest(portalSelectors.join(','))) return true
    return portalSelectors.some((selector) => document.querySelector(selector) !== null)
}

export type MorphingDialogProps = {
    children: ReactNode
    /** 覆盖全局过渡曲线，例如 { type: 'spring', bounce: 0.2, duration: 0.4 } */
    transition?: Transition
}

export function MorphingDialog({ children, transition }: MorphingDialogProps) {
    const [isOpen, setIsOpen] = useState(false)
    const uniqueId = useId()
    const triggerRef = useRef<HTMLDivElement>(null)

    const contextValue = useMemo(
        () => ({ isOpen, setIsOpen, uniqueId, triggerRef }),
        [isOpen, uniqueId],
    )

    return (
        <MorphingDialogContext.Provider value={contextValue}>
            <MotionConfig transition={transition}>{children}</MotionConfig>
        </MorphingDialogContext.Provider>
    )
}

export function MorphingDialogTrigger({
    children,
    className,
    style,
    triggerRef: triggerRefProp,
}: {
    children: ReactNode
    className?: string
    style?: CSSProperties
    triggerRef?: RefObject<HTMLDivElement | null>
}) {
    const { isOpen, setIsOpen, uniqueId, triggerRef } = useMorphingDialog()
    const ref = triggerRefProp ?? triggerRef

    const toggle = useCallback(() => setIsOpen((open) => !open), [setIsOpen])
    const handleKeyDown = useCallback(
        (event: ReactKeyboardEvent<HTMLDivElement>) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                toggle()
            }
        },
        [toggle],
    )

    // 打开态：留占位不参与动画，避免 motion 重排时触发器闪回。
    if (isOpen) {
        return (
            <div
                ref={ref}
                className={cn('relative', className)}
                style={{ ...style, visibility: 'hidden', pointerEvents: 'none' }}
                aria-hidden
            >
                {children}
            </div>
        )
    }

    return (
        <motion.div
            ref={ref}
            layoutId={`morphing-dialog-${uniqueId}`}
            className={cn('relative cursor-pointer', className)}
            style={style}
            onClick={toggle}
            onKeyDown={handleKeyDown}
            role="button"
            tabIndex={0}
            aria-haspopup="dialog"
            aria-expanded={isOpen}
            aria-controls={`morphing-dialog-content-${uniqueId}`}
        >
            {children}
        </motion.div>
    )
}

export function MorphingDialogContent({
    children,
    className,
    style,
    dismissOnClickOutside = true,
    ignoreOutsideClick,
}: {
    children: ReactNode
    className?: string
    style?: CSSProperties
    dismissOnClickOutside?: boolean
    /** 自定义"算外部但不关"的规则；默认放行 select/popover/tooltip 的 portal 层 */
    ignoreOutsideClick?: (event: PointerEvent | TouchEvent) => boolean
}) {
    const { setIsOpen, isOpen, uniqueId, triggerRef } = useMorphingDialog()
    const containerRef = useRef<HTMLDivElement>(null)
    const firstFocusableRef = useRef<HTMLElement | null>(null)
    const lastFocusableRef = useRef<HTMLElement | null>(null)

    // Esc 关闭 + Tab 焦点锁在弹窗内（无障碍必需，少一个都算残废）
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setIsOpen(false)
            if (event.key !== 'Tab') return
            if (!firstFocusableRef.current || !lastFocusableRef.current) return
            const active = document.activeElement
            if (event.shiftKey && active === firstFocusableRef.current) {
                event.preventDefault()
                lastFocusableRef.current.focus()
            } else if (!event.shiftKey && active === lastFocusableRef.current) {
                event.preventDefault()
                firstFocusableRef.current.focus()
            }
        }
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [setIsOpen])

    // 打开时锁 body 滚动、把焦点送进来；关闭时焦点还给触发器（否则键盘用户会丢位置）
    useEffect(() => {
        if (isOpen) {
            document.body.classList.add('overflow-hidden')
            const focusables = containerRef.current?.querySelectorAll<HTMLElement>(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
            )
            if (focusables && focusables.length > 0) {
                firstFocusableRef.current = focusables[0]
                lastFocusableRef.current = focusables[focusables.length - 1]
                focusables[0].focus()
            }
        } else {
            document.body.classList.remove('overflow-hidden')
            triggerRef.current?.focus()
        }
    }, [isOpen, triggerRef])

    useClickOutside(
        containerRef,
        () => {
            if (isOpen && dismissOnClickOutside) setIsOpen(false)
        },
        ignoreOutsideClick ?? defaultIgnoreOutsideClick,
    )

    return (
        <motion.div
            ref={containerRef}
            layoutId={`morphing-dialog-${uniqueId}`}
            id={`morphing-dialog-content-${uniqueId}`}
            className={cn('overflow-hidden', className)}
            style={style}
            role="dialog"
            aria-modal="true"
        >
            {children}
        </motion.div>
    )
}

export function MorphingDialogContainer({ children }: { children: ReactNode }) {
    const { isOpen, uniqueId } = useMorphingDialog()
    if (typeof document === 'undefined') return null

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* 背板：点击不关闭（关闭统一走 Content 的外部点击判定），避免误触 */}
                    <motion.div
                        key={`backdrop-${uniqueId}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/40 backdrop-blur-md"
                    />
                    <div className="relative z-10 w-full max-w-lg">{children}</div>
                </div>
            )}
        </AnimatePresence>,
        document.body,
    )
}

export function MorphingDialogClose({
    children,
    className,
    onClose,
}: {
    children?: ReactNode
    className?: string
    onClose?: () => void
}) {
    const { setIsOpen } = useMorphingDialog()
    return (
        <button
            type="button"
            aria-label="关闭"
            onClick={() => {
                setIsOpen(false)
                onClose?.()
            }}
            className={cn(
                'absolute right-3 top-3 z-10 inline-flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground',
                className,
            )}
        >
            {children ?? <XIcon className="size-4" />}
        </button>
    )
}

export function MorphingDialogTitle({ children, className }: { children: ReactNode; className?: string }) {
    const { uniqueId } = useMorphingDialog()
    return (
        <div id={`morphing-dialog-title-${uniqueId}`} className={cn('font-semibold', className)}>
            {children}
        </div>
    )
}

export function MorphingDialogDescription({ children, className }: { children: ReactNode; className?: string }) {
    const { uniqueId } = useMorphingDialog()
    return (
        <p id={`morphing-dialog-description-${uniqueId}`} className={cn('text-sm text-muted-foreground', className)}>
            {children}
        </p>
    )
}
