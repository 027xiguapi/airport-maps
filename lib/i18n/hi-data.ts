import vocab from './hi-vocab.json';

/**
 * हिन्दी स्थानीयकरण उन संरचित डेटा का जिन्हें डेटाबेस केवल चीनी, पारंपरिक चीनी
 * और अंग्रेज़ी में संग्रहीत करता है (`countries.name_en`,
 * `airports.city_en`, `terminals.name_en`, …)। जर्मन, फ़्रेंच, इतालवी और
 * कोरियाई की तरह हिन्दी अंग्रेज़ी कॉलम को आधार बनाकर रेंडरिंग के समय बंद
 * शब्दावली का अनुवाद करती है:
 *
 *  - देश, क्षेत्र और शहर के नाम स्थापित हिन्दी रूप वाले व्यक्तिवाचक नाम हैं
 *    (जर्मनी, पूर्वी एशिया, बीजिंग), UI पाठ नहीं;
 *  - हवाई अड्डे के नाम अंतर्राष्ट्रीय अंग्रेज़ी नाम हैं, चुनिंदा हब के लिए
 *    अनुवादित (इंचियोन अंतर्राष्ट्रीय हवाई अड्डा) और निर्देशिका बैच के लिए
 *    अपरिवर्तित;
 *  - टर्मिनल नाम, गेट क्षेत्र और सुविधा लेबल एक बंद शब्दावली हैं, जो
 *    db/terminology/en.json से प्रतिबिंबित है।
 *
 * तालिकाएं hi-vocab.json में हैं, इसलिए चलती साइट और सामग्री स्क्रिप्ट एक
 * ही फ़ाइल पढ़ते हैं। अनुपलब्ध मान अंग्रेज़ी पर लौटते हैं: नया हवाई अड्डा
 * या शहर कभी चीनी पाठ नहीं दिखाएगा।
 */

/** ज़मीनी परिवहन आइकन के अनुसार हिन्दी परिवहन लेबल। */
export const hiTransportModes = vocab.transportModes as Record<string, string>;

const translate =
  (table: Record<string, string>) =>
  (value: string): string =>
    table[value] ?? value;

/** अंग्रेज़ी कॉलम के लिए हिन्दी देश नाम। */
export const hindiCountry = translate(vocab.countries);

/** अंग्रेज़ी कॉलम के लिए हिन्दी क्षेत्र नाम। */
export const hindiRegion = translate(vocab.regions);

/** अंग्रेज़ी कॉलम के लिए हिन्दी शहर नाम। */
export const hindiCity = translate(vocab.cities);

/** अंग्रेज़ी कॉलम के लिए हिन्दी हवाई अड्डा नाम। */
export const hindiAirportName = translate(vocab.airports);

/** अंग्रेज़ी कॉलम के लिए हिन्दी टर्मिनल नाम। */
export const hindiTerminalName = translate(vocab.terminals);

/** अंग्रेज़ी कॉलम के लिए हिन्दी सुविधा लेबल। */
export const hindiLabel = translate(vocab.labels);

/**
 * गेट क्षेत्र अंग्रेज़ी परत से या तो कोड रेंज ("A1–A20", "1–10") के रूप में
 * आते हैं या कॉनकोर्स, हॉल या चेक-इन क्षेत्र वाले वाक्यांश के रूप में। केवल
 * वाक्यांशों का अनुवाद चाहिए; कोड भाषा-तटस्थ हैं।
 */
export function hindiGateRange(value: string): string {
  return value
    .replace(/^Check-in \/ Arrivals$/, 'चेक-इन / आगमन')
    .replace(/^Check-in hall$/, 'चेक-इन हॉल')
    .replace(/^Concourse (.+)$/, 'कॉनकोर्स $1')
    .replace(/^Satellite Concourse (.+)$/, 'सैटेलाइट कॉनकोर्स $1');
}

/** वाक्यांश-गेट क्षेत्र ("कॉनकोर्स A") अकेला खड़ा होता है; कोड को "गेट" चाहिए। */
export function isHindiGateRangePhrase(value: string): boolean {
  return /(कॉनकोर्स|सैटेलाइट|चेक-इन|आगमन|टर्मिनल|concourse|check-in)/i.test(value);
}

/**
 * उल्टा सूचकांक: हिन्दी नाम -> अंग्रेज़ी कॉलम मान, खोज बॉक्स के लिए।
 * `search_blob` में केवल चीनी, अंग्रेज़ी और पारंपरिक चीनी नाम हैं, इसलिए
 * "बीजिंग" या "लंदन" लिखने वाला हिन्दी आगंतुक कुछ नहीं पाता। हिन्दी शब्द
 * अंग्रेज़ी में वापस अनूदित होता है और खोज दोनों के लिए चलती है।
 *
 * नुक़्ता वाले अक्षरों को बिना नुक़्ता वाला दूसरा कुंजी मिलता है, क्योंकि
 * कीबोर्ड और आगंतुक अक्सर उन्हें छोड़ देते हैं।
 */
const FOLD: Record<string, string> = {
  'क़': 'क', 'ख़': 'ख', 'ग़': 'ग', 'ज़': 'ज', 'ड़': 'ड', 'ढ़': 'ढ', 'फ़': 'फ', 'य़': 'य',
};
const unaccent = (value: string) =>
  value.toLowerCase().replace(/[क़ख़ग़ज़ड़ढ़फ़य़]/g, (c) => FOLD[c] ?? c);

const REVERSE = (() => {
  const index = new Map<string, string>();
  for (const table of [vocab.countries, vocab.cities, vocab.airports]) {
    for (const [english, hindi] of Object.entries(table)) {
      const key = hindi.trim().toLowerCase();
      if (!key) continue;
      if (!index.has(key)) index.set(key, english);
      const folded = unaccent(key);
      if (folded !== key && !index.has(folded)) index.set(folded, english);
    }
  }
  return index;
})();

/** हिन्दी स्थान या हवाई अड्डा नाम का अंग्रेज़ी समकक्ष, या null। */
export function hindiSearchAlias(term: string): string | null {
  const key = term.trim().toLowerCase();
  return REVERSE.get(key) ?? REVERSE.get(unaccent(key)) ?? null;
}
