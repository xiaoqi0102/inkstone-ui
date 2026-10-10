import { useEffect } from 'react'
import { create } from 'zustand'
import type { LucideIcon } from 'lucide-react'

/**
 * 「页面动作上浮」模式：页面自己声明要哪些操作按钮，由外壳统一渲染到顶栏。
 *
 * 解决的问题：顶栏属于布局层，按钮属于业务页。正常写法要把动作一路 props 传上去
 * （布局 → 页面 → 按钮），页面一多就变成 prop 钻井。改成页面挂载时把动作注册到
 * 全局 store、卸载时清掉，外壳只读 store —— 布局与页面彻底解耦。
 *
 * 注意：卸载时清空要判 id 归属，否则快速切页时会把新页面的动作一起清掉
 * （旧页面 unmount 在新页面 mount 之后执行，是真实会踩到的顺序）。
 */
export type PageAction = {
    id: string
    label: string
    icon?: LucideIcon
    disabled?: boolean
    /** 危险动作，渲染时给红色 */
    destructive?: boolean
    onSelect: () => void
}

interface PageActionsState {
    owner: string | null
    actions: PageAction[]
    setActions: (owner: string, actions: PageAction[]) => void
    clear: (owner: string) => void
}

export const usePageActionsStore = create<PageActionsState>((set) => ({
    owner: null,
    actions: [],
    setActions: (owner, actions) => set({ owner, actions }),
    clear: (owner) => set((state) => (state.owner === owner ? { owner: null, actions: [] } : state)),
}))

/** 在页面组件里调用：usePageActions('channel', [{ id: 'create', label: '新建', onSelect: ... }]) */
export function usePageActions(owner: string, actions: PageAction[]) {
    const setActions = usePageActionsStore((state) => state.setActions)
    const clear = usePageActionsStore((state) => state.clear)

    // actions 每次 render 都是新数组，所以依赖用序列化后的 key，避免无限重注册
    const key = JSON.stringify(actions.map((action) => ({ id: action.id, label: action.label, disabled: action.disabled })))

    useEffect(() => {
        setActions(owner, actions)
        return () => clear(owner)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [owner, key, setActions, clear])
}
