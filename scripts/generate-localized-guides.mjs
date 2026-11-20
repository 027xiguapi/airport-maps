/**
 * Data-driven airport guides for the eight published locales that still have no
 * long-form content (es, pt, ja, id, vi, ru, tr, th).
 *
 * These are generated documents, not translations of the English editorial
 * guides: every sentence comes from the repository's own data (the seeded
 * airport records, compiled facts, the OpenFlights route dump and the
 * nearest-airport calculation), exactly like scripts/generate-de-guides.mjs.
 * The intro carries a per-locale marker sentence so a later editorial
 * translation can replace the row and `--refresh` will never overwrite it.
 *
 * Usage:
 *   node scripts/generate-localized-guides.mjs --locale es
 *   node scripts/generate-localized-guides.mjs --locale es --dry-run
 *   node scripts/generate-localized-guides.mjs --locale es --refresh
 *   node scripts/generate-localized-guides.mjs --locale es --codes PEK,MUC
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import pg from 'pg';
import { databaseUrl, ROOT } from './_env.mjs';
import { GUIDE_T } from './_localized-guide-templates.mjs';

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.findIndex((a) => a === name || a.startsWith(`${name}=`));
  if (i < 0) return null;
  return args[i].includes('=') ? args[i].slice(args[i].indexOf('=') + 1) : args[i + 1] ?? null;
};
const LOCALE = flag('--locale');
const DRY = args.includes('--dry-run');
const REFRESH = args.includes('--refresh');
const ONLY = (flag('--codes') ?? '')
  .split(',')
  .map((c) => c.trim().toUpperCase())
  .filter(Boolean);

const LOCALES = ['es', 'pt', 'ja', 'id', 'vi', 'ru', 'tr', 'th', 'nl', 'sv', 'pl', 'cs', 'ro', 'uk', 'hi', 'bn', 'sw'];
if (!LOCALES.includes(LOCALE)) {
  console.error(`--locale must be one of ${LOCALES.join(', ')}`);
  process.exit(1);
}

const read = (p) => JSON.parse(readFileSync(join(ROOT, p), 'utf8'));
const vocab = read(`lib/i18n/${LOCALE}-vocab.json`);
const translate = (table) => (value) => table[value] ?? value;
const countryName = translate(vocab.countries);
const regionName = translate(vocab.regions);
const cityName = translate(vocab.cities);
const airportName = translate(vocab.airports);
const kindName = (kind) => vocab.airportKinds[kind] ?? vocab.airportKinds.small;

const legacy = read('scripts/legacy-data.json');
const directory = read('scripts/directory-data.json');
const facts = read('lib/airport-facts.json').airports;
const routes = read('data/airport-routes.json');
const worldAirports = read('public/data/world-airports.json').airports;

const curated = new Map(legacy.airports.map((a) => [a.iata, a]));
const world = new Map(
  worldAirports.map((r) => [String(r[0]).toUpperCase(), { name: r[1], lat: r[6], lng: r[7] }])
);

const UPDATED = '2026-11-20';
const client = new pg.Client({ connectionString: databaseUrl() });
await client.connect();

const { rows: dbRows } = await client.query(
  `SELECT a.iata, a.name_en, a.city_en, c.name_en AS country_name_en, c.region_en
     FROM airports a JOIN countries c ON c.code = a.country_code`
);
const db = new Map(dbRows.map((row) => [row.iata, row]));

function coords(iata) {
  const f = facts[iata];
  if (typeof f?.lat === 'number' && typeof f?.lng === 'number') return { lat: f.lat, lng: f.lng };
  const w = world.get(iata);
  return w && Number.isFinite(w.lat) && Number.isFinite(w.lng) ? { lat: w.lat, lng: w.lng } : null;
}

const EARTH_R = 6371.0088;
const haversine = (a, b) => {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLng = (b.lng - a.lng) * rad;
  const s =
    Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_R * Math.asin(Math.sqrt(s));
};

function parsePax(text) {
  const m = /约\s*([\d.]+)\s*(亿|万)/.exec(text ?? '');
  if (!m) return null;
  const n = Number(m[1]);
  if (!Number.isFinite(n)) return null;
  return m[2] === '亿' ? Number((n * 100).toFixed(2)) : Number((n / 100).toFixed(2));
}
const parseDistance = (text) => {
  const m = /([\d.]+)\s*km/i.exec(text ?? '');
  return m ? Number(m[1]) : null;
};

const displayName = (iata) => {
  const own = db.get(iata);
  if (own?.name_en) return airportName(own.name_en);
  const w = world.get(iata);
  return w ? airportName(w.name) : iata;
};

function guideData(iata) {
  const info = db.get(iata);
  if (!info) return null;
  const record = curated.get(iata);
  const point = coords(iata);
  const route = routes.airports[iata] ?? null;
  const destinations = route ? [...route.destinations].sort((x, y) => x.km - y.km) : null;
  let nearest = null;
  if (point) {
    nearest = [...db.keys()]
      .filter((code) => code !== iata)
      .map((code) => ({ code, km: haversine(point, coords(code) ?? { lat: 1e9, lng: 1e9 }) }))
      .filter((n) => n.km < 1e8)
      .sort((x, y) => x.km - y.km)
      .slice(0, 3);
  }
  const kind = facts[iata]?.type ?? record?.kind ?? 'small';
  return { iata, info, record, point, destinations, nearest, kind };
}

const fmtKm = (km) => (km >= 100 ? Math.round(km) : Math.round(km * 10) / 10);
const num = (value) => {
  const n = typeof value === 'string' ? Number(value) : value;
  if (n == null || !Number.isFinite(n)) return '—';
  return new Intl.NumberFormat(
    { es: 'es-ES', pt: 'pt-BR', ja: 'ja-JP', id: 'id-ID', vi: 'vi-VN', ru: 'ru-RU', tr: 'tr-TR', th: 'th-TH', nl: 'nl-NL', sv: 'sv-SE', pl: 'pl-PL', cs: 'cs-CZ', ro: 'ro-RO', uk: 'uk-UA', hi: 'hi-IN', bn: 'bn-BD', sw: 'sw-TZ' }[
      LOCALE
    ],
    { maximumFractionDigits: 2 }
  ).format(n);
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
  // ru
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
  return `${items.slice(0, -1).join(', ')} และ ${items.at(-1)}`;
}

/** Per-locale copy. Placeholders are formatted by guide(). */
const T = {
  es: {
    marker:
      'Esta página resume lo que la base de datos, los mapas y el conjunto de datos de rutas dicen del aeropuerto.',
    title: (name) => `${name}: guía del aeropuerto`,
    summary: (o) =>
      `${o.name} (${o.iata}) atiende ${o.city}, ${o.country} como ${o.kind}. Mapa, destinos sin escala, aeropuertos cercanos y lo que aún hay que confirmar con la aerolínea.`,
    intro: (o) =>
      `${o.name} (IATA **${o.iata}**${o.icao ? `, ICAO ${o.icao}` : ''}) atiende ${o.city}, ${o.country}${o.region ? ` (${o.region})` : ''} como ${o.kind}. ${o.marker}`,
    factsTitle: 'De un vistazo',
    facts: {
      iata: 'IATA / OACI',
      class: 'Clase de aeropuerto',
      location: 'Ubicación',
      coords: 'Coordenadas',
      pax: 'Pasajeros al año',
      distance: 'Al centro de la ciudad',
      destinations: 'Destinos sin escala',
      seeBelow: 'ver abajo',
    },
    mapTitle: 'Mapa del aeropuerto',
    mapText:
      'El mapa de esta página se genera con datos de OpenStreetMap: los aeropuertos con polígonos de terminal muestran los edificios, las plataformas y las vías de acceso, mientras que los pequeños campos muestran el contorno del aeródromo y la pista. Los iconos de aparcamiento, autobuses, restauración, hoteles y alquiler de coches siguen lo que está cartografiado en OSM.',
    mapBullets: [
      '**Vista a tamaño completo** — abre la tarjeta del mapa en esta página para acercar; el original de 2000 px se puede descargar.',
      '**Mapa de ubicación** — el mapa interactivo permite desplazarse y acercar para ver el campo respecto a la ciudad y la red de carreteras.',
      '**Esquema** — la página también dibuja un esquema proporcional para indicar la escala del aeropuerto; no es el plano real.',
    ],
    routesTitle: 'Destinos sin escala',
    routesIntro:
      'Destinos sin escala, los más cercanos primero (conjunto de datos OpenFlights, compilado en 2014 — tómalo como orientativo y confírmalo con la aerolínea):',
    routesHead: ['Destino', 'Distancia', 'Aerolíneas'],
    routesClosing: (o) =>
      `La lista completa de los ${o.count} destinos sin escala está en el [mapa de rutas de ${o.name}](/${LOCALE}/route/${o.iata}).`,
    noRoutes:
      'El conjunto de datos de rutas no contiene servicios sin escala para este aeropuerto. Los horarios regionales cambian a menudo — confírmalo con la aerolínea o el aeropuerto antes de reservar.',
    nearbyTitle: 'Aeropuertos cercanos',
    nearbyIntro: 'Si ninguno encaja, merece la pena comparar estos campos cercanos:',
    nearbyHead: ['Aeropuerto', 'Distancia'],
    gettingTitle: 'Cómo llegar',
    gettingLead: 'El aeropuerto:',
    mapLink: 'Google Maps',
    gettingNote:
      'El mapa de ubicación de esta página muestra el campo respecto a la ciudad y la red de carreteras, y la sección de transporte terrestre enumera el transporte público registrado. Para rutas, horarios y aparcamiento, consulta la información del propio aeropuerto.',
    sizeTitle: 'Tamaño e instalaciones',
    kindParagraph: {
      large:
        'Los aeropuertos grandes tienen varias pistas y terminales y mueven millones de pasajeros al año. Los tiempos de espera en facturación y seguridad varían mucho según la hora; para vuelos internacionales, llega 2–3 horas antes de la salida.',
      medium:
        'Los aeropuertos de tamaño medio son hubs regionales: una terminal compacta, distancias cortas a pie y normalmente un check-in más rápido que en un gran hub — pero con menos frecuencias, así que reubicar un vuelo perdido es más difícil. Apunta a 90–120 minutos antes de la salida.',
      small:
        'Los aeródromos pequeños tienen instalaciones mínimas, normalmente una terminal de una sola planta cuyos mostradores abren poco antes del vuelo. El transporte terrestre es escaso; el coche o un traslado reservado es la opción más segura.',
      heliport:
        'Los helipuertos solo atienden vuelos en helicóptero: no hay un flujo de terminal convencional. El número de plazas y las rutas son cortos; llega a la hora indicada por el operador.',
    },
    sizeClosing:
      'Los planos de terminal, las ubicaciones de facturación y los horarios de transporte terrestre los publica el propio aeropuerto; para los detalles que deben ser exactos el día del viaje, consulta su información. Si algo aquí parece incorrecto, avísanos desde la página de contacto y lo revisaremos.',
    tipsTitle: 'Consejos',
    tipConnection: (o) =>
      `- Si tu destino no está en la tabla anterior, normalmente viajarás vía ${o.name} (${o.iata}) u otro aeropuerto más grande.`,
    tipSearch:
      '- Usa el buscador de la parte superior para comparar alternativas: escribe el nombre de una ciudad o un código IATA.',
    tipPeak:
      '- En temporada alta también escasean el aparcamiento y los coches de alquiler en los aeródromos pequeños — reserva con antelación si vas a conducir.',
  },
  pt: {
    marker:
      'Esta página reúne o que a base de dados, os mapas e o conjunto de dados de rotas dizem sobre o aeroporto.',
    title: (name) => `${name}: guia do aeroporto`,
    summary: (o) =>
      `${o.name} (${o.iata}) atende ${o.city}, ${o.country} como ${o.kind}. Mapa, destinos sem escala, aeroportos próximos e o que ainda precisa ser confirmado com a companhia aérea.`,
    intro: (o) =>
      `${o.name} (IATA **${o.iata}**${o.icao ? `, ICAO ${o.icao}` : ''}) atende ${o.city}, ${o.country}${o.region ? ` (${o.region})` : ''} como ${o.kind}. ${o.marker}`,
    factsTitle: 'Em resumo',
    facts: {
      iata: 'IATA / OACI',
      class: 'Classe do aeroporto',
      location: 'Localização',
      coords: 'Coordenadas',
      pax: 'Passageiros por ano',
      distance: 'Até o centro da cidade',
      destinations: 'Destinos sem escala',
      seeBelow: 'veja abaixo',
    },
    mapTitle: 'Mapa do aeroporto',
    mapText:
      'O mapa desta página é gerado a partir de dados do OpenStreetMap: aeroportos com polígonos de terminal mostram os edifícios, os pátios e as vias de acesso, enquanto os pequenos campos mostram o contorno do aeródromo e a pista. Os ícones de estacionamento, ônibus, alimentação, hotéis e aluguel de carros seguem o que está mapeado no OSM.',
    mapBullets: [
      '**Vista em tamanho real** — abra o cartão do mapa nesta página para ampliar; o original de 2000 px pode ser baixado.',
      '**Mapa de localização** — o mapa interativo permite arrastar e ampliar para ver o campo em relação à cidade e à malha viária.',
      '**Esquema** — a página também desenha um esquema proporcional para indicar a escala do aeroporto; não é a planta real.',
    ],
    routesTitle: 'Destinos sem escala',
    routesIntro:
      'Destinos sem escala, os mais próximos primeiro (conjunto de dados OpenFlights, compilado em 2014 — trate como indicativo e confirme com a companhia aérea):',
    routesHead: ['Destino', 'Distância', 'Companhias aéreas'],
    routesClosing: (o) =>
      `A lista completa dos ${o.count} destinos sem escala está no [mapa de rotas de ${o.name}](/${LOCALE}/route/${o.iata}).`,
    noRoutes:
      'O conjunto de dados de rotas não traz serviços sem escala para este aeroporto. Horários regionais mudam com frequência — confirme com a companhia aérea ou o aeroporto antes de reservar.',
    nearbyTitle: 'Aeroportos próximos',
    nearbyIntro: 'Se nenhum servir, vale comparar estes campos próximos:',
    nearbyHead: ['Aeroporto', 'Distância'],
    gettingTitle: 'Como chegar',
    gettingLead: 'O aeroporto:',
    mapLink: 'Google Maps',
    gettingNote:
      'O mapa de localização desta página mostra o campo em relação à cidade e à malha viária, e a seção de transporte terrestre lista o transporte público registrado. Para rotas, horários e estacionamento, consulte as informações do próprio aeroporto.',
    sizeTitle: 'Tamanho e instalações',
    kindParagraph: {
      large:
        'Aeroportos grandes têm várias pistas e terminais e movimentam milhões de passageiros por ano. Os tempos de fila no check-in e na segurança variam muito conforme a hora; para voos internacionais, chegue 2–3 horas antes da partida.',
      medium:
        'Aeroportos de porte médio são hubs regionais: um terminal compacto, distâncias curtas a pé e normalmente check-in mais rápido que em um grande hub — mas com menos frequências, então remarcar após perder um voo é mais difícil. Mire 90–120 minutos antes da partida.',
      small:
        'Aeródromos pequenos têm instalações mínimas, geralmente um terminal de um único nível cujos balcões abrem pouco antes do voo. O transporte terrestre é escasso; carro próprio ou traslado reservado é a opção mais segura.',
      heliport:
        'Helipontos atendem apenas voos de helicóptero — não há o fluxo habitual de um terminal. O número de assentos e as rotas são curtos; chegue no horário indicado pelo operador.',
    },
    sizeClosing:
      'Plantas de terminal, locais de check-in e horários do transporte terrestre são publicados pelo próprio aeroporto; para detalhes que precisam estar certos no dia da viagem, consulte as informações dele. Se algo aqui parecer errado, avise pela página de contato e verificaremos.',
    tipsTitle: 'Dicas',
    tipConnection: (o) =>
      `- Se o seu destino não estiver na tabela acima, normalmente você fará conexão em ${o.name} (${o.iata}) ou em outro aeroporto maior.`,
    tipSearch:
      '- Use a busca no topo da página para comparar alternativas: digite o nome de uma cidade ou um código IATA.',
    tipPeak:
      '- Na alta temporada, estacionamento e carros de aluguel também escasseiam em aeródromos pequenos — reserve com antecedência se for dirigir.',
  },
  ja: {
    marker: 'このページは、データベース、地図、路線データがこの空港について示す内容をまとめたものです。',
    title: (name) => `${name}：空港ガイド`,
    summary: (o) =>
      `${o.name}（${o.iata}）は${o.country}の${o.city}を担う${o.kind}です。地図、直行便、近隣空港、航空会社に確認すべき事項をまとめました。`,
    intro: (o) =>
      `${o.name}（IATA **${o.iata}**${o.icao ? `、ICAO ${o.icao}` : ''}）は${o.country}${o.region ? `（${o.region}）` : ''}の${o.city}を担う${o.kind}です。${o.marker}`,
    factsTitle: '概要',
    facts: {
      iata: 'IATA / ICAO',
      class: '空港クラス',
      location: '所在地',
      coords: '座標',
      pax: '年間旅客数',
      distance: '市街中心部まで',
      destinations: '直行目的地',
      seeBelow: '下記参照',
    },
    mapTitle: '空港マップ',
    mapText:
      'このページの地図はOpenStreetMapのデータから描画しています。ターミナルのポリゴンがある空港はターミナル棟、エプロン、アクセス道路を表示し、小さな飛行場は敷地の輪郭と滑走路を表示します。駐車場、バス、飲食、ホテル、レンタカーのアイコンはOSMに登録された内容に従います。',
    mapBullets: [
      '**原寸表示** — このページの地図カードを開いて拡大できます。2000 pxの原本もダウンロードできます。',
      '**位置図** — インタラクティブ地図を移動・拡大して、市街と道路網に対する飛行場の位置を確認できます。',
      '**模式図** — 空港の規模を示す比率ベースの模式図も描画します。実際の配置図ではありません。',
    ],
    routesTitle: '直行目的地',
    routesIntro:
      '直行目的地を近い順に並べています（OpenFlightsの路線データ、2014年時点 — 目安として扱い、航空会社に確認してください）。',
    routesHead: ['目的地', '距離', '主な航空会社'],
    routesClosing: (o) =>
      `直行目的地${o.count}か所の全リストは[${o.name}の路線マップ](/${LOCALE}/route/${o.iata})で確認できます。`,
    noRoutes:
      '路線データにはこの空港の直行便が登録されていません。地域の運航ダイヤはよく変わるため、予約前に航空会社または空港に確認してください。',
    nearbyTitle: '近隣空港',
    nearbyIntro: '該当する便がない場合は、次の近隣飛行場も比較してみてください。',
    nearbyHead: ['空港', '距離'],
    gettingTitle: 'アクセス',
    gettingLead: '空港：',
    mapLink: 'Google マップ',
    gettingNote:
      'このページの位置図は市街と道路網に対する飛行場の位置を示し、地上交通のセクションには登録された公共交通が並びます。運転ルート、時刻表、駐車場は空港自身の情報を確認してください。',
    sizeTitle: '規模と施設',
    kindParagraph: {
      large:
        '大規模空港は複数の滑走路とターミナルを持ち、年間数百万人の旅客を扱います。チェックインと保安検査の待ち時間は時間帯によって大きく変わるため、国際線は出発の2〜3時間前に到着する計画にしてください。',
      medium:
        '中規模空港は地域ハブです。コンパクトなターミナル、歩いて移動できる距離、大規模ハブより速いチェックインが利点ですが、便数が少ないため乗り遅れた後の振り替えは難しくなります。出発の90〜120分前を目安にしてください。',
      small:
        '小規模飛行場は施設が最小限で、通常は単層のターミナルが1つだけ、チェックインカウンターは出発直前に開きます。地上交通は乏しいため、車か事前予約の送迎が安全です。',
      heliport:
        'ヘリポートはヘリコプター便のみを扱い、通常のターミナルの流れはありません。座席数と航続距離は短く、運航事業者が指定する時刻に到着してください。',
    },
    sizeClosing:
      'ターミナル図、チェックイン位置、地上交通の時刻表は空港自身が公開しています。当日正確である必要がある情報は空港の案内を確認してください。ここに誤りがある場合は、お問い合わせページからご連絡ください。確認します。',
    tipsTitle: 'ヒント',
    tipConnection: (o) =>
      `- 上の表に目的地がない場合、通常は${o.name}（${o.iata}）などより大きな空港を経由します。`,
    tipSearch:
      '- ページ上部の検索ボックスで都市名またはIATAコードを入力し、代替案を比較できます。',
    tipPeak:
      '- 繁忙期は小さな飛行場でも駐車場とレンタカーが不足します。運転する場合は早めに予約してください。',
  },
  id: {
    marker:
      'Halaman ini merangkum apa yang dikatakan basis data, peta, dan kumpulan data rute tentang bandara ini.',
    title: (name) => `${name}: panduan bandara`,
    summary: (o) =>
      `${o.name} (${o.iata}) melayani ${o.city}, ${o.country} sebagai ${o.kind}. Peta, tujuan tanpa henti, bandara terdekat, dan hal yang masih perlu dikonfirmasi ke maskapai.`,
    intro: (o) =>
      `${o.name} (IATA **${o.iata}**${o.icao ? `, ICAO ${o.icao}` : ''}) melayani ${o.city}, ${o.country}${o.region ? ` (${o.region})` : ''} sebagai ${o.kind}. ${o.marker}`,
    factsTitle: 'Sekilas',
    facts: {
      iata: 'IATA / ICAO',
      class: 'Kelas bandara',
      location: 'Lokasi',
      coords: 'Koordinat',
      pax: 'Penumpang per tahun',
      distance: 'Ke pusat kota',
      destinations: 'Tujuan tanpa henti',
      seeBelow: 'lihat di bawah',
    },
    mapTitle: 'Peta bandara',
    mapText:
      'Peta di halaman ini dibuat dari data OpenStreetMap: bandara dengan poligon terminal menampilkan gedung terminal, apron, dan jalan akses, sedangkan lapangan kecil menampilkan garis besar aerodrome dan landasan. Ikon parkir, bus, makanan, hotel, dan sewa mobil mengikuti apa yang dipetakan di OSM.',
    mapBullets: [
      '**Tampilan ukuran penuh** — buka kartu peta di halaman ini untuk memperbesar; aslinya 2000 px dapat diunduh.',
      '**Peta lokasi** — peta interaktif dapat digeser dan diperbesar untuk melihat lapangan terhadap kota dan jaringan jalan.',
      '**Skema** — halaman juga menggambar skema berbasis proporsi untuk menunjukkan skala bandara; itu bukan tata letak sebenarnya.',
    ],
    routesTitle: 'Tujuan tanpa henti',
    routesIntro:
      'Tujuan tanpa henti, yang terdekat lebih dulu (kumpulan data rute OpenFlights, disusun 2014 — anggap indikatif dan konfirmasikan ke maskapai):',
    routesHead: ['Tujuan', 'Jarak', 'Maskapai utama'],
    routesClosing: (o) =>
      `Daftar lengkap ${o.count} tujuan tanpa henti ada di [peta rute ${o.name}](/${LOCALE}/route/${o.iata}).`,
    noRoutes:
      'Kumpulan data rute tidak memuat layanan tanpa henti untuk bandara ini. Jadwal regional sering berubah — konfirmasikan ke maskapai atau bandara sebelum memesan.',
    nearbyTitle: 'Bandara terdekat',
    nearbyIntro: 'Jika tidak ada yang cocok, lapangan terdekat ini layak dibandingkan:',
    nearbyHead: ['Bandara', 'Jarak'],
    gettingTitle: 'Cara menuju ke sana',
    gettingLead: 'Bandara:',
    mapLink: 'Google Maps',
    gettingNote:
      'Peta lokasi di halaman ini menunjukkan lapangan terhadap kota dan jaringan jalan, dan bagian transportasi darat mencantumkan angkutan umum yang tercatat. Untuk rute berkendara, jadwal, dan parkir, andalkan informasi bandara sendiri.',
    sizeTitle: 'Ukuran dan fasilitas',
    kindParagraph: {
      large:
        'Bandara besar memiliki beberapa landasan dan terminal serta melayani jutaan penumpang per tahun. Waktu antre di check-in dan keamanan sangat bervariasi menurut jam; untuk penerbangan internasional, rencanakan tiba 2–3 jam sebelum keberangkatan.',
      medium:
        'Bandara sedang adalah hub regional: terminal ringkas, jarak yang bisa ditempuh dengan berjalan kaki, dan biasanya check-in lebih cepat daripada hub besar — tetapi frekuensinya lebih sedikit, sehingga menjadwalkan ulang setelah ketinggalan penerbangan lebih sulit. Targetkan 90–120 menit sebelum keberangkatan.',
      small:
        'Lapangan kecil memiliki fasilitas minimal, biasanya satu terminal satu lantai yang loket check-in-nya buka tak lama sebelum penerbangan. Transportasi darat terbatas; mobil sendiri atau transfer yang dipesan lebih aman.',
      heliport:
        'Heliport hanya melayani penerbangan helikopter — tidak ada alur terminal biasa. Jumlah kursi dan rutenya pendek; datang pada waktu yang ditentukan operator.',
    },
    sizeClosing:
      'Denah terminal, lokasi check-in, dan jadwal transportasi darat diterbitkan oleh bandara sendiri; untuk detail yang harus akurat pada hari perjalanan, andalkan informasi bandara. Jika ada yang tampak salah di sini, beri tahu kami melalui halaman kontak dan kami akan memeriksanya.',
    tipsTitle: 'Tips',
    tipConnection: (o) =>
      `- Jika tujuan Anda tidak ada di tabel di atas, biasanya Anda akan transit melalui ${o.name} (${o.iata}) atau bandara yang lebih besar.`,
    tipSearch:
      '- Gunakan kotak pencarian di bagian atas halaman untuk membandingkan alternatif: ketik nama kota atau kode IATA.',
    tipPeak:
      '- Pada musim ramai, parkir dan mobil sewaan juga langka di lapangan kecil — pesan lebih awal jika Anda akan menyetir.',
  },
  vi: {
    marker:
      'Trang này tổng hợp những gì cơ sở dữ liệu, bản đồ và bộ dữ liệu tuyến bay cho biết về sân bay này.',
    title: (name) => `${name}: hướng dẫn sân bay`,
    summary: (o) =>
      `${o.name} (${o.iata}) phục vụ ${o.city}, ${o.country} với vai trò ${o.kind}. Bản đồ, điểm đến bay thẳng, sân bay lân cận và những gì cần xác nhận với hãng bay.`,
    intro: (o) =>
      `${o.name} (IATA **${o.iata}**${o.icao ? `, ICAO ${o.icao}` : ''}) phục vụ ${o.city}, ${o.country}${o.region ? ` (${o.region})` : ''} với vai trò ${o.kind}. ${o.marker}`,
    factsTitle: 'Tóm tắt',
    facts: {
      iata: 'IATA / ICAO',
      class: 'Cấp sân bay',
      location: 'Vị trí',
      coords: 'Tọa độ',
      pax: 'Hành khách mỗi năm',
      distance: 'Đến trung tâm thành phố',
      destinations: 'Điểm đến bay thẳng',
      seeBelow: 'xem bên dưới',
    },
    mapTitle: 'Bản đồ sân bay',
    mapText:
      'Bản đồ trên trang này được dựng từ dữ liệu OpenStreetMap: sân bay có đa giác nhà ga hiển thị tòa nhà ga, sân đỗ và đường vào, còn sân bay nhỏ hiển thị đường viền sân bay và đường băng. Biểu tượng bãi đỗ xe, xe buýt, ăn uống, khách sạn và thuê xe theo những gì được vẽ trên OSM.',
    mapBullets: [
      '**Xem kích thước đầy đủ** — mở thẻ bản đồ trên trang này để phóng to; bản gốc 2000 px có thể tải xuống.',
      '**Bản đồ vị trí** — bản đồ tương tác cho phép kéo và phóng to để xem sân bay so với thành phố và mạng lưới đường bộ.',
      '**Sơ đồ** — trang cũng vẽ sơ đồ theo tỷ lệ để cho biết quy mô sân bay; đó không phải sơ đồ thực tế.',
    ],
    routesTitle: 'Điểm đến bay thẳng',
    routesIntro:
      'Các điểm đến bay thẳng, gần nhất trước (bộ dữ liệu tuyến OpenFlights, biên soạn năm 2014 — chỉ mang tính tham khảo, hãy xác nhận với hãng bay):',
    routesHead: ['Điểm đến', 'Khoảng cách', 'Hãng bay chính'],
    routesClosing: (o) =>
      `Danh sách đầy đủ ${o.count} điểm đến bay thẳng có trong [bản đồ tuyến ${o.name}](/${LOCALE}/route/${o.iata}).`,
    noRoutes:
      'Bộ dữ liệu tuyến không có chuyến bay thẳng nào cho sân bay này. Lịch bay khu vực thay đổi thường xuyên — hãy xác nhận với hãng bay hoặc sân bay trước khi đặt vé.',
    nearbyTitle: 'Sân bay lân cận',
    nearbyIntro: 'Nếu không có lựa chọn phù hợp, nên so sánh các sân bay gần đây:',
    nearbyHead: ['Sân bay', 'Khoảng cách'],
    gettingTitle: 'Cách đến',
    gettingLead: 'Sân bay:',
    mapLink: 'Google Maps',
    gettingNote:
      'Bản đồ vị trí trên trang này cho thấy sân bay so với thành phố và mạng lưới đường bộ, còn mục giao thông mặt đất liệt kê phương tiện công cộng đã ghi nhận. Về lộ trình lái xe, thời gian biểu và bãi đỗ, hãy dựa vào thông tin của chính sân bay.',
    sizeTitle: 'Quy mô và tiện nghi',
    kindParagraph: {
      large:
        'Sân bay lớn có nhiều đường băng và nhà ga, phục vụ hàng triệu hành khách mỗi năm. Thời gian chờ làm thủ tục và an ninh thay đổi mạnh theo giờ; với chuyến quốc tế, hãy đến trước giờ khởi hành 2–3 tiếng.',
      medium:
        'Sân bay quy mô trung bình là trung tâm khu vực: nhà ga gọn, khoảng cách đi bộ và thường làm thủ tục nhanh hơn sân bay lớn — nhưng ít chuyến hơn, nên đổi vé sau khi lỡ chuyến sẽ khó hơn. Hãy nhắm đến 90–120 phút trước giờ khởi hành.',
      small:
        'Sân bay nhỏ có tiện nghi tối thiểu, thường chỉ một nhà ga một tầng với quầy làm thủ tục mở ngay trước chuyến. Giao thông mặt đất thưa; tự lái xe hoặc đặt trước dịch vụ đưa đón là lựa chọn an toàn hơn.',
      heliport:
        'Sân bay trực thăng chỉ phục vụ chuyến bay trực thăng — không có quy trình nhà ga thông thường. Số ghế và chặng bay ngắn; hãy đến đúng giờ nhà vận hành thông báo.',
    },
    sizeClosing:
      'Sơ đồ nhà ga, vị trí làm thủ tục và thời gian biểu giao thông mặt đất do chính sân bay công bố; với thông tin phải chính xác trong ngày đi, hãy dựa vào hướng dẫn của sân bay. Nếu thấy nội dung ở đây sai, hãy cho chúng tôi biết qua trang liên hệ để kiểm tra.',
    tipsTitle: 'Mẹo',
    tipConnection: (o) =>
      `- Nếu điểm đến của bạn không có trong bảng trên, thường bạn sẽ quá cảnh qua ${o.name} (${o.iata}) hoặc một sân bay lớn hơn.`,
    tipSearch:
      '- Dùng ô tìm kiếm ở đầu trang để so sánh các lựa chọn: nhập tên thành phố hoặc mã IATA.',
    tipPeak:
      '- Vào cao điểm, bãi đỗ và xe thuê cũng khan hiếm ở sân bay nhỏ — hãy đặt trước nếu bạn tự lái.',
  },
  ru: {
    marker:
      'Эта страница собирает то, что база данных, карты и набор данных о маршрутах говорят об этом аэропорте.',
    title: (name) => `${name}: путеводитель по аэропорту`,
    summary: (o) =>
      `${o.name} (${o.iata}) обслуживает ${o.city}, ${o.country} как ${o.kind}. Карта, прямые направления, соседние аэропорты и то, что ещё нужно уточнить у авиакомпании.`,
    intro: (o) =>
      `${o.name} (IATA **${o.iata}**${o.icao ? `, ICAO ${o.icao}` : ''}) обслуживает ${o.city}, ${o.country}${o.region ? ` (${o.region})` : ''} как ${o.kind}. ${o.marker}`,
    factsTitle: 'Кратко',
    facts: {
      iata: 'IATA / ICAO',
      class: 'Класс аэропорта',
      location: 'Расположение',
      coords: 'Координаты',
      pax: 'Пассажиров в год',
      distance: 'До центра города',
      destinations: 'Прямые направления',
      seeBelow: 'см. ниже',
    },
    mapTitle: 'Карта аэропорта',
    mapText:
      'Карта на этой странице строится по данным OpenStreetMap: аэропорты с полигонами терминалов показывают здания терминалов, перроны и подъездные дороги, а небольшие площадки — контур аэродрома и взлётно-посадочную полосу. Значки парковки, автобусов, питания, отелей и проката автомобилей следуют тому, что нанесено в OSM.',
    mapBullets: [
      '**Полноразмерный вид** — откройте карточку карты на этой странице, чтобы приблизить; оригинал 2000 px можно скачать.',
      '**Карта расположения** — интерактивную карту можно перетаскивать и масштабировать, чтобы увидеть аэродром относительно города и дорожной сети.',
      '**Схема** — страница также рисует пропорциональную схему, показывающую масштаб аэропорта; это не реальный план.',
    ],
    routesTitle: 'Прямые направления',
    routesIntro:
      'Прямые направления, ближайшие первыми (набор данных OpenFlights, составлен в 2014 году — считайте ориентиром и уточняйте у авиакомпании):',
    routesHead: ['Направление', 'Расстояние', 'Основные авиакомпании'],
    routesClosing: (o) =>
      `Полный список прямых направлений (${o.count}) — на [карте маршрутов ${o.name}](/${LOCALE}/route/${o.iata}).`,
    noRoutes:
      'В наборе данных о маршрутах нет прямых рейсов для этого аэропорта. Региональные расписания часто меняются — уточняйте у авиакомпании или в аэропорту перед бронированием.',
    nearbyTitle: 'Соседние аэропорты',
    nearbyIntro: 'Если ничего не подходит, стоит сравнить эти ближайшие аэродромы:',
    nearbyHead: ['Аэропорт', 'Расстояние'],
    gettingTitle: 'Как добраться',
    gettingLead: 'Аэропорт:',
    mapLink: 'Google Maps',
    gettingNote:
      'Карта расположения на этой странице показывает аэродром относительно города и дорожной сети, а раздел наземного транспорта перечисляет учтённый общественный транспорт. Для маршрутов, расписаний и парковки полагайтесь на информацию самого аэропорта.',
    sizeTitle: 'Размер и инфраструктура',
    kindParagraph: {
      large:
        'Крупные аэропорты имеют несколько полос и терминалов и обслуживают миллионы пассажиров в год. Время ожидания на регистрации и досмотре сильно зависит от часа; на международные рейсы приезжайте за 2–3 часа до вылета.',
      medium:
        'Аэропорты среднего размера — региональные узлы: компактный терминал, короткие пешие расстояния и обычно более быстрая регистрация, чем в крупном хабе, но меньше рейсов, поэтому перебронировать после опоздания сложнее. Ориентируйтесь на 90–120 минут до вылета.',
      small:
        'Небольшие аэродромы имеют минимум удобств, обычно один одноуровневый терминал, стойки регистрации в котором открываются незадолго до рейса. Наземный транспорт редок; надёжнее приехать на своей машине или на заказанном трансфере.',
      heliport:
        'Вертодромы обслуживают только вертолётные рейсы — обычного терминального процесса нет. Число мест и маршруты короткие; приезжайте ко времени, указанному оператором.',
    },
    sizeClosing:
      'Планы терминалов, расположение регистрации и расписания наземного транспорта публикует сам аэропорт; для сведений, которые должны быть точными в день поездки, полагайтесь на его информацию. Если здесь что-то выглядит неправильно, сообщите нам через страницу контактов, и мы проверим.',
    tipsTitle: 'Советы',
    tipConnection: (o) =>
      `- Если вашего направления нет в таблице выше, обычно вы летите через ${o.name} (${o.iata}) или другой более крупный аэропорт.`,
    tipSearch:
      '- Используйте поле поиска вверху страницы, чтобы сравнить варианты: введите название города или код IATA.',
    tipPeak:
      '- В высокий сезон на небольших аэродромах не хватает парковки и арендных машин — бронируйте заранее, если едете на автомобиле.',
  },
  tr: {
    marker:
      'Bu sayfa, veritabanı, haritalar ve rota veri kümesinin bu havalimanı hakkında söylediklerini bir araya getirir.',
    title: (name) => `${name}: havalimanı rehberi`,
    summary: (o) =>
      `${o.name} (${o.iata}), ${o.city}, ${o.country} kentine ${o.kind} olarak hizmet verir. Harita, aktarmasız destinasyonlar, yakın havalimanları ve havayoluna doğrulanması gerekenler.`,
    intro: (o) =>
      `${o.name} (IATA **${o.iata}**${o.icao ? `, ICAO ${o.icao}` : ''}), ${o.city}, ${o.country}${o.region ? ` (${o.region})` : ''} kentine ${o.kind} olarak hizmet verir. ${o.marker}`,
    factsTitle: 'Bir bakışta',
    facts: {
      iata: 'IATA / ICAO',
      class: 'Havalimanı sınıfı',
      location: 'Konum',
      coords: 'Koordinatlar',
      pax: 'Yıllık yolcu',
      distance: 'Şehir merkezine',
      destinations: 'Aktarmasız destinasyonlar',
      seeBelow: 'aşağıya bakın',
    },
    mapTitle: 'Havalimanı haritası',
    mapText:
      'Bu sayfadaki harita OpenStreetMap verilerinden çizilir: terminal poligonu olan havalimanları terminal binalarını, apronları ve erişim yollarını gösterir; küçük alanlar ise havaalanı sınırını ve pisti gösterir. Otopark, otobüs, yeme-içme, otel ve araç kiralama simgeleri OSM’de haritalananları izler.',
    mapBullets: [
      '**Tam boy görünüm** — bu sayfadaki harita kartını açıp yakınlaştırın; 2000 px orijinal indirilebilir.',
      '**Konum haritası** — etkileşimli harita kaydırılıp yakınlaştırılarak havaalanının şehir ve yol ağına göre konumu görülebilir.',
      '**Şema** — sayfa ayrıca havalimanının ölçeğini göstermek için oransal bir şema çizer; gerçek yerleşim planı değildir.',
    ],
    routesTitle: 'Aktarmasız destinasyonlar',
    routesIntro:
      'Aktarmasız destinasyonlar, en yakın önce (OpenFlights rota veri kümesi, 2014 derlemesi — gösterge niteliğinde kabul edin ve havayoluna doğrulatın):',
    routesHead: ['Destinasyon', 'Mesafe', 'Başlıca havayolları'],
    routesClosing: (o) =>
      `${o.count} aktarmasız destinasyonun tam listesi [${o.name} rota haritasında](/${LOCALE}/route/${o.iata}).`,
    noRoutes:
      'Rota veri kümesinde bu havalimanı için aktarmasız sefer yok. Bölgesel tarifeler sık değişir — rezervasyondan önce havayoluna veya havalimanına doğrulatın.',
    nearbyTitle: 'Yakın havalimanları',
    nearbyIntro: 'Uygun bir seçenek yoksa şu yakın havaalanlarını karşılaştırmaya değer:',
    nearbyHead: ['Havalimanı', 'Mesafe'],
    gettingTitle: 'Nasıl gidilir',
    gettingLead: 'Havalimanı:',
    mapLink: 'Google Maps',
    gettingNote:
      'Bu sayfadaki konum haritası havaalanını şehir ve yol ağına göre gösterir; kara ulaşımı bölümü kayıtlı toplu taşımayı listeler. Sürüş güzergâhları, tarifeler ve otopark için havalimanının kendi bilgilerine güvenin.',
    sizeTitle: 'Büyüklük ve olanaklar',
    kindParagraph: {
      large:
        'Büyük havalimanları birden fazla pist ve terminale sahiptir ve yılda milyonlarca yolcu ağırlar. Check-in ve güvenlik kuyrukları günün saatine göre büyük ölçüde değişir; uluslararası uçuşlar için kalkıştan 2–3 saat önce gelmeyi planlayın.',
      medium:
        'Orta büyüklükteki havalimanları bölgesel merkezlerdir: kompakt bir terminal, yürünebilir mesafeler ve genellikle büyük bir merkezden daha hızlı check-in — ancak daha az sefer olduğu için kaçırılan uçuştan sonra yeniden rezervasyon daha zordur. Kalkıştan 90–120 dakika önce gelmeyi hedefleyin.',
      small:
        'Küçük havaalanlarında olanaklar sınırlıdır; genellikle tek katlı bir terminal ve check-in kontuarları uçuştan kısa süre önce açılır. Kara ulaşımı seyrektir; kendi aracınız veya önceden ayarlanmış transfer daha güvenlidir.',
      heliport:
        'Helikopter pistleri yalnızca helikopter uçuşlarına hizmet eder — olağan terminal akışı yoktur. Koltuk sayısı ve rotalar kısadır; işletmecinin belirttiği saatte gelin.',
    },
    sizeClosing:
      'Terminal planları, check-in konumları ve kara ulaşımı tarifeleri havalimanının kendisi tarafından yayımlanır; seyahat günü doğru olması gereken ayrıntılar için havalimanının bilgilerine güvenin. Burada yanlış görünen bir şey varsa iletişim sayfasından bize bildirin, kontrol edelim.',
    tipsTitle: 'İpuçları',
    tipConnection: (o) =>
      `- Destinasyonunuz yukarıdaki tabloda yoksa genellikle ${o.name} (${o.iata}) veya daha büyük bir havalimanı üzerinden aktarma yaparsınız.`,
    tipSearch:
      '- Alternatifleri karşılaştırmak için sayfanın üstündeki arama kutusunu kullanın: bir şehir adı veya IATA kodu yazın.',
    tipPeak:
      '- Yoğun sezonda küçük havaalanlarında da otopark ve kiralık araç sıkıntısı olur — araç kullanacaksanız önceden rezervasyon yapın.',
  },
  th: {
    marker:
      'หน้านี้รวบรวมสิ่งที่ฐานข้อมูล แผนที่ และชุดข้อมูลเส้นทางระบุเกี่ยวกับสนามบินนี้',
    title: (name) => `${name}: คู่มือสนามบิน`,
    summary: (o) =>
      `${o.name} (${o.iata}) ให้บริการ ${o.city}, ${o.country} ในฐานะ${o.kind} แผนที่ เส้นทางบินตรง สนามบินใกล้เคียง และสิ่งที่ยังต้องยืนยันกับสายการบิน`,
    intro: (o) =>
      `${o.name} (IATA **${o.iata}**${o.icao ? `, ICAO ${o.icao}` : ''}) ให้บริการ ${o.city}, ${o.country}${o.region ? ` (${o.region})` : ''} ในฐานะ${o.kind} ${o.marker}`,
    factsTitle: 'ข้อมูลโดยสรุป',
    facts: {
      iata: 'IATA / ICAO',
      class: 'ประเภทสนามบิน',
      location: 'ที่ตั้ง',
      coords: 'พิกัด',
      pax: 'ผู้โดยสารต่อปี',
      distance: 'ถึงใจกลางเมือง',
      destinations: 'จุดหมายบินตรง',
      seeBelow: 'ดูด้านล่าง',
    },
    mapTitle: 'แผนที่สนามบิน',
    mapText:
      'แผนที่ในหน้านี้สร้างจากข้อมูล OpenStreetMap: สนามบินที่มีรูปหลายเหลี่ยมของอาคารผู้โดยสารจะแสดงอาคาร ลานจอดอากาศยาน และถนนทางเข้า ส่วนสนามบินขนาดเล็กจะแสดงเส้นรอบสนามบินและทางวิ่ง ไอคอนที่จอดรถ รถบัส ร้านอาหาร โรงแรม และรถเช่าเป็นไปตามที่ทำแผนที่ไว้ใน OSM',
    mapBullets: [
      '**มุมมองขนาดเต็ม** — เปิดการ์ดแผนที่ในหน้านี้เพื่อซูม และดาวน์โหลดต้นฉบับ 2000 px ได้',
      '**แผนที่ตำแหน่ง** — แผนที่แบบโต้ตอบเลื่อนและซูมได้ เพื่อดูสนามบินเทียบกับเมืองและโครงข่ายถนน',
      '**แผนผัง** — หน้านี้ยังวาดแผนผังตามสัดส่วนเพื่อบอกขนาดของสนามบิน ไม่ใช่ผังจริง',
    ],
    routesTitle: 'จุดหมายบินตรง',
    routesIntro:
      'จุดหมายบินตรง เรียงจากใกล้ที่สุด (ชุดข้อมูลเส้นทาง OpenFlights รวบรวมปี 2014 — ใช้เป็นแนวทางและยืนยันกับสายการบิน):',
    routesHead: ['จุดหมาย', 'ระยะทาง', 'สายการบินหลัก'],
    routesClosing: (o) =>
      `รายการจุดหมายบินตรงทั้ง ${o.count} แห่งอยู่ใน[แผนที่เส้นทางของ ${o.name}](/${LOCALE}/route/${o.iata})`,
    noRoutes:
      'ชุดข้อมูลเส้นทางไม่มีเที่ยวบินตรงสำหรับสนามบินนี้ ตารางบินภูมิภาคเปลี่ยนแปลงบ่อย — ยืนยันกับสายการบินหรือสนามบินก่อนจอง',
    nearbyTitle: 'สนามบินใกล้เคียง',
    nearbyIntro: 'หากไม่มีตัวเลือกที่เหมาะ ควรเปรียบเทียบสนามบินใกล้เคียงเหล่านี้:',
    nearbyHead: ['สนามบิน', 'ระยะทาง'],
    gettingTitle: 'การเดินทางไปยังสนามบิน',
    gettingLead: 'สนามบิน:',
    mapLink: 'Google Maps',
    gettingNote:
      'แผนที่ตำแหน่งในหน้านี้แสดงสนามบินเทียบกับเมืองและโครงข่ายถนน และส่วนการเดินทางภาคพื้นดินระบุระบบขนส่งสาธารณะที่บันทึกไว้ สำหรับเส้นทางขับรถ ตารางเวลา และที่จอดรถ โปรดอ้างอิงข้อมูลของสนามบินเอง',
    sizeTitle: 'ขนาดและสิ่งอำนวยความสะดวก',
    kindParagraph: {
      large:
        'สนามบินขนาดใหญ่มีทางวิ่งและอาคารผู้โดยสารหลายแห่ง รองรับผู้โดยสารหลายล้านคนต่อปี เวลารอเช็คอินและตรวจความปลอดภัยแตกต่างกันมากตามช่วงเวลา สำหรับเที่ยวบินระหว่างประเทศควรมาถึงก่อนออกเดินทาง 2–3 ชั่วโมง',
      medium:
        'สนามบินขนาดกลางเป็นศูนย์กลางของภูมิภาค: อาคารผู้โดยสารกระชับ เดินถึงกันได้ และมักเช็คอินเร็วกว่าศูนย์กลางขนาดใหญ่ แต่มีเที่ยวบินน้อยกว่า จึงจัดเที่ยวบินใหม่หลังพลาดเที่ยวบินได้ยากกว่า ควรมาถึงก่อนออกเดินทาง 90–120 นาที',
      small:
        'สนามบินขนาดเล็กมีสิ่งอำนวยความสะดวกจำกัด มักมีอาคารผู้โดยสารชั้นเดียวและเคาน์เตอร์เช็คอินเปิด shortly ก่อนเที่ยวบิน การขนส่งภาคพื้นดินมีน้อย การขับรถเองหรือจองรถรับส่งล่วงหน้าปลอดภัยกว่า',
      heliport:
        'ลานจอดเฮลิคอปเตอร์ให้บริการเฉพาะเที่ยวบินเฮลิคอปเตอร์ ไม่มีขั้นตอนอาคารผู้โดยสารตามปกติ จำนวนที่นั่งและเส้นทางสั้น ควรมาถึงตามเวลาที่ผู้ให้บริการกำหนด',
    },
    sizeClosing:
      'ผังอาคารผู้โดยสาร ตำแหน่งเช็คอิน และตารางเวลาขนส่งภาคพื้นดินเผยแพร่โดยสนามบินเอง สำหรับรายละเอียดที่ต้องถูกต้องในวันเดินทาง โปรดอ้างอิงข้อมูลของสนามบิน หากเห็นว่าข้อมูลที่นี่ไม่ถูกต้อง แจ้งเราผ่านหน้าติดต่อและเราจะตรวจสอบ',
    tipsTitle: 'เคล็ดลับ',
    tipConnection: (o) =>
      `- หากจุดหมายของคุณไม่อยู่ในตารางด้านบน โดยปกติคุณจะต่อเครื่องที่ ${o.name} (${o.iata}) หรือสนามบินที่ใหญ่กว่า`,
    tipSearch:
      '- ใช้ช่องค้นหาด้านบนของหน้าเพื่อเปรียบเทียบทางเลือก: พิมพ์ชื่อเมืองหรือรหัส IATA',
    tipPeak:
      '- ในฤดูท่องเที่ยว ที่จอดรถและรถเช่าอาจไม่เพียงพอแม้ในสนามบินเล็ก — จองล่วงหน้าหากคุณจะขับรถ',
  },
};

