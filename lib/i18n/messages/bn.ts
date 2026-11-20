import type { Messages } from './zh';
import { bnTransportModes } from '../bn-data';

/** সূচনা বাক্যের জন্য বিমানবন্দরের শ্রেণি (schema.org-এর airport ধরন)। */
const AIRPORT_KIND = {
  large: 'বড় বিমানবন্দর',
  medium: 'মাঝারি বিমানবন্দর',
  small: 'ছোট বিমানবন্দর',
  heliport: 'হেলিপোর্ট',
} as const;

/** ইতিমধ্যে ফরম্যাট করা সংখ্যার জন্য "১টি বিমানবন্দর" / "২টি বিমানবন্দর"। */
const pluralBn = (value: string, one: string, many: string) =>
  `${value} ${many}`;

/**
 * বাংলা ক্যাটালগ। চীনা উৎস (`Messages`) অনুসারে টাইপ করা, তাই অনুপস্থিত বা
 * পরিবর্তিত কোনো কী বিল্ড ব্যর্থ করবে।
 */
export const bn: Messages = {
  site: {
    name: 'World Airport Maps',
    nameLead: 'World Airport',
    nameAccent: 'Maps',
    tagline: 'বিমানবন্দর ও টার্মিনাল ম্যাপ',
    description:
      'দেশ ও অঞ্চল অনুসারে সাজানো বিমানবন্দর টার্মিনাল ম্যাপ দেখুন। বড় আন্তর্জাতিক হাব থেকে আঞ্চলিক বিমানবন্দর পর্যন্ত: গেট, চেক-ইন এলাকা, ব্যাগেজ ক্লেইম, দোকান, রেস্টুরেন্ট, লাউঞ্জ এবং শহরে যাতায়াতের বিস্তারিত নকশা দেখুন।',
    keywords: [
      'বিমানবন্দর ম্যাপ',
      'টার্মিনাল ম্যাপ',
      'বিমানবন্দর টার্মিনাল লেআউট',
      'গেট',
      'বিমানবন্দর পরিবহন',
      'বিমানবন্দর গাইড',
    ],
    numberOfItems: (n: number) =>
      pluralBn(String(n), 'বিমানবন্দর', 'বিমানবন্দর'),
  },

  nav: {
    home: 'হোম',
    airports: 'সব বিমানবন্দর',
    countries: 'দেশ অনুসারে',
    tools: 'অনলাইন টুল',
    about: 'আমাদের সম্পর্কে',
    label: 'প্রধান নেভিগেশন',
    languageLabel: 'ভাষা',
    switchLanguage: 'ভাষা পরিবর্তন',
    languagePlanned: 'প্রস্তুতিতে',
    languagePlannedHint: 'এই ভাষা সংস্করণ এখনও প্রকাশিত হয়নি।',
    themeToggle: 'ডার্ক মোড টগল করুন',
    menu: 'মেনু',
  },

  common: {
    advertisement: 'বিজ্ঞাপন',
    skipToContent: 'মূল কনটেন্টে যান',
    backToTop: 'উপরে ফিরুন',
    breadcrumbLabel: 'ব্রেডক্রাম্ব',
    home: 'হোম',
    viewMap: 'ম্যাপ দেখুন',
    terminalMap: 'টার্মিনাল ম্যাপ',
    latestAirportTitle: (
      year: number,
      name: string,
      iata: string,
      counts?: { terminals: number; gates: number }
    ) =>
      counts
        ? `${name} (${iata}): ${pluralBn(String(counts.terminals), 'টার্মিনাল', 'টার্মিনাল')}${
            counts.gates > 0 ? `, ${pluralBn(String(counts.gates), 'গেট', 'গেট')}` : ''
          } — টার্মিনাল ম্যাপ`
        : `${name} (${iata}) — অবস্থান ম্যাপ ও বিমানবন্দর গাইড ${year}`,
    airportHeading: (name: string, hasTerminals = true) =>
      hasTerminals ? `${name} টার্মিনাল ম্যাপ` : name,
    airportGuide: 'বিমানবন্দর গাইড',
    lastUpdated: 'সম্প্রতি হালনাগাদ',
    updatedOn: (date: string) => `${date}-এ হালনাগাদ`,
    publishedOn: (date: string) => `${date}-এ প্রকাশিত`,
    readMore: 'পুরো গাইড পড়ুন',
  },

  units: {
    terminalsFact: 'টার্মিনাল',
    gatesFact: 'গেট',
    terminals: (n: number) => pluralBn(String(n), 'টার্মিনাল', 'টার্মিনাল'),
    terminalsShort: (n: number) => pluralBn(String(n), 'টার্মিনাল', 'টার্মিনাল'),
    gates: (n: number) => pluralBn(String(n), 'গেট', 'গেট'),
    airports: (n: number) => pluralBn(String(n), 'বিমানবন্দর', 'বিমানবন্দর'),
    airportsChip: (n: number) => pluralBn(String(n), 'বিমানবন্দর', 'বিমানবন্দর'),
    pax: 'যাত্রী',
    paxFull: 'বার্ষিক যাত্রী',
    distance: 'শহরকেন্দ্র পর্যন্ত',
    distanceFrom: (city: string) => `${city}-এর কেন্দ্র থেকে`,
    gatesLabel: (range: string) => `গেট ${range}`,
    gatesCount: (n: number) => `${n} গেট`,
    satellite: 'স্যাটেলাইট টার্মিনাল',
    airlinesLabel: 'প্রধান এয়ারলাইনস: ',
  },

  search: {
    ariaLabel: 'বিমানবন্দর খুঁজুন',
    placeholder: 'বিমানবন্দর, শহর বা IATA কোড খুঁজুন',
    heroPlaceholder: 'বিমানবন্দরের নাম, শহর বা IATA কোড দিয়ে খুঁজুন — যেমন LHR / দুবাই / Heathrow',
    submit: 'বিমানবন্দর খুঁজুন',
    loading: 'খোঁজা হচ্ছে…',
    empty: 'কোনো মিলে যাওয়া বিমানবন্দর পাওয়া যায়নি',
    resultsTitle: (term: string) => `“${term}”-এর ফলাফল`,
    resultsCount: (n: number) =>
      `${pluralBn(String(n), 'মিলে যাওয়া বিমানবন্দর', 'মিলে যাওয়া বিমানবন্দর')} পাওয়া গেছে।`,
    noResults: 'কোনো বিমানবন্দর মেলেনি। অন্য শব্দ চেষ্টা করুন, যেমন শহরের নাম বা IATA কোড।',
    noResultsHint: 'আপনার বিমানবন্দর খুঁজে পাচ্ছেন না?',
    viewAll: (n: number) => `সব ${n} বিমানবন্দর দেখুন`,
    orBrowseByCountry: 'অথবা দেশ অনুসারে দেখুন',
    range: (from: number, to: number, total: number) =>
      `${total} বিমানবন্দরের মধ্যে ${from}–${to} দেখানো হচ্ছে`,
  },

  hero: {
    eyebrow: 'বিশ্ব বিমানবন্দর ডিরেক্টরি',
    titleLead: 'বিমানবন্দর ও',
    titleAccent: 'টার্মিনাল ম্যাপ দেখুন',
    sub: 'বিমানবন্দর ও টার্মিনাল ম্যাপের সম্পূর্ণ সংগ্রহ নিয়ে যেকোনো বিমানবন্দরে পথ খুঁজুন, দেশ ও অঞ্চল অনুসারে সাজানো — বড় আন্তর্জাতিক হাব থেকে আঞ্চলিক বিমানবন্দর পর্যন্ত।',
    stats: {
      countries: 'দেশ / অঞ্চল',
      airports: 'বিমানবন্দর',
      terminals: 'টার্মিনাল ম্যাপ',
    },
  },

  home: {
    intro: {
      ariaLabel: 'এই সাইট সম্পর্কে',
      imageAlt: 'সূর্যোদয়ের সময় কাচের সম্মুখভাগযুক্ত টার্মিনালের গেটে দাঁড়ানো যাত্রীবাহী বিমান',
      blocks: [
        {
          title: 'বিস্তারিত টার্মিনাল ম্যাপ দিয়ে যেকোনো বিমানবন্দরে পথ খুঁজুন',
          body: 'বিশ্বজুড়ে বিমানবন্দর ও টার্মিনালে পথ খোঁজা কঠিন হতে পারে। আমাদের বিস্তারিত ম্যাপ টার্মিনাল, গেট, চেক-ইন এলাকা, ব্যাগেজ ক্লেইম, দোকান, রেস্টুরেন্ট, লাউঞ্জ ও পরিবহন কেন্দ্রের লেআউট দেখায়, যাতে যাত্রার আগেই পথের পরিকল্পনা করতে পারেন।',
        },
        {
          title: 'ইন্টারঅ্যাকটিভ টার্মিনাল ম্যাপ ও ফ্লোর প্ল্যান',
          body: 'বড় আন্তর্জাতিক বিমানবন্দরে একাধিক টার্মিনাল ও জটিল লেআউট থাকে। আমাদের ম্যাপ গেট খুঁজে পেতে, সুবিধা চিহ্নিত করতে, সংযোগ পরিকল্পনা করতে এবং নিরাপত্তা তল্লাশি, প্রস্থান ও আগমন হল দিয়ে দক্ষভাবে যেতে সাহায্য করে — পিছনে ফিরতে না হয়েই।',
        },
        {
          title: 'বিমানবন্দর পরিবহন ও প্রবেশ',
          body: 'টার্মিনাল লেআউটের বাইরেও আমাদের গাইড পরিবহন বিকল্প, পার্কিং ও প্রবেশপথ কভার করে। আপনার গেটে পৌঁছানোর সেরা উপায়, টার্মিনালের মধ্যে বদল এবং ট্রেন, বাস, ট্যাক্সি ও ভাড়া গাড়িসহ ভূমি পরিবহন ব্যবহারের পথ খুঁজুন।',
        },
      ],
    },
    map: {
      kicker: 'বিশ্ব মানচিত্র',
      title: 'বিমানবন্দর ম্যাপ',
      en: 'বিমানবন্দর ম্যাপ',
      sub: (airports: string, world: string) =>
        `বিশ্বজুড়ে ${world} নির্ধারিত বিমানবন্দরের অবস্থান দেখুন — এর মধ্যে ${airports}টির এখানে টার্মিনাল ম্যাপ আছে। দেশ বা অঞ্চল ও বিবরণের জন্য যেকোনো বিন্দুতে ক্লিক করুন।`,
      all: 'সব',
      gEurope: 'ইউরোপ',
      gAsia: 'এশিয়া',
      gAmericas: 'আমেরিকা',
      gAfrica: 'আফ্রিকা',
      gOceania: 'ওশেনিয়া',
      legendSite: 'এখানে অন্তর্ভুক্ত · টার্মিনাল ম্যাপের জন্য ক্লিক করুন',
      legendWorld: 'বিশ্বজুড়ে অন্যান্য নির্ধারিত বিমানবন্দর',
      countTemplate: '{n} বিমানবন্দর দেখানো হচ্ছে',
      download: 'ডেটা ডাউনলোড',
      downloadTitle: 'বর্তমান ফিল্টারের সব বিমানবন্দর CSV-তে রপ্তানি করুন (IATA, নাম, শহর, দেশ, স্থানাঙ্ক)',
      openAirport: 'বিমানবন্দর দেখুন',
    },
    popular: {
      kicker: 'টার্মিনাল ম্যাপ',
      title: 'জনপ্রিয় বিমানবন্দর ম্যাপ',
      en: 'বিমানবন্দর ম্যাপ',
      sub: 'বিশ্বের বড় বিমানবন্দরের টার্মিনাল ম্যাপ কভারের একটি নির্বাচন — পুরো ম্যাপের জন্য বিমানবন্দর পৃষ্ঠা খুলুন।',
    },
    recent: {
      kicker: 'নতুন প্রকাশিত',
      title: 'সম্প্রতি হালনাগাদ',
      en: 'সম্প্রতি হালনাগাদ',
      sub: 'নতুন ও সংশোধিত বিমানবন্দর, দেশ এবং ভ্রমণ গাইড।',
      countriesTitle: 'সম্প্রতি হালনাগাদ করা দেশ',
    },
    routes: {
      kicker: 'রুট',
      title: 'সবচেয়ে ব্যস্ত বিমানবন্দর রুট ম্যাপ',
      en: 'রুট ম্যাপ',
      sub: 'কোনো স্থানে না থেমে যাওয়া গন্তব্যের সংখ্যা অনুসারে সাজানো বিমানবন্দর — রুট ম্যাপ, এয়ারলাইনস ও গন্তব্য তালিকার জন্য একটি খুলুন।',
      collection: 'রুট সংগ্রহ',
      tabsLabel: 'শহর অনুসারে রুট ম্যাপ',
      explore: (city: string) => `${city} দেখুন`,
      play: 'স্লাইডশো শুরু করুন',
      pause: 'স্লাইডশো থামান',
    },
    photos: {
      kicker: 'সর্বশেষ ছবি',
      title: 'সর্বশেষ বিমানবন্দর ছবি',
      en: 'সর্বশেষ ছবি',
      sub: 'সবচেয়ে সম্প্রতি যোগ করা বিমানবন্দর ছবি — ছয়টি নতুন বিমানবন্দর, প্রতিটির একটি ছবি।',
      ariaLabel: 'সর্বশেষ বিমানবন্দর ছবির ক্যারোসেল',
      prev: 'আগের ছবি',
      next: 'পরের ছবি',
      play: 'স্লাইডশো শুরু করুন',
      pause: 'স্লাইডশো থামান',
      counter: (index: number, total: number) => `ছবি ${index} / ${total}`,
      view: (name: string) => `${name}-এর ম্যাপ দেখুন`,
      open: 'বিমানবন্দর পৃষ্ঠা খুলুন',
    },
    countries: {
      kicker: 'দেশ অনুসারে',
      title: 'দেশ অনুসারে বিমানবন্দর ম্যাপ',
      en: 'দেশ',
      sub: 'দেশ ও অঞ্চল অনুসারে সাজানো টার্মিনাল ম্যাপ দেখুন, বড় আন্তর্জাতিক হাব থেকে আঞ্চলিক বিমানবন্দর পর্যন্ত।',
      more: 'সব দেশ',
    },
    all: {
      kicker: 'সব ম্যাপ',
      title: 'সব বিমানবন্দর ম্যাপ',
      en: 'সব বিমানবন্দর',
      sub: 'বিশ্বের সবচেয়ে ব্যস্ত বিমানবন্দর ও ভ্রমণ কেন্দ্রের ম্যাপ।',
      hint: 'টার্মিনাল লেআউট দেখতে যেকোনো বিমানবন্দর নির্বাচন করুন।',
      more: 'সব দেখুন',
    },
    facts: {
      kicker: 'ডিরেক্টরি ডেটা',
      title: 'এক নজরে বিমানবন্দর ডেটা',
      en: 'তালিকা ও সারণি',
      sub: 'ডিরেক্টরির পরিসংখ্যান তালিকা ও সারণিতে: কভারেজ, প্রকাশিত যাত্রী তথ্যসহ সবচেয়ে ব্যস্ত বিমানবন্দর এবং আঞ্চলিক বিভাজন।',
      note: (pax: string, detailed: string, total: string) =>
        `যাত্রী তথ্য ${total} বিমানবন্দরের মধ্যে ${pax}টি কভার করে; টার্মিনাল ও গেট তথ্য ${total}-এর মধ্যে ${detailed}টি কভার করে। টার্মিনাল গণনা ডিরেক্টরির নিজস্ব গ্রুপিং অনুসরণ করে এবং কনকোর্স অন্তর্ভুক্ত হতে পারে।`,
      coverageTitle: 'কভারেজ পরিসংখ্যান',
      coverage: {
        airports: 'বিমানবন্দর',
        countries: 'দেশ ও অঞ্চল',
        regions: 'ডিরেক্টরি অঞ্চল',
        cities: 'অদ্বিতীয় শহরের নাম',
        terminals: 'টার্মিনাল',
        gates: 'গেট',
        routes: 'রুট ম্যাপসহ বিমানবন্দর',
      },
      busiest: {
        title: 'বার্ষিক যাত্রী অনুসারে সবচেয়ে ব্যস্ত বিমানবন্দর',
        sub: 'প্রকাশিত বার্ষিক যাত্রী তথ্যসহ বারোটি সবচেয়ে ব্যস্ত বিমানবন্দর।',
        caption: 'প্রকাশিত বার্ষিক যাত্রী তথ্যসহ বিমানবন্দর, ক্রম অনুসারে',
        rank: 'ক্রম',
        iata: 'IATA',
        airport: 'বিমানবন্দর',
        city: 'শহর',
        country: 'দেশ',
        terminals: 'টার্মিনাল',
        gates: 'গেট',
        pax: 'বার্ষিক যাত্রী (মিলিয়ন)',
      },
      regions: {
        title: 'ডিরেক্টরি অঞ্চল অনুসারে বিমানবন্দর',
        sub: 'ডিরেক্টরির অঞ্চল লেবেল অনুসারে গোষ্ঠীভুক্ত বিমানবন্দর, টার্মিনাল ও গেট গণনা; কিছু দেশ ও অঞ্চল দুটি অঞ্চলে পড়ে।',
        caption: 'ডিরেক্টরি অঞ্চল অনুসারে বিমানবন্দর গণনা',
        region: 'অঞ্চল',
        airports: 'বিমানবন্দর',
        detailed: 'বিস্তারিত তথ্যসহ',
        terminals: 'টার্মিনাল',
        gates: 'গেট',
      },
    },
  },

  table: {
    iata: 'IATA',
    airport: 'বিমানবন্দর',
    city: 'শহর',
    country: 'দেশ',
    size: 'আকার',
    map: 'ম্যাপ',
    empty: 'এই ফিল্টারে কোনো বিমানবন্দর মেলে না। নির্বাচন বাড়ানোর চেষ্টা করুন।',
  },

  pager: {
    label: 'পেজিনেশন',
    previous: 'আগের পৃষ্ঠা',
    next: 'পরের পৃষ্ঠা',
  },

  filters: {
    searchPlaceholder: 'বিমানবন্দর, শহর বা IATA কোড খুঁজুন',
    submit: 'খুঁজুন',
    country: 'দেশ',
    all: 'সব',
    sort: 'সাজান',
    sortPax: 'যাত্রী',
    sortName: 'নাম',
    sortIata: 'IATA কোড',
    sortUpdated: 'সর্বশেষ হালনাগাদ',
    viewTitle: (country: string, sortLabel: string) =>
      country
        ? `${country}-এর সব বিমানবন্দর ম্যাপ${sortLabel ? ` — ${sortLabel} অনুসারে সাজানো` : ''}`
        : `সব বিমানবন্দর ম্যাপ — ${sortLabel} অনুসারে সাজানো`,
    viewDescription: (country: string, sortLabel: string) =>
      country
        ? `${country}-এর প্রতিটি বিমানবন্দর ম্যাপ এক পৃষ্ঠায়: টার্মিনাল লেআউট, গেট এলাকা ও ভূমি পরিবহন${sortLabel ? `, ${sortLabel} অনুসারে` : ''}।`
        : `পুরো বিমানবন্দর ম্যাপ ডিরেক্টরি এক পৃষ্ঠায়: টার্মিনাল লেআউট, গেট এলাকা ও ভূমি পরিবহন${sortLabel ? `, ${sortLabel} অনুসারে` : ''}।`,
  },

  countries: {
    title: 'দেশ অনুসারে বিমানবন্দর দেখুন',
    description:
      'দেশ ও অঞ্চল অনুসারে বিশ্ব বিমানবন্দর টার্মিনাল ম্যাপ ডিরেক্টরি দেখুন। বড় আন্তর্জাতিক হাব থেকে আঞ্চলিক বিমানবন্দর পর্যন্ত: দেখুন প্রতিটি দেশে কত বিমানবন্দর ও টার্মিনাল আছে।',
    sub: (countries: string, airports: string, terminals: string) =>
      `বড় আন্তর্জাতিক হাব থেকে আঞ্চলিক বিমানবন্দর পর্যন্ত — মোট ${countries} দেশ ও অঞ্চল, ${airports} বিমানবন্দর এবং ${terminals} টার্মিনাল।`,
    regionCount: (countries: number, airports: number) =>
      `${countries} দেশ · ${airports} বিমানবন্দর`,
  },

  country: {
    title: (name: string, count?: number) =>
      count ? `${name} বিমানবন্দর ম্যাপ — সব ${count} বিমানবন্দর` : `${name}-এর বিমানবন্দর ম্যাপ`,
    description: (name: string, nameEn: string, region: string, count: number, total?: number) =>
      total
        ? `${name}${nameEn !== name ? ` (${nameEn})` : ''}-এ ${total}টি নির্ধারিত বিমানবন্দর আছে; এর মধ্যে ${count}টির এখানে গাইড পৃষ্ঠা আছে, বিতরণ ম্যাপ, সম্পূর্ণ জাতীয় তালিকা ও সরাসরি রুটসহ।`
        : `${name} (${nameEn})-এ ${count} বিমানবন্দরের টার্মিনাল ম্যাপ, যা ${region}-এর প্রধান আন্তর্জাতিক হাব ও আঞ্চলিক বিমানবন্দর কভার করে। গেট, টার্মিনাল লেআউট ও ভূমি পরিবহন দেখুন।`,
    chip: (nameEn: string) => `${nameEn.toUpperCase()} বিমানবন্দর`,
    kicker: 'বিমানবন্দর ম্যাপ',
    titleOf: (name: string) => `${name}-এ বিমানবন্দর`,
    en: 'বিমানবন্দর',
    sub: 'টার্মিনাল লেআউট, গেট এলাকা ও পরিবহন বিকল্প দেখতে যেকোনো বিমানবন্দর নির্বাচন করুন।',
    empty: 'এই দেশ বা অঞ্চলের জন্য এখনও কোনো বিমানবন্দর তালিকাভুক্ত নেই।',
    moreKicker: 'অন্য দেশ',
    moreTitle: 'অন্য দেশ দেখুন',
    moreEn: 'আরও দেশ',
    all: 'সব দেশ',
    notFound: 'দেশ পাওয়া যায়নি',
    introKicker: 'সংক্ষিপ্ত বিবরণ',
    introTitle: (name: string) => `${name} বিমানবন্দর সংক্ষিপ্ত বিবরণ`,
    introEn: 'বিমানবন্দর সংক্ষিপ্ত বিবরণ',
    introSub:
      'এই দেশ বা অঞ্চলের বিমানবন্দরের পরিধি, প্রধান হাব এবং যে শহরগুলোতে তারা সেবা দেয়।',
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
      `${o.name}${o.nameEn ? ` (${o.nameEn})` : ''} ${o.region}-এ অবস্থিত। এই সাইট সেখানে ${o.airports}${
        o.terminals ? `, ${o.terminals}` : ''
      }${o.gates ? ` এবং ${o.gates}` : ''} কভার করে।` +
      (o.busiest
        ? ` বার্ষিক যাত্রী অনুসারে ${o.busiest} (${o.busiestIata}) সবচেয়ে বড়, ${o.busiestPax} সহ।`
        : '') +
      ` বিমানবন্দরগুলো ${o.cities}-এর মতো শহরে সেবা দেয়। ${o.mapsNote}`,
    introMapsNote:
      'প্রতিটি বিমানবন্দর পৃষ্ঠায় অবস্থান ম্যাপ ও বিমানবন্দর কোড থাকে, সাথে তার জন্য সংগৃহীত টার্মিনাল, গেট ও পরিবহন বিবরণ।',
    distribution: {
      kicker: 'বিতরণ',
      title: (name: string) => `${name} বিমানবন্দর বিতরণ ম্যাপ`,
      en: 'বিমানবন্দর বিতরণ',
      sub: (covered: string, total: string) =>
        `সারা দেশে ${total}টি নির্ধারিত বিমানবন্দর (বড়, মাঝারি ও ছোট); এর মধ্যে ${covered}টির এই সাইটে গাইড পৃষ্ঠা আছে। সম্পূর্ণ তালিকা নিচে।`,
      mapAlt: (name: string, total: string) =>
        `${name} বিমানবন্দর বিতরণ ম্যাপ: ${total} নির্ধারিত বিমানবন্দর`,
      siteTag: 'এখানে অন্তর্ভুক্ত',
      colAirport: 'বিমানবন্দর',
      colCity: 'শহর',
      colType: 'ধরন',
      types: {
        large: 'বড়',
        medium: 'মাঝারি',
        small: 'ছোট',
      },
      empty: 'জাতীয় বিমানবন্দর তালিকা এখনও পাওয়া যায়নি।',
    },
    linksTitle: 'সম্পর্কিত লিংক',
    linksEn: 'সম্পর্কিত লিংক',
    linksSub: 'দেশ এবং তার প্রতিটি বিমানবন্দরের জন্য অফিসিয়াল সাইট ও বিশ্বকোষ।',
    linksCountry: (name: string) => `${name} রেফারেন্স`,
    linksAirports: (name: string) => `${name}-এ বিমানবন্দর`,
    faqKicker: 'সাধারণ প্রশ্ন',
    faqTitle: 'প্রায়শই জিজ্ঞাসিত প্রশ্ন',
    faqEn: 'প্রশ্ন',
    faq: {
      airportTotal: (name: string) => `${name}-এ কত বিমানবন্দর আছে?`,
      airportTotalAnswer: (name: string, total: string, covered: string) =>
        `${name}-এ ${total}টি নির্ধারিত যাত্রীবাহী বিমানবন্দর আছে (বড়, মাঝারি ও ছোট); এই সাইট এর মধ্যে ${covered}টি বিস্তারিত কভার করে। উপরে বিতরণ ম্যাপ ও সম্পূর্ণ তালিকা দেখুন।`,
      airportCount: (name: string) => `${name}-এ কোন বিমানবন্দর কভার করা হয়েছে?`,
      airportCountAnswer: (name: string, count: string, list: string) =>
        `এই সাইট ${name}-এ ${count}টি কভার করে: ${list}।`,
      busiest: (name: string) => `${name}-এর সবচেয়ে ব্যস্ত বিমানবন্দর কোনটি?`,
      busiestAnswer: (busiest: string, iata: string, pax: string) =>
        `বার্ষিক যাত্রী অনুসারে ${busiest} (${iata}) এখানে কভার করা বিমানবন্দরগুলোর মধ্যে সবচেয়ে বড়, ${pax} সহ।`,
      terminals: (name: string) => `${name}-এর বিমানবন্দরগুলোতে কত টার্মিনাল আছে?`,
      terminalsAnswer: (name: string, terminals: string, gates: string, list: string) =>
        `${name}-এ কভার করা বিমানবন্দরগুলোতে ${terminals} আছে, মোট ${gates} সহ: ${list}।`,
      cities: (name: string) => `${name}-এর কোন শহরে বিমানবন্দর আছে?`,
      citiesAnswer: (name: string, cities: string) =>
        `এখানে কভার করা ${name}-এর বিমানবন্দরগুলো ${cities}-এর মতো শহরে সেবা দেয়। বিমানবন্দর ডিরেক্টরিতে শহর বা IATA কোড দিয়ে ফিল্টার করতে পারেন।`,
      maps: (name: string) => `${name}-এর বিমানবন্দরগুলোতে টার্মিনাল ম্যাপ আছে?`,
      mapsAnswer: (name: string, count: string) =>
        `কিছু আছে। বিমানবন্দর পৃষ্ঠায় অবস্থান ম্যাপ, বিমানবন্দর কোড ও সরাসরি রুট থাকে, এবং ${name}-এ কভার করা ${count}টি টার্মিনাল লেআউট, গেট এলাকা ও ভূমি পরিবহন দেখায় যেখানে এসব বিবরণ সংগৃহীত। কী আছে দেখতে যেকোনো বিমানবন্দর খুলুন।`,
    },
  },

  airport: {
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
        ? `${o.name} (${o.iata})-এ ${o.terminals} টার্মিনাল${o.gates ? ` ও ${o.gates} গেট` : ''}${
            o.pax ? `, বছরে ${o.pax} যাত্রী` : ''
          }${o.distance ? `, শহরকেন্দ্র থেকে ${o.distance}` : ''} আছে। সব টার্মিনাল, গেট এলাকা ও ভূমি পরিবহনসহ টার্মিনাল ম্যাপ।`
        : `${o.name} (${o.iata}) ${o.city}, ${o.country}-এ সেবা দেয়। অবস্থান ম্যাপ, বিমানবন্দর কোড ও ভ্রমণ তথ্য।`,
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
      const kind = o.kind ? AIRPORT_KIND[o.kind] : 'বিমানবন্দর';
      const head = `${o.name} (IATA: ${o.iata}${o.icao ? `, ICAO ${o.icao}` : ''}) ${where}-এ সেবা দেওয়া একটি ${kind}`;
      return o.terminals > 0
        ? `${head}, যেখানে ${o.terminals} টার্মিনাল${o.gates > 0 ? ` ও ${o.gates} গেট` : ''}${
            o.distance ? `, ${o.city}-এর কেন্দ্র থেকে প্রায় ${o.distance}` : ''
          } আছে।`
        : `${head}।`;
    },
    mapTitle: (iata: string) => `${iata} · টার্মিনাল লেআউট`,
    mapNote: 'টার্মিনাল লেআউট',
    realMapTitle: (iata: string) => `${iata} টার্মিনাল ম্যাপ — গেট ও নেভিগেশন`,
    mapAlt: (name: string, iata: string) =>
      `${name} (${iata})-এর টার্মিনাল ম্যাপ, সব টার্মিনাল, গেট এলাকা ও কনকোর্সসহ`,
    realMapNote: 'টার্মিনাল ম্যাপ',
    photosKicker: 'ছবি',
    photosTitle: 'বিমানবন্দরের ছবি',
    photosEn: 'বিমানবন্দরের ছবি',
    photosSub:
      'এই বিমানবন্দরের আসল ছবি, প্রতিটির সাথে যে প্রকাশ্য ওয়েব পৃষ্ঠা থেকে পাওয়া গেছে; কপিরাইট মূল আলোকচিত্রীদের কাছে থাকে। বড় করতে ছবিতে ক্লিক করুন, বা উৎস পৃষ্ঠা খুলতে ক্রেডিট লাইনে ক্লিক করুন।',
    photosCredit: (host: string) => `উৎস: ${host}`,
    photosAlt: (name: string, iata: string, index: number) =>
      `${name} (${iata})-এর বিমানবন্দর ছবি ${index}`,
    photosZoom: (name: string, index: number) => `${name}-এর ছবি ${index} বড় করুন`,
    zoomLabel: 'জুম',
    zoomClose: 'বন্ধ করুন',
    zoomIn: 'জুম ইন',
    zoomOut: 'জুম আউট',
    downloadKicker: 'ডাউনলোড',
    downloadTitle: 'বিমানবন্দর ম্যাপ ডাউনলোড',
    downloadEn: 'ডাউনলোড',
    downloadMapLabel: (year: number, iata: string) =>
      `${year} সালের সর্বশেষ ${iata} টার্মিনাল ম্যাপ ও ফ্লোর প্ল্যান ডাউনলোড`,
    downloadPdfLabel: (year: number, iata: string) =>
      `${year} সালের সর্বশেষ ${iata} টার্মিনাল ম্যাপ PDF ডাউনলোড`,
    timeKicker: 'সময়',
    timeTitle: (iata: string) => `বিমানবন্দর সময় তথ্য — ${iata}-এর বর্তমান সময়`,
    timeEn: 'বিমানবন্দর সময়',
    timeSub: (iata: string, tz: string) => `${iata} (${tz})-এর বর্তমান সময় আপনার স্থানীয় সময়ের তুলনায়।`,
    clockAirport: 'বিমানবন্দরের বর্তমান সময়',
    clockLocal: 'আপনার স্থানীয় সময়',
    infoKicker: 'তথ্য',
    infoTitle: 'বিমানবন্দর তথ্য ও বিবরণ',
    infoEn: 'বিমানবন্দর বিবরণ',
    infoIata: 'বিমানবন্দর IATA কোড',
    infoLocation: 'বিমানবন্দরের অবস্থান',
    infoCoords: 'স্থানাঙ্ক',
    infoTimezone: 'সময় অঞ্চল',
    linksKicker: 'লিংক',
    linksTitle: 'সম্পর্কিত লিংক',
    linksEn: 'সম্পর্কিত লিংক',
    linksSub: 'এই বিমানবন্দরের বাহ্যিক রেফারেন্স: অফিসিয়াল ওয়েবসাইট, উইকিপিডিয়া ও বাইদু বাইকে।',
    officialSite: 'অফিসিয়াল ওয়েবসাইট',
    wikiLabel: 'উইকিপিডিয়া',
    baikeLabel: 'বাইদু বাইকে',
    sourcesLabel: 'উৎস: ',
    sourcesWikipedia: 'উইকিপিডিয়া',
    sourcesOurAirports: 'OurAirports খোলা ডেটা',
    sourcesNote:
      'বিমানবন্দর কোড, স্থানাঙ্ক ও বিমানবন্দর শ্রেণি খোলা ডেটা থেকে সংকলিত; পৃষ্ঠার বিবরণ প্রতিটি বিমানবন্দরের অফিসিয়াল প্রকাশনা অনুসরণ করে।',
    mapEmbedKicker: 'ম্যাপ',
    mapEmbedTitle: (name: string) => `ইন্টারঅ্যাকটিভ ম্যাপ — ${name}-এর অবস্থান`,
    mapEmbedEn: 'ইন্টারঅ্যাকটিভ ম্যাপ',
    extMapsNote: 'এই বিমানবন্দর অন্য ম্যাপ সেবায় দেখুন:',
    routeMapKicker: 'রুট',
    routeMapTitle: (name: string) => `${name} রুট ম্যাপ — সরাসরি গন্তব্য`,
    routeMapEn: 'রুট ম্যাপ',
    routeMapAria: (name: string) => `${name} থেকে সরাসরি রুটের ম্যাপ`,
    routeLegendTitle: 'রঙের চাবি',
    routeLegendClose: 'চাবি লুকান',
    routeReset: 'ম্যাপ রিসেট',
    routeZoomIn: 'জুম ইন',
    routeZoomOut: 'জুম আউট',
    routeFullscreen: 'পূর্ণ স্ক্রিন',
    routeExitFullscreen: 'পূর্ণ স্ক্রিন থেকে বেরুন',
    routeOpenAirport: `{iata} বিমানবন্দর পৃষ্ঠা খুলুন`,
    routeTiers: {
      trunk: '৬+ এয়ারলাইন',
      major: '৩–৫ এয়ারলাইন',
      minor: '২ এয়ারলাইন',
      single: '১ এয়ারলাইন',
    },
    routeCarriersTpl: '{n} এয়ারলাইন',
    routeTableDest: 'গন্তব্য',
    routeTableCountry: 'দেশ/অঞ্চল',
    routeTableDistance: 'দূরত্ব',
    routeTableCarriers: 'এয়ারলাইন',
    routeCarriersMore: (n: number) => ` +${n} আরও`,
    routeMapNote: (date: string) =>
      `রুট ডেটা স্ন্যাপশট: ${date}; শুধু সরাসরি ফ্লাইট। উৎস: `,
    legendTerminal: 'টার্মিনাল ভবন',
    legendTransit: 'ভূমি পরিবহন কেন্দ্র',
    legendCorridor: 'টার্মিনালের মধ্যে সংযোগ',
    terminalsKicker: 'টার্মিনাল',
    terminalsTitle: 'টার্মিনাল গাইড',
    terminalsEn: 'টার্মিনাল গাইড',
    terminalsSub: (name: string) =>
      `${name}-এ প্রতিটি টার্মিনালের গেট এলাকা, প্রধান এয়ারলাইন ও সুবিধা।`,
    transitTitle: 'ভূমি পরিবহন',
    facilitiesTitle: 'বিমানবন্দর সুবিধা',
    faqKicker: 'সাধারণ প্রশ্ন',
    faqTitle: 'প্রায়শই জিজ্ঞাসিত প্রশ্ন',
    faqEn: 'প্রশ্ন',
    guideKicker: 'গাইড',
    guideTitle: 'বিমানবন্দর গাইড',
    guideEn: 'বিমানবন্দর গাইড',
    blogKicker: 'নিবন্ধ',
    blogTitle: (iata: string) => `${iata} বিমানবন্দর গাইড`,
    blogEn: 'ব্লগ থেকে',
    blogSub: (iata: string, count: number) =>
      `এই সাইটের ${count}টি নিবন্ধ ${iata} কভার করে: আগমন, ভূমি পরিবহন, ব্যাগেজ ও সংযোগ।`,
    blogAll: 'সব নিবন্ধ',
    relatedTitle: (country: string) => `${country}-এ অন্যান্য বিমানবন্দর`,
    relatedEn: (country: string) => `${country}-এ আরও`,
    relatedAll: (country: string) => `${country}-এ সব বিমানবন্দর`,
    flights: {
      kicker: 'ফ্লাইট',
      title: (name: string) => `${name}-এর ফ্লাইট — প্রস্থান ও আগমন`,
      en: 'ফ্লাইট বোর্ড',
      sub: (flights: string, airlines: string, destinations: string) =>
        `${flights} ফ্লাইট নম্বর, ${airlines} এয়ারলাইন ও ${destinations} গন্তব্যে, দিক অনুসারে বিভক্ত। কোডশেয়ার নম্বর অন্তর্ভুক্ত।`,
      statDepartures: 'প্রস্থান ফ্লাইট নম্বর',
      statArrivals: 'আগমন ফ্লাইট নম্বর',
      statAirlines: 'এয়ারলাইন',
      statDestinations: 'গন্তব্য',
      note: (date: string) =>
        `aviability.com ফ্লাইট ইনডেক্স থেকে ফ্লাইট নম্বর ও রুট (স্ন্যাপশট ${date}); কোডশেয়ার নম্বর অন্তর্ভুক্ত এবং প্রস্থানের সময় দেখানো হয় না। উৎস: `,
      source: 'aviability.com',
      tabDepartures: 'প্রস্থান',
      tabArrivals: 'আগমন',
      search: 'ফ্লাইট নম্বর, এয়ারলাইন বা শহর খুঁজুন',
      clearSearch: 'অনুসন্ধান মুছুন',
      flight: 'ফ্লাইট',
      airline: 'এয়ারলাইন',
      destination: 'গন্তব্য',
      origin: 'উৎস',
      country: 'দেশ/অঞ্চল',
      empty: 'এই অনুসন্ধানে কোনো ফ্লাইট মেলে না।',
      loading: 'ফ্লাইট লোড হচ্ছে…',
      error: 'আরও ফ্লাইট লোড করা যায়নি।',
      retry: 'আবার চেষ্টা করুন',
      previous: 'আগের',
      next: 'পরের',
      pagination: 'পেজিনেশন',
      showing: '{from}–{to} / {total} ফ্লাইট নম্বর দেখানো হচ্ছে',
      pageOf: 'পৃষ্ঠা {page} / {pages}',
    },
    notFound: 'বিমানবন্দর পাওয়া যায়নি',
  },

  route: {
    metaTitle: (year: number, name: string, iata: string, count: string) =>
      `${name} (${iata})-এর সর্বশেষ রুট ম্যাপ ${year} — ${count} সরাসরি গন্তব্য`,
    metaDescription: (name: string, iata: string, count: string) =>
      `${name} (${iata})-এর সরাসরি রুটের ম্যাপ: ${count} গন্তব্য, এয়ারলাইন ও দূরত্বসহ, সাথে সম্পূর্ণ গন্তব্য তালিকা।`,
    heading: (name: string) => `${name} রুট ম্যাপ`,
    headingSub: (iata: string, count: string) =>
      `${iata}-এ ${count}টি সরাসরি গন্তব্য আছে, প্রতিটিতে সেবা দেওয়া এয়ারলাইনের সংখ্যা অনুসারে রঙিন।`,
    backToAirport: (iata: string) => `${iata} বিমানবন্দর পৃষ্ঠায় ফিরুন`,
    flightNumbers: (iata: string) => `${iata} ফ্লাইট নম্বর`,
    openFull: 'রুট ম্যাপ দেখুন',
    previewCta: (iata: string) => `পুরো ${iata} রুট ম্যাপ দেখুন`,
    teaserSub: (count: string) => `${count} সরাসরি গন্তব্য: ম্যাপ, এয়ারলাইন ও দূরত্ব।`,
    mapSectionTitle: (name: string) => `${name} সরাসরি রুটের ম্যাপ`,
    tableKicker: (iata: string) => `${iata} · গন্তব্য`,
    tableSectionTitle: (name: string) => `${name} সরাসরি গন্তব্যের তালিকা`,
    tableSectionEn: (iata: string) => `${iata} গন্তব্য`,
    tableToc: 'গন্তব্য',
    tableSectionSub: (count: string) =>
      `${count} গন্তব্য, এয়ারলাইনের সংখ্যা অনুসারে সবচেয়ে ব্যস্ত প্রথমে, দূরত্ব ও বাহকসহ।`,
    dataKicker: 'ডাউনলোড',
    dataTitle: 'রুট ডেটা ডাউনলোড',
    dataEn: 'ডেটা',
    dataSub: (count: number) =>
      `${count} সরাসরি রুট, গন্তব্য, IATA কোড, শহর, দেশ, দূরত্ব ও এয়ারলাইনসহ — স্প্রেডশিট বা স্ক্রিপ্টের জন্য প্রস্তুত।`,
    dataFields: 'CSV Excel / Numbers-এর জন্য, JSON কোডের জন্য; দুটোই UTF-8।',
    dataCsv: 'CSV ডাউনলোড',
    dataJson: 'JSON ডাউনলোড',
    airportMapSub:
      'এক নজরে টার্মিনাল ও গেট লেআউট — পুরো ম্যাপ, টার্মিনাল সুবিধা ও বিমানবন্দর পৃষ্ঠায় ভূমি পরিবহন দেখতে ছবিতে ক্লিক করুন।',
    airportMapCta: (iata: string) => `পুরো ${iata} টার্মিনাল ম্যাপ দেখুন`,
    factDestinations: 'সরাসরি গন্তব্য',
    factAirlines: 'এয়ারলাইন',
    factCountries: 'দেশ',
    factSnapshot: 'ডেটা স্ন্যাপশট',
    faqCountQ: (name: string) => `${name} না থেমে কত জায়গায় উড়ে?`,
    faqCountA: (name: string, iata: string, count: string, countries: string) =>
      `${name} (${iata})-এ ${countries} দেশ ও অঞ্চলে ${count}টি সরাসরি গন্তব্য আছে। শুধু সরাসরি ফ্লাইট গণনা করা হয়; স্টপসহ ভ্রমণ নয়।`,
    faqAirlinesQ: (name: string) => `${name} থেকে কত এয়ারলাইন উড়ে?`,
    faqAirlinesA: (count: string, leaders: string) =>
      `${count} এয়ারলাইন এই বিমানবন্দর থেকে সরাসরি রুট পরিচালনা করে। সবচেয়ে বড় নেটওয়ার্ক ${leaders}-এর (বন্ধনীতে গন্তব্য সংখ্যা)।`,
    faqFarthestQ: (name: string) => `${name} থেকে সবচেয়ে দূরের সরাসরি গন্তব্য কোনটি?`,
    faqFarthestA: (city: string, country: string, iata: string, km: string) =>
      `সবচেয়ে দূরের সরাসরি গন্তব্য ${city}, ${country} ${iata}, প্রায় ${km} কিমি দূরে।`,
    faqBusiestQ: () => 'কোন গন্তব্যে সবচেয়ে বেশি প্রতিযোগিতা?',
    faqBusiestA: (count: string, list: string) =>
      `${count} গন্তব্যে তিন বা তার বেশি এয়ারলাইন সেবা দেয়; সবচেয়ে ব্যস্ত ${list}।`,
    faqSourceQ: () => 'রুট ডেটা কত ঘন ঘন হালনাগাদ হয়?',
    faqSourceA: (date: string, source: string, license: string) =>
      `এই পৃষ্ঠার রুট ${source}-এর খোলা ডেটাসেট (${license}) থেকে, যা ${date}-এর স্ন্যাপশট, লাইভ সময়সূচি নয় — টিকিট ও সময় এয়ারলাইন বা বিমানবন্দর থেকে যাচাই করুন।`,
  },

  flight: {
    metaTitle: (number: string, airline: string, from: string, to: string) =>
      `${number} ${airline} ফ্লাইট — ${from} থেকে ${to}`,
    metaDescription: (number: string, airline: string, from: string, to: string, distance: string) =>
      `ফ্লাইট ${number} হলো ${airline} দ্বারা ${from} থেকে ${to} পর্যন্ত ব্যবহৃত ফ্লাইট নম্বর${distance ? `, প্রায় ${distance}` : ''}। রুট ম্যাপ, প্রস্থান ও আগমন বিমানবন্দর, দূরত্ব এবং রুটের অন্যান্য ফ্লাইট।`,
    heading: (number: string) => `ফ্লাইট ${number}`,
    subtitle: (airline: string, from: string, to: string) => `${airline} · ${from} → ${to}`,
    lead: (number: string, airline: string, from: string, to: string, distance: string) =>
      `ফ্লাইট ${number} হলো ${airline} দ্বারা ${from} ও ${to}-এর মধ্যে ব্যবহৃত ফ্লাইট নম্বর${distance ? `, প্রায় ${distance} সরাসরি দূরত্ব` : ''}।`,
    factFlight: 'ফ্লাইট নম্বর',
    factFrom: 'থেকে',
    factTo: 'পর্যন্ত',
    factDistance: 'দূরত্ব',
    overviewKicker: 'সংক্ষিপ্ত বিবরণ',
    overviewTitle: (number: string) => `ফ্লাইট ${number} সম্পর্কে`,
    overviewBody: (
      number: string,
      airline: string,
      originName: string,
      originIata: string,
      destName: string,
      destIata: string,
      distance: string
    ) =>
      `${number} হলো ${airline} দ্বারা ${originName} (${originIata}) ও ${destName} (${destIata})-এর মধ্যে ব্যবহৃত ফ্লাইট নম্বর${distance ? `, প্রায় ${distance} দূরে` : ''}। এই পৃষ্ঠা দ্রুত খোঁজের জন্য ফ্লাইট নম্বর, এয়ারলাইন, রুট ও দুটি বিমানবন্দর একত্র করে।`,
    overviewNote:
      'ফ্লাইট ইনডেক্সে প্রস্থান বা আগমনের সময়, বিমানের ধরন বা পরিচালনার তারিখ অন্তর্ভুক্ত নেই; সময়সূচি, চেক-ইন ও বোর্ডিং সময় এয়ারলাইন বা বিমানবন্দর থেকে নিশ্চিত করুন।',
    routeKicker: 'রুট',
    routeTitle: (from: string, to: string) => `${from} → ${to} রুট`,
    routeDiagramAria: (number: string) => `ফ্লাইট ${number}-এর রুট চিত্র`,
    routeMapAria: (number: string) => `ফ্লাইট ${number}-এর রুট ম্যাপ`,
    airportsKicker: 'বিমানবন্দর',
    airportsTitle: 'প্রস্থান ও আগমন বিমানবন্দর',
    airportsSub:
      'যে বিমানবন্দরগুলোকে এই ফ্লাইট সংযুক্ত করে। ডিরেক্টরিতে থাকা বিমানবন্দর নিজের পৃষ্ঠা খোলে।',
    originAirport: 'প্রস্থান বিমানবন্দর',
    destinationAirport: 'আগমন বিমানবন্দর',
    airportPage: 'বিমানবন্দর পৃষ্ঠা খুলুন',
    detailsKicker: 'বিবরণ',
    detailsTitle: 'ফ্লাইট বিবরণ',
    detailsFlight: 'ফ্লাইট নম্বর',
    detailsAirline: 'এয়ারলাইন',
    detailsOrigin: 'প্রস্থান বিমানবন্দর',
    detailsDestination: 'আগমন বিমানবন্দর',
    detailsDistance: 'সরাসরি দূরত্ব',
    detailsRoutes: 'তালিকাভুক্ত রুট',
    detailsSnapshot: 'ডেটা স্ন্যাপশট',
    routesKicker: 'রুট',
    routesTitle: 'এই ফ্লাইট নম্বরের রুট',
    routesSub: (count: string) =>
      `এই নম্বরটি ${count} রুটে দেখা যায়; একটি নম্বর কোডশেয়ার অংশীদার পুনরায় ব্যবহার করতে পারে।`,
    routesRoute: 'রুট',
    routesAirline: 'এয়ারলাইন',
    routesDistance: 'দূরত্ব',
    relatedKicker: 'সম্পর্কিত',
    relatedTitle: 'এই রুটের অন্যান্য ফ্লাইট',
    relatedSub: 'একই প্রস্থান ও আগমন বিমানবন্দরের মধ্যে অন্যান্য ফ্লাইট নম্বর।',
    relatedEn: 'আরও ফ্লাইট',
    faqKicker: 'সাধারণ প্রশ্ন',
    faqTitle: 'প্রায়শই জিজ্ঞাসিত প্রশ্ন',
    faqEn: 'প্রশ্ন',
    faqWhat: (number: string) => `ফ্লাইট ${number} কী?`,
    faqWhatAnswer: (number: string, airline: string, from: string, to: string, distance: string) =>
      `ফ্লাইট ${number} হলো ${airline} দ্বারা ${from} → ${to} রুটে ব্যবহৃত ফ্লাইট নম্বর${distance ? `, প্রায় ${distance} দূরে` : ''}।`,
    faqRoute: (number: string) => `ফ্লাইট ${number} কোথায় উড়ে?`,
    faqRouteAnswer: (
      number: string,
      originName: string,
      originIata: string,
      destName: string,
      destIata: string
    ) =>
      `ফ্লাইট ${number} ${originName} (${originIata}) থেকে ${destName} (${destIata}) পর্যন্ত উড়ে।`,
    faqTimes: (number: string) => `${number}-এর প্রস্থান ও আগমনের সময় কোথায়?`,
    faqTimesAnswer: (number: string) =>
      `এই পৃষ্ঠা ${number}-এর ফ্লাইট নম্বর, এয়ারলাইন, রুট ও বিমানবন্দর কভার করে। aviability.com ফ্লাইট ইনডেক্সে প্রস্থান বা আগমনের সময় নেই — বর্তমান সময়সূচি এয়ারলাইন বা বিমানবন্দর থেকে যাচাই করুন।`,
    note: (date: string) =>
      `aviability.com ফ্লাইট ইনডেক্স থেকে ফ্লাইট নম্বর, এয়ারলাইন ও রুট (স্ন্যাপশট ${date}); প্রস্থান ও আগমনের সময় অন্তর্ভুক্ত নয়। উৎস: `,
    source: 'aviability.com',
    sourceFlight: 'aviability.com-এ দেখুন',
    viewAirport: (iata: string) => `${iata} বিমানবন্দর পৃষ্ঠা খুলুন`,
    notFound: 'ফ্লাইট পাওয়া যায়নি',
  },

  faq: {
    terminalCount: (name: string) => `${name}-এ কত টার্মিনাল আছে?`,
    terminalCountAnswer: (name: string, iata: string, terminals: string, gates: string, list: string) =>
      `${name} (${iata})-এ ${terminals} টার্মিনাল আছে, মোট ${gates} গেটসহ: ${list}।`,
    gateCount: (name: string) => `${name}-এ কত গেট আছে?`,
    gateCountAnswer: (name: string, iata: string, gates: string, list: string) =>
      `${name} (${iata})-এ মোট ${gates} গেট আছে: ${list}।`,
    whereIs: (iata: string) => `${iata} কোথায়?`,
    whereIsAnswer: (iata: string, name: string, nameEn: string, city: string, cityEn: string, country: string) =>
      `${iata} হলো ${name} (${nameEn})-এর IATA কোড, যা ${city}${
        cityEn ? ` (${cityEn})` : ''
      }, ${country}-এ অবস্থিত।`,
    distance: (name: string, city: string) => `${name} ${city}-এর কেন্দ্র থেকে কত দূরে?`,
    distanceAnswer: (name: string, city: string, distance: string, transit: string) =>
      `${name} ${city}-এর কেন্দ্র থেকে প্রায় ${distance} দূরে। আপনি ${transit} দিয়ে শহরে পৌঁছাতে পারেন।`,
    access: (name: string, city: string) => `${name} থেকে ${city} কীভাবে যাব?`,
    accessAnswer: (options: string) => `${options}।`,
    facilities: (name: string) => `${name}-এ কী কী সুবিধা আছে?`,
    facilitiesAnswer: (name: string, facilities: string) =>
      `${name}-এ ${facilities} আছে। টার্মিনালের মধ্যে বিতরণের জন্য উপরে টার্মিনাল লেআউট দেখুন।`,
    location: (name: string) => `${name} কোথায় অবস্থিত?`,
    locationAnswer: (name: string, nameEn: string, iata: string, city: string, cityEn: string, country: string) =>
      `${name} (${nameEn}, IATA কোড ${iata}) ${city}${
        cityEn ? ` (${cityEn})` : ''
      }, ${country}-এ অবস্থিত।`,
    airlines: (name: string) => `${name}-এ প্রতিটি টার্মিনাল থেকে কোন এয়ারলাইন পরিচালিত হয়?`,
    airlinesAnswer: (name: string, list: string) =>
      `${name}-এ টার্মিনাল অনুসারে প্রধান এয়ারলাইন: ${list}। এয়ারলাইন ও গেট বরাদ্দ বদলায়, তাই সবসময় আপনার বোর্ডিং পাস ও বিমানবন্দরের সাইনবোর্ড দেখুন।`,
    timezone: (name: string) => `${name} কোন সময় অঞ্চলে?`,
    timezoneAnswer: (name: string, iata: string, tz: string) =>
      `${name} (${iata}) ${tz} সময় অঞ্চলে। উপরের বিমানবন্দর ঘড়ি দিয়ে আপনার স্থানীয় সময়ের সাথে তুলনা করুন।`,
    flightsCount: (name: string) => `${name}-এর জন্য কত ফ্লাইট নম্বর তালিকাভুক্ত?`,
    flightsCountAnswer: (
      name: string,
      iata: string,
      departures: string,
      arrivals: string,
      airlines: string,
      destinations: string,
      date: string
    ) =>
      `aviability.com ফ্লাইট ইনডেক্স ${name} (${iata})-এর জন্য ${departures} প্রস্থান ফ্লাইট নম্বর ও ${arrivals} আগমন ফ্লাইট নম্বর তালিকাভুক্ত করে, যা ${airlines} এয়ারলাইন ও ${destinations} গন্তব্য (স্ন্যাপশট ${date}) কভার করে। কোডশেয়ার নম্বর অন্তর্ভুক্ত এবং সময়সূচি বদলাতে পারে — যাত্রার আগে এয়ারলাইন থেকে নিশ্চিত করুন।`,
  },

  editorial: {
    authorName: 'World Airport Maps সম্পাদকীয় দল',
    role: 'সংকলিত ও পর্যালোচিত ',
    sourcesNote: 'প্রকাশ্য উৎস ও অফিসিয়াল বিমানবন্দর তথ্য থেকে সংকলিত',
  },

  toc: {
    label: 'এই পৃষ্ঠায়',
    map: 'টার্মিনাল ম্যাপ',
    photos: 'বিমানবন্দরের ছবি',
    time: 'বিমানবন্দর সময়',
    details: 'বিমানবন্দর বিবরণ',
    links: 'সম্পর্কিত লিংক',
    location: 'অবস্থান ম্যাপ',
    routes: 'রুট ম্যাপ',
    flights: 'ফ্লাইট',
    guide: 'বিমানবন্দর গাইড',
    blog: 'সম্পর্কিত গাইড',
    terminals: 'টার্মিনাল গাইড',
    transport: 'ভূমি পরিবহন',
    facilities: 'সুবিধা',
    faq: 'সাধারণ প্রশ্ন',
    flightOverview: 'ফ্লাইট সংক্ষিপ্ত বিবরণ',
    flightRoute: 'রুট',
    flightAirports: 'বিমানবন্দর',
    flightDetails: 'ফ্লাইট বিবরণ',
    flightRoutes: 'সব রুট',
    flightRelated: 'সম্পর্কিত ফ্লাইট',
    intro: 'বিমানবন্দর সংক্ষিপ্ত বিবরণ',
    distribution: 'বিমানবন্দর বিতরণ',
    airports: 'বিমানবন্দর তালিকা',
  },

  error: {
    title: 'এই পৃষ্ঠা লোড করা যায়নি',
    sub: 'বিমানবন্দর ডেটা পড়তে গিয়ে কিছু ভুল হয়েছে। আবার চেষ্টা করুন বা হোমপেজে ফিরুন।',
    retry: 'আবার চেষ্টা করুন',
    backHome: 'হোমপেজে ফিরুন',
    notFoundTitle: '404 · পৃষ্ঠা পাওয়া যায়নি',
    notFoundSub: 'অনুরোধ করা পৃষ্ঠা সরানো বা মুছে ফেলা হতে পারে। বিমানবন্দর খুঁজুন বা নিচের লিংক থেকে এগিয়ে যান।',
  },

  footer: {
    sponsored: 'স্পনসর্ড',
    mapsTitle: 'বিস্তারিত টার্মিনাল ম্যাপ',
    mapsBody:
      'বিমানবন্দর ও তাদের টার্মিনালে পথ খোঁজা কঠিন হতে পারে। আমাদের ম্যাপ টার্মিনাল, গেট, চেক-ইন এলাকা, ব্যাগেজ ক্লেইম, দোকান, রেস্টুরেন্ট, লাউঞ্জ ও পরিবহন কেন্দ্রের বিস্তারিত লেআউট দেখায়, যাতে যাত্রা মসৃণ হয়।',
    plansTitle: 'ইন্টারঅ্যাকটিভ টার্মিনাল প্ল্যান',
    plansBody:
      'বড় আন্তর্জাতিক বিমানবন্দরে একাধিক টার্মিনাল ও জটিল লেআউট থাকে। আমাদের ম্যাপ গেট খুঁজতে, সুবিধা চিহ্নিত করতে, সংযোগ পরিকল্পনা করতে এবং নিরাপত্তা, প্রস্থান ও আগমন দিয়ে দক্ষভাবে যেতে সাহায্য করে।',
    transitTitle: 'বিমানবন্দর পরিবহন ও প্রবেশ',
    transitBody:
      'টার্মিনাল লেআউটের বাইরে আমরা পরিবহন বিকল্প, পার্কিং ও প্রবেশপথ কভার করি — আপনার গেটে কীভাবে পৌঁছাবেন, টার্মিনালের মধ্যে কীভাবে বদলাবেন এবং ট্রেন, বাস, ট্যাক্সি ও ভাড়া গাড়ি কীভাবে ব্যবহার করবেন।',
    stats: (countries: string, airports: string, terminals: string) =>
      `${countries} দেশ / অঞ্চল · ${airports} বিমানবন্দর · ${terminals} টার্মিনাল · চিত্রিত টার্মিনাল লেআউট`,
    fallback: 'বিশ্বজুড়ে বিমানবন্দরের চিত্রিত টার্মিনাল লেআউট ও পরিবহন গাইড',
    linksLabel: 'ফুটার নেভিগেশন',
    about: 'আমাদের সম্পর্কে',
    contact: 'যোগাযোগ',
    sources: 'ডেটা উৎস',
    privacy: 'গোপনীয়তা নীতি',
    disclaimer: 'দাবিত্যাগ',
    terms: 'ব্যবহারের শর্তাবলি',
  },

  transportModes: bnTransportModes as Record<string, string>,

  categories: {
    kicker: 'ব্রাউজ',
    title: 'এলাকা অনুসারে ব্রাউজ করুন',
    en: 'এলাকা অনুসারে ব্রাউজ করুন',
    sub: 'যেকোনো দিক থেকে ডিরেক্টরিতে প্রবেশ করুন: দেশ, অঞ্চল, শহর অনুসারে — অথবা সরাসরি সবচেয়ে ব্যস্ত হাব, সর্বশেষ হালনাগাদ ও বিমানবন্দর গাইডে যান।',
    allAirports: {
      title: 'সব বিমানবন্দর',
      body: 'সম্পূর্ণ ডিরেক্টরি, যাত্রী পরিমাণ অনুসারে সাজানো, দেশ দিয়ে ফিল্টারযোগ্য ও পুনরায় সাজানোযোগ্য।',
    },
    byCountry: {
      title: 'দেশ অনুসারে',
      body: 'দেখুন প্রতিটি দেশ বা অঞ্চলে কত বিমানবন্দর, টার্মিনাল ও গেট আছে।',
    },
    byRegion: {
      title: 'অঞ্চল অনুসারে',
      body: 'পূর্ব এশিয়া, ইউরোপ, উত্তর আমেরিকা ও বাকি অংশে গোষ্ঠীভুক্ত দেশ।',
    },
    popularCities: {
      title: 'জনপ্রিয় শহর',
      body: 'মোট বার্ষিক যাত্রী অনুসারে সবচেয়ে ব্যস্ত বিমানবন্দর শহর, এবং প্রতিটিতে সব বিমানবন্দর।',
    },
    recentlyUpdated: {
      title: 'সম্প্রতি হালনাগাদ',
      body: 'নতুন যোগ করা ও সংশোধিত বিমানবন্দর রেকর্ড, সবচেয়ে নতুন প্রথমে।',
    },
    guides: {
      title: 'বিমানবন্দর গাইড',
      body: 'টার্মিনাল ট্রান্সফার, শহরে পৌঁছানো ও ব্যবহারিক টিপস নিয়ে বিস্তারিত গাইড।',
    },
    routes: {
      title: 'রুট ম্যাপ',
      body: 'গন্তব্যের সংখ্যা অনুসারে সাজানো, এয়ারলাইন ও দূরত্বসহ একটি বিমানবন্দরের সরাসরি নেটওয়ার্ক দেখুন।',
    },
  },

  guides: {
    kicker: 'গাইড',
    title: 'বিমানবন্দর গাইড',
    en: 'বিমানবন্দর গাইড',
    sub: 'টার্মিনাল চিত্রের বাইরে, নির্বাচিত হাবের জন্য আমরা বিস্তারিত গাইড লিখেছি: গেট নম্বরিং কীভাবে পড়বেন, টার্মিনালের মধ্যে কীভাবে যাবেন এবং শহরে কীভাবে পৌঁছাবেন।',
    more: 'এই বিমানবন্দর দেখুন',
  },

  blog: {
    kicker: 'জার্নাল',
    title: 'ভ্রমণ নোট',
    nav: 'ব্লগ',
    en: 'ভ্রমণ নোট',
    sub: 'আমাদের সম্পাদকীয় ডেস্ক থেকে বিস্তারিত নোট: আগমন ও ইমিগ্রেশন, ট্রান্সফার, টার্মিনাল সুবিধা এবং বিশ্রামের জায়গা।',
    more: 'পড়ুন',
    all: 'সব নিবন্ধ',
    morePosts: 'আরও নিবন্ধ',
    airportsKicker: 'বিমানবন্দর',
    airportsTitle: 'এই নিবন্ধে বিমানবন্দর',
    airportsEn: 'কভার করা বিমানবন্দর',
    airportsSub: 'টার্মিনাল ম্যাপ, ভূমি পরিবহন ও সাধারণ প্রশ্নের জন্য বিমানবন্দর পৃষ্ঠা খুলুন।',
    back: 'নিবন্ধ তালিকায় ফিরুন',
    empty: 'এখনও কোনো নিবন্ধ নেই।',
    readingMinutes: (n: number) => `${n} মিনিট পড়া`,
    source: (name: string) => `উৎস: ${name}`,
    tags: 'ট্যাগ',
  },

  comments: {
    kicker: 'মন্তব্য',
    title: 'পাঠকের মন্তব্য',
    en: 'আলোচনা',
    sub: 'প্রশ্ন, ভ্রমণ প্রতিবেদন ও সংশোধন সবই স্বাগত। মন্তব্য সর্বজনীন।',
    formTitle: 'মন্তব্য করুন',
    countOne: '১টি মন্তব্য',
    countMany: '{n} মন্তব্য',
    empty: 'এখনও কোনো মন্তব্য নেই — প্রথমটি লিখুন।',
    loading: 'মন্তব্য লোড হচ্ছে…',
    loadError: 'মন্তব্য এখন উপলব্ধ নয়।',
    retry: 'আবার চেষ্টা করুন',
    nameLabel: 'নাম',
    namePlaceholder: 'আমরা আপনাকে কীভাবে সম্বোধন করব?',
    bodyLabel: 'মন্তব্য',
    bodyPlaceholder: 'অভিজ্ঞতা শেয়ার করুন, প্রশ্ন করুন বা প্রসঙ্গ যোগ করুন…',
    submit: 'মন্তব্য পোস্ট করুন',
    submitting: 'পোস্ট হচ্ছে…',
    success: 'পোস্ট হয়েছে — শেয়ার করার জন্য ধন্যবাদ।',
    error: 'মন্তব্য পোস্ট করা যায়নি। পরে আবার চেষ্টা করুন।',
    rateLimited: 'এটি খুব দ্রুত ছিল। কয়েক মিনিট অপেক্ষা করে আবার চেষ্টা করুন।',
    nameError: 'অনুগ্রহ করে নাম দিন (২–৪০ অক্ষর)।',
    bodyError: 'অনুগ্রহ করে মন্তব্য লিখুন (৫–২০০০ অক্ষর)।',
    note: 'মন্তব্য সর্বজনীন এবং লেখকদের নিজস্ব মতামত প্রকাশ করে। অনুগ্রহ করে ভদ্র থাকুন এবং বিজ্ঞাপন বা ব্যক্তিগত তথ্য পোস্ট করবেন না।',
  },

  terminalMap: {
    ariaLabel: (name: string) => `${name}-এর টার্মিনাল লেআউট`,
    gates: 'গেট',
    terminal: 'টার্মিনাল',
    corridor: 'সংযোগ',
    transit: 'ভূমি পরিবহন',
    footer: (iata: string) => `${iata} · টার্মিনাল লেআউট`,
  },

  tool: {
    label: 'অনলাইন টুল',
    hub: {
      kicker: 'টুল',
      title: 'ম্যাপ ও স্থানাঙ্ক টুল',
      en: 'বিনামূল্যে টুল',
      sub: 'ভ্রমণকারী ও ভূগোলপ্রেমীদের জন্য বিনামূল্যে অনলাইন টুল — ব্রাউজারে চলে, কিছু ইনস্টল করতে হয় না।',
      description:
        'বিনামূল্যে অনলাইন ম্যাপ ও স্থানাঙ্ক টুল: WGS84 / GCJ02 / BD09 রূপান্তর, দশমিক ডিগ্রি ↔ DMS এবং দুই বিন্দুর মধ্যে সরাসরি দূরত্ব। দ্বিভাষিক, সরাসরি ব্রাউজারে।',
      comingTitle: 'আরও টুল উন্নয়নে',
      comingSub: 'ম্যাপে স্থানাঙ্ক নির্বাচন, অবস্থান শেয়ার এবং প্রজেকশন ক্যালকুলেটর আসছে।',
    },
    howTitle: 'কীভাবে ব্যবহার করবেন',
    relatedTitle: 'সম্পর্কিত টুল',
    allTools: 'সব টুল',
    tools: {
      coordinateConverter: {
        title: 'স্থানাঙ্ক কনভার্টার',
        en: 'স্থানাঙ্ক কনভার্টার',
        description:
          'WGS84, GCJ02 ও BD09-এর মধ্যে রূপান্তর — চীনে ম্যাপ অফসেট সমস্যার সমাধান।',
        note: 'WGS84 হলো জিপিএস ও আন্তর্জাতিক মান। GCJ02 চীনের মূল ভূখণ্ডে বাধ্যতামূলক অফসেট স্থানাঙ্ক ব্যবস্থা (যাকে "মঙ্গল স্থানাঙ্ক" বলা হয়), যা AMap ও Tencent Maps ব্যবহার করে। BD09 GCJ02-এর উপরে আরও অফসেট যোগ করে এবং Baidu Maps ব্যবহার করে। একই স্থান ব্যবস্থার মধ্যে ১০০–৭০০ মিটার পর্যন্ত আলাদা হতে পারে, তাই অন্য ম্যাপ সেবায় স্থানাঙ্ক পুনরায় ব্যবহারের আগে রূপান্তর করুন।',
        steps: [
          'দশমিক স্থানাঙ্ক অক্ষাংশ, দ্রাঘিমাংশ হিসেবে দিন — যেমন 39.9042, 116.4074।',
          'আপনার ইনপুটের স্থানাঙ্ক ব্যবস্থা বেছে নিন।',
          'অন্য দুটি ব্যবস্থার জন্য "রূপান্তর" চাপুন; ফলাফল সংরক্ষণ করতে "কপি" ব্যবহার করুন।',
        ],
        inputLabel: 'স্থানাঙ্ক (অক্ষাংশ, দ্রাঘিমাংশ)',
        inputPlaceholder: 'যেমন 39.9042, 116.4074',
        sourceLabel: 'ইনপুট স্থানাঙ্ক ব্যবস্থা',
        wgs84: 'WGS84 · জিপিএস / আন্তর্জাতিক',
        gcj02: 'GCJ02 · AMap / Tencent',
        bd09: 'BD09 · Baidu',
        precisionLabel: 'দশমিক স্থান',
        submit: 'রূপান্তর',
        copy: 'কপি',
        copied: 'কপি হয়েছে',
        error: 'স্থানাঙ্ক পড়া যায়নি। "অক্ষাংশ, দ্রাঘিমাংশ" ফরম্যাট ব্যবহার করুন, যেমন 39.9042, 116.4074।',
      },
      dmsConverter: {
        title: 'স্থানাঙ্ক ফরম্যাট কনভার্টার',
        en: 'স্থানাঙ্ক ফরম্যাট কনভার্টার',
        description:
          'দশমিক ডিগ্রি (DD), ডিগ্রি-মিনিট (DM) ও ডিগ্রি-মিনিট-সেকেন্ড (DMS)-এর মধ্যে রূপান্তর; ইনপুট ফরম্যাট স্বয়ংক্রিয়ভাবে শনাক্ত হয়।',
        note: 'DD (39.9042°) হলো ডিভাইস ও API-এর সাধারণ দশমিক ফরম্যাট; DMS (39°54′15″N) সমুদ্র, বিমানচালনা ও জরিপে সাধারণ; DM (39°54.25′N) ফিল্ড রেকর্ডের জন্য সাধারণ। টুল প্রতিটি অর্ধে সংখ্যা গোষ্ঠীর সংখ্যা (1 = DD, 2 = DM, 3 = DMS) থেকে ইনপুট ফরম্যাট শনাক্ত করে এবং তিনটি ফরম্যাটই আউটপুট দেয়, গোলার্ধের জন্য N/S/E/W সহ।',
        steps: [
          'এক জোড়া স্থানাঙ্ক দিন — 39.9042, 39°54′15″N এবং 39°32.5′E সবই কাজ করে; দুই অর্ধ কমা দিয়ে আলাদা করুন।',
          'আউটপুটের জন্য দশমিক স্থান সংখ্যা বেছে নিন।',
          '"রূপান্তর" চাপুন — তিনটি ফরম্যাটই তালিকাভুক্ত হয়; একটি সংরক্ষণ করতে "কপি" ব্যবহার করুন।',
        ],
        inputLabel: 'স্থানাঙ্ক (এক জোড়া, কমা দিয়ে আলাদা)',
        inputPlaceholder: 'যেমন 39°54′15″N, 116°24′51″E বা 39.9042, 116.4074',
        precisionLabel: 'দশমিক স্থান',
        submit: 'রূপান্তর',
        ddLabel: 'দশমিক ডিগ্রি (DD)',
        dmLabel: 'ডিগ্রি-মিনিট (DM)',
        dmsLabel: 'ডিগ্রি-মিনিট-সেকেন্ড (DMS)',
        copy: 'কপি',
        copied: 'কপি হয়েছে',
        error: 'স্থানাঙ্ক পড়া যায়নি। সমর্থিত ফরম্যাটের মধ্যে 39.9042, 39°54′15″N ও 39°32.5′E আছে, কমা দিয়ে আলাদা।',
      },
      distanceCalculator: {
        title: 'দূরত্ব ক্যালকুলেটর',
        en: 'দূরত্ব ক্যালকুলেটর',
        description:
          'পৃথিবীর দুই বিন্দুর মধ্যে সরাসরি দূরত্ব, সাথে প্রাথমিক দিককোণ।',
        note: 'দূরত্ব হ্যাভারসাইন মহাবৃত্ত সূত্র ব্যবহার করে (পৃথিবীর গড় ব্যাসার্ধ ৬,৩৭১.০০৮৮ কিমি) — পৃষ্ঠের উপর দিয়ে সবচেয়ে ছোট পথ। প্রাথমিক দিককোণ প্রথম বিন্দু থেকে দ্বিতীয়ের দিকে কম্পাস দিক, উত্তরে ০° এবং ঘড়ির কাঁটার দিকে বাড়ে।',
        steps: [
          'শুরুর ও শেষ বিন্দুর অক্ষাংশ ও দ্রাঘিমাংশ দিন।',
          '"দূরত্ব গণনা করুন" চাপুন।',
          'কিলোমিটার, মাইল ও নটিক্যাল মাইলে ফলাফল, সাথে প্রাথমিক দিককোণ পান।',
        ],
        fromLabel: 'থেকে',
        toLabel: 'পর্যন্ত',
        inputPlaceholder: 'অক্ষাংশ, দ্রাঘিমাংশ',
        example: 'উদাহরণ: বেইজিং → সাংহাই',
        submit: 'দূরত্ব গণনা করুন',
        km: 'কিমি',
        mi: 'মাইল',
        nmi: 'নটিক্যাল মাইল',
        bearing: 'প্রাথমিক দিককোণ',
        copy: 'কপি',
        copied: 'কপি হয়েছে',
        error: 'স্থানাঙ্ক পড়া যায়নি। "অক্ষাংশ, দ্রাঘিমাংশ" ফরম্যাট ব্যবহার করুন, অক্ষাংশ -90–90 এবং দ্রাঘিমাংশ -180–180 সহ।',
      },
    },
  },
};
