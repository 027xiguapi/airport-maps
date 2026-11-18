import type { Messages } from './zh';
import { thTransportModes } from '../th-data';

/**
 * Thai catalog. Typed against the Chinese source of truth (`Messages`), so a
 * missing or renamed key fails `npm run typecheck`.
 *
 * Style: natural traveller-facing Thai, second person "คุณ", polite but
 * concise — UI labels do not append ครับ/ค่ะ. Thai has no plural or case
 * inflection, so the plural helper keeps its signature but both forms are the
 * same word. Airport names, IATA/ICAO codes, URLs and airline names stay in
 * their international form.
 */

/** "1 หมายเลขเที่ยวบิน" / "2 หมายเลขเที่ยวบิน" — Thai has no plural. */
const plural = (value: string, one: string, many: string) =>
  `${value} ${value === '1' ? one : many}`;

/** Airport class wording for the lead sentence (schema.org's airport type). */
const AIRPORT_KIND = {
  large: 'สนามบินขนาดใหญ่',
  medium: 'สนามบินขนาดกลาง',
  small: 'สนามบินขนาดเล็ก',
  heliport: 'ลานจอดเฮลิคอปเตอร์',
} as const;

export const th: Messages = {
  site: {
    name: 'World Airport Maps',
    // The wordmark is split so the accent colour can highlight part of it.
    nameLead: 'World Airport',
    nameAccent: 'Maps',
    tagline: 'แผนที่สนามบินและอาคารผู้โดยสาร',
    description:
      'เรียกดูแผนที่อาคารผู้โดยสารของสนามบิน แยกตามประเทศและภูมิภาค ตั้งแต่ศูนย์กลางระหว่างประเทศขนาดใหญ่ไปจนถึงสนามบินภูมิภาค ดูผังโดยละเอียดของประตูขึ้นเครื่อง พื้นที่เช็คอิน การรับกระเป๋า ร้านค้า ร้านอาหาร เลานจ์ และการเดินทางภาคพื้นดิน',
    keywords: [
      'แผนที่สนามบิน',
      'แผนที่อาคารผู้โดยสาร',
      'ผังอาคารผู้โดยสารสนามบิน',
      'ประตูขึ้นเครื่อง',
      'การเดินทางจากสนามบิน',
      'คู่มือสนามบิน',
    ],
    numberOfItems: (n: number) => `${n} สนามบิน`,
  },

  nav: {
    home: 'หน้าแรก',
    airports: 'สนามบินทั้งหมด',
    countries: 'ตามประเทศ',
    tools: 'เครื่องมือออนไลน์',
    about: 'เกี่ยวกับ',
    label: 'การนำทางหลัก',
    languageLabel: 'ภาษา',
    switchLanguage: 'เปลี่ยนภาษา',
    /** Slice heading for the registered-but-untranslated languages. */
    languagePlanned: 'อยู่ระหว่างเตรียมการ',
    languagePlannedHint: 'เวอร์ชันภาษานี้ยังไม่ได้เผยแพร่',
    themeToggle: 'สลับโหมดมืด',
    menu: 'เมนู',
  },

  common: {
    advertisement: 'โฆษณา',
    skipToContent: 'ข้ามไปยังเนื้อหาหลัก',
    backToTop: 'กลับขึ้นด้านบน',
    breadcrumbLabel: 'เส้นทางนำทาง',
    home: 'หน้าแรก',
    viewMap: 'ดูแผนที่',
    terminalMap: 'แผนที่อาคารผู้โดยสาร',
    /** Accessible iframe title on the ad slots (components/ads/). */
    /**
     * Airport page <title>/og:title. Airports with compiled data lead with the
     * counts Google is asked for; directory airports without terminal data get
     * an honest location-map title.
     */
    latestAirportTitle: (
      year: number,
      name: string,
      iata: string,
      counts?: { terminals: number; gates: number }
    ) =>
      counts
        ? `${name} (${iata}): ${counts.terminals} อาคารผู้โดยสาร${
            counts.gates > 0 ? `, ${counts.gates} ประตูขึ้นเครื่อง` : ''
          } — แผนที่อาคารผู้โดยสาร`
        : `${name} (${iata}) — แผนที่ตำแหน่งและคู่มือสนามบิน ${year}`,
    /** H1 on the airport page; without terminal data the name stands alone. */
    airportHeading: (name: string, hasTerminals = true) =>
      hasTerminals ? `แผนที่อาคารผู้โดยสาร ${name}` : name,
    airportGuide: 'คู่มือสนามบิน',
    lastUpdated: 'อัปเดตล่าสุด',
    updatedOn: (date: string) => `อัปเดต ${date}`,
    publishedOn: (date: string) => `เผยแพร่ ${date}`,
    readMore: 'อ่านคู่มือฉบับเต็ม',
  },

  units: {
    /** Key-facts cell labels on the airport page (no count). */
    terminalsFact: 'อาคารผู้โดยสาร',
    gatesFact: 'ประตูขึ้นเครื่อง',
    terminals: (n: number) => `${n} อาคารผู้โดยสาร`,
    terminalsShort: (n: number) => `${n} อาคารผู้โดยสาร`,
    gates: (n: number) => `${n} ประตูขึ้นเครื่อง`,
    airports: (n: number) => `${n} สนามบิน`,
    airportsChip: (n: number) => `${n} สนามบิน`,
    pax: 'ผู้โดยสาร',
    paxFull: 'ผู้โดยสารต่อปี',
    distance: 'ถึงใจกลางเมือง',
    distanceFrom: (city: string) => `จากใจกลาง ${city}`,
    gatesLabel: (range: string) => `ประตู ${range}`,
    gatesCount: (n: number) => `${n} ประตู`,
    satellite: 'อาคารผู้โดยสารดาวเทียม',
    airlinesLabel: 'สายการบินหลัก: ',
  },

  search: {
    ariaLabel: 'ค้นหาสนามบิน',
    placeholder: 'ค้นหาสนามบิน เมือง หรือรหัส IATA',
    heroPlaceholder: 'ค้นหาด้วยชื่อสนามบิน เมือง หรือรหัส IATA — เช่น LHR / ดูไบ / ฮีทโธรว์',
    submit: 'ค้นหาสนามบิน',
    loading: 'กำลังค้นหา…',
    empty: 'ไม่พบสนามบินที่ตรงกัน',
    resultsTitle: (term: string) => `ผลการค้นหาสำหรับ “${term}”`,
    resultsCount: (n: number) => `พบสนามบินที่ตรงกัน ${n} แห่ง`,
    noResults: 'ไม่มีสนามบินที่ตรงกัน ลองใช้คำค้นอื่น เช่น ชื่อเมืองหรือรหัส IATA',
    noResultsHint: 'ไม่พบสนามบินที่คุณต้องการ?',
    viewAll: (n: number) => `ดูสนามบินทั้งหมด ${n} แห่ง`,
    orBrowseByCountry: 'หรือเลือกดูตามประเทศ',
    range: (from: number, to: number, total: number) =>
      `แสดง ${from}–${to} จาก ${total} สนามบิน`,
  },

  hero: {
    eyebrow: 'ไดเรกทอรีสนามบินโลก',
    titleLead: 'สำรวจสนามบินและ',
    titleAccent: 'แผนที่อาคารผู้โดยสาร',
    sub: 'ค้นทางในทุกสนามบินด้วยคอลเลกชันแผนที่สนามบินและอาคารผู้โดยสารที่ครบถ้วน จัดเรียงตามประเทศและภูมิภาค — ตั้งแต่ศูนย์กลางระหว่างประเทศขนาดใหญ่ไปจนถึงสนามบินภูมิภาค',
    stats: {
      countries: 'ประเทศ / ภูมิภาค',
      airports: 'สนามบินที่ครอบคลุม',
      terminals: 'แผนที่อาคารผู้โดยสาร',
    },
  },

  home: {
    /**
     * Homepage "what this site is" block: one airport photo above three
     * heading/paragraph pairs. The photo leads, so the block has no kicker or
     * section title — `ariaLabel` names it for assistive tech instead.
     */
    intro: {
      ariaLabel: 'เกี่ยวกับเว็บไซต์นี้',
      imageAlt: 'เครื่องบินโดยสารจอดที่ประตูขึ้นเครื่องของอาคารผู้โดยสารกระจกในช่วงพระอาทิตย์ขึ้น',
      blocks: [
        {
          title: 'เดินทางในทุกสนามบินด้วยแผนที่อาคารผู้โดยสารโดยละเอียด',
          body: 'การเดินทางในสนามบินและอาคารผู้โดยสารทั่วโลกอาจเป็นเรื่องท้าทาย แผนที่สนามบินที่ครอบคลุมของเรามีผังโดยละเอียดของอาคารผู้โดยสาร ประตูขึ้นเครื่อง พื้นที่เช็คอิน การรับกระเป๋า ร้านค้า ร้านอาหาร เลานจ์ และศูนย์กลางการเดินทาง เพื่อให้คุณวางแผนเส้นทางได้ก่อนออกเดินทาง',
        },
        {
          title: 'แผนที่อาคารผู้โดยสารและผังพื้นแบบอินเทอร์แอกทีฟ',
          body: 'สนามบินระหว่างประเทศขนาดใหญ่มีหลายอาคารผู้โดยสารและผังที่ซับซ้อน แผนที่สนามบินโดยละเอียดของเราช่วยให้คุณหาประตูขึ้นเครื่อง พบสิ่งอำนวยความสะดวก วางแผนต่อเครื่อง และเคลื่อนที่ผ่านจุดตรวจความปลอดภัย พื้นที่ขาออก และโถงขาเข้าได้อย่างมีประสิทธิภาพ — โดยไม่ต้องย้อนกลับ',
        },
        {
          title: 'ข้อมูลการเดินทางและการเข้าถึงสนามบิน',
          body: 'นอกจากผังอาคารผู้โดยสารแล้ว คู่มือสนามบินของเรายังครอบคลุมตัวเลือกการเดินทาง ข้อมูลที่จอดรถ และเส้นทางเข้าถึง ค้นหาวิธีที่ดีที่สุดในการไปถึงประตูขึ้นเครื่อง เดินทางระหว่างอาคารผู้โดยสาร และใช้การเดินทางภาคพื้นดิน ทั้งรถไฟ รถบัส แท็กซี่ และรถเช่า',
        },
      ],
    },
    map: {
      kicker: 'แผนที่โลก',
      title: 'แผนที่สนามบิน',
      en: 'แผนที่สนามบิน',
      sub: (airports: string, world: string) =>
        `ระบุตำแหน่งสนามบินที่มีเที่ยวบินประจำ ${world} แห่งทั่วโลก — ในจำนวนนี้ ${airports} แห่งมีแผนที่อาคารผู้โดยสารบนเว็บไซต์นี้ คลิกจุดเพื่อดูประเทศ/ภูมิภาคและรายละเอียด`,
      all: 'ทั้งหมด',
      gEurope: 'ยุโรป',
      gAsia: 'เอเชีย',
      gAmericas: 'อเมริกา',
      gAfrica: 'แอฟริกา',
      gOceania: 'โอเชียเนีย',
      legendSite: 'มีในเว็บไซต์นี้ · คลิกเพื่อดูแผนที่อาคารผู้โดยสาร',
      legendWorld: 'สนามบินที่มีเที่ยวบินประจำอื่น ๆ ทั่วโลก',
      countTemplate: 'แสดง {n} สนามบิน',
      download: 'ดาวน์โหลดข้อมูล',
      downloadTitle: 'ส่งออกทุกสนามบินในตัวกรองปัจจุบันเป็น CSV (IATA ชื่อ เมือง ประเทศ พิกัด)',
      openAirport: 'ดูสนามบิน',
    },
    popular: {
      kicker: 'แผนที่อาคารผู้โดยสาร',
      title: 'แผนที่สนามบินยอดนิยม',
      en: 'แผนที่สนามบิน',
      sub: 'ภาพปกแผนที่อาคารผู้โดยสารที่คัดเลือกจากสนามบินสำคัญทั่วโลก — เปิดหน้าสนามบินเพื่อดูแผนที่ฉบับเต็ม',
    },
    recent: {
      kicker: 'เผยแพร่ใหม่',
      title: 'อัปเดตล่าสุด',
      en: 'อัปเดตล่าสุด',
      sub: 'สนามบิน ประเทศ และคู่มือการเดินทางที่เพิ่มใหม่หรือเพิ่งปรับปรุง',
      countriesTitle: 'ประเทศที่อัปเดตล่าสุด',
    },
    /** Homepage route-map showcase: the widest direct networks, map left, city tabs right. */
    routes: {
      kicker: 'เส้นทาง',
      title: 'แผนที่เส้นทางสนามบินที่คึกคักที่สุด',
      en: 'แผนที่เส้นทาง',
      sub: 'สนามบินที่จัดอันดับตามจำนวนจุดหมายที่บินตรง — เปิดสนามบินเพื่อดูแผนที่เส้นทาง สายการบิน และรายชื่อจุดหมาย',
      collection: 'คอลเลกชันเส้นทาง',
      tabsLabel: 'แผนที่เส้นทางตามเมือง',
      explore: (city: string) => `สำรวจ ${city}`,
      play: 'เริ่มสไลด์โชว์',
      pause: 'หยุดสไลด์โชว์',
    },
    /** Homepage carousel: the newest photo batch, one picture per airport. */
    photos: {
      kicker: 'ภาพล่าสุด',
      title: 'ภาพสนามบินล่าสุด',
      en: 'ภาพล่าสุด',
      sub: 'ภาพสนามบินที่เพิ่มล่าสุด — สนามบินใหม่ล่าสุดหกแห่ง แห่งละหนึ่งภาพ',
      ariaLabel: 'แกลเลอรีภาพสนามบินล่าสุด',
      prev: 'ภาพก่อนหน้า',
      next: 'ภาพถัดไป',
      play: 'เริ่มสไลด์โชว์',
      pause: 'หยุดสไลด์โชว์',
      counter: (index: number, total: number) => `ภาพ ${index} จาก ${total}`,
      view: (name: string) => `ดูแผนที่ ${name}`,
      /** Button overlaid on each picture: open that airport's page. */
      open: 'เปิดหน้าสนามบิน',
    },
    countries: {
      kicker: 'ตามประเทศ',
      title: 'แผนที่สนามบินตามประเทศ',
      en: 'ประเทศ',
      sub: 'เรียกดูแผนที่อาคารผู้โดยสารตามประเทศและภูมิภาค ตั้งแต่ศูนย์กลางระหว่างประเทศขนาดใหญ่ไปจนถึงสนามบินภูมิภาค',
      more: 'ทุกประเทศ',
    },
    all: {
      kicker: 'แผนที่ทั้งหมด',
      title: 'แผนที่สนามบินทั้งหมด',
      en: 'สนามบินทั้งหมด',
      sub: 'แผนที่สนามบินสำหรับสนามบินและศูนย์กลางการเดินทางที่คึกคักที่สุดของโลก',
      hint: 'เลือกสนามบินเพื่อดูผังอาคารผู้โดยสาร',
      more: 'ดูทั้งหมด',
    },
    /**
     * Homepage "Lists & Tables" block: the coverage data reshaped as real lists
     * and tables rather than running prose, so search and AI engines can lift
     * and cite the figures directly.
     */
    facts: {
      kicker: 'ข้อมูลไดเรกทอรี',
      title: 'ข้อมูลสนามบินโดยสรุป',
      en: 'รายการและตาราง',
      sub: 'ตัวเลขของไดเรกทอรีที่จัดวางเป็นรายการและตาราง: ความครอบคลุม สนามบินที่คึกคักที่สุดในกลุ่มที่มีการเผยแพร่จำนวนผู้โดยสาร และการแบ่งตามภูมิภาค',
      note: (pax: string, detailed: string, total: string) =>
        `ข้อมูลผู้โดยสารครอบคลุม ${pax} จาก ${total} สนามบิน; ข้อมูลอาคารผู้โดยสารและประตูขึ้นเครื่องครอบคลุม ${detailed} จาก ${total} การนับอาคารผู้โดยสารเป็นไปตามการจัดกลุ่มของไดเรกทอรีนี้และอาจรวมอาคารโถง`,
      coverageTitle: 'ตัวเลขความครอบคลุม',
      coverage: {
        airports: 'สนามบิน',
        countries: 'ประเทศและภูมิภาค',
        regions: 'ภูมิภาคในไดเรกทอรี',
        cities: 'ชื่อเมืองที่ไม่ซ้ำ',
        terminals: 'อาคารผู้โดยสาร',
        gates: 'ประตูขึ้นเครื่อง',
        routes: 'สนามบินที่มีแผนที่เส้นทาง',
      },
      busiest: {
        title: 'สนามบินที่คึกคักที่สุดตามผู้โดยสารต่อปี',
        sub: '12 สนามบินที่คึกคักที่สุดในกลุ่มที่มีการเผยแพร่จำนวนผู้โดยสารต่อปี',
        caption: 'สนามบินที่มีการเผยแพร่จำนวนผู้โดยสารต่อปี เรียงตามอันดับ',
        rank: 'อันดับ',
        iata: 'IATA',
        airport: 'สนามบิน',
        city: 'เมือง',
        country: 'ประเทศ',
        terminals: 'อาคารผู้โดยสาร',
        gates: 'ประตูขึ้นเครื่อง',
        pax: 'ผู้โดยสารต่อปี (ล้านคน)',
      },
      regions: {
        title: 'สนามบินตามภูมิภาคในไดเรกทอรี',
        sub: 'จำนวนสนามบิน อาคารผู้โดยสาร และประตูขึ้นเครื่อง จำแนกตามป้ายภูมิภาคของไดเรกทอรี; บางประเทศและดินแดนครอบคลุมสองภูมิภาค',
        caption: 'จำนวนสนามบินจำแนกตามภูมิภาคในไดเรกทอรี',
        region: 'ภูมิภาค',
        airports: 'สนามบิน',
        detailed: 'มีข้อมูลโดยละเอียด',
        terminals: 'อาคารผู้โดยสาร',
        gates: 'ประตูขึ้นเครื่อง',
      },
    },
  },

  table: {
    iata: 'IATA',
    airport: 'สนามบิน',
    city: 'เมือง',
    country: 'ประเทศ',
    size: 'ขนาด',
    map: 'แผนที่',
    empty: 'ไม่มีสนามบินที่ตรงกับตัวกรอง ลองขยายตัวเลือกของคุณ',
  },

  pager: {
    label: 'การแบ่งหน้า',
    previous: 'หน้าก่อนหน้า',
    next: 'หน้าถัดไป',
  },

  filters: {
    searchPlaceholder: 'ค้นหาสนามบิน เมือง หรือรหัส IATA',
    submit: 'ค้นหา',
    country: 'ประเทศ',
    all: 'ทั้งหมด',
    sort: 'เรียงตาม',
    sortPax: 'ผู้โดยสาร',
    sortName: 'ชื่อ',
    sortIata: 'รหัส IATA',
    sortUpdated: 'อัปเดตล่าสุด',
    /**
     * Titles and descriptions for the indexable `?country=` / `?sort=` views of
     * the directory: distinct copy, so they do not read as copies of the bare
     * directory or of a country page.
     */
    viewTitle: (country: string, sortLabel: string) =>
      country
        ? `แผนที่สนามบินทั้งหมดของ${country}${sortLabel ? ` — เรียงตาม${sortLabel}` : ''}`
        : `แผนที่สนามบินทั้งหมด — เรียงตาม${sortLabel}`,
    viewDescription: (country: string, sortLabel: string) =>
      country
        ? `แผนที่สนามบินทุกแห่งของ${country}ในไดเรกทอรีบนหน้าเดียว: ผังอาคารผู้โดยสาร ช่วงประตูขึ้นเครื่อง และการเดินทางภาคพื้นดิน${sortLabel ? ` เรียงตาม${sortLabel}` : ''}`
        : `ไดเรกทอรีแผนที่สนามบินฉบับเต็มบนหน้าเดียว: ผังอาคารผู้โดยสาร ช่วงประตูขึ้นเครื่อง และการเดินทางภาคพื้นดิน${sortLabel ? ` เรียงตาม${sortLabel}` : ''}`,
  },

  countries: {
    title: 'เรียกดูสนามบินตามประเทศ',
    description:
      'เรียกดูไดเรกทอรีแผนที่อาคารผู้โดยสารทั่วโลกตามประเทศและภูมิภาค ตั้งแต่ศูนย์กลางระหว่างประเทศขนาดใหญ่ไปจนถึงสนามบินภูมิภาค ดูว่าประเทศแต่ละแห่งมีสนามบินและอาคารผู้โดยสารกี่แห่ง',
    sub: (countries: string, airports: string, terminals: string) =>
      `จากศูนย์กลางระหว่างประเทศขนาดใหญ่ไปจนถึงสนามบินภูมิภาค — รวม ${countries} ประเทศและภูมิภาค ${airports} สนามบิน และ ${terminals} อาคารผู้โดยสาร`,
    regionCount: (countries: number, airports: number) =>
      `${countries} ประเทศ · ${airports} สนามบิน`,
  },

  country: {
    title: (name: string, count?: number) =>
      count ? `แผนที่สนามบิน${name} — สนามบินทั้งหมด ${count} แห่ง` : `แผนที่สนามบิน${name}`,
    description: (name: string, nameEn: string, region: string, count: number, total?: number) =>
      total
        ? `${name}${nameEn !== name ? ` (${nameEn})` : ''} มีสนามบินที่มีเที่ยวบินประจำ ${total} แห่ง; ในจำนวนนี้ ${count} แห่งมีหน้าคู่มือบนเว็บไซต์นี้ พร้อมแผนที่การกระจายตัวของสนามบิน รายชื่อทั้งประเทศ และเส้นทางบินตรง`
        : `แผนที่อาคารผู้โดยสารสำหรับสนามบิน ${count} แห่งใน${name} (${nameEn}) ครอบคลุมศูนย์กลางระหว่างประเทศหลักและสนามบินภูมิภาคของ${region} ดูประตูขึ้นเครื่อง ผังอาคารผู้โดยสาร และการเดินทางภาคพื้นดิน`,
    chip: (nameEn: string) => `สนามบิน ${nameEn.toUpperCase()}`,
    kicker: 'แผนที่สนามบิน',
    titleOf: (name: string) => `สนามบินใน${name}`,
    en: 'สนามบิน',
    sub: 'เลือกสนามบินเพื่อดูผังอาคารผู้โดยสาร ช่วงประตูขึ้นเครื่อง และตัวเลือกการเดินทางภาคพื้นดิน',
    empty: 'ยังไม่มีข้อมูลสนามบินสำหรับประเทศหรือภูมิภาคนี้',
    moreKicker: 'ประเทศอื่น ๆ',
    moreTitle: 'เรียกดูประเทศอื่น ๆ',
    moreEn: 'ประเทศเพิ่มเติม',
    all: 'ทุกประเทศ',
    notFound: 'ไม่พบประเทศ',

    /** Airport overview: assembled from database fields; a longer article can
        live in the content_documents store (kind='country') */
    introKicker: 'ภาพรวม',
    introTitle: (name: string) => `ภาพรวมสนามบิน${name}`,
    introEn: 'ภาพรวมสนามบิน',
    introSub:
      'ขนาดของสนามบินในประเทศหรือภูมิภาคนี้ ศูนย์กลางหลัก และเมืองที่ให้บริการ',
    introBody: (o: {
      name: string;
      nameEn: string;
      region: string;
      airports: string;
      terminals: string | null;
      gates: string | null;
      cities: string;
      busiest: string | null;
      busiestIata: string;
      busiestPax: string;
      mapsNote: string;
    }) =>
      // `o.nameEn` is empty when it equals `o.name` (both are "Japan").
      `${o.name}${o.nameEn ? ` (${o.nameEn})` : ''} ตั้งอยู่ใน${o.region} เว็บไซต์นี้ครอบคลุม ${o.airports}${
        o.terminals ? `, ${o.terminals}` : ''
      }${o.gates ? ` และ ${o.gates}` : ''} ในพื้นที่นี้` +
      (o.busiest
        ? ` ${o.busiest} (${o.busiestIata}) เป็นสนามบินที่ใหญ่ที่สุดตามจำนวนผู้โดยสารต่อปี โดยมี ${o.busiestPax}`
        : '') +
      ` สนามบินเหล่านี้ให้บริการเมืองต่าง ๆ เช่น ${o.cities} ${o.mapsNote}`,
    introMapsNote:
      'ทุกหน้าสนามบินมีแผนที่ตำแหน่งและรหัสสนามบิน พร้อมรายละเอียดอาคารผู้โดยสาร ประตูขึ้นเครื่อง และการเดินทางภาคพื้นดินเท่าที่มีการรวบรวมไว้',

    /** "Airport distribution": the national airport list and its map. */
    distribution: {
      kicker: 'การกระจายตัว',
      title: (name: string) => `แผนที่การกระจายตัวของสนามบิน${name}`,
      en: 'การกระจายตัวของสนามบิน',
      sub: (covered: string, total: string) =>
        `สนามบินที่มีเที่ยวบินประจำทั่วประเทศ ${total} แห่ง (ขนาดใหญ่ ขนาดกลาง และขนาดเล็ก); ในจำนวนนี้ ${covered} แห่งมีหน้าคู่มือบนเว็บไซต์นี้ รายชื่อฉบับเต็มอยู่ด้านล่าง`,
      mapAlt: (name: string, total: string) =>
        `แผนที่การกระจายตัวของสนามบิน${name}: สนามบินที่มีเที่ยวบินประจำ ${total} แห่ง`,
      siteTag: 'มีในเว็บไซต์นี้',
      colAirport: 'สนามบิน',
      colCity: 'เมือง',
      colType: 'ประเภท',
      types: {
        large: 'ขนาดใหญ่',
        medium: 'ขนาดกลาง',
        small: 'ขนาดเล็ก',
      },
      empty: 'ยังไม่มีรายชื่อสนามบินระดับประเทศ',
    },

    /** Related links */
    linksTitle: 'ลิงก์ที่เกี่ยวข้อง',
    linksEn: 'ลิงก์ที่เกี่ยวข้อง',
    linksSub: 'เว็บไซต์ทางการและบทความสารานุกรมสำหรับประเทศและสนามบินแต่ละแห่ง',
    linksCountry: (name: string) => `ข้อมูลอ้างอิง${name}`,
    linksAirports: (name: string) => `สนามบินใน${name}`,

    faqKicker: 'คำถามที่พบบ่อย',
    faqTitle: 'คำถามที่พบบ่อย',
    faqEn: 'คำถาม',
    faq: {
      airportTotal: (name: string) => `มีสนามบินกี่แห่งใน${name}?`,
      airportTotalAnswer: (name: string, total: string, covered: string) =>
        `${name} มีสนามบินที่ให้บริการผู้โดยสารตามกำหนดการ ${total} แห่ง (ขนาดใหญ่ ขนาดกลาง และขนาดเล็ก); เว็บไซต์นี้ครอบคลุม ${covered} แห่งโดยละเอียด ดูแผนที่การกระจายตัวและรายชื่อฉบับเต็มด้านบน`,
      airportCount: (name: string) => `สนามบินใดบ้างที่ครอบคลุมใน${name}?`,
      airportCountAnswer: (name: string, count: string, list: string) =>
        `เว็บไซต์นี้ครอบคลุม ${count} แห่งใน${name}: ${list}`,
      busiest: (name: string) => `สนามบินใดคึกคักที่สุดใน${name}?`,
      busiestAnswer: (busiest: string, iata: string, pax: string) =>
        `ตามจำนวนผู้โดยสารต่อปี ${busiest} (${iata}) เป็นสนามบินที่ใหญ่ที่สุดในกลุ่มที่ครอบคลุมที่นี่ โดยมี ${pax}`,
      terminals: (name: string) => `สนามบินใน${name}มีอาคารผู้โดยสารกี่แห่ง?`,
      terminalsAnswer: (name: string, terminals: string, gates: string, list: string) =>
        `สนามบินที่ครอบคลุมใน${name}มี ${terminals} โดยมี ${gates} รวมทั้งหมด: ${list}`,
      cities: (name: string) => `เมืองใดบ้างใน${name}ที่มีสนามบิน?`,
      citiesAnswer: (name: string, cities: string) =>
        `สนามบินใน${name}ที่ครอบคลุมที่นี่ให้บริการเมืองต่าง ๆ เช่น ${cities} คุณสามารถกรองตามเมืองหรือรหัส IATA ได้ในไดเรกทอรีสนามบิน`,
      maps: (name: string) => `สนามบินใน${name}มีแผนที่อาคารผู้โดยสารหรือไม่?`,
      mapsAnswer: (name: string, count: string) =>
        `บางแห่งมี หน้าสนามบินมีแผนที่ตำแหน่ง รหัสสนามบิน และเส้นทางบินตรง และสนามบิน ${count} แห่งที่ครอบคลุมใน${name}แสดงผังอาคารผู้โดยสาร ช่วงประตูขึ้นเครื่อง และการเดินทางภาคพื้นดินเมื่อมีข้อมูลเหล่านี้ เปิดสนามบินใดก็ได้เพื่อดูสิ่งที่มี`,
    },
  },

  airport: {
    /**
     * Meta description assembled from formatted airport facts. Terminals and
     * gates are null for directory airports with no compiled counts, and the
     * clause drops out instead of reading "0 terminals". The count question
     * Google receives ("how many gates does X have") is answered in the first
     * clause, because that is the text a snippet shows.
     */
    metaDescription: (o: {
      name: string;
      nameEn: string;
      iata: string;
      city: string;
      country: string;
      terminals: string | null;
      gates: string | null;
      pax: string;
      distance: string;
    }) =>
      o.terminals
        ? `${o.name} (${o.iata}) มีอาคารผู้โดยสาร ${o.terminals} แห่ง${
            o.gates ? ` และประตูขึ้นเครื่อง ${o.gates} ประตู` : ''
          }${o.pax ? ` รองรับผู้โดยสาร ${o.pax} คนต่อปี` : ''}${
            o.distance ? ` ห่างจากใจกลางเมือง ${o.distance}` : ''
          } แผนที่อาคารผู้โดยสารแสดงอาคารผู้โดยสารทั้งหมด ช่วงประตูขึ้นเครื่อง และการเดินทางภาคพื้นดิน`
        : `${o.name} (${o.iata}) ให้บริการ${o.city}, ${o.country} แผนที่ตำแหน่ง รหัสสนามบิน และข้อมูลการเดินทาง`,
    /**
     * Lead answer sentence under the H1: the full-sentence answer to "what is
     * this airport / where is it" plus the terminal and gate counts the FAQ
     * otherwise hides inside a collapsed accordion. kind/icao come from
     * lib/airport-facts.json; city and country collapse into one when equal
     * (Singapore) so the sentence never reads "serving Singapore, Singapore".
     */
    quickAnswer: (o: {
      name: string;
      iata: string;
      icao: string | null;
      kind: 'large' | 'medium' | 'small' | 'heliport' | null;
      city: string;
      country: string;
      terminals: number;
      gates: number;
      distance: string;
    }) => {
      const where = o.city === o.country ? o.city : `${o.city}, ${o.country}`;
      const kind = o.kind ? AIRPORT_KIND[o.kind] : 'สนามบิน';
      const head = `${o.name} (IATA: ${o.iata}${o.icao ? `, ICAO ${o.icao}` : ''}) เป็น${kind}ที่ให้บริการ${where}`;
      return o.terminals > 0
        ? `${head} โดยมีอาคารผู้โดยสาร ${o.terminals} แห่ง${
            o.gates > 0 ? ` และประตูขึ้นเครื่อง ${o.gates} ประตู` : ''
          }${o.distance ? ` ห่างจากใจกลาง${o.city}ประมาณ ${o.distance}` : ''}`
        : `${head}`;
    },
    mapTitle: (iata: string) => `${iata} · ผังอาคารผู้โดยสาร`,
    mapNote: 'ผังอาคารผู้โดยสาร',
    realMapTitle: (iata: string) => `แผนที่อาคารผู้โดยสารสนามบิน ${iata} — ประตูขึ้นเครื่องและการนำทาง`,
    /** Alt text for the terminal-map images: full airport name and code, which
        the panel label above them omits. */
    mapAlt: (name: string, iata: string) =>
      `แผนที่อาคารผู้โดยสารของ${name} (${iata}) แสดงอาคารผู้โดยสารทั้งหมด ช่วงประตูขึ้นเครื่อง และอาคารโถง`,
    realMapNote: 'แผนที่อาคารผู้โดยสาร',
    /** Photo gallery: public web sources, each credited under its picture. */
    photosKicker: 'ภาพถ่าย',
    photosTitle: 'ภาพสนามบิน',
    photosEn: 'ภาพสนามบิน',
    photosSub:
      'ภาพจริงของสนามบินแห่งนี้ พร้อมเครดิตของหน้าเว็บสาธารณะที่พบภาพ; ลิขสิทธิ์ยังเป็นของผู้ถ่ายภาพต้นฉบับ คลิกที่ภาพเพื่อขยาย หรือคลิกบรรทัดเครดิตเพื่อเปิดหน้าแหล่งที่มา',
    photosCredit: (host: string) => `ที่มา: ${host}`,
    photosAlt: (name: string, iata: string, index: number) =>
      `ภาพสนามบิน ${name} (${iata}) ลำดับที่ ${index}`,
    photosZoom: (name: string, index: number) => `ขยายภาพลำดับที่ ${index} ของ ${name}`,
    /** Download buttons under the map: the image downloads directly, the PDF
        button links out to a Google search for the official PDF. */
    zoomLabel: 'ขยาย',
    zoomClose: 'ปิด',
    zoomIn: 'ขยาย',
    zoomOut: 'ย่อ',
    downloadKicker: 'ดาวน์โหลด',
    downloadTitle: 'ดาวน์โหลดแผนที่สนามบิน',
    downloadEn: 'ดาวน์โหลด',
    downloadMapLabel: (year: number, iata: string) =>
      `แผนที่อาคารผู้โดยสารและผังพื้นสนามบิน ${iata} ล่าสุดปี ${year} ดาวน์โหลด`,
    downloadPdfLabel: (year: number, iata: string) =>
      `ดาวน์โหลดแผนที่อาคารผู้โดยสารสนามบิน ${iata} ล่าสุดปี ${year} (PDF)`,
    timeKicker: 'เวลา',
    timeTitle: (iata: string) => `ข้อมูลเวลาสนามบิน — เวลาปัจจุบันที่ ${iata}`,
    timeEn: 'เวลาสนามบิน',
    timeSub: (iata: string, tz: string) => `เวลาปัจจุบันที่ ${iata} (${tz}) เทียบกับเวลาท้องถิ่นของคุณ`,
    clockAirport: 'เวลาปัจจุบันที่สนามบิน',
    clockLocal: 'เวลาท้องถิ่นของคุณ',
    infoKicker: 'ข้อมูล',
    infoTitle: 'ข้อมูลและรายละเอียดสนามบิน',
    infoEn: 'รายละเอียดสนามบิน',
    infoIata: 'รหัส IATA ของสนามบิน',
    infoLocation: 'ที่ตั้งสนามบิน',
    infoCoords: 'พิกัด',
    infoTimezone: 'เขตเวลา',
    /** "Related links" section: official website / Wikipedia / Baidu Baike. */
    linksKicker: 'ลิงก์',
    linksTitle: 'ลิงก์ที่เกี่ยวข้อง',
    linksEn: 'ลิงก์ที่เกี่ยวข้อง',
    linksSub: 'แหล่งอ้างอิงภายนอกสำหรับสนามบินนี้: เว็บไซต์ทางการ Wikipedia และ Baidu Baike',
    officialSite: 'เว็บไซต์ทางการ',
    wikiLabel: 'Wikipedia',
    baikeLabel: 'Baidu Baike',
    /** Named sources cited under the link buttons (answer-first audit). */
    sourcesLabel: 'แหล่งข้อมูล: ',
    sourcesWikipedia: 'Wikipedia',
    sourcesOurAirports: 'ข้อมูลเปิด OurAirports',
    sourcesNote:
      'รหัสสนามบิน พิกัด และประเภทสนามบินรวบรวมจากข้อมูลเปิด; รายละเอียดในหน้าเป็นไปตามเอกสารทางการของแต่ละสนามบิน',
    mapEmbedKicker: 'แผนที่',
    mapEmbedTitle: (name: string) => `แผนที่อินเทอร์แอกทีฟ — ตำแหน่ง ${name}`,
    mapEmbedEn: 'แผนที่อินเทอร์แอกทีฟ',
    extMapsNote: 'ดูสนามบินนี้บนบริการแผนที่อื่น:',
    routeMapKicker: 'เส้นทาง',
    routeMapTitle: (name: string) => `แผนที่เส้นทาง ${name} — จุดหมายบินตรง`,
    routeMapEn: 'แผนที่เส้นทาง',
    routeMapAria: (name: string) => `แผนที่เส้นทางบินตรงจาก ${name}`,
    routeLegendTitle: 'คำอธิบายสี',
    routeLegendClose: 'ซ่อนคำอธิบาย',
    routeReset: 'รีเซ็ตแผนที่',
    routeZoomIn: 'ขยาย',
    routeZoomOut: 'ย่อ',
    routeFullscreen: 'ดูเต็มหน้าจอ',
    routeExitFullscreen: 'ออกจากเต็มหน้าจอ',
    /** Hover hint on clickable destination dots; `{iata}` is substituted client-side. */
    routeOpenAirport: 'เปิดหน้าสนามบิน {iata}',
    /** Mirrors the tiers in lib/route-tiers.ts. */
    routeTiers: {
      trunk: '6 สายการบินขึ้นไป',
      major: '3–5 สายการบิน',
      minor: '2 สายการบิน',
      single: '1 สายการบิน',
    },
    /** Airline count in the map's hover tooltip; `{n}` is substituted client-side. */
    routeCarriersTpl: '{n} สายการบิน',
    routeTableDest: 'จุดหมายปลายทาง',
    routeTableCountry: 'ประเทศ/ภูมิภาค',
    routeTableDistance: 'ระยะทาง',
    routeTableCarriers: 'สายการบิน',
    routeCarriersMore: (n: number) => ` +อีก ${n} รายการ`,
    routeMapNote: (date: string) =>
      `ข้อมูลเส้นทาง ณ วันที่ ${date}; เฉพาะเที่ยวบินตรง ที่มา: `,
    legendTerminal: 'อาคารผู้โดยสาร',
    legendTransit: 'จุดเชื่อมต่อการเดินทางภาคพื้นดิน',
    legendCorridor: 'ทางเชื่อมระหว่างอาคารผู้โดยสาร',
    terminalsKicker: 'อาคารผู้โดยสาร',
    terminalsTitle: 'คู่มืออาคารผู้โดยสาร',
    terminalsEn: 'คู่มืออาคารผู้โดยสาร',
    terminalsSub: (name: string) =>
      `ช่วงประตูขึ้นเครื่อง สายการบินหลัก และสิ่งอำนวยความสะดวกของแต่ละอาคารผู้โดยสารที่ ${name}`,
    transitTitle: 'การเดินทางภาคพื้นดิน',
    facilitiesTitle: 'สิ่งอำนวยความสะดวกในสนามบิน',
    faqKicker: 'คำถามที่พบบ่อย',
    faqTitle: 'คำถามที่พบบ่อย',
    faqEn: 'คำถาม',
    guideKicker: 'คู่มือ',
    guideTitle: 'คู่มือสนามบิน',
    guideEn: 'คู่มือสนามบิน',
    /** Blog section: the /blog articles that cover this airport (lib/blog.ts). */
    blogKicker: 'บทความ',
    blogTitle: (iata: string) => `คู่มือสนามบิน ${iata}`,
    blogEn: 'จากบล็อก',
    blogSub: (iata: string, count: number) =>
      `${count} บทความในเว็บไซต์นี้ครอบคลุม ${iata}: การมาถึง การเดินทางภาคพื้นดิน กระเป๋าเดินทาง และการต่อเครื่อง`,
    blogAll: 'บทความทั้งหมด',
    relatedTitle: (country: string) => `สนามบินอื่น ๆ ใน${country}`,
    relatedEn: (country: string) => `เพิ่มเติมใน${country}`,
    relatedAll: (country: string) => `สนามบินทั้งหมดใน${country}`,
    /**
     * Flight board: every flight number in aviability.com's index that departs
     * from or arrives at this airport. No times — the source sitemaps carry none.
     */
    flights: {
      kicker: 'เที่ยวบิน',
      title: (name: string) => `เที่ยวบินของ${name} — ขาออกและขาเข้า`,
      en: 'ป้ายเที่ยวบิน',
      sub: (flights: string, airlines: string, destinations: string) =>
        `${plural(flights, 'หมายเลขเที่ยวบิน', 'หมายเลขเที่ยวบิน')} ครอบคลุม ${plural(
          airlines,
          'สายการบิน',
          'สายการบิน'
        )} และ ${plural(destinations, 'จุดหมายปลายทาง', 'จุดหมายปลายทาง')} แยกตามทิศทาง หมายเลขเที่ยวบินร่วม (codeshare) รวมอยู่ด้วย`,
      statDepartures: 'หมายเลขเที่ยวบินขาออก',
      statArrivals: 'หมายเลขเที่ยวบินขาเข้า',
      statAirlines: 'สายการบิน',
      statDestinations: 'จุดหมายปลายทาง',
      note: (date: string) =>
        `หมายเลขเที่ยวบินและเส้นทางจากดัชนีเที่ยวบิน aviability.com (ข้อมูล ณ วันที่ ${date}); รวมหมายเลขเที่ยวบินร่วมและไม่แสดงเวลาเดินทาง ที่มา: `,
      source: 'aviability.com',
      tabDepartures: 'ขาออก',
      tabArrivals: 'ขาเข้า',
      search: 'ค้นหาหมายเลขเที่ยวบิน สายการบิน หรือเมือง',
      clearSearch: 'ล้างการค้นหา',
      flight: 'เที่ยวบิน',
      airline: 'สายการบิน',
      destination: 'จุดหมายปลายทาง',
      origin: 'ต้นทาง',
      country: 'ประเทศ/ภูมิภาค',
      empty: 'ไม่มีเที่ยวบินที่ตรงกับการค้นหานี้',
      loading: 'กำลังโหลดเที่ยวบิน…',
      error: 'ไม่สามารถโหลดเที่ยวบินเพิ่มเติมได้',
      retry: 'ลองอีกครั้ง',
      previous: 'ก่อนหน้า',
      next: 'ถัดไป',
      pagination: 'การแบ่งหน้า',
      showing: 'แสดง {from}–{to} จาก {total} หมายเลขเที่ยวบิน',
      pageOf: 'หน้า {page} จาก {pages}',
    },
    notFound: 'ไม่พบสนามบิน',
  },

  /** Standalone route-map page (/route/<IATA>). */
  route: {
    metaTitle: (year: number, name: string, iata: string, count: string) =>
      `แผนที่เส้นทาง ${name} (${iata}) ล่าสุดปี ${year} — จุดหมายบินตรง ${count} แห่ง`,
    metaDescription: (name: string, iata: string, count: string) =>
      `แผนที่เส้นทางบินตรงสำหรับ ${name} (${iata}): จุดหมายปลายทาง ${count} แห่ง พร้อมสายการบินที่ให้บริการและระยะทาง และรายชื่อจุดหมายฉบับเต็ม`,
    heading: (name: string) => `แผนที่เส้นทาง ${name}`,
    headingSub: (iata: string, count: string) =>
      `${iata} มีจุดหมายบินตรง ${count} แห่ง ระบายสีตามจำนวนสายการบินที่ให้บริการ`,
    backToAirport: (iata: string) => `กลับไปยังหน้าสนามบิน ${iata}`,
    /** Link from the route page to the airport page's flight board. */
    flightNumbers: (iata: string) => `หมายเลขเที่ยวบิน ${iata}`,
    /** Button on the airport page's teaser card. */
    openFull: 'ดูแผนที่เส้นทาง',
    /** Same card, for the airports whose network the repo has rendered: the picture is the link. */
    previewCta: (iata: string) => `ดูแผนที่เส้นทาง ${iata} ฉบับเต็ม`,
    teaserSub: (count: string) => `${count} จุดหมายบินตรง: แผนที่ สายการบินที่ให้บริการ และระยะทาง`,
    /** Section headings, each naming the airport (`en` line takes the IATA code). */
    mapSectionTitle: (name: string) => `แผนที่เส้นทางบินตรง ${name}`,
    tableKicker: (iata: string) => `${iata} · จุดหมายปลายทาง`,
    tableSectionTitle: (name: string) => `รายชื่อจุดหมายบินตรง ${name}`,
    tableSectionEn: (iata: string) => `จุดหมายปลายทาง ${iata}`,
    /** Short label for the contents rail, where the full heading would wrap. */
    tableToc: 'จุดหมายปลายทาง',
    tableSectionSub: (count: string) =>
      `${count} จุดหมายปลายทาง เรียงจากมากไปน้อยตามจำนวนสายการบินที่ให้บริการ พร้อมระยะทางและสายการบิน`,
    dataKicker: 'ดาวน์โหลด',
    dataTitle: 'ดาวน์โหลดข้อมูลเส้นทาง',
    dataEn: 'ข้อมูล',
    dataSub: (count: number) =>
      `${count} เส้นทางบินตรง พร้อมจุดหมาย รหัส IATA เมือง ประเทศ ระยะทาง และสายการบินที่ให้บริการ — พร้อมใช้ในสเปรดชีตหรือสคริปต์`,
    dataFields: 'CSV เหมาะกับ Excel / Numbers และ JSON เหมาะกับโค้ด; ทั้งคู่เป็น UTF-8',
    dataCsv: 'ดาวน์โหลด CSV',
    dataJson: 'ดาวน์โหลด JSON',
    /** Clickable terminal-map card pointing at the airport page. */
    airportMapSub:
      'ผังอาคารผู้โดยสารและประตูขึ้นเครื่องโดยสรุป — คลิกที่ภาพเพื่อดูแผนที่ฉบับเต็ม สิ่งอำนวยความสะดวกในอาคารผู้โดยสาร และการเดินทางภาคพื้นดินบนหน้าสนามบิน',
    airportMapCta: (iata: string) => `ดูแผนที่อาคารผู้โดยสาร ${iata} ฉบับเต็ม`,
    /** Header fact cells. */
    factDestinations: 'จุดหมายบินตรง',
    factAirlines: 'สายการบิน',
    factCountries: 'ประเทศ',
    factSnapshot: 'ข้อมูล ณ วันที่',
    /** FAQ — every answer is computed from the route data. */
    faqCountQ: (name: string) => `สนามบิน ${name} บินตรงไปกี่แห่ง?`,
    faqCountA: (name: string, iata: string, count: string, countries: string) =>
      `${name} (${iata}) มีจุดหมายบินตรง ${count} แห่งใน ${countries} ประเทศและดินแดน นับเฉพาะเส้นทางบินตรง ไม่นับเส้นทางที่มีจุดแวะ`,
    faqAirlinesQ: (name: string) => `มีสายการบินกี่แห่งที่บินจาก ${name}?`,
    faqAirlinesA: (count: string, leaders: string) =>
      `มีสายการบิน ${count} แห่งให้บริการเส้นทางบินตรงจากสนามบินนี้ เครือข่ายที่กว้างที่สุดคือ ${leaders} (จำนวนจุดหมายในวงเล็บ)`,
    faqFarthestQ: (name: string) => `จุดหมายบินตรงที่ไกลที่สุดจาก ${name} คือที่ใด?`,
    faqFarthestA: (city: string, country: string, iata: string, km: string) =>
      `จุดหมายบินตรงที่ไกลที่สุดคือ ${city}, ${country} ${iata} ห่างประมาณ ${km} กม.`,
    faqBusiestQ: () => 'จุดหมายใดมีการแข่งขันมากที่สุด?',
    faqBusiestA: (count: string, list: string) =>
      `มีจุดหมาย ${count} แห่งที่มีสายการบินตั้งแต่สามแห่งขึ้นไปให้บริการ ที่คึกคักที่สุดคือ ${list}`,
    faqSourceQ: () => 'ข้อมูลเส้นทางอัปเดตบ่อยแค่ไหน?',
    faqSourceA: (date: string, source: string, license: string) =>
      `เส้นทางในหน้านี้มาจากชุดข้อมูลเปิด ${source} (${license}) ซึ่งเป็นข้อมูล ณ วันที่ ${date} ไม่ใช่ตารางบินแบบเรียลไทม์ — โปรดตรวจสอบตั๋วและเวลาเดินทางกับสายการบินหรือสนามบิน`,
  },

  /** Standalone flight-number page (/flight/<number>). */
  flight: {
    metaTitle: (number: string, airline: string, from: string, to: string) =>
      `เที่ยวบิน ${number} ของ ${airline} — ${from} ไป ${to}`,
    metaDescription: (number: string, airline: string, from: string, to: string, distance: string) =>
      `เที่ยวบิน ${number} เป็นหมายเลขเที่ยวบินที่ ${airline} ใช้ในเส้นทางจาก ${from} ไป ${to}${distance ? ` ห่างประมาณ ${distance}` : ''} แผนที่เส้นทาง สนามบินต้นทางและปลายทาง ระยะทาง และเที่ยวบินอื่นในเส้นทางเดียวกัน`,
    heading: (number: string) => `เที่ยวบิน ${number}`,
    subtitle: (airline: string, from: string, to: string) => `${airline} · ${from} → ${to}`,
    lead: (number: string, airline: string, from: string, to: string, distance: string) =>
      `เที่ยวบิน ${number} เป็นหมายเลขเที่ยวบินที่ ${airline} ใช้ระหว่าง ${from} และ ${to}${distance ? ` โดยมีระยะทางวงกลมใหญ่ประมาณ ${distance}` : ''}`,
    factFlight: 'หมายเลขเที่ยวบิน',
    factFrom: 'จาก',
    factTo: 'ไปยัง',
    factDistance: 'ระยะทาง',
    overviewKicker: 'ภาพรวม',
    overviewTitle: (number: string) => `เกี่ยวกับเที่ยวบิน ${number}`,
    overviewBody: (
      number: string,
      airline: string,
      originName: string,
      originIata: string,
      destName: string,
      destIata: string,
      distance: string
    ) =>
      `${number} เป็นหมายเลขเที่ยวบินที่ ${airline} ใช้ระหว่าง ${originName} (${originIata}) และ ${destName} (${destIata})${distance ? ` ห่างกันประมาณ ${distance}` : ''} หน้านี้รวบรวมหมายเลขเที่ยวบิน สายการบิน เส้นทาง และสนามบินทั้งสองแห่งเพื่อการค้นหาที่รวดเร็ว`,
    overviewNote:
      'ดัชนีเที่ยวบินไม่มีเวลาเดินทาง เวลาถึง เครื่องบิน หรือวันที่ให้บริการ; โปรดตรวจสอบตารางบิน เวลาเช็คอิน และเวลาขึ้นเครื่องกับสายการบินหรือสนามบิน',
    routeKicker: 'เส้นทาง',
    routeTitle: (from: string, to: string) => `เส้นทาง ${from} → ${to}`,
    routeDiagramAria: (number: string) => `แผนภาพเส้นทางของเที่ยวบิน ${number}`,
    routeMapAria: (number: string) => `แผนที่เส้นทางของเที่ยวบิน ${number}`,
    airportsKicker: 'สนามบิน',
    airportsTitle: 'สนามบินต้นทางและปลายทาง',
    airportsSub:
      'สนามบินที่เที่ยวบินนี้เชื่อมต่อ สนามบินที่ไดเรกทอรีครอบคลุมจะมีหน้าเฉพาะ',
    originAirport: 'สนามบินต้นทาง',
    destinationAirport: 'สนามบินปลายทาง',
    airportPage: 'เปิดหน้าสนามบิน',
    detailsKicker: 'รายละเอียด',
    detailsTitle: 'รายละเอียดเที่ยวบิน',
    detailsFlight: 'หมายเลขเที่ยวบิน',
    detailsAirline: 'สายการบิน',
    detailsOrigin: 'สนามบินต้นทาง',
    detailsDestination: 'สนามบินปลายทาง',
    detailsDistance: 'ระยะทางวงกลมใหญ่',
    detailsRoutes: 'เส้นทางที่ระบุ',
    detailsSnapshot: 'ข้อมูล ณ วันที่',
    routesKicker: 'เส้นทาง',
    routesTitle: 'เส้นทางภายใต้หมายเลขเที่ยวบินนี้',
    routesSub: (count: string) =>
      `หมายเลขนี้ปรากฏใน ${count} เส้นทาง; หมายเลขเดียวอาจถูกใช้ร่วมโดยพันธมิตร codeshare`,
    routesRoute: 'เส้นทาง',
    routesAirline: 'สายการบิน',
    routesDistance: 'ระยะทาง',
    relatedKicker: 'ที่เกี่ยวข้อง',
    relatedTitle: 'เที่ยวบินอื่นในเส้นทางนี้',
    relatedSub: 'หมายเลขเที่ยวบินอื่นระหว่างสนามบินต้นทางและปลายทางเดียวกัน',
    relatedEn: 'เที่ยวบินเพิ่มเติม',
    faqKicker: 'คำถามที่พบบ่อย',
    faqTitle: 'คำถามที่พบบ่อย',
    faqEn: 'คำถาม',
    faqWhat: (number: string) => `เที่ยวบิน ${number} คืออะไร?`,
    faqWhatAnswer: (number: string, airline: string, from: string, to: string, distance: string) =>
      `เที่ยวบิน ${number} เป็นหมายเลขเที่ยวบินที่ ${airline} ใช้ในเส้นทาง ${from} → ${to}${distance ? ` ห่างกันประมาณ ${distance}` : ''}`,
    faqRoute: (number: string) => `เที่ยวบิน ${number} บินไปที่ใด?`,
    faqRouteAnswer: (
      number: string,
      originName: string,
      originIata: string,
      destName: string,
      destIata: string
    ) =>
      `เที่ยวบิน ${number} บินจาก ${originName} (${originIata}) ไปยัง ${destName} (${destIata})`,
    faqTimes: (number: string) => `เวลาเดินทางและเวลาถึงของ ${number} อยู่ที่ไหน?`,
    faqTimesAnswer: (number: string) =>
      `หน้านี้ครอบคลุมหมายเลขเที่ยวบิน สายการบิน เส้นทาง และสนามบินของ ${number} ดัชนีเที่ยวบิน aviability.com ไม่มีเวลาเดินทางหรือเวลาถึง — โปรดตรวจสอบตารางบินปัจจุบันกับสายการบินหรือสนามบิน`,
    note: (date: string) =>
      `หมายเลขเที่ยวบิน สายการบิน และเส้นทางจากดัชนีเที่ยวบิน aviability.com (ข้อมูล ณ วันที่ ${date}); ไม่รวมเวลาเดินทางและเวลาถึง ที่มา: `,
    source: 'aviability.com',
    sourceFlight: 'ดูบน aviability.com',
    viewAirport: (iata: string) => `เปิดหน้าสนามบิน ${iata}`,
    notFound: 'ไม่พบเที่ยวบิน',
  },

  faq: {
    terminalCount: (name: string) => `สนามบิน ${name} มีอาคารผู้โดยสารกี่แห่ง?`,
    terminalCountAnswer: (name: string, iata: string, terminals: string, gates: string, list: string) =>
      `${name} (${iata}) มีอาคารผู้โดยสาร ${terminals} แห่ง รวมประตูขึ้นเครื่อง ${gates} ประตู: ${list}`,
    gateCount: (name: string) => `สนามบิน ${name} มีประตูขึ้นเครื่องกี่ประตู?`,
    gateCountAnswer: (name: string, iata: string, gates: string, list: string) =>
      `${name} (${iata}) มีประตูขึ้นเครื่องทั้งหมด ${gates} ประตู: ${list}`,
    whereIs: (iata: string) => `${iata} อยู่ที่ไหน?`,
    whereIsAnswer: (iata: string, name: string, nameEn: string, city: string, cityEn: string, country: string) =>
      `${iata} เป็นรหัส IATA ของ ${name} (${nameEn}) ตั้งอยู่ใน${city}${
        cityEn ? ` (${cityEn})` : ''
      }, ${country}`,
    distance: (name: string, city: string) => `สนามบิน ${name} ห่างจากใจกลาง${city}เท่าใด?`,
    distanceAnswer: (name: string, city: string, distance: string, transit: string) =>
      `${name} อยู่ห่างจากใจกลาง${city}ประมาณ ${distance} คุณเดินทางเข้าเมืองได้โดย ${transit}`,
    access: (name: string, city: string) => `คุณจะเดินทางจาก ${name} เข้า${city}ได้อย่างไร?`,
    accessAnswer: (options: string) => `${options}`,
    facilities: (name: string) => `สนามบิน ${name} มีสิ่งอำนวยความสะดวกอะไรบ้าง?`,
    facilitiesAnswer: (name: string, facilities: string) =>
      `${name} มี ${facilities} ดูผังอาคารผู้โดยสารด้านบนเพื่อดูการกระจายระหว่างอาคารผู้โดยสาร`,
    location: (name: string) => `สนามบิน ${name} ตั้งอยู่ที่ไหน?`,
    locationAnswer: (name: string, nameEn: string, iata: string, city: string, cityEn: string, country: string) =>
      `${name} (${nameEn}, รหัส IATA ${iata}) ตั้งอยู่ใน${city}${
        cityEn ? ` (${cityEn})` : ''
      }, ${country}`,
    airlines: (name: string) => `สายการบินใดให้บริการในแต่ละอาคารผู้โดยสารที่ ${name}?`,
    airlinesAnswer: (name: string, list: string) =>
      `สายการบินหลักตามอาคารผู้โดยสารที่ ${name}: ${list} สายการบินและการกำหนดประตูขึ้นเครื่องอาจเปลี่ยนแปลง โปรดตรวจสอบจากบัตรโดยสารและป้ายบอกทางของสนามบินเสมอ`,
    timezone: (name: string) => `สนามบิน ${name} อยู่ในเขตเวลาใด?`,
    timezoneAnswer: (name: string, iata: string, tz: string) =>
      `${name} (${iata}) อยู่ในเขตเวลา ${tz} เปรียบเทียบกับเวลาท้องถิ่นของคุณได้จากนาฬิกาสนามบินด้านบน`,
    flightsCount: (name: string) => `มีหมายเลขเที่ยวบินกี่รายการที่ระบุไว้ที่ ${name}?`,
    flightsCountAnswer: (
      name: string,
      iata: string,
      departures: string,
      arrivals: string,
      airlines: string,
      destinations: string,
      date: string
    ) =>
      `ดัชนีเที่ยวบิน aviability.com ระบุ ${plural(
        departures,
        'หมายเลขเที่ยวบินขาออก',
        'หมายเลขเที่ยวบินขาออก'
      )} และ ${plural(arrivals, 'หมายเลขเที่ยวบินขาเข้า', 'หมายเลขเที่ยวบินขาเข้า')} สำหรับ ${name} (${iata}) ครอบคลุม ${plural(
        airlines,
        'สายการบิน',
        'สายการบิน'
      )} และ ${plural(destinations, 'จุดหมายปลายทาง', 'จุดหมายปลายทาง')} (ข้อมูล ณ วันที่ ${date}) รวมหมายเลขเที่ยวบินร่วม และตารางบินอาจเปลี่ยนแปลง — โปรดตรวจสอบกับสายการบินก่อนเดินทาง`,
  },

  /** Author byline & E-E-A-T trust signals shown under the airport page title. */
  editorial: {
    authorName: 'ทีมบรรณาธิการ World Airport Maps',
    role: 'รวบรวมและตรวจทานโดย ',
    sourcesNote: 'รวบรวมจากแหล่งข้อมูลสาธารณะและข้อมูลทางการของสนามบิน',
  },

  /** Right-rail "on this page" navigation for the airport page. */
  toc: {
    label: 'ในหน้านี้',
    map: 'แผนที่อาคารผู้โดยสาร',
    photos: 'ภาพสนามบิน',
    time: 'เวลาสนามบิน',
    details: 'รายละเอียดสนามบิน',
    links: 'ลิงก์ที่เกี่ยวข้อง',
    location: 'แผนที่ตำแหน่ง',
    routes: 'แผนที่เส้นทาง',
    flights: 'เที่ยวบิน',
    guide: 'คู่มือสนามบิน',
    blog: 'คู่มือที่เกี่ยวข้อง',
    terminals: 'คู่มืออาคารผู้โดยสาร',
    transport: 'การเดินทางภาคพื้นดิน',
    facilities: 'สิ่งอำนวยความสะดวก',
    faq: 'คำถามที่พบบ่อย',
    flightOverview: 'ภาพรวมเที่ยวบิน',
    flightRoute: 'เส้นทาง',
    flightAirports: 'สนามบิน',
    flightDetails: 'รายละเอียดเที่ยวบิน',
    flightRoutes: 'เส้นทางทั้งหมด',
    flightRelated: 'เที่ยวบินที่เกี่ยวข้อง',
    intro: 'ภาพรวมสนามบิน',
    distribution: 'การกระจายตัวของสนามบิน',
    airports: 'รายชื่อสนามบิน',
  },

  error: {
    title: 'ไม่สามารถโหลดหน้านี้ได้',
    sub: 'เกิดข้อผิดพลาดขณะอ่านข้อมูลสนามบิน โปรดลองอีกครั้ง หรือกลับไปที่หน้าแรกเพื่อเรียกดูต่อ',
    retry: 'ลองอีกครั้ง',
    backHome: 'กลับไปหน้าแรก',
    notFoundTitle: '404 · ไม่พบหน้า',
    notFoundSub: 'หน้าที่คุณขออาจถูกย้ายหรือลบไปแล้ว ลองค้นหาสนามบิน หรือไปต่อจากลิงก์ด้านล่าง',
  },

  footer: {
    sponsored: 'ได้รับการสนับสนุน',
    mapsTitle: 'แผนที่อาคารผู้โดยสารโดยละเอียด',
    mapsBody:
      'การเดินทางในสนามบินและอาคารผู้โดยสารอาจเป็นเรื่องท้าทาย แผนที่สนามบินของเราแสดงผังโดยละเอียดของอาคารผู้โดยสาร ประตูขึ้นเครื่อง พื้นที่เช็คอิน การรับกระเป๋า ร้านค้า ร้านอาหาร เลานจ์ และจุดเชื่อมต่อการเดินทาง เพื่อให้การเดินทางของคุณราบรื่นขึ้น',
    plansTitle: 'ผังอาคารผู้โดยสารแบบอินเทอร์แอกทีฟ',
    plansBody:
      'สนามบินระหว่างประเทศขนาดใหญ่มีหลายอาคารผู้โดยสารและผังที่ซับซ้อน แผนที่โดยละเอียดของเราช่วยให้คุณหาประตูขึ้นเครื่อง พบสิ่งอำนวยความสะดวก วางแผนต่อเครื่อง และเคลื่อนที่ผ่านจุดตรวจความปลอดภัย พื้นที่ขาออก และขาเข้าได้อย่างมีประสิทธิภาพ',
    transitTitle: 'การเดินทางและการเข้าถึงสนามบิน',
    transitBody:
      'นอกจากผังอาคารผู้โดยสารแล้ว เรายังครอบคลุมตัวเลือกการเดินทาง ที่จอดรถ และเส้นทางเข้าถึง — วิธีไปถึงประตูขึ้นเครื่อง การเดินทางระหว่างอาคารผู้โดยสาร และการใช้การเดินทางภาคพื้นดิน ทั้งรถไฟ รถบัส แท็กซี่ และรถเช่า',
    stats: (countries: string, airports: string, terminals: string) =>
      `${countries} ประเทศ / ภูมิภาค · ${airports} สนามบิน · ${terminals} อาคารผู้โดยสาร · ผังอาคารผู้โดยสารพร้อมภาพประกอบ`,
    fallback: 'ผังอาคารผู้โดยสารพร้อมภาพประกอบและคู่มือการเดินทางภาคพื้นดินสำหรับสนามบินทั่วโลก',
    linksLabel: 'การนำทางส่วนท้าย',
    about: 'เกี่ยวกับ',
    contact: 'ติดต่อ',
    sources: 'แหล่งข้อมูล',
    privacy: 'นโยบายความเป็นส่วนตัว',
    disclaimer: 'ข้อจำกัดความรับผิดชอบ',
    terms: 'ข้อกำหนดการใช้งาน',
  },

  /** Mode labels keyed by the transport icon stored on ground_transport.icon.
   *  Used when a locale has no translated name for a specific service. */
  transportModes: thTransportModes as Record<string, string>,

  /** Functional-area category strip on the homepage. */
  categories: {
    kicker: 'เรียกดู',
    title: 'เรียกดูตามหมวดหมู่',
    en: 'เรียกดูตามหมวดหมู่',
    sub: 'เข้าสู่ไดเรกทอรีจากมุมที่คุณต้องการ: ตามประเทศ ตามภูมิภาค ตามเมือง — หรือไปที่ศูนย์กลางที่คึกคักที่สุด ข้อมูลล่าสุด และคู่มือสนามบิน',
    allAirports: {
      title: 'สนามบินทั้งหมด',
      body: 'ไดเรกทอรีฉบับเต็ม เรียงตามปริมาณผู้โดยสาร กรองตามประเทศ และจัดเรียงใหม่ได้',
    },
    byCountry: {
      title: 'ตามประเทศ',
      body: 'ดูว่าประเทศหรือภูมิภาคแต่ละแห่งมีสนามบิน อาคารผู้โดยสาร และประตูขึ้นเครื่องกี่แห่ง',
    },
    byRegion: {
      title: 'ตามภูมิภาค',
      body: 'ประเทศที่จัดกลุ่มเป็นเอเชียตะวันออก ยุโรป อเมริกาเหนือ และอื่น ๆ เพื่อการค้นหาที่รวดเร็วขึ้น',
    },
    popularCities: {
      title: 'เมืองยอดนิยม',
      body: 'เมืองที่มีสนามบินคึกคักที่สุดตามจำนวนผู้โดยสารต่อปี และทุกสนามบินในแต่ละเมือง',
    },
    recentlyUpdated: {
      title: 'อัปเดตล่าสุด',
      body: 'ข้อมูลสนามบินที่เพิ่มใหม่และเพิ่งปรับปรุง ล่าสุดก่อน',
    },
    guides: {
      title: 'คู่มือสนามบิน',
      body: 'คู่มือฉบับยาวเกี่ยวกับการต่อเครื่อง การเดินทางเข้าเมือง และเคล็ดลับที่เป็นประโยชน์',
    },
    routes: {
      title: 'แผนที่เส้นทาง',
      body: 'ดูเครือข่ายบินตรงของสนามบิน จัดอันดับตามจำนวนจุดหมาย พร้อมสายการบินและระยะทาง',
    },
  },

  /** Homepage section listing airports that have a Markdown guide. */
  guides: {
    kicker: 'คู่มือ',
    title: 'คู่มือสนามบิน',
    en: 'คู่มือสนามบิน',
    sub: 'นอกจากผังอาคารผู้โดยสารแล้ว เรายังเขียนคู่มือฉบับยาวสำหรับศูนย์กลางที่คัดเลือก: วิธีอ่านหมายเลขประตูขึ้นเครื่อง วิธีเดินทางระหว่างอาคารผู้โดยสาร และวิธีเข้าเมือง',
    more: 'ดูสนามบินนี้',
  },

  /**
   * Blog (`public/blog`). The articles are published in Chinese, so the /blog
   * routes only exist where that content does; these strings are the English
   * wording of the same UI.
   */
  blog: {
    kicker: 'บันทึก',
    title: 'บันทึกการเดินทาง',
    nav: 'บล็อก',
    en: 'บันทึกการเดินทาง',
    sub: 'บันทึกฉบับยาวจากทีมบรรณาธิการของเรา: การมาถึงและตรวจคนเข้าเมือง การต่อเครื่อง สิ่งอำนวยความสะดวกในอาคารผู้โดยสาร และที่พักผ่อน',
    more: 'อ่าน',
    all: 'บทความทั้งหมด',
    morePosts: 'บทความเพิ่มเติม',
    /** Article page's "airports in this article" block (lib/blog.ts). */
    airportsKicker: 'สนามบิน',
    airportsTitle: 'สนามบินในบทความนี้',
    airportsEn: 'สนามบินที่กล่าวถึง',
    airportsSub: 'เปิดหน้าสนามบินเพื่อดูแผนที่อาคารผู้โดยสาร การเดินทางภาคพื้นดิน และคำถามที่พบบ่อย',
    back: 'กลับไปยังรายการบทความ',
    empty: 'ยังไม่มีบทความ',
    readingMinutes: (n: number) => `${n} นาทีในการอ่าน`,
    source: (name: string) => `ที่มา: ${name}`,
    tags: 'แท็ก',
  },

  /**
   * Reader comments at the foot of every content page
   * (components/Comments.tsx). Strings only: functions cannot cross the
   * server/client boundary, and `{n}` in countMany is substituted in the
   * browser.
   */
  comments: {
    kicker: 'ความคิดเห็น',
    title: 'ความคิดเห็นจากผู้อ่าน',
    en: 'การสนทนา',
    sub: 'ยินดีรับคำถาม รายงานการเดินทาง และการแก้ไข ความคิดเห็นเป็นสาธารณะ',
    formTitle: 'แสดงความคิดเห็น',
    countOne: '1 ความคิดเห็น',
    countMany: '{n} ความคิดเห็น',
    empty: 'ยังไม่มีความคิดเห็น — มาเป็นคนแรกที่เขียน',
    loading: 'กำลังโหลดความคิดเห็น…',
    loadError: 'ไม่สามารถแสดงความคิดเห็นได้ในขณะนี้',
    retry: 'ลองอีกครั้ง',
    nameLabel: 'ชื่อ',
    namePlaceholder: 'เราควรเรียกคุณว่าอะไร?',
    bodyLabel: 'ความคิดเห็น',
    bodyPlaceholder: 'แบ่งปันประสบการณ์ ถามคำถาม หรือเพิ่มข้อมูล…',
    submit: 'ส่งความคิดเห็น',
    submitting: 'กำลังส่ง…',
    success: 'ส่งแล้ว — ขอบคุณที่แบ่งปัน',
    error: 'ไม่สามารถส่งความคิดเห็นได้ โปรดลองอีกครั้งในภายหลัง',
    rateLimited: 'เร็วเกินไป โปรดรอสักครู่แล้วลองอีกครั้ง',
    nameError: 'โปรดใส่ชื่อ (2–40 ตัวอักษร)',
    bodyError: 'โปรดเขียนความคิดเห็น (5–2000 ตัวอักษร)',
    note: 'ความคิดเห็นเป็นสาธารณะและสะท้อนมุมมองของผู้เขียนเอง โปรดสุภาพและอย่าโพสต์โฆษณาหรือข้อมูลส่วนบุคคล',
  },

  terminalMap: {
    ariaLabel: (name: string) => `แผนภาพผังอาคารผู้โดยสารของ ${name}`,
    gates: 'ประตูขึ้นเครื่อง',
    terminal: 'อาคารผู้โดยสาร',
    corridor: 'ทางเชื่อม',
    transit: 'การเดินทางภาคพื้นดิน',
    footer: (iata: string) => `${iata} · ผังอาคารผู้โดยสาร`,
  },

  /** Tool hub (/tool) and the individual tool pages. */
  tool: {
    label: 'เครื่องมือออนไลน์',
    hub: {
      kicker: 'เครื่องมือ',
      title: 'เครื่องมือแผนที่และพิกัด',
      en: 'เครื่องมือฟรี',
      sub: 'เครื่องมือออนไลน์ฟรีสำหรับนักเดินทางและผู้สนใจภูมิศาสตร์ — เปิดในเบราว์เซอร์ ไม่ต้องติดตั้ง',
      description:
        'เครื่องมือแผนที่และพิกัดออนไลน์ฟรี: แปลงพิกัด WGS84 / GCJ02 / BD09 จัดรูปแบบองศาทศนิยม ↔ DMS และคำนวณระยะทางวงกลมใหญ่ระหว่างสองจุด รองรับสองภาษา พร้อมใช้ในเบราว์เซอร์',
      comingTitle: 'เครื่องมือเพิ่มเติมอยู่ระหว่างพัฒนา',
      comingSub: 'ตัวเลือกพิกัด การแชร์ตำแหน่ง และเครื่องคำนวณการฉายแผนที่กำลังจะมา',
    },
    howTitle: 'วิธีใช้งาน',
    relatedTitle: 'เครื่องมือที่เกี่ยวข้อง',
    allTools: 'เครื่องมือทั้งหมด',
    tools: {
      coordinateConverter: {
        title: 'ตัวแปลงพิกัด',
        en: 'ตัวแปลงพิกัด',
        description:
          'แปลงระหว่าง WGS84, GCJ02 และ BD09 — วิธีแก้ปัญหาพิกัดคลาดเคลื่อนบนแผนที่จีน',
        note: 'WGS84 เป็นมาตรฐาน GPS และมาตรฐานสากล ส่วน GCJ02 เป็นระบบพิกัดแบบเลื่อนที่กำหนดใช้ในจีนแผ่นดินใหญ่ (เรียกกันว่า "พิกัดดาวอังคาร") ซึ่ง AMap และ Tencent Maps ใช้; BD09 เพิ่มการเลื่อนอีกชั้นบน GCJ02 และ Baidu Maps ใช้ จุดเดียวกันอาจต่างกัน 100–700 ม. ระหว่างระบบ ดังนั้นควรแปลงพิกัดก่อนนำไปใช้ในบริการแผนที่อื่น',
        steps: [
          'ป้อนพิกัดทศนิยมในรูปแบบละติจูด, ลองจิจูด — เช่น 39.9042, 116.4074',
          'เลือกระบบพิกัดของข้อมูลที่ป้อน',
          'กด "แปลง" เพื่อรับอีกสองระบบ; ใช้ "คัดลอก" เพื่อบันทึกผลลัพธ์',
        ],
        inputLabel: 'พิกัด (ละติจูด, ลองจิจูด)',
        inputPlaceholder: 'เช่น 39.9042, 116.4074',
        sourceLabel: 'ระบบพิกัดอินพุต',
        wgs84: 'WGS84 · GPS / สากล',
        gcj02: 'GCJ02 · AMap / Tencent',
        bd09: 'BD09 · Baidu',
        precisionLabel: 'จำนวนทศนิยม',
        submit: 'แปลง',
        copy: 'คัดลอก',
        copied: 'คัดลอกแล้ว',
        error: 'ไม่สามารถอ่านพิกัดได้ ใช้รูปแบบ "ละติจูด, ลองจิจูด" เช่น 39.9042, 116.4074',
      },
      dmsConverter: {
        title: 'ตัวแปลงรูปแบบพิกัด',
        en: 'ตัวแปลงรูปแบบพิกัด',
        description:
          'แปลงระหว่างองศาทศนิยม (DD), องศา-นาที (DM) และองศา-นาที-วินาที (DMS); ระบบตรวจรูปแบบอินพุตโดยอัตโนมัติ',
        note: 'DD (39.9042°) เป็นรูปแบบทศนิยมล้วนที่อุปกรณ์และ API ใช้; DMS (39°54′15″N) พบได้ทั่วไปในงานเดินเรือ การบิน และการสำรวจ; DM (39°54.25′N) มักใช้ในบันทึกภาคสนาม เครื่องมือตรวจรูปแบบอินพุตจากจำนวนกลุ่มตัวเลขในแต่ละครึ่ง (1 = DD, 2 = DM, 3 = DMS) และแสดงผลทั้งสามรูปแบบ พร้อม N/S/E/W สำหรับซีกโลก',
        steps: [
          'ป้อนพิกัดหนึ่งคู่ — รูปแบบ 39.9042, 39°54′15″N และ 39°32.5′E ใช้ได้ทั้งหมด; คั่นสองครึ่งด้วยจุลภาค',
          'เลือกจำนวนทศนิยมสำหรับผลลัพธ์',
          'กด "แปลง" — ทั้งสามรูปแบบจะแสดงขึ้น; ใช้ "คัดลอก" เพื่อบันทึก',
        ],
        inputLabel: 'พิกัด (หนึ่งคู่ คั่นด้วยจุลภาค)',
        inputPlaceholder: 'เช่น 39°54′15″N, 116°24′51″E หรือ 39.9042, 116.4074',
        precisionLabel: 'จำนวนทศนิยม',
        submit: 'แปลง',
        ddLabel: 'องศาทศนิยม (DD)',
        dmLabel: 'องศา-นาที (DM)',
        dmsLabel: 'องศา-นาที-วินาที (DMS)',
        copy: 'คัดลอก',
        copied: 'คัดลอกแล้ว',
        error: 'ไม่สามารถอ่านพิกัดได้ รูปแบบที่รองรับ ได้แก่ 39.9042, 39°54′15″N และ 39°32.5′E โดยคั่นด้วยจุลภาค',
      },
      distanceCalculator: {
        title: 'เครื่องคำนวณระยะทาง',
        en: 'เครื่องคำนวณระยะทาง',
        description:
          'ระยะทางวงกลมใหญ่ระหว่างสองจุดบนโลก พร้อมมุมราบเริ่มต้น',
        note: 'ระยะทางใช้สูตรวงกลมใหญ่แบบ Haversine (รัศมีโลกเฉลี่ย 6,371.0088 กม.) ซึ่งเป็นเส้นทางที่สั้นที่สุดบนพื้นผิว มุมราบเริ่มต้นคือทิศเข็มทิศจากจุดแรกไปยังจุดที่สอง โดย 0° คือทิศเหนือและเพิ่มขึ้นตามเข็มนาฬิกา',
        steps: [
          'ป้อนละติจูดและลองจิจูดของจุดเริ่มต้นและจุดสิ้นสุด',
          'กด "คำนวณระยะทาง"',
          'รับผลลัพธ์เป็นกิโลเมตร ไมล์ และไมล์ทะเล พร้อมมุมราบเริ่มต้น',
        ],
        fromLabel: 'จาก',
        toLabel: 'ไปยัง',
        inputPlaceholder: 'ละติจูด, ลองจิจูด',
        example: 'ตัวอย่าง: ปักกิ่ง → เซี่ยงไฮ้',
        submit: 'คำนวณระยะทาง',
        km: 'กม.',
        mi: 'ไมล์',
        nmi: 'ไมล์ทะเล',
        bearing: 'มุมราบเริ่มต้น',
        copy: 'คัดลอก',
        copied: 'คัดลอกแล้ว',
        error: 'ไม่สามารถอ่านพิกัดได้ ใช้รูปแบบ "ละติจูด, ลองจิจูด" โดยละติจูดอยู่ระหว่าง -90 ถึง 90 และลองจิจูดอยู่ระหว่าง -180 ถึง 180',
      },
    },
  },
};
