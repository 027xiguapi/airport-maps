# 全球机场地图 · Global Airport Maps

全球机场导航站点：按国家 / 地区浏览机场，查看每座机场的**航站楼平面示意图**、登机口范围、主要航司、地面交通与航站楼设施。**默认语言为英语**，同时提供完整中文版，长文内容以 **Markdown** 编写。

由原来的单文件静态页面（`legacy/index.html`，哈希路由 + 内嵌 JS 数据）重构为 **Next.js App Router + PostgreSQL**：

- 机场数据存放在 PostgreSQL，页面通过 SQL 查询渲染（不再是内嵌的 JS 数组）
- 哈希路由（`#/airport/PEK`）改为真实 URL（`/en/airport/PEK`、`/zh/airport/PEK`），可被抓取、可分享、可被搜索引擎收录
- 新增服务端渲染的分页目录、国家筛选与排序、站点地图与结构化数据
- 新增语言切换、hreflang、按语言生成的站点地图
- 新增 Markdown 内容系统（机场指南与 about / privacy / terms 页面）

## 技术栈

| 层 | 选型 |
| --- | --- |
| 框架 | Next.js 16（App Router、Server Components、ISR） |
| 语言 | TypeScript |
| 数据库 | PostgreSQL 13+（drizzle-orm + drizzle-kit 管理表结构，`pg` 连接池；检索、分页、机场详情等复杂查询仍是手写 SQL） |
| 国际化 | 自建轻量方案：类型安全的消息目录 + `[locale]` 路由段 + proxy |
| Markdown | `react-markdown` + `remark-gfm`（渲染为 React 元素，不注入 HTML） |
| 样式 | Tailwind CSS v4（CSS-first：单一 `app/globals.css`，`@layer components` + `@apply`，暗色主题用 `@variant dark`） |
| 检索 | `pg_trgm` GIN 索引 + 分级相关性排序 |

## 快速开始

前置条件：Node.js 20+、可访问的 PostgreSQL 13+ 实例。

```bash
npm install
cp .env.example .env.local     # 按需修改 DATABASE_URL
npm run db:reset               # 建库 + 建表（迁移）+ 扩展/触发器/视图 + 灌入数据（含双语内容）
npm run dev                    # http://localhost:3000
```

生产构建：

```bash
npm run build && npm start
```

如果 3000 端口被占用：`PORT=3100 npm run dev`。

## 环境变量

| 变量 | 必填 | 说明 |
| --- | --- | --- |
| `DATABASE_URL` | 是 | PostgreSQL 连接串 |
| `NEXT_PUBLIC_SITE_URL` | 建议 | 站点对外地址，用于 `canonical`、`hreflang`、Open Graph、`sitemap.xml`、`robots.txt` 与 JSON-LD。默认 `http://localhost:3000` |
| `PGPOOL_MAX` | 否 | 连接池上限，默认 `10` |

## npm 脚本

