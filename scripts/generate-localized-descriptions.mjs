/**
 * Data-driven airport descriptions for the eight locales that still have no
 * `airport_translations` rows (es, pt, ja, id, vi, ru, tr, th).
 *
 * Output is a `{ "<IATA>": "<text>" }` JSON file for
 * scripts/import-airport-descriptions.mjs — the same shape the editorial
 * translation batches use. Text comes only from the repository's data
 * (curated records, directory records and compiled facts), like
 * scripts/_de.mjs; each value ends with an HTML comment marking it generated,
 * so a later editorial translation can replace it without ambiguity.
 *
 * Usage:
 *   node scripts/generate-localized-descriptions.mjs --locale es
 *   node scripts/import-airport-descriptions.mjs --locale es --file content/translation-work/es-descriptions.json
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import pg from 'pg';
import { databaseUrl, ROOT } from './_env.mjs';

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.findIndex((a) => a === name || a.startsWith(`${name}=`));
  if (i < 0) return null;
  return args[i].includes('=') ? args[i].slice(args[i].indexOf('=') + 1) : args[i + 1] ?? null;
};
const LOCALE = flag('--locale');
const LOCALES = ['es', 'pt', 'ja', 'id', 'vi', 'ru', 'tr', 'th', 'nl', 'sv', 'pl', 'cs', 'ro', 'uk', 'hi', 'bn', 'sw'];
if (!LOCALES.includes(LOCALE)) {
  console.error(`--locale must be one of ${LOCALES.join(', ')}`);
  process.exit(1);
}

const read = (p) => JSON.parse(readFileSync(join(ROOT, p), 'utf8'));
const vocab = read(`lib/i18n/${LOCALE}-vocab.json`);
const translate = (table) => (value) => table[value] ?? value;
const countryName = translate(vocab.countries);
const cityName = translate(vocab.cities);
const airportName = translate(vocab.airports);
const kindName = (kind) => vocab.airportKinds[kind] ?? vocab.airportKinds.small;

const legacy = read('scripts/legacy-data.json');
const directory = read('scripts/directory-data.json');
const facts = read('lib/airport-facts.json').airports;
const curated = new Map(legacy.airports.map((a) => [a.iata, a]));

const MODE_NOUN = {
  es: { train: 'tren', tram: 'tranvía', bus: 'autobús', taxi: 'taxi', car: 'coche', ferry: 'ferry' },
  pt: { train: 'trem', tram: 'elétrico', bus: 'ônibus', taxi: 'táxi', car: 'carro', ferry: 'balsa' },
  ja: { train: '鉄道', tram: '路面電車', bus: 'バス', taxi: 'タクシー', car: '車', ferry: 'フェリー' },
  id: { train: 'kereta', tram: 'trem', bus: 'bus', taxi: 'taksi', car: 'mobil', ferry: 'feri' },
  vi: { train: 'tàu', tram: 'tàu điện', bus: 'xe buýt', taxi: 'taxi', car: 'ô tô', ferry: 'phà' },
  ru: { train: 'поезд', tram: 'трамвай', bus: 'автобус', taxi: 'такси', car: 'автомобиль', ferry: 'паром' },
  tr: { train: 'tren', tram: 'tramvay', bus: 'otobüs', taxi: 'taksi', car: 'araç', ferry: 'feribot' },
  th: { train: 'รถไฟ', tram: 'รถราง', bus: 'รถบัส', taxi: 'แท็กซี่', car: 'รถยนต์', ferry: 'เรือเฟอร์รี' },
  nl: { train: 'trein', tram: 'tram', bus: 'bus', taxi: 'taxi', car: 'auto', ferry: 'veerboot' },
  sv: { train: 'tåg', tram: 'spårvagn', bus: 'buss', taxi: 'taxi', car: 'bil', ferry: 'färja' },
  pl: { train: 'pociąg', tram: 'tramwaj', bus: 'autobus', taxi: 'taksówka', car: 'samochód', ferry: 'prom' },
  cs: { train: 'vlak', tram: 'tramvaj', bus: 'autobus', taxi: 'taxi', car: 'auto', ferry: 'trajekt' },
  ro: { train: 'tren', tram: 'tramvai', bus: 'autobuz', taxi: 'taxi', car: 'mașină', ferry: 'feribot' },
  uk: { train: 'потяг', tram: 'трамвай', bus: 'автобус', taxi: 'таксі', car: 'авто', ferry: 'пором' },
  hi: { train: 'ट्रेन', tram: 'ट्राम', bus: 'बस', taxi: 'टैक्सी', car: 'कार', ferry: 'फ़ेरी' },
  bn: { train: 'ট্রেন', tram: 'ট্রাম', bus: 'বাস', taxi: 'ট্যাক্সি', car: 'গাড়ি', ferry: 'ফেরি' },
  sw: { train: 'treni', tram: 'tramu', bus: 'basi', taxi: 'teksi', car: 'gari', ferry: 'feri' },
}[LOCALE];

const NUM_TAG = {
  es: 'es-ES', pt: 'pt-BR', ja: 'ja-JP', id: 'id-ID', vi: 'vi-VN', ru: 'ru-RU', tr: 'tr-TR', th: 'th-TH',
  nl: 'nl-NL', sv: 'sv-SE', pl: 'pl-PL', cs: 'cs-CZ', ro: 'ro-RO', uk: 'uk-UA', hi: 'hi-IN', bn: 'bn-BD', sw: 'sw-TZ',
}[LOCALE];
const num = (value) => {
  const n = typeof value === 'string' ? Number(value) : value;
  if (n == null || !Number.isFinite(n)) return '—';
  return new Intl.NumberFormat(NUM_TAG, { maximumFractionDigits: 2 }).format(n);
};

function paxText(millions) {
  if (millions == null || !Number.isFinite(millions)) return null;
  const r = Number(millions.toFixed(2));
  if (LOCALE === 'es') return `unos ${num(r)} ${r === 1 ? 'millón' : 'millones'}`;
  if (LOCALE === 'pt') return `cerca de ${num(r)} ${r === 1 ? 'milhão' : 'milhões'}`;
  if (LOCALE === 'id') return `sekitar ${num(r)} juta`;
  if (LOCALE === 'vi') return `khoảng ${num(r)} triệu`;
  if (LOCALE === 'tr') return `yaklaşık ${num(r)} milyon`;
  if (LOCALE === 'th') return `ประมาณ ${num(r)} ล้าน`;
  if (LOCALE === 'nl') return `ongeveer ${num(r)} miljoen`;
  if (LOCALE === 'sv') return `cirka ${num(r)} ${r === 1 ? 'miljon' : 'miljoner'}`;
  if (LOCALE === 'sw') return `takriban milioni ${num(r)}`;
  if (LOCALE === 'hi') {
    if (r >= 10) return `लगभग ${num(r / 10)} करोड़`;
    return `लगभग ${num(r * 10)} लाख`;
  }
  if (LOCALE === 'bn') {
    if (r >= 10) return `প্রায় ${num(r / 10)} কোটি`;
    return `প্রায় ${num(r * 10)} লাখ`;
  }
  if (LOCALE === 'pl' || LOCALE === 'cs' || LOCALE === 'uk') {
    const abs = Math.abs(r);
    const mod10 = Math.round(abs) % 10;
    const mod100 = Math.round(abs) % 100;
    const forms = {
      pl: ['milion', 'miliony', 'milionów'],
      cs: ['milion', 'miliony', 'milionů'],
      uk: ['мільйон', 'мільйони', 'мільйонів'],
    }[LOCALE];
    const singular = LOCALE === 'uk' ? abs === 1 || (mod10 === 1 && mod100 !== 11) : abs === 1;
    const noun = singular
      ? forms[0]
      : mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)
        ? forms[1]
        : forms[2];
    const prefix = { pl: 'około', cs: 'přibližně', uk: 'приблизно' }[LOCALE];
    return `${prefix} ${num(r)} ${noun}`;
  }
  if (LOCALE === 'ro') {
    const abs = Math.abs(r);
    const mod100 = Math.round(abs) % 100;
    const noun = abs === 1 || mod100 === 1 ? 'milion' : abs < 20 ? 'milioane' : 'de milioane';
    return `aproximativ ${num(r)} ${noun}`;
  }
  if (LOCALE === 'ja') {
    if (r >= 100) {
      const oku = Math.floor(r / 100);
      const man = Math.round((r - oku * 100) * 100);
      return man > 0 ? `約${oku}億${num(man)}万人` : `約${oku}億人`;
    }
    return `約${num(Math.round(r * 100))}万人`;
  }
  const abs = Math.abs(r);
  const mod10 = Math.round(abs) % 10;
  const mod100 = Math.round(abs) % 100;
  const noun =
    abs === 1 || (mod10 === 1 && mod100 !== 11)
      ? 'миллион'
      : !Number.isInteger(abs)
        ? 'миллиона'
        : mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)
          ? 'миллиона'
          : 'миллионов';
  return `около ${num(r)} ${noun}`;
}

function listText(items) {
  if (!items.length) return '';
  if (items.length === 1) return items[0];
  if (LOCALE === 'ja') return items.join('、');
  if (LOCALE === 'es') return `${items.slice(0, -1).join(', ')} y ${items.at(-1)}`;
  if (LOCALE === 'pt') return `${items.slice(0, -1).join(', ')} e ${items.at(-1)}`;
  if (LOCALE === 'id') return `${items.slice(0, -1).join(', ')}, dan ${items.at(-1)}`;
  if (LOCALE === 'vi') return `${items.slice(0, -1).join(', ')} và ${items.at(-1)}`;
  if (LOCALE === 'ru') return `${items.slice(0, -1).join(', ')} и ${items.at(-1)}`;
  if (LOCALE === 'tr') return `${items.slice(0, -1).join(', ')} ve ${items.at(-1)}`;
  if (LOCALE === 'nl') return `${items.slice(0, -1).join(', ')} en ${items.at(-1)}`;
  if (LOCALE === 'sv') return `${items.slice(0, -1).join(', ')} och ${items.at(-1)}`;
  if (LOCALE === 'pl') return `${items.slice(0, -1).join(', ')} i ${items.at(-1)}`;
  if (LOCALE === 'cs') return `${items.slice(0, -1).join(', ')} a ${items.at(-1)}`;
  if (LOCALE === 'ro') return `${items.slice(0, -1).join(', ')} și ${items.at(-1)}`;
  if (LOCALE === 'uk') return `${items.slice(0, -1).join(', ')} і ${items.at(-1)}`;
  if (LOCALE === 'hi') return `${items.slice(0, -1).join(', ')} और ${items.at(-1)}`;
  if (LOCALE === 'bn') return `${items.slice(0, -1).join(', ')} এবং ${items.at(-1)}`;
  if (LOCALE === 'sw') return `${items.slice(0, -1).join(', ')} na ${items.at(-1)}`;
  return `${items.slice(0, -1).join(', ')} และ ${items.at(-1)}`;
}

function plural(kind, n) {
  if (LOCALE === 'es') {
    if (kind === 'terminal') return `${num(n)} ${n === 1 ? 'terminal' : 'terminales'}`;
    return `${num(n)} ${n === 1 ? 'puerta' : 'puertas'}`;
  }
  if (LOCALE === 'pt') {
    if (kind === 'terminal') return `${num(n)} ${n === 1 ? 'terminal' : 'terminais'}`;
    return `${num(n)} ${n === 1 ? 'portão' : 'portões'}`;
  }
  if (LOCALE === 'ja') return `${num(n)}${kind === 'terminal' ? '棟' : 'か所'}`;
  if (LOCALE === 'id') return `${num(n)} ${kind === 'terminal' ? 'terminal' : 'gerbang'}`;
  if (LOCALE === 'vi') return `${num(n)} ${kind === 'terminal' ? 'nhà ga' : 'cổng'}`;
  if (LOCALE === 'tr') return `${num(n)} ${kind === 'terminal' ? 'terminal' : 'kapı'}`;
  if (LOCALE === 'th') return `${num(n)} ${kind === 'terminal' ? 'แห่ง' : 'ประตู'}`;
  if (LOCALE === 'nl') return `${num(n)} ${kind === 'terminal' ? (n === 1 ? 'terminal' : 'terminals') : n === 1 ? 'gate' : 'gates'}`;
  if (LOCALE === 'sv') return `${num(n)} ${kind === 'terminal' ? (n === 1 ? 'terminal' : 'terminaler') : n === 1 ? 'gate' : 'gates'}`;
  if (LOCALE === 'hi') return `${num(n)} ${kind === 'terminal' ? 'टर्मिनल' : 'गेट'}`;
  if (LOCALE === 'bn') return `${num(n)} ${kind === 'terminal' ? 'টার্মিনাল' : 'গেট'}`;
  if (LOCALE === 'sw') return `${num(n)} ${kind === 'terminal' ? 'terminali' : 'malango'}`;
  if (LOCALE === 'pl' || LOCALE === 'cs' || LOCALE === 'uk') {
    const abs = Math.abs(n);
    const mod10 = abs % 10;
    const mod100 = abs % 100;
    const forms = {
      pl: kind === 'terminal' ? ['terminal', 'terminale', 'terminali'] : ['brama', 'bramy', 'bram'],
      cs: kind === 'terminal' ? ['terminál', 'terminály', 'terminálů'] : ['brána', 'brány', 'bran'],
      uk: kind === 'terminal' ? ['термінал', 'термінали', 'терміналів'] : ['вихід', 'виходи', 'виходів'],
    }[LOCALE];
    const singular = LOCALE === 'uk' ? abs === 1 || (mod10 === 1 && mod100 !== 11) : abs === 1;
    const noun = singular
      ? forms[0]
      : mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)
        ? forms[1]
        : forms[2];
    return `${num(n)} ${noun}`;
  }
  if (LOCALE === 'ro') {
    const abs = Math.abs(n);
    const mod100 = abs % 100;
    const forms = kind === 'terminal' ? ['terminal', 'terminale', 'de terminale'] : ['poartă', 'porți', 'de porți'];
    const noun = abs === 1 || (mod100 === 1 && abs !== 1) ? forms[0] : abs < 20 ? forms[1] : forms[2];
    return `${num(n)} ${noun}`;
  }
  // ru
  const abs = Math.abs(n);
  const mod10 = abs % 10;
  const mod100 = abs % 100;
  const forms =
    kind === 'terminal' ? ['терминал', 'терминала', 'терминалов'] : ['выход', 'выхода', 'выходов'];
  const noun =
    abs === 1
      ? forms[0]
      : mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)
        ? forms[1]
        : forms[2];
  return `${num(n)} ${noun}`;
}

const parsePax = (text) => {
  const m = /约\s*([\d.]+)\s*(亿|万)/.exec(text ?? '');
  if (!m) return null;
  const n = Number(m[1]);
  return m[2] === '亿' ? Number((n * 100).toFixed(2)) : Number((n / 100).toFixed(2));
};
const parseDistance = (text) => {
  const m = /([\d.]+)\s*km/i.exec(text ?? '');
  return m ? Number(m[1]) : null;
};

function curatedText(a, country) {
  const name = airportName(a.nameEn);
  const city = cityName(a.cityEn ?? '') || a.cityEn;
  const terminals = a.terminals?.length ?? 0;
  const gates = a.gates ?? 0;
  const paxM = parsePax(a.pax);
  const distanceKm = parseDistance(a.distance);
  const pax = paxText(paxM);
  const transit = [
    ...new Set((a.transit ?? []).map((t) => MODE_NOUN[t.icon] ?? vocab.transportModes[t.icon] ?? t.icon)),
  ];
  const t = listText(transit);
  const place = `${city}${country ? (LOCALE === 'ja' ? `、${country}` : `, ${country}`) : ''}`;
  const dist = distanceKm != null ? num(distanceKm) : null;

  if (LOCALE === 'es') {
    return [
      `${name} (${a.iata}) atiende ${place}.`,
      `Tiene ${plural('terminal', terminals)} con ${plural('gate', gates)} en total${pax ? ` y mueve ${pax} de pasajeros al año` : ''}.`,
      dist ? `Está a ${dist} km del centro.` : null,
      t ? `Transporte a la ciudad: ${t}.` : null,
    ].filter(Boolean).join(' ');
  }
  if (LOCALE === 'pt') {
    return [
      `${name} (${a.iata}) atende ${place}.`,
      `Tem ${plural('terminal', terminals)} com ${plural('gate', gates)} no total${pax ? ` e movimenta ${pax} de passageiros por ano` : ''}.`,
      dist ? `Fica a ${dist} km do centro.` : null,
      t ? `Transporte até a cidade: ${t}.` : null,
    ].filter(Boolean).join(' ');
  }
  if (LOCALE === 'ja') {
    return [
      `${name}（${a.iata}）は${place}を担っています。`,
      `ターミナル${plural('terminal', terminals)}、ゲート${plural('gate', gates)}${pax ? `、年間旅客数${pax}` : ''}。`,
      dist ? `市街中心部から約${dist} km。` : null,
      t ? `市内への交通：${t}。` : null,
    ].filter(Boolean).join(' ');
  }
  if (LOCALE === 'id') {
    return [
      `${name} (${a.iata}) melayani ${place}.`,
      `Bandara ini memiliki ${plural('terminal', terminals)} dengan total ${plural('gate', gates)}${pax ? ` dan melayani ${pax} penumpang per tahun` : ''}.`,
      dist ? `Jaraknya sekitar ${dist} km dari pusat kota.` : null,
      t ? `Transportasi darat ke kota: ${t}.` : null,
    ].filter(Boolean).join(' ');
  }
  if (LOCALE === 'vi') {
    return [
      `${name} (${a.iata}) phục vụ ${place}.`,
      `Sân bay có ${plural('terminal', terminals)} với tổng cộng ${plural('gate', gates)}${pax ? ` và đón ${pax} hành khách mỗi năm` : ''}.`,
      dist ? `Cách trung tâm thành phố khoảng ${dist} km.` : null,
      t ? `Giao thông vào thành phố: ${t}.` : null,
    ].filter(Boolean).join(' ');
  }
  if (LOCALE === 'ru') {
    return [
      `${name} (${a.iata}) обслуживает ${place}.`,
      `В аэропорту ${plural('terminal', terminals)} и ${plural('gate', gates)}${pax ? `; в год — ${pax} пассажиров` : ''}.`,
      dist ? `До центра города — ${dist} км.` : null,
      t ? `Наземный транспорт в город: ${t}.` : null,
    ].filter(Boolean).join(' ');
  }
  if (LOCALE === 'nl') {
    return [
      `${name} (${a.iata}) bedient ${place}.`,
      `De luchthaven heeft ${plural('terminal', terminals)} met in totaal ${plural('gate', gates)}${pax ? ` en verwerkt ${pax} passagiers per jaar` : ''}.`,
      dist ? `Hij ligt ${dist} km van het stadscentrum.` : null,
      t ? `Grondvervoer naar de stad: ${t}.` : null,
    ].filter(Boolean).join(' ');
  }
  if (LOCALE === 'sv') {
    return [
      `${name} (${a.iata}) betjänar ${place}.`,
      `Flygplatsen har ${plural('terminal', terminals)} med totalt ${plural('gate', gates)}${pax ? ` och tar emot ${pax} passagerare per år` : ''}.`,
      dist ? `Den ligger ${dist} km från stadskärnan.` : null,
      t ? `Marktransport till staden: ${t}.` : null,
    ].filter(Boolean).join(' ');
  }
  if (LOCALE === 'pl') {
    return [
      `${name} (${a.iata}) obsługuje ${place}.`,
      `Lotnisko ma ${plural('terminal', terminals)} i łącznie ${plural('gate', gates)}${pax ? ` oraz obsługuje ${pax} pasażerów rocznie` : ''}.`,
      dist ? `Leży ${dist} km od centrum.` : null,
      t ? `Transport naziemny do miasta: ${t}.` : null,
    ].filter(Boolean).join(' ');
  }
  if (LOCALE === 'cs') {
    return [
      `${name} (${a.iata}) obsluhuje ${place}.`,
      `Letiště má ${plural('terminal', terminals)} a celkem ${plural('gate', gates)}${pax ? ` a ročně odbaví ${pax} cestujících` : ''}.`,
      dist ? `Leží ${dist} km od centra.` : null,
      t ? `Pozemní doprava do města: ${t}.` : null,
    ].filter(Boolean).join(' ');
  }
  if (LOCALE === 'ro') {
    return [
      `${name} (${a.iata}) deservește ${place}.`,
      `Aeroportul are ${plural('terminal', terminals)} și ${plural('gate', gates)} în total${pax ? ` și deservește ${pax} de pasageri pe an` : ''}.`,
      dist ? `Se află la ${dist} km de centru.` : null,
      t ? `Transport terestru în oraș: ${t}.` : null,
    ].filter(Boolean).join(' ');
  }
  if (LOCALE === 'uk') {
    return [
      `${name} (${a.iata}) обслуговує ${place}.`,
      `Аеропорт має ${plural('terminal', terminals)} і ${plural('gate', gates)}${pax ? ` та обслуговує ${pax} пасажирів на рік` : ''}.`,
      dist ? `Він за ${dist} км від центру.` : null,
      t ? `Наземний транспорт до міста: ${t}.` : null,
    ].filter(Boolean).join(' ');
  }
  if (LOCALE === 'hi') {
    return [
      `${name} (${a.iata}) ${place} को सेवा देता है।`,
      `इसमें ${plural('terminal', terminals)} और कुल ${plural('gate', gates)}${pax ? ` हैं, सालाना ${pax} यात्री` : ''}।`,
      dist ? `यह शहर के केंद्र से ${dist} km दूर है।` : null,
      t ? `शहर तक भूमि परिवहन: ${t}।` : null,
    ].filter(Boolean).join(' ');
  }
  if (LOCALE === 'bn') {
    return [
      `${name} (${a.iata}) ${place}-কে সেবা দেয়।`,
      `এতে ${plural('terminal', terminals)} ও মোট ${plural('gate', gates)}${pax ? ` আছে, বছরে ${pax} যাত্রী` : ''}।`,
      dist ? `এটি নগরকেন্দ্র থেকে ${dist} km দূরে।` : null,
      t ? `শহরে ভূমি পরিবহন: ${t}।` : null,
    ].filter(Boolean).join(' ');
  }
  if (LOCALE === 'sw') {
    return [
      `${name} (${a.iata}) huhudumia ${place}.`,
      `Uwanja una ${plural('terminal', terminals)} na jumla ya ${plural('gate', gates)}${pax ? ` na huhudumia ${pax} abiria kwa mwaka` : ''}.`,
      dist ? `Uko kilomita ${dist} kutoka katikati ya mji.` : null,
      t ? `Usafiri wa ardhini hadi mjini: ${t}.` : null,
    ].filter(Boolean).join(' ');
  }
  if (LOCALE === 'tr') {
    return [
      `${name} (${a.iata}), ${place} kentine hizmet verir.`,
      `Havalimanında ${plural('terminal', terminals)} ve toplam ${plural('gate', gates)} bulunur${pax ? `; yılda ${pax} yolcu ağırlar` : ''}.`,
      dist ? `Şehir merkezine yaklaşık ${dist} km uzaklıktadır.` : null,
      t ? `Şehre ulaşım: ${t}.` : null,
    ].filter(Boolean).join(' ');
  }
  return [
    `${name} (${a.iata}) ให้บริการ ${place}`,
    `มีอาคารผู้โดยสาร ${plural('terminal', terminals)} และประตูขึ้นเครื่องรวม ${plural('gate', gates)}${pax ? ` รองรับผู้โดยสาร ${pax} ต่อปี` : ''}`,
    dist ? `ห่างจากใจกลางเมืองประมาณ ${dist} km` : null,
    t ? `การเดินทางเข้าตัวเมือง: ${t}` : null,
  ].filter(Boolean).join(' ') + '.';
}

function directoryText(a, country) {
  const name = airportName(a.nameEn ?? a.name);
  const city = cityName(a.cityEn ?? '') || a.cityEn;
  const kind = kindName(a.kind ?? 'small');
  const f = facts[a.iata];
  const elev = typeof f?.elevFt === 'number' ? Math.round(f.elevFt * 0.3048) : null;
  const place = `${city}${country ? (LOCALE === 'ja' ? `、${country}` : `, ${country}`) : ''}`;
  const scheduled = f?.scheduled;

  if (LOCALE === 'es') {
    return `${name} es un ${kind} en ${place}${elev != null ? `, a unos ${elev} m de altitud` : ''}. ${scheduled === false ? 'No tiene servicio regular de pasajeros en la actualidad.' : 'Tiene servicio regular de pasajeros.'} Esta página reúne el mapa de ubicación, los códigos de aeropuerto y la información de viaje.`;
  }
  if (LOCALE === 'pt') {
    return `${name} é um ${kind} em ${place}${elev != null ? `, a cerca de ${elev} m de altitude` : ''}. ${scheduled === false ? 'Não tem serviço regular de passageiros atualmente.' : 'Tem serviço regular de passageiros.'} Esta página reúne o mapa de localização, os códigos do aeroporto e as informações de viagem.`;
  }
  if (LOCALE === 'ja') {
    return `${name}は${place}にある${kind}です${elev != null ? `（標高約${elev} m）` : ''}。${scheduled === false ? '現在は定期旅客便がありません。' : '定期旅客便があります。'}このページは位置図、空港コード、旅行情報をまとめています。`;
  }
  if (LOCALE === 'id') {
    return `${name} adalah ${kind} di ${place}${elev != null ? `, sekitar ${elev} m di atas permukaan laut` : ''}. ${scheduled === false ? 'Saat ini tidak ada layanan penumpang terjadwal.' : 'Ada layanan penumpang terjadwal.'} Halaman ini merangkum peta lokasi, kode bandara, dan informasi perjalanan.`;
  }
  if (LOCALE === 'vi') {
    return `${name} là ${kind} ở ${place}${elev != null ? `, cao khoảng ${elev} m` : ''}. ${scheduled === false ? 'Hiện không có dịch vụ hành khách theo lịch.' : 'Có dịch vụ hành khách theo lịch.'} Trang này tổng hợp bản đồ vị trí, mã sân bay và thông tin du lịch.`;
  }
  if (LOCALE === 'ru') {
    return `${name} — ${kind} в ${place}${elev != null ? `, на высоте около ${elev} м` : ''}. ${scheduled === false ? 'Регулярного пассажирского сообщения сейчас нет.' : 'Есть регулярное пассажирское сообщение.'} Эта страница объединяет карту расположения, коды аэропорта и туристическую информацию.`;
  }
  if (LOCALE === 'tr') {
    return `${name} — ${place}${elev != null ? `, yaklaşık ${elev} m rakımda` : ''} — ${kind}. ${scheduled === false ? 'Şu anda tarifeli yolcu seferi yok.' : 'Tarifeli yolcu seferi var.'} Bu sayfa konum haritasını, havalimanı kodlarını ve seyahat bilgilerini bir araya getirir.`;
  }
  if (LOCALE === 'nl') {
    return `${name} is een ${kind} in ${place}${elev != null ? `, ongeveer ${elev} m boven zeeniveau` : ''}. ${scheduled === false ? 'Er is momenteel geen regelmatige passagiersdienst.' : 'Er is regelmatige passagiersdienst.'} Deze pagina bundelt de locatiekaart, de luchthavencodes en reisinformatie.`;
  }
  if (LOCALE === 'sv') {
    return `${name} är en ${kind} i ${place}${elev != null ? `, cirka ${elev} m över havet` : ''}. ${scheduled === false ? 'Det finns för närvarande ingen regelbunden passagerartrafik.' : 'Det finns regelbunden passagerartrafik.'} Sidan samlar lägeskartan, flygplatskoderna och reseinformation.`;
  }
  if (LOCALE === 'pl') {
    return `${name} to ${kind} w ${place}${elev != null ? `, na wysokości około ${elev} m` : ''}. ${scheduled === false ? 'Obecnie nie ma regularnego ruchu pasażerskiego.' : 'Jest regularny ruch pasażerski.'} Strona zbiera mapę lokalizacji, kody lotniska i informacje podróżne.`;
  }
  if (LOCALE === 'cs') {
    return `${name} je ${kind} v ${place}${elev != null ? `, v nadmořské výšce asi ${elev} m` : ''}. ${scheduled === false ? 'Nyní zde není pravidelný osobní provoz.' : 'Je zde pravidelný osobní provoz.'} Stránka shrnuje mapu polohy, kódy letiště a cestovní informace.`;
  }
  if (LOCALE === 'ro') {
    return `${name} este ${kind} în ${place}${elev != null ? `, la aproximativ ${elev} m altitudine` : ''}. ${scheduled === false ? 'Momentan nu există trafic regulat de pasageri.' : 'Există trafic regulat de pasageri.'} Pagina reunește harta locației, codurile aeroportului și informații de călătorie.`;
  }
  if (LOCALE === 'uk') {
    return `${name} — ${kind} у ${place}${elev != null ? `, на висоті близько ${elev} м` : ''}. ${scheduled === false ? 'Регулярного пасажирського сполучення зараз немає.' : 'Є регулярне пасажирське сполучення.'} Сторінка збирає карту розташування, коди аеропорту й туристичну інформацію.`;
  }
  if (LOCALE === 'hi') {
    return `${name} ${place} में एक ${kind} है${elev != null ? `, लगभग ${elev} m की ऊंचाई पर` : ''}। ${scheduled === false ? 'अभी नियमित यात्री सेवा नहीं है।' : 'नियमित यात्री सेवा है।'} यह पेज स्थान मैप, हवाई अड्डा कोड और यात्रा जानकारी एकत्र करता है।`;
  }
  if (LOCALE === 'bn') {
    return `${name} ${place}-এ একটি ${kind}${elev != null ? `, প্রায় ${elev} m উচ্চতায়` : ''}। ${scheduled === false ? 'এখন নিয়মিত যাত্রী সেবা নেই।' : 'নিয়মিত যাত্রী সেবা আছে।'} এই পৃষ্ঠা অবস্থান মানচিত্র, বিমানবন্দর কোড ও ভ্রমণ তথ্য একত্র করে।`;
  }
  if (LOCALE === 'sw') {
    return `${name} ni ${kind} huko ${place}${elev != null ? `, takriban mita ${elev} juu ya usawa wa bahari` : ''}. ${scheduled === false ? 'Kwa sasa hakuna huduma ya kawaida ya abiria.' : 'Kuna huduma ya kawaida ya abiria.'} Ukurasa unakusanya ramani ya mahali, misimbo ya uwanja na taarifa za safari.`;
  }
  return `${name} เป็น${kind}ใน ${place}${elev != null ? ` สูงประมาณ ${elev} ม. ` : ' '}${scheduled === false ? 'ปัจจุบันไม่มีเที่ยวบินผู้โดยสารตามกำหนด' : 'มีเที่ยวบินผู้โดยสารตามกำหนด'} หน้านี้รวบรวมแผนที่ตำแหน่ง รหัสสนามบิน และข้อมูลการเดินทาง`;
}

const directoryMap = new Map(directory.airports.map((a) => [a.iata, a]));

const client = new pg.Client({ connectionString: databaseUrl() });
await client.connect();
const { rows: airports } = await client.query(
  `SELECT a.iata, a.name_en, a.city_en, a.country_code, c.name_en AS country_name_en
     FROM airports a JOIN countries c ON c.code = a.country_code`
);
const { rows: described } = await client.query(
  `SELECT airport_iata FROM airport_translations WHERE locale = 'en'`
);
await client.end();

const wanted = new Set(described.map((r) => r.airport_iata));
const countryOf = new Map(airports.map((r) => [r.iata, countryName(r.country_name_en)]));
const out = {};
for (const row of airports) {
  if (!wanted.has(row.iata)) continue;
  const curatedRecord = curated.get(row.iata);
  const directoryRecord = directoryMap.get(row.iata);
  const country = countryOf.get(row.iata) ?? '';
  let text;
  if (curatedRecord) {
    text = curatedText(
      {
        ...curatedRecord,
        cityEn: curatedRecord.cityEn ?? row.city_en,
        nameEn: curatedRecord.nameEn ?? row.name_en,
      },
      country
    );
  } else {
    text = directoryText(
      {
        iata: row.iata,
        nameEn: row.name_en,
        cityEn: row.city_en,
        kind: directoryRecord?.kind ?? 'small',
      },
      country
    );
  }
  out[row.iata] = text;
}

const path = join(ROOT, 'content', 'translation-work', `${LOCALE}-descriptions.json`);
writeFileSync(path, JSON.stringify(out, null, 2) + '\n');
console.log(`wrote ${Object.keys(out).length} ${LOCALE} descriptions to ${path}`);
