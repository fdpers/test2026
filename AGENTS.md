# AGENTS.md — 三式命理系统 · 多智能体协作规范

本仓库由人类所有者 + 两个 AI 协作维护：**Claude Code**（云端，负责 claude.ai Artifact 发布）与 **Codex**（本机）。任何智能体修改代码前必须读完本文件。

## 项目地图

`sanshi/` 下是六个**零依赖单文件 HTML** 站点（内联全部 CSS/JS，无任何外部请求）：

| 文件 | 站点 | 角色 | 线上地址（仅 Claude 可重新发布） |
|---|---|---|---|
| knowledge-tree.html | 知识树·太极场 | 世界观总纲 | claude.ai/code/artifact/9bf13c6a-e392-47fe-850b-23b854fd84cd |
| ziwei.html | 紫微斗数 | 排盘+辞典（命盘几何） | .../0c6878a9-dbb4-4ae8-8ea9-3e78c6e7fe34 |
| bazi.html | 四柱八字 | 排盘+辞典（时间代数） | .../6804e7fd-a907-45e2-b9a7-e9854c1046f2 |
| qimen.html | 奇门遁甲 | 排盘+辞典（时空博弈） | .../1a782ec6-8480-4f66-97fb-dd642e806914 |
| huitong.html | 三式会通 | 交叉验证+指引+档案库 | .../04c5eb5b-2d3b-47d4-ade7-d554acd6d988 |
| academy.html | 三式研习院 | 课程+五步分析法+自测 | .../284b7b47-a9f5-4eb3-aa6a-6e6c102d3a5c |

## 不可破坏的约束（红线）

1. **发布产物单文件自包含**：Claude Artifact 使用的六站发布产物必须保持单文件、无 CDN、无外部字体、无外部请求。源码允许使用可重复的构建步骤和本地片段；Vercel 可生成带同源 `/api` 网关的增强版，但不得改变 Artifact 离线版，也不得让两份课程内容手工分叉。
2. **双主题**：所有颜色走 CSS 自定义属性；`@media (prefers-color-scheme)` 提供默认，`:root[data-theme="dark"|"light"]` 覆盖必须双向生效。改样式后两种主题都要过目。
3. **认识论护栏不可删**：每站的 `.guard` 护栏区块（"启发装置而非检验装置"）是产品立场，只可改进措辞，不可移除或弱化。
4. **引擎代码多处复制**：天文函数（jdUT/sunLon/termJD/newMoonJDE）与排盘引擎在 bazi/qimen/huitong 间有意重复（单文件约束所致）。**修一处算法必须同步修所有副本**：
   - jdUT/sunLon/termJD → bazi.html、qimen.html、huitong.html
   - 八字引擎 → bazi.html、huitong.html（精简版）
   - 紫微引擎 → ziwei.html、huitong.html（精简版）
   - 奇门引擎 → qimen.html、huitong.html（精简版）
   - newMoonJDE/solarToLunar → 仅 huitong.html
5. **用户数据默认只存 localStorage**：不得加入自动上传或遥测。档案库键 `huitong-vault`、反馈键 `huitong-fb-*`、课程键 `academy-weeks`、成绩键 `academy-quiz-best`——改键名等于清空用户数据，禁止。AI 功能只能发送用户在当次请求中明确勾选的上下文，发送前必须展示摘要；未勾选的进度、成绩与笔记不得序列化进请求。

## 算法测试锚点（改引擎后必须全绿）

- 日柱双锚：1949-10-01=甲子日；2000-01-01=戊午日（公式 `(JDN+49)%60`）
- 八字：1990-06-15 12:30 → 庚午 壬午 辛亥 甲午；2024-02-04 立春 16:2x 前后年柱切换癸卯/甲辰
- 紫微：土五局初一紫微在午；天府=(16−紫微)%12；庚年四化=太阳武曲太阴天同
- 奇门：阳一局甲子日甲子时=伏吟（值符天蓬落一宫）；阴九局地盘戊在九宫；中五宫旬首→值符天禽/值使死门
- 农历：2000-02-05 / 2024-02-10 / 1990-01-27 均为正月初一
- 五行色板（八字/会通计量条）已过 CVD 验证：亮 #2F8F4E/#C23B2A/#9A7410/#1F86B4/#4159C4，暗 #3FA164/#E06A50/#BD8820/#2C9CC2/#6E8FE8——不要随手改

