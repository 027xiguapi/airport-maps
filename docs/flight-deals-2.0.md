# Flight Deals 2.0 — WorldAirportMap 改造方案

> 基于对 `H:\me\airport-maps` 仓库与线上库的实测（2026-10-30），不是通用模板。
> 目标：保留机场地图与现有 `/deals`，把「人肉发布特价」升级为「可验证的实时报价 + 价格历史 + 联盟归因」。

---

## 0. 结论先行

1. **技术栈不是 Next.js 独立应用，而是 Vinext 1.4（Vite 8 插件）跑 Next.js App Router 约定**：`next` 16.3.5 只作为 next-auth 的 peer 依赖保留。生产命令是 `vite build` + `vinext start`，不是 `next start`。
2. **不需要新建「机票网站」，也不需要新建 `deals` 表**。`deals` 已经是「一条报价 = 一行」的成熟模型（含官方票价卡、社区投稿、过期时间、`nofollow sponsored` 外链）。
3. **你那份方案里「特价数据主要是用户提交的」不成立**：线上 153 条**全部是官方票价卡**（`is_official = true`），社区投稿 **0 条**，全部为国泰航空、往返、不含税、人民币 540–3870，覆盖 16 个**中国**出发机场。真正缺的不是「用户发布」，而是**机器采集 + 价格验证 + 历史价格 + 点击归因**。
4. **「美国出发」不是对现有业务的升级，而是第二个市场**：站点默认语言是英语（裸路径）、已发布 7 种语言，但特价库存是中国出发的人民币票价卡。美国出发 = 新增一套 USD 口径的报价源，必须与现有 CNY 卡片**分开展示、分开筛选**，否则「$300 以下」会被汇率和含税口径污染。
5. 最省事的落地顺序：**先建报价数据层与已验证报价 UI（用 fixture 假数据跑通）→ 再接第一个联盟数据源 → 最后做机场页/地图曝光与联盟归因**。不要第一天就接 API 并全量铺机场。

---

## 1. 实际技术栈（已核实）

| 层 | 实际选型 | 证据 |
| --- | --- | --- |
| 运行/构建 | **Vinext 1.4**（`vinext()` Vite 插件）+ Vite 8 + `@vitejs/plugin-rsc`；Next.js 约定（RSC、Route Handler、ISR、`proxy.ts`） | `vite.config.ts`、`package.json` scripts |
| 框架版本 | React 19.3.1、Next 16.3.5（仅回退 + next-auth 依赖） | `package.json` |
| 语言 | TypeScript 5，`tsc --noEmit` 做类型门禁 | `tsconfig.json` |
| 数据库 | PostgreSQL 13+，`pg` 8.16.3 连接池 + **drizzle-orm 0.45.2** / drizzle-kit 0.31.10 | `lib/db.ts`、`drizzle.config.ts` |
| 查询风格 | Drizzle 只管 DDL；列表/搜索/详情是**手写 SQL**（窗口函数、`LATERAL`、`ILIKE ... ESCAPE`） | `lib/db.ts:46-65` 的注释 |
| 鉴权 | next-auth 5.0.0-beta.32（Google OAuth + JWT 会话），自有 `users/sessions/auth_accounts` 表 | `lib/auth.ts` |
| 样式 | Tailwind CSS v4（CSS-first，单一 `app/globals.css`） | `app/globals.css` |
| 地图 | Leaflet 1.9.4 + OSM 瓦片，无 API key | `components/AirportMap.tsx` |
| 变现 | Google AdSense（布局里注入脚本 + `public/ads.txt`） | `lib/site.ts`、`README` |
| 部署 | 2C/2GB 单机，PostgreSQL 同机；`scripts/build.mjs` 把 V8 堆限制在 768MB | `scripts/build.mjs` |
| 国际化 | 24 个注册语言、**7 个已发布**（en 默认裸路径、zh、tw、de、fr、it、ko），`proxy.ts` 做 rewrite | `lib/i18n/config.ts`、`lib/i18n/catalogs.ts` |

**这意味着两件事**：

- 新增页面就是新增 `app/[locale]/...` 路由，SEO 的 canonical/hreflang 用现成的 `localizedPath()` + `languageAlternates()`，不要自己拼 URL。
- **绝不能**在 Next 请求链路里同步调机票 API：单机 2GB、`vinext start` 常驻约 320MB，任何慢上游都会把整个站拖死。采集必须是独立进程。

### `package.json` 关键部分（原文）

```jsonc
{
  "scripts": {
    "dev": "vite dev --port 3003",
    "build": "node scripts/build.mjs",      // vite build + 768MB 堆限制
    "start": "vinext start -p 3003",
    "deals": "node scripts/deals.mjs",      // 审核 CLI：list/hide/show/delete/expire
    "flights:fetch": "node scripts/fetch-flights.mjs",
    "db:push": "drizzle-kit push",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate"
  },
  "dependencies": {
    "next": "16.3.5", "react": "19.3.1", "vinext": "^1.4.0",
    "drizzle-orm": "^0.45.2", "pg": "^8.16.3", "next-auth": "5.0.0-beta.32",
    "leaflet": "^1.9.4", "tailwindcss": "^4.3.3"
  }
}
```

### 现有数据流（已实现）

```
airports(516) ──< deals(153, 全 official)        /deals、/deals/new、/deals/mine、/airport/[code]#airport-deals
      │                                          /admin/deals（新建/编辑/整表粘贴导入/批量删除）
      ├──< terminals / airport_facilities / ground_transport
      ├── airport_translations / content_documents（多语言长文）
      └── data/flights.json.gz（航班号索引，516 机场去程/到达，无票价、无时刻）
```