Object.assign(T, GUIDE_T);

/** Replace the one English word that slipped into the Thai draft. */
const cleanThai = (text) => text.replace('shortly ก่อนเที่ยวบิน', 'ไม่นานก่อนเที่ยวบิน');

function guide({ iata, info, record, point, destinations, nearest, kind }) {
  const t = T[LOCALE];
  const name = airportName(info.name_en);
  const city = cityName(info.city_en ?? '');
  const country = countryName(info.country_name_en);
  const region = info.region_en ? regionName(info.region_en) : '';
  const kindLabel = kindName(kind);
  const paxM = record ? parsePax(record.pax) : null;
  const distanceKm = record ? parseDistance(record.distance) : null;
  const icao = facts[iata]?.icao ?? record?.icao ?? null;
  const pax = paxText(paxM);

  const title = t.title(name);
  const summary = t.summary({ name, iata, city, country, kind: kindLabel });
  const intro = t.intro({
    name,
    iata,
    icao,
    city,
    country,
    region,
    kind: kindLabel,
    marker: t.marker,
  });

  const lines = [intro, ''];

  lines.push(`## ${t.factsTitle}`, '', '| | |', '| --- | --- |');
  lines.push(`| ${t.facts.iata} | ${iata} / ${icao ?? '—'} |`);
  lines.push(`| ${t.facts.class} | ${kindLabel} |`);
  lines.push(`| ${t.facts.location} | ${city}, ${country}${region ? ` (${region})` : ''} |`);
  if (point) lines.push(`| ${t.facts.coords} | ${point.lat.toFixed(4)}, ${point.lng.toFixed(4)} |`);
  if (pax) lines.push(`| ${t.facts.pax} | ${pax} |`);
  if (distanceKm != null) lines.push(`| ${t.facts.distance} | ${num(distanceKm)} km |`);
  if (destinations?.length) lines.push(`| ${t.facts.destinations} | ${destinations.length} (${t.facts.seeBelow}) |`);
  lines.push('');

  lines.push(`## ${t.mapTitle}`, '', t.mapText, '');
  for (const bullet of t.mapBullets) lines.push(`- ${bullet}`);
  lines.push('');

  lines.push(`## ${t.routesTitle}`, '');
  if (destinations?.length) {
    lines.push(t.routesIntro, '');
    lines.push(`| ${t.routesHead.join(' | ')} |`, '| --- | --- | --- |');
    for (const d of destinations.slice(0, 8)) {
      const carriers = d.carriers
        .slice(0, 2)
        .map((c) => routes.airlines[c] ?? c)
        .join(', ');
      lines.push(
        `| ${displayName(d.iata)} (${d.iata}) | ${num(fmtKm(d.km))} km | ${carriers} |`
      );
    }
    lines.push('');
    lines.push(t.routesClosing({ name, iata, count: destinations.length }));
    lines.push('');
  } else {
    lines.push(t.noRoutes, '');
  }

  if (nearest?.length && point) {
    lines.push(`## ${t.nearbyTitle}`, '', t.nearbyIntro, '');
    lines.push(`| ${t.nearbyHead.join(' | ')} |`, '| --- | --- |');
    for (const n of nearest) {
      lines.push(`| ${displayName(n.code)} (${n.code}) | ${num(fmtKm(n.km))} km |`);
    }
    lines.push('');
  }

  lines.push(`## ${t.gettingTitle}`, '');
  const bits = [];
  if (point) bits.push(`${t.facts.coords.toLowerCase()} ${point.lat.toFixed(4)}, ${point.lng.toFixed(4)}`);
  if (typeof facts[iata]?.elevFt === 'number') {
    bits.push(
      LOCALE === 'ja'
        ? `標高約${num(Math.round(facts[iata].elevFt * 0.3048))} m`
        : LOCALE === 'ru'
          ? `высота около ${num(Math.round(facts[iata].elevFt * 0.3048))} м`
          : `${LOCALE === 'th' ? 'ความสูงประมาณ' : LOCALE === 'tr' ? 'rakım yaklaşık' : LOCALE === 'vi' ? 'độ cao khoảng' : LOCALE === 'id' ? 'ketinggian sekitar' : LOCALE === 'pt' ? 'altitude cerca de' : LOCALE === 'es' ? 'altitud unos' : 'высота'} ${num(Math.round(facts[iata].elevFt * 0.3048))} m`
    );
  }
  if (distanceKm != null) {
    bits.push(
      LOCALE === 'ja'
        ? `市街中心部から約${num(distanceKm)} km`
        : LOCALE === 'ru'
          ? `около ${num(distanceKm)} км от центра города`
          : `${LOCALE === 'th' ? 'ห่างจากใจกลางเมืองประมาณ' : LOCALE === 'tr' ? 'şehir merkezinden yaklaşık' : LOCALE === 'vi' ? 'cách trung tâm thành phố khoảng' : LOCALE === 'id' ? 'sekitar' : LOCALE === 'pt' ? 'cerca de' : 'unos'} ${num(distanceKm)} km${LOCALE === 'es' ? ' del centro' : LOCALE === 'pt' ? ' do centro' : LOCALE === 'id' ? ' dari pusat kota' : LOCALE === 'tr' ? ' uzakta' : ''}`
    );
  }
  if (facts[iata]?.scheduled === false) {
    bits.push(
      {
        es: 'hoy sin servicio regular de pasajeros — sobre todo aviación general y chárter',
        pt: 'hoje sem serviço regular de passageiros — sobretudo aviação geral e charter',
        ja: '現在は定期旅客便がなく、主に一般航空とチャーター',
        id: 'saat ini tidak ada layanan penumpang terjadwal — terutama penerbangan umum dan charter',
        vi: 'hiện không có dịch vụ hành khách theo lịch — chủ yếu hàng không chung và thuê chuyến',
        ru: 'сейчас нет регулярного пассажирского сообщения — в основном авиация общего назначения и чартеры',
        tr: 'günümüzde tarifeli yolcu seferi yok — çoğunlukla genel havacılık ve charter',
        th: 'ปัจจุบันไม่มีเที่ยวบินผู้โดยสารตามกำหนด — ส่วนใหญ่เป็นการบินทั่วไปและเช่าเหมาลำ',
      }[LOCALE]
    );
  }
  if (bits.length) lines.push(`${t.gettingLead} ${bits.join('; ')}.`, '');
  if (point) {
    lines.push(
      `- **${t.mapLink}:** [${t.mapLink}](https://www.google.com/maps/search/?api=1&query=${point.lat},${point.lng})`
    );
    lines.push('', t.gettingNote, '');
  }

  lines.push(`## ${t.sizeTitle}`, '', t.kindParagraph[kind] ?? t.kindParagraph.small, '');
  lines.push(t.sizeClosing, '');

  lines.push(`## ${t.tipsTitle}`, '');
  if (destinations?.length) {
    lines.push(t.tipConnection({ name: displayName(destinations[0].iata), iata: destinations[0].iata }));
  }
  lines.push(t.tipSearch);
  lines.push(t.tipPeak);

  let body = lines.join('\n').trim();
  if (LOCALE === 'th') body = cleanThai(body);
  return { title, summary, updated: UPDATED, body };
}