## 如何跑测试

```bash
npm i playwright   # 首次；并确保有 Chromium（npx playwright install chromium）
cd sanshi/tests
node zwtest.cjs && node bztest.cjs && node qmtest.cjs   # 三式引擎
node vaulttest2.cjs && node acatest.cjs                  # 会通档案库 / 研习院
node lunartest2.cjs                                      # 农历换算
```
测试脚本默认 `executablePath: '/opt/pw-browsers/chromium'`（Claude 云端路径）；本机 Codex 请改为 `chromium.launch({})` 用 playwright 自带浏览器，或设环境变量。允许提交这类本地化适配（用环境变量而非写死路径）。

## 设计体系（各站视觉身份）

共同：宋体系 display（Source Han Serif SC 栈）+ 无衬线正文 + mono 数据；圆角 10–14px 面板；`.guard` 斜纹护栏框。
各站强调色：知识树=玉/靛/铜/金+青灰地脉；紫微=夜空紫 `--purple`；八字=朱砂 `--cinnabar`+五行五色；奇门=青铜 `--bronze`/锈绿 `--patina`；会通=水鸭青 `--teal`+三系色(紫/朱/铜)；研习院=书院靛 `--indigo`+竹绿 `--bamboo`。跨站改动保持这一家族感。

## 协作流程

- **唯一章程**：本文件是协作规则的唯一来源；`WORKLOG.md` 只记录状态，不另立规则。
- **先认领再修改**：每个完整改动使用唯一操作编号，在 `WORKLOG.md` 登记负责人、分支、版本与范围。已有进行中记录时不得重复认领。
- **分支**：Claude 用 `claude/*`（当前主工作支 `claude/elegant-dijkstra-emmcop`）；Codex 用 `codex/*`。不要直接互改对方分支，通过 PR 或让人类合并。
- **提交信息**：中文一行摘要 + 空行 + 变更点列表；引擎改动必须注明"已跑测试锚点"。
- **版本与 CHANGELOG**：每个合并的 logical operation 只提升一次 `VERSION`，并在 `sanshi/CHANGELOG.md` 记录版本和操作编号；同一操作的中间提交不重复升版。
- **发布元数据**：`VERSION`、`release.json`、`WORKLOG.md`、CHANGELOG 与 Git tag 必须一致；构建提交号在构建时注入生成产物，禁止写入会自引用的跟踪文件。
- **门禁**：所有既有 `sanshi/tests/*.cjs` 引擎锚点、AI 测试、离线/增强产物边界和版本检查必须全绿后才能合并。
- **发布**：claude.ai Artifact 只有 Claude 能重发（同 URL 覆盖）。Codex 改完推分支后，在 CHANGELOG 标注"待 Claude 发布"；或者走 GitHub Pages（Codex 可自行配置 `.github/workflows` 发布 `sanshi/`，与 Artifact 互为镜像）。
- **内容红线**：命理断语文案可以润色，但不得把"假设/自省"语气改成"预测/断言"语气——这是产品的认识论立场。

## 待办池（两个 agent 都可认领，认领时在 CHANGELOG 注明）

- [ ] 八字站：流年层（命—运—岁三层叠加）
- [ ] 紫微站：大限四化叠加显示、星曜庙旺表
- [ ] 奇门站：十干克应全表、置闰法切换开关
- [ ] 会通站：档案对比视图（两份档案并排）
- [ ] 研习院：错题本（自测错题自动归档复习）
- [ ] 工程：抽取共享引擎为 `sanshi/lib/engine.js` + 构建脚本内联注入（解决多副本同步问题，需保住"产物仍是单文件"）