`/airport/[code]` 已经渲染两段：`FlightsSection`（航班号板）和 `AirportDeals`（该机场出发的特价），并且 `AirportDeals` 在无报价时整段隐藏（`components/airport/AirportDeals.tsx:22`）。

---

## 2. 与你那份方案的逐条对照

| 你的假设 | 实测 | 处理 |
| --- | --- | --- |
| 已有 516 机场 / 101 国家 | ✅ `airports` 516 行、101 个 `country_code` | 复用，不重建 |
| 已有 367 个机场航线图 | ✅ 航线图是预生成 PNG/JSON（`lib/routes.ts`、`routeAirportCodes()`） | 复用 |
| 「Flight Deals 已有，用户发布入口已有」 | ⚠️ 入口在，但**没有一条社区投稿**；153 条全是官方票价卡 | 保留入口，但先解决「没人发」的冷启动 |
| 「特价数据主要是用户提交，有人民币/往返/不含税」 | ⚠️ 人民币/往返/不含税都对，但来源是**官方票价卡导入**（`importAdminDeals`） | 不要把社区与官方混为一谈，UI 上已有区分（`isOfficial`） |
| 「报价未经验证」 | ✅ `/deals` 页有 `disclaimer` 文案 | 新增「已验证/N 小时前核验」状态，与现有文案并存 |
| 「`/deals` 保持不动」 | ✅ 可以 | 只在页面内加筛选与「已验证」区块，URL 不变 |
| 「新增 `/deals/under-100` 等」 | ✅ 可行 | 但要明确：**只筛 USD 口径的机器报价**，不筛 CNY 票价卡 |
| 「机场页显示特价」 | ⚠️ **已经做了**（`AirportDeals`），但页面是 `revalidate = 3600` | 改成客户端刷新，见 §6 |
| 「地图上加特价开关」 | ✅ 未有，`components/AirportMap.tsx` 是 Leaflet | 新增 `/api/fare-airports` + 图层开关，不引新依赖 |

### 一个必须现在就决定的定位问题

现有 153 条数据长这样（真实抽样）：

```
XIY → 多伦多  ¥3,870  国泰航空  往返  不含税  有订票链接
TAO → 多伦多  ¥3,870  国泰航空  往返  不含税
PVG(23) / WUH(22) / HGH(21) / NKG(18) / NGB(17) ... 共 16 个中国出发机场
```

而你的方案要卖的是 `JFK → MIA $79`、`JFK → LHR $199`。

**这是两条互不相交的供给线**：一条是国泰的中国区机票卡，一条是美国出发的 OTA/航司实时报价。同一张「$300 以下」列表里混入人民币往返卡，用户会立刻失去信任。

所以方案里所有价格筛选、排序、比价，**只作用于新的 `fare_offers`（USD 口径）**；`deals` 继续做「社区/官方票价卡」，用原有币种原样展示。这是本方案最重要的边界。

---

## 3. 数据模型：复用 `airports`，`deals` 不动，新增 4 张表

### 3.1 为什么采集数据不能写进 `deals`

| 问题 | 后果 |
| --- | --- |
| 采集是**覆盖式刷新**，`deals` 是**一次性发布** | 每天 UPDATE 价格会毁掉提交时间、提交人、审核状态 |
| 需要**价格历史** | `deals` 一行只有一个价格，历史必须另存；写进 `deals` 就是每天新增一行垃圾 |
| 需要**来源/深链/舱位/经停/时长/核验时间** | `deals` 的列是为「人填表」设计的，缺 8 个以上字段 |
| 社区内容需要**审核与署名** | 采集数据没有提交人，混在一起会让审核队列不可用 |
| 币种/含税口径不同 | `deals.currency` 允许 CNY，新报价统一 USD 归一化后才有意义 |

结论：新增 `fare_offers`（当前态）+ `fare_price_history`（时间序列）+ `fx_rates`（汇率）+ `affiliate_clicks`（归因），外加一张 `fare_provider_runs`（可观测性，强烈建议）。**共 5 张。**

### 3.2 关系图

```
countries 1 ──< airports(iata) 1 ──< fare_offers.origin_iata      (FK, ON DELETE CASCADE)
                       │                    │
                       │                    ├──< fare_price_history.fingerprint   (无 FK，按指纹)
                       │                    ├──< affiliate_clicks.offer_id
                       └──< deals(既有) ────┴──< affiliate_clicks.deal_id
                                                (点击表用 target_kind 区分两条供给线)

fare_offers.destination_iata  ← 不加 FK：全球 8.6 万机场，目录只有 516 个
fare_offers.destination_country ← 采集时冗余，用于 domestic 判定
fx_rates(currency, as_of) ← 每日一条，采集时把 price 换算成 price_usd 并记录 rate
```

### 3.3 Drizzle 定义（可直接粘进 `db/schema.ts`）

