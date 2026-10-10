import { Toaster as Sonner, type ToasterProps } from 'sonner'
import { useTheme } from '../../providers/theme'

/** 全局吐司容器：直接吃主题 Provider 的深浅状态，不额外引 next-themes。
 *  接到根布局里渲染一次即可：<Toaster />，然后任意处 toast.success('已保存')。 */
function Toaster(props: ToasterProps) {
    const { resolvedTheme } = useTheme()
    return (
        <Sonner
            theme={resolvedTheme}
            position="top-center"
            className="toaster group"
            style={
                {
                    '--normal-bg': 'var(--popover)',
                    '--normal-text': 'var(--popover-foreground)',
                    '--normal-border': 'var(--border)',
                    '--border-radius': 'var(--radius)',
                } as React.CSSProperties
            }
            toastOptions={{ classNames: { toast: 'text-sm' } }}
            {...props}
        />
    )
}

export { Toaster }
