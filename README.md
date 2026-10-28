# 全球机场地图 · World Airport Maps

全球机场导航站点（生产域名 **worldairportmap.com**）：按国家 / 地区浏览 **363 座机场、92 个国家 / 地区**，查看每座机场的**航站楼平面示意图**、登机口范围、主要航司、地面交通与设施；可交互的**直飞航线图**与目的地列表；三个地理计算工具；以及用 **Markdown** 维护的长文（366 篇机场指南：60 篇精编手写 + 303 篇数据驱动起步稿、37 篇国家介绍）。**默认语言为英语**，同时提供完整中文版、繁体中文版、**德语版（`/de`）**、**韩语版（`/ko`）**、**法语版（`/fr`）**与**意大利语版（`/it`）**。

由原来的单文件静态页面（`legacy/index.html`，哈希路由 + 内嵌 JS 数据）重构为 **Next.js App Router + PostgreSQL**：

- 机场数据存放在 PostgreSQL，页面通过 SQL 查询渲染（不再是内嵌的 JS 数组）
- 哈希路由（`#/airport/PEK`）改为真实 URL（`/airport/PEK`、`/zh/airport/PEK`），可被抓取、可分享、可被搜索引擎收录
- 新增服务端渲染的目录（搜索 / 国家筛选 / 排序 / 分页）、站点地图、结构化数据与按语言的 FAQ
- 新增交互式航线图页（地图 + 目的地表 + CSV/JSON 下载）、三个地理计算工具页
- 新增语言切换、hreflang、按语言生成的站点地图
- 新增长文内容系统（机场指南、国家介绍与 about / privacy / terms 页面）；文档存放在数据库表 `content_documents`（2026-10-14 前是 `content/` 下的 Markdown 文件），加语言只需插行

## 站点结构

