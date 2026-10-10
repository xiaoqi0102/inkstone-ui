import { useState } from 'react'
import { Home, LayoutGrid, ListChecks, Logs, Moon, Plus, Radio, Settings, Sun, Trash2 } from 'lucide-react'
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts'
import { AppShell } from '@/components/shell/AppShell'
import { DockNav, type DockNavItem } from '@/components/shell/DockNav'
import { PageHeader } from '@/components/shell/PageHeader'
import { StatCard } from '@/components/data/StatCard'
import { MetricTabs } from '@/components/data/MetricTabs'
import { VirtualizedList } from '@/components/data/VirtualizedList'
import { RequestDetail } from '@/components/data/RequestDetail'
import { SortableList } from '@/components/data/SortableList'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { IconButton } from '@/components/IconButton'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { TooltipProvider } from '@/components/ui/tooltip'
import {
    MorphingDialog,
    MorphingDialogClose,
    MorphingDialogContainer,
    MorphingDialogContent,
    MorphingDialogDescription,
    MorphingDialogTitle,
    MorphingDialogTrigger,
} from '@/components/ui/morphing-dialog'
import { VirtualizedGrid } from '@/components/data/VirtualizedGrid'
import { Sparkline } from '@/components/data/Sparkline'
import { JsonViewer } from '@/components/data/JsonViewer'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { Calendar } from '@/components/ui/calendar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useTheme } from '@/providers/theme'
import { formatCount, formatMoney } from '@/lib/utils'

const CHART_CONFIG = {
    tokens: {
        label: '消耗',
        // 演示"色值只写一次"：直接用令牌变量，深浅两套由令牌自身切换，这里不必各写一份。
        theme: { light: 'var(--chart-2)', dark: 'var(--chart-2)' },
    },
} satisfies ChartConfig

const TREND = [
    { day: '周一', tokens: 1200 }, { day: '周二', tokens: 1850 }, { day: '周三', tokens: 1420 },
    { day: '周四', tokens: 2380 }, { day: '周五', tokens: 1980 }, { day: '周六', tokens: 2640 },
    { day: '周日', tokens: 2210 },
]

const CARDS = Array.from({ length: 200 }, (_, index) => ({
    id: `card-${index}`,
    name: `卡片 ${index + 1}`,
    desc: index % 3 === 0 ? '上游主渠道 · 权重 1' : index % 3 === 1 ? '备用渠道 · 低延迟' : '兜底渠道 · 按次计费',
}))

const NAV: DockNavItem[] = [
    { id: 'home', label: '首页', icon: Home },
    { id: 'logs', label: '日志', icon: Logs },
    { id: 'order', label: '排序', icon: Radio },
    { id: 'components', label: '组件', icon: LayoutGrid },
    { id: 'form', label: '表单', icon: ListChecks },
    { id: 'setting', label: '设置', icon: Settings },
]

const TITLES: Record<string, string> = {
    home: '首页',
    logs: '请求日志',
    order: '成员排序',
    components: '组件演示',
    form: '表单与标准件',
    setting: '设置',
}

const LOGS = Array.from({ length: 400 }, (_, index) => ({
    id: `req-${index}`,
    model: index % 3 === 0 ? 'gpt-5.1' : index % 3 === 1 ? 'claude-opus-4.5' : 'gemini-2.5-pro',
    status: index % 7 === 0 ? 'error' : 'ok',
    ms: 420 + (index % 900),
    tokens: 128 + (index % 4000),
}))

