---
name: 功能建议
description: 提一个组件、模式或令牌层面的建议
labels: [enhancement]
body:
  - type: markdown
    attributes:
      value: |
        提之前建议先看一眼 [`docs/07-设计规范.md`](../docs/07-设计规范.md) 与
        [`docs/06-设计方案.md`](../docs/06-设计方案.md) —— 有些"缺的东西"是**故意不做**的（例如发光渐变、
        玻璃拟态、彩虹图表配色）。

  - type: dropdown
    id: kind
    attributes:
      label: 类型
      options:
        - 新组件
        - 现有组件的 Props / 行为
        - 设计令牌（颜色 / 圆角 / 阴影）
        - 交互模式
        - 文档 / 示例
    validations:
      required: true

  - type: textarea
    id: problem
    attributes:
      label: 你想解决的问题
      description: 请先讲场景，不要直接跳到"加个按钮"
    validations:
      required: true

  - type: textarea
    id: proposal
    attributes:
      label: 你设想的方案
    validations:
      required: false

  - type: textarea
    id: alternatives
    attributes:
      label: 你考虑过的替代方案
      description: 例如"我用现有组件拼出来了，但…"
    validations:
      required: false

  - type: checkboxes
    id: checks
    attributes:
      label: 提交前自检
      options:
        - label: 我已搜过已有 issue 与设计规范，确认不是"故意不做"的项
          required: true
