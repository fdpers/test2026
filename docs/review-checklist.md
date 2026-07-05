# Claude 代码审查清单 · AI 网关与研习对话

> 作者：Claude（云端审查方）· 适用操作：OP-20260705-001（目标 v1.1.0）及后续 AI 相关变更
> 用法：Codex 推 PR 后，所有者对 Claude 说“审 PR”（附 PR 号/分支名）。Claude 以只读权限拉取核对，逐条标 ✅/⚠️/❌，末尾给“可合并 / 需改后再审”结论。
> 维护：本清单随产品演进增补；改动本文件视为一次 logical operation，按 AGENTS.md 登记。

---

## A. 密钥与安全（最高优先级，任一不过即打回）

- [ ] `AI_API_KEY` 只从环境变量读取；全仓库与 Git 历史中无真实密钥（前端产物、日志、注释均无）
- [ ] `.gitignore` 含 `.env` / `.env.*` / `*.key`；仓库仅有 `.env.example`（占位符，无真实值）
- [ ] 浏览器侧拿不到 provider 密钥；访问口令存 `sessionStorage`，非 `localStorage`
- [ ] 访问口令服务端用时间恒定（timing-safe）比较
- [ ] 模型输出按不可信文本渲染，不执行返回的 HTML/JS；错误信息不回传原始 provider 报文

## B. 隐私（产品立场的技术兑现）

- [ ] 未勾选的进度/成绩/笔记绝不进入 payload——有专门测试断言此点
- [ ] 发送前“本次将发送什么”摘要与实际序列化请求体一致
- [ ] progress / quiz / notes 三者默认关闭

## C. 认识论护栏（产品的灵魂）

- [ ] `sanshi/ai/system-prompt.md` 与 Claude 交付的 canonical v1 逐字一致，校验和已记录
- [ ] 系统提示词固定前置、用户不可覆盖；`release.json` 的 `promptVersion` 与之对应
- [ ] 六站 `.guard` 护栏区块仍在，措辞未被弱化成“预测/断言”

## D. 不破坏既有（回归）

- [ ] 六站 `sanshi/tests/*.cjs` 引擎锚点全绿（日柱双锚 / 紫微天府镜像 / 奇门伏吟 / 农历换算）
- [ ] 五页签、双主题、十二周进度、十五题自测无回归
- [ ] localStorage 既有键名未改（`huitong-vault` / `huitong-fb-*` / `academy-weeks` / `academy-quiz-best`）
- [ ] 新键用带版本后缀（`academy-ai-sessions-v1` 等），不与旧键冲突

## E. 架构边界

- [ ] 渐进增强：无网关时 AI 入口自动隐藏，课程仍是完整离线体验
- [ ] 同一份站点文件可同时服务 Vercel / Pages / Artifact，无内容手工分叉
- [ ] Artifact 离线版未被塞入任何外部请求（CSP 不被削弱）
- [ ] 网关 `/api` 为同源；CORS 限定在配置的生产与本地来源

## F. 版本纪律

- [ ] `VERSION` / `CHANGELOG.md` / `release.json` / `WORKLOG.md` / `v1.1.0` tag 五处一致
- [ ] 构建注入的提交号未写入会自引用的跟踪文件

---

### 审查产出格式

对每条标注 ✅ 通过 / ⚠️ 存疑 / ❌ 不过；⚠️ 与 ❌ 附文件路径:行号与修复建议；
末尾给一句结论：**可合并** 或 **需改后再审**（附必改项清单）。
