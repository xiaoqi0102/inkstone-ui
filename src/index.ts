/* ============================================================================
 * inkstone-ui —— 公共出口
 * 三层：tokens（样式）/ ui（原子）/ 业务无关的通用件与外壳。
 *
 * 用法：
 *   import { Button, DockNav, StatCard } from 'inkstone-ui'
 *   // 样式由消费者自己的入口 CSS 引（见 styles/base.css 顶部注释）：
 *   //   @import "tailwindcss";
 *   //   @import "tw-animate-css";
 *   //   @import "inkstone-ui/styles/tokens.css";
 *   //   @import "inkstone-ui/styles/base.css";
 *   //   @source "../node_modules/inkstone-ui/src";
 *
 * ⚠ 这里刻意 *不* import 任何 CSS：本库以源码形式发布，若在入口引 globals.css，
 *   消费者一 import 组件就会被连带引一份 Tailwind 本体，与其自己的 Tailwind 重复。
 * ========================================================================== */

/* ---------- 工具与 Provider ---------- */
export { cn, formatCount, formatMoney, formatTime, withThousands, truncateMiddle } from './lib/utils'
export { buildCurl, type CurlRequest } from './lib/curl'
export { ThemeProvider, useTheme, type Theme, type ResolvedTheme } from './providers/theme'
export { UIKitProvider } from './providers/kit'

/* ---------- Hooks ---------- */
export { useClickOutside } from './hooks/useClickOutside'
export {
    useEventSource,
    type SseEvent,
    type UseEventSourceOptions,
} from './hooks/useEventSource'

/* ---------- 原子组件 ---------- */
export { Button, buttonVariants } from './components/ui/button'
export { Badge, badgeVariants } from './components/ui/badge'
export {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from './components/ui/card'
export { Input } from './components/ui/input'
export {
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
} from './components/ui/tabs'
export {
    Select,
    SelectGroup,
    SelectValue,
    SelectTrigger,
    SelectContent,
    SelectLabel,
    SelectItem,
    SelectSeparator,
    SelectScrollUpButton,
    SelectScrollDownButton,
} from './components/ui/select'
export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor } from './components/ui/popover'
export {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from './components/ui/accordion'
export { Checkbox } from './components/ui/checkbox'
export { Label } from './components/ui/label'
export { Separator } from './components/ui/separator'
export { Switch } from './components/ui/switch'
export { Progress } from './components/ui/progress'
export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from './components/ui/tooltip'
export {
    FieldSet,
    FieldGroup,
    Field,
    FieldContent,
    FieldLabel,
    FieldTitle,
    FieldDescription,
    FieldSeparator,
    FieldError,
    type FieldErrorItem,
} from './components/ui/field'
export { Toaster } from './components/ui/sonner'
export {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
    ChartStyle,
    useChart,
    type ChartConfig,
} from './components/ui/chart'
export { Calendar, CalendarDayButton } from './components/ui/calendar'
export {
    MorphingDialog,
    MorphingDialogTrigger,
    MorphingDialogContent,
    MorphingDialogContainer,
    MorphingDialogClose,
    MorphingDialogTitle,
    MorphingDialogDescription,
} from './components/ui/morphing-dialog'

/* ---------- 通用件 ---------- */
export { AnimatedNumber } from './components/AnimatedNumber'
export { CopyButton } from './components/CopyButton'
export { IconButton } from './components/IconButton'

/* ---------- 外壳 ---------- */
export { DockNav, type DockNavItem } from './components/shell/DockNav'
export { AppShell } from './components/shell/AppShell'
export { PageHeader } from './components/shell/PageHeader'

/* ---------- 数据展示 ---------- */
export { StatCard } from './components/data/StatCard'
export { MetricTabs } from './components/data/MetricTabs'
export { VirtualizedList } from './components/data/VirtualizedList'
export { VirtualizedGrid, type ResponsiveColumns } from './components/data/VirtualizedGrid'
export { Sparkline } from './components/data/Sparkline'
export { JsonViewer } from './components/data/JsonViewer'
export { RequestDetail, CodeBlock } from './components/data/RequestDetail'
export { SortableList } from './components/data/SortableList'

/* ---------- 状态模式 ---------- */
export {
    usePageActions,
    usePageActionsStore,
    type PageAction,
} from './stores/page-actions'