// ----------------------------------------------------------------------- run
const { rows: existing } = await client.query(
  'SELECT subject, body FROM content_documents WHERE kind = $1 AND locale = $2',
  ['airport', LOCALE]
);
const stored = new Map(existing.map((row) => [row.subject, row.body]));
const marker = T[LOCALE].marker;
/** Only airports that have an English guide; SJC is in the directory but has none. */
const { rows: english } = await client.query(
  "SELECT subject FROM content_documents WHERE kind = 'airport' AND locale = 'en'"
);
const guided = new Set(english.map((row) => row.subject));

const targets = [...db.keys()].sort().filter((code) => {
  if (!guided.has(code)) return false;
  if (ONLY.length && !ONLY.includes(code)) return false;
  const body = stored.get(code);
  if (body === undefined) return true;
  return REFRESH && body.includes(marker);
});

console.log(`${targets.length} ${LOCALE} airport guide(s) to write${DRY ? ' (dry run)' : ''}`);
if (DRY) {
  await client.end();
  process.exit(0);
}

const upsert = `
  INSERT INTO content_documents (kind, subject, locale, title, summary, updated, body)
  VALUES ('airport', $1, $2, $3, $4, $5, $6)
  ON CONFLICT (kind, subject, locale) DO UPDATE SET
    title = EXCLUDED.title, summary = EXCLUDED.summary, updated = EXCLUDED.updated,
    body = EXCLUDED.body, updated_at = now()`;

let written = 0;
try {
  await client.query('BEGIN');
  for (const code of targets) {
    const data = guideData(code);
    if (!data) continue;
    const doc = guide(data);
    await client.query(upsert, [code, LOCALE, doc.title, doc.summary, doc.updated, doc.body]);
    written++;
  }
  await client.query('COMMIT');
} catch (err) {
  await client.query('ROLLBACK').catch(() => {});
  throw err;
} finally {
  await client.end();
}
console.log(`wrote ${written} ${LOCALE} guide(s)`);