```ts
// -------------------------------------------------------------- fare offers
/**
 * 机器采集的实时报价「当前态」：一个 (provider, 指纹) 只有一行，每次核验就地
 * UPDATE，历史写进 fare_price_history。
 *
 * 与 deals 的分工：
 *   deals        = 社区投稿 + 官方票价卡，人工发布，原币种，一次性
 *   fare_offers  = 供应商报价，自动刷新，USD 归一化，可核验、可过期
 */
export const fareOffers = pgTable(
  'fare_offers',
  {
    id: serial('id').primaryKey(),
    /** travelpayouts | kiwi | amadeus | duffel | seed */
    provider: text('provider').notNull(),
    /** sha1(origin|dest|depart|return|cabin|trip|carrier)，同一报价的稳定身份 */
    fingerprint: text('fingerprint').notNull(),

    originIata: char('origin_iata', { length: 3 })
      .notNull()
      .references(() => airports.iata, { onDelete: 'cascade' }),
    destinationIata: char('destination_iata', { length: 3 }).notNull(),
    /** 冗余，domestic 判定与「美国国内」筛选都靠它 */
    destinationCountry: char('destination_country', { length: 2 }).notNull(),
    destinationCity: text('destination_city'),

    airlineCode: text('airline_code'),
    airlineName: text('airline_name').notNull(),
    /** 例如 "CX365,CX880"，用于卡片上的「经停 1 次 · 19h20m」 */
    flightNumbers: text('flight_numbers'),
    stops: integer('stops').notNull().default(0),
    durationMinutes: integer('duration_minutes'),

    /** 供应商原币价格；minor units 不统一，统一用 numeric(10,2) */
    price: numeric('price', { precision: 10, scale: 2 }).notNull(),
    currency: char('currency', { length: 3 }).notNull(),
    /** 采集时按 fx_rates 换算；筛选和比价只用这一列 */
    priceUsd: numeric('price_usd', { precision: 10, scale: 2 }).notNull(),
    /** 当次使用的汇率，审计用（1 单位币种 = 多少 USD） */
    fxRate: numeric('fx_rate', { precision: 12, scale: 6 }).notNull(),
    /** 供应商是否已含税；不含税的报价不进「$X 以下」列表 */
    taxIncluded: boolean('tax_included').notNull().default(true),

    cabin: text('cabin').notNull().default('economy'),
    tripType: text('trip_type').notNull().default('oneway'),
    departDate: date('depart_date', { mode: 'string' }).notNull(),
    returnDate: date('return_date', { mode: 'string' }),

    /** 联盟深链（含 subid/click 标记由 /go 路由注入，这里存干净目标） */
    deepLink: text('deep_link').notNull(),
    bookingPartner: text('booking_partner').notNull().default('airline'),

    /** 30/90 天中位价；冷启动阶段先用同航线 p25 兜底 */
    baselineUsd: numeric('baseline_usd', { precision: 10, scale: 2 }),
    discountPct: integer('discount_pct'),
    /** 0–100，= 折扣 + 绝对价格档 + 稀缺度，见 §7.3 */
    dealScore: integer('deal_score'),
    /** 是否达到「特价」门槛，列表默认只显示 true */
    isDeal: boolean('is_deal').notNull().default(false),

    firstSeenAt: timestamp('first_seen_at', { withTimezone: true }).notNull().defaultNow(),
    lastSeenAt: timestamp('last_seen_at', { withTimezone: true }).notNull().defaultNow(),
    /** 最近一次成功核验；UI 显示「2 小时前核验」 */
    verifiedAt: timestamp('verified_at', { withTimezone: true }),
    /** 起飞日 23:59 或采集 TTL，过期的报价不再展示 */
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),

    /** live | expired | hidden（hidden 是人工下架开关） */
    status: text('status').notNull().default('live'),
    /** 原始响应，便于复现；只留最近一版，写入前截断到 8KB */
    raw: jsonb('raw'),
  },
  (t) => [
    unique('fare_offers_provider_fingerprint_key').on(t.provider, t.fingerprint),
    /** 机场页 / 出发地页：出发机场 + 是否特价 + 价格 */
    index('fare_offers_origin_idx').on(t.originIata, t.status, t.priceUsd),
    /** /deals/under-100 等价格页与首页信息流 */
    index('fare_offers_price_idx').on(t.status, t.isDeal, t.priceUsd, t.departDate),
    /** 国内/国际筛选 */
    index('fare_offers_domestic_idx').on(t.destinationCountry, t.status, t.priceUsd),
    /** 过期清理与核验排队 */
    index('fare_offers_expiry_idx').on(t.status, t.expiresAt),
    index('fare_offers_verified_idx').on(t.verifiedAt.desc().nullsLast()),
    check('fare_offers_iata_upper_chk', sql`${t.originIata} = upper(${t.originIata})
      and ${t.destinationIata} = upper(${t.destinationIata})`),
    check('fare_offers_currency_upper_chk', sql`${t.currency} = upper(${t.currency})`),
    check('fare_offers_cabin_chk',
      sql`${t.cabin} in ('economy','premium','business','first')`),
    check('fare_offers_trip_type_chk', sql`${t.tripType} in ('oneway','roundtrip')`),
    check('fare_offers_price_chk', sql`${t.priceUsd} > 0 and ${t.priceUsd} <= 100000`),
    check('fare_offers_stops_chk', sql`${t.stops} between 0 and 4`),
    check('fare_offers_status_chk', sql`${t.status} in ('live','expired','hidden')`),
    check('fare_offers_window_chk',
      sql`${t.returnDate} is null or ${t.returnDate} >= ${t.departDate}`),
    check('fare_offers_link_len_chk', sql`char_length(${t.deepLink}) <= 2000`),
  ]
);

// --------------------------------------------------------- fare price history
/**
 * 只追加的价格观测：每个报价每天最多一行（唯一约束保证），用来算 30/90 天中位价
 * 和卡片上的「近 30 天最低」。过期读的清理靠 observed_on 分区/定期删除，不靠 UPDATE。
 */
export const farePriceHistory = pgTable(
  'fare_price_history',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    provider: text('provider').notNull(),
    fingerprint: text('fingerprint').notNull(),
    /** 观测日（UTC），一天一行 */
    observedOn: date('observed_on', { mode: 'string' }).notNull(),
    price: numeric('price', { precision: 10, scale: 2 }).notNull(),
    currency: char('currency', { length: 3 }).notNull(),
    priceUsd: numeric('price_usd', { precision: 10, scale: 2 }).notNull(),
    observedAt: timestamp('observed_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    unique('fare_price_history_key').on(t.provider, t.fingerprint, t.observedOn),
    /** 取某条报价最近 N 天的序列 */
    index('fare_price_history_series_idx').on(t.provider, t.fingerprint, t.observedOn.desc()),
  ]
);

// ---------------------------------------------------------------- fx rates
export const fxRates = pgTable(
  'fx_rates',
  {
    currency: char('currency', { length: 3 }).notNull(),
    asOf: date('as_of', { mode: 'string' }).notNull(),
    /** 1 单位该币种 = 多少 USD */
    usdPerUnit: numeric('usd_per_unit', { precision: 14, scale: 8 }).notNull(),
    source: text('source').notNull().default('ecb'),
  },
  (t) => [primaryKey({ columns: [t.currency, t.asOf] })]
);

// ---------------------------------------------------------- affiliate clicks
/**
 * 一次「点去订票」= 一行。只存哈希 IP 与截断 UA，不存原文；click_id 同时作为
 * 联盟 subid 回传，佣金报表按它 join。
 */
export const affiliateClicks = pgTable(
  'affiliate_clicks',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    clickId: uuid('click_id').notNull().defaultRandom().unique('affiliate_clicks_click_id_key'),
    /** offer = fare_offers，deal = deals（社区/官方卡片） */
    targetKind: text('target_kind').notNull(),
    offerId: integer('offer_id').references(() => fareOffers.id, { onDelete: 'set null' }),
    dealId: integer('deal_id').references(() => deals.id, { onDelete: 'set null' }),
    provider: text('provider'),
    partner: text('partner'),
    originIata: char('origin_iata', { length: 3 }),
    destinationIata: char('destination_iata', { length: 3 }),
    /** 点击发生在哪个页面：/deals、/airport/JFK、/deals/under-100 ... */
    pagePath: text('page_path'),
    locale: text('locale'),
    /** 国家来自 CDN/反代头（cf-ipcountry 等），没有就 NULL */
    countryCode: char('country_code', { length: 2 }),
    ipHash: text('ip_hash'),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('affiliate_clicks_created_idx').on(t.createdAt.desc()),
    index('affiliate_clicks_offer_idx').on(t.offerId, t.createdAt.desc()),
    index('affiliate_clicks_deal_idx').on(t.dealId, t.createdAt.desc()),
    check('affiliate_clicks_target_chk', sql`${t.targetKind} in ('offer','deal')`),
    check('affiliate_clicks_target_ref_chk',
      sql`(${t.targetKind} = 'offer' and ${t.dealId} is null)
          or (${t.targetKind} = 'deal' and ${t.offerId} is null)`),
  ]
);

// ------------------------------------------------------- provider run log
export const fareProviderRuns = pgTable(
  'fare_provider_runs',
  {
    id: serial('id').primaryKey(),
    provider: text('provider').notNull(),
    startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
    finishedAt: timestamp('finished_at', { withTimezone: true }),
    /** running | ok | partial | failed */
    status: text('status').notNull().default('running'),
    requests: integer('requests').notNull().default(0),
    offersSeen: integer('offers_seen').notNull().default(0),
    offersNew: integer('offers_new').notNull().default(0),
    offersUpdated: integer('offers_updated').notNull().default(0),
    errors: integer('errors').notNull().default(0),
    /** 失败原因摘要，最长 500 字符 */
    message: text('message'),
  },
  (t) => [index('fare_provider_runs_idx').on(t.provider, t.startedAt.desc())]
);
```