export function App() {
    const [page, setPage] = useState('home')
    const [prevPage, setPrevPage] = useState('home')
    const [metric, setMetric] = useState<'count' | 'money' | 'time'>('count')
    const [members, setMembers] = useState([
        { id: 'm1', name: '主网关', weight: 1 },
        { id: 'm2', name: '备用线路 A', weight: 2 },
        { id: 'm3', name: '本地兜底', weight: 3 },
    ])
    const { resolvedTheme, setTheme } = useTheme()

    const money = formatMoney(1_284_300)
    const count = formatCount(9_812_345)

    return (
        <TooltipProvider>
            <AppShell
                nav={
                    <DockNav
                        items={NAV}
                        value={page}
                        onChange={(next) => {
                            setPrevPage(page)
                            setPage(next)
                        }}
                    />
                }
                logo={<div className="grid size-11 place-items-center rounded-2xl bg-primary text-primary-foreground text-sm font-bold">UI</div>}
                title={TITLES[page]}
                previousTitle={TITLES[prevPage]}
                actions={
                    <IconButton
                        tip={resolvedTheme === 'dark' ? '切到浅色' : '切到深色'}
                        className="size-9"
                        onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                    >
                        {resolvedTheme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
                    </IconButton>
                }
            >
                <div className="flex h-full min-h-0 flex-1 flex-col gap-4 overflow-y-auto pb-28 md:pb-4">
                    {page === 'home' && (
                        <>
                            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                                <StatCard
                                    label="请求数"
                                    value={count.formatted.value}
                                    unit={count.formatted.unit}
                                    trend={4.2}
                                    footer={<Sparkline data={TREND} dataKey="tokens" height={28} className="mt-1" />}
                                />
                                <StatCard label="消耗" value={money.formatted.value} unit={money.formatted.unit} trend={-1.8} footer="按次计费合计" />
                                <StatCard label="成功率" value="99.4" unit="%" trend={0.3} footer="含上游重试" />
                            </div>

                            <Card glow={false} className="gap-3">
                                <PageHeader
                                    title="这是一个很长的标题用来验证它不会把右边的按钮挤到下一行去"
                                    description="标题只截断自己，动作区永远留在第一行"
                                    actions={
                                        <>
                                            <Badge variant="success">已启用</Badge>
                                            <Button size="sm" variant="outline">导出</Button>
                                            <Button size="sm" variant="gradient"><Plus className="size-4" />新建</Button>
                                        </>
                                    }
                                />
                                <Separator />
                                <div className="flex flex-wrap items-center gap-2 px-5">
                                    <MetricTabs
                                        value={metric}
                                        onChange={setMetric}
                                        options={[
                                            { value: 'count', label: '次数' },
                                            { value: 'money', label: '金额' },
                                            { value: 'time', label: '耗时' },
                                        ]}
                                    />
                                    <Button variant="default">主操作</Button>
                                    <Button variant="secondary">次操作</Button>
                                    <Button variant="outline">描边</Button>
                                    <Button variant="ghost">幽灵</Button>
                                    <Button variant="destructive"><Trash2 className="size-4" />删除</Button>
                                    <Button variant="link">链接</Button>
                                </div>
                                <div className="flex items-center gap-3 px-5">
                                    <Switch defaultChecked />
                                    <span className="text-xs text-muted-foreground">启用故障转移</span>
                                    <Progress value={68} className="max-w-40" />
                                </div>
                                <div className="flex flex-wrap gap-1 px-5">
                                    <Badge>默认</Badge>
                                    <Badge variant="secondary">次级</Badge>
                                    <Badge variant="outline">描边</Badge>
                                    <Badge variant="success">成功</Badge>
                                    <Badge variant="warning">警告</Badge>
                                    <Badge variant="destructive">失败</Badge>
                                </div>
                            </Card>

                            <Card className="gap-2 py-4">
                                <div className="px-5 text-sm font-medium">近 7 日消耗</div>
                                <ChartContainer config={CHART_CONFIG} className="aspect-auto h-52 w-full">
                                    <AreaChart data={TREND} margin={{ left: 8, right: 8 }}>
                                        <CartesianGrid vertical={false} />
                                        <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <Area
                                            dataKey="tokens"
                                            type="monotone"
                                            stroke="var(--color-tokens)"
                                            fill="var(--color-tokens)"
                                            fillOpacity={0.25}
                                        />
                                    </AreaChart>
                                </ChartContainer>
                            </Card>

                            <div className="grid gap-3 md:grid-cols-2">
                                <MorphingDialog>
                                    <MorphingDialogTrigger className="rounded-xl">
                                        <Card glow interactive className="gap-1">
                                            <div className="px-5 font-medium">形变弹窗（点我展开）</div>
                                            <div className="px-5 text-xs text-muted-foreground">卡片就地放大成弹窗，关闭缩回原位</div>
                                        </Card>
                                    </MorphingDialogTrigger>
                                    <MorphingDialogContainer>
                                        <MorphingDialogContent className="relative rounded-xl border border-border bg-card p-6">
                                            <MorphingDialogClose />
                                            <MorphingDialogTitle className="mb-2">共享布局动画</MorphingDialogTitle>
                                            <MorphingDialogDescription className="mb-4">
                                                触发器与弹窗共用同一个 layoutId，motion 负责插值位置与尺寸。
                                            </MorphingDialogDescription>
                                            <Button variant="gradient" onClick={() => undefined}>知道了</Button>
                                        </MorphingDialogContent>
                                    </MorphingDialogContainer>
                                </MorphingDialog>

                                <Card className="gap-2">
                                    <div className="px-5 text-sm font-medium">请求还原</div>
                                    <div className="px-5 text-xs text-muted-foreground">见「日志」页</div>
                                </Card>
                            </div>
                        </>
                    )}

                    {page === 'logs' && (
                        <div className="flex h-full min-h-0 flex-col gap-3">
                            <PageHeader title="请求日志" description="虚拟滚动，400 条只渲染视口内的行" actions={<Badge variant="muted">400 条</Badge>} />
                            <div className="min-h-0 flex-1 rounded-xl border border-border bg-card">
                                <VirtualizedList
                                    items={LOGS}
                                    estimateSize={44}
                                    gap={4}
                                    className="p-2"
                                    getItemKey={(item) => item.id}
                                    renderItem={(item) => (
                                        <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs hover:bg-secondary/50">
                                            <Badge variant={item.status === 'ok' ? 'success' : 'destructive'}>{item.status}</Badge>
                                            <span className="font-mono">{item.model}</span>
                                            <span className="ml-auto tabular-nums text-muted-foreground">{item.ms}ms · {item.tokens} tok</span>
                                        </div>
                                    )}
                                />
                            </div>
                            <RequestDetail
                                fields={[
                                    { label: '模型', value: 'gpt-5.1', mono: true },
                                    { label: '耗时', value: '1284 ms' },
                                    { label: '状态', value: <Badge variant="success">200</Badge> },
                                ]}
                                request={{
                                    method: 'POST',
                                    url: 'https://api.example.com/v1/responses',
                                    headers: { Authorization: 'Bearer sk-***', 'Content-Type': 'application/json' },
                                    body: {
                                        model: 'gpt-5.1',
                                        input: '第一行提示词\n第二行提示词\n第三行提示词',
                                        prompt_cache_key: 'cache-1',
                                    },
                                }}
                                response={'{"id":"resp_1","usage":{"input_tokens":128,"output_tokens":64}}'}
                            />
                            <JsonViewer
                                name="响应（可折叠 JSON 树）"
                                defaultExpandDepth={2}
                                maxHeight={220}
                                value={{
                                    id: 'resp_1',
                                    model: 'gpt-5.1',
                                    usage: { input_tokens: 128, output_tokens: 64 },
                                    choices: [{ index: 0, finish_reason: 'stop', text: '你好' }],
                                    cached: false,
                                }}
                            />
                        </div>
                    )}

                    {page === 'order' && (
                        <div className="flex flex-col gap-3">
                            <PageHeader title="成员排序" description="拖拽（也支持键盘）调整故障转移顺序" />
                            <SortableList
                                items={members}
                                onReorder={setMembers}
                                className="flex flex-col gap-2"
                                renderItem={(item, index) => (
                                    <Card className="flex-row items-center gap-3 py-3">
                                        <span className="grid size-6 place-items-center rounded-full bg-secondary text-xs">{index + 1}</span>
                                        <span className="text-sm">{item.name}</span>
                                        <Badge variant="muted" className="ml-auto">权重 {item.weight}</Badge>
                                    </Card>
                                )}
                            />
                        </div>
                    )}

                    {page === 'components' && (
                        <div className="grid gap-4 md:grid-cols-[auto_1fr]">
                            <Card className="w-fit gap-2 py-4">
                                <div className="px-5 text-sm font-medium">日期选择</div>
                                <div className="px-1">
                                    <Calendar mode="single" />
                                </div>
                            </Card>
                            <Card className="gap-2 py-4">
                                <PageHeader
                                    title="卡片墙（虚拟滚动）"
                                    description="响应式列数由容器宽度决定，200 张卡只渲染视口内的行"
                                    actions={<Badge variant="muted">200 张</Badge>}
                                />
                                <div className="h-[26rem] min-h-0 px-5">
                                    <VirtualizedGrid
                                        items={CARDS}
                                        columns={{ default: 1, sm: 2, lg: 3 }}
                                        estimateItemHeight={84}
                                        gap={12}
                                        getItemKey={(card) => card.id}
                                        renderItem={(card) => (
                                            <Card glow={false} className="gap-1 py-3">
                                                <div className="px-4 text-sm font-medium">{card.name}</div>
                                                <div className="px-4 text-xs text-muted-foreground">{card.desc}</div>
                                            </Card>
                                        )}
                                    />
                                </div>
                            </Card>
                        </div>
                    )}

                    {page === 'form' && (
                        <div className="flex flex-col gap-4">
                            <PageHeader
                                title="表单与标准件"
                                description="Tabs / Select / Popover / Accordion / Checkbox 已统一走库里的令牌"
                                actions={
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" size="sm">
                                                <Plus className="size-4" />
                                                筛选
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent align="end" className="flex flex-col gap-3">
                                            <div className="text-sm font-medium">日志筛选</div>
                                            <Select defaultValue="all">
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="状态" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">全部状态</SelectItem>
                                                    <SelectItem value="ok">仅成功</SelectItem>
                                                    <SelectItem value="error">仅失败</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <label className="flex items-center gap-2 text-sm">
                                                <Checkbox defaultChecked />
                                                只看今天
                                            </label>
                                            <label className="flex items-center gap-2 text-sm">
                                                <Checkbox />
                                                隐藏缓存命中
                                            </label>
                                        </PopoverContent>
                                    </Popover>
                                }
                            />

                            <div className="grid gap-4 lg:grid-cols-2">
                                <Card className="gap-3 py-4">
                                    <div className="px-5 text-sm font-medium">Tabs（两种形态）</div>
                                    <div className="px-5">
                                        <Tabs defaultValue="overview">
                                            <TabsList className="w-full">
                                                <TabsTrigger value="overview">概览</TabsTrigger>
                                                <TabsTrigger value="channels">渠道</TabsTrigger>
                                                <TabsTrigger value="keys">密钥</TabsTrigger>
                                            </TabsList>
                                            <TabsContent value="overview">
                                                <div className="rounded-lg border border-border p-3 text-xs text-muted-foreground">
                                                    概览面板内容。选中的标签用卡片底色「浮起来」，不用纯色块。
                                                </div>
                                            </TabsContent>
                                            <TabsContent value="channels">
                                                <div className="rounded-lg border border-border p-3 text-xs text-muted-foreground">
                                                    渠道面板内容。
                                                </div>
                                            </TabsContent>
                                            <TabsContent value="keys">
                                                <div className="rounded-lg border border-border p-3 text-xs text-muted-foreground">
                                                    密钥面板内容。
                                                </div>
                                            </TabsContent>
                                        </Tabs>
                                    </div>
                                    <div className="px-5">
                                        <Tabs defaultValue="a">
                                            <TabsList variant="line">
                                                <TabsTrigger value="a">指示线形态</TabsTrigger>
                                                <TabsTrigger value="b">适合嵌卡片头</TabsTrigger>
                                            </TabsList>
                                            <TabsContent value="a">
                                                <div className="py-2 text-xs text-muted-foreground">line 变体：无底色，只留底部 2px 指示线。</div>
                                            </TabsContent>
                                            <TabsContent value="b">
                                                <div className="py-2 text-xs text-muted-foreground">b 面板。</div>
                                            </TabsContent>
                                        </Tabs>
                                    </div>
                                </Card>

                                <Card className="gap-3 py-4">
                                    <div className="px-5 text-sm font-medium">Select / Input / Checkbox</div>
                                    <div className="flex flex-col gap-3 px-5">
                                        <div className="flex flex-col gap-1.5">
                                            <Label htmlFor="mdl">默认模型</Label>
                                            <Select defaultValue="astra">
                                                <SelectTrigger id="mdl" className="w-full">
                                                    <SelectValue placeholder="选一个模型" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="astra">gpt-5.1</SelectItem>
                                                    <SelectItem value="opus">claude-opus-4.5</SelectItem>
                                                    <SelectItem value="gemini">gemini-2.5-pro</SelectItem>
                                                    <SelectItem value="codex">codex-mini</SelectItem>
                                                    <SelectItem value="local">本地网关</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <Label htmlFor="base">上游地址</Label>
                                            <Input id="base" defaultValue="https://api.example.com" />
                                        </div>
                                        <div className="flex flex-col gap-2 pt-1">
                                            <label className="flex items-center gap-2 text-sm">
                                                <Checkbox defaultChecked /> 启用失败自动切换
                                            </label>
                                            <label className="flex items-center gap-2 text-sm">
                                                <Checkbox checked="indeterminate" /> 部分渠道已选中（三态）
                                            </label>
                                            <label className="flex items-center gap-2 text-sm">
                                                <Checkbox disabled /> 禁用态
                                            </label>
                                        </div>
                                    </div>
                                </Card>

                                <Card className="gap-2 py-4 lg:col-span-2">
                                    <div className="px-5 text-sm font-medium">Accordion（高级参数）</div>
                                    <div className="px-5">
                                        <Accordion type="single" collapsible defaultValue="timeout">
                                            <AccordionItem value="timeout">
                                                <AccordionTrigger>超时与重试</AccordionTrigger>
                                                <AccordionContent className="text-muted-foreground">
                                                    单次请求 60s、最多重试 2 次。收起时内容仍留在 DOM 里，表单提交不会丢字段。
                                                </AccordionContent>
                                            </AccordionItem>
                                            <AccordionItem value="map">
                                                <AccordionTrigger>模型映射</AccordionTrigger>
                                                <AccordionContent className="text-muted-foreground">
                                                    按端点重写模型名：同一个模型在 /v1/messages 与 /v1/responses 上可以走不同实现。
                                                </AccordionContent>
                                            </AccordionItem>
                                            <AccordionItem value="quota">
                                                <AccordionTrigger>额度与限速</AccordionTrigger>
                                                <AccordionContent className="text-muted-foreground">
                                                    按次计费的模型必须显式声明单价，否则会被静默按用量计费。
                                                </AccordionContent>
                                            </AccordionItem>
                                        </Accordion>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    )}

                    {page === 'setting' && (
                        <Card className="gap-4">
                            <PageHeader title="外观与基础设置" />
                            <div className="flex items-center justify-between px-5">
                                <span className="text-sm">深色模式</span>
                                <Switch checked={resolvedTheme === 'dark'} onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')} />
                            </div>
                            <div className="flex items-center justify-between px-5">
                                <span className="text-sm">跟随系统</span>
                                <Switch checked={false} onCheckedChange={() => setTheme('system')} />
                            </div>
                        </Card>
                    )}
                </div>
            </AppShell>
        </TooltipProvider>
    )
}
