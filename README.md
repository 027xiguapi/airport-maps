# 全球机场地图 · World Airport Maps

全球机场导航站点（生产域名 **worldairportmap.com**）：按国家 / 地区浏览 **363 座机场、92 个国家 / 地区**，查看每座机场的**航站楼平面示意图**、登机口范围、主要航司、地面交通与设施；可交互的**直飞航线图**与目的地列表；三个地理计算工具；以及用 **Markdown** 维护的长文（63 篇机场指南、37 篇国家介绍）。**默认语言为英语**，同时提供完整中文版。

由原来的单文件静态页面（`legacy/index.html`，哈希路由 + 内嵌 JS 数据）重构为 **Next.js App Router + PostgreSQL**：

- 机场数据存放在 PostgreSQL，页面通过 SQL 查询渲染（不再是内嵌的 JS 数组）
- 哈希路由（`#/airport/PEK`）改为真实 URL（`/airport/PEK`、`/zh/airport/PEK`），可被抓取、可分享、可被搜索引擎收录
- 新增服务端渲染的目录（搜索 / 国家筛选 / 排序 / 分页）、站点地图、结构化数据与按语言的 FAQ
- 新增交互式航线图页（地图 + 目的地表 + CSV/JSON 下载）、三个地理计算工具页
- 新增语言切换、hreflang、按语言生成的站点地图
- 新增 Markdown 内容系统（机场指南、国家介绍与 about / privacy / terms 页面）

## 站点结构

| URL | 说明 |
| --- | --- |
| `/`、`/airport/PEK` | 首页与机场详情页（默认语言英语，裸路径即规范地址） |
| `/zh/...` | 同一批页面的中文版 |
| `/airports` | 机场目录：搜索 + 国家筛选 + 排序 + 分页（普通链接与 GET 表单，无 JS 也可用） |
| `/countries`、`/country/CN` | 国家索引（按区域分组）与单个国家 / 地区页 |
| `/route/PEK` | 航线图页：直飞目的地的航线地图 + 目的地表 + CSV/JSON 下载 |
| `/tool`、`/tool/{coordinate-converter,dms-converter,distance-calculator}` | 坐标转换（WGS84 / GCJ02 / BD09）、度分秒转换、大圆距离计算 |
| `/about`、`/contact`、`/privacy`、`/terms` | Markdown 静态页 |
| `/api/search`、`/api/routes/[code]` | 搜索联想接口；航线数据的 CSV / JSON 导出（`?locale=` 选语言、`?format=json`） |
| `/sitemap.xml`、`/robots.txt` | 按语言列出的站点地图与抓取规则 |

## 技术栈

| 层 | 选型 |
| --- | --- |
| 框架 | Next.js 16（App Router、Server Components、ISR `revalidate = 3600`）、React 19、TypeScript |
| 数据库 | PostgreSQL 13+（drizzle-orm + drizzle-kit 管理表结构，`pg` 连接池；检索、分页、详情等复杂查询仍是手写 SQL） |
| 国际化 | 自建轻量方案：类型安全的消息目录 + `[locale]` 路由段 + `proxy.ts` |
| Markdown | `react-markdown` + `remark-gfm`（渲染为 React 元素，不注入 HTML） |
| 样式 | Tailwind CSS v4（CSS-first：单一 `app/globals.css`，`@layer components` + `@apply`，暗色主题用 `@variant dark`） |
| 地图 | Leaflet 1.9 + OpenStreetMap 瓦片（无需 API key；暗色底图靠 CSS 滤镜反相） |
| UI 基元 | 手写的 shadcn/ui 风格组件（`components/ui/*`，经 `components.json` + `lib/utils.ts` 的 `cn`） |
| 检索 | `pg_trgm` GIN 索引 + 分级相关性排序 |
| 变现 | Google AdSense（`app/[locale]/layout.tsx` 引入脚本，`public/ads.txt` 声明） |

## 快速开始

前置条件：Node.js 20+、可访问的 PostgreSQL 13+ 实例。

```bash
npm install
cp .env.example .env.local     # 按需修改 DATABASE_URL
npm run db:reset               # 建库 + 建表（迁移）+ 扩展/触发器/视图 + 灌入数据（含双语内容）
npm run dev                    # http://localhost:3003
```

`npm run dev` 与 `npm start` 都监听 **3003**（`-p 3003`）。生产构建：

```bash
npm run build && npm start
```

构建会预渲染每个语言的约 690 个页面（363 机场 + 92 国家 + 224 航线页 + 11 个固定页），因此 **`npm run build` 需要可用的 `DATABASE_URL`**。

## 环境变量

| 变量 | 必填 | 说明 |
| --- | --- | --- |
| `DATABASE_URL` | 是 | PostgreSQL 连接串 |
| `NEXT_PUBLIC_SITE_URL` | 建议 | 站点对外地址，用于 `canonical`、`hreflang`、Open Graph、`sitemap.xml`、`robots.txt` 与 JSON-LD。默认 `http://localhost:3000` |
| `PGPOOL_MAX` | 否 | 连接池上限，默认 `10`。CI / 低配库上建议调小（见「查询层与连接池」） |

## npm 脚本

