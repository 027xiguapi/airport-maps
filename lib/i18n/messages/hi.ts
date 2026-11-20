import type { Messages } from './zh';
import { hiTransportModes } from '../hi-data';

/** मुख्य वाक्य के लिए हवाई अड्डे का वर्ग (schema.org का airport प्रकार)। */
const AIRPORT_KIND = {
  large: 'बड़ा हवाई अड्डा',
  medium: 'मध्यम हवाई अड्डा',
  small: 'छोटा हवाई अड्डा',
  heliport: 'हेलीपोर्ट',
} as const;

/** "1 टर्मिनल" / "2 टर्मिनल" — पहले से फ़ॉर्मेट किए गए गिनती के लिए। */
const pluralHi = (value: string, one: string, many: string) =>
  `${value} ${value === '1' ? one : many}`;

/**
 * हिन्दी कैटलॉग। चीनी स्रोत (`Messages`) के प्रकार के अनुसार, इसलिए कोई भी
 * अनुपलब्ध या बदला हुआ कुंजी बिल्ड विफल कर देती है।
 */
export const hi: Messages = {
  site: {
    name: 'World Airport Maps',
    nameLead: 'World Airport',
    nameAccent: 'Maps',
    tagline: 'हवाई अड्डा और टर्मिनल मैप',
    description:
      'देश और क्षेत्र के अनुसार व्यवस्थित हवाई अड्डा टर्मिनल मैप देखें। बड़े अंतर्राष्ट्रीय हब से लेकर क्षेत्रीय हवाई अड्डों तक: गेट, चेक-इन क्षेत्र, बैगेज क्लेम, दुकानें, रेस्तरां, लाउंज और शहर तक परिवहन के विस्तृत नक्शे देखें।',
    keywords: [
      'हवाई अड्डा मैप',
      'टर्मिनल मैप',
      'हवाई अड्डा टर्मिनल लेआउट',
      'गेट',
      'हवाई अड्डा परिवहन',
      'हवाई अड्डा गाइड',
    ],
    numberOfItems: (n: number) =>
      pluralHi(String(n), 'हवाई अड्डा', 'हवाई अड्डे'),
  },

  nav: {
    home: 'होम',
    airports: 'सभी हवाई अड्डे',
    countries: 'देश के अनुसार',
    tools: 'ऑनलाइन टूल',
    about: 'हमारे बारे में',
    label: 'मुख्य नेविगेशन',
    languageLabel: 'भाषा',
    switchLanguage: 'भाषा बदलें',
    languagePlanned: 'तैयारी में',
    languagePlannedHint: 'यह भाषा संस्करण अभी प्रकाशित नहीं हुआ है।',
    themeToggle: 'डार्क मोड टॉगल करें',
    menu: 'मेन्यू',
  },

  common: {
    advertisement: 'विज्ञापन',
    skipToContent: 'मुख्य सामग्री पर जाएं',
    backToTop: 'ऊपर जाएं',
    breadcrumbLabel: 'ब्रेडक्रंब',
    home: 'होम',
    viewMap: 'नक्शा देखें',
    terminalMap: 'टर्मिनल मैप',
    latestAirportTitle: (
      year: number,
      name: string,
      iata: string,
      counts?: { terminals: number; gates: number }
    ) =>
      counts
        ? `${name} (${iata}): ${pluralHi(String(counts.terminals), 'टर्मिनल', 'टर्मिनल')}${
            counts.gates > 0 ? `, ${pluralHi(String(counts.gates), 'गेट', 'गेट')}` : ''
          } — टर्मिनल मैप`
        : `${name} (${iata}) — स्थान नक्शा और हवाई अड्डा गाइड ${year}`,
    airportHeading: (name: string, hasTerminals = true) =>
      hasTerminals ? `${name} टर्मिनल मैप` : name,
    airportGuide: 'हवाई अड्डा गाइड',
    lastUpdated: 'हाल ही में अपडेट',
    updatedOn: (date: string) => `${date} को अपडेट`,
    publishedOn: (date: string) => `${date} को प्रकाशित`,
    readMore: 'पूरी गाइड पढ़ें',
  },

  units: {
    terminalsFact: 'टर्मिनल',
    gatesFact: 'गेट',
    terminals: (n: number) => pluralHi(String(n), 'टर्मिनल', 'टर्मिनल'),
    terminalsShort: (n: number) => pluralHi(String(n), 'टर्मिनल', 'टर्मिनल'),
    gates: (n: number) => pluralHi(String(n), 'गेट', 'गेट'),
    airports: (n: number) => pluralHi(String(n), 'हवाई अड्डा', 'हवाई अड्डे'),
    airportsChip: (n: number) => pluralHi(String(n), 'हवाई अड्डा', 'हवाई अड्डे'),
    pax: 'यात्री',
    paxFull: 'वार्षिक यात्री',
    distance: 'शहर के केंद्र तक',
    distanceFrom: (city: string) => `${city} के केंद्र से`,
    gatesLabel: (range: string) => `गेट ${range}`,
    gatesCount: (n: number) => `${n} गेट`,
    satellite: 'सैटेलाइट टर्मिनल',
    airlinesLabel: 'मुख्य एयरलाइंस: ',
  },

  search: {
    ariaLabel: 'हवाई अड्डे खोजें',
    placeholder: 'हवाई अड्डे, शहर या IATA कोड खोजें',
    heroPlaceholder: 'हवाई अड्डे का नाम, शहर या IATA कोड से खोजें — जैसे LHR / दुबई / Heathrow',
    submit: 'हवाई अड्डा खोजें',
    loading: 'खोज रहे हैं…',
    empty: 'कोई मिलता हुआ हवाई अड्डा नहीं मिला',
    resultsTitle: (term: string) => `“${term}” के खोज परिणाम`,
    resultsCount: (n: number) =>
      `${pluralHi(String(n), 'मिलता हुआ हवाई अड्डा', 'मिलते हुए हवाई अड्डे')} मिले।`,
    noResults: 'कोई हवाई अड्डा नहीं मिला। कोई दूसरा शब्द आज़माएं, जैसे शहर का नाम या IATA कोड।',
    noResultsHint: 'अपना हवाई अड्डा नहीं मिल रहा?',
    viewAll: (n: number) => `सभी ${n} हवाई अड्डे देखें`,
    orBrowseByCountry: 'या देश के अनुसार देखें',
    range: (from: number, to: number, total: number) =>
      `${total} हवाई अड्डों में से ${from}–${to} दिखाए जा रहे हैं`,
  },

  hero: {
    eyebrow: 'विश्व हवाई अड्डा निर्देशिका',
    titleLead: 'हवाई अड्डे और',
    titleAccent: 'टर्मिनल मैप देखें',
    sub: 'हवाई अड्डा और टर्मिनल मैप के पूरे संग्रह के साथ किसी भी हवाई अड्डे में रास्ता खोजें, देश और क्षेत्र के अनुसार व्यवस्थित — बड़े अंतर्राष्ट्रीय हब से लेकर क्षेत्रीय हवाई अड्डों तक।',
    stats: {
      countries: 'देश / क्षेत्र',
      airports: 'हवाई अड्डे',
      terminals: 'टर्मिनल मैप',
    },
  },

  home: {
    intro: {
      ariaLabel: 'इस साइट के बारे में',
      imageAlt: 'सूर्योदय के समय कांच के मुखौटे वाले टर्मिनल के गेट पर खड़ा यात्री विमान',
      blocks: [
        {
          title: 'विस्तृत टर्मिनल मैप के साथ किसी भी हवाई अड्डे में रास्ता खोजें',
          body: 'दुनिया भर के हवाई अड्डों और टर्मिनलों में रास्ता खोजना चुनौतीपूर्ण हो सकता है। हमारे विस्तृत मैप टर्मिनल, गेट, चेक-इन क्षेत्र, बैगेज क्लेम, दुकानें, रेस्तरां, लाउंज और परिवहन केंद्रों के लेआउट दिखाते हैं, ताकि आप यात्रा से पहले ही मार्ग की योजना बना सकें।',
        },
        {
          title: 'इंटरैक्टिव टर्मिनल मैप और फ़्लोर प्लान',
          body: 'बड़े अंतर्राष्ट्रीय हवाई अड्डों में कई टर्मिनल और जटिल लेआउट होते हैं। हमारे मैप गेट खोजने, सुविधाएं ढूंढने, कनेक्शन की योजना बनाने और सुरक्षा जांच, प्रस्थान और आगमन हॉल से कुशलता से गुजरने में मदद करते हैं — बिना पीछे लौटे।',
        },
        {
          title: 'हवाई अड्डा परिवहन और पहुंच',
          body: 'टर्मिनल लेआउट के अलावा, हमारी गाइड परिवहन विकल्प, पार्किंग और पहुंच मार्गों को कवर करती हैं। अपने गेट तक पहुंचने, टर्मिनलों के बीच बदलने और ट्रेन, बस, टैक्सी और किराए की कार सहित ज़मीनी परिवहन का उपयोग करने का सर्वोत्तम तरीका खोजें।',
        },
      ],
    },
    map: {
      kicker: 'विश्व मानचित्र',
      title: 'हवाई अड्डा मैप',
      en: 'हवाई अड्डा मैप',
      sub: (airports: string, world: string) =>
        `दुनिया भर के ${world} निर्धारित हवाई अड्डों का स्थान देखें — इनमें से ${airports} के पास यहां टर्मिनल मैप है। देश या क्षेत्र और विवरण के लिए किसी बिंदु पर क्लिक करें।`,
      all: 'सभी',
      gEurope: 'यूरोप',
      gAsia: 'एशिया',
      gAmericas: 'अमेरिका',
      gAfrica: 'अफ़्रीका',
      gOceania: 'ओशिनिया',
      legendSite: 'यहां शामिल · टर्मिनल मैप के लिए क्लिक करें',
      legendWorld: 'दुनिया भर के अन्य निर्धारित हवाई अड्डे',
      countTemplate: '{n} हवाई अड्डे दिखाए जा रहे हैं',
      download: 'डेटा डाउनलोड करें',
      downloadTitle: 'वर्तमान फ़िल्टर के सभी हवाई अड्डों को CSV में निर्यात करें (IATA, नाम, शहर, देश, निर्देशांक)',
      openAirport: 'हवाई अड्डा देखें',
    },
    popular: {
      kicker: 'टर्मिनल मैप',
      title: 'लोकप्रिय हवाई अड्डा मैप',
      en: 'हवाई अड्डा मैप',
      sub: 'दुनिया भर के बड़े हवाई अड्डों के टर्मिनल मैप कवर का चयन — पूरा नक्शा देखने के लिए हवाई अड्डा पेज खोलें।',
    },
    recent: {
      kicker: 'नया प्रकाशित',
      title: 'हाल ही में अपडेट',
      en: 'हाल ही में अपडेट',
      sub: 'नए और संशोधित हवाई अड्डे, देश और यात्रा गाइड।',
      countriesTitle: 'हाल ही में अपडेट किए गए देश',
    },
    routes: {
      kicker: 'मार्ग',
      title: 'सबसे व्यस्त हवाई अड्डा मार्ग मैप',
      en: 'मार्ग मैप',
      sub: 'हवाई अड्डे, बिना रुके जाने वाले स्थानों की संख्या के अनुसार क्रमबद्ध — मार्ग मैप, एयरलाइंस और गंतव्य सूची के लिए किसी एक को खोलें।',
      collection: 'मार्ग संग्रह',
      tabsLabel: 'शहर के अनुसार मार्ग मैप',
      explore: (city: string) => `${city} देखें`,
      play: 'स्लाइडशो शुरू करें',
      pause: 'स्लाइडशो रोकें',
    },
    photos: {
      kicker: 'नवीनतम तस्वीरें',
      title: 'नवीनतम हवाई अड्डा तस्वीरें',
      en: 'नवीनतम तस्वीरें',
      sub: 'सबसे हाल में जोड़ी गई हवाई अड्डा तस्वीरें — छह नवीनतम हवाई अड्डे, प्रत्येक की एक तस्वीर।',
      ariaLabel: 'नवीनतम हवाई अड्डा तस्वीरों का कैरोसेल',
      prev: 'पिछली तस्वीर',
      next: 'अगली तस्वीर',
      play: 'स्लाइडशो शुरू करें',
      pause: 'स्लाइडशो रोकें',
      counter: (index: number, total: number) => `तस्वीर ${index} / ${total}`,
      view: (name: string) => `${name} का नक्शा देखें`,
      open: 'हवाई अड्डा पेज खोलें',
    },
    countries: {
      kicker: 'देश के अनुसार',
      title: 'देश के अनुसार हवाई अड्डा मैप',
      en: 'देश',
      sub: 'देश और क्षेत्र के अनुसार व्यवस्थित टर्मिनल मैप देखें, बड़े अंतर्राष्ट्रीय हब से लेकर क्षेत्रीय हवाई अड्डों तक।',
      more: 'सभी देश',
    },
    all: {
      kicker: 'सभी मैप',
      title: 'सभी हवाई अड्डा मैप',
      en: 'सभी हवाई अड्डे',
      sub: 'दुनिया के सबसे व्यस्त हवाई अड्डों और यात्रा केंद्रों के मैप।',
      hint: 'टर्मिनल लेआउट देखने के लिए कोई हवाई अड्डा चुनें।',
      more: 'सभी देखें',
    },
    facts: {
      kicker: 'निर्देशिका डेटा',
      title: 'एक नज़र में हवाई अड्डा डेटा',
      en: 'सूचियां और तालिकाएं',
      sub: 'निर्देशिका के आंकड़े सूचियों और तालिकाओं में: कवरेज, प्रकाशित यात्री आंकड़ों वाले सबसे व्यस्त हवाई अड्डे और क्षेत्रीय विभाजन।',
      note: (pax: string, detailed: string, total: string) =>
        `यात्री आंकड़े ${total} हवाई अड्डों में से ${pax} को कवर करते हैं; टर्मिनल और गेट आंकड़े ${total} में से ${detailed} को कवर करते हैं। टर्मिनल गिनती निर्देशिका के अपने समूहन का पालन करती है और इसमें कॉनकोर्स शामिल हो सकते हैं।`,
      coverageTitle: 'कवरेज आंकड़े',
      coverage: {
        airports: 'हवाई अड्डे',
        countries: 'देश और क्षेत्र',
        regions: 'निर्देशिका क्षेत्र',
        cities: 'अद्वितीय शहर नाम',
        terminals: 'टर्मिनल',
        gates: 'गेट',
        routes: 'मार्ग मैप वाले हवाई अड्डे',
      },
      busiest: {
        title: 'वार्षिक यात्रियों के अनुसार सबसे व्यस्त हवाई अड्डे',
        sub: 'प्रकाशित वार्षिक यात्री आंकड़ों वाले बारह सबसे व्यस्त हवाई अड्डे।',
        caption: 'प्रकाशित वार्षिक यात्री आंकड़ों वाले हवाई अड्डे, क्रमबद्ध',
        rank: 'रैंक',
        iata: 'IATA',
        airport: 'हवाई अड्डा',
        city: 'शहर',
        country: 'देश',
        terminals: 'टर्मिनल',
        gates: 'गेट',
        pax: 'वार्षिक यात्री (मिलियन)',
      },
      regions: {
        title: 'निर्देशिका क्षेत्र के अनुसार हवाई अड्डे',
        sub: 'निर्देशिका के क्षेत्र लेबल के अनुसार समूहित हवाई अड्डे, टर्मिनल और गेट गिनती; कुछ देश और क्षेत्र दो क्षेत्रों में आते हैं।',
        caption: 'निर्देशिका क्षेत्र के अनुसार हवाई अड्डा गिनती',
        region: 'क्षेत्र',
        airports: 'हवाई अड्डे',
        detailed: 'विस्तृत डेटा के साथ',
        terminals: 'टर्मिनल',
        gates: 'गेट',
      },
    },
  },

  table: {
    iata: 'IATA',
    airport: 'हवाई अड्डा',
    city: 'शहर',
    country: 'देश',
    size: 'आकार',
    map: 'मैप',
    empty: 'इन फ़िल्टर से कोई हवाई अड्डा नहीं मिलता। चयन बढ़ाने का प्रयास करें।',
  },

  pager: {
    label: 'पेजिनेशन',
    previous: 'पिछला पेज',
    next: 'अगला पेज',
  },

  filters: {
    searchPlaceholder: 'हवाई अड्डे, शहर या IATA कोड खोजें',
    submit: 'खोजें',
    country: 'देश',
    all: 'सभी',
    sort: 'क्रमबद्ध करें',
    sortPax: 'यात्री',
    sortName: 'नाम',
    sortIata: 'IATA कोड',
    sortUpdated: 'अंतिम अपडेट',
    viewTitle: (country: string, sortLabel: string) =>
      country
        ? `${country} के सभी हवाई अड्डा मैप${sortLabel ? ` — ${sortLabel} से क्रमबद्ध` : ''}`
        : `सभी हवाई अड्डा मैप — ${sortLabel} से क्रमबद्ध`,
    viewDescription: (country: string, sortLabel: string) =>
      country
        ? `${country} के हर हवाई अड्डा मैप एक पेज पर: टर्मिनल लेआउट, गेट क्षेत्र और ज़मीनी परिवहन${sortLabel ? `, ${sortLabel} के अनुसार` : ''}।`
        : `पूरी हवाई अड्डा मैप निर्देशिका एक पेज पर: टर्मिनल लेआउट, गेट क्षेत्र और ज़मीनी परिवहन${sortLabel ? `, ${sortLabel} के अनुसार` : ''}।`,
  },

  countries: {
    title: 'देश के अनुसार हवाई अड्डे देखें',
    description:
      'देश और क्षेत्र के अनुसार वैश्विक हवाई अड्डा टर्मिनल मैप निर्देशिका देखें। बड़े अंतर्राष्ट्रीय हब से लेकर क्षेत्रीय हवाई अड्डों तक: देखें कि प्रत्येक देश में कितने हवाई अड्डे और टर्मिनल हैं।',
    sub: (countries: string, airports: string, terminals: string) =>
      `बड़े अंतर्राष्ट्रीय हब से लेकर क्षेत्रीय हवाई अड्डों तक — कुल ${countries} देश और क्षेत्र, ${airports} हवाई अड्डे और ${terminals} टर्मिनल।`,
    regionCount: (countries: number, airports: number) =>
      `${countries} देश · ${airports} हवाई अड्डे`,
  },

  country: {
    title: (name: string, count?: number) =>
      count ? `${name} हवाई अड्डा मैप — सभी ${count} हवाई अड्डे` : `${name} के हवाई अड्डा मैप`,
    description: (name: string, nameEn: string, region: string, count: number, total?: number) =>
      total
        ? `${name}${nameEn !== name ? ` (${nameEn})` : ''} में ${total} निर्धारित हवाई अड्डे हैं; इनमें से ${count} के पास यहां गाइड पेज है, वितरण मैप, पूरी राष्ट्रीय सूची और सीधे मार्गों के साथ।`
        : `${name} (${nameEn}) में ${count} हवाई अड्डों के टर्मिनल मैप, जो ${region} के मुख्य अंतर्राष्ट्रीय हब और क्षेत्रीय हवाई अड्डों को कवर करते हैं। गेट, टर्मिनल लेआउट और ज़मीनी परिवहन देखें।`,
    chip: (nameEn: string) => `${nameEn.toUpperCase()} हवाई अड्डे`,
    kicker: 'हवाई अड्डा मैप',
    titleOf: (name: string) => `${name} में हवाई अड्डे`,
    en: 'हवाई अड्डे',
    sub: 'टर्मिनल लेआउट, गेट क्षेत्र और परिवहन विकल्प देखने के लिए कोई हवाई अड्डा चुनें।',
    empty: 'इस देश या क्षेत्र के लिए अभी कोई हवाई अड्डा सूचीबद्ध नहीं है।',
    moreKicker: 'अन्य देश',
    moreTitle: 'अन्य देश देखें',
    moreEn: 'और देश',
    all: 'सभी देश',
    notFound: 'देश नहीं मिला',
    introKicker: 'अवलोकन',
    introTitle: (name: string) => `${name} हवाई अड्डा अवलोकन`,
    introEn: 'हवाई अड्डा अवलोकन',
    introSub:
      'इस देश या क्षेत्र के हवाई अड्डों का पैमाना, मुख्य हब और वे शहर जिनकी वे सेवा करते हैं।',
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
      `${o.name}${o.nameEn ? ` (${o.nameEn})` : ''} ${o.region} में स्थित है। यह साइट वहां ${o.airports}${
        o.terminals ? `, ${o.terminals}` : ''
      }${o.gates ? ` और ${o.gates}` : ''} कवर करती है।` +
      (o.busiest
        ? ` वार्षिक यात्रियों के अनुसार ${o.busiest} (${o.busiestIata}) सबसे बड़ा है, ${o.busiestPax} के साथ।`
        : '') +
      ` हवाई अड्डे ${o.cities} जैसे शहरों की सेवा करते हैं। ${o.mapsNote}`,
    introMapsNote:
      'प्रत्येक हवाई अड्डा पेज में स्थान नक्शा और हवाई अड्डा कोड होते हैं, साथ ही उसके लिए एकत्र किए गए टर्मिनल, गेट और परिवहन विवरण।',
    distribution: {
      kicker: 'वितरण',
      title: (name: string) => `${name} हवाई अड्डा वितरण मैप`,
      en: 'हवाई अड्डा वितरण',
      sub: (covered: string, total: string) =>
        `देश भर में ${total} निर्धारित हवाई अड्डे (बड़े, मध्यम और छोटे); इनमें से ${covered} के पास इस साइट पर गाइड पेज है। पूरी सूची नीचे है।`,
      mapAlt: (name: string, total: string) =>
        `${name} हवाई अड्डा वितरण मैप: ${total} निर्धारित हवाई अड्डे`,
      siteTag: 'यहां शामिल',
      colAirport: 'हवाई अड्डा',
      colCity: 'शहर',
      colType: 'प्रकार',
      types: {
        large: 'बड़ा',
        medium: 'मध्यम',
        small: 'छोटा',
      },
      empty: 'राष्ट्रीय हवाई अड्डा सूची अभी उपलब्ध नहीं है।',
    },
    linksTitle: 'संबंधित लिंक',
    linksEn: 'संबंधित लिंक',
    linksSub: 'देश और उसके प्रत्येक हवाई अड्डे के लिए आधिकारिक साइट और विश्वकोश।',
    linksCountry: (name: string) => `${name} संदर्भ`,
    linksAirports: (name: string) => `${name} में हवाई अड्डे`,
    faqKicker: 'सामान्य प्रश्न',
    faqTitle: 'अक्सर पूछे जाने वाले प्रश्न',
    faqEn: 'प्रश्न',
    faq: {
      airportTotal: (name: string) => `${name} में कितने हवाई अड्डे हैं?`,
      airportTotalAnswer: (name: string, total: string, covered: string) =>
        `${name} में ${total} निर्धारित यात्री हवाई अड्डे हैं (बड़े, मध्यम और छोटे); यह साइट इनमें से ${covered} को विस्तार से कवर करती है। ऊपर वितरण मैप और पूरी सूची देखें।`,
      airportCount: (name: string) => `${name} में कौन से हवाई अड्डे शामिल हैं?`,
      airportCountAnswer: (name: string, count: string, list: string) =>
        `यह साइट ${name} में ${count} को कवर करती है: ${list}।`,
      busiest: (name: string) => `${name} का सबसे व्यस्त हवाई अड्डा कौन सा है?`,
      busiestAnswer: (busiest: string, iata: string, pax: string) =>
        `वार्षिक यात्रियों के अनुसार ${busiest} (${iata}) यहां कवर किए गए हवाई अड्डों में सबसे बड़ा है, ${pax} के साथ।`,
      terminals: (name: string) => `${name} के हवाई अड्डों में कितने टर्मिनल हैं?`,
      terminalsAnswer: (name: string, terminals: string, gates: string, list: string) =>
        `${name} में कवर किए गए हवाई अड्डों में ${terminals} हैं, कुल ${gates} के साथ: ${list}।`,
      cities: (name: string) => `${name} के किन शहरों में हवाई अड्डा है?`,
      citiesAnswer: (name: string, cities: string) =>
        `यहां कवर किए गए ${name} के हवाई अड्डे ${cities} जैसे शहरों की सेवा करते हैं। आप उन्हें हवाई अड्डा निर्देशिका में शहर या IATA कोड से फ़िल्टर कर सकते हैं।`,
      maps: (name: string) => `${name} के हवाई अड्डों में टर्मिनल मैप हैं?`,
      mapsAnswer: (name: string, count: string) =>
        `कुछ में हैं। हवाई अड्डा पेजों में स्थान नक्शा, हवाई अड्डा कोड और सीधे मार्ग होते हैं, और ${name} में कवर किए गए ${count} में टर्मिनल लेआउट, गेट क्षेत्र और ज़मीनी परिवहन दिखाया जाता है जहां ये विवरण एकत्र हैं। क्या उपलब्ध है, यह देखने के लिए कोई हवाई अड्डा खोलें।`,
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
        ? `${o.name} (${o.iata}) में ${o.terminals} टर्मिनल${o.gates ? ` और ${o.gates} गेट` : ''}${
            o.pax ? `, सालाना ${o.pax} यात्री` : ''
          }${o.distance ? `, शहर के केंद्र से ${o.distance}` : ''} हैं। सभी टर्मिनल, गेट क्षेत्र और ज़मीनी परिवहन वाला टर्मिनल मैप।`
        : `${o.name} (${o.iata}) ${o.city}, ${o.country} की सेवा करता है। स्थान नक्शा, हवाई अड्डा कोड और यात्रा जानकारी।`,
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
      const kind = o.kind ? AIRPORT_KIND[o.kind] : 'हवाई अड्डा';
      const head = `${o.name} (IATA: ${o.iata}${o.icao ? `, ICAO ${o.icao}` : ''}) ${where} की सेवा करने वाला ${kind} है`;
      return o.terminals > 0
        ? `${head}, जिसमें ${o.terminals} टर्मिनल${o.gates > 0 ? ` और ${o.gates} गेट` : ''}${
            o.distance ? `, ${o.city} के केंद्र से लगभग ${o.distance}` : ''
          } हैं।`
        : `${head}।`;
    },
    mapTitle: (iata: string) => `${iata} · टर्मिनल लेआउट`,
    mapNote: 'टर्मिनल लेआउट',
    realMapTitle: (iata: string) => `${iata} टर्मिनल मैप — गेट और नेविगेशन`,
    mapAlt: (name: string, iata: string) =>
      `${name} (${iata}) का टर्मिनल मैप, सभी टर्मिनल, गेट क्षेत्र और कॉनकोर्स के साथ`,
    realMapNote: 'टर्मिनल मैप',
    photosKicker: 'तस्वीरें',
    photosTitle: 'हवाई अड्डा तस्वीरें',
    photosEn: 'हवाई अड्डा तस्वीरें',
    photosSub:
      'इस हवाई अड्डे की असली तस्वीरें, प्रत्येक के साथ वह सार्वजनिक वेब पेज जहां से यह मिली; कॉपीराइट मूल फोटोग्राफरों के पास रहता है। बड़ा करने के लिए तस्वीर पर क्लिक करें, या स्रोत पेज खोलने के लिए क्रेडिट लाइन पर क्लिक करें।',
    photosCredit: (host: string) => `स्रोत: ${host}`,
    photosAlt: (name: string, iata: string, index: number) =>
      `${name} (${iata}) की हवाई अड्डा तस्वीर ${index}`,
    photosZoom: (name: string, index: number) => `${name} की तस्वीर ${index} बड़ी करें`,
    zoomLabel: 'ज़ूम',
    zoomClose: 'बंद करें',
    zoomIn: 'ज़ूम इन',
    zoomOut: 'ज़ूम आउट',
    downloadKicker: 'डाउनलोड',
    downloadTitle: 'हवाई अड्डा मैप डाउनलोड करें',
    downloadEn: 'डाउनलोड',
    downloadMapLabel: (year: number, iata: string) =>
      `${year} का नवीनतम ${iata} टर्मिनल मैप और फ़्लोर प्लान डाउनलोड करें`,
    downloadPdfLabel: (year: number, iata: string) =>
      `${year} का नवीनतम ${iata} टर्मिनल मैप PDF डाउनलोड करें`,
    timeKicker: 'समय',
    timeTitle: (iata: string) => `हवाई अड्डा समय जानकारी — ${iata} का वर्तमान समय`,
    timeEn: 'हवाई अड्डा समय',
    timeSub: (iata: string, tz: string) => `${iata} (${tz}) का वर्तमान समय आपके स्थानीय समय की तुलना में।`,
    clockAirport: 'हवाई अड्डे का वर्तमान समय',
    clockLocal: 'आपका स्थानीय समय',
    infoKicker: 'जानकारी',
    infoTitle: 'हवाई अड्डा जानकारी और विवरण',
    infoEn: 'हवाई अड्डा विवरण',
    infoIata: 'हवाई अड्डा IATA कोड',
    infoLocation: 'हवाई अड्डा स्थान',
    infoCoords: 'निर्देशांक',
    infoTimezone: 'समय क्षेत्र',
    linksKicker: 'लिंक',
    linksTitle: 'संबंधित लिंक',
    linksEn: 'संबंधित लिंक',
    linksSub: 'इस हवाई अड्डे के बाहरी संदर्भ: आधिकारिक वेबसाइट, विकिपीडिया और बैदू बाइके।',
    officialSite: 'आधिकारिक वेबसाइट',
    wikiLabel: 'विकिपीडिया',
    baikeLabel: 'बैदू बाइके',
    sourcesLabel: 'स्रोत: ',
    sourcesWikipedia: 'विकिपीडिया',
    sourcesOurAirports: 'OurAirports खुला डेटा',
    sourcesNote:
      'हवाई अड्डा कोड, निर्देशांक और हवाई अड्डा वर्ग खुले डेटा से संकलित हैं; पेज के विवरण प्रत्येक हवाई अड्डे के आधिकारिक प्रकाशनों का पालन करते हैं।',
    mapEmbedKicker: 'मैप',
    mapEmbedTitle: (name: string) => `इंटरैक्टिव मैप — ${name} का स्थान`,
    mapEmbedEn: 'इंटरैक्टिव मैप',
    extMapsNote: 'इस हवाई अड्डे को अन्य मैप सेवाओं पर देखें:',
    routeMapKicker: 'मार्ग',
    routeMapTitle: (name: string) => `${name} मार्ग मैप — सीधे गंतव्य`,
    routeMapEn: 'मार्ग मैप',
    routeMapAria: (name: string) => `${name} से सीधे मार्गों का मैप`,
    routeLegendTitle: 'रंग कुंजी',
    routeLegendClose: 'कुंजी छिपाएं',
    routeReset: 'मैप रीसेट करें',
    routeZoomIn: 'ज़ूम इन',
    routeZoomOut: 'ज़ूम आउट',
    routeFullscreen: 'पूर्ण स्क्रीन',
    routeExitFullscreen: 'पूर्ण स्क्रीन से बाहर',
    routeOpenAirport: `{iata} हवाई अड्डा पेज खोलें`,
    routeTiers: {
      trunk: '6+ एयरलाइंस',
      major: '3–5 एयरलाइंस',
      minor: '2 एयरलाइंस',
      single: '1 एयरलाइन',
    },
    routeCarriersTpl: '{n} एयरलाइंस',
    routeTableDest: 'गंतव्य',
    routeTableCountry: 'देश/क्षेत्र',
    routeTableDistance: 'दूरी',
    routeTableCarriers: 'एयरलाइंस',
    routeCarriersMore: (n: number) => ` +${n} और`,
    routeMapNote: (date: string) =>
      `मार्ग डेटा स्नैपशॉट: ${date}; केवल सीधी उड़ानें। स्रोत: `,
    legendTerminal: 'टर्मिनल भवन',
    legendTransit: 'ज़मीनी परिवहन केंद्र',
    legendCorridor: 'टर्मिनलों के बीच संपर्क',
    terminalsKicker: 'टर्मिनल',
    terminalsTitle: 'टर्मिनल गाइड',
    terminalsEn: 'टर्मिनल गाइड',
    terminalsSub: (name: string) =>
      `${name} पर प्रत्येक टर्मिनल के गेट क्षेत्र, मुख्य एयरलाइंस और सुविधाएं।`,
    transitTitle: 'ज़मीनी परिवहन',
    facilitiesTitle: 'हवाई अड्डा सुविधाएं',
    faqKicker: 'सामान्य प्रश्न',
    faqTitle: 'अक्सर पूछे जाने वाले प्रश्न',
    faqEn: 'प्रश्न',
    guideKicker: 'गाइड',
    guideTitle: 'हवाई अड्डा गाइड',
    guideEn: 'हवाई अड्डा गाइड',
    blogKicker: 'लेख',
    blogTitle: (iata: string) => `${iata} हवाई अड्डा गाइड`,
    blogEn: 'ब्लॉग से',
    blogSub: (iata: string, count: number) =>
      `इस साइट पर ${count} लेख ${iata} को कवर करते हैं: आगमन, ज़मीनी परिवहन, सामान और कनेक्शन।`,
    blogAll: 'सभी लेख',
    relatedTitle: (country: string) => `${country} में अन्य हवाई अड्डे`,
    relatedEn: (country: string) => `${country} में और`,
    relatedAll: (country: string) => `${country} में सभी हवाई अड्डे`,
    flights: {
      kicker: 'उड़ानें',
      title: (name: string) => `${name} की उड़ानें — प्रस्थान और आगमन`,
      en: 'उड़ान बोर्ड',
      sub: (flights: string, airlines: string, destinations: string) =>
        `${flights} फ़्लाइट नंबर, ${airlines} एयरलाइंस और ${destinations} गंतव्यों में, दिशा के अनुसार विभाजित। कोडशेयर नंबर शामिल हैं।`,
      statDepartures: 'प्रस्थान फ़्लाइट नंबर',
      statArrivals: 'आगमन फ़्लाइट नंबर',
      statAirlines: 'एयरलाइंस',
      statDestinations: 'गंतव्य',
      note: (date: string) =>
        `aviability.com फ़्लाइट इंडेक्स से फ़्लाइट नंबर और मार्ग (स्नैपशॉट ${date}); कोडशेयर नंबर शामिल हैं और प्रस्थान समय नहीं दिखाए जाते। स्रोत: `,
      source: 'aviability.com',
      tabDepartures: 'प्रस्थान',
      tabArrivals: 'आगमन',
      search: 'फ़्लाइट नंबर, एयरलाइन या शहर खोजें',
      clearSearch: 'खोज साफ़ करें',
      flight: 'उड़ान',
      airline: 'एयरलाइन',
      destination: 'गंतव्य',
      origin: 'मूल',
      country: 'देश/क्षेत्र',
      empty: 'इस खोज से कोई उड़ान नहीं मिलती।',
      loading: 'उड़ानें लोड हो रही हैं…',
      error: 'और उड़ानें लोड नहीं हो सकीं।',
      retry: 'फिर कोशिश करें',
      previous: 'पिछला',
      next: 'अगला',
      pagination: 'पेजिनेशन',
      showing: '{total} फ़्लाइट नंबरों में से {from}–{to} दिखाए जा रहे हैं',
      pageOf: 'पेज {page} / {pages}',
    },
    notFound: 'हवाई अड्डा नहीं मिला',
  },

  route: {
    metaTitle: (year: number, name: string, iata: string, count: string) =>
      `${name} (${iata}) का नवीनतम मार्ग मैप ${year} — ${count} सीधे गंतव्य`,
    metaDescription: (name: string, iata: string, count: string) =>
      `${name} (${iata}) के सीधे मार्गों का मैप: ${count} गंतव्य, एयरलाइंस और दूरियों के साथ, साथ ही पूरी गंतव्य सूची।`,
    heading: (name: string) => `${name} मार्ग मैप`,
    headingSub: (iata: string, count: string) =>
      `${iata} में ${count} सीधे गंतव्य हैं, प्रत्येक को सेवा देने वाली एयरलाइंस की संख्या के अनुसार रंगे हुए।`,
    backToAirport: (iata: string) => `${iata} हवाई अड्डा पेज पर वापस`,
    flightNumbers: (iata: string) => `${iata} फ़्लाइट नंबर`,
    openFull: 'मार्ग मैप देखें',
    previewCta: (iata: string) => `पूरा ${iata} मार्ग मैप देखें`,
    teaserSub: (count: string) => `${count} सीधे गंतव्य: मैप, एयरलाइंस और दूरियां।`,
    mapSectionTitle: (name: string) => `${name} सीधे मार्गों का मैप`,
    tableKicker: (iata: string) => `${iata} · गंतव्य`,
    tableSectionTitle: (name: string) => `${name} सीधे गंतव्यों की सूची`,
    tableSectionEn: (iata: string) => `${iata} गंतव्य`,
    tableToc: 'गंतव्य',
    tableSectionSub: (count: string) =>
      `${count} गंतव्य, एयरलाइंस की संख्या के अनुसार सबसे व्यस्त पहले, दूरी और वाहकों के साथ।`,
    dataKicker: 'डाउनलोड',
    dataTitle: 'मार्ग डेटा डाउनलोड करें',
    dataEn: 'डेटा',
    dataSub: (count: number) =>
      `${count} सीधे मार्ग, गंतव्य, IATA कोड, शहर, देश, दूरी और एयरलाइंस के साथ — स्प्रेडशीट या स्क्रिप्ट के लिए तैयार।`,
    dataFields: 'CSV Excel / Numbers के लिए, JSON कोड के लिए; दोनों UTF-8 हैं।',
    dataCsv: 'CSV डाउनलोड करें',
    dataJson: 'JSON डाउनलोड करें',
    airportMapSub:
      'एक नज़र में टर्मिनल और गेट लेआउट — पूरा नक्शा, टर्मिनल सुविधाएं और हवाई अड्डा पेज पर ज़मीनी परिवहन देखने के लिए छवि पर क्लिक करें।',
    airportMapCta: (iata: string) => `पूरा ${iata} टर्मिनल मैप देखें`,
    factDestinations: 'सीधे गंतव्य',
    factAirlines: 'एयरलाइंस',
    factCountries: 'देश',
    factSnapshot: 'डेटा स्नैपशॉट',
    faqCountQ: (name: string) => `${name} बिना रुके कितनी जगहों तक उड़ता है?`,
    faqCountA: (name: string, iata: string, count: string, countries: string) =>
      `${name} (${iata}) में ${countries} देशों और क्षेत्रों में ${count} सीधे गंतव्य हैं। केवल सीधी उड़ानें गिनी जाती हैं; स्टॉप वाली यात्राएं नहीं।`,
    faqAirlinesQ: (name: string) => `${name} से कितनी एयरलाइंस उड़ती हैं?`,
    faqAirlinesA: (count: string, leaders: string) =>
      `${count} एयरलाइंस इस हवाई अड्डे से सीधे मार्ग संचालित करती हैं। सबसे बड़े नेटवर्क ${leaders} के हैं (कोष्ठक में गंतव्यों की संख्या)।`,
    faqFarthestQ: (name: string) => `${name} से सबसे दूर का सीधा गंतव्य कौन सा है?`,
    faqFarthestA: (city: string, country: string, iata: string, km: string) =>
      `सबसे दूर का सीधा गंतव्य ${city}, ${country} ${iata} है, लगभग ${km} किमी दूर।`,
    faqBusiestQ: () => 'किन गंतव्यों में सबसे अधिक प्रतिस्पर्धा है?',
    faqBusiestA: (count: string, list: string) =>
      `${count} गंतव्यों को तीन या अधिक एयरलाइंस सेवा देती हैं; सबसे व्यस्त ${list} हैं।`,
    faqSourceQ: () => 'मार्ग डेटा कितनी बार अपडेट होता है?',
    faqSourceA: (date: string, source: string, license: string) =>
      `इस पेज के मार्ग ${source} के खुले डेटासेट (${license}) से हैं, जो ${date} का स्नैपशॉट है, लाइव समय-सारणी नहीं — टिकट और समय एयरलाइन या हवाई अड्डे से जांचें।`,
  },

  flight: {
    metaTitle: (number: string, airline: string, from: string, to: string) =>
      `${number} ${airline} उड़ान — ${from} से ${to}`,
    metaDescription: (number: string, airline: string, from: string, to: string, distance: string) =>
      `उड़ान ${number} ${airline} द्वारा ${from} से ${to} तक उपयोग किया जाने वाला फ़्लाइट नंबर है${distance ? `, लगभग ${distance}` : ''}। मार्ग मैप, प्रस्थान और आगमन हवाई अड्डे, दूरी और मार्ग की अन्य उड़ानें।`,
    heading: (number: string) => `उड़ान ${number}`,
    subtitle: (airline: string, from: string, to: string) => `${airline} · ${from} → ${to}`,
    lead: (number: string, airline: string, from: string, to: string, distance: string) =>
      `उड़ान ${number} ${airline} द्वारा ${from} और ${to} के बीच उपयोग किया जाने वाला फ़्लाइट नंबर है${distance ? `, लगभग ${distance} की सीधी दूरी` : ''}।`,
    factFlight: 'फ़्लाइट नंबर',
    factFrom: 'से',
    factTo: 'तक',
    factDistance: 'दूरी',
    overviewKicker: 'अवलोकन',
    overviewTitle: (number: string) => `उड़ान ${number} के बारे में`,
    overviewBody: (
      number: string,
      airline: string,
      originName: string,
      originIata: string,
      destName: string,
      destIata: string,
      distance: string
    ) =>
      `${number} ${airline} द्वारा ${originName} (${originIata}) और ${destName} (${destIata}) के बीच उपयोग किया जाने वाला फ़्लाइट नंबर है${distance ? `, लगभग ${distance} की दूरी पर` : ''}। यह पेज फ़्लाइट नंबर, एयरलाइन, मार्ग और दोनों हवाई अड्डों को त्वरित खोज के लिए एकत्र करता है।`,
    overviewNote:
      'फ़्लाइट इंडेक्स में प्रस्थान या आगमन समय, विमान प्रकार या संचालन तिथियां शामिल नहीं हैं; समय-सारणी, चेक-इन और बोर्डिंग समय एयरलाइन या हवाई अड्डे से पुष्टि करें।',
    routeKicker: 'मार्ग',
    routeTitle: (from: string, to: string) => `${from} → ${to} मार्ग`,
    routeDiagramAria: (number: string) => `उड़ान ${number} का मार्ग आरेख`,
    routeMapAria: (number: string) => `उड़ान ${number} का मार्ग मैप`,
    airportsKicker: 'हवाई अड्डे',
    airportsTitle: 'प्रस्थान और आगमन हवाई अड्डे',
    airportsSub:
      'जिन हवाई अड्डों को यह उड़ान जोड़ती है। निर्देशिका में शामिल हवाई अड्डे अपना पेज खोलते हैं।',
    originAirport: 'प्रस्थान हवाई अड्डा',
    destinationAirport: 'आगमन हवाई अड्डा',
    airportPage: 'हवाई अड्डा पेज खोलें',
    detailsKicker: 'विवरण',
    detailsTitle: 'उड़ान विवरण',
    detailsFlight: 'फ़्लाइट नंबर',
    detailsAirline: 'एयरलाइन',
    detailsOrigin: 'प्रस्थान हवाई अड्डा',
    detailsDestination: 'आगमन हवाई अड्डा',
    detailsDistance: 'सीधी दूरी',
    detailsRoutes: 'सूचीबद्ध मार्ग',
    detailsSnapshot: 'डेटा स्नैपशॉट',
    routesKicker: 'मार्ग',
    routesTitle: 'इस फ़्लाइट नंबर के मार्ग',
    routesSub: (count: string) =>
      `यह नंबर ${count} मार्गों पर आता है; एक नंबर कोडशेयर साझेदार द्वारा दोबारा उपयोग किया जा सकता है।`,
    routesRoute: 'मार्ग',
    routesAirline: 'एयरलाइन',
    routesDistance: 'दूरी',
    relatedKicker: 'संबंधित',
    relatedTitle: 'इस मार्ग की अन्य उड़ानें',
    relatedSub: 'उसी प्रस्थान और आगमन हवाई अड्डे के बीच अन्य फ़्लाइट नंबर।',
    relatedEn: 'और उड़ानें',
    faqKicker: 'सामान्य प्रश्न',
    faqTitle: 'अक्सर पूछे जाने वाले प्रश्न',
    faqEn: 'प्रश्न',
    faqWhat: (number: string) => `उड़ान ${number} क्या है?`,
    faqWhatAnswer: (number: string, airline: string, from: string, to: string, distance: string) =>
      `उड़ान ${number} ${airline} द्वारा ${from} → ${to} मार्ग पर उपयोग किया जाने वाला फ़्लाइट नंबर है${distance ? `, लगभग ${distance} की दूरी पर` : ''}।`,
    faqRoute: (number: string) => `उड़ान ${number} कहां उड़ती है?`,
    faqRouteAnswer: (
      number: string,
      originName: string,
      originIata: string,
      destName: string,
      destIata: string
    ) =>
      `उड़ान ${number} ${originName} (${originIata}) से ${destName} (${destIata}) तक उड़ती है।`,
    faqTimes: (number: string) => `${number} के प्रस्थान और आगमन समय कहां हैं?`,
    faqTimesAnswer: (number: string) =>
      `यह पेज ${number} के फ़्लाइट नंबर, एयरलाइन, मार्ग और हवाई अड्डों को कवर करता है। aviability.com फ़्लाइट इंडेक्स में प्रस्थान या आगमन समय शामिल नहीं हैं — वर्तमान समय-सारणी एयरलाइन या हवाई अड्डे से जांचें।`,
    note: (date: string) =>
      `aviability.com फ़्लाइट इंडेक्स से फ़्लाइट नंबर, एयरलाइन और मार्ग (स्नैपशॉट ${date}); प्रस्थान और आगमन समय शामिल नहीं हैं। स्रोत: `,
    source: 'aviability.com',
    sourceFlight: 'aviability.com पर देखें',
    viewAirport: (iata: string) => `${iata} हवाई अड्डा पेज खोलें`,
    notFound: 'उड़ान नहीं मिली',
  },

  faq: {
    terminalCount: (name: string) => `${name} में कितने टर्मिनल हैं?`,
    terminalCountAnswer: (name: string, iata: string, terminals: string, gates: string, list: string) =>
      `${name} (${iata}) में ${terminals} टर्मिनल हैं, कुल ${gates} गेट के साथ: ${list}।`,
    gateCount: (name: string) => `${name} में कितने गेट हैं?`,
    gateCountAnswer: (name: string, iata: string, gates: string, list: string) =>
      `${name} (${iata}) में कुल ${gates} गेट हैं: ${list}।`,
    whereIs: (iata: string) => `${iata} कहां है?`,
    whereIsAnswer: (iata: string, name: string, nameEn: string, city: string, cityEn: string, country: string) =>
      `${iata} ${name} (${nameEn}) का IATA कोड है, जो ${city}${
        cityEn ? ` (${cityEn})` : ''
      }, ${country} में स्थित है।`,
    distance: (name: string, city: string) => `${name} ${city} के केंद्र से कितना दूर है?`,
    distanceAnswer: (name: string, city: string, distance: string, transit: string) =>
      `${name} ${city} के केंद्र से लगभग ${distance} दूर है। आप ${transit} से शहर पहुंच सकते हैं।`,
    access: (name: string, city: string) => `${name} से ${city} कैसे पहुंचें?`,
    accessAnswer: (options: string) => `${options}।`,
    facilities: (name: string) => `${name} में कौन सी सुविधाएं हैं?`,
    facilitiesAnswer: (name: string, facilities: string) =>
      `${name} में ${facilities} हैं। टर्मिनलों के बीच वितरण के लिए ऊपर टर्मिनल लेआउट देखें।`,
    location: (name: string) => `${name} कहां स्थित है?`,
    locationAnswer: (name: string, nameEn: string, iata: string, city: string, cityEn: string, country: string) =>
      `${name} (${nameEn}, IATA कोड ${iata}) ${city}${
        cityEn ? ` (${cityEn})` : ''
      }, ${country} में स्थित है।`,
    airlines: (name: string) => `${name} पर प्रत्येक टर्मिनल से कौन सी एयरलाइंस संचालित होती हैं?`,
    airlinesAnswer: (name: string, list: string) =>
      `${name} पर टर्मिनल के अनुसार मुख्य एयरलाइंस: ${list}। एयरलाइंस और गेट आवंटन बदलते रहते हैं, इसलिए हमेशा अपना बोर्डिंग पास और हवाई अड्डे के संकेत जांचें।`,
    timezone: (name: string) => `${name} किस समय क्षेत्र में है?`,
    timezoneAnswer: (name: string, iata: string, tz: string) =>
      `${name} (${iata}) ${tz} समय क्षेत्र में है। ऊपर हवाई अड्डा घड़ी से अपने स्थानीय समय से तुलना करें।`,
    flightsCount: (name: string) => `${name} के लिए कितने फ़्लाइट नंबर सूचीबद्ध हैं?`,
    flightsCountAnswer: (
      name: string,
      iata: string,
      departures: string,
      arrivals: string,
      airlines: string,
      destinations: string,
      date: string
    ) =>
      `aviability.com फ़्लाइट इंडेक्स ${name} (${iata}) के लिए ${departures} प्रस्थान फ़्लाइट नंबर और ${arrivals} आगमन फ़्लाइट नंबर सूचीबद्ध करता है, जो ${airlines} एयरलाइंस और ${destinations} गंतव्यों (स्नैपशॉट ${date}) को कवर करते हैं। कोडशेयर नंबर शामिल हैं और समय-सारणी बदल सकती है — यात्रा से पहले एयरलाइन से पुष्टि करें।`,
  },

  editorial: {
    authorName: 'World Airport Maps संपादकीय टीम',
    role: 'संकलित और समीक्षित ',
    sourcesNote: 'सार्वजनिक स्रोतों और आधिकारिक हवाई अड्डा जानकारी से संकलित',
  },

  toc: {
    label: 'इस पेज पर',
    map: 'टर्मिनल मैप',
    photos: 'हवाई अड्डा तस्वीरें',
    time: 'हवाई अड्डा समय',
    details: 'हवाई अड्डा विवरण',
    links: 'संबंधित लिंक',
    location: 'स्थान नक्शा',
    routes: 'मार्ग मैप',
    flights: 'उड़ानें',
    guide: 'हवाई अड्डा गाइड',
    blog: 'संबंधित गाइड',
    terminals: 'टर्मिनल गाइड',
    transport: 'ज़मीनी परिवहन',
    facilities: 'सुविधाएं',
    faq: 'सामान्य प्रश्न',
    flightOverview: 'उड़ान अवलोकन',
    flightRoute: 'मार्ग',
    flightAirports: 'हवाई अड्डे',
    flightDetails: 'उड़ान विवरण',
    flightRoutes: 'सभी मार्ग',
    flightRelated: 'संबंधित उड़ानें',
    intro: 'हवाई अड्डा अवलोकन',
    distribution: 'हवाई अड्डा वितरण',
    airports: 'हवाई अड्डा सूची',
  },

  error: {
    title: 'यह पेज लोड नहीं हो सका',
    sub: 'हवाई अड्डा डेटा पढ़ते समय कुछ गलत हो गया। फिर कोशिश करें या होमपेज पर वापस जाएं।',
    retry: 'फिर कोशिश करें',
    backHome: 'होमपेज पर वापस',
    notFoundTitle: '404 · पेज नहीं मिला',
    notFoundSub: 'अनुरोधित पेज स्थानांतरित या हटाया गया हो सकता है। हवाई अड्डा खोजें या नीचे दिए लिंक से आगे बढ़ें।',
  },

  footer: {
    sponsored: 'प्रायोजित',
    mapsTitle: 'विस्तृत टर्मिनल मैप',
    mapsBody:
      'हवाई अड्डों और उनके टर्मिनलों में रास्ता खोजना चुनौतीपूर्ण हो सकता है। हमारे मैप टर्मिनल, गेट, चेक-इन क्षेत्र, बैगेज क्लेम, दुकानें, रेस्तरां, लाउंज और परिवहन केंद्रों के विस्तृत लेआउट दिखाते हैं, ताकि यात्रा सुचारू हो।',
    plansTitle: 'इंटरैक्टिव टर्मिनल प्लान',
    plansBody:
      'बड़े अंतर्राष्ट्रीय हवाई अड्डों में कई टर्मिनल और जटिल लेआउट होते हैं। हमारे मैप गेट खोजने, सुविधाएं ढूंढने, कनेक्शन की योजना बनाने और सुरक्षा, प्रस्थान और आगमन से कुशलता से गुजरने में मदद करते हैं।',
    transitTitle: 'हवाई अड्डा परिवहन और पहुंच',
    transitBody:
      'टर्मिनल लेआउट के अलावा हम परिवहन विकल्प, पार्किंग और पहुंच मार्ग कवर करते हैं — अपने गेट तक कैसे पहुंचें, टर्मिनलों के बीच कैसे बदलें और ट्रेन, बस, टैक्सी और किराए की कार का उपयोग कैसे करें।',
    stats: (countries: string, airports: string, terminals: string) =>
      `${countries} देश / क्षेत्र · ${airports} हवाई अड्डे · ${terminals} टर्मिनल · सचित्र टर्मिनल लेआउट`,
    fallback: 'दुनिया भर के हवाई अड्डों के सचित्र टर्मिनल लेआउट और परिवहन गाइड',
    linksLabel: 'फ़ुटर नेविगेशन',
    about: 'हमारे बारे में',
    contact: 'संपर्क',
    sources: 'डेटा स्रोत',
    privacy: 'गोपनीयता नीति',
    disclaimer: 'अस्वीकरण',
    terms: 'उपयोग की शर्तें',
  },

  transportModes: hiTransportModes as Record<string, string>,

  categories: {
    kicker: 'ब्राउज़ करें',
    title: 'क्षेत्र के अनुसार ब्राउज़ करें',
    en: 'क्षेत्र के अनुसार ब्राउज़ करें',
    sub: 'निर्देशिका में किसी भी दृष्टिकोण से प्रवेश करें: देश, क्षेत्र, शहर के अनुसार — या सीधे सबसे व्यस्त हब, नवीनतम अपडेट और हवाई अड्डा गाइड पर जाएं।',
    allAirports: {
      title: 'सभी हवाई अड्डे',
      body: 'पूरी निर्देशिका, यात्री मात्रा के अनुसार क्रमबद्ध, देश से फ़िल्टर करने योग्य और दोबारा क्रमबद्ध करने योग्य।',
    },
    byCountry: {
      title: 'देश के अनुसार',
      body: 'देखें कि प्रत्येक देश या क्षेत्र में कितने हवाई अड्डे, टर्मिनल और गेट हैं।',
    },
    byRegion: {
      title: 'क्षेत्र के अनुसार',
      body: 'पूर्वी एशिया, यूरोप, उत्तरी अमेरिका और शेष में समूहित देश।',
    },
    popularCities: {
      title: 'लोकप्रिय शहर',
      body: 'कुल वार्षिक यात्रियों के अनुसार सबसे व्यस्त हवाई अड्डा शहर, और प्रत्येक में सभी हवाई अड्डे।',
    },
    recentlyUpdated: {
      title: 'हाल ही में अपडेट',
      body: 'नए जोड़े गए और संशोधित हवाई अड्डा रिकॉर्ड, सबसे नए पहले।',
    },
    guides: {
      title: 'हवाई अड्डा गाइड',
      body: 'टर्मिनल ट्रांसफर, शहर तक पहुंचने और व्यावहारिक सुझावों पर विस्तृत गाइड।',
    },
    routes: {
      title: 'मार्ग मैप',
      body: 'गंतव्यों की संख्या के अनुसार क्रमबद्ध, एयरलाइंस और दूरियों के साथ किसी हवाई अड्डे का सीधा नेटवर्क देखें।',
    },
  },

  guides: {
    kicker: 'गाइड',
    title: 'हवाई अड्डा गाइड',
    en: 'हवाई अड्डा गाइड',
    sub: 'टर्मिनल आरेखों के अलावा, हमने चुनिंदा हब के लिए विस्तृत गाइड लिखी हैं: गेट नंबरिंग कैसे पढ़ें, टर्मिनलों के बीच कैसे जाएं और शहर कैसे पहुंचें।',
    more: 'यह हवाई अड्डा देखें',
  },

  blog: {
    kicker: 'जर्नल',
    title: 'यात्रा नोट्स',
    nav: 'ब्लॉग',
    en: 'यात्रा नोट्स',
    sub: 'हमारे संपादकीय डेस्क से विस्तृत नोट्स: आगमन और इमिग्रेशन, ट्रांसफर, टर्मिनल सुविधाएं और आराम करने की जगहें।',
    more: 'पढ़ें',
    all: 'सभी लेख',
    morePosts: 'और लेख',
    airportsKicker: 'हवाई अड्डे',
    airportsTitle: 'इस लेख में हवाई अड्डे',
    airportsEn: 'कवर किए गए हवाई अड्डे',
    airportsSub: 'टर्मिनल मैप, ज़मीनी परिवहन और सामान्य प्रश्नों के लिए हवाई अड्डा पेज खोलें।',
    back: 'लेख सूची पर वापस',
    empty: 'अभी कोई लेख नहीं है।',
    readingMinutes: (n: number) => `${n} मिनट पढ़ने का समय`,
    source: (name: string) => `स्रोत: ${name}`,
    tags: 'टैग',
  },

  comments: {
    kicker: 'टिप्पणियां',
    title: 'पाठक टिप्पणियां',
    en: 'चर्चा',
    sub: 'प्रश्न, यात्रा रिपोर्ट और सुधार सभी स्वागत योग्य हैं। टिप्पणियां सार्वजनिक हैं।',
    formTitle: 'टिप्पणी छोड़ें',
    countOne: '1 टिप्पणी',
    countMany: '{n} टिप्पणियां',
    empty: 'अभी कोई टिप्पणी नहीं — पहली लिखें।',
    loading: 'टिप्पणियां लोड हो रही हैं…',
    loadError: 'टिप्पणियां अभी उपलब्ध नहीं हैं।',
    retry: 'फिर कोशिश करें',
    nameLabel: 'नाम',
    namePlaceholder: 'हम आपको कैसे संबोधित करें?',
    bodyLabel: 'टिप्पणी',
    bodyPlaceholder: 'अनुभव साझा करें, प्रश्न पूछें या संदर्भ जोड़ें…',
    submit: 'टिप्पणी पोस्ट करें',
    submitting: 'पोस्ट हो रहा है…',
    success: 'पोस्ट हो गया — साझा करने के लिए धन्यवाद।',
    error: 'टिप्पणी पोस्ट नहीं हो सकी। बाद में फिर कोशिश करें।',
    rateLimited: 'यह बहुत तेज़ था। कुछ मिनट प्रतीक्षा करें और फिर कोशिश करें।',
    nameError: 'कृपया नाम दर्ज करें (2–40 अक्षर)।',
    bodyError: 'कृपया टिप्पणी लिखें (5–2000 अक्षर)।',
    note: 'टिप्पणियां सार्वजनिक हैं और लेखकों के अपने विचार दर्शाती हैं। कृपया शिष्टाचार बनाए रखें और विज्ञापन या व्यक्तिगत जानकारी पोस्ट न करें।',
  },

  terminalMap: {
    ariaLabel: (name: string) => `${name} का टर्मिनल लेआउट`,
    gates: 'गेट',
    terminal: 'टर्मिनल',
    corridor: 'संपर्क',
    transit: 'ज़मीनी परिवहन',
    footer: (iata: string) => `${iata} · टर्मिनल लेआउट`,
  },

  tool: {
    label: 'ऑनलाइन टूल',
    hub: {
      kicker: 'टूल',
      title: 'मैप और निर्देशांक टूल',
      en: 'मुफ़्त टूल',
      sub: 'यात्रियों और भूगोल प्रेमियों के लिए मुफ़्त ऑनलाइन टूल — ब्राउज़र में चलते हैं, कुछ इंस्टॉल नहीं करना।',
      description:
        'मुफ़्त ऑनलाइन मैप और निर्देशांक टूल: WGS84 / GCJ02 / BD09 रूपांतरण, दशमलव डिग्री ↔ DMS और दो बिंदुओं के बीच सीधी दूरी। द्विभाषी, सीधे ब्राउज़र में।',
      comingTitle: 'और टूल विकास में',
      comingSub: 'मैप पर निर्देशांक चुनना, स्थान साझा करना और प्रोजेक्शन कैलकुलेटर जल्द आ रहे हैं।',
    },
    howTitle: 'कैसे उपयोग करें',
    relatedTitle: 'संबंधित टूल',
    allTools: 'सभी टूल',
    tools: {
      coordinateConverter: {
        title: 'निर्देशांक कनवर्टर',
        en: 'निर्देशांक कनवर्टर',
        description:
          'WGS84, GCJ02 और BD09 के बीच बदलें — चीन में मैप ऑफ़सेट समस्या का समाधान।',
        note: 'WGS84 जीपीएस और अंतर्राष्ट्रीय मानक है। GCJ02 मुख्य भूमि चीन में आवश्यक ऑफ़सेट समन्वय प्रणाली है (जिसे "मंगल निर्देशांक" कहा जाता है), जिसका उपयोग AMap और Tencent Maps करते हैं। BD09 GCJ02 के ऊपर और ऑफ़सेट जोड़ता है और Baidu Maps द्वारा उपयोग किया जाता है। एक ही स्थान प्रणालियों के बीच 100–700 मीटर तक भिन्न हो सकता है, इसलिए किसी अन्य मैप सेवा में निर्देशांक दोबारा उपयोग करने से पहले बदलें।',
        steps: [
          'दशमलव निर्देशांक अक्षांश, देशांतर के रूप में दर्ज करें — जैसे 39.9042, 116.4074।',
          'अपने इनपुट की समन्वय प्रणाली चुनें।',
          'अन्य दो प्रणालियों के लिए "बदलें" दबाएं; परिणाम सहेजने के लिए "कॉपी" का उपयोग करें।',
        ],
        inputLabel: 'निर्देशांक (अक्षांश, देशांतर)',
        inputPlaceholder: 'जैसे 39.9042, 116.4074',
        sourceLabel: 'इनपुट समन्वय प्रणाली',
        wgs84: 'WGS84 · जीपीएस / अंतर्राष्ट्रीय',
        gcj02: 'GCJ02 · AMap / Tencent',
        bd09: 'BD09 · Baidu',
        precisionLabel: 'दशमलव स्थान',
        submit: 'बदलें',
        copy: 'कॉपी',
        copied: 'कॉपी हो गया',
        error: 'निर्देशांक पढ़े नहीं जा सके। "अक्षांश, देशांतर" प्रारूप का उपयोग करें, जैसे 39.9042, 116.4074।',
      },
      dmsConverter: {
        title: 'निर्देशांक प्रारूप कनवर्टर',
        en: 'निर्देशांक प्रारूप कनवर्टर',
        description:
          'दशमलव डिग्री (DD), डिग्री-मिनट (DM) और डिग्री-मिनट-सेकंड (DMS) के बीच बदलें; इनपुट प्रारूप स्वतः पहचाना जाता है।',
        note: 'DD (39.9042°) डिवाइस और API द्वारा उपयोग किया जाने वाला सामान्य दशमलव प्रारूप है; DMS (39°54′15″N) समुद्री, विमानन और सर्वेक्षण में सामान्य है; DM (39°54.25′N) फ़ील्ड रिकॉर्ड के लिए विशिष्ट है। टूल प्रत्येक आधे भाग में संख्या समूहों की गिनती (1 = DD, 2 = DM, 3 = DMS) से इनपुट प्रारूप पहचानता है और तीनों प्रारूप आउटपुट करता है, गोलार्धों के लिए N/S/E/W के साथ।',
        steps: [
          'निर्देशांक की एक जोड़ी दर्ज करें — 39.9042, 39°54′15″N और 39°32.5′E सभी काम करते हैं; दोनों भागों को कॉमा से अलग करें।',
          'आउटपुट के लिए दशमलव स्थानों की संख्या चुनें।',
          '"बदलें" दबाएं — तीनों प्रारूप सूचीबद्ध होते हैं; एक सहेजने के लिए "कॉपी" का उपयोग करें।',
        ],
        inputLabel: 'निर्देशांक (एक जोड़ी, कॉमा से अलग)',
        inputPlaceholder: 'जैसे 39°54′15″N, 116°24′51″E या 39.9042, 116.4074',
        precisionLabel: 'दशमलव स्थान',
        submit: 'बदलें',
        ddLabel: 'दशमलव डिग्री (DD)',
        dmLabel: 'डिग्री-मिनट (DM)',
        dmsLabel: 'डिग्री-मिनट-सेकंड (DMS)',
        copy: 'कॉपी',
        copied: 'कॉपी हो गया',
        error: 'निर्देशांक पढ़े नहीं जा सके। समर्थित प्रारूपों में 39.9042, 39°54′15″N और 39°32.5′E शामिल हैं, कॉमा से अलग।',
      },
      distanceCalculator: {
        title: 'दूरी कैलकुलेटर',
        en: 'दूरी कैलकुलेटर',
        description:
          'पृथ्वी पर दो बिंदुओं के बीच सीधी दूरी, साथ ही प्रारंभिक दिगंश।',
        note: 'दूरी हावरसाइन महावृत्त सूत्र (पृथ्वी की औसत त्रिज्या 6,371.0088 किमी) का उपयोग करती है — सतह के साथ सबसे छोटा रास्ता। प्रारंभिक दिगंश पहले बिंदु से दूसरे की ओर कम्पास दिशा है, उत्तर पर 0° और दक्षिणावर्त बढ़ता हुआ।',
        steps: [
          'प्रारंभ और अंत बिंदु का अक्षांश और देशांतर दर्ज करें।',
          '"दूरी की गणना करें" दबाएं।',
          'किलोमीटर, मील और नॉटिकल मील में परिणाम, साथ ही प्रारंभिक दिगंश प्राप्त करें।',
        ],
        fromLabel: 'से',
        toLabel: 'तक',
        inputPlaceholder: 'अक्षांश, देशांतर',
        example: 'उदाहरण: बीजिंग → शंघाई',
        submit: 'दूरी की गणना करें',
        km: 'किमी',
        mi: 'मील',
        nmi: 'नॉटिकल मील',
        bearing: 'प्रारंभिक दिगंश',
        copy: 'कॉपी',
        copied: 'कॉपी हो गया',
        error: 'निर्देशांक पढ़े नहीं जा सके। "अक्षांश, देशांतर" प्रारूप का उपयोग करें, अक्षांश -90–90 और देशांतर -180–180 के साथ।',
      },
    },
  },
};
