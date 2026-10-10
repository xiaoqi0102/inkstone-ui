---
name: Bug 报告
description: 报告一个可复现的问题
labels: [bug]
body:
  - type: markdown
    attributes:
      value: |
        感谢反馈！请尽量填全下面几项 —— 尤其是**复现步骤**和**环境版本**，
        没有这两项通常没法定位。

        ⚠️ 安全漏洞请**不要**在这里提交，见 [SECURITY.md](../SECURITY.md)。

  - type: input
    id: version
    attributes:
      label: inkstone-ui 版本 / 提交
      placeholder: 例如 0.1.0，或 commit sha
    validations:
      required: true

  - type: textarea
    id: env
    attributes:
      label: 环境
      value: |
        - Node：
        - npm：
        - React：
        - Tailwind CSS：
        - 浏览器 / 系统：
    validations:
      required: true

  - type: textarea
    id: steps
    attributes:
      label: 复现步骤
      placeholder: |
        1. 接入方式（源码包 / 挑件复制）
        2. 用的哪个组件、哪段 props
        3. 做了什么操作
        4. 看到什么
    validations:
      required: true

  - type: textarea
    id: expected
    attributes:
      label: 期望行为
    validations:
      required: true

  - type: textarea
    id: actual
    attributes:
      label: 实际行为（含报错栈 / 截图）
    validations:
      required: true

  - type: dropdown
    id: theme
    attributes:
      label: 主题
      options:
        - 浅色
        - 深色
        - 两套都有问题
        - 不涉及
    validations:
      required: true

  - type: checkboxes
    id: checks
    attributes:
      label: 提交前自检
      options:
        - label: 我已确认接线完整（`optimizeDeps.exclude` + `tokens.css`/`base.css` + `@source` 三处）
          required: true
        - label: 我已搜过已有 issue，没有重复
          required: true