| 脚本 | 作用 |
| --- | --- |
| `npm run dev` / `build` / `start` | 开发（3003）/ 构建 / 启动（3003） |
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
| `npm run db:seed` | 重建数据（先 TRUNCATE，可重复执行），含翻译与数据校验 |
| `npm run db:verify` | 跑一遍站点依赖的关键查询 |
| `npm run data:world-airports` | 从 `data/world-airports.csv` 生成地图数据：`public/data/world-airports.json`（前端加载，3244 座机场）与 `lib/world-airports-meta.json`（构建期统计） |
| `npm run data:build-directory` | 把 `data/new-airports-a.{zh,en}.json` 合并成 `scripts/directory-data.json`（目录批次的灌库输入，见「数据模型」；改完数据后接 `npm run db:seed` 生效） |
| `npm run data:route-images` | 按首页航线条目的排序，把每个机场的航线图渲染成 PNG 到 `public/route`（世界地图轮廓 + 大圆航线，经 sharp 栅格化；含反子午线处理）。默认只渲染前 12 座，且**已有文件一律跳过**（渲染慢，已提交的图是好的）；`--codes ICN,AMS` 指定机场、`--top N` 改数量、`--force` 重跑 |
| `npm run data:terminal-maps` | 按机场代码批量下载航站楼地图 PNG + PDF（默认源 eoob.com；`--codes HKG,PEK` 指定、`--dry-run` 预演、`--png-only` / `--pdf-only`、`--force`）。文件落到 `public/terminal-maps/{CODE}/`，溯源信息在 `terminal-maps-manifest.json`（当前 63 座机场） |
| `npm run data:terminal-maps:compress` | 原地压缩上一步的 PNG：量化为 8 位调色板（默认 `--quality 80`），尺寸不变，实测 52.8MB → 12.4MB 且登机口号、路名清晰可读；已压缩的自动跳过，`--force` 重压、`--max-width 1600` 可同时缩尺寸 |
| `node scripts/fetch-airport-images.mjs` | 批量下载机场封面图（`public/maps`）并记录每张图的来源、sha256 与许可说明；机场代码只能来自你自备的列表 / HTML / 库导出，脚本不爬站发现代码，默认遵守 robots.txt |
| `node scripts/check-maps.mjs [--table]` | 检查 `public/maps` 封面图与机场的覆盖情况：哪些机场缺图、哪些图没有对应机场 |
| `node scripts/check-search.mjs [词...]` | 检查搜索相关性排序与通配符转义 |
| `node scripts/calibrate-hero-map.cjs` | 重新标定首页 hero 背景图（`public/world-airport-map.jpg`）的投影常量：自相关测出地图的横向平铺周期，再用全部机场坐标拟合相位与纬度映射，输出 `components/HeroRoutes.tsx` 顶部要填的四个数字；换背景图后跑一次即可 |

`scripts/seed.mjs` 是数据入口（一次性迁移留下的 `scripts/legacy-data.json` 见文末）。

## 数据库与迁移（Drizzle）

**表结构的唯一来源是 `db/schema.ts`**（`drizzle-orm/pg-core`）：全部表、索引、唯一约束、外键与 CHECK 都写在这里。`drizzle/` 是 `db:generate` 生成的迁移与快照，**需要提交**；`drizzle.config.ts` 负责加载 `.env.local` 并把 `DATABASE_URL` 交给 drizzle-kit（drizzle-kit 自己不读 `.env.local`）。

有三种对象 Drizzle 表达不了，放在两个 `.sql` 里，按顺序应用：

| 文件 | 内容 | 时机 |
| --- | --- | --- |
| `db/extensions.sql` | `pg_trgm` 扩展（`gin_trgm_ops` 索引依赖它） | 建表**之前** |
| `db/custom.sql` | `airports_search_blob_trg` 触发器、`directory_stats` 视图 | 建表**之后** |

`directory_stats` 在 `db/schema.ts` 里以 `.existing()` 声明：Drizzle 可以查询它，但不会去建或删它（所以 `db:push` 不会误删视图和触发器）。

两种把 `db/schema.ts` 落到库里的方式，按场景选一种、不要在同一个库上反复横跳：

- **开发期改表**：`npm run db:push`。最快，代价是没有迁移记录；执行前 drizzle-kit 会列出将执行的语句并要求确认，CI 等非交互环境加 `--force`。
- **需要可追溯 / 部署到其他环境**：改完 `db/schema.ts` 跑 `npm run db:generate`，审阅 `drizzle/*.sql` 后提交，再 `npm run db:migrate`。`npm run db:setup` / `db:reset` 走的是这条路径。

## 查询层与连接池

查询层保持手写 SQL（`lib/queries.ts`）：分页目录、搜索相关性排序、机场详情页分别用到窗口函数、`LATERAL` + `json_agg`、`ESCAPE` 转义的 `ILIKE`，用 SQL 写更好读也更好审。`lib/db.ts` 在同一个连接池上另外导出了 `getDb()`（已挂 `db/schema.ts`），新写的、不需要上述技巧的查询可以直接用 ORM。

连接池的两个细节（`lib/db.ts`）值得知道：

- 池是**进程级单例**（挂在 `globalThis` 上），开发期热更新与生产多 lambda 都不会反复建池；`PGPOOL_MAX` 控制上限。
- 查询包了 `withRetry`：构建期每个 worker 各持一个池（实测 11 进程 × 最多 10 连接），会顶到 PostgreSQL 默认 `max_connections = 100`，握手可能超出 10s 的 `connectionTimeoutMillis`；没有这层重试整个构建会被一条连接超时打断。

## 数据模型

7 张表，当前库内数据量：

