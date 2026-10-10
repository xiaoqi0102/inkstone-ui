# Changelog

本项目的所有重要变更都记在这里。格式参考 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [0.1.0] - 2026-10-11

首个公开版本。

### 设计令牌
- 40+ 个 oklch 语义变量，浅色（`:root`）/ 深色（`html.dark`）各一套
- 配色体系：暖象牙纸面 + 深棕墨字 + 一处钢蓝（中性色暖带 55°~95°，品牌蓝冷带 248°~258°）
- 明暗两套**各自调校**：主色只动 L 通道（浅 `0.50` → 深 `0.73`），暗底上更亮才压得住
- 危险色按与 `--primary` 同构的规则映射：浅色深红、深色浅珊瑚红（深红在暗底上仅 2.4:1）
- 令牌体系通过 `@theme inline` 映射为 Tailwind 工具类

### 组件
- 原子件：Button / Badge / Card / Input / Tabs / Select / Popover / Accordion / Checkbox /
  Label / Separator / Switch / Progress / Tooltip / Field / Toaster / Chart / Calendar / MorphingDialog
- 外壳：`AppShell` / `DockNav`（悬浮胶囊导航，移动端底部横排、桌面左侧竖排）/ `PageHeader`
- 数据展示：`StatCard` / `MetricTabs` / `VirtualizedList` / `VirtualizedGrid` / `Sparkline` /
  `JsonViewer`（零依赖 JSON 树）/ `RequestDetail` + `CodeBlock`（可复制 curl）/ `SortableList`
- 通用件：`AnimatedNumber` / `CopyButton` / `IconButton`
- Provider：`UIKitProvider`（主题 + Tooltip + 吐司三层收口，漏包会导致 Tooltip 白屏）

### 交互模式
- 请求还原：字段区 + 多行请求体 + 可执行 curl
- 形变弹窗：卡片就地放大，保留列表 → 详情的空间连续性
- 虚拟滚动：1 万行实测无卡顿（三个坑：行 key 锚定、`offsetHeight` 测量、触底一次性守卫）
- 页面动作上浮：`usePageActions`（zustand），动作归页面所有

### 修复（开发期实测发现）
- **图表刻度文字不跟主题**：选择器沿用了 recharts 2 的**下划线式**类名，而依赖是 recharts 3
  （**连字符式**），整族选择器静默失效 → 刻度字恒为 `#666`。已改为按 recharts 3 真实类名取 `var(--令牌)`
- **主按钮渐变终点对比度不足**：`--accent` 过亮 + 近白文字，实测仅 2.60:1（不达 AA）→ 调整为与 `--primary` 同深度
- **深色软销毁按钮不可读**：深红当文字色在暗底上仅 2.37:1 → 改为浅珊瑚红 + 深棕字
- **浅色 Badge 成功/警告不达 AA**：`emerald-600` / `amber-600` 在暖象牙底上约 3.1:1 → 取 `700` 档

### 质量口径
- 明暗两套 × 15 对语义色 = **30 项对比度实测全部达 AA**（最低项 4.63，要求 4.5）
- `tsc --noEmit` 零错误；生产构建通过

[0.1.0]: https://github.com/xiaoqi0102/inkstone-ui/releases/tag/v0.1.0