| URL | 说明 |
| --- | --- |
| `/`、`/airport/PEK` | 首页与机场详情页（默认语言英语，裸路径即规范地址） |
| `/zh/...` | 同一批页面的中文版 |
| `/tw/...` | 繁体中文版（`hreflang="zh-hant"`） |
| `/de/...` | 德语版（`hreflang="de"`） |
| `/ko/...` | 韩语版（`hreflang="ko"`） |
| `/fr/...` | 法语版（`hreflang="fr"`） |
| `/it/...` | 意大利语版（`hreflang="it"`） |
| `/airports` | 机场目录：搜索 + 国家筛选 + 排序 + 分页（普通链接与 GET 表单，无 JS 也可用） |
| `/countries`、`/country/CN` | 国家索引（按区域分组）与单个国家 / 地区页 |
| `/route/PEK` | 航线图页：直飞目的地的航线地图 + 目的地表 + CSV/JSON 下载 |
| `/tool`、`/tool/{coordinate-converter,dms-converter,distance-calculator}` | 坐标转换（WGS84 / GCJ02 / BD09）、度分秒转换、大圆距离计算 |
| `/about`、`/contact`、`/privacy`、`/terms` | Markdown 静态页 |
| `/blog`、`/blog/<slug>` | 旅行笔记（中 / 英 / 德 / 韩 / 法 / 意，另有繁中派生版） |
| `/api/search`、`/api/routes/[code]`、`/api/flights/[code]` | 搜索联想接口；航线数据的 CSV / JSON 导出（`?locale=` 选语言、`?format=json`）；机场航班板的分页 / 搜索（`?locale=`、`dir=departures|arrivals`、`page`、`q`） |
| `/flight/aa100`、`/zh/flight/aa100` | 单个航班号页：航司、航线、起降机场、航线图、距离、同航线其他航班与 FAQ；大小写不敏感，规范 URL 为小写 |
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
npm run db:seed                # 数据库初始化 + 灌数据：建库 → 扩展 → 建表 → 触发器/视图 → 363 座机场
npm run dev                    # http://localhost:3003
```

`npm run db:seed` 就是完整的初始化入口（`node scripts/seed.mjs`）：数据库不存在就建、`pg_trgm` 没装就装、表没建就用 `drizzle-kit push` 按 `db/schema.ts` 建、`search_blob` 触发器与 `directory_stats` 视图缺了就补，最后灌数据。前四步用「`airports` 表是否存在」判断，已经初始化过就直接跳过，所以对线上库重复跑它只影响数据。参数：`--add-airports` 只补缺的机场（不动已有数据）、`--data-only` 完全跳过初始化只灌数据、`--migrate` 改用 `drizzle/*.sql` 建表（默认走 push）、`--reset` 先 DROP 再重建（**会丢库**）。

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
| `PGPOOL_MAX` | 否 | 连接池上限：运行时默认 `10`，**构建期默认 `4`**（`next build` 会开 11 个 worker）。CI / 低配库上建议两边都调小（见「查询层与连接池」） |
| `COMMENTS_IP_SALT` | 生产建议 | 评论区按 IP 限流时用的哈希盐。换掉只会重置计数，不影响已有评论 |

## npm 脚本

| 脚本 | 作用 |
| --- | --- |
| `npm run dev` / `build` / `start` | 开发（3003）/ 构建 / 启动（3003） |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:seed` | **数据库初始化的唯一入口**（`node scripts/seed.mjs`）：建库（不存在时）→ `db/extensions.sql` → 建表（默认 `drizzle-kit push --force`，`--migrate` 改用 `drizzle/*.sql`）→ `db/custom.sql` → 灌数据。前四步以「`airports` 表是否存在」判断，已初始化就跳过，可安全重复执行；数据部分是全量重建（先 TRUNCATE）。改过 `scripts/legacy-data.json` / `scripts/directory-data.json` 后跑它生效 |
| `node scripts/seed.mjs --add-airports` | **增量新增机场**：只插入库里还没有的机场（及其国家、翻译、航站楼等子表），已有行一律不动；新行的 `updated_at` 记成「几分钟前」，所以在首页排在最前面。新增一座机场的顺序是：写进 `scripts/legacy-data.json`（精编，带航站楼与正文）或 `scripts/directory-data.json`（目录批次，只有基础字段）→ 跑这个命令。只做插入，不更新已有行——要改已有数据用 `npm run db:seed` |
| `node scripts/seed.mjs --data-only` / `--reset` | 只灌数据（跳过建库与建表）/ 先 `DROP DATABASE` 再走完整初始化（**会丢库**） |
| `npm run db:push` | `drizzle-kit push`：把 `db/schema.ts` 直接推到库，改表最快的开发路径（执行前会列出语句并确认） |
| `npm run db:generate` | `drizzle-kit generate`：按 `db/schema.ts` 的改动生成迁移文件到 `drizzle/` |
| `npm run db:migrate` | `drizzle-kit migrate`：应用 `drizzle/` 下的迁移 |
| `npm run db:studio` | `drizzle-kit studio`：在浏览器里浏览 / 编辑数据 |
| `npm run comments` | 评论审核：`list [--all] [--limit N]` 查看、`hide <id>` 隐藏、`show <id>` 恢复、`delete <id>` 删除（见「读者评论」） |
| `npm run db:create` | 只建库（`--reset` 为 `DROP DATABASE ... WITH (FORCE)` 后重建） |
| `node scripts/db-apply-sql.mjs <file.sql>` | 只跑一个 SQL 文件：`db/extensions.sql`（`pg_trgm`，建表前）或 `db/custom.sql`（`search_blob` 触发器、`directory_stats` 视图，建表后） |
| `node scripts/verify.mjs` | 跑一遍站点依赖的关键查询 |
| `node scripts/prepare-world-airports.mjs` | 从 `data/world-airports.csv` 生成地图数据：`public/data/world-airports.json`（前端加载，3244 座机场）与 `lib/world-airports-meta.json`（构建期统计） |
| `node data/build-directory-data.mjs` | 把 `data/new-airports-a.{zh,en}.json` 合并成 `scripts/directory-data.json`（目录批次的灌库输入，见「数据模型」；改完数据后接 seed 生效） |
| `node scripts/generate-airport-maps.mjs` | 用 OpenStreetMap 几何生成机场地图，写入 `public/source-maps/{CODE}.png`（2000px 宽）+ `public/maps/{CODE}.png`（400px 封面）：`--codes PEK,PVG` 指定机场、`--missing` 补所有还没有封面的机场（可配 `--kind large`）、`--dry-run` 预演、`--force` 重渲染、`--compact` 每座机场只发一个 Overpass 请求（小/中型机场用，请求数从 3 降到 1）、`--reindex` 只按磁盘上的图重写记录、`--limit N` 限量、`--delay MS` 调 Overpass 请求间隔。原始响应缓存在 `data/osm/`（已 gitignore，删掉某机场的文件即重新拉取），图上带 `© OpenStreetMap contributors` 归属行；来源 / sha256 / 许可写进 `scripts/maps-manifest.json`（两个图片目录里只有图片）。坐标来源依次是 `public/data/world-airports.json` → `data/world-airports.csv` → `scripts/airport-coords.json`（数据集都没覆盖的机场，人工从 Wikidata / 维基百科核定，条目里写明出处）→ Overpass 按 `iata` 标签反查；只有机场轮廓和跑道、没有航站楼的小机场会退化成「机场 + 跑道」的图，两者都没有才跳过 |
| `node scripts/generate-route-images.mjs` | 按首页航线条目的排序，把每个机场的航线图渲染成 PNG 到 `public/route`（世界地图轮廓 + 大圆航线，经 sharp 栅格化；含反子午线处理）。默认只渲染前 12 座，且**已有文件一律跳过**（渲染慢，已提交的图是好的）；`--codes ICN,AMS` 指定机场、`--top N` 改数量、`--force` 重跑 |
| `node scripts/fetch-flights.mjs`（= `npm run flights:fetch`） | 从 aviability.com 的航班 sitemap 生成**单个文件** `data/flights.json.gz`：只保留目录机场的进出港航班号，每条航线只存一次；文件内含航司显示名、各机场进出港计数、快照日期与全量 `flights` 数组。每次运行都抓「最近更新 + 全量索引」并整体重写（约 30 秒） |
| `node scripts/check-flights.mjs`（= `npm run flights:check`） | 校验 `data/flights.json.gz`：JSON 结构与日期、航司 slug / 机场代码 / 航班号合法、每条航线至少连接一座目录机场、无重复航线、数组按约定顺序排列、各机场计数与全局 totals 一致；有错误时退出码 1，适合刷新数据后、构建前跑一遍 |
| `node scripts/fetch-terminal-maps.mjs` | 按机场代码批量下载航站楼地图 PNG + PDF（默认源 eoob.com；`--codes HKG,PEK` 指定、`--dry-run` 预演、`--png-only` / `--pdf-only`、`--force`）。文件落到 `public/terminal-maps/{CODE}/`，溯源信息在 `terminal-maps-manifest.json`（当前 63 座机场） |
| `node scripts/compress-terminal-maps.mjs` | 原地压缩上一步的 PNG：量化为 8 位调色板（默认 `--quality 80`），尺寸不变，实测 52.8MB → 12.4MB 且登机口号、路名清晰可读；已压缩的自动跳过，`--force` 重压、`--max-width 1600` 可同时缩尺寸 |
| `node scripts/fetch-airport-images.mjs` | 批量下载机场封面图（`public/maps`）并记录每张图的来源、sha256 与许可说明；机场代码只能来自你自备的列表 / HTML / 库导出，脚本不爬站发现代码，默认遵守 robots.txt |
| `node scripts/check-maps.mjs [--table]` | 检查 `public/maps` 封面图与机场的覆盖情况：哪些机场缺图、哪些图没有对应机场 |
| `node scripts/check-search.mjs [词...]` | 检查搜索相关性排序与通配符转义 |
| `npm run locale:status`（= `node scripts/locale-status.mjs`） | 打印 24 种注册语言的就绪度：hreflang 代码、语言名、消息目录是否存在、`content_documents` 里机场指南 / 国家介绍 / 静态页的行数、博客译文数，以及 `published` / `planned` 状态。挑下一种语言开工前先跑这个，缺口一目了然（库连不上时仍可运行，计数为 0） |
| `node scripts/generate-airport-guides.mjs` | 为数据库里有、但还没有指南的机场写**数据驱动的起步稿**（往 `content_documents` 写 zh/en 两行）：内容只来自仓库数据（代码、位置、规模、坐标、OpenFlights 航线集、最近机场），航站楼 / 交通等未整理的信息明确标注「待补充」而不编造。**跳过精编 60 座的手写指南**（含孤儿 MEL/SZX/TPE），已存在的行一律不覆盖；`--codes AAL,AAR` 限量、`--dry-run` 预演、`--refresh` 重渲染本脚本写过的起步稿。跑完接 `node scripts/build-hant.mjs` 派生 tw。首页「机场指南」区块只展示客流最大的 12 座（`guidedTiles`），角标数字仍是全量 |
| `npm run content:export`（= `node scripts/content-export.mjs`） | 把 `content_documents` 的行导出成 `content/<locale>/<kind>/<subject>.md` 文件树（`--out`、`--locale`、`--kind` 过滤、`--json <文件>` 单文件快照、`--check <目录>` 只校验不改写），用于备份、评审或交给译者。默认输出到仓库内的 `content/`，该目录已 gitignore |
| `npm run content:import`（= `node scripts/content-import.mjs`） | 把 `.md` 文件树导入 / 更新回 `content_documents`（`--dir`、`--only zh,en` 限定语言、`--dry-run` 预演、`--prune` 删除该语言已不存在的行）。新语言的翻译批量入库走这个脚本。npm 传参要加 `--`（`npm run content:import -- --dir /tmp/x`），pnpm 直接跟在后面（`pnpm content:import --dir /tmp/x`） |
| `node scripts/calibrate-hero-map.cjs`（**脚本不在仓库里**） | 重新标定首页 hero 背景图（`public/world-airport-map.jpg`）的投影常量：自相关测出地图的横向平铺周期，再用全部机场坐标拟合相位与纬度映射，输出 `components/HeroRoutes.tsx` 顶部要填的四个数字；换背景图后跑一次即可 |
| `node scripts/strip-blog-watermark.mjs [图片目录]` | 去掉博客插图上「服务号 · 懿旅航空票务」的水印（上海浦东 16 张、北京首都 17 张）。水印是一层约 30.7% 不透明度的黑：逐像素反解 `background = (observed − α) / (1 − α)` 能把压在字下的地图标签一并还原，不涂抹、不模糊。**位置**（缩放/偏移）按「只看背景是白的那些被覆盖像素」的能量指标拟合（浦东有 5 张与参考图同批次，实测精确到 0）；**每像素的 α 则从这张图自己量**——水印跟着图一起缩放，各图缩放比不同（北京实测 0.972~1.003），拿参考图的字形硬套会过度提亮、留下一圈更显眼的亮字。残留用「覆盖区外邻居的中位数」当局部背景抹平（不能用闭运算/局部最亮值：浅灰背景挨着白底时会把白串过去）。参数：`--ref` 换参考图、`--out` 输出到别处、`--crop-bottom N` 裁掉压在照片上、没法用白底拟合的那张（两个目录的 `0.*`）。**就地写回**，按水印是否还在自动跳过重复运行，PNG 必须 `palette: false`（否则 sharp 静默走调色板量化）且按原扩展名写回（写成 PNG 却留 `.webp` 会被 `check-blog.mjs` 抓出来）。注意 `--crop-bottom` 分支**不做幂等保护**，同一条命令重跑会再裁一次——只对未处理过的原图运行。浦东那批已提交的图是用更早一版（参考图 α + 闭运算抹平）跑的，现行版本对北京这种有缩放差的素材才够干净 |

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
- **需要可追溯 / 部署到其他环境**：改完 `db/schema.ts` 跑 `npm run db:generate`，审阅 `drizzle/*.sql` 后提交，再 `npm run db:migrate`（或初始化时用 `npm run db:seed -- --migrate`，让建表走迁移文件而不是 push）。

## 查询层与连接池

查询层保持手写 SQL（`lib/queries.ts`）：分页目录、搜索相关性排序、机场详情页分别用到窗口函数、`LATERAL` + `json_agg`、`ESCAPE` 转义的 `ILIKE`，用 SQL 写更好读也更好审。`lib/db.ts` 在同一个连接池上另外导出了 `getDb()`（已挂 `db/schema.ts`），新写的、不需要上述技巧的查询可以直接用 ORM。

连接池的两个细节（`lib/db.ts`）值得知道：

- 池是**进程级单例**（挂在 `globalThis` 上），开发期热更新与生产多 lambda 都不会反复建池；`PGPOOL_MAX` 控制上限，构建期（`NEXT_PHASE === 'phase-production-build'`）默认取 `4`：11 个 worker 各持一个满额池会顶到 PostgreSQL 默认 `max_connections = 100`，库端把多余的连接踢掉，报出来就是查询中途 `read ECONNRESET`。
- 查询包了 `withRetry`：上面这类**连接层**故障（连接超时、`ECONNRESET` / `EPIPE` / `ETIMEDOUT`、连接被关闭、`too many clients`）都会退避重试 3 次，一条连接抖动不再打断整个构建；SQL 本身的错误（例如表不存在）不在重试之列，会立刻抛出。

## 数据模型

7 张表，当前库内数据量：

```
countries             92 行   国家 / 地区（code、中文名、name_en、region、region_en、国旗）
airports             363 行   机场（iata、slug、中英文名、城市、登机口数、年旅客量、
                              距市中心、更新时间、search_blob）
airport_translations 1452 行  机场简介（按语言存放的 Markdown；已 seed 的语言各 363 行，
                              当前库为 zh / en / tw / de）
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

`lib/i18n/config.ts` 的 `LOCALES` 注册了 24 个语言代码（顺序即语言切换器顺序），但**只有 `lib/i18n/catalogs.ts` 里登记了消息目录的语言才真正发布**——当前是 `en` + `de`（德语，`htmlLang=de`，URL 前缀 `/de`）+ `fr`（法语，`htmlLang=fr`，URL 前缀 `/fr`）+ `it`（意大利语，`htmlLang=it`，URL 前缀 `/it`）+ `ko`（韩语，`htmlLang=ko`，URL 前缀 `/ko`）+ `zh` + `tw`（繁体中文，`htmlLang=zh-hant`，URL 前缀 `/tw`）。未发布的前缀会被剥掉并跳到访客的最佳可用语言，而不是 404，也不会出现「同一批英文页面挂在 /es 下」的重复收录。

URL 方案（与生产站点地图一致）：

| 地址 | 行为 |
| --- | --- |
| `/`、`/airport/PEK` | **默认语言（英语）的规范地址**，`proxy.ts` 内部 rewrite 到 `[locale]` 路由，可见 URL 不变；`x-default` 指向这里 |
| `/zh/airport/PEK` | 中文（简体）页面的规范地址 |
| `/tw/airport/PEK` | 繁体中文页面的规范地址（`hreflang="zh-hant"`） |
| `/de/airport/PEK` | 德语页面的规范地址（`hreflang="de"`） |
| `/en/airport/PEK` | 旧地址，308 跳到裸路径，保证一个英文页面只有一个可收录 URL |
| `/es/...` | 已注册但未发布（或任意两位语言前缀）：剥离前缀后跳到访客最佳可用语言 |
| 深层裸路径（`/airport/PEK`） | 访问过某个语言后由 `preferred-locale` Cookie 记住选择；未设置时按 `Accept-Language` 判断 |

每页都输出 `hreflang`（`en`、`de`、`fr`、`it`、`ko`、`zh-hans`、`zh-hant`、`x-default`）与按语言区分的 `canonical`；`sitemap.xml` 为每个地址的**每种已发布语言**各列一条 `<url>`（`/de/...`、`/fr/...`、`/it/...` 也是独立条目，不只是 alternates）。`proxy.ts` 跳过 `/api`、`/_next` 与带扩展名的静态文件。

页头右上角的语言切换器用 `<details>` 实现（**无 JS 也能用**），列出**全部 24 种已注册语言**：已发布的 7 种是指向「当前页面等价路径」的真实链接（`components/LanguageSwitcher.tsx` 从 pathname 剥掉语言段再拼回去），其余 17 种作为「筹备中」条目**禁用显示**（无 href，只有 `lang` / `hreflang` 代码与 tooltip），既把后续语言排期摆在明面上，又不会把访客点进一个会被 `proxy.ts` 跳回原语言的前缀。每行右侧的小字是 `LOCALE_META[locale].htmlLang`，即该语言的 hreflang 代码（`de`、`fr`、`it`、`zh-hans`、`zh-hant`…）；点击已发布语言时顺手写入 `preferred-locale` Cookie。

**之所以禁用而不是给链接**：hreflang 与站点地图只输出已发布语言（未发布的 URL 会重定向，指过去等于浪费抓取预算），所以「预备」的是切换器的 24 项清单与注册表，而不是 24 份 hreflang。

### 添加一种语言

**24 种语言已经在 `LOCALES` 里注册好了**（`en/es/pt/fr/id/de/ru/zh-hans/zh-hant/hi/bn/ja/sw/tr/vi/ko/it/th/pl/uk/ro/nl/sv/cs`），语言切换器也把这些条目全部列出（未发布的显示为「筹备中」并禁用）。因此新增一种语言通常**不需要改 config**，从第 2 步开始；先跑 `npm run locale:status` 看当前缺口。

1. 若代码还没注册：在 `lib/i18n/config.ts` 的 `LOCALES` 中加入，并补上 `LOCALE_META` 条目（`label`、`htmlLang`、`ogLocale`、`acceptLanguage`）。
2. 新建 `lib/i18n/messages/<code>.ts`，类型为 `Messages`（派生自中文目录）。**漏译或拼错的键会直接编译失败。**
3. 在 `lib/i18n/catalogs.ts` 的 `CATALOGS` 中注册——这一步才真正「发布」该语言（切换器从「筹备中」变为可点链接，`hreflang` 与站点地图同时包含它）。
4. 内容文档：`content_documents` 表里插入该语言的（kind, subject, locale）行。做法是先 `node scripts/content-export.mjs --locale zh --out <目录>` 导出中文源，把 `<目录>/zh/` 下的文件翻译后放进 `<目录>/<code>/`，再 `node scripts/content-import.mjs --dir <目录> --only <code>`；机场 / 国家 / 静态页三种文档同一套流程。
5. **只有需要独立数据库列的语言**才要动 `scripts/seed.mjs`：在 `SEED_LOCALES` 中加入该代码，并在各表加 `_<code>` 列、补 `db/terminology/<code>.json`，然后 `npm run db:seed` 重建数据库。像德语这样复用英文列、在渲染期套词表的语言走下一节的流程。
6. 博客：把 `public/blog/<slug>/<slug>.md`（或 `.en.md`）翻译成 `<slug>.<code>.md`，并在 `lib/blog.ts` 的 `BLOG_LOCALES` 里加入该代码。没有译文的文章不会出现在该语言的列表与站点地图里（不回落）。

路由、`generateStaticParams`、`hreflang`、站点地图、语言切换器与 AdSense 无关的页面代码都会自动跟随，无需改动页面。

#### 派生语言：繁体中文（`tw`）怎么做

`tw` 与中文同属一个书写系统，文案是**派生**而不是另写一份，因此它的第 2、4、5 步不同：

- 消息目录 `lib/i18n/messages/tw.ts` 与 `content_documents` 里全部 `locale='tw'` 的行（366 篇机场指南 + 37 篇国家介绍 + 5 个静态页）由 `scripts/build-hant.mjs` 生成（`node scripts/build-hant.mjs`，加 `--check` 只校验不改写）：OpenCC `cn → twp` 转换，先过 `db/terminology/tw-phrases.json` 的 `phrases`（台湾用法例外：希斯洛、杜拜、雪梨、巴塞隆納…），再过 `corrections`（纠正 OpenCC 的过度替换：连接→連線、只→隻、绑定→繫結）。转换规则集中在 `scripts/_hant.mjs`（`toHant` 用于正文、`toHantName` 用于地名——台湾写法用「里」而不是 OpenCC 的「裡」）；转换前后会核对 `${}` 插值数量（防止词表替换破坏模板字符串）。简体残留用 `_hant.mjs` 里按 OpenCC 反推的字符集扫描，有残留时 seed 会直接报出来。
- 重新生成会**覆盖** `locale='tw'` 的行，所以要改文案就改词表（或改写生成器），不要直接改生成物。
- 数据库侧没有 `terminology/tw.json`：`scripts/seed.mjs` 的 `DERIVED_LOCALES` 把 `tw` 标记为派生语言，各表 `_tw` 列由 `toHant()` / `toHantName()` 从中文源直接转换（`name_tw`、`city_tw`、`region_tw`、`gate_range_tw`、`airlines_tw`、`label_tw`、`description_tw`，简介写入 `airport_translations.locale='tw'`）。种子脚本最后打印 `derived (tw)` 的条数与简体残留数。
- 名称类字段用 `toHantName()`：OpenCC 在音译里会把「里」读成「裡」（紐伯裡、庫裡蒂巴），名称里一律还原为「里」。

#### 无数据库列的语言：德语（`de`）怎么做

德语没有 `name_de` / `city_de` 这类列，数据库结构保持不变：结构化字段取英文列，**在渲染期套德语词表**；长文内容仍按语言存行。

- **UI 文案**：`lib/i18n/messages/de.ts` 是完整翻译（类型派生自中文目录，键缺失即编译失败），在 `catalogs.ts` 注册后 `/de` 自动进入路由、切换器、`hreflang` 与站点地图。
- **结构化数据**：`lib/i18n/de-vocab.json` 是唯一词表（国家、地区、城市、机场、航站楼名、设施标签、交通方式、机场等级），`lib/i18n/de-data.ts` 把它包成查找函数，`lib/queries.ts` 的 `pick()` / `pickStrict()` 在 `locale === 'de'` 时用英文列 + 对应词表（`germanCountry`、`germanCity`、`germanTerminalName`、`germanGateRange`…）。没有条目时**回退英文名**，绝不会回退中文。
- **数字与日期**：`lib/format.ts` 用 `de-DE`（小数逗号、「ca. 67 Millionen」、「22. Oktober 2026」）；语言无关的标点 / 维基语言等判断集中在 `lib/i18n/display.ts`（`isCjkLocale`、`intlLocale`、`wikipediaLocale`、`showsBaike`），德语页链到 de.wikipedia、不显示百度百科。
- **机场简介**：`data/de-descriptions.json`（IATA → 德文，363 条）保存**从英文 `description_md` 翻译**的简介；`scripts/seed.mjs` 优先用它，文件不存在时才回退到 `scripts/_de.mjs` 的数据生成模板。因此 `npm run db:seed` 不会把译文覆盖成生成的德语。
- **机场指南**：363 篇 `locale='de'` 的 `content_documents` 是**线上英文编辑稿的完整翻译**（不是数据生成稿）。工作流：`content-export --locale en --out <目录>` 导出英文 → 在 `<目录>/de/airports/` 写译文（前言 `updated` 用翻译日期）→ `content-import --dir <目录> --only de`。`npm run de:guides` 仍保留为数据驱动兜底：它只写缺失的德语指南、带生成标记，译文行不会被它覆盖。
- **国家介绍与静态页**：`content/de/{countries,pages}`（37 + 5 篇，同样按当前英文版重译），与机场指南一起用 `node scripts/content-import.mjs --dir <目录> --only de` 导入。
- **内容回退**：`lib/content.ts` 的 `localeChain()` 让 `de` 回退到 `en`（而不是 `SOURCE_LOCALE` 中文）；机场简介同理。照片说明另有一份 `public/photos/captions.de.json`（按 `IATA → 文件 → 德文说明` 翻译自英文说明），未收录的照片回退英文说明，`lib/airport-photos.ts` 的 `pickCaption()` 负责这条链。
- **搜索**：`airports.search_blob` 只有中 / 英 / 繁名称，所以德语搜索会把德语地名反查成英文再查一遍（`germanSearchAlias()`：Peking → Beijing、Moskau → Moscow、München → Munich，并接受 `muenchen` 这类无变音符写法），否则德国用户搜不到自己语言的地名。
- **博客也有德语**：`lib/blog.ts` 的 `BLOG_LOCALES` 现在是 `en / de / fr / it / ko / zh / tw`，德语译文放在 `public/blog/<slug>/<slug>.de.md`（与 `<slug>.en.md` 并列，84 篇全部翻译）。缺译的文章不会回退到英语或中文，只是不出现在 `/de/blog` 列表里；`/de/blog` 页头入口、文章页、`hreflang`、`lastmod` 与站点地图条目都由文件是否存在自动推导。

重新翻译的顺序：`content-export --locale en` 导出当前英文长文 → 翻译成 `de/` → `content-import --dir <目录> --only de`（405 篇：363 机场 + 37 国家 + 5 静态页）→ 德语简介写回 `data/de-descriptions.json` 并入库 → 需要重建结构化数据时再 `npm run db:seed`（会优先读取该 JSON，不会丢译文）。

#### 韩语（`ko`）与德语同构

韩语复用德语的整条链路，没有新增数据库列、没有新依赖：

- **UI 文案**：`lib/i18n/messages/ko.ts`（类型派生自中文目录，571 个键），注册进 `catalogs.ts` 后 `/ko` 自动进入路由、语言切换器、`hreflang` 与站点地图。
- **结构化数据**：`lib/i18n/ko-vocab.json`（233 国家 / 12 地区 / 284 城市 / 60 机场 / 44 航站楼 / 12 设施标签 / 6 交通方式 / 4 机场等级），`lib/i18n/ko-data.ts` 把它包成查找函数；`lib/queries.ts` 的 `pick()` / `pickStrict()` 在 `ko` 时用英文列 + 词表，缺条目回退英文。
- **数字与日期**：`lib/format.ts` 用 `ko-KR`，客运量用 만/억（`약 6,700만 명`）；`display.ts` 的 `intlLocale('ko-KR')`、`wikipediaLocale('ko')`，韩语页不显示百度百科。
- **搜索**：`koreanSearchAlias()`（도쿄 → Tokyo、인천 → Incheon），与德语别名同一套机制。
- **长文**：`content_documents` 405 篇（363 机场 + 37 国家 + 5 静态页）与 `airport_translations` 363 条简介，均从英文版翻译，`updated: 2026-10-23`；简介另存 `data/ko-descriptions.json`，`db:seed` 会优先读取。
- **博客与照片**：`BLOG_LOCALES` 含 `ko`，译文为 `public/blog/<slug>/<slug>.ko.md`；照片说明为 `public/photos/captions.ko.json`，缺译回退英文说明。

#### 法语（`fr`）与德语同构

法语复用德语的整条链路，没有新增数据库列、没有新依赖：

- **UI 文案**：`lib/i18n/messages/fr.ts`（类型派生自中文目录，键缺失即编译失败），注册进 `catalogs.ts` 后 `/fr` 自动进入路由、语言切换器、`hreflang` 与站点地图。
- **结构化数据**：`lib/i18n/fr-vocab.json`（233 国家 / 12 地区 / 284 城市 / 60 机场 / 44 航站楼 / 12 设施标签 / 6 交通方式 / 4 机场等级），`lib/i18n/fr-data.ts` 把它包成查找函数；`lib/queries.ts` 的 `pick()` / `pickStrict()` 在 `fr` 时用英文列 + 词表，缺条目回退英文。
- **数字与日期**：`lib/format.ts` 用 `fr-FR`（小数逗号、「environ 67 millions」、「22 octobre 2026」）；`display.ts` 的 `intlLocale('fr-FR')`、`wikipediaLocale('fr')`，法语页链到 fr.wikipedia、不显示百度百科。
- **搜索**：`frenchSearchAlias()`（Pékin → Beijing、Londres → London、Le Caire → Cairo），并接受 `pekin` 这类无重音写法。
- **机场简介**：`scripts/_fr.mjs` 的 `curatedDescriptionFr()` / `directoryDescriptionFr()` 按结构化字段生成法语简介（与德语同一套数据、同一套口径），`scripts/seed.mjs` 写入 `airport_translations.locale='fr'`；若之后有编辑译文，放进 `data/fr-descriptions.json` 即可优先于生成稿（读取顺序与 `ko-descriptions.json` 相同）。
- **长文**：`content_documents` 尚无 `locale='fr'` 行，机场指南 / 国家介绍 / 静态页按 `localeChain()` 回退英文；翻译入库流程与德语相同（`content-export --locale en` → 翻译 → `content-import --only fr`）。
- **博客与照片**：`BLOG_LOCALES` 含 `fr`，译文为 `public/blog/<slug>/<slug>.fr.md`（84 篇全部翻译；没有英文源的 `paris-cdg-vs-frankfurt-fra-transfer-test` 不出现在法语列表）；照片说明为 `public/photos/captions.fr.json`（366 座机场 / 424 条全部翻译），缺译回退英文说明。

#### 意大利语（`it`）与德语同构

意大利语复用同一条链路，没有新增数据库列、没有新依赖：

- **UI 文案**：`lib/i18n/messages/it.ts`（类型派生自中文目录，键缺失即编译失败），注册进 `catalogs.ts` 后 `/it` 自动进入路由、语言切换器、`hreflang` 与站点地图。
- **结构化数据**：`lib/i18n/it-vocab.json`（233 国家 / 12 地区 / 284 城市 / 60 机场 / 44 航站楼 / 12 设施标签 / 6 交通方式 / 4 机场等级），`lib/i18n/it-data.ts` 把它包成查找函数；`lib/queries.ts` 的 `pick()` / `pickStrict()` 在 `it` 时用英文列 + 词表，缺条目回退英文。
- **数字与日期**：`lib/format.ts` 用 `it-IT`（小数逗号、千分点、「circa 67 milioni」、「21 settembre 2026」）；`display.ts` 的 `intlLocale('it-IT')`、`wikipediaLocale('it')`，意大利语页链到 it.wikipedia、不显示百度百科。
- **搜索**：`italianSearchAlias()`（Pechino → Beijing、Londra → London、Il Cairo → Cairo），并接受去重音 / 去撇号的写法（`citta del messico`、`lavana`）。
- **机场简介**：`scripts/_it.mjs` 的 `curatedDescriptionIt()` / `directoryDescriptionIt()` 按结构化字段生成意大利语简介，`scripts/seed.mjs` 写入 `airport_translations.locale='it'`；有编辑译文时放进 `data/it-descriptions.json` 即可优先于生成稿。
- **长文**：`content_documents` 尚无 `locale='it'` 行，机场指南 / 国家介绍 / 静态页按 `localeChain()` 回退英文；入库流程与德语相同（`content-export --locale en` → 翻译 → `content-import --only it`）。
- **博客与照片**：`BLOG_LOCALES` 含 `it`，译文为 `public/blog/<slug>/<slug>.it.md`（84 篇全部翻译）；照片说明为 `public/photos/captions.it.json`（366 座机场 / 424 条全部翻译），缺译回退英文说明。

#### 把德语发布到线上

德语分两部分，**代码/静态文件随应用部署**（`lib/i18n/messages/de.ts`、`de-vocab.json`、`de-data.ts`、`public/blog/*.de.md`、`public/photos/captions.de.json`、`lib/blog.ts`、站点地图代码），**数据库行用脚本增量推送**：

1. 演练（只读）：`REMOTE_DATABASE_URL=... npm run de:push`，确认「405 documents / 363 descriptions、目标现有 0、无孤儿简介」
2. 写入：同上加 `--apply`（可加 `--backup <文件>` 先保存目标现有 de 行）；脚本在单事务里只 upsert `locale='de'` 的行，**不 TRUNCATE、不动 zh/en/tw 与结构化数据**
3. 再部署/重建应用：`/de` 路由是构建期按 `catalogs.ts` 枚举的，构建时 `DATABASE_URL` 指向生产库，新语言页面才会被预渲染
4. 验证：`/de`、`/de/blog`、`sitemap.xml` 里的 `hreflang="de"` 与 `/de/...` 条目；回滚只需删除目标库 `locale='de'` 的行

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
| 同上（德语） | 英文列 + `lib/i18n/de-vocab.json` | 渲染期套德语词表（Peking、München、Ostasien），无 `_de` 列 |
| 同上（法语 / 韩语） | 英文列 + `lib/i18n/fr-vocab.json` / `ko-vocab.json` | 渲染期套法语 / 韩语词表（Pékin、Munich / 베이징、뮌헨），无 `_fr` / `_ko` 列 |
| 同上（意大利语） | 英文列 + `lib/i18n/it-vocab.json` | 渲染期套意大利语词表（Pechino、Monaco di Baviera、Stati Uniti），无 `_it` 列 |
| 同上（繁体） | `airports.name_tw` / `city_tw`、`countries.name_tw` / `region_tw` | 由中文源转换生成，见「派生语言」 |
| 机场简介 | `airport_translations(airport_iata, locale, description_md)` | 按语言存放的 Markdown，当前 1452 条（zh/en/tw/de 各 363） |
| 机场照片说明 | `public/photos/captions.de.json`（德语） | 由 `captions/<IATA>.json` 的英文说明翻译；缺条目回退英文，繁中走生成的 `captions.tw.json` |
| 机场照片说明（法 / 韩） | `public/photos/captions.fr.json` / `captions.ko.json` | 同德语，缺条目回退英文 |
| 机场照片说明（意） | `public/photos/captions.it.json` | 同德语，缺条目回退英文 |
| 航站楼名称、登机口范围 | `terminals.name_en` / `gate_range_en` | 由 `db/terminology/en.json` 词典 + 规则翻译填入；德语 / 法语 / 意大利语 / 韩语再套各自 `*-vocab.json` 的 `terminals` 与规则 |
| 设施 / 航站楼设施标签 | `*.label_en` | 同上（封闭词表） |
| 航司列表 | `terminals.airlines_en` | **可空**；为空时英文页面不显示该行 |
| 地面交通 | `ground_transport.name_en` / `description_en` | **可空**；为空时页面显示交通方式标签（Rail / Bus / Taxi …，德语 Bahn / Bus / Taxi …，法语 Train / Bus / Taxi …，意大利语 Treno / Bus / Taxi …） |
| 搜索 | `airports.search_blob` | 含全部语言的名称，因此**在英文站搜索「北京」也能命中** |

两条刻意的取舍：

- **封闭词表逐条校验。** `db/terminology/en.json` 覆盖全部 49 个航站楼名称、13 个设施标签与 6 个交通方式，`node scripts/seed.mjs` 会校验完整性并在缺失时报错；登机口范围（117 种）走规则翻译（`X 廊` → `Concourse X`、`X 厅` → `Hall X`），翻译后若仍残留中日韩字符则直接失败。
- **不机翻编辑性文案。** 航司列表与地面交通名称为中文编辑内容，英文没有可用译文，因此对应字段留 `NULL`，界面回退到**与语言无关**的信息（登机口数、交通方式），**不会在英文页面显示中文**。要本地化这部分，只需在 `db/terminology/en.json` 的 `airlines` / `transit` 下补上条目（当前为空），无需改代码。种子脚本最后会打印 `untranslated (en)` 统计，让缺口可见而不是静默。

英文机场简介同样是**从结构化字段生成**（航站楼数、登机口数、旅客量、距离、交通方式），而非机器翻译，便于逐句核对；有正式译文时直接替换该字段即可。德语简介走同一条路径（`scripts/_de.mjs`），由 `db:seed` 一并写入。

## 内容文档（content_documents）

机场指南、国家介绍与静态页的长文都存放在 PostgreSQL 的 `content_documents` 表，一行一份文档，键是 `(kind, subject, locale)`：

```
kind='airport'  subject=IATA       机场指南（zh/en/tw 各 366 行；de 363 行，由生成器产出）
kind='country'  subject=ISO 代码   国家 / 地区机场介绍（37 行 / 语言）
kind='page'     subject=页面 slug  静态页 about / contact / sources / privacy / terms（5 行 / 语言）
```

2026-10-14 之前这些是 `content/<locale>/{airports,countries,pages}/*.md` 文件（1224 个）；移入数据库的原因是加一种语言只需要插行、项目不再随语言数成倍膨胀。读写都在 `lib/content.ts`（异步查询；缺译文回退 `SOURCE_LOCALE`，德语回退英语，见「无数据库列的语言」）。

编辑与备份：

- `npm run content:export [-- --locale zh --out <目录>]`：把行导出成 `content/<locale>/<kind>/<subject>.md` 树（文件格式与迁移前一致，含 `AUX_.md` 这类 DOS 保留名的拼写），用于备份、评审或交给译者；不传 `--out` 时落在仓库内的 `content/`（已 gitignore）。
- `npm run content:import [-- --dir <目录> --only zh,en --dry-run --prune]`：把 `.md` 树导入 / 更新回数据库（按 `(kind, subject, locale)` upsert）；校验树与库完全一致用 `npm run content:export -- --check <目录>`。
- `npm run content:export -- --json <文件>`：单文件 JSON 快照，适合归档。
- 数据库本身是唯一事实来源：**备份用 `pg_dump`**（或上面的 export）。仓库 git 历史里保留着迁移前的全部 Markdown。

Field 语义：`title` / `summary` / `updated` 对应迁移前的 frontmatter（`summary` 用作 meta description，`updated` 是编辑修订日期，页面的 dateModified 与站点地图 `<lastmod>` 都由它参与），`body` 是 Markdown 正文。

### 渲染

- `components/Markdown.tsx` 用 `react-markdown` 渲染成 **React 元素**（不注入 HTML，因此内容无法引入脚本），并启用 `remark-gfm` 以支持表格、删除线与自动链接。
- 排版样式在 `app/globals.css` 的 `.md` 规则下，沿用站点设计系统。
- 宽表格（英文 4 列航站楼表）会被包进 `.md-table-scroll` 横向滚动容器，不会把页面撑宽。
- 外链自动加 `target="_blank" rel="noopener noreferrer"`。
- 缺失的语言回退到 `SOURCE_LOCALE`（`lib/content.ts`），该语言与源语言都没有行时才返回 `null`。

### 指南与介绍都是可选的

- **机场指南**：`kind='airport'` 的行存在时，机场页多出一个「机场指南 / Airport guide」区块；不存在则整块不渲染。当前 363 座机场各有 zh/en/tw 三行指南（另有 MEL、SZX、TPE 三份指南留在库里但目录中没有对应机场，不渲染）。**新增一篇指南＝插入（或导入）一行**，无需改代码；数据驱动的起步稿由 `scripts/generate-airport-guides.mjs` 直接写库。
- **国家机场介绍**：国家页的「机场介绍」区块**始终渲染**——开头段落由数据库字段拼出（机场数、航站楼数、登机口数、最繁忙机场、分布城市），因此 92 个国家 / 地区没有任何文档也有介绍；`kind='country'` 的行存在时，长文追加在同一段正文里（当前 37 个）。各语言**成对维护**——`getCountryIntro` 在该语言缺行时会回退到中文，只写中文会让英文页出现中文长文。

两类内容都只写本站数据（航站楼构成、登机口字母规律、旅客量、距离、交通方式），不含臆测细节。

## 读者评论

内容页（机场、国家、博客、about / contact / sources / privacy / terms）底部都有评论区；首页、目录页、航线页、航班页与工具页没有。

- **存储**：`comments` 表（`db/schema.ts`），一行一条。线程键是 `(page_kind, page_key, locale)`——同一座机场的英文页和德文页是两个独立线程，读者各自用页面语言交流。`status` 为 `visible` / `hidden`，公开 API 只返回 visible。
- **接口**：`GET /api/comments?kind=airport&key=JFK&locale=en` 取线程；`POST /api/comments` 提交 `{ kind, key, locale, author, body, website }`，其中 `website` 是蜜罐字段、必须为空。提交即显示，不做先审后发。
- **防滥用**：蜜罐、每 IP 10 分钟 5 条（`COMMENTS_IP_SALT` 加盐后只存哈希，不存明文 IP）、正文最多 2 个链接、作者 2–40 字 / 正文 5–2000 字；2 分钟内同人同文的重复提交直接返回上一条，双击不会写两条。
- **审核**：`node scripts/comments.mjs list --all` 看最近评论，`hide <id>` 隐藏（`show <id>` 恢复），`delete <id>` 永久删除。
- **渲染**：评论区是客户端组件（`components/Comments.tsx`），页面本身仍是静态 / ISR，留言在挂载后拉取，因此新评论不需要重新构建；日期用页面 `htmlLang` 格式化。评论按纯文本渲染（React 转义，不支持 Markdown / HTML），不会引入脚本。
- **首页入口**：Journal、Terminal Maps、Airport guides 三个区块的卡片显示该页面评论数（`components/CommentCount.tsx`），一次批量查询取数；数字随首页的 1 小时 ISR 刷新，卡片上的评论内容仍以详情页为准。

## 目录结构

```
app/
  [locale]/
    layout.tsx              语言布局：<html lang/dir>、顶栏、页脚、AdSense 脚本、回到顶部
    page.tsx                首页：搜索英雄区 → 网站介绍 → 世界地图 → 工具 → 功能分区 → 热门 → 航线 → 指南 → 最近更新 → 国家网格 → 列表与表格
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
  content.ts                内容文档读取（content_documents 表，见「内容文档」）
  i18n/                     config（语言注册表）、catalogs（已发布语言）、messages/{zh,en,de,tw}、
                            de-vocab.json（德语词表）、de-data.ts（词表查找）、display.ts（标点 / 数字 / 维基语言）
  format.ts geo-convert.ts  按语言格式化 / 坐标与距离数学（纯函数，前后端共用）
  terminal-map.ts map-images.ts route-images.ts  航站楼示意图 SVG / 封面图索引 / 航线渲染图索引
  airport-geo.ts airport-links.ts encyclopedia-links.ts 坐标时区、官网、百科外链三张静态表
db/schema.ts                Drizzle 表结构（表、索引、约束）——结构的唯一来源
db/terminology/             封闭词表：en.json（航站楼 / 设施 / 交通方式）、tw-phrases.json（台湾用法例外）
db/extensions.sql           pg_trgm 扩展（建表前应用）
db/custom.sql               search_blob 触发器与 directory_stats 视图（建表后应用）
drizzle/                    生成的迁移与快照（需提交）
data/                       航线原始数据、目录批次输入、world-airports.csv
proxy.ts                    语言重写与重定向（Next 16 的 middleware）
scripts/                    提取、建库、灌数、抓取与自检脚本
```

长文内容（机场指南 / 国家介绍 / 静态页）在数据库表 `content_documents` 里，见上文「内容文档」。

## 航线数据与航线页

- 原始数据是 **OpenFlights 的 2014-06 快照**（ODbL，67663 条原始航线 → 62793 条直飞航线，覆盖 2643 座机场、499 家航司），由 `scripts/fetch-routes.mjs`（**脚本不在仓库里**，`data/airport-routes.json` 已提交）生成 `data/airport-routes.json`（约 1.7MB，**只在服务端从磁盘读取，不进浏览器包**）。页面会打印数据快照日期，因为这份数据不新。
- 目的地的坐标与英文地名来自 `public/data/world-airports.json`（同一份首页地图索引）；本站目录收录的目的地则换成本站自己的译名。站点 363 座机场里有 **224 座有航线数据**，只有这些才生成 `/route/<IATA>` 页面（其余不在 `generateStaticParams` 里，直接 404）。
- 航线页（`components/airport/RouteMapSection.tsx`）由三块组成：**Leaflet 航线图**、**目的地表**（城市、国家、距离、执飞航司）、**数据下载**（`/api/routes/<IATA>` 的 CSV / JSON，普通 `<a download>`，无 JS 也可用；CSV 带 BOM 以便 Excel 正确识别中文）。
- 航线图的交互（`components/airport/RouteMap.tsx`）：主题化的 ± 缩放按钮（到边界自动禁用）、⌘/Ctrl + 滚轮与触控板捏合缩放（普通滚轮留给页面滚动，地图不抢），**目录收录的目的地圆点本身就是指向该机场页面的真实链接**（可中键 / 右键新开标签），未收录的目的地只有悬停提示。颜色分级见 `lib/route-tiers.ts`（按执飞航司数量）。
- 首页的航线条目用**静态渲染图**（`public/route/*.png`，由 `node scripts/generate-route-images.mjs` 生成）：世界地图轮廓 + 大圆航线，处理了反子午线，缺图时回退为纯文字卡片。取景是**固定的世界全图**（经度 −180~180 横跨整幅、赤道居中），因此每张图的海岸线都落在同一位置、航线朝哪个方向飞一目了然；新增渲染图时不要改成按航线范围缩放。机场页的「航线图」区块用的是同一批图：该机场有渲染图时，图片本身就是通往 `/route/<IATA>` 的链接（`components/airport/RouteMapTeaser.tsx`，与航线页的航站楼地图卡片同一套样式），没有则回退为按钮——**站点目前只有 13 座机场有图**（首页那 12 座 + ICN），所以这条区块的样子本来就因机场而异。

## 航班数据与航班板

- 航班号来自 **aviability.com 的航班 sitemap**：`https://aviability.com/sm/updated-flights-en.xml.gz`（最近更新的航班，带 `lastmod`）与 `_flight-en-00..18.xml.gz`（全量索引，经 `_sitemap-index-en.xml.gz` 发现）。`node scripts/fetch-flights.mjs` 下载、解压并解析出 `航班号 / 航司 / 出发地-目的地`，**只保留目录机场的进出港航班**，写成 **`data/flights.json.gz` 一个文件**（当前 408 座机场、316,278 个航班号、527,236 条航线，约 2.4MB）。文件里的 `airlines` 是航司 slug → 显示名，`airports` 是各机场的进出港计数，`totals` 与 `dataDate` 是覆盖率与数据快照日期。
- 数据只存一份：`flights` 是 `[航班号, 航司 slug, 出发地 IATA, 到达地 IATA]` 的单一数组，按「航班号（数字序）→ 出发地 → 到达地 → 航司」排序。机场板过滤出本场为出发地或到达地的记录，`/flight/<number>` 过滤出同一航班号的记录，两者都不需要各自的副本；以前每座机场一个文件加 578 个号码分片，同一条航线要写三遍（出发板、到达板、号码分片），合并后文件从约 5.9MB 降到约 2.4MB。
- `lib/flight-store.ts` 在服务端把整个文件读取、gunzip 并只解析一次，然后**按需建两份内存索引**（机场板用 `byAirport`，航班页用 `byNumber`），索引里放的是同一批记录数组的引用而不是副本。`lib/flights.ts` 负责机场板与对端机场名称（`public/data/world-airports.json` + 目录译名 + 德/法/意/韩词表），`lib/flight-page.ts` 负责 `/flight/<number>` 的航线、距离与相关航班。机场页只**服务端渲染第一页**（20 条，保证无 JS 与爬虫可见）；搜索、翻页、切换出发/到达走 `/api/flights/<IATA>?locale=&dir=&page=&q=`，避免把一座枢纽几万条航班号塞进 HTML。
- **sitemap 不含起降时刻**，所以页面只展示航班号、航司与航线，并明确标注不含时刻；索引里同时有**代码共享航班号**（同一航线可能出现多家航司的号），页面按「航班号」统计而不是按实际执行班次，脚注里写明这一点。
- 覆盖范围随目录变化：当前 501 座机场里 408 座有航班数据；没有数据的机场，航班区块、目录项与相关 FAQ 一起自动省略。
- 每个航班号还有一个独立页面 **`/flight/<number>`**（如 `/flight/aa100`、`/zh/flight/aa100`，大小写不敏感、规范为小写）：按 `app/[locale]/flight/[number]/page.tsx` 的机场页式结构展示头部、概览、**Leaflet + OpenStreetMap 航线地图**（大圆航线、起降点与 `Leaflet | © OpenStreetMap contributors` 归属；任一场缺坐标时退化为航线示意图）、起降机场卡、航班信息、同号全部航线（代码共享号可能有几十条）、同航线其他航班、FAQ 与 schema.org `Flight`/`FAQPage`。数据与机场板共用同一份内存索引，页面是 **ISR 动态路由**（`revalidate = 3600`），不参与 `generateStaticParams`，所以 31 万个号码不会拖慢构建；这些页面也不写入 sitemap（单文件放不下，且多数是长尾航班号），靠机场航班板和同航线相关航班的内链发现。机场航班板上的航班号现在都指向这些页面，页面再外链到 aviability 的原始航班页。
- 刷新数据后重新构建即可；脚本会整体重写 `data/flights.json.gz`，并清掉旧的 `data/flights/` 目录，生成结果与代码一起提交。

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
| `maps/`（558 张） | 机场封面图，`lib/map-images.ts` 按 IATA 索引；机场页下载按钮与首页图片位使用。其中 296 张由 `node scripts/generate-airport-maps.mjs` 用 OpenStreetMap 几何生成（ODbL，图上带 `© OpenStreetMap contributors`，溯源在 `scripts/maps-manifest.json`），其余是第三方下载图。目录里只有图片 |
| `source-maps/`（558 张） | 上者的原始大图（宽 2000px），供需要原尺寸的场景。363 座机场里 **362 座有封面**，只有格陵兰的直升机场 LLU 在 OSM 里没有任何几何（见 `node scripts/check-maps.mjs`） |
| `terminal-maps/{CODE}/`（63 座） | 航站楼平面图 PNG + PDF，带 `terminal-maps-manifest.json` 溯源（来源、sha256、许可说明）；缺文件时图片回退到封面或 SVG 示意图、PDF 回退到搜索 |
| `route/`（13 张） | 航线图的静态渲染图：首页航线条目那 12 座，加上机场页航线区单独渲染的 ICN（`scripts/generate-route-images.mjs --codes ICN`） |
| `terminal-maps.png` | 首页「网站介绍」区块的照片（`components/HomeIntro.tsx`，1023×600） |
| `flags/`（92 张） | 国家 / 地区旗帜（与 `countries` 数量一致） |
| `data/world-airports.json`、`world-airport-map.jpg` | 首页地图索引与英雄区世界地图底图（`components/HeroRoutes.tsx` 在它上面用服务端 SVG 画大圆航线动画，`prefers-reduced-motion` 时静止） |

另有 `lib/airport-geo.ts`（60 座机场的坐标与 IANA 时区，用于时间 / 详情 / 定位图区块）、`lib/airport-links.ts`（75 条机场官网）、`lib/encyclopedia-links.ts`（维基百科 / 百度百科外链）三张静态表——机场表里没有这些字段，缺失时对应按钮不渲染（错链接比没链接更糟）。

## 站点地图与 SEO

- 每个已发布语言 × 每座机场 / 国家 / 有航线的机场都是预渲染页面（`generateStaticParams`），`revalidate = 3600` 每小时增量再生成；每个语言约 690 个页面（363 机场 + 92 国家 + 224 航线页 + 11 个固定页）
- `<title>` / `description` 按语言与机场数据生成；机场页标题用 `latestAirportTitle` 带当前年份（随 ISR 滚动）
- 结构化数据：`WebSite` + `SearchAction`（首页）、`Airport` + `BreadcrumbList` + `FAQPage`（机场页）、`Country` + `ItemList` + `BreadcrumbList` + `FAQPage`（国家页），均带 `inLanguage`；品牌名统一为 `World Airport Maps`（`lib/site.ts` 的 `SITE_NAME`），可见文案可本地化，机器可读字段只有一种拼法
- **结构化数据里的图片**（`lib/schema-images.ts`）：每页给的是它自己显示的那张图——机场页用 `public/maps` 的封面，航线页用 `public/route` 的航线渲染图，站点身份节点（`Organization` / `WebSite`）与没有专属图的页面（国家页、没有封面的机场、没有渲染图的航线页）用 `public/world-airport-map.jpg`。写在 `WebPage.image` + `primaryImageOfPage` 与被描述实体（`Airport`）的 `image` 上，国家页的机场 `ItemList` 也逐条带封面。两个要点：URL 一律用绝对地址（`absoluteUrl`），且**只输出真实存在的文件**——封面与渲染图都走 `lib/map-images.ts` / `lib/route-images.ts` 的目录索引，没有就退回站点大图，不产出 404 的图片地址（363 座机场里 LLU、AUX 没有封面，给的就是大图）
- 机场页 FAQ 由数据库字段按语言生成（航站楼构成、距市中心距离、如何进市区、设施、所属城市国家），同时用于页面展示与 `FAQPage` 富结果；国家页 FAQ 同理
- 首页的 `#facts` 区块把同一批数据再写成 **`<dl>` 与 `<table>`**（`components/HomeFacts.tsx`）：AI 引擎与摘要式搜索更容易从列表 / 表格里抽事实，纯段落文案则难。带 `caption` 与 `scope`，机场名是通往详情页的真实链接
- `sitemap.xml` 为**每个已发布语言的每个地址**各输出一条 `<url>`（`/airport/PEK`、`/de/airport/PEK`、`/zh/airport/PEK`、`/tw/airport/PEK` 都是独立的 `<loc>`），每条都带完整的 `xhtml:link` alternates 与 `x-default`；博客只列出真正有译文的那几种语言。`robots.txt` 屏蔽 `/api/`

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
8. **机场指南**（`#guides`）：有 Markdown 指南的机场，展示客流最大的 12 座，无指南时整段不渲染。
9. **最近更新**（`#recent`，按 `updated_at` 倒序）。
10. **按国家分类**（`#countries`）：国家 / 地区网格。
11. **列表与表格**（`#facts`，`components/HomeFacts.tsx`）：把同一批数据写成真正的 `<dl>` 与 `<table>`——「收录概览」七项（机场 / 国家地区 / 大区 / 城市 / 航站楼 / 登机口 / 航线图），「年旅客量最大的机场」12 行（排名、IATA、机场、城市、国家、航站楼、登机口、年旅客量，机场名链到详情页），以及「机场的大区分布」（按 `airports.region` 汇总机场 / 航站楼 / 登机口）。数据全部来自首页已经加载的 `airports` 与 `stats`，不额外查库；航线数用「目录内且有航线数据的机场数」（224），不是航线文件里全世界的 2643。两张表都有（视觉隐藏的）`caption` 与 `scope`，窄屏在 `overflow-x-auto` 容器里横向滚动。

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
- **内容必须中英成对**：只写中文的 `content_documents` 行（`kind='country', locale='zh'`）会让英文页出现中文长文（回退目标是 `SOURCE_LOCALE`）。德语是例外：它回退到**英语**（`lib/content.ts` 的 `localeChain`），所以缺德语译文时宁可显示英文，也不显示中文。
- **同名 i18n 键会在编译期强制补齐**：`Messages` 类型派生自中文目录，英语 / 德语目录少一个键就过不了 `npm run typecheck`。
- 已知未修的同类问题：首页地图的 `.leaflet-container { font: inherit; background: #0d1b2a }` 仍在 components 层里，因此被 Leaflet 自己的字体 / 底色盖住（影响仅限地图内文字字体与瓦片间隙底色）。

## 部署提示

- **构建阶段会访问数据库**预渲染全部页面，因此 `npm run build` 需要可用的 `DATABASE_URL`；连接数紧张时用 `PGPOOL_MAX` 调小池子。
- 上线前设置 `NEXT_PUBLIC_SITE_URL`（当前生产域名 `worldairportmap.com`），否则 `canonical`、`hreflang`、`sitemap.xml` 与结构化数据会指向 `localhost`。`next.config.ts` 的 `allowedDevOrigins` 只为开发期热更新放行该域名，构建与生产不受影响。
- 站点主语言由 `DEFAULT_LOCALE` 决定，切换它只需改一处；裸路径重定向、`x-default`、站点地图与切换器顺序都会跟随。
- `name` 排序依赖数据库排序规则。本机 PostgreSQL 使用 `Chinese (Simplified)_China.936`，因此中文机场名按拼音排序；英文站按 `name_en` 排序。若部署环境 collation 不同，中文排序顺序会随之变化。
- AdSense 的发布商 ID 目前硬编码在 `app/[locale]/layout.tsx` 的脚本标签里，与 `public/ads.txt` 保持一致；换账号需要同时改两处。

## 数据来源说明

航站楼平面示意图是按航站楼数量、登机口规模与地面交通节点自动绘制的**示意图**，用于快速理解机场整体布局与航站楼之间的关系，不是精确到米的实测平面图。航站楼数量、登机口数量、主要航司、年旅客量与地面交通信息整理自公开资料，可能随机场改扩建发生变化。航线数据为 OpenFlights 2014-06 快照（ODbL），仅统计直飞，页面顶部会标注快照日期。航班号与航线来自 aviability.com 的航班索引（sitemap 快照，含代码共享），页面会标注快照日期且不提供起降时刻。第三方图片（航站楼地图、封面图）的来源与许可记录在各自的 manifest 里。

## 从原静态版本迁移

迁移时用一次性脚本从 `legacy/index.html` 解析出原来的 `COUNTRIES` 与 `AIRPORTS` 字面量，校验后写入 `scripts/legacy-data.json`（37 个国家 / 地区、60 座机场、174 座航站楼；脚本本身已从仓库移除，数据文件保留）。`scripts/seed.mjs` 再灌进数据库，并在过程中校验：国家代码存在、每座机场至少一座航站楼、旅客量与距离可解析、各航站楼登机口数之和与机场总数是否有出入、翻译词表是否完整（`db/terminology/<locale>.json` 的每个键都要有值）。

`legacy-data.json` 只在重建数据库时被 seed 读取；日常新增机场走 `node scripts/seed.mjs --add-airports`（只插缺的行，不动已有数据），改动已有数据才需要全量重建（`node scripts/seed.mjs`）。

## 移植过程中修掉的问题

原型里的缺陷，样式部分保留在 `app/globals.css`，修正也一并写在同一个文件里并附注释：

1. **小屏无法导航**：原样式在 `max-width:820px` 时用 `display:none` 同时隐藏 `.topnav` 和 `.top-search`，窄屏下没有任何入口跳转到其他页面。现在导航变成可横向滚动的胶囊条，搜索框作为独立一栏保留在顶栏下方。
2. **列表行在小屏被裁切**：`.airport-table{overflow:hidden}` + `img{max-width:100%}` 落在 `auto` 轨道上使国旗列塌缩为 0 宽并把按钮挤到第二行；`.nm` 缺少 `min-width:0`，超长机场名（nowrap）会把行撑出容器。
3. **地面交通图标配色失效**：`.transit-row span`（0,1,1）优先级高于 `.transit-icon`（0,1,0），把图标重新刷成了 `--ink-soft` 灰色，而不是设计意图的 `--sky-600`。
4. **「最近更新」缺条目**：原版本这一栏用的是硬编码 IATA 列表，其中 OKC、HPN 并不在数据集里，实际只渲染出 3 条；现在按 `updated_at` 倒序查询。
5. **长文案下的横向溢出**：加入英文后，多处布局被更长的英文文案撑破（国家卡片的计数徽章、`.related-card` 的 nowrap 机场名、`minmax(300px,1fr)` 的网格轨道下限、「最近更新」行的固定列、区块标题与「more」链接同一行等）。全部在 320 / 360 / 390 / 480 / 640 / 768 / 1024 / 1280 / 1440px 两种语言下实测修正，现在**无横向溢出**。这类问题在任何「中文站加语言」的场景都会出现，修法都写在 `app/globals.css` 的注释里。