```
countries             92 行   国家 / 地区（code、中文名、name_en、region、region_en、国旗）
airports             363 行   机场（iata、slug、中英文名、城市、登机口数、年旅客量、
                              距市中心、更新时间、search_blob）
airport_translations 726 行   机场简介（按语言存放的 Markdown）
terminals            174 行   航站楼（代码、中英文名、登机口范围（含英文）、登机口数、
                              主要航司（含英文）、是否卫星厅）
terminal_amenities   413 行   航站楼设施（label + label_en）
airport_facilities            机场整体设施（label + label_en）
ground_transport     216 行   地面交通（name/description + 英文列，可空）
```

机场分两批灌入（都在 `db:seed` 里完成）：

- **编辑批次（60 座）**：来自 `scripts/legacy-data.json`，带完整航站楼、设施、交通与旅客量数据——174 座航站楼全部属于这一批；
- **目录批次（303 座）**：由 `node data/build-directory-data.mjs` 从 `data/new-airports-a.{zh,en}.json` 合并生成 `scripts/directory-data.json`（zh 提供中文名 / 城市，en 提供英文名、IATA / ICAO、国家与规模，55 个新国家在生成器里维护）。这批只有名称 / 城市 / 国家 / 规模，简介由字段推导，无航站楼与旅客量（详情页自动少渲染对应区块，下载按钮走封面 / 搜索回退）；与编辑批次重叠的代码自动跳过，`updated_at` 排在编辑批次之后以保证「最近更新」栏位的顺序。

设计取舍：

- **`annual_pax_m` / `distance_km` 用数值列**，而不是原样的 `"约6700万"` / `"25 km"` 文本。这样首页「热门机场」才能按吞吐量真正排序；展示时再由 `lib/format.ts` 按语言还原（中文「约 6,700 万」/「1.08 亿」，英文「about 67 million」）。
- **`search_blob` 由触发器维护**，聚合 IATA 与各语言名称，配合 `pg_trgm` GIN 索引支撑跨语言模糊检索。
- **`is_satellite`** 由航站楼名称是否含「卫星」推导（`scripts/seed.mjs`）。原静态版本的 `terminalMapSVG` 里写好了卫星厅画成圆形的分支但从未触发；现在 8 座卫星厅会真实渲染为圆形指廊。
- **`updated_at` 决定「最近更新」**，见文末「移植过程中修掉的问题」第 4 条。

## 多语言

### 语言注册表与 URL 方案

`lib/i18n/config.ts` 的 `LOCALES` 注册了 24 个语言代码（顺序即语言切换器顺序），但**只有 `lib/i18n/catalogs.ts` 里登记了消息目录的语言才真正发布**——当前是 `en` + `zh`。未发布的前缀会被剥掉并跳到访客的最佳可用语言，而不是 404，也不会出现「同一批英文页面挂在 /es 下」的重复收录。

URL 方案（与生产站点地图一致）：

| 地址 | 行为 |
| --- | --- |
| `/`、`/airport/PEK` | **默认语言（英语）的规范地址**，`proxy.ts` 内部 rewrite 到 `[locale]` 路由，可见 URL 不变；`x-default` 指向这里 |
| `/zh/airport/PEK` | 中文页面的规范地址 |
| `/en/airport/PEK` | 旧地址，308 跳到裸路径，保证一个英文页面只有一个可收录 URL |
| `/es/...`、`/de/...` | 已注册但未发布（或任意两位语言前缀）：剥离前缀后跳到访客最佳可用语言 |
| 深层裸路径（`/airport/PEK`） | 访问过某个语言后由 `preferred-locale` Cookie 记住选择；未设置时按 `Accept-Language` 判断 |

每页都输出 `hreflang`（`en`、`zh-CN`、`x-default`）与按语言区分的 `canonical`；`sitemap.xml` 为每个地址列出全部已发布语言版本。`proxy.ts` 跳过 `/api`、`/_next` 与带扩展名的静态文件。

页头右上角的语言切换器用 `<details>` 实现（**无 JS 也能用**），每一项目标语言都是指向「当前页面等价路径」的真实链接（`components/LanguageSwitcher.tsx` 从 pathname 剥掉语言段再拼回去），既方便爬虫发现译文，也不会把访客丢回首页；点击时顺手写入 `preferred-locale` Cookie。

### 添加一种语言

1. 在 `lib/i18n/config.ts` 的 `LOCALES` 中加入语言代码，并补上 `LOCALE_META` 条目（`label`、`htmlLang`、`ogLocale`、`acceptLanguage`）。
2. 新建 `lib/i18n/messages/<code>.ts`，类型为 `Messages`（派生自中文目录）。**漏译或拼错的键会直接编译失败。**
3. 在 `lib/i18n/catalogs.ts` 的 `CATALOGS` 中注册——这一步才真正「发布」该语言。
4. 新建 `content/<code>/` 目录，放入 Markdown 内容与 `terminology/<code>.json` 术语表。
5. 在 `scripts/seed.mjs` 的 `SEED_LOCALES` 中加入该语言，然后 `npm run db:reset`。

路由、`generateStaticParams`、`hreflang`、站点地图、语言切换器与 AdSense 无关的页面代码都会自动跟随，无需改动页面。

### 默认语言与内容源语言是两件事