配套 `import { jsonb, uuid, bigserial } from 'drizzle-orm/pg-core';`（现有文件只引了部分）。

### 3.4 迁移方式

```bash
pnpm db:generate    # 生成 drizzle/0004_*.sql + snapshot
pnpm db:migrate     # 应用到库（先备份）
```

不要手写 `drizzle/meta/_journal.json`。`db:push` 只用于本地，线上走 `generate + migrate`。

### 3.5 老数据怎么办

**不动。** 153 条 `deals` 继续渲染在「Community / Official fares」区块，保留 CNY、往返、不含税标签。等新报价跑稳后，再单独决定这批国泰票价卡是否迁到 `fare_offers`（不建议：它们没有可核验的实时价）。

---

## 4. 读取层：两个区块，不改 `PublicDeal`

### 4.1 为什么不做 UNION

`PublicDeal`（`lib/deal-format.ts:35`）是 `DealCard`、`DealsBoard`、`/deals/mine`、`/api/deals` 共用的形状，`id` 是 `number`。如果 union 两条供给线：

- `id` 会撞车，要改成 `"offer:123"` 字符串 → 所有组件、API、表单全改；
- 币种/含税/核验语义不同，硬塞一个类型会出现「$199」和「¥540 不含税」并排比较；
- 验证状态、深链、经停、时长这些新字段只能挂成可选属性，类型越来越脏。

**推荐**：两个独立列表、两个组件，共享同一套卡片视觉。

```
/deals
├── Flight Deals（Verified）      ← fare_offers，USD，按价格/折扣排序，可筛选
├── Community Deals              ← deals，保持现状，入口「Post a deal」
└── 说明区（价格会变、核验时间、联盟链接披露）
```

`/airport/[code]` 同理：`#flight-deals`（新）在前，`#airport-deals`（既有）在后。

