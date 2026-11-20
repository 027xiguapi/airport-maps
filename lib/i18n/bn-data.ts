import vocab from './bn-vocab.json';

/**
 * কাঠামোবদ্ধ ডেটার বাংলা স্থানীয়করণ যা ডেটাবেস শুধু চীনা, প্রথাগত চীনা ও
 * ইংরেজিতে সংরক্ষণ করে (`countries.name_en`, `airports.city_en`,
 * `terminals.name_en`, …)। জার্মান, ফরাসি, ইতালীয় ও কোরিয়ানের মতো বাংলা
 * ইংরেজি কলামকে ভিত্তি করে রেন্ডারিংয়ের সময় বদ্ধ শব্দভাণ্ডার অনুবাদ করে:
 *
 *  - দেশ, অঞ্চল ও শহরের নাম প্রতিষ্ঠিত বাংলা রূপের নিজস্ব নাম (জার্মানি,
 *    পূর্ব এশিয়া, বেইজিং), UI পাঠ নয়;
 *  - বিমানবন্দরের নাম আন্তর্জাতিক ইংরেজি নাম, নির্বাচিত হাবের জন্য অনূদিত
 *    (ইনছন আন্তর্জাতিক বিমানবন্দর) এবং ডিরেক্টরি ব্যাচের জন্য অপরিবর্তিত;
 *  - টার্মিনাল নাম, গেট এলাকা ও সুবিধা লেবেল একটি বদ্ধ শব্দভাণ্ডার,
 *    db/terminology/en.json থেকে প্রতিফলিত।
 *
 * টেবিলগুলো bn-vocab.json-এ, তাই চলমান সাইট ও কনটেন্ট স্ক্রিপ্ট একই ফাইল
 * পড়ে। অনুপস্থিত মান ইংরেজিতে ফিরে যায়: নতুন বিমানবন্দর বা শহর কখনও চীনা
 * লেখা দেখায় না।
 */

/** ভূমি পরিবহন আইকন অনুসারে বাংলা পরিবহন লেবেল। */
export const bnTransportModes = vocab.transportModes as Record<string, string>;

const translate =
  (table: Record<string, string>) =>
  (value: string): string =>
    table[value] ?? value;

/** ইংরেজি কলামের জন্য বাংলা দেশের নাম। */
export const bengaliCountry = translate(vocab.countries);

/** ইংরেজি কলামের জন্য বাংলা অঞ্চলের নাম। */
export const bengaliRegion = translate(vocab.regions);

/** ইংরেজি কলামের জন্য বাংলা শহরের নাম। */
export const bengaliCity = translate(vocab.cities);

/** ইংরেজি কলামের জন্য বাংলা বিমানবন্দরের নাম। */
export const bengaliAirportName = translate(vocab.airports);

/** ইংরেজি কলামের জন্য বাংলা টার্মিনালের নাম। */
export const bengaliTerminalName = translate(vocab.terminals);

/** ইংরেজি কলামের জন্য বাংলা সুবিধা লেবেল। */
export const bengaliLabel = translate(vocab.labels);

/**
 * গেট এলাকা ইংরেজি স্তর থেকে হয় কোড রেঞ্জ ("A1–A20", "1–10") হিসেবে আসে,
 * নয় কনকোর্স, হল বা চেক-ইন এলাকার বাক্যাংশ হিসেবে। শুধু বাক্যাংশ অনুবাদ
 * করতে হয়; কোড ভাষা-নিরপেক্ষ।
 */
export function bengaliGateRange(value: string): string {
  return value
    .replace(/^Check-in \/ Arrivals$/, 'চেক-ইন / আগমন')
    .replace(/^Check-in hall$/, 'চেক-ইন হল')
    .replace(/^Concourse (.+)$/, 'কনকোর্স $1')
    .replace(/^Satellite Concourse (.+)$/, 'স্যাটেলাইট কনকোর্স $1');
}

/** বাক্যাংশ-গেট এলাকা ("কনকোর্স A") একা দাঁড়ায়; কোডের জন্য "গেট" দরকার। */
export function isBengaliGateRangePhrase(value: string): boolean {
  return /(কনকোর্স|স্যাটেলাইট|চেক-ইন|আগমন|টার্মিনাল|concourse|check-in)/i.test(value);
}

/**
 * উল্টো সূচি: বাংলা নাম -> ইংরেজি কলাম মান, সার্চ বক্সের জন্য।
 * `search_blob`-এ শুধু চীনা, ইংরেজি ও প্রথাগত চীনা নাম থাকে, তাই "বেইজিং"
 * বা "লন্ডন" লিখলে বাংলা দর্শক কিছুই পান না। বাংলা শব্দটি ইংরেজিতে ফিরিয়ে
 * অনুবাদ হয় এবং অনুসন্ধান দুটোর জন্যই চলে।
 *
 * নুকতা ও চন্দ্রবিন্দুযুক্ত অক্ষরের জন্য দ্বিতীয় কী থাকে, কারণ কীবোর্ড ও
 * দর্শকরা সেগুলো প্রায়ই বাদ দেন।
 */
const FOLD: Record<string, string> = {
  'ড়': 'ড', 'ঢ়': 'ঢ', 'য়': 'য', 'ঁ': '',
  'া': 'া', 'ি': 'ি', 'ী': 'ি', 'ু': 'ু', 'ূ': 'ু', 'ে': 'ে', 'ৈ': 'ে', 'ো': 'ো', 'ৌ': 'ো',
};
const unaccent = (value: string) =>
  value.toLowerCase().replace(/[ড়ঢ়য়ঁ]/g, (c) => FOLD[c] ?? c);

const REVERSE = (() => {
  const index = new Map<string, string>();
  for (const table of [vocab.countries, vocab.cities, vocab.airports]) {
    for (const [english, bengali] of Object.entries(table)) {
      const key = bengali.trim().toLowerCase();
      if (!key) continue;
      if (!index.has(key)) index.set(key, english);
      const folded = unaccent(key);
      if (folded !== key && !index.has(folded)) index.set(folded, english);
    }
  }
  return index;
})();

/** বাংলা স্থান বা বিমানবন্দর নামের ইংরেজি সমতুল্য, বা null। */
export function bengaliSearchAlias(term: string): string | null {
  const key = term.trim().toLowerCase();
  return REVERSE.get(key) ?? REVERSE.get(unaccent(key)) ?? null;
}