| 常量 | 当前值 | 作用 |
| --- | --- | --- |
| `DEFAULT_LOCALE` | `en` | 站点主语言：裸路径落点、`x-default`、消息目录兜底 |
| `SOURCE_LOCALE` | `zh` | 新内容首先用哪种语言撰写：Markdown 指南 / 页面与机场简介的**内容回退** |

分开的原因是：把站点主语言改成英语，不应该让「某个语言缺失的译文回退到英语」——那会在中文页面显示英文文案。因此内容回退始终指向 `SOURCE_LOCALE`（中文编辑源），与 UI 默认语言无关。

### 数据本地化

结构化字段按语言取值（`lib/queries.ts`）：

| 内容 | 来源 | 说明 |
| --- | --- | --- |
| 机场名称、城市、国家、区域 | `airports.name_en` / `city_en`、`countries.name_en` / `region_en` | 数据自带，直接切换 |
| 机场简介 | `airport_translations(airport_iata, locale, description_md)` | 按语言存放的 Markdown，当前 726 条 |
| 航站楼名称、登机口范围 | `terminals.name_en` / `gate_range_en` | 由 `content/terminology/en.json` 词典 + 规则翻译填入 |
| 设施 / 航站楼设施标签 | `*.label_en` | 同上（封闭词表） |
| 航司列表 | `terminals.airlines_en` | **可空**；为空时英文页面不显示该行 |
| 地面交通 | `ground_transport.name_en` / `description_en` | **可空**；为空时英文页面显示交通方式标签（Rail / Bus / Taxi …） |
| 搜索 | `airports.search_blob` | 含全部语言的名称，因此**在英文站搜索「北京」也能命中** |

两条刻意的取舍：

- **封闭词表逐条校验。** `content/terminology/en.json` 覆盖全部 49 个航站楼名称、13 个设施标签与 6 个交通方式，`npm run db:seed` 会校验完整性并在缺失时报错；登机口范围（117 种）走规则翻译（`X 廊` → `Concourse X`、`X 厅` → `Hall X`），翻译后若仍残留中日韩字符则直接失败。
- **不机翻编辑性文案。** 航司列表与地面交通名称为中文编辑内容，英文没有可用译文，因此对应字段留 `NULL`，界面回退到**与语言无关**的信息（登机口数、交通方式），**不会在英文页面显示中文**。要本地化这部分，只需在 `content/terminology/en.json` 的 `airlines` / `transit` 下补上条目（当前为空），无需改代码。种子脚本最后会打印 `untranslated (en)` 统计，让缺口可见而不是静默。

英文机场简介同样是**从结构化字段生成**（航站楼数、登机口数、旅客量、距离、交通方式），而非机器翻译，便于逐句核对；有正式译文时直接替换该字段即可。

## Markdown 内容

长文内容以 Markdown 存放在 `content/`（可版本管理、可评审），结构化数据仍在 PostgreSQL。

```
content/
  terminology/en.json                     封闭词表（航站楼名 49、设施标签 13、交通方式 6）
  zh/airports/HKG.md                      机场指南（63 篇，中英成对）
  en/airports/HKG.md
  zh/countries/JP.md                      国家 / 地区机场介绍（37 篇，中英成对）
  en/countries/JP.md
  zh/pages/{about,contact,privacy,terms}.md  静态页
  en/pages/...
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
- 缺失的语言回退到 `SOURCE_LOCALE`（`lib/content.ts`），两种语言都没有该文件时才返回 `null`。

### 指南与介绍都是可选的

- **机场指南**：`content/<locale>/airports/<IATA>.md` 存在时，机场页多出一个「机场指南 / Airport guide」区块；不存在则整块不渲染。当前 63 座机场有双语指南，**新增只需放一个 Markdown 文件**，无需改代码。
- **国家机场介绍**：国家页的「机场介绍」区块**始终渲染**——开头段落由数据库字段拼出（机场数、航站楼数、登机口数、最繁忙机场、分布城市），因此 92 个国家 / 地区无需任何内容文件就有介绍；`content/<locale>/countries/<CC>.md` 存在时，长文追加在同一段正文里（当前 37 个）。两边都**中英成对维护**——`getCountryIntro` 在缺英文文件时会回退到中文，只写中文会让英文页出现中文长文。

两类内容都只写本站数据（航站楼构成、登机口字母规律、旅客量、距离、交通方式），不含臆测细节。

## 目录结构

```
app/
  [locale]/
    layout.tsx              语言布局：<html lang/dir>、顶栏、页脚、AdSense 脚本、回到顶部
    page.tsx                首页：搜索英雄区 → 网站介绍 → 世界地图 → 工具 → 功能分区 → 热门 → 航线 → 指南 → 最近更新 → 国家网格
    airports/page.tsx       机场目录：搜索 + 国家筛选 + 排序 + 分页
    countries/page.tsx      国家索引（按区域分组，含区域跳转条）
    country/[code]/page.tsx 单个国家 / 地区：机场介绍 + 机场列表 + 相关链接 + 常见问题（右侧目录导航）
    airport/[code]/page.tsx 机场详情：封面 / 示意图、指南、航站楼、交通、设施、定位图、航线图（有静态渲染图时以图片为入口）、FAQ、相关链接
    route/[code]/page.tsx   航线图页：航线地图 + 目的地表 + CSV / JSON 下载 + FAQ
    tool/…                  工具目录与三个工具页（坐标转换、度分秒、距离计算）
    {about,contact,privacy,terms}/  由 Markdown 渲染的静态页
    error.tsx not-found.tsx 错误边界与 404（客户端组件，从 pathname 推断语言）
  api/search/route.ts       搜索联想接口（支持 ?locale=）
  api/routes/[code]/route.ts  单个机场的航线数据导出（CSV / JSON）
  sitemap.ts robots.ts      多语言站点地图与抓取规则
  globals.css               唯一样式表（Tailwind v4 CSS-first）：设计令牌 + 全部组件样式