### 4.2 新增 `lib/fare-offers.ts`

```ts
export type FareOffer = {
  id: number;
  origin: { iata: string; city: string; name: string; countryCode: string; flagUrl: string | null };
  destination: { iata: string; city: string | null; countryCode: string; name?: string };
  airline: string;
  flights: string | null;
  stops: number;
  durationMinutes: number | null;
  priceUsd: number;
  baselineUsd: number | null;
  discountPct: number | null;
  cabin: DealCabin;
  tripType: DealTripType;
  departDate: string;
  returnDate: string | null;
  verifiedAt: string | null;
  /** 站内跳转，不是最终外链；见 §8 */
  bookHref: string;
};

export type FareFilters = {
  locale: Locale;
  underUsd?: number;            // 300 | 200 | 100
  scope?: 'domestic' | 'international' | 'all';
  origin?: string | null;       // 出发机场
  destination?: string | null;
  maxDepartDate?: string;       // 默认 today + 120
  nonstopOnly?: boolean;
  limit?: number;
  offset?: number;
};
```

列表 SQL（与现有 `listDeals` 同风格：窗口函数取 total，一次往返）：

```sql
select o.id, o.origin_iata, o.destination_iata, o.destination_country,
       o.airline_name, o.flight_numbers, o.stops, o.duration_minutes,
       o.price_usd::float8 as price_usd, o.baseline_usd::float8 as baseline_usd,
       o.discount_pct, o.cabin, o.trip_type,
       o.depart_date::text, o.return_date::text, o.verified_at,
       a.city as origin_city, a.name as origin_name,
       a.country_code as origin_country, c.flag_url,
       count(*) over()::int as total_count
  from fare_offers o
  join airports a on a.iata = o.origin_iata
  join countries c on c.code = a.country_code
 where o.status = 'live'
   and o.is_deal
   and o.tax_included
   and o.expires_at > now()
   and o.depart_date >= current_date
   and o.depart_date <= current_date + 120
   and ($1::text is null or o.origin_iata = $1)
   and ($2::char(2) is null or o.destination_country = $2)
   and ($3::numeric is null or o.price_usd < $3)
   and ($4::boolean is not true or o.stops = 0)
 order by (o.discount_pct is null), o.discount_pct desc nulls last,
          o.price_usd asc, o.depart_date asc
 limit $5 offset $6
```

`domestic` 判定：`o.destination_country = a.country_code`；`international` 取反。不要按「机场是否在目录里」判断，目的地大多不在 516 里。

### 4.3 缓存

| 位置 | 策略 |
| --- | --- |
| `/deals` 与筛选页 | 服务端渲染首屏 + `force-dynamic`（沿用现有做法），客户端挂载后 `fetch('/api/fare-offers')` 刷新 |
| `/api/fare-offers` | `Cache-Control: no-store`；SQL 就一次索引扫描，不需要缓存层 |
| `/api/fare-airports`（地图） | `s-maxage=300, stale-while-revalidate=600`，返回 `{ iata, minUsd, count }` |
| 机场页 | 页面保持 `revalidate = 3600`，**但特价区块用客户端刷新**（见 §6.1） |

---

## 5. 页面与 URL

| URL | 内容 | 索引 |
| --- | --- | --- |
| `/deals` | 已验证特价（默认）+ 社区区块 | 是，`daily` |
| `/deals/under-100` `/200` `/300` | `price_usd < N`，仅含税单程 | 有结果才进 sitemap，否则 `noindex` |
| `/deals/domestic` | 出发国 = 目的国 | 有结果才索引 |
| `/deals/international` | 出发国 ≠ 目的国 | 是 |
| `/deals/from/[iata]` | 某机场出发，如 `/deals/from/JFK` | 有 live 报价才索引 |
| `/deals/to/[iata]` | 某机场到达（第二阶段） | 有结果才索引 |
| `/deals/[id]` | 单条社区/官方报价详情（可选） | 现有卡片已够用，暂不做 |

**路由文件**（每个 20 行左右，共享 `components/deals/DealsLanding.tsx`）：

```
app/[locale]/deals/under-100/page.tsx
app/[locale]/deals/under-200/page.tsx
app/[locale]/deals/under-300/page.tsx
app/[locale]/deals/domestic/page.tsx
app/[locale]/deals/international/page.tsx
app/[locale]/deals/from/[iata]/page.tsx
```

注意 `under-100` 用**显式目录**，不要用 `[filter]` 动态段：它会和已有的 `/deals/new`、`/deals/mine` 抢路由，且没有静态参数时容易生成一堆 404 页面。

**SEO 复用现成机制**：

```ts
alternates: {
  canonical: localizedPath(locale, '/deals/under-100'),
  languages: languageAlternates('/deals/under-100'),
}
```

`languageAlternates()` 会自动生成 7 个已发布语言 + `x-default`。

**空页处理**：筛选页 0 条结果时 `robots: { index: false }`，并且不要进 sitemap——否则会产出几百个薄页，直接踩 AdSense「低价值内容」和 Google 的 doorway 判定。

**sitemap**（`app/sitemap.ts`）：只加 5 个固定筛选页；`/deals/from/[iata]` 用一次 `select distinct origin_iata from fare_offers where status='live' and is_deal` 生成，上限 100 条。

---

## 6. 机场页与地图

### 6.1 机场页：已有区块，但缓存不对

现状（`app/[locale]/airport/[code]/page.tsx`）：