| 脚本 | 作用 |
| --- | --- |
| `npm run dev` / `build` / `start` | 开发 / 构建 / 启动 |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:setup` | 初始化数据库：建库（若不存在）→ `db:extensions.sql` → `db:migrate` → `db/custom.sql`。脚本化、无交互，适合新环境首次初始化 |
| `npm run db:reset` | 删库重建 → 上面的初始化 → `db:seed`（**会丢掉库里现有数据**） |
| `npm run db:push` | `drizzle-kit push`：把 `db/schema.ts` 直接推到库，改表最快的开发路径（执行前会列出语句并确认） |
| `npm run db:generate` | `drizzle-kit generate`：按 `db/schema.ts` 的改动生成迁移文件到 `drizzle/` |
| `npm run db:migrate` | `drizzle-kit migrate`：应用 `drizzle/` 下的迁移（`db:setup` / `db:reset` 用的就是它） |
| `npm run db:studio` | `drizzle-kit studio`：在浏览器里浏览 / 编辑数据 |
| `npm run db:create` | 只建库（`--reset` 为 `DROP DATABASE ... WITH (FORCE)` 后重建） |
| `npm run db:extensions` | 只跑 `db/extensions.sql`（`pg_trgm`），必须在建表**之前** |
| `npm run db:custom` | 只跑 `db/custom.sql`（`search_blob` 触发器、`directory_stats` 视图），必须在建表**之后** |
| `npm run db:seed` | 重建数据（先 TRUNCATE，可重复执行），含翻译校验 |
| `npm run db:verify` | 跑一遍站点依赖的关键查询 |
| `npm run data:world-airports` | 从 `data/world-airports.csv` 生成地图数据：`public/data/world-airports.json`（前端加载）与 `lib/world-airports-meta.json`（构建期统计） |
| `node scripts/check-maps.mjs [--table]` | 检查 `public/maps` 封面图与机场的覆盖情况：哪些机场缺图、哪些图没有对应机场 |
| `node scripts/check-search.mjs [词...]` | 检查搜索相关性排序与通配符转义 |
| `node scripts/analyze-shot.mjs <图片> [列数]` | 无法直接查看图片时，从像素里读出设计稿的结构：调色板、横向分区带、亮度与边缘 ASCII 图 |

## 数据库与迁移（Drizzle）

**表结构的唯一来源是 `db/schema.ts`**（`drizzle-orm/pg-core`）：7 张表、全部索引、唯一约束、外键与 CHECK 都写在这里。`drizzle/` 是 `db:generate` 生成的迁移与快照，**需要提交**；`drizzle.config.ts` 负责加载 `.env.local` 并把 `DATABASE_URL` 交给 drizzle-kit（drizzle-kit 自己不读 `.env.local`）。

有三种对象 Drizzle 表达不了，放在两个 `.sql` 里，按顺序应用：

| 文件 | 内容 | 时机 |
| --- | --- | --- |
| `db/extensions.sql` | `pg_trgm` 扩展（`gin_trgm_ops` 索引依赖它） | 建表**之前** |
| `db/custom.sql` | `airports_search_blob_trg` 触发器、`directory_stats` 视图 | 建表**之后** |

`directory_stats` 在 `db/schema.ts` 里以 `.existing()` 声明：Drizzle 可以查询它，但不会去建或删它（所以 `db:push` 不会误删视图和触发器）。

两种把 `db/schema.ts` 落到库里的方式，按场景选一种、不要在同一个库上反复横跳：

- **开发期改表**：`npm run db:push`。最快，代价是没有迁移记录；执行前 drizzle-kit 会列出将执行的语句并要求确认，CI 等非交互环境加 `--force`。
- **需要可追溯 / 部署到其他环境**：改完 `db/schema.ts` 跑 `npm run db:generate`，审阅 `drizzle/*.sql` 后提交，再 `npm run db:migrate`。`npm run db:setup` / `db:reset` 走的是这条路径。

查询层保持手写 SQL（`lib/queries.ts`）：分页目录、搜索相关性排序、机场详情页分别用到窗口函数、`LATERAL` + `json_agg`、`ESCAPE` 转义的 `ILIKE`，用 SQL 写更好读也更好审。`lib/db.ts` 在同一个连接池上另外导出了 `getDb()`（已挂 `db/schema.ts`），新写的、不需要上述技巧的查询可以直接用 ORM。

> 与重构前的 `db/schema.sql`（已删除，见 git 历史）相比，库结构完全等价，**只有外键约束名不同**：Drizzle 生成 `<表>_<列>_<引用表>_<引用列>_fk`（如 `airports_country_code_countries_code_fk`），PostgreSQL 默认是 `<表>_<列>_fkey`。名称不影响行为。

## 多语言

### 语言与路由

| 语言 | 前缀 | 说明 |
| --- | --- | --- |
| English | `/en` | **默认语言**，`x-default` 指向它，根地址进入它 |
| 中文 | `/zh` | 完整中文版 |

- **所有页面都在 `/en` 或 `/zh` 之下。** 不带语言前缀的地址会被重定向一次：
  - `/` → `/en`（首页固定进默认语言，作为稳定入口，**不受 `Accept-Language` 影响**）
  - `/airport/PEK` → `/en/airport/PEK`（重构前的旧地址继续可用，308 永久跳转）
  - `/de/airport/PEK` → `/en/airport/PEK`（不支持的两位语言前缀会被剥离，而不是 404）
- 对于深层裸路径（均为重构前的旧地址），访问过某个语言后 `preferred-locale` Cookie 会记住选择；未设置时按 `Accept-Language` 判断。例如中文浏览器访问 `/airport/PEK` 会进入 `/zh/airport/PEK`。
- `proxy.ts`（Next 16 之前的 `middleware.ts`）负责上述重定向，并跳过 `/api`、`/_next` 与带扩展名的静态文件。
- 每页都输出 `hreflang`（`en`、`zh-CN`、`x-default` → `/en`）与按语言区分的 `canonical`；`sitemap.xml` 为每个地址列出全部语言版本。
- 页头右上角有语言切换器（English 在前）：用 `<details>` 实现，**无 JS 也能用**，并且会停留在当前浏览的机场或国家，不会跳回首页。
- `/api/search` 不带 `locale` 参数时按默认语言（英语）返回结果。

### 添加一种语言

1. 在 `lib/i18n/config.ts` 的 `LOCALES` 中加入语言代码（顺序即语言切换器中的显示顺序），并补上 `LOCALE_META` 条目（`label`、`htmlLang`、`ogLocale`、`acceptLanguage`）。该文件还定义了 `DEFAULT_LOCALE`（站点主语言，当前为 `en`）与 `SOURCE_LOCALE`（新内容首先用哪种语言撰写，当前为 `zh`，仅用于内容回退）。
2. 新建 `lib/i18n/messages/<code>.ts`，类型为 `Messages`（派生自中文目录）。**漏译或拼错的键会直接编译失败。**
3. 在 `lib/i18n/index.ts` 的 `CATALOGS` 中注册。
4. 新建 `content/<code>/` 目录，放入 Markdown 内容与 `terminology/<code>.json` 术语表。
5. 在 `scripts/seed.mjs` 的 `SEED_LOCALES` 中加入该语言，然后 `npm run db:reset`。

路由、`generateStaticParams`、`hreflang`、站点地图与语言切换器都会自动跟随 `LOCALES`，无需改动页面代码。

### 默认语言与内容源语言是两件事

`lib/i18n/config.ts` 里有两个独立的常量：

| 常量 | 当前值 | 作用 |
| --- | --- | --- |
| `DEFAULT_LOCALE` | `en` | 站点主语言：根地址落点、`x-default`、消息目录的兜底 |
| `SOURCE_LOCALE` | `zh` | 新内容首先用哪种语言撰写：Markdown 指南 / 页面与机场简介的**内容回退** |

分开的原因是：把站点主语言改成英语，不应该让「某个语言缺失的译文回退到英语」——那会在中文页面显示英文文案。因此内容回退始终指向 `SOURCE_LOCALE`（中文编辑源），与 UI 默认语言无关。

### 数据本地化

结构化字段按语言取值（`lib/queries.ts`）：

| 内容 | 来源 | 说明 |
| --- | --- | --- |
| 机场名称、城市、国家、区域 | `airports.name_en` / `city_en`、`countries.name_en` / `region_en` | 数据自带，直接切换 |
| 机场简介 | `airport_translations(airport_iata, locale, description_md)` | 按语言存放的 Markdown |
| 航站楼名称、登机口范围 | `terminals.name_en` / `gate_range_en` | 由 `content/terminology/en.json` 词典 + 规则翻译填入 |
| 设施 / 航站楼设施标签 | `*.label_en` | 同上（封闭词表） |
| 航司列表 | `terminals.airlines_en` | **可空**；为空时英文页面不显示该行 |
| 地面交通 | `ground_transport.name_en` / `description_en` | **可空**；为空时英文页面显示交通方式标签（Rail / Bus / Taxi …） |
| 搜索 | `airports.search_blob` | 含全部语言的名称，因此**在英文站搜索「北京」也能命中** |

两条刻意的取舍：

- **封闭词表逐条校验。** `content/terminology/en.json` 覆盖全部 49 个航站楼名称与 13 个设施标签，`npm run db:seed` 会校验完整性并在缺失时报错；登机口范围（117 种）走规则翻译（`X 廊` → `Concourse X`、`X 厅` → `Hall X`），翻译后若仍残留中日韩字符则直接失败。
- **不机翻编辑性文案。** 航司列表与地面交通名称为中文编辑内容，英文没有可用译文，因此对应字段留 `NULL`，界面回退到**与语言无关**的信息（登机口数、交通方式），**不会在英文页面显示中文**。要本地化这部分，只需在 `content/terminology/en.json` 的 `airlines` / `transit` 下补上条目，无需改代码。种子脚本最后会打印 `untranslated (en)` 统计，让缺口可见而不是静默。

英文机场简介同样是**从结构化字段生成**（航站楼数、登机口数、旅客量、距离、交通方式），而非机器翻译，便于逐句核对；有正式译文时直接替换该字段即可。

## Markdown 内容

长文内容以 Markdown 存放在 `content/`（可版本管理、可评审），结构化数据仍在 PostgreSQL。

```
content/
  terminology/en.json                    封闭词表（航站楼名、设施标签、交通方式）
  zh/airports/HKG.md                     机场指南（可选，长文）
  en/airports/HKG.md
  zh/countries/JP.md                     国家 / 地区机场介绍（可选，长文）
  en/countries/JP.md
  zh/pages/{about,privacy,terms}.md      静态页
  en/pages/{about,privacy,terms}.md
```

### Frontmatter

扁平 `key: value`（刻意不引入 YAML 解析器，避免内容悄悄获得多余结构）：

```markdown
---
title: 香港国际机场航站楼指南
summary: 一句话摘要，用作 meta description
updated: 2026-09-16
---

正文从这里开始，支持 **粗体**、列表、表格、引用块、行内 `code` 与链接。
```

### 渲染

- `components/Markdown.tsx` 用 `react-markdown` 渲染成 **React 元素**（不注入 HTML，因此内容无法引入脚本），并启用 `remark-gfm` 以支持表格、删除线与自动链接。
- 排版样式在 `app/globals.css` 的 `.md` 规则下，沿用站点设计系统。
- 宽表格（英文 4 列航站楼表）会被包进 `.md-table-scroll` 横向滚动容器，不会把页面撑宽。
- 外链自动加 `target="_blank" rel="noopener noreferrer"`。
- 缺失的语言会回退到默认语言（`lib/content.ts`），只有两种语言都没有该文件时才返回 `null`。

### 机场指南是可选的

`content/<locale>/airports/<IATA>.md` 存在时，机场页会多出一个「机场指南 / Airport guide」区块；不存在则整块不渲染。目前写了 4 座枢纽（HKG、SIN、LHR、JFK）的双语指南作为示范，**新增只需放一个 Markdown 文件**，无需改代码。指南内容全部取自本站数据（航站楼构成、登机口字母规律、距离、交通方式），不含臆测细节。

### 国家机场介绍同样是可选的

国家页的「机场介绍」区块**始终渲染**：开头段落由数据库字段拼出（机场数、航站楼数、登机口数、最繁忙机场、分布城市），因此 37 个国家 / 地区无需任何内容文件就有介绍。`content/<locale>/countries/<CC>.md` 存在时，长文会追加在同一段正文里（`JP.md` 是示范，同样只写本站数据）。

## 目录结构

```
app/
  [locale]/
    layout.tsx              语言布局：<html lang>、顶栏、页脚、回到顶部
    page.tsx                首页：居中搜索英雄区 + 快捷入口 → 功能分区卡片 → 机场指南 → 最近更新 → 国家网格 → 全部机场表
    airports/page.tsx       机场目录：搜索 + 国家筛选 + 排序 + 分页
    countries/page.tsx      国家索引（按区域分组，含区域跳转条）
    country/[code]/page.tsx 单个国家 / 地区：机场介绍 + 机场列表 + 相关链接 + 常见问题（右侧目录导航）
    airport/[code]/page.tsx 机场详情：示意图、指南、航站楼、交通、设施、FAQ
    {about,privacy,terms}/  由 Markdown 渲染的静态页（共用一个组件）
    error.tsx not-found.tsx 错误边界与 404（客户端组件，从 pathname 推断语言）
  api/search/route.ts       搜索联想接口（支持 ?locale=）
  sitemap.ts robots.ts      多语言站点地图与抓取规则
  globals.css               唯一样式表（Tailwind v4 CSS-first）：设计令牌 + 全部组件样式
components/                 UI 组件（服务端为主；搜索框、语言切换、返回顶部为客户端）
lib/
  i18n/config.ts            语言注册表、locale 工具、localizedPath
  i18n/messages/{zh,en}.ts  消息目录（中文为形状来源，英文按类型校验）
  i18n/index.ts             getMessages、hreflang alternates
  db.ts queries.ts types.ts 连接池（含 getDb()）/ 全部 SQL / 类型
  content.ts                Markdown 读取与 frontmatter 解析
  format.ts                 按语言的旅客量、距离、数字、日期格式化
  terminal-map.ts           航站楼示意图 SVG（含本地化标注）
  icons.tsx                 图标组件
  params.ts site.ts         searchParams 辅助 / 站点常量
db/schema.ts                Drizzle 表结构（表、索引、约束）——结构的唯一来源
db/extensions.sql           pg_trgm 扩展（建表前应用）
db/custom.sql               search_blob 触发器与 directory_stats 视图（建表后应用）
drizzle.config.ts           drizzle-kit 配置（含 .env.local 加载）
drizzle/                    生成的迁移与快照（需提交）
data/world-airports.csv     全球机场原始数据（OurAirports 格式，首页地图数据的输入）
content/                    Markdown 内容与术语表
proxy.ts                    语言重定向（Next 16 的 middleware）
scripts/                    提取、建库、灌数、自检脚本
legacy/index.html           重构前的单文件版本（保留备查）
```

## 数据模型

```
countries            国家 / 地区（code、中文名、name_en、region、region_en、国旗）
airports             机场（iata、slug、中英文名、城市、登机口数、年旅客量、
                     距市中心、更新时间、search_blob）
airport_translations 机场简介（按语言存放的 Markdown）
terminals            航站楼（代码、中英文名、登机口范围（含英文）、登机口数、
                     主要航司（含英文）、是否卫星厅）
terminal_amenities   航站楼设施（label + label_en）
airport_facilities   机场整体设施（label + label_en）
ground_transport     地面交通（name/description + 英文列，可空）
```

设计取舍：

- **`annual_pax_m` / `distance_km` 用数值列**，而不是原样的 `"约6700万"` / `"25 km"` 文本。这样首页「热门机场城市」才能按吞吐量真正排序；展示时再由 `lib/format.ts` 按语言还原（中文「约 6,700 万」/「1.08 亿」，英文「about 67 million」）。
- **`search_blob` 由触发器维护**，聚合 IATA 与各语言名称，配合 `pg_trgm` GIN 索引支撑跨语言模糊检索。
- **`is_satellite`** 由航站楼名称是否含「卫星」推导。原静态版本的 `terminalMapSVG` 里写好了卫星厅画成圆形的分支但从未触发；现在 8 座卫星厅会真实渲染为圆形指廊。
- **`updated_at` 决定「最近更新」**。原版本这一栏用的是硬编码 IATA 列表，其中 OKC、HPN 并不在数据集里，实际只渲染出 3 条；现在按 `updated_at` 倒序查询。

## 站点地图与 SEO

- 每个语言 × 每个机场 / 国家都是预渲染页面（`generateStaticParams`），按 `revalidate = 3600` 每小时增量再生成；构建时共生成 212 个页面（默认语言为英语，`x-default` 指向 `/en`）
- `<title>` / `description` 按语言与机场数据生成
- 结构化数据：`WebSite` + `SearchAction`（首页）、`Airport` + `BreadcrumbList` + `FAQPage`（机场页）、`Country` + `ItemList` + `BreadcrumbList` + `FAQPage`（国家页），均带 `inLanguage`
- 机场页 FAQ 由数据库字段按语言生成（航站楼构成、距市中心距离、如何进市区、设施、所属城市国家），同时用于页面展示与 `FAQPage` 富结果
- 国家页 FAQ 同样由数据库字段生成（收录机场清单、最繁忙机场、航站楼与登机口总数、分布城市、是否有航站楼地图）
- `sitemap.xml` 收录全部地址的两种语言版本并附带 `xhtml:link` alternates；`robots.txt` 屏蔽 `/api/`

URL 约定：

| URL | 说明 |
| --- | --- |
| `/zh/airport/PEK`、`/en/airport/PEK` | 机场页的规范地址（大小写不敏感） |
| `/airport/beijing-capital-international-airport-pek` | 描述性 slug，308 跳到当前语言的规范地址 |
| `/zh/country/CN` | 国家 / 地区页 |
| `/zh/airports?country=US&sort=name&page=2` | 目录筛选 / 排序 / 分页，全部是普通链接与 GET 表单，无 JS 也可用 |

## 从原静态版本迁移

`scripts/extract-legacy.mjs` 从 `legacy/index.html` 解析出原来的 `COUNTRIES` 与 `AIRPORTS` 字面量，校验后写入 `scripts/legacy-data.json`（37 个国家 / 地区、60 座机场、174 座航站楼）。`scripts/seed.mjs` 再灌进数据库，并在过程中校验：国家代码存在、每座机场至少一座航站楼、旅客量与距离可解析、各航站楼登机口数之和与机场总数是否有出入、翻译词表是否完整。

这些脚本是一次性迁移工具，日常不需要重跑。

## 移植过程中修掉的问题

原型里的缺陷，样式部分保留在 `app/globals.css`，修正也一并写在同一个文件里并附注释：

1. **小屏无法导航**：原样式在 `max-width:820px` 时用 `display:none` 同时隐藏 `.topnav` 和 `.top-search`，窄屏下没有任何入口跳转到其他页面。现在导航变成可横向滚动的胶囊条，搜索框作为独立一栏保留在顶栏下方。
2. **列表行在小屏被裁切**：`.airport-table{overflow:hidden}` + `img{max-width:100%}` 落在 `auto` 轨道上使国旗列塌缩为 0 宽并把按钮挤到第二行；`.nm` 缺少 `min-width:0`，超长机场名（nowrap）会把行撑出容器。
3. **地面交通图标配色失效**：`.transit-row span`（0,1,1）优先级高于 `.transit-icon`（0,1,0），把图标重新刷成了 `--ink-soft` 灰色，而不是设计意图的 `--sky-600`。
4. **「最近更新」缺条目**：见上文 `updated_at` 说明。
5. **长文案下的横向溢出**：加入英文后，多处布局被更长的英文文案撑破（国家卡片的计数徽章、`.related-card` 的 nowrap 机场名、`minmax(300px,1fr)` 的网格轨道下限、「最近更新」行的固定列、区块标题与「more」链接同一行等）。全部在 320 / 360 / 390 / 480 / 640 / 768 / 1024 / 1280 / 1440px 两种语言下实测修正，现在**无横向溢出**。这类问题在任何「中文站加语言」的场景都会出现，修法都写在 `app/globals.css` 的注释里。

## 首页结构

首页按「先搜索、再分区导航」组织：

1. **搜索英雄区**（深色）：居中的标题、副标题、760px 宽的搜索框、六个常用机场快捷入口，以及国家 / 机场 / 航站楼三个统计。
2. **功能分区**（浅色，`#browse`）：六张卡片，每张都指向一个**真实可用的目的地**，而不是装饰：
   | 卡片 | 目的地 | 角标 |
   | --- | --- | --- |
   | 全部机场 | `/airports` | 机场总数 |
   | 按国家浏览 | `/countries` | 国家 / 地区数 |
   | 按区域浏览 | `/countries#regions` | 区域数 |
   | 热门机场城市 | `#popular`（本页锚点） | 城市数 |
   | 最近更新 | `/airports?sort=updated` | — |
   | 机场指南 | `#guides`（本页锚点） | 有指南的机场数 |
3. **机场指南**（`#guides`）：为有 Markdown 指南的机场生成卡片，无指南时整段不渲染。
4. **最近更新**、**按国家分类**、**全部机场** 三个列表区。

卡片角标里的数字全部来自数据库（`getStats` / `getCityCount` / `getRegionCount`）与内容目录（`listGuidedAirports`），不会写死。

`/countries` 现在按区域分组，并带一条区域跳转条；每个区域块标注该区域的国家数与机场数。

> 首页改造时用像素分析定位到两个问题并已修正：装饰用的航站楼小卡片在 1280/1440px 下与搜索框重叠（已移除）；`.hero h1` 有 `max-width`，仅靠 `text-align:center` 会让标题块仍靠左、文字中心比搜索框偏左约 240px（已加 `margin:auto`）。现在英雄区内所有元素的中心线完全一致。

## 404 行为说明

404 页面有一处 Next App Router 的固有限制，值得记录下来：

- **未匹配任何路由的地址**（例如 `/en/nope`）走根级 `app/not-found.tsx`，**完整服务端渲染**，无需 JavaScript 即可看到带样式的 404。
- **路由存在但参数无效**（例如 `/en/airport/ZZZ`）会返回 **HTTP 404**，但 404 内容通过 RSC 流下发、在客户端渲染：Next 在按需渲染这类页面时已经先输出了 HTML 外壳，此时抛出的 `notFound()` 无法再改写已发出的 HTML。
- 实测确认：not-found 文档位于 `app/[locale]/layout.tsx` **之外**，因此拿不到语言参数、没有顶栏页脚，也不能使用 `headers()`（会让整个 `[locale]` 段落变成动态渲染、失去 212 个预渲染页面），更无法渲染任何客户端组件（连 `next/link` 都不产出 HTML）。所以 404 文案是**中英双语**的，并用普通 `<a>` 与 GET 表单实现，`components/NotFoundContent.tsx` 顶部注释记录了这些约束。

选择保留正确的 404 状态码，而不是用 200 换取「服务端渲染的漂亮 404」——后者会被搜索引擎判为 soft 404。

## 部署提示

- `name` 排序依赖数据库排序规则。本机 PostgreSQL 使用 `Chinese (Simplified)_China.936`，因此中文机场名按拼音排序；英文站按 `name_en` 排序。若部署环境 collation 不同，中文排序顺序会随之变化
- 构建阶段会访问数据库预渲染全部页面，因此 `npm run build` 需要可用的 `DATABASE_URL`
- 上线前请设置 `NEXT_PUBLIC_SITE_URL`，否则 `canonical`、`hreflang`、`sitemap.xml` 与结构化数据会指向 `localhost`
- 站点主语言由 `DEFAULT_LOCALE` 决定，切换它只需改一处；根地址重定向、`x-default`、站点地图与切换器顺序都会跟随

## 数据来源说明

航站楼平面示意图是按航站楼数量、登机口规模与地面交通节点自动绘制的**示意图**，用于快速理解机场整体布局与航站楼之间的关系，不是精确到米的实测平面图。航站楼数量、登机口数量、主要航司、年旅客量与地面交通信息整理自公开资料，可能随机场改扩建发生变化。
