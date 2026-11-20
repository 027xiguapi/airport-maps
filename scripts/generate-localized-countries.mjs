/**
 * Data-driven country introductions for the eight locales without long-form
 * content (es, pt, ja, id, vi, ru, tr, th).
 *
 * One row per country (`kind='country'`, subject = ISO code), built from the
 * seeded airport records: airport count, terminals, gates, annual passengers
 * and the per-airport table. Every generated body ends with an HTML comment
 * marker; a later editorial translation can replace the row and `--refresh`
 * will never overwrite it.
 *
 * Usage:
 *   node scripts/generate-localized-countries.mjs --locale es
 *   node scripts/generate-localized-countries.mjs --locale es --dry-run
 *   node scripts/generate-localized-countries.mjs --locale es --refresh
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
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
const DRY = args.includes('--dry-run');
const REFRESH = args.includes('--refresh');
const UPDATED = '2026-11-20';

const read = (p) => JSON.parse(readFileSync(join(ROOT, p), 'utf8'));
const vocab = read(`lib/i18n/${LOCALE}-vocab.json`);
const translate = (table) => (value) => table[value] ?? value;
const countryName = translate(vocab.countries);
const regionName = translate(vocab.regions);
const cityName = translate(vocab.cities);
const airportName = translate(vocab.airports);

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

function airportCount(n) {
  const v = num(n);
  if (LOCALE === 'es') return `${v} ${n === 1 ? 'aeropuerto' : 'aeropuertos'}`;
  if (LOCALE === 'pt') return `${v} ${n === 1 ? 'aeroporto' : 'aeroportos'}`;
  if (LOCALE === 'ja') return `${v} の空港`;
  if (LOCALE === 'id') return `${v} bandara`;
  if (LOCALE === 'vi') return `${v} sân bay`;
  if (LOCALE === 'tr') return `${v} havalimanı`;
  if (LOCALE === 'th') return `${v} สนามบิน`;
  if (LOCALE === 'nl') return `${v} ${n === 1 ? 'luchthaven' : 'luchthavens'}`;
  if (LOCALE === 'sv') return `${v} ${n === 1 ? 'flygplats' : 'flygplatser'}`;
  if (LOCALE === 'ro') return `${v} ${n === 1 ? 'aeroport' : 'aeroporturi'}`;
  if (LOCALE === 'hi') return `${v} हवाई अड्डा`;
  if (LOCALE === 'bn') return `${v} বিমানবন্দর`;
  if (LOCALE === 'sw') return `${v} uwanja wa ndege`;
  if (LOCALE === 'pl' || LOCALE === 'cs' || LOCALE === 'uk') {
    const abs = Math.abs(n);
    const mod10 = abs % 10;
    const mod100 = abs % 100;
    const forms = {
      pl: ['lotnisko', 'lotniska', 'lotnisk'],
      cs: ['letiště', 'letiště', 'letišť'],
      uk: ['аеропорт', 'аеропорти', 'аеропортів'],
    }[LOCALE];
    const singular = LOCALE === 'uk' ? abs === 1 || (mod10 === 1 && mod100 !== 11) : abs === 1;
    const noun = singular
      ? forms[0]
      : mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)
        ? forms[1]
        : forms[2];
    return `${v} ${noun}`;
  }
  const abs = Math.abs(n);
  const mod10 = abs % 10;
  const mod100 = abs % 100;
  const noun =
    abs === 1
      ? 'аэропорт'
      : mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)
        ? 'аэропорта'
        : 'аэропортов';
  return `${v} ${noun}`;
}

const T = {
  es: {
    title: (c) => `${c} – guía de aeropuertos`,
    summary: (c, n) => `${n} aeropuertos en ${c}: terminales, puertas y volumen anual de pasajeros.`,
    intro: (o) =>
      `${o.country} está cubierto aquí por ${airportCount(o.airports.length)}: ${o.list}.` +
      ` En conjunto suman ${o.terminals} terminales y ${o.gates} puertas` +
      (o.pax != null ? ` y mueven ${paxText(o.pax)} de pasajeros al año.` : '.'),
    tableTitle: 'Aeropuertos incluidos',
    head: ['Aeropuerto', 'Ciudad', 'Terminales', 'Puertas', 'Pasajeros al año'],
    tableNote: (total, shown) => `La tabla muestra los ${shown} aeropuertos con más tráfico; el directorio completo incluye ${total}.`,
    closing:
      'Cada página de aeropuerto incluye el plano de terminales, los rangos de puertas, las principales aerolíneas y el transporte terrestre; busca en el directorio por código IATA para ir directamente.',
  },
  pt: {
    title: (c) => `${c} – guia de aeroportos`,
    summary: (c, n) => `${n} aeroportos em ${c}: terminais, portões e volume anual de passageiros.`,
    intro: (o) =>
      `${o.country} está coberto aqui por ${airportCount(o.airports.length)}: ${o.list}.` +
      ` Juntos somam ${o.terminals} terminais e ${o.gates} portões` +
      (o.pax != null ? ` e movimentam ${paxText(o.pax)} de passageiros por ano.` : '.'),
    tableTitle: 'Aeroportos incluídos',
    head: ['Aeroporto', 'Cidade', 'Terminais', 'Portões', 'Passageiros por ano'],
    tableNote: (total, shown) => `A tabela mostra os ${shown} aeroportos com mais tráfego; o diretório completo inclui ${total}.`,
    closing:
      'Cada página de aeroporto traz a planta dos terminais, as faixas de portões, as principais companhias aéreas e o transporte terrestre; busque no diretório pelo código IATA para ir direto.',
  },
  ja: {
    title: (c) => `${c} 空港ガイド`,
    summary: (c, n) => `${c}の空港${n}か所：ターミナル、ゲート、年間旅客数。`,
    intro: (o) =>
      `${o.country}はここで${airportCount(o.airports.length)}で扱っています：${o.list}。` +
      `合計ターミナル${o.terminals}棟、ゲート${o.gates}か所` +
      (o.pax != null ? `、年間旅客数は${paxText(o.pax)}です。` : 'です。'),
    tableTitle: '掲載空港',
    head: ['空港', '都市', 'ターミナル', 'ゲート', '年間旅客数'],
    tableNote: (total, shown) => `表は旅客数の多い${shown}空港を掲載しています。ディレクトリ全体には${total}空港があります。`,
    closing:
      '各空港ページにはターミナル図、ゲート範囲、主な航空会社、地上交通が掲載されています。ディレクトリでIATAコードを検索すると直接開けます。',
  },
  id: {
    title: (c) => `${c}: panduan bandara`,
    summary: (c, n) => `${n} bandara di ${c}: terminal, gerbang, dan volume penumpang tahunan.`,
    intro: (o) =>
      `${o.country} di sini dicakup oleh ${airportCount(o.airports.length)}: ${o.list}.` +
      ` Secara total ada ${o.terminals} terminal dan ${o.gates} gerbang` +
      (o.pax != null ? `, dengan ${paxText(o.pax)} penumpang per tahun.` : '.'),
    tableTitle: 'Bandara yang tercakup',
    head: ['Bandara', 'Kota', 'Terminal', 'Gerbang', 'Penumpang per tahun'],
    tableNote: (total, shown) => `Tabel ini menampilkan ${shown} bandara tersibuk; direktori lengkap mencakup ${total}.`,
    closing:
      'Setiap halaman bandara memuat denah terminal, rentang gerbang, maskapai utama, dan transportasi darat; cari kode IATA di direktori untuk langsung membukanya.',
  },
  vi: {
    title: (c) => `${c}: hướng dẫn sân bay`,
    summary: (c, n) => `${n} sân bay tại ${c}: nhà ga, cổng và sản lượng hành khách hằng năm.`,
    intro: (o) =>
      `${o.country} được đề cập ở đây với ${airportCount(o.airports.length)}: ${o.list}.` +
      ` Tổng cộng có ${o.terminals} nhà ga và ${o.gates} cổng` +
      (o.pax != null ? `, đón ${paxText(o.pax)} hành khách mỗi năm.` : '.'),
    tableTitle: 'Các sân bay được đề cập',
    head: ['Sân bay', 'Thành phố', 'Nhà ga', 'Cổng', 'Hành khách mỗi năm'],
    tableNote: (total, shown) => `Bảng hiển thị ${shown} sân bay đông khách nhất; danh mục đầy đủ có ${total}.`,
    closing:
      'Mỗi trang sân bay có sơ đồ nhà ga, phạm vi cổng, hãng bay chính và giao thông mặt đất; tìm mã IATA trong danh mục để mở trực tiếp.',
  },
  ru: {
    title: (c) => `${c}: путеводитель по аэропортам`,
    summary: (c, n) => `${n} аэропортов в ${c}: терминалы, выходы и годовой пассажиропоток.`,
    intro: (o) =>
      `В этом разделе — ${airportCount(o.airports.length)}: ${o.list}.` +
      ` В сумме это ${o.terminals} терминалов и ${o.gates} выходов` +
      (o.pax != null ? `, около ${paxText(o.pax)} пассажиров в год.` : '.'),
    tableTitle: 'Аэропорты раздела',
    head: ['Аэропорт', 'Город', 'Терминалы', 'Выходы', 'Пассажиров в год'],
    tableNote: (total, shown) => `В таблице — ${shown} самых загруженных аэропортов; всего в каталоге ${total}.`,
    closing:
      'На каждой странице аэропорта есть схема терминалов, диапазоны выходов, основные авиакомпании и наземный транспорт; найдите код IATA в каталоге, чтобы перейти сразу.',
  },
  tr: {
    title: (c) => `${c}: havalimanı rehberi`,
    summary: (c, n) => `${c} için ${n} havalimanı: terminaller, kapılar ve yıllık yolcu hacmi.`,
    intro: (o) =>
      `${o.country} burada ${airportCount(o.airports.length)} ile yer alıyor: ${o.list}.` +
      ` Toplam ${o.terminals} terminal ve ${o.gates} kapı` +
      (o.pax != null ? `, yılda ${paxText(o.pax)} yolcu.` : '.'),
    tableTitle: 'Kapsanan havalimanları',
    head: ['Havalimanı', 'Şehir', 'Terminal', 'Kapı', 'Yıllık yolcu'],
    tableNote: (total, shown) => `Tablo en yoğun ${shown} havalimanını gösterir; dizinin tamamında ${total} havalimanı var.`,
    closing:
      'Her havalimanı sayfasında terminal planı, kapı aralıkları, başlıca havayolları ve kara ulaşımı bulunur; doğrudan açmak için dizinde IATA kodunu arayın.',
  },
  th: {
    title: (c) => `${c}: คู่มือสนามบิน`,
    summary: (c, n) => `สนามบิน ${n} แห่งใน${c}: อาคารผู้โดยสาร ประตูขึ้นเครื่อง และปริมาณผู้โดยสารต่อปี`,
    intro: (o) =>
      `${o.country} มีสนามบินในหน้านี้ ${airportCount(o.airports.length)}: ${o.list}` +
      ` รวมอาคารผู้โดยสาร ${o.terminals} แห่งและประตูขึ้นเครื่อง ${o.gates} ประตู` +
      (o.pax != null ? ` รองรับผู้โดยสาร ${paxText(o.pax)} ต่อปี` : ''),
    tableTitle: 'สนามบินที่ครอบคลุม',
    head: ['สนามบิน', 'เมือง', 'อาคารผู้โดยสาร', 'ประตู', 'ผู้โดยสารต่อปี'],
    tableNote: (total, shown) => `ตารางแสดงสนามบินที่มีผู้โดยสารมากที่สุด ${shown} แห่ง ไดเรกทอรีทั้งหมดมี ${total} แห่ง`,
    closing:
      'แต่ละหน้าสนามบินมีผังอาคารผู้โดยสาร ช่วงประตูขึ้นเครื่อง สายการบินหลัก และการเดินทางภาคพื้นดิน ค้นหารหัส IATA ในไดเรกทอรีเพื่อเปิดได้ทันที',
  },
  nl: {
    title: (c) => `${c} – luchthavengids`,
    summary: (c, n) => `${n} luchthavens in ${c}: terminals, gates en jaarlijks passagiersvolume.`,
    intro: (o) =>
      `${o.country} is hier vertegenwoordigd met ${airportCount(o.airports.length)}: ${o.list}.` +
      ` Samen ${o.terminals} terminals en ${o.gates} gates` +
      (o.pax != null ? ` en ${paxText(o.pax)} passagiers per jaar.` : '.'),
    tableTitle: 'Opgenomen luchthavens',
    head: ['Luchthaven', 'Stad', 'Terminals', 'Gates', 'Passagiers per jaar'],
    tableNote: (total, shown) => `De tabel toont de ${shown} drukste luchthavens; de volledige gids bevat ${total}.`,
    closing:
      'Elke luchthavenpagina bevat de terminalplattegrond, gatebereiken, belangrijkste maatschappijen en grondvervoer; zoek in de gids op IATA-code om direct te openen.',
  },
  sv: {
    title: (c) => `${c} – flygplatsguide`,
    summary: (c, n) => `${n} flygplatser i ${c}: terminaler, gater och årligt passagerarantal.`,
    intro: (o) =>
      `${o.country} finns här med ${airportCount(o.airports.length)}: ${o.list}.` +
      ` Tillsammans ${o.terminals} terminaler och ${o.gates} gater` +
      (o.pax != null ? ` och ${paxText(o.pax)} passagerare per år.` : '.'),
    tableTitle: 'Flygplatser i guiden',
    head: ['Flygplats', 'Stad', 'Terminaler', 'Gates', 'Passagerare per år'],
    tableNote: (total, shown) => `Tabellen visar de ${shown} mest trafikerade flygplatserna; hela guiden omfattar ${total}.`,
    closing:
      'Varje flygplatssida har terminalplan, gateområden, huvudflygbolag och marktransport; sök på IATA-kod i guiden för att öppna direkt.',
  },
  pl: {
    title: (c) => `${c} – przewodnik po lotniskach`,
    summary: (c, n) => `${n} lotnisk w ${c}: terminale, bramki i roczny ruch pasażerski.`,
    intro: (o) =>
      `${o.country} jest tu reprezentowane przez ${airportCount(o.airports.length)}: ${o.list}.` +
      ` Łącznie terminale: ${o.terminals}; bramki: ${o.gates}` +
      (o.pax != null ? `; pasażerowie: ${paxText(o.pax)} rocznie.` : '.'),
    tableTitle: 'Lotniska w przewodniku',
    head: ['Lotnisko', 'Miasto', 'Terminale', 'Bramki', 'Pasażerowie rocznie'],
    tableNote: (total, shown) => `Tabela pokazuje ${shown} najruchliwszych lotnisk; cały przewodnik obejmuje ${total}.`,
    closing:
      'Każda strona lotniska zawiera plan terminali, strefy bramek, główne linie lotnicze i transport naziemny; wyszukaj kod IATA w katalogu, aby otworzyć ją bezpośrednio.',
  },
  cs: {
    title: (c) => `${c} – průvodce letišti`,
    summary: (c, n) => `${n} letišť v ${c}: terminály, brány a roční osobní doprava.`,
    intro: (o) =>
      `${o.country} je zde zastoupeno ${airportCount(o.airports.length)}: ${o.list}.` +
      ` Celkem terminály: ${o.terminals}; brány: ${o.gates}` +
      (o.pax != null ? `; cestující: ${paxText(o.pax)} ročně.` : '.'),
    tableTitle: 'Letiště v průvodci',
    head: ['Letiště', 'Město', 'Terminály', 'Brány', 'Cestující ročně'],
    tableNote: (total, shown) => `Tabulka ukazuje ${shown} nejvytíženějších letišť; celý průvodce jich obsahuje ${total}.`,
    closing:
      'Každá stránka letiště obsahuje plán terminálů, zóny bran, hlavní aerolinky a pozemní dopravu; v katalogu vyhledejte kód IATA a otevřete ji přímo.',
  },
  ro: {
    title: (c) => `${c} – ghid de aeroporturi`,
    summary: (c, n) => `${n} aeroporturi în ${c}: terminale, porți și trafic anual de pasageri.`,
    intro: (o) =>
      `${o.country} este reprezentată aici de ${airportCount(o.airports.length)}: ${o.list}.` +
      ` În total, terminale: ${o.terminals}; porți: ${o.gates}` +
      (o.pax != null ? `; pasageri: ${paxText(o.pax)} pe an.` : '.'),
    tableTitle: 'Aeroporturi incluse',
    head: ['Aeroport', 'Oraș', 'Terminale', 'Porți', 'Pasageri pe an'],
    tableNote: (total, shown) => `Tabelul arată cele mai aglomerate ${shown} aeroporturi; ghidul complet conține ${total}.`,
    closing:
      'Fiecare pagină de aeroport conține planul terminalelor, zonele porților, principalele companii aeriene și transportul terestru; caută codul IATA în director pentru a o deschide direct.',
  },
  uk: {
    title: (c) => `${c} – путівник аеропортами`,
    summary: (c, n) => `${n} аеропортів у ${c}: термінали, виходи та річний пасажиропотік.`,
    intro: (o) =>
      `У цьому розділі — ${airportCount(o.airports.length)}: ${o.list}.` +
      ` Загалом термінали: ${o.terminals}; виходи: ${o.gates}` +
      (o.pax != null ? `; пасажири: ${paxText(o.pax)} на рік.` : '.'),
    tableTitle: 'Аеропорти розділу',
    head: ['Аеропорт', 'Місто', 'Термінали', 'Виходи', 'Пасажири на рік'],
    tableNote: (total, shown) => `Таблиця показує ${shown} найзавантаженіших аеропортів; у повному путівнику їх ${total}.`,
    closing:
      'Кожна сторінка аеропорту містить схему терміналів, зони виходів, основні авіакомпанії та наземний транспорт; знайдіть код IATA у каталозі, щоб відкрити її одразу.',
  },
  hi: {
    title: (c) => `${c} – हवाई अड्डा गाइड`,
    summary: (c, n) => `${c} में ${n} हवाई अड्डे: टर्मिनल, गेट और वार्षिक यात्री संख्या।`,
    intro: (o) =>
      `${o.country} यहां ${airportCount(o.airports.length)} के साथ शामिल है: ${o.list}.` +
      ` कुल ${o.terminals} टर्मिनल और ${o.gates} गेट` +
      (o.pax != null ? `, सालाना ${paxText(o.pax)} यात्री।` : '।'),
    tableTitle: 'शामिल हवाई अड्डे',
    head: ['हवाई अड्डा', 'शहर', 'टर्मिनल', 'गेट', 'वार्षिक यात्री'],
    tableNote: (total, shown) => `तालिका सबसे व्यस्त ${shown} हवाई अड्डे दिखाती है; पूरी गाइड में ${total} हैं।`,
    closing:
      'हर हवाई अड्डा पेज में टर्मिनल योजना, गेट क्षेत्र, मुख्य एयरलाइंस और भूमि परिवहन है; सीधे खोलने के लिए निर्देशिका में IATA कोड खोजें।',
  },
  bn: {
    title: (c) => `${c} – বিমানবন্দর গাইড`,
    summary: (c, n) => `${c}-এ ${n} বিমানবন্দর: টার্মিনাল, গেট ও বার্ষিক যাত্রী সংখ্যা।`,
    intro: (o) =>
      `${o.country} এখানে ${airportCount(o.airports.length)} নিয়ে রয়েছে: ${o.list}।` +
      ` মোট ${o.terminals} টার্মিনাল ও ${o.gates} গেট` +
      (o.pax != null ? `, বছরে ${paxText(o.pax)} যাত্রী।` : '।'),
    tableTitle: 'অন্তর্ভুক্ত বিমানবন্দর',
    head: ['বিমানবন্দর', 'শহর', 'টার্মিনাল', 'গেট', 'বার্ষিক যাত্রী'],
    tableNote: (total, shown) => `তালিকায় ব্যস্ততম ${shown} বিমানবন্দর দেখানো হয়েছে; পুরো গাইডে ${total}টি রয়েছে।`,
    closing:
      'প্রতিটি বিমানবন্দর পৃষ্ঠায় টার্মিনাল পরিকল্পনা, গেট এলাকা, প্রধান এয়ারলাইন ও ভূমি পরিবহন আছে; সরাসরি খুলতে ডিরেক্টরিতে IATA কোড খুঁজুন।',
  },
  sw: {
    title: (c) => `${c} – mwongozo wa viwanja vya ndege`,
    summary: (c, n) => `Viwanja ${n} vya ndege nchini ${c}: terminali, malango na abiria kwa mwaka.`,
    intro: (o) =>
      `${o.country} inawakilishwa hapa na ${airportCount(o.airports.length)}: ${o.list}.` +
      ` Kwa jumla terminali ${o.terminals} na malango ${o.gates}` +
      (o.pax != null ? `, abiria ${paxText(o.pax)} kwa mwaka.` : '.'),
    tableTitle: 'Viwanja vilivyojumuishwa',
    head: ['Uwanja wa ndege', 'Mji', 'Terminali', 'Malango', 'Abiria kwa mwaka'],
    tableNote: (total, shown) => `Jedwali linaonyesha viwanja ${shown} vyenye shughuli nyingi; mwongozo wote una ${total}.`,
    closing:
      'Kila ukurasa wa uwanja una mpango wa terminali, maeneo ya malango, shirika kuu za ndege na usafiri wa ardhini; tafuta msimbo wa IATA kwenye saraka ili kuufungua moja kwa moja.',
  },
};

const client = new pg.Client({ connectionString: databaseUrl() });
await client.connect();
const { rows: countries } = await client.query(
  `SELECT code, name_en, region_en FROM countries ORDER BY code`
);
const { rows: airportRows } = await client.query(
  `SELECT a.country_code, a.iata, a.name_en, a.city_en, a.annual_pax_m::float8 AS pax,
          (SELECT count(*)::int FROM terminals t WHERE t.airport_iata = a.iata) AS terminals,
          a.gate_count
     FROM airports a ORDER BY a.iata`
);
const { rows: described } = await client.query(
  `SELECT subject FROM content_documents WHERE locale = 'en' AND kind = 'country'`
);
const wanted = new Set(described.map((r) => r.subject));

const byCountry = new Map();
for (const row of airportRows) {
  if (!byCountry.has(row.country_code)) byCountry.set(row.country_code, []);
  byCountry.get(row.country_code).push(row);
}

const { rows: existing } = await client.query(
  `SELECT subject, body FROM content_documents WHERE locale = $1 AND kind = 'country'`,
  [LOCALE]
);
const stored = new Map(existing.map((r) => [r.subject, r.body]));

const t = T[LOCALE];
const docs = [];
for (const country of countries) {
  if (!wanted.has(country.code)) continue;
  const list = byCountry.get(country.code) ?? [];
  if (!list.length) continue;
  const airports = list
    .map((a) => ({
      iata: a.iata,
      name: airportName(a.name_en),
      city: cityName(a.city_en ?? ''),
      terminals: a.terminals ?? 0,
      gates: a.gate_count ?? 0,
      pax: a.pax,
    }))
    .sort((a, b) => (b.pax ?? -1) - (a.pax ?? -1) || a.iata.localeCompare(b.iata));
  const terminals = airports.reduce((s, a) => s + a.terminals, 0);
  const gates = airports.reduce((s, a) => s + a.gates, 0);
  const paxValues = airports.map((a) => a.pax).filter((p) => p != null);
  const pax = paxValues.length ? paxValues.reduce((s, p) => s + p, 0) : null;
  const name = countryName(country.name_en);
  const region = country.region_en ? regionName(country.region_en) : '';
  const title = t.title(name);
  const summary = t.summary(name, airports.length);
  const intro = t.intro({
    country: `${name}${region ? (LOCALE === 'ja' ? `（${region}）` : ` (${region})`) : ''}`,
    airports,
    terminals: num(terminals),
    gates: num(gates),
    pax,
    list: listText(airports.slice(0, 8).map((a) => (LOCALE === 'ja' ? `${a.name}（${a.iata}）` : `${a.name} (${a.iata})`))) + (airports.length > 8 ? ' …' : ''),
  });
  const shown = airports.slice(0, 24);
  const rows = shown.map(
    (a) =>
      `| ${a.name} (${a.iata}) | ${a.city} | ${a.terminals ? num(a.terminals) : '—'} | ${a.gates ? num(a.gates) : '—'} | ${a.pax != null ? paxText(a.pax) : '—'} |`
  );
  const body = [
    intro,
    '',
    `## ${t.tableTitle}`,
    '',
    `| ${t.head.join(' | ')} |`,
    '| --- | --- | --- | --- | --- |',
    ...rows,
    '',
    ...(airports.length > shown.length ? [t.tableNote(airports.length, shown.length), ''] : []),
    t.closing,
  ].join('\n');
  const current = stored.get(country.code);
  // Re-running with --refresh overwrites every row for the locale, including one
  // that an editor may have replaced; use --dry-run/--codes when in doubt.
  if (current !== undefined && !REFRESH) continue;
  docs.push({ subject: country.code, title, summary, body });
}

console.log(`${docs.length} ${LOCALE} country intro(s) to write${DRY ? ' (dry run)' : ''}`);
if (!DRY && docs.length) {
  const upsert = `
    INSERT INTO content_documents (kind, subject, locale, title, summary, updated, body)
    VALUES ('country', $1, $2, $3, $4, $5, $6)
    ON CONFLICT (kind, subject, locale) DO UPDATE SET
      title = EXCLUDED.title, summary = EXCLUDED.summary, updated = EXCLUDED.updated,
      body = EXCLUDED.body, updated_at = now()`;
  try {
    await client.query('BEGIN');
    for (const doc of docs) {
      await client.query(upsert, [doc.subject, LOCALE, doc.title, doc.summary, UPDATED, doc.body]);
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  }
  console.log(`wrote ${docs.length} ${LOCALE} country intro(s)`);
}
await client.end();