```ts
export const revalidate = 3600;                    // 页面 ISR 1 小时
const [..., airportDeals] = await Promise.all([... getAirportDeals(locale, airport.iata, 3)]);
<AirportDeals ... deals={airportDeals} />          // line 299
```

问题：新报价或已过期报价在机场页最多滞留 1 小时，用户点进去发现价格不对。

**最小改法**：`AirportDeals` 服务端只渲染机场名与骨架，报价列表交给一个 `'use client'` 的 `AirportFareBoard`，挂载后取 `/api/fare-offers?airport=JFK&limit=6`。这和 `DealsBoard` 现有的刷新思路一致（不引入新依赖、不把页面变 dynamic）。

同时把区块锚点统一：`#flight-deals`（新，已验证）与 `#airport-deals`（旧，社区），`tocItems` 里各加一行。

卡片内容（对应你给的示意）：

```
JFK → MIA          美国国内 · 直飞
$79               2 小时前核验 · 单程含税
[ View deal ]     → /go/<clickId>
```

### 6.2 地图：加一个图层，不新增依赖

`components/AirportMap.tsx` 已经是 Leaflet。新增：

1. `app/api/fare-airports/route.ts` → `[{ iata, minUsd, count }]`，5 分钟 `s-maxage`。
2. 地图右上角控件（Leaflet `L.Control`）：`全部机场 / 仅特价机场 / 按最低价着色`。
3. 着色分档：`<$100` / `$100–200` / `$200–300` / `≥$300`，用现有 `--amber`、`--sky-*` token，不引色板库。
4. 点击有特价的机场 → 弹出 `minUsd` + 「查看 JFK 出发的 12 个特价」→ `/deals/from/JFK`。

只在用户打开开关时请求 `/api/fare-airports`，别在首屏加载。

---

## 7. 采集 Worker（独立进程，不进 Next）

### 7.1 进程模型

```
workers/fares/
├── index.mjs            # 入口：--once | --loop --interval=3600
├── config.mjs           # 监控机场清单、价格门槛、TDD、并发
├── providers/
│   ├── travelpayouts.mjs
│   ├── kiwi.mjs         # 第二阶段
│   └── index.mjs        # 注册表
├── normalize.mjs        # 币种/含税/经停/日期归一化
├── detect.mjs           # 中位价、折扣、dealScore
└── store.mjs            # upsert + history + run log
```

- 独立 `pg.Pool`，`max: 2`，`PGPOOL_MAX` 不共享。
- `systemd` timer 或 `pm2` 单独进程；**绝不在 Route Handler 里调用上游 API**。
- 单次运行目标：30–50 个机场 × 1 次 = 30–50 个请求，串行 + 300ms 间隔，5 分钟内跑完。2C2G 机器上内存峰值 < 80MB。

```ini
# /etc/systemd/system/airport-fares.service
[Unit]
Description=WorldAirportMap fare collector
After=network-online.target postgresql.service

[Service]
Type=oneshot
WorkingDirectory=/srv/airport-maps
EnvironmentFile=/srv/airport-maps/.env.local
ExecStart=/usr/bin/node workers/fares/index.mjs --once
MemoryMax=256M
```

```ini
# /etc/systemd/system/airport-fares.timer
[Timer]
OnCalendar=*-*-* 02,08,14,20:00:00
Persistent=true
```

### 7.2 Provider 接口

```ts
export type FareQuery = {
  origin: string;            // IATA
  departFrom: string;        // YYYY-MM-DD
  departTo: string;
  tripType: 'oneway' | 'roundtrip';
  cabin: 'economy' | 'premium' | 'business' | 'first';
  currency: 'USD';
  limit: number;
};

export type RawOffer = {
  providerOfferId?: string;
  destination: string;
  airlineCode?: string;
  airlineName: string;
  price: number;
  currency: string;
  taxIncluded?: boolean;
  departDate: string;
  returnDate?: string | null;
  stops: number;
  durationMinutes?: number;
  flightNumbers?: string[];
  deepLink: string;
  partner?: string;
};

export type FareProvider = {
  id: string;
  /** 每日预算（请求数），超出即停 */
  dailyRequestBudget: number;
  search(query: FareQuery, ctx: { signal: AbortSignal }): Promise<RawOffer[]>;
};
```

**第一个接谁**：优先 **Travelpayouts**（Aviasales 联盟，一个账号同时给数据和佣金，深链天然带 `marker`），其次 Kiwi/Tequila，Amadeus Self-Service 只适合验证。**不要**抓 Google Flights / 航司官网：违反 ToS，且价格无法长期稳定。

### 7.3 归一化与「特价」判定

采集（不做业务判断）→ 归一化 → 判定，三步分开：

```js
// normalize.mjs
priceUsd      = price * (fx.usdPerUnit ?? 1)
departDate    = isoDate(raw.departDate)
expiresAt     = min(departDate 23:59, now + 7d)   // 报价 TTL
fingerprint   = sha1([origin, destination, departDate, returnDate ?? '',
                      cabin, tripType, airlineCode ?? '', stops].join('|'))
```

```js
// detect.mjs —— 冷启动没有历史时，用同航线同舱位的 p25 兜底
const baseline = median30d(offer) ?? routeP25(origin, destination, cabin);
const discountPct = baseline ? Math.round((1 - offer.priceUsd / baseline) * 100) : null;

// $300 是绝对门槛，30% 是相对门槛；两者取「或」，但折扣必须有 baseline
isDeal = offer.taxIncluded
      && offer.stops <= 1
      && offer.priceUsd <= 300
      && (offer.priceUsd <= 200 || (discountPct ?? 0) >= 25);

dealScore = clamp(
  (discountPct ?? 0) * 1.2                  // 折扣主导
  + (offer.priceUsd <= 100 ? 30 : offer.priceUsd <= 200 ? 18 : 8)
  + (offer.stops === 0 ? 8 : 0)
  - (offer.durationMinutes > 900 ? 6 : 0),
  0, 100
);
```