components/                 UI 组件（服务端为主；搜索框、语言 / 主题切换、返回顶部、地图、lightbox 为客户端）
  airport/                  机场页与航线页的区块组件（航站楼、交通、设施、定位图、航线图、下载…）
  country/ tool/ ui/        国家页区块 / 工具骨架 / shadcn 风格基元
lib/
  queries.ts routes.ts      手写 SQL 查询层 / 航线数据与统计
  db.ts                     连接池（含 getDb() 与构建期重试）
  content.ts                Markdown 读取与 frontmatter 解析
  i18n/                     config（语言注册表）、catalogs（已发布语言）、messages/{zh,en}、index（getMessages、hreflang）
  format.ts geo-convert.ts  按语言格式化 / 坐标与距离数学（纯函数，前后端共用）
  terminal-map.ts map-images.ts route-images.ts  航站楼示意图 SVG / 封面图索引 / 航线渲染图索引
  airport-geo.ts airport-links.ts encyclopedia-links.ts 坐标时区、官网、百科外链三张静态表
db/schema.ts                Drizzle 表结构（表、索引、约束）——结构的唯一来源
db/extensions.sql           pg_trgm 扩展（建表前应用）
db/custom.sql               search_blob 触发器与 directory_stats 视图（建表后应用）
drizzle/                    生成的迁移与快照（需提交）
data/                       航线原始数据、目录批次输入、world-airports.csv
content/                    Markdown 内容与术语表
proxy.ts                    语言重写与重定向（Next 16 的 middleware）
scripts/                    提取、建库、灌数、抓取与自检脚本
legacy/index.html           重构前的单文件版本（保留备查）
```

## 航线数据与航线页

- 原始数据是 **OpenFlights 的 2014-06 快照**（ODbL，67663 条原始航线 → 62793 条直飞航线，覆盖 2643 座机场、499 家航司），由 `node scripts/fetch-routes.mjs` 生成 `data/airport-routes.json`（约 1.7MB，**只在服务端从磁盘读取，不进浏览器包**）。页面会打印数据快照日期，因为这份数据不新。
- 目的地的坐标与英文地名来自 `public/data/world-airports.json`（同一份首页地图索引）；本站目录收录的目的地则换成本站自己的译名。站点 363 座机场里有 **224 座有航线数据**，只有这些才生成 `/route/<IATA>` 页面（其余不在 `generateStaticParams` 里，直接 404）。
- 航线页（`components/airport/RouteMapSection.tsx`）由三块组成：**Leaflet 航线图**、**目的地表**（城市、国家、距离、执飞航司）、**数据下载**（`/api/routes/<IATA>` 的 CSV / JSON，普通 `<a download>`，无 JS 也可用；CSV 带 BOM 以便 Excel 正确识别中文）。
- 航线图的交互（`components/airport/RouteMap.tsx`）：主题化的 ± 缩放按钮（到边界自动禁用）、⌘/Ctrl + 滚轮与触控板捏合缩放（普通滚轮留给页面滚动，地图不抢），**目录收录的目的地圆点本身就是指向该机场页面的真实链接**（可中键 / 右键新开标签），未收录的目的地只有悬停提示。颜色分级见 `lib/route-tiers.ts`（按执飞航司数量）。
- 首页的航线条目用**静态渲染图**（`public/route/*.png`，`npm run data:route-images`）：世界地图轮廓 + 大圆航线，处理了反子午线，缺图时回退为纯文字卡片。取景是**固定的世界全图**（经度 −180~180 横跨整幅、赤道居中），因此每张图的海岸线都落在同一位置、航线朝哪个方向飞一目了然；新增渲染图时不要改成按航线范围缩放。机场页的「航线图」区块用的是同一批图：该机场有渲染图时，图片本身就是通往 `/route/<IATA>` 的链接（`components/airport/RouteMapTeaser.tsx`，与航线页的航站楼地图卡片同一套样式），没有则回退为按钮——**站点目前只有 13 座机场有图**（首页那 12 座 + ICN），所以这条区块的样子本来就因机场而异。

## 地图与静态图片资产

三处 Leaflet 地图，都基于 OSM 瓦片：

| 位置 | 组件 | 说明 |
| --- | --- | --- |
| 首页世界地图 | `components/AirportMap.tsx` | 3244 座机场的蓝点 + 本站机场图标，按区域分组、随缩放切换密度，支持导出 |
| 机场页位置图 | `components/airport/LocationMap*.tsx` + `MapZoom.tsx` | 定位图 + 进入大图查看（lightbox + 缩放插件） |
| 航线页航线图 | `components/airport/RouteMap*.tsx` | 见上一节 |

图片资产（均在 `public/`，总体约 160MB）：

| 目录 | 内容 |
| --- | --- |
| `maps/`（262 张） | 机场封面图，`lib/map-images.ts` 按 IATA 索引；机场页下载按钮与首页图片位使用 |
| `source-maps/`（262 张） | 上者的原始大图，供需要原尺寸的场景 |
| `terminal-maps/{CODE}/`（63 座） | 航站楼平面图 PNG + PDF，带 `terminal-maps-manifest.json` 溯源（来源、sha256、许可说明）；缺文件时图片回退到封面或 SVG 示意图、PDF 回退到搜索 |
| `route/`（12 张） | 首页航线条目的静态渲染图 |
| `terminal-maps.png` | 首页「网站介绍」区块的照片（`components/HomeIntro.tsx`，1023×600） |
| `flags/`（92 张） | 国家 / 地区旗帜（与 `countries` 数量一致） |
| `data/world-airports.json`、`world-airport-map.jpg` | 首页地图索引与英雄区世界地图底图（`components/HeroRoutes.tsx` 在它上面用服务端 SVG 画大圆航线动画，`prefers-reduced-motion` 时静止） |

另有 `lib/airport-geo.ts`（60 座机场的坐标与 IANA 时区，用于时间 / 详情 / 定位图区块）、`lib/airport-links.ts`（75 条机场官网）、`lib/encyclopedia-links.ts`（维基百科 / 百度百科外链）三张静态表——机场表里没有这些字段，缺失时对应按钮不渲染（错链接比没链接更糟）。

## 站点地图与 SEO

- 每个已发布语言 × 每座机场 / 国家 / 有航线的机场都是预渲染页面（`generateStaticParams`），`revalidate = 3600` 每小时增量再生成；每个语言约 690 个页面（363 机场 + 92 国家 + 224 航线页 + 11 个固定页）
- `<title>` / `description` 按语言与机场数据生成；机场页标题用 `latestAirportTitle` 带当前年份（随 ISR 滚动）
- 结构化数据：`WebSite` + `SearchAction`（首页）、`Airport` + `BreadcrumbList` + `FAQPage`（机场页）、`Country` + `ItemList` + `BreadcrumbList` + `FAQPage`（国家页），均带 `inLanguage`；品牌名统一为 `World Airport Maps`（`lib/site.ts` 的 `SITE_NAME`），可见文案可本地化，机器可读字段只有一种拼法
- 机场页 FAQ 由数据库字段按语言生成（航站楼构成、距市中心距离、如何进市区、设施、所属城市国家），同时用于页面展示与 `FAQPage` 富结果；国家页 FAQ 同理
- `sitemap.xml` 收录全部地址的已发布语言版本并附带 `xhtml:link` alternates；`robots.txt` 屏蔽 `/api/`

URL 约定：

| URL | 说明 |
| --- | --- |
| `/airport/PEK`、`/zh/airport/PEK` | 机场页的规范地址（大小写不敏感） |
| `/airport/beijing-capital-international-airport-pek` | 描述性 slug，308 跳到当前语言的规范地址 |
| `/country/CN`、`/zh/country/CN` | 国家 / 地区页 |
| `/airports?country=US&sort=name&page=2` | 目录筛选 / 排序 / 分页，全部是普通链接与 GET 表单，无 JS 也可用 |

## 首页结构

首页按「先搜索、再分区导航」组织；区块顺序即页面顺序，锚点可直接分享：

1. **搜索英雄区**（深色，`public/world-airport-map.jpg` 底图 + `HeroRoutes` 的服务端 SVG 大圆航线动画）：居中标题、副标题、搜索框、常用机场快捷入口，以及国家 / 机场 / 航站楼统计。动画本身是 `@theme` 里的 `--animate-hero-*`，描边与减弱动效都在组件的原子类里（详见「开发注意」）。
2. **网站介绍**（`#intro`）：`public/terminal-maps.png` 机场照片 + 三组小标题与正文（`components/HomeIntro.tsx`，文案在 `home.intro`）。照片排在正文之前，所以这一段没有 kicker / 区块标题，语义名称走 `aria-label`；正文栏宽 880px，比 `.section` 的 1240px 窄，便于阅读。样式全部是组件里的 Tailwind 原子类（不新增 `globals.css` 规则，与顶栏、分类卡片同一做法），只有外层沿用各区块共用的 `.section`。照片是**固定高度横幅**：桌面 420px / 手机 200px，宽度 100%，`object-cover` 只裁不压（原图 1023×600 为 1.7:1，裁切偏上 `object-[50%_40%]`，保证机头机尾都在画面里）；手机另给一个高度，否则 390px 宽的屏幕上 420px 高几乎成方形，飞机会被裁掉。
3. **世界地图**（`#map`）：3244 座机场的点阵，按区域浏览。
4. **地理工具**（`#tools`）：三个工具卡片。
5. **功能分区**（`#browse`）：六张指向真实目的地的卡片（全部机场、按国家浏览、按区域浏览、热门机场城市、最近更新、机场指南），角标数字来自数据库与内容目录，不写死。
6. **热门机场**（`#popular`）：随机 10 张机场封面图。
7. **热门机场航线图**（`#routes`）：直飞目的地最多的机场，每格一张静态航线图并链接到航线页。
8. **机场指南**（`#guides`）：有 Markdown 指南的机场，无指南时整段不渲染。
9. **最近更新**（`#recent`，按 `updated_at` 倒序）。
10. **按国家分类**（`#countries`）：国家 / 地区网格。

`/countries` 按区域分组并带一条区域跳转条；每个区域块标注该区域的国家数与机场数。

## 404 行为说明

404 页面有一处 Next App Router 的固有限制，值得记录下来：

- **未匹配任何路由的地址**（例如 `/nope`）走根级 `app/not-found.tsx`，**完整服务端渲染**，无需 JavaScript 即可看到带样式的 404。
- **路由存在但参数无效**（例如 `/airport/ZZZ`）会返回 **HTTP 404**，但 404 内容通过 RSC 流下发、在客户端渲染：Next 在按需渲染这类页面时已经先输出了 HTML 外壳，此时抛出的 `notFound()` 无法再改写已发出的 HTML。
- 实测确认：not-found 文档位于 `app/[locale]/layout.tsx` **之外**，因此拿不到语言参数、没有顶栏页脚，也不能使用 `headers()`（会让整个 `[locale]` 段落变成动态渲染、失去预渲染页面），更无法渲染任何客户端组件。所以 404 文案是**中英双语**的，并用普通 `<a>` 与 GET 表单实现，`components/NotFoundContent.tsx` 顶部注释记录了这些约束。

选择保留正确的 404 状态码，而不是用 200 换取「服务端渲染的漂亮 404」——后者会被搜索引擎判为 soft 404。

## 开发注意（这几处踩过坑）

- **`app/globals.css` 是唯一样式表**，Tailwind v4 CSS-first：设计令牌在 `:root`、暗色令牌在 `html[data-theme="dark"]`，两者都**必须保持未分层**（分层后会被未分层的 `:root` 令牌反超，整站暗色主题失效）；组件样式集中在 `@layer components`，越靠后的段落优先级越高（equal-specificity 由顺序决定）。**新样式优先写成组件里的原子类**（顶栏、页脚、`CategoryGrid` 卡片、`HomeIntro`、`HeroRoutes` 都是这样），`globals.css` 只留设计令牌、跨组件共用件和没法用原子类表达的东西。**页脚在明暗两套主题下都保持深色**，所以 `Footer.tsx` 用的是固定的 `bg-navy-950` + 白色透明度（`text-white/78` 等），而不是会随主题翻转的语义令牌。
- **动画注册在 `@theme`，用 `animate-*` 调用**：`@keyframes` 没法写成原子类，所以 `--animate-accordion-*`（Radix 手风琴）与 `--animate-hero-*`（英雄区航线）都在 `@theme` 里定义，且 keyframes 只有被对应工具类用到时才输出。英雄区那组（`components/HeroRoutes.tsx`）的周期与延迟是**每条航线的数据**，由组件内联成 `--cycle` / `--delay`，`--animate-hero-*` 直接引用它们，于是虚线、光点、端点脉冲共用一只时钟、按航线错峰；描边与 `prefers-reduced-motion` 也全在该组件的原子类里（`motion-reduce:*`），`globals.css` 不再有任何 `.hero-routes` 规则。
- **首页的所有区块都已经是原子类**（英雄区、导览卡、功能分区横幅、热门 / 航线 / 最近更新三条列表、搜索建议、首页地图的按钮与图例、国家网格），对应的一百多条 `.hero-*` / `.guide-*` / `.popular-*` / `.route-tile*` / `.update-*` / `.suggest*` / `.am-*` / `.country-grid` 规则已从 `globals.css` 删除（2011 → 1594 行）。留在表里的只有三类：设计令牌与 `@theme`、**跨页面共用**的类（`.section` 家族、被工具页也引用的 `.cat-grid` / `.cat-body` / `.cat-meta` / `.cat-icon`）、以及**第三方生成的 DOM**（Leaflet 的 `.am-map .leaflet-tile-pane`、`.am-plane`、`.am-pop`、`.rt-map .leaflet-tooltip.*` —— 这些节点由 Leaflet 创建，拿不到 class，只能靠选择器）。改这些区块时别再往 `globals.css` 加同名规则：重复的声明叠在一起，谁赢要看层与顺序，而不是看 class 在属性里的先后。
- **同一属性只写一个变体，别指望顺序**：`.am-tabs button.on` 当年靠「写在后面」压过基础态，换成原子类后 `bg-amber` 与 `[background:rgba(...)]` 谁生效取决于 Tailwind 的输出顺序。所以这类互斥状态写成两个常量（`MAP_BUTTON_IDLE` / `MAP_BUTTON_ON`）二选一传入，而不是叠在一起。
- **Tailwind 的 `max-[Npx]:` 与 CSS 的 `max-width: Npx` 在边界上不等价**：前者编译成 `@media not (min-width: Npx)`，即 `< Npx`，而 `max-width` 是 `<= Npx`。只在视口宽度**正好等于**断点时才有 1px 的差别（常见设备宽度不受影响），但从 `max-width` 迁移过来时值得知道。
- **别把渲染出来的 HTML 存进仓库**：Tailwind v4 会扫描工程目录里的文本找候选类名，而服务端 HTML 里的 `class` 属性中 `'` 会变成 `&#x27;`——于是 `[background-image:...url('/x.jpg')]` 这类任意值被扫成一个带实体的新候选，Turbopack 再把它当模块去解析，**整站 CSS 编译失败、所有页面 500**。要留快照请放到工程目录之外，或直接用未加引号的 `url(/x.jpg)`。
- **Tailwind 没有 `stroke-linecap` / `stroke-dasharray` 的具名工具类**：这类 SVG 属性要么写任意属性（`[stroke-linecap:round]`、`[stroke-dasharray:7_11]`），要么别写。**写错名字不会报错，只会静默失效**——`stroke-round` 就属于这种，编译通过、DOM 上却什么都没生成，只能靠浏览器里读 computed style 才发现。
- **第三方 CSS 未分层，压过 `@layer components`。** `leaflet.css` 自带 `.leaflet-container`、`.leaflet-tooltip`、`.leaflet-interactive` 等规则，我们的同名属性如果写在 components 层里就会静默失效（浅色主题看不出来，暗色才会露馅）。凡是需要压过 Leaflet 的属性都写在**文件末尾的未分层覆盖块**里，文件内两处注释互相指向。
- **内容必须中英成对**：只写中文的 `content/zh/countries/XX.md` 会让英文页出现中文长文（回退目标是 `SOURCE_LOCALE`）。
- **同名 i18n 键会在编译期强制补齐**：`Messages` 类型派生自中文目录，英文目录少一个键就过不了 `npm run typecheck`。
- 已知未修的同类问题：首页地图的 `.leaflet-container { font: inherit; background: #0d1b2a }` 仍在 components 层里，因此被 Leaflet 自己的字体 / 底色盖住（影响仅限地图内文字字体与瓦片间隙底色）。

## 部署提示

- **构建阶段会访问数据库**预渲染全部页面，因此 `npm run build` 需要可用的 `DATABASE_URL`；连接数紧张时用 `PGPOOL_MAX` 调小池子。
- 上线前设置 `NEXT_PUBLIC_SITE_URL`（当前生产域名 `worldairportmap.com`），否则 `canonical`、`hreflang`、`sitemap.xml` 与结构化数据会指向 `localhost`。`next.config.ts` 的 `allowedDevOrigins` 只为开发期热更新放行该域名，构建与生产不受影响。
- 站点主语言由 `DEFAULT_LOCALE` 决定，切换它只需改一处；裸路径重定向、`x-default`、站点地图与切换器顺序都会跟随。
- `name` 排序依赖数据库排序规则。本机 PostgreSQL 使用 `Chinese (Simplified)_China.936`，因此中文机场名按拼音排序；英文站按 `name_en` 排序。若部署环境 collation 不同，中文排序顺序会随之变化。
- AdSense 的发布商 ID 目前硬编码在 `app/[locale]/layout.tsx` 的脚本标签里，与 `public/ads.txt` 保持一致；换账号需要同时改两处。

## 数据来源说明

航站楼平面示意图是按航站楼数量、登机口规模与地面交通节点自动绘制的**示意图**，用于快速理解机场整体布局与航站楼之间的关系，不是精确到米的实测平面图。航站楼数量、登机口数量、主要航司、年旅客量与地面交通信息整理自公开资料，可能随机场改扩建发生变化。航线数据为 OpenFlights 2014-06 快照（ODbL），仅统计直飞，页面顶部会标注快照日期。第三方图片（航站楼地图、封面图）的来源与许可记录在各自的 manifest 里。

## 从原静态版本迁移

迁移时用一次性脚本从 `legacy/index.html` 解析出原来的 `COUNTRIES` 与 `AIRPORTS` 字面量，校验后写入 `scripts/legacy-data.json`（37 个国家 / 地区、60 座机场、174 座航站楼；脚本本身已从仓库移除，数据文件保留）。`scripts/seed.mjs` 再灌进数据库，并在过程中校验：国家代码存在、每座机场至少一座航站楼、旅客量与距离可解析、各航站楼登机口数之和与机场总数是否有出入、翻译词表是否完整（`content/terminology/<locale>.json` 的每个键都要有值）。

`legacy-data.json` 只在重建数据库时被 seed 读取；日常的数据更新走 `data/build-directory-data.mjs` + `npm run db:seed`。

## 移植过程中修掉的问题

原型里的缺陷，样式部分保留在 `app/globals.css`，修正也一并写在同一个文件里并附注释：

1. **小屏无法导航**：原样式在 `max-width:820px` 时用 `display:none` 同时隐藏 `.topnav` 和 `.top-search`，窄屏下没有任何入口跳转到其他页面。现在导航变成可横向滚动的胶囊条，搜索框作为独立一栏保留在顶栏下方。
2. **列表行在小屏被裁切**：`.airport-table{overflow:hidden}` + `img{max-width:100%}` 落在 `auto` 轨道上使国旗列塌缩为 0 宽并把按钮挤到第二行；`.nm` 缺少 `min-width:0`，超长机场名（nowrap）会把行撑出容器。
3. **地面交通图标配色失效**：`.transit-row span`（0,1,1）优先级高于 `.transit-icon`（0,1,0），把图标重新刷成了 `--ink-soft` 灰色，而不是设计意图的 `--sky-600`。
4. **「最近更新」缺条目**：原版本这一栏用的是硬编码 IATA 列表，其中 OKC、HPN 并不在数据集里，实际只渲染出 3 条；现在按 `updated_at` 倒序查询。
5. **长文案下的横向溢出**：加入英文后，多处布局被更长的英文文案撑破（国家卡片的计数徽章、`.related-card` 的 nowrap 机场名、`minmax(300px,1fr)` 的网格轨道下限、「最近更新」行的固定列、区块标题与「more」链接同一行等）。全部在 320 / 360 / 390 / 480 / 640 / 768 / 1024 / 1280 / 1440px 两种语言下实测修正，现在**无横向溢出**。这类问题在任何「中文站加语言」的场景都会出现，修法都写在 `app/globals.css` 的注释里。