**注意**：`isDeal` 必须要求 `taxIncluded`。美国出发的 OTA 报价通常含税，但联盟 API 里有不含税字段；不加这条，「$299」结账变「$412」，是这类站点最容易崩信任的地方。

### 7.4 写入（幂等 upsert）

```sql
insert into fare_offers (
  provider, fingerprint, origin_iata, destination_iata, destination_country,
  destination_city, airline_code, airline_name, flight_numbers, stops,
  duration_minutes, price, currency, price_usd, fx_rate, tax_included,
  cabin, trip_type, depart_date, return_date, deep_link, booking_partner,
  baseline_usd, discount_pct, deal_score, is_deal, first_seen_at, last_seen_at,
  verified_at, expires_at, raw
) values (...)
on conflict (provider, fingerprint) do update set
  price = excluded.price,
  currency = excluded.currency,
  price_usd = excluded.price_usd,
  fx_rate = excluded.fx_rate,
  stops = excluded.stops,
  duration_minutes = excluded.duration_minutes,
  deep_link = excluded.deep_link,
  baseline_usd = excluded.baseline_usd,
  discount_pct = excluded.discount_pct,
  deal_score = excluded.deal_score,
  is_deal = excluded.is_deal,
  last_seen_at = now(),
  verified_at = now(),
  expires_at = excluded.expires_at,
  status = 'live',
  raw = excluded.raw
returning id, (xmax = 0) as inserted;
```

历史同时写：

```sql
insert into fare_price_history (provider, fingerprint, observed_on, price, currency, price_usd)
values ($1, $2, current_date, $3, $4, $5)
on conflict (provider, fingerprint, observed_on) do nothing;
```

跑完后把本次没出现的旧报价置为过期：

```sql
update fare_offers set status = 'expired'
 where provider = $1 and status = 'live' and last_seen_at < now() - interval '24 hours';
```

### 7.5 监控

`fare_provider_runs` 每次运行一行。低于阈值（`offersSeen < 10` 或 `errors > 0`）时写 `message`，运维看表即可。不要为这个加 Prometheus。

---

## 8. 联盟链接与点击归因

### 8.1 站内跳转，不直连

现在 `DealCard` 直接渲染 `deal.bookingUrl`（`components/deals/DealCard.tsx:183`），**没有任何点击记录**。改成：

```
卡片按钮 → /go/<clickId 或 offerId>  → 302 到联盟深链
```

`app/go/[id]/route.ts`（顶层，不在 `[locale]` 下）：

```ts
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // 1. 查 fare_offers（或 deals）拿到 deep_link / provider
  // 2. 组装带 subid 的联盟 URL：?marker=xxx&subid=<clickId>
  // 3. 插 affiliate_clicks
  // 4. 302 到目标，Cache-Control: no-store
  return Response.redirect(target, 302);
}
```

**必须**在 `proxy.ts` 的跳过列表里加 `pathname.startsWith('/go')`，否则会被 rewrite 成 `/en/go/...`（`proxy.ts:38-48`）。

### 8.2 合规与披露

- 卡片按钮保留 `rel="nofollow sponsored noopener noreferrer"`（现有做法正确，别去掉）。
- `/privacy` 增加一句：点击订票会经过站内跳转并记录匿名点击统计；`/about` 或 `/terms` 增加联盟披露。
- **不做 cloaking**：`/go` 的目标域必须与卡片上写的航司/OTA 一致，且不屏蔽爬虫（返回 302 即可）。
- 不与 AdSense 广告位混排成「看起来像订票按钮」的样式，避免 AdSense 政策问题。

### 8.3 佣金对账

联盟后台的 subid 回传 `clickId`，导出后按 `click_id` join `affiliate_clicks`，即可算：

| 指标 | SQL |
| --- | --- |
| 各机场 CTR | `clicks / pageviews`（pageviews 需另埋，或用 nginx 日志） |
| EPC | `commission / clicks` |
| 有效报价率 | `verified_at > now() - 24h` 占比 |
| 归因缺口 | 有佣金无 click_id 的比例（>5% 说明 subid 没透传） |

`.env.example` 追加：

```bash
# --------------------------------------------------------------- fare engine
TRAVELPAYOUTS_TOKEN=
TRAVELPAYOUTS_MARKER=
KIWI_PARTNER_ID=
# 采集范围（逗号分隔 IATA），第一版 30-50 个
FARE_ORIGINS=JFK,LAX,ORD,SFO,EWR,MIA,SEA,BOS,ATL,DFW
FARE_MAX_PRICE_USD=300
FARE_MIN_DISCOUNT_PCT=25
FARE_RUN_INTERVAL_SECONDS=21600
```

---

## 9. 分阶段落地（文件级）

### 阶段 0：数据层 + UI 骨架（不接外部 API，2–3 天）

| 任务 | 文件 |
| --- | --- |
| 5 张新表 | `db/schema.ts` |
| 迁移 | `drizzle/0004_*.sql`（`pnpm db:generate`） |
| 汇率种子 + 手工报价 | `scripts/seed-fares.mjs`（写入 40 条 fixture，标 `provider='seed'`） |
| 类型与格式化 | `lib/fare-format.ts`（客户端安全，参考 `lib/deal-format.ts`） |
| 查询层 | `lib/fare-offers.ts` |
| API | `app/api/fare-offers/route.ts`、`app/api/fare-airports/route.ts` |
| 卡片与列表 | `components/deals/FareCard.tsx`、`components/deals/FareBoard.tsx` |
| `/deals` 加区块 | `app/[locale]/deals/page.tsx` |
| 筛选页 ×5 | `app/[locale]/deals/{under-100,under-200,under-300,domestic,international}/page.tsx` |
| 文案 | `lib/i18n/deals.ts` 加 `fare*` 前缀字段（7 语言一处改） |

**验收**：`/deals` 首屏出现 fixture 报价；`/deals/under-100` 只出现 `<100` 且含税的；切换 en/zh 文案与价格格式都对；`pnpm typecheck` 通过；空结果页 `noindex`。

### 阶段 1：接第一个数据源（1 周）

| 任务 | 文件 |
| --- | --- |
| Provider | `workers/fares/providers/travelpayouts.mjs` |
| 归一化/判定/写入 | `workers/fares/{normalize,detect,store}.mjs` |
| 入口与配置 | `workers/fares/{index,config}.mjs` |
| 运维 | `systemd` 两个 unit、`.env.example` 变量、`scripts/check-fares.mjs` 校验 |
| 点击追踪 | `app/go/[id]/route.ts` + `proxy.ts` 白名单 + `DealCard`/`FareCard` 改走 `/go` |

**验收**：30–50 个机场跑通一次；`fare_provider_runs` 有 ok 记录；`/deals/from/JFK` 有真实报价；点击 `/go/...` 302 到带 `marker` 的联盟页，`affiliate_clicks` 有行；错价（含税字段缺失）被 `isDeal` 过滤掉。

### 阶段 2：机场页 + 地图 + 价格历史（1 周）

| 任务 | 文件 |
| --- | --- |
| 机场页特价区块（客户端刷新） | `components/airport/AirportFareBoard.tsx`、`app/[locale]/airport/[code]/page.tsx` |
| 价格历史 sparkline | `components/deals/PriceTrend.tsx`（纯 SVG，不加图表库） |
| 地图图层 | `components/AirportMap.tsx` + `/api/fare-airports` |
| 路线页联动 | `/deals/from/[iata]`、`/deals/to/[iata]` |
| sitemap | `app/sitemap.ts` |

**验收**：机场页 1 分钟内能看到新报价；地图开关只请求一次；`/deals/from/JFK` 进 sitemap；移动端 390px 不横向溢出。

### 阶段 3：商业化（持续）

- 第二个联盟（Kiwi/Duffel）做价格对比；
- `/admin/fares`：报价下架、provider 开关、运行日志；
- 佣金报表（按机场/航线/联盟）；
- A/B：卡片按钮文案与「Verified 2h ago」的位置。

---

## 10. 风险与对策

| 风险 | 对策 |
| --- | --- |
| 上游 ToS 不允许转售/展示 | 只用官方联盟 API；合同里确认「可公开展示价格与深链」 |
| 价格不准，用户投诉 | `verified_at` 必须显示；>24h 未核验自动降级/下架；不含税报价永不进价格榜 |
| 2C2G 内存被打爆 | Worker 独立进程 + `MemoryMax=256M`；并发 2；`raw` 截断 8KB；历史表按季度删除 90 天前 |
| 薄页伤 SEO / AdSense | 空结果页 `noindex` 且不进 sitemap；程序化路线页有 `MIN_OFFERS` 门槛（建议 ≥3） |
| 币种混用 | 价格筛选只走 `fare_offers.price_usd`；`deals` 的 CNY 卡片不参与排序 |
| 联盟 Cookie 与隐私合规 | 跳转前不写 Cookie；`/privacy` 说明；EEA 流量按联盟要求加 CMP（若上欧洲市场） |
| `proxy.ts` 把 `/go` rewrite 掉 | 显式加入跳过列表，并在 `scripts/verify.mjs` 加一条 curl 断言 |

---

## 11. 需要你确认的 5 件事

1. **市场**：先只做美国出发（USD/EN），还是中国出发（CNY/中文）也进同一套引擎？
   → 建议：引擎支持多出发国，但**首批只开美国**，因为搜索量与佣金单价都更高，且不会和现有国泰票价卡打架。
2. **首个数据源**：Travelpayouts / Kiwi / Amadeus 三选一（或你已经有联盟账号）。这决定 `deepLink` 的拼参方式。
3. **价格门槛**：沿用 `≤$300` + `≥25% 折扣`，还是改成「$300 以下全部展示、折扣只做排序」？
4. **社区区块位置**：`/deals` 上与 Verified 并列（推荐），还是折叠到二级 tab？
5. **采集范围**：第一版 30 个机场够不够？名单我按「美国前 30 大 + 你指定的枢纽」生成。

确认后我直接按阶段 0 落库：`db/schema.ts` 五张表 + `pnpm db:generate` 生成迁移 + fixture 种子 + `/deals` 新区块，一天内可以看到能点的页面。

---

## 12. 附：实测数据快照（2026-10-30）

```
airports                516 行 / 101 国家
deals                   153 行，全部 is_official = true，community = 0
                        全部 国泰航空 / roundtrip / tax_included = false / CNY
                        价格 540 – 3870，出发机场 16 个（PVG 23、WUH 22、HGH 21 …）
                        同一 batch 导入（2026-10-29），过期时间一致
fare_offers             不存在
affiliate_clicks        不存在
flights.json.gz         航班号索引（516 机场去程/到达），无票价、无时刻
published locales       en(默认) / zh / tw / de / fr / it / ko
```
