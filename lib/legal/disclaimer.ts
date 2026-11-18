import type { Locale } from '@/lib/i18n/config';

/**
 * The disclaimer page, shipped with the application rather than stored in
 * `content_documents` like the other static pages (lib/content.ts → getPage).
 *
 * Why it does not live in the database: this is the page that discloses the
 * site's affiliate links and its non-official status, so it has to exist the
 * moment the code that carries those links ships. A database row is a second
 * deployment step (content:import, then content:push) and a locale that missed
 * that step would fall back to another language — or 404 — on the one page a
 * reviewer opens to check compliance. Keeping it here makes the English,
 * Chinese, Traditional Chinese, German, French, Italian, Korean, Spanish,
 * Portuguese, Japanese, Indonesian, Vietnamese, Russian, Turkish and Thai
 * versions deploy atomically with the app.
 *
 * Markdown only: `##` headings, `-` bullets, `**bold**` — the same subset the
 * other pages use (components/Markdown.tsx). Do not add links to booking
 * partners or programme-specific claims (an Amazon Associates line, for
 * instance) unless the site has actually joined them.
 */
export type LegalPage = {
  /** Page heading and `<title>`. */
  title: string;
  /** Meta description and the line under the heading. */
  summary: string;
  /** Editorial revision date, `YYYY-MM-DD`; shown as "updated on". */
  updated: string;
  /** Markdown body. */
  body: string;
};

/** One date for every language: the copy is reviewed and revised together. */
const UPDATED = '2026-11-06';

export const DISCLAIMER: Partial<Record<Locale, LegalPage>> = {
  en: {
    title: 'Disclaimer and affiliate disclosure',
    summary:
      "What this site's maps, fares and outbound links are — and are not: data accuracy, affiliate links, advertising and the limits of our liability.",
    updated: UPDATED,
    body: `World Airport Maps is an independent airport reference site. This page explains what the site's content is, how the site is funded, and where its responsibility ends. It applies to every page, in every language.

## Not an official source

This site is not an airport, an airline, a travel agency or a government body, and it is not affiliated with any of them. It is a planning aid built from public data and editorial work.

- **The terminal diagrams are illustrative.** They are drawn from terminal and gate counts and the ground-transport nodes, to show how an airport is put together — not from surveyed floor plans. Shape, scale and orientation may differ from the real building.
- **Details go stale.** Terminals open and close, gate numbers change, airlines move between terminals, and transport routes, first and last service times and fares are revised without notice.
- **Check before you travel.** For gates, check-in deadlines, minimum connection times, visas, entry rules and security requirements, rely on the airport, your airline and the relevant authorities.

## Fares, deals and bookings

The fares in the deals section are **submitted by readers** and are neither verified nor guaranteed by this site.

- A listed price is what one person saw at one moment. Taxes, fees, baggage, seat selection, travel dates and availability can all change it.
- This site does not sell tickets, hold reservations or take payments. Every booking is completed on the third party's own website, under its terms and privacy policy.
- No offer is guaranteed to still be available. Listings can be removed or expire at any time, and a price that has changed is not a misrepresentation by this site.

## Affiliate links

Some outbound links on this site are **affiliate links** — mainly the booking links attached to fares, plus a few transport and service recommendations. If you follow one and complete a purchase, the operator may pay this site a commission.

- The commission comes out of the operator's margin. **It does not change the price you pay**, and you are not charged more for arriving through this site.
- Commission does not buy coverage. The site does not sell rankings, reviews or placements, and no payment decides what a page says.
- The disclosure appears on the page that carries each link as well as here; this page is the site-wide statement.

## Advertising

Advertising on this site is served by third-party ad networks; the privacy policy lists the current ones. Advertisers do not obtain reader data through this site and cannot influence editorial content. An ad appearing here is not an endorsement of the product or service, nor a warranty of its safety, legality or quality.

## Reader-submitted content

Fares, comments and corrections are submitted by readers. Obviously unlawful material is removed, but the site cannot verify each submission for accuracy, currency or completeness. Decisions taken on that basis are your own responsibility.

## External websites

This site may link to airports, airlines, transport operators and other third parties. Their content, prices, availability and privacy practices are their own responsibility; this site does not control them and accepts no liability for them.

## Limitation of liability

The full clause is in the terms of use. In short: to the fullest extent permitted by law, the site is not liable for missed flights, changed itineraries, denied boarding, additional costs or lost data arising from use of this site.

## Questions and corrections

If a price, a map or a route here is wrong, tell us through the contact page — corrections are handled first. Legal questions about this page reach us the same way.`,
  },

  zh: {
    title: '免责声明与联盟营销披露',
    summary:
      '本站地图、票价与对外链接各代表什么、不代表什么：数据准确性、联盟链接、广告披露与责任范围。',
    updated: UPDATED,
    body: `本站是一个独立的机场资料站。本页说明本站内容是什么、收入从哪里来、责任到哪里为止，适用于站内所有语言的所有页面。

## 本站不是官方信息源

本站不是机场、航空公司、旅行社或政府机构，也与它们没有隶属关系。本站依据公开数据和编辑整理制作，是出行参考工具。

- **航站楼示意图是示意，不是实测平面图。** 图形由航站楼数量、登机口数量与地面交通节点生成，用来表达机场的整体结构和各航站楼的相对位置；实际建筑的形状、比例和朝向可能不同。
- **信息会过期。** 航站楼开闭、登机口编号、航司所在航站楼、交通线路与首末班时间、票价都可能随时调整，且不会另行通知。
- **出行前请以官方信息为准。** 登机口、值机截止时间、最短转机时间、签证与入境要求、安检规定，请以机场、航司和主管部门发布的信息为准。

## 价格、特价与预订

特惠机票板块中的票价由**读者提交**，本站既不核实也不保证其准确。

- 标价只代表提交者在某一时刻看到的价格。税费、附加费、行李、选座、出行日期与余位都可能改变最终金额。
- 本站不售票、不占位、不收款。所有预订都在第三方网站上完成，适用该网站自己的条款与隐私政策。
- 本站不保证任何报价仍然有效。报价可能随时被下架或到期；价格变动并非本站的虚假陈述。

## 联盟链接

站内部分对外链接是**联盟链接**，主要是机票报价附带的预订链接，以及少数交通和服务推荐。您通过这类链接完成购买后，运营方可能向本站支付佣金。

- 佣金来自运营方的利润，**不会让您多付钱**；经由本站前往，也不会被加价。
- 佣金不能换取内容。本站不出售排名、评测或版面，也没有任何付费能决定某个页面怎么写。
- 除本页的全站披露外，承载联盟链接的页面也会就近标注。

## 广告

本站广告由第三方广告平台投放，当前名单见隐私政策。广告主无法通过本站取得读者数据，也不能干预编辑内容。页面上出现广告，不代表本站推荐该产品或服务，也不构成对其安全性、合法性或质量的保证。

## 读者提交的内容

特价机票、评论与纠错由读者提交。本站会审核明显违规的内容，但无法逐条核实其真实性、时效与准确性。读者据此做出的决定，请自行判断并承担相应风险。

## 外部网站

本站可能链接到机场、航司、交通运营方或其他第三方网站。这些网站的内容、价格、可用性与隐私做法由其自行负责，本站无法控制，也不承担责任。

## 责任限制

完整条款见使用条款。简要来说：因使用或无法使用本站内容而造成的误机、行程变更、被拒绝登机、额外支出或数据丢失，本站在法律允许的最大范围内不承担责任。

## 问题与纠错

如果本站的价格、地图或线路有误，欢迎通过联系页面告诉我们，纠错会优先处理。与本页相关的法律问题，也可以通过同一入口联系。`,
  },

  // Traditional Chinese is what `scripts/build-hant.mjs` (OpenCC cn→twp plus the
  // site's phrase list) produces from the Chinese source above; it is pasted
  // here because this module is outside that generator's reach.
  tw: {
    title: '免責聲明與聯盟行銷揭露',
    summary:
      '本站地圖、票價與對外連結各代表什麼、不代表什麼：資料準確性、聯盟連結、廣告揭露與責任範圍。',
    updated: UPDATED,
    body: `本站是一個獨立的機場資料站。本頁說明本站內容是什麼、收入從哪裡來、責任到哪裡為止，適用於站內所有語言的所有頁面。

## 本站不是官方資訊源

本站不是機場、航空公司、旅行社或政府機構，也與它們沒有隸屬關係。本站依據公開資料和編輯整理製作，是出行參考工具。

- **航廈示意圖是示意，不是實測平面圖。** 圖形由航廈數量、閘口數量與地面交通節點生成，用來表達機場的整體結構和各航廈的相對位置；實際建築的形狀、比例和朝向可能不同。
- **資訊會過期。** 航廈開閉、閘口編號、航司所在航廈、交通線路與首末班時間、票價都可能隨時調整，且不會另行通知。
- **出行前請以官方資訊為準。** 閘口、值機截止時間、最短轉機時間、簽證與入境要求、安檢規定，請以機場、航司和主管部門釋出的資訊為準。

## 價格、特價與預訂

特惠機票板塊中的票價由**讀者提交**，本站既不核實也不保證其準確。

- 標價只代表提交者在某一時刻看到的價格。稅費、附加費、行李、選座、出行日期與餘位都可能改變最終金額。
- 本站不售票、不佔位、不收款。所有預訂都在第三方網站上完成，適用該網站自己的條款與隱私政策。
- 本站不保證任何報價仍然有效。報價可能隨時被下架或到期；價格變動並非本站的虛假陳述。

## 聯盟連結

站內部分對外連結是**聯盟連結**，主要是機票報價附帶的預訂連結，以及少數交通和服務推薦。您通過這類連結完成購買後，運營方可能向本站支付佣金。

- 佣金來自運營方的利潤，**不會讓您多付錢**；經由本站前往，也不會被加價。
- 佣金不能換取內容。本站不出售排名、評測或版面，也沒有任何付費能決定某個頁面怎麼寫。
- 除本頁的全站披露外，承載聯盟連結的頁面也會就近標註。

## 廣告

本站廣告由第三方廣告平臺投放，當前名單見隱私政策。廣告主無法通過本站取得讀者資料，也不能干預編輯內容。頁面上出現廣告，不代表本站推薦該產品或服務，也不構成對其安全性、合法性或質量的保證。

## 讀者提交的內容

特價機票、評論與糾錯由讀者提交。本站會稽核明顯違規的內容，但無法逐條核實其真實性、時效與準確性。讀者據此做出的決定，請自行判斷並承擔相應風險。

## 外部網站

本站可能連結到機場、航司、交通運營方或其他第三方網站。這些網站的內容、價格、可用性與隱私做法由其自行負責，本站無法控制，也不承擔責任。

## 責任限制

完整條款見使用條款。簡要來說：因使用或無法使用本站內容而造成的誤機、行程變更、被拒絕登機、額外支出或資料丟失，本站在法律允許的最大範圍內不承擔責任。

## 問題與糾錯

如果本站的價格、地圖或線路有誤，歡迎通過聯絡頁面告訴我們，糾錯會優先處理。與本頁相關的法律問題，也可以通過同一入口聯絡。`,
  },

  de: {
    title: 'Haftungsausschluss und Affiliate-Hinweis',
    summary:
      'Was die Karten, Preise und ausgehenden Links dieser Website bedeuten – und was nicht: Datenherkunft, Affiliate-Links, Werbung und Haftungsgrenzen.',
    updated: UPDATED,
    body: `World Airport Maps ist ein unabhängiges Flughafen-Nachschlagewerk. Diese Seite erklärt, was die Inhalte der Website sind, wie sie finanziert wird und wo ihre Verantwortung endet. Sie gilt für alle Seiten in allen Sprachen.

## Keine offizielle Quelle

Diese Website ist kein Flughafen, keine Fluggesellschaft, kein Reiseveranstalter und keine Behörde und steht zu keiner dieser Stellen in einem Auftragsverhältnis. Sie ist eine Planungshilfe aus öffentlichen Daten und redaktioneller Arbeit.

- **Die Terminalpläne sind schematisch.** Sie entstehen aus der Zahl der Terminals und Gates sowie den Verkehrsknoten und zeigen den grundsätzlichen Aufbau eines Flughafens — keine vermessenen Grundrisse. Form, Maßstab und Ausrichtung können vom realen Gebäude abweichen.
- **Angaben veralten.** Terminals öffnen und schließen, Gate-Nummern ändern sich, Fluggesellschaften wechseln das Terminal, und Verkehrslinien, Betriebszeiten und Preise werden ohne Ankündigung angepasst.
- **Prüfen Sie vor der Reise.** Für Gates, Check-in-Fristen, Mindestumsteigezeiten, Visa, Einreisebestimmungen und Sicherheitsvorgaben gelten die Angaben des Flughafens, Ihrer Fluggesellschaft und der zuständigen Behörden.

## Preise, Angebote und Buchungen

Die im Bereich für Flugangebote gezeigten Preise werden **von Leserinnen und Lesern eingereicht** und von dieser Website weder geprüft noch garantiert.

- Ein angezeigter Preis ist das, was eine Person zu einem Zeitpunkt gesehen hat. Steuern, Gebühren, Gepäck, Sitzplatzwahl, Reisedaten und Verfügbarkeit können ihn verändern.
- Diese Website verkauft keine Tickets, hält keine Reservierungen und nimmt keine Zahlungen entgegen. Jede Buchung erfolgt auf der Website des Dritten nach dessen Bedingungen und Datenschutzbestimmungen.
- Kein Angebot ist garantiert verfügbar. Einträge können jederzeit entfernt werden oder ablaufen; ein geänderter Preis ist keine Falschangabe dieser Website.

## Affiliate-Links

Einige ausgehende Links auf dieser Website sind **Affiliate-Links** — vor allem die Buchungslinks an den Flugangeboten sowie einzelne Empfehlungen zu Verkehr und Service. Wer einem solchen Link folgt und einen Kauf abschließt, kann dem Betreiber eine Provision an diese Website zahlen.

- Die Provision stammt aus der Marge des Betreibers. **Sie verändert den Preis, den Sie zahlen, nicht**, und über diese Website wird nichts verteuert.
- Provisionen kaufen keine Inhalte. Diese Website verkauft keine Rankings, Bewertungen oder Platzierungen; keine Zahlung entscheidet darüber, was auf einer Seite steht.
- Die Offenlegung steht sowohl auf der Seite mit dem jeweiligen Link als auch hier: Diese Seite ist die Erklärung für die gesamte Website.

## Werbung

Die Werbung wird von Drittanbietern ausgeliefert; die aktuelle Liste steht in der Datenschutzerklärung. Werbetreibende erhalten über diese Website keine Leserdaten und können redaktionelle Inhalte nicht beeinflussen. Eine Anzeige ist keine Empfehlung des beworbenen Produkts oder Dienstes und keine Zusicherung von Sicherheit, Rechtmäßigkeit oder Qualität.

## Von Lesern eingereichte Inhalte

Flugangebote, Kommentare und Korrekturhinweise werden von Leserinnen und Lesern eingereicht. Offensichtlich unzulässige Inhalte werden entfernt, eine Einzelfallprüfung von Richtigkeit, Aktualität und Vollständigkeit ist jedoch nicht möglich. Entscheidungen auf dieser Grundlage treffen Sie auf eigenes Risiko.

## Externe Websites

Diese Website kann auf Flughäfen, Fluggesellschaften, Verkehrsbetriebe und andere Dritte verlinken. Für deren Inhalte, Preise, Verfügbarkeit und Datenschutzpraktiken sind sie selbst verantwortlich; diese Website hat keinen Einfluss darauf und haftet nicht.

## Haftungsbeschränkung

Die vollständige Regelung steht in den Nutzungsbedingungen. Kurz: Für verpasste Flüge, geänderte Reisepläne, verweigerte Beförderung, zusätzliche Kosten oder Datenverlust aus der Nutzung dieser Website wird — soweit gesetzlich zulässig — keine Haftung übernommen.

## Fragen und Korrekturen

Ist ein Preis, ein Plan oder eine Verbindung falsch, sagen Sie es uns über die Kontaktseite — Korrekturen werden vorrangig bearbeitet. Rechtliche Fragen zu dieser Seite laufen über denselben Weg.`,
  },

  fr: {
    title: 'Avertissement et transparence sur les liens affiliés',
    summary:
      'Ce que représentent — et ne représentent pas — les cartes, les prix et les liens de ce site : sources, liens affiliés, publicité et limites de responsabilité.',
    updated: UPDATED,
    body: `World Airport Maps est un site de référence indépendant. Cette page explique ce que sont ses contenus, comment le site est financé et où sa responsabilité s'arrête. Elle s'applique à toutes les pages, dans toutes les langues.

## Un site indépendant, pas une source officielle

Ce site n'est ni un aéroport, ni une compagnie aérienne, ni une agence de voyage, ni une administration, et n'est affilié à aucune de ces entités. C'est un outil d'aide à la préparation de voyage, construit à partir de données publiques et d'un travail éditorial.

- **Les plans de terminaux sont schématiques.** Ils sont générés à partir du nombre de terminaux et de portes et des nœuds de transport, pour montrer l'organisation générale d'un aéroport — et non relevés sur plan. Formes, échelles et orientations peuvent différer du bâtiment réel.
- **Les informations vieillissent.** Les terminaux ouvrent et ferment, la numérotation des portes change, les compagnies changent de terminal, et les lignes de transport, horaires et tarifs sont révisés sans préavis.
- **Vérifiez avant de partir.** Pour les portes, les délais d'enregistrement, les temps de correspondance minimaux, les visas, les conditions d'entrée et les règles de sûreté, fiez-vous à l'aéroport, à votre compagnie et aux autorités compétentes.

## Tarifs, offres et réservations

Les tarifs affichés dans la rubrique des offres sont **proposés par les lecteurs** et ne sont ni vérifiés ni garantis par ce site.

- Un prix affiché correspond à ce qu'une personne a vu à un instant donné. Taxes, frais, bagages, choix du siège, dates et disponibilité peuvent le modifier.
- Ce site ne vend pas de billets, ne bloque pas de réservation et n'encaisse aucun paiement. Toute réservation s'effectue sur le site du tiers, selon ses conditions et sa politique de confidentialité.
- Aucune offre n'est garantie disponible. Une annonce peut être retirée ou expirer à tout moment ; un prix qui a changé n'est pas une fausse déclaration de ce site.

## Liens affiliés

Certains liens sortants de ce site sont des **liens affiliés** : principalement les liens de réservation associés aux offres, ainsi que quelques recommandations de transport ou de services. Si vous suivez l'un de ces liens et finalisez un achat, l'exploitant peut verser une commission à ce site.

- La commission provient de la marge de l'exploitant. **Elle ne modifie pas le prix que vous payez** et rien n'est majoré du fait de votre passage par ce site.
- Une commission n'achète pas de contenu. Ce site ne vend ni classements, ni évaluations, ni emplacements, et aucun paiement ne détermine ce qu'une page dit.
- La mention figure à la fois sur la page qui porte le lien et ici : cette page est la déclaration valable pour l'ensemble du site.

## Publicité

La publicité est diffusée par des régies tierces ; la liste à jour figure dans la politique de confidentialité. Les annonceurs n'obtiennent aucune donnée de lecteur par notre intermédiaire et ne peuvent pas influencer le contenu éditorial. La présence d'une annonce ne vaut pas recommandation du produit ou du service, ni garantie de sécurité, de légalité ou de qualité.

## Contenus proposés par les lecteurs

Offres, commentaires et signalements sont envoyés par les lecteurs. Les contenus manifestement illicites sont retirés, mais une vérification individuelle de leur exactitude, de leur actualité et de leur exhaustivité n'est pas possible. Les décisions prises sur cette base le sont à vos propres risques.

## Sites externes

Ce site peut renvoyer vers des aéroports, des compagnies, des transporteurs ou d'autres tiers. Leurs contenus, prix, disponibilité et pratiques de confidentialité relèvent de leur responsabilité ; ce site ne les contrôle pas et n'en répond pas.

## Limitation de responsabilité

La clause complète figure dans les conditions d'utilisation. En bref : dans les limites permises par la loi, ce site n'est pas responsable des vols manqués, itinéraires modifiés, embarquements refusés, frais supplémentaires ou pertes de données résultant de son utilisation.

## Questions et corrections

Si un prix, un plan ou un itinéraire est erroné, signalez-le via la page de contact : les corrections sont traitées en priorité. Les questions juridiques relatives à cette page passent par le même canal.`,
  },

  it: {
    title: 'Disclaimer e informativa sui link affiliati',
    summary:
      'Che cosa sono — e che cosa non sono — le mappe, le tariffe e i link di questo sito: fonti dei dati, link affiliati, pubblicità e limiti di responsabilità.',
    updated: UPDATED,
    body: `World Airport Maps è un sito di consultazione indipendente. Questa pagina spiega che cosa sono i contenuti del sito, come è finanziato e dove finisce la sua responsabilità. Vale per tutte le pagine, in tutte le lingue.

## Non è una fonte ufficiale

Questo sito non è un aeroporto, una compagnia aerea, un'agenzia di viaggi o un ente pubblico e non è affiliato a nessuno di essi. È uno strumento di pianificazione costruito su dati pubblici e lavoro redazionale.

- **Le planimetrie dei terminal sono schematiche.** Sono generate dal numero di terminal e gate e dai nodi di trasporto per mostrare l'organizzazione generale di un aeroporto, non da un rilievo. Forme, scala e orientamento possono differire dall'edificio reale.
- **Le informazioni invecchiano.** I terminal aprono e chiudono, la numerazione dei gate cambia, le compagnie si spostano tra i terminal e linee, orari e tariffe vengono aggiornati senza preavviso.
- **Verifica prima di partire.** Per gate, termini di check-in, tempi minimi di coincidenza, visti, regole d'ingresso e controlli di sicurezza fanno fede l'aeroporto, la compagnia e le autorità competenti.

## Tariffe, offerte e prenotazioni

Le tariffe mostrate nella sezione delle offerte sono **inviate dai lettori** e non sono verificate né garantite da questo sito.

- Un prezzo indicato è quello visto da una persona in un certo momento. Tasse, supplementi, bagaglio, scelta del posto, date e disponibilità possono modificarlo.
- Questo sito non vende biglietti, non blocca prenotazioni e non incassa pagamenti. Ogni prenotazione si conclude sul sito del terzo, secondo i suoi termini e la sua informativa privacy.
- Nessuna offerta è garantita disponibile. Un annuncio può essere rimosso o scadere in qualsiasi momento; un prezzo cambiato non è una dichiarazione falsa di questo sito.

## Link affiliati

Alcuni link in uscita sono **link affiliati**: soprattutto quelli di prenotazione collegati alle offerte e alcuni consigli su trasporti e servizi. Se segui uno di questi link e completi un acquisto, l'operatore può corrispondere una commissione a questo sito.

- La commissione esce dal margine dell'operatore. **Non cambia il prezzo che paghi** e non c'è alcun sovrapprezzo per essere arrivato da qui.
- La commissione non compra contenuti. Il sito non vende posizionamenti, recensioni o spazi e nessun pagamento decide che cosa dice una pagina.
- L'informativa è indicata sia sulla pagina che contiene il link sia qui: questa pagina vale per tutto il sito.

## Pubblicità

La pubblicità è erogata da circuiti di terze parti; l'elenco aggiornato è nell'informativa privacy. Gli inserzionisti non ricevono dati dei lettori tramite noi e non possono influenzare i contenuti redazionali. Un annuncio non è un'approvazione del prodotto o servizio né una garanzia di sicurezza, liceità o qualità.

## Contenuti inviati dai lettori

Offerte, commenti e segnalazioni sono inviati dai lettori. I contenuti palesemente illeciti vengono rimossi, ma non è possibile verificare caso per caso esattezza, attualità e completezza. Le decisioni prese su questa base sono a tuo rischio.

## Siti esterni

Il sito può collegarsi ad aeroporti, compagnie, gestori di trasporto o altri terzi. Contenuti, prezzi, disponibilità e pratiche sulla privacy sono loro responsabilità; questo sito non li controlla e non ne risponde.

## Limitazione di responsabilità

La clausola completa è nei termini di utilizzo. In breve: nei limiti consentiti dalla legge, il sito non risponde di voli persi, itinerari modificati, imbarco negato, costi aggiuntivi o perdita di dati derivanti dall'uso del sito.

## Domande e correzioni

Se un prezzo, una mappa o un collegamento sono errati, segnalalo dalla pagina dei contatti: le correzioni hanno priorità. Le questioni legali relative a questa pagina passano dallo stesso canale.`,
  },

  ko: {
    title: '면책 고지 및 제휴 링크 안내',
    summary:
      '이 사이트의 지도·요금·링크가 무엇을 뜻하고 무엇을 뜻하지 않는지, 제휴 링크와 광고를 어떻게 밝히는지 안내합니다.',
    updated: UPDATED,
    body: `월드 에어포트 맵은 독립적인 공항 정보 사이트입니다. 이 페이지는 사이트 콘텐츠가 무엇인지, 수익이 어디서 오는지, 책임이 어디까지인지 설명합니다. 모든 언어의 모든 페이지에 적용됩니다.

## 공식 정보가 아닙니다

이 사이트는 공항, 항공사, 여행사, 정부 기관이 아니며 어느 곳과도 제휴 관계가 없습니다. 공개 데이터와 편집 작업으로 만든 여행 준비 도구입니다.

- **터미널 도면은 개념도입니다.** 터미널 수와 게이트 수, 지상 교통 지점을 바탕으로 공항의 전체 구조를 보여 주도록 생성한 그림이며 실측 도면이 아닙니다. 실제 건물의 형태·축척·방향과 다를 수 있습니다.
- **정보는 낡습니다.** 터미널이 문을 열고 닫고, 게이트 번호가 바뀌고, 항공사가 터미널을 옮기며, 교통 노선·운행 시간·요금은 예고 없이 조정됩니다.
- **출발 전에 확인하세요.** 게이트, 체크인 마감, 최소 환승 시간, 비자, 입국 규정, 보안 검색은 공항과 항공사, 해당 당국의 정보를 기준으로 하세요.

## 요금, 특가, 예약

특가 항공권 항목의 요금은 **독자가 제출한 것**이며, 이 사이트는 이를 확인하거나 보증하지 않습니다.

- 표시된 가격은 누군가가 어느 시점에 본 값입니다. 세금, 수수료, 수하물, 좌석 지정, 날짜, 잔여 좌석에 따라 달라질 수 있습니다.
- 이 사이트는 항공권을 판매하지 않고, 예약을 잡아 두지 않으며, 결제를 받지 않습니다. 모든 예약은 제3자 사이트에서 그 사이트의 약관과 개인정보 처리방침에 따라 이루어집니다.
- 어떤 특가도 계속 유효함을 보장하지 않습니다. 게시물은 언제든 내려가거나 만료될 수 있고, 바뀐 가격은 이 사이트의 허위 표시가 아닙니다.

## 제휴 링크

사이트의 일부 외부 링크는 **제휴 링크**입니다. 주로 특가에 붙은 예약 링크와 일부 교통·서비스 추천이 여기에 해당합니다. 이런 링크를 통해 구매를 마치면 운영자가 이 사이트에 수수료를 지급할 수 있습니다.

- 수수료는 운영자의 마진에서 나옵니다. **이용자가 내는 가격은 달라지지 않으며**, 이 사이트를 거쳤다고 해서 더 비싸지지 않습니다.
- 수수료로 콘텐츠를 사지는 않습니다. 이 사이트는 순위, 평가, 지면을 팔지 않으며 어떤 대가도 페이지의 내용을 정하지 않습니다.
- 해당 링크가 있는 페이지에도 표시하고, 이 페이지는 사이트 전체에 적용되는 고지입니다.

## 광고

광고는 제3자 광고 플랫폼이 게재합니다. 최신 목록은 개인정보 처리방침에 있습니다. 광고주는 이 사이트를 통해 독자 데이터를 얻지 못하며 편집 내용에 관여할 수 없습니다. 광고가 보인다고 해서 그 상품이나 서비스를 추천하는 것은 아니며 안전성·적법성·품질을 보증하지도 않습니다.

## 독자가 올린 내용

특가, 댓글, 오류 제보는 독자가 올립니다. 명백히 위반된 내용은 삭제하지만, 정확성·시의성·완전성을 하나하나 확인할 수는 없습니다. 이를 근거로 한 결정은 이용자 판단과 책임입니다.

## 외부 사이트

이 사이트는 공항, 항공사, 교통 운영자, 기타 제3자 사이트로 연결될 수 있습니다. 그 내용과 가격, 이용 가능성, 개인정보 처리 방식은 해당 사이트의 책임이며, 이 사이트는 통제하지도 책임지지도 않습니다.

## 책임의 한계

전체 조항은 이용약관에 있습니다. 요약하면, 이 사이트 내용을 이용하거나 이용하지 못해 항공편을 놓치거나, 일정이 바뀌거나, 탑승이 거절되거나, 추가 비용이나 데이터 손실이 생긴 경우에 대해 법이 허용하는 최대 범위에서 책임지지 않습니다.

## 문의와 정정

가격, 지도, 노선에 잘못된 점이 있으면 문의 페이지로 알려 주세요. 정정은 우선 처리합니다. 이 페이지에 관한 법적 문의도 같은 경로로 받습니다.`,
  },

  es: {
    title: 'Aviso legal y divulgación de enlaces de afiliados',
    summary:
      'Qué son —y qué no son— los mapas, las tarifas y los enlaces externos de este sitio: exactitud de los datos, enlaces de afiliados, publicidad y los límites de nuestra responsabilidad.',
    updated: UPDATED,
    body: `World Airport Maps es un sitio de referencia aeroportuaria independiente. Esta página explica qué es el contenido del sitio, cómo se financia y dónde termina su responsabilidad. Se aplica a todas las páginas, en todos los idiomas.

## No es una fuente oficial

Este sitio no es un aeropuerto, una aerolínea, una agencia de viajes ni un organismo público, y no está afiliado a ninguno de ellos. Es una herramienta de planificación elaborada a partir de datos públicos y trabajo editorial.

- **Los diagramas de terminales son ilustrativos.** Se dibujan a partir del número de terminales y puertas y de los nodos de transporte terrestre, para mostrar cómo se estructura un aeropuerto — no a partir de planos levantados sobre el terreno. La forma, la escala y la orientación pueden diferir del edificio real.
- **Los datos se quedan desactualizados.** Los terminales abren y cierran, los números de puerta cambian, las aerolíneas se trasladan entre terminales, y las rutas de transporte, los horarios del primer y último servicio y las tarifas se revisan sin aviso.
- **Comprueba antes de viajar.** Para puertas, plazos de check-in, tiempos mínimos de conexión, visados, normas de entrada y requisitos de seguridad, fíate del aeropuerto, de tu aerolínea y de las autoridades competentes.

## Tarifas, ofertas y reservas

Las tarifas de la sección de ofertas son **enviadas por los lectores** y este sitio no las verifica ni las garantiza.

- Un precio publicado es lo que una persona vio en un momento dado. Los impuestos, las tasas, el equipaje, la selección de asiento, las fechas de viaje y la disponibilidad pueden modificarlo.
- Este sitio no vende boletos, no bloquea reservas ni acepta pagos. Toda reserva se completa en el sitio web del tercero, según sus propios términos y su política de privacidad.
- No se garantiza que ninguna oferta siga disponible. Los anuncios pueden retirarse o caducar en cualquier momento, y un precio que ha cambiado no es una declaración falsa de este sitio.

## Enlaces de afiliados

Algunos enlaces externos de este sitio son **enlaces de afiliados** — principalmente los enlaces de reserva asociados a las tarifas, además de algunas recomendaciones de transporte y servicios. Si sigues uno de ellos y completas una compra, el operador puede pagar una comisión a este sitio.

- La comisión sale del margen del operador. **No cambia el precio que pagas**, y no se te cobra más por llegar a través de este sitio.
- La comisión no compra contenido editorial. El sitio no vende clasificaciones, reseñas ni emplazamientos, y ningún pago decide lo que dice una página.
- La divulgación aparece tanto en la página que contiene cada enlace como aquí; esta página es la declaración válida para todo el sitio.

## Publicidad

La publicidad de este sitio la sirven redes publicitarias de terceros; la política de privacidad enumera las actuales. Los anunciantes no obtienen datos de los lectores a través de este sitio y no pueden influir en el contenido editorial. La aparición de un anuncio aquí no constituye una recomendación del producto o servicio ni una garantía de su seguridad, legalidad o calidad.

## Contenido enviado por los lectores

Las tarifas, los comentarios y las correcciones los envían los lectores. El material manifiestamente ilícito se elimina, pero el sitio no puede verificar la exactitud, la vigencia ni la integridad de cada envío. Las decisiones que se tomen a partir de esa información son responsabilidad tuya.

## Sitios web externos

Este sitio puede enlazar a aeropuertos, aerolíneas, operadores de transporte y otros terceros. Su contenido, sus precios, su disponibilidad y sus prácticas de privacidad son responsabilidad de esos terceros; este sitio no los controla y no asume ninguna responsabilidad por ellos.

## Limitación de responsabilidad

La cláusula completa figura en las condiciones de uso. En resumen: en la máxima medida permitida por la ley, el sitio no responde por vuelos perdidos, itinerarios modificados, denegación de embarque, costos adicionales o pérdida de datos derivados del uso de este sitio.

## Preguntas y correcciones

Si un precio, un mapa o una ruta de este sitio es incorrecto, avísanos a través de la página de contacto; las correcciones se atienden primero. Las cuestiones legales sobre esta página nos llegan por el mismo canal.`,
  },

  pt: {
    title: 'Aviso legal e divulgação de links de afiliados',
    summary:
      'O que são — e o que não são — os mapas, as tarifas e os links externos deste site: precisão dos dados, links de afiliados, publicidade e os limites da nossa responsabilidade.',
    updated: UPDATED,
    body: `O World Airport Maps é um site de referência aeroportuária independente. Esta página explica o que é o conteúdo do site, como ele é financiado e onde termina a sua responsabilidade. Ela se aplica a todas as páginas, em todos os idiomas.

## Não é uma fonte oficial

Este site não é um aeroporto, uma companhia aérea, uma agência de viagens ou um órgão governamental, e não é afiliado a nenhum deles. É uma ferramenta de planejamento construída a partir de dados públicos e trabalho editorial.

- **Os diagramas dos terminais são ilustrativos.** Eles são desenhados a partir do número de terminais e portões e dos nós de transporte terrestre, para mostrar como um aeroporto é estruturado — não a partir de plantas levantadas em campo. Forma, escala e orientação podem diferir do edifício real.
- **As informações ficam desatualizadas.** Terminais abrem e fecham, números de portão mudam, companhias aéreas mudam de terminal, e rotas de transporte, horários do primeiro e do último serviço e tarifas são revisados sem aviso prévio.
- **Confira antes de viajar.** Para portões, prazos de check-in, tempos mínimos de conexão, vistos, regras de entrada e requisitos de segurança, baseie-se no aeroporto, na sua companhia aérea e nas autoridades competentes.

## Tarifas, ofertas e reservas

As tarifas da seção de ofertas são **enviadas por leitores** e não são verificadas nem garantidas por este site.

- Um preço listado é o que uma pessoa viu em um determinado momento. Impostos, taxas, bagagem, escolha de assento, datas de viagem e disponibilidade podem alterá-lo.
- Este site não vende passagens, não bloqueia reservas nem recebe pagamentos. Toda reserva é concluída no site do terceiro, segundo os termos e a política de privacidade dele.
- Nenhuma oferta tem garantia de que ainda estará disponível. Os anúncios podem ser removidos ou expirar a qualquer momento, e um preço que mudou não é uma declaração falsa deste site.

## Links de afiliados

Alguns links externos deste site são **links de afiliados** — principalmente os links de reserva associados às tarifas, além de algumas recomendações de transporte e serviços. Se você seguir um deles e concluir uma compra, o operador poderá pagar uma comissão a este site.

- A comissão sai da margem do operador. **Ela não altera o preço que você paga**, e você não paga mais por ter chegado por meio deste site.
- A comissão não compra conteúdo editorial. O site não vende rankings, avaliações ou posicionamentos, e nenhum pagamento decide o que uma página diz.
- A divulgação aparece tanto na página que contém cada link quanto aqui; esta página é a declaração válida para todo o site.

## Publicidade

A publicidade deste site é veiculada por redes de anúncios de terceiros; a política de privacidade lista as atuais. Os anunciantes não obtêm dados dos leitores por meio deste site e não podem influenciar o conteúdo editorial. Um anúncio exibido aqui não é um endosso do produto ou serviço, nem uma garantia de sua segurança, legalidade ou qualidade.

## Conteúdo enviado por leitores

Tarifas, comentários e correções são enviados por leitores. Materiais manifestamente ilícitos são removidos, mas o site não consegue verificar a precisão, a atualidade ou a completude de cada envio. As decisões tomadas com base nisso são de sua própria responsabilidade.

## Sites externos

Este site pode ter links para aeroportos, companhias aéreas, operadores de transporte e outros terceiros. O conteúdo, os preços, a disponibilidade e as práticas de privacidade deles são de responsabilidade deles; este site não os controla e não assume nenhuma responsabilidade por eles.

## Limitação de responsabilidade

A cláusula completa está nos termos de uso. Em resumo: na máxima medida permitida por lei, o site não se responsabiliza por voos perdidos, itinerários alterados, embarque negado, custos adicionais ou perda de dados decorrentes do uso deste site.

## Dúvidas e correções

Se um preço, um mapa ou uma rota aqui estiver errado, avise-nos pela página de contato — as correções são tratadas prioritariamente. Questões legais sobre esta página chegam até nós pelo mesmo canal.`,
  },

  ja: {
    title: '免責事項とアフィリエイトの開示',
    summary:
      '当サイトの地図・運賃・外部リンクが何であり、何でないか — データの正確性、アフィリエイトリンク、広告、責任の範囲について説明します。',
    updated: UPDATED,
    body: `World Airport Maps は独立した空港情報サイトです。このページでは、当サイトのコンテンツが何であるか、どのように運営されているか、責任がどこまで及ぶかを説明します。すべての言語のすべてのページに適用されます。

## 公式情報源ではありません

当サイトは空港、航空会社、旅行代理店、政府機関ではなく、いずれとも提携していません。公開データと編集作業に基づいて作られた旅行計画の補助ツールです。

- **ターミナル図はイメージです。** ターミナル数とゲート数、地上交通の拠点から描いたもので、空港の全体構成を示すための図であり、実測の平面図ではありません。形状、縮尺、向きは実際の建物と異なる場合があります。
- **情報は古くなります。** ターミナルの供用開始・閉鎖、ゲート番号の変更、航空会社のターミナル移転、交通路線・始発終発時刻・運賃は予告なく変更されます。
- **旅行前に確認してください。** ゲート、チェックイン締め切り、最短乗り継ぎ時間、ビザ、入国規則、保安検査については、空港、航空会社、所管当局の情報に従ってください。

## 運賃・お得情報・予約

お得情報セクションの運賃は**読者が投稿したもの**であり、当サイトが検証したり保証したりするものではありません。

- 表示価格は、ある人がある時点で見た価格です。税金、手数料、手荷物、座席指定、旅行日、空席状況によって変わることがあります。
- 当サイトは航空券を販売せず、予約を確保せず、支払いを受け付けません。予約はすべて第三者のウェブサイト上で、そのサイトの規約とプライバシーポリシーに従って完了します。
- いかなる提供内容も、引き続き利用できることを保証するものではありません。掲載はいつでも削除または期限切れになることがあり、価格が変わったとしても、それは当サイトによる虚偽表示ではありません。

## アフィリエイトリンク

当サイトの一部の外部リンクは**アフィリエイトリンク**です。主に運賃に付随する予約リンクのほか、交通・サービスの推奨が少数含まれます。リンクをたどって購入を完了すると、事業者が当サイトに手数料を支払う場合があります。

- 手数料は事業者のマージンから支払われます。**お客様が支払う価格は変わりません**。当サイト経由でアクセスしたことで高くなることはありません。
- 手数料によって掲載内容が決まることはありません。当サイトはランキング、レビュー、掲載枠を販売しておらず、支払いがページの内容を左右することはありません。
- 開示は各リンクのあるページにも表示され、このページはサイト全体に対する表明です。

## 広告

当サイトの広告は第三者広告ネットワークによって配信されています。現在の一覧はプライバシーポリシーに記載しています。広告主は当サイトを通じて読者のデータを取得できず、編集内容に影響を与えることもできません。広告の掲載は、その製品やサービスを推奨するものではなく、安全性、合法性、品質を保証するものでもありません。

## 読者が投稿したコンテンツ

運賃、コメント、訂正は読者が投稿します。明らかに違法な内容は削除しますが、当サイトは各投稿の正確性、最新性、完全性を検証することはできません。それに基づいて行う判断は、お客様ご自身の責任です。

## 外部サイト

当サイトは空港、航空会社、交通事業者、その他の第三者へリンクする場合があります。それらのコンテンツ、価格、可用性、プライバシー慣行は各者自身の責任であり、当サイトはそれらを管理しておらず、いかなる責任も負いません。

## 責任の制限

完全な条項は利用規約にあります。要約すると、法律で認められる最大限の範囲で、当サイトの利用に起因する乗り遅れ、旅程の変更、搭乗拒否、追加費用、データの損失について、当サイトは責任を負いません。

## 質問と訂正

価格、地図、路線に誤りがある場合は、お問い合わせページからお知らせください。訂正は優先的に処理します。このページに関する法的な質問も同じ窓口で受け付けます。`,
  },

  id: {
    title: 'Penafian dan pengungkapan tautan afiliasi',
    summary:
      'Apa arti — dan apa yang bukan — peta, tarif, dan tautan keluar situs ini: akurasi data, tautan afiliasi, periklanan, dan batas tanggung jawab kami.',
    updated: UPDATED,
    body: `World Airport Maps adalah situs referensi bandara yang independen. Halaman ini menjelaskan apa isi situs ini, bagaimana situs ini dibiayai, dan di mana tanggung jawabnya berakhir. Halaman ini berlaku untuk setiap halaman, dalam setiap bahasa.

## Bukan sumber resmi

Situs ini bukan bandara, maskapai penerbangan, agen perjalanan, atau lembaga pemerintah, dan tidak berafiliasi dengan salah satu dari mereka. Situs ini adalah alat bantu perencanaan yang dibangun dari data publik dan kerja editorial.

- **Diagram terminal bersifat ilustratif.** Diagram ini dibuat dari jumlah terminal dan gerbang serta simpul transportasi darat, untuk menunjukkan bagaimana sebuah bandara tersusun — bukan dari denah hasil pengukuran. Bentuk, skala, dan orientasi dapat berbeda dari bangunan sebenarnya.
- **Informasi menjadi usang.** Terminal dibuka dan ditutup, nomor gerbang berubah, maskapai berpindah terminal, dan rute transportasi, waktu layanan pertama dan terakhir, serta tarif direvisi tanpa pemberitahuan.
- **Periksa sebelum berangkat.** Untuk gerbang, batas waktu check-in, waktu koneksi minimum, visa, aturan masuk, dan persyaratan keamanan, andalkan bandara, maskapai Anda, dan otoritas terkait.

## Tarif, penawaran, dan pemesanan

Tarif di bagian penawaran **dikirim oleh pembaca** dan tidak diverifikasi maupun dijamin oleh situs ini.

- Harga yang tercantum adalah harga yang dilihat seseorang pada satu waktu tertentu. Pajak, biaya, bagasi, pemilihan kursi, tanggal perjalanan, dan ketersediaan dapat mengubahnya.
- Situs ini tidak menjual tiket, tidak menahan reservasi, dan tidak menerima pembayaran. Setiap pemesanan diselesaikan di situs web pihak ketiga, sesuai ketentuan dan kebijakan privasinya.
- Tidak ada penawaran yang dijamin masih tersedia. Daftar dapat dihapus atau kedaluwarsa kapan saja, dan harga yang berubah bukanlah misrepresentasi oleh situs ini.

## Tautan afiliasi

Beberapa tautan keluar di situs ini adalah **tautan afiliasi** — terutama tautan pemesanan yang terlampir pada tarif, ditambah beberapa rekomendasi transportasi dan layanan. Jika Anda mengikuti salah satunya dan menyelesaikan pembelian, operator dapat membayar komisi kepada situs ini.

- Komisi berasal dari margin operator. **Komisi tidak mengubah harga yang Anda bayar**, dan Anda tidak dikenakan biaya lebih karena datang melalui situs ini.
- Komisi tidak membeli liputan. Situs ini tidak menjual peringkat, ulasan, atau penempatan, dan tidak ada pembayaran yang menentukan isi halaman.
- Pengungkapan ditampilkan di halaman yang memuat setiap tautan dan juga di sini; halaman ini adalah pernyataan untuk seluruh situs.

## Periklanan

Periklanan di situs ini dilayani oleh jaringan iklan pihak ketiga; kebijakan privasi mencantumkan daftar terbarunya. Pengiklan tidak memperoleh data pembaca melalui situs ini dan tidak dapat memengaruhi konten editorial. Iklan yang muncul di sini bukan merupakan dukungan atas produk atau layanan tersebut, juga bukan jaminan atas keamanan, legalitas, atau kualitasnya.

## Konten kiriman pembaca

Tarif, komentar, dan koreksi dikirim oleh pembaca. Materi yang jelas melanggar hukum dihapus, tetapi situs ini tidak dapat memverifikasi setiap kiriman atas akurasi, kemutakhiran, atau kelengkapannya. Keputusan yang diambil berdasarkan itu adalah tanggung jawab Anda sendiri.

## Situs web eksternal

Situs ini dapat menautkan ke bandara, maskapai, operator transportasi, dan pihak ketiga lainnya. Konten, harga, ketersediaan, dan praktik privasi mereka adalah tanggung jawab mereka sendiri; situs ini tidak mengendalikannya dan tidak menerima tanggung jawab apa pun atasnya.

## Batasan tanggung jawab

Klausul lengkapnya ada dalam ketentuan penggunaan. Singkatnya: sejauh diizinkan oleh hukum, situs ini tidak bertanggung jawab atas penerbangan yang terlewat, perubahan rencana perjalanan, penolakan naik pesawat, biaya tambahan, atau kehilangan data yang timbul dari penggunaan situs ini.

## Pertanyaan dan koreksi

Jika ada harga, peta, atau rute yang salah di sini, beri tahu kami melalui halaman kontak — koreksi ditangani lebih dahulu. Pertanyaan hukum tentang halaman ini juga sampai kepada kami melalui jalur yang sama.`,
  },

  vi: {
    title: 'Tuyên bố miễn trừ trách nhiệm và công bố liên kết tiếp thị',
    summary:
      'Những gì bản đồ, giá vé và các liên kết ra ngoài của trang này thể hiện — và không thể hiện: độ chính xác của dữ liệu, liên kết tiếp thị, quảng cáo và giới hạn trách nhiệm của chúng tôi.',
    updated: UPDATED,
    body: `World Airport Maps là một trang tham khảo sân bay độc lập. Trang này giải thích nội dung của trang là gì, trang được tài trợ như thế nào và trách nhiệm của trang kết thúc ở đâu. Trang này áp dụng cho mọi trang, ở mọi ngôn ngữ.

## Không phải nguồn chính thức

Trang này không phải là sân bay, hãng hàng không, đại lý du lịch hay cơ quan chính phủ, và không liên kết với bất kỳ tổ chức nào trong số đó. Đây là công cụ hỗ trợ lập kế hoạch được xây dựng từ dữ liệu công khai và công việc biên tập.

- **Sơ đồ nhà ga chỉ mang tính minh họa.** Chúng được vẽ từ số lượng nhà ga và cổng, cùng các điểm giao thông mặt đất, để cho thấy một sân bay được cấu thành như thế nào — không phải từ bản vẽ mặt bằng đã khảo sát. Hình dạng, tỷ lệ và hướng có thể khác với tòa nhà thực tế.
- **Thông tin sẽ lỗi thời.** Nhà ga mở và đóng cửa, số cổng thay đổi, các hãng hàng không chuyển nhà ga, và tuyến giao thông, giờ chuyến đầu và chuyến cuối cùng, giá vé được sửa đổi mà không báo trước.
- **Hãy kiểm tra trước khi đi.** Về cổng, hạn chót làm thủ tục, thời gian nối chuyến tối thiểu, thị thực, quy định nhập cảnh và yêu cầu an ninh, hãy dựa vào sân bay, hãng hàng không của bạn và cơ quan có thẩm quyền.

## Giá vé, ưu đãi và đặt chỗ

Giá vé trong mục ưu đãi là do **độc giả gửi** và không được trang này xác minh hay bảo đảm.

- Giá được niêm yết là giá mà một người đã thấy tại một thời điểm. Thuế, phí, hành lý, chọn chỗ ngồi, ngày đi và tình trạng còn chỗ đều có thể thay đổi giá đó.
- Trang này không bán vé, không giữ chỗ và không nhận thanh toán. Mọi việc đặt chỗ đều được hoàn tất trên trang web của bên thứ ba, theo điều khoản và chính sách quyền riêng tư của bên đó.
- Không có ưu đãi nào được bảo đảm vẫn còn hiệu lực. Danh sách có thể bị gỡ bỏ hoặc hết hạn bất cứ lúc nào, và giá đã thay đổi không phải là sự trình bày sai của trang này.

## Liên kết tiếp thị

Một số liên kết ra ngoài trên trang này là **liên kết tiếp thị** — chủ yếu là các liên kết đặt chỗ gắn với giá vé, cùng một vài gợi ý về giao thông và dịch vụ. Nếu bạn theo một liên kết như vậy và hoàn tất giao dịch mua, đơn vị vận hành có thể trả cho trang này một khoản hoa hồng.

- Khoản hoa hồng được trích từ biên lợi nhuận của đơn vị vận hành. **Nó không làm thay đổi giá bạn phải trả**, và bạn không bị tính thêm vì đến qua trang này.
- Hoa hồng không mua được nội dung. Trang này không bán thứ hạng, đánh giá hay vị trí hiển thị, và không khoản thanh toán nào quyết định nội dung của một trang.
- Thông báo công bố xuất hiện trên trang chứa từng liên kết cũng như tại đây; trang này là tuyên bố áp dụng cho toàn bộ trang web.

## Quảng cáo

Quảng cáo trên trang này do các mạng quảng cáo bên thứ ba phân phối; chính sách quyền riêng tư liệt kê danh sách hiện tại. Nhà quảng cáo không có được dữ liệu độc giả thông qua trang này và không thể tác động đến nội dung biên tập. Một quảng cáo xuất hiện ở đây không phải là sự chứng thực sản phẩm hay dịch vụ, cũng không phải bảo đảm về tính an toàn, hợp pháp hay chất lượng của sản phẩm hay dịch vụ đó.

## Nội dung do độc giả gửi

Giá vé, bình luận và đính chính do độc giả gửi. Nội dung rõ ràng trái pháp luật sẽ bị gỡ bỏ, nhưng trang này không thể xác minh từng nội dung gửi về độ chính xác, tính cập nhật hay tính đầy đủ. Các quyết định dựa trên đó là trách nhiệm của chính bạn.

## Trang web bên ngoài

Trang này có thể liên kết đến sân bay, hãng hàng không, đơn vị vận hành giao thông và các bên thứ ba khác. Nội dung, giá cả, tình trạng còn hàng và cách xử lý quyền riêng tư của họ là trách nhiệm của chính họ; trang này không kiểm soát và không chịu trách nhiệm nào đối với họ.

## Giới hạn trách nhiệm

Điều khoản đầy đủ nằm trong điều khoản sử dụng. Tóm lại: trong phạm vi tối đa được pháp luật cho phép, trang này không chịu trách nhiệm về việc lỡ chuyến bay, thay đổi hành trình, bị từ chối lên máy bay, chi phí phát sinh hoặc mất dữ liệu do việc sử dụng trang này.

## Câu hỏi và đính chính

Nếu giá, bản đồ hoặc tuyến đường ở đây sai, hãy cho chúng tôi biết qua trang liên hệ — các đính chính được xử lý trước tiên. Các câu hỏi pháp lý về trang này cũng đến với chúng tôi qua cùng kênh đó.`,
  },

  ru: {
    title: 'Отказ от ответственности и раскрытие партнёрских ссылок',
    summary:
      'Что представляют собой — и чем не являются — карты, тарифы и внешние ссылки этого сайта: точность данных, партнёрские ссылки, реклама и пределы нашей ответственности.',
    updated: UPDATED,
    body: `World Airport Maps — независимый справочный сайт об аэропортах. На этой странице объясняется, что представляет собой контент сайта, как он финансируется и где заканчивается его ответственность. Она действует для всех страниц на всех языках.

## Неофициальный источник

Этот сайт не является аэропортом, авиакомпанией, туристическим агентством или государственным органом и не связан ни с одним из них. Это вспомогательный инструмент для планирования поездок, созданный на основе открытых данных и редакционной работы.

- **Схемы терминалов носят иллюстративный характер.** Они построены по количеству терминалов и выходов на посадку, а также по узлам наземного транспорта, чтобы показать общее устройство аэропорта, а не по обмерным планам. Форма, масштаб и ориентация могут отличаться от реального здания.
- **Информация устаревает.** Терминалы открываются и закрываются, номера выходов меняются, авиакомпании переходят между терминалами, а маршруты транспорта, время первого и последнего отправления и тарифы пересматриваются без предупреждения.
- **Проверяйте перед поездкой.** В отношении выходов на посадку, сроков регистрации, минимального времени на пересадку, виз, правил въезда и требований безопасности полагайтесь на аэропорт, вашу авиакомпанию и компетентные органы.

## Тарифы, предложения и бронирование

Тарифы в разделе предложений **присылают читатели**, и сайт их не проверяет и не гарантирует.

- Указанная цена — это то, что один человек увидел в один момент времени. Налоги, сборы, багаж, выбор места, даты поездки и наличие мест могут её изменить.
- Этот сайт не продаёт билеты, не блокирует бронирование и не принимает платежи. Каждое бронирование оформляется на сайте третьей стороны в соответствии с её условиями и политикой конфиденциальности.
- Не гарантируется, что какое-либо предложение всё ещё доступно. Объявления могут быть удалены или истечь в любое время, а изменившаяся цена не является недостоверным заявлением этого сайта.

## Партнёрские ссылки

Некоторые внешние ссылки на этом сайте являются **партнёрскими ссылками** — главным образом ссылки на бронирование, привязанные к тарифам, а также несколько рекомендаций по транспорту и услугам. Если вы перейдёте по такой ссылке и совершите покупку, оператор может выплатить сайту комиссию.

- Комиссия берётся из маржи оператора. **Она не меняет цену, которую вы платите**, и вы не платите больше за то, что пришли через этот сайт.
- Комиссия не покупает публикации. Сайт не продаёт места в рейтингах, отзывы или размещения, и никакая оплата не определяет, что написано на странице.
- Раскрытие указывается как на странице, содержащей ссылку, так и здесь; эта страница — заявление для всего сайта.

## Реклама

Рекламу на этом сайте размещают сторонние рекламные сети; их текущий список приведён в политике конфиденциальности. Рекламодатели не получают данные читателей через этот сайт и не могут влиять на редакционный контент. Появление рекламы здесь не является одобрением товара или услуги и не гарантирует их безопасность, законность или качество.

## Материалы, присланные читателями

Тарифы, комментарии и исправления присылают читатели. Явно незаконные материалы удаляются, но сайт не может проверять каждое сообщение на точность, актуальность и полноту. Решения, принятые на их основе, — ваша собственная ответственность.

## Внешние сайты

Этот сайт может ссылаться на аэропорты, авиакомпании, транспортных операторов и других третьих лиц. Их контент, цены, доступность и практика конфиденциальности — их собственная ответственность; сайт их не контролирует и не несёт за них ответственности.

## Ограничение ответственности

Полное положение содержится в условиях использования. Кратко: в максимальной степени, допускаемой законом, сайт не несёт ответственности за пропущенные рейсы, изменённые маршруты, отказ в посадке, дополнительные расходы или утрату данных, возникшие в результате использования этого сайта.

## Вопросы и исправления

Если цена, карта или маршрут здесь указаны неверно, сообщите нам через страницу контактов — исправления обрабатываются в первую очередь. Юридические вопросы об этой странице поступают к нам тем же путём.`,
  },

  tr: {
    title: 'Sorumluluk reddi ve satış ortaklığı bağlantıları açıklaması',
    summary:
      'Bu sitenin haritaları, ücretleri ve dış bağlantılarının ne olduğu — ve ne olmadığı: veri doğruluğu, satış ortaklığı bağlantıları, reklamlar ve sorumluluğumuzun sınırları.',
    updated: UPDATED,
    body: `World Airport Maps bağımsız bir havalimanı bilgi sitesidir. Bu sayfa sitenin içeriğinin ne olduğunu, nasıl finanse edildiğini ve sorumluluğunun nerede bittiğini açıklar. Her dildeki her sayfa için geçerlidir.

## Resmî bir kaynak değildir

Bu site bir havalimanı, havayolu şirketi, seyahat acentesi veya kamu kuruluşu değildir ve bunların hiçbiriyle bağlantılı değildir. Kamuya açık veriler ve editoryal çalışmayla oluşturulmuş bir planlama aracıdır.

- **Terminal şemaları yalnızca örnek niteliğindedir.** Gerçek ölçümlere dayalı kat planlarından değil, terminal ve kapı sayıları ile kara ulaşımı noktalarından yararlanılarak bir havalimanının genel düzenini göstermek için çizilir. Şekil, ölçek ve yön gerçek binadan farklı olabilir.
- **Bilgiler zamanla eskir.** Terminaller açılır ve kapanır, kapı numaraları değişir, havayolları terminaller arasında taşınır; ulaşım hatları, ilk ve son sefer saatleri ile ücretler önceden bildirim yapılmadan güncellenir.
- **Seyahatten önce kontrol edin.** Kapılar, check-in son başvuru süreleri, asgari aktarma süreleri, vizeler, giriş kuralları ve güvenlik gereklilikleri için havalimanına, havayolunuza ve ilgili makamlara başvurun.

## Ücretler, fırsatlar ve rezervasyonlar

Fırsatlar bölümündeki ücretler **okuyucular tarafından gönderilir** ve bu site tarafından doğrulanmaz veya garanti edilmez.

- Listelenen fiyat, bir kişinin belirli bir anda gördüğü fiyattır. Vergiler, ücretler, bagaj, koltuk seçimi, seyahat tarihleri ve müsaitlik bunu değiştirebilir.
- Bu site bilet satmaz, yer ayırmaz veya ödeme almaz. Her rezervasyon, üçüncü tarafın kendi web sitesinde, onun koşullarına ve gizlilik politikasına göre tamamlanır.
- Hiçbir teklifin hâlâ geçerli olduğu garanti edilmez. İlanlar herhangi bir anda kaldırılabilir veya süresi dolabilir; değişen bir fiyat bu sitenin yanlış beyanı değildir.

## Satış ortaklığı bağlantıları

Bu sitedeki bazı dış bağlantılar **satış ortaklığı bağlantılarıdır** — başlıca ücretlere eklenen rezervasyon bağlantıları ile birkaç ulaşım ve hizmet önerisi. Bunlardan birini izleyip bir satın alma işlemini tamamlarsanız, işletmeci bu siteye komisyon ödeyebilir.

- Komisyon, işletmecinin marjından karşılanır. **Ödediğiniz fiyatı değiştirmez** ve bu site üzerinden geldiğiniz için size daha fazla ücret yansıtılmaz.
- Komisyon, içerikte yer almayı satın almaz. Site sıralamalar, incelemeler veya yerleşimler satmaz ve hiçbir ödeme bir sayfada ne yazacağına karar vermez.
- Açıklama, her bağlantının bulunduğu sayfada ve burada yer alır; bu sayfa sitenin tamamı için geçerli beyandır.

## Reklamlar

Bu sitedeki reklamlar üçüncü taraf reklam ağları tarafından sunulur; güncel liste gizlilik politikasında yer alır. Reklam verenler bu site aracılığıyla okuyucu verilerine erişemez ve editoryal içeriği etkileyemez. Burada görünen bir reklam, ürün veya hizmetin onaylandığı anlamına gelmez; güvenliği, yasallığı veya kalitesi için bir garanti de değildir.

## Okuyucu tarafından gönderilen içerik

Ücretler, yorumlar ve düzeltmeler okuyucular tarafından gönderilir. Açıkça hukuka aykırı içerik kaldırılır, ancak site her gönderinin doğruluğunu, güncelliğini veya eksiksizliğini doğrulayamaz. Buna dayanarak verilen kararlar sizin kendi sorumluluğunuzdadır.

## Harici web siteleri

Bu site havalimanlarına, havayollarına, ulaşım işletmecilerine ve diğer üçüncü taraflara bağlantı verebilir. İçerikleri, fiyatları, müsaitlikleri ve gizlilik uygulamaları kendi sorumluluklarındadır; bu site onları kontrol etmez ve onlar için hiçbir sorumluluk kabul etmez.

## Sorumluluğun sınırlandırılması

Tam hüküm kullanım koşullarında yer alır. Kısaca: yasaların izin verdiği azami ölçüde site, bu sitenin kullanımından kaynaklanan kaçırılan uçuşlar, değişen seyahat planları, uçağa kabul edilmeme, ek maliyetler veya veri kaybı için sorumlu değildir.

## Sorular ve düzeltmeler

Burada bir fiyat, harita veya rota yanlışsa iletişim sayfası üzerinden bize bildirin — düzeltmeler öncelikli olarak ele alınır. Bu sayfayla ilgili hukuki sorular da bize aynı yoldan ulaşır.`,
  },

  th: {
    title: 'ข้อจำกัดความรับผิดและการเปิดเผยลิงก์พันธมิตร',
    summary:
      'แผนที่ ค่าโดยสาร และลิงก์ภายนอกของเว็บไซต์นี้คืออะไร และไม่ใช่อะไร: ความถูกต้องของข้อมูล ลิงก์พันธมิตร โฆษณา และขอบเขตความรับผิดของเรา',
    updated: UPDATED,
    body: `World Airport Maps เป็นเว็บไซต์ข้อมูลสนามบินอิสระ หน้านี้อธิบายว่าเนื้อหาของเว็บไซต์คืออะไร เว็บไซต์ได้รับเงินทุนอย่างไร และความรับผิดของเว็บไซต์สิ้นสุดตรงไหน หน้านี้ใช้กับทุกหน้าในทุกภาษา

## ไม่ใช่แหล่งข้อมูลทางการ

เว็บไซต์นี้ไม่ใช่สนามบิน สายการบิน บริษัทนำเที่ยว หรือหน่วยงานรัฐ และไม่มีความเกี่ยวข้องกับหน่วยงานใด ๆ เหล่านั้น เป็นเครื่องมือช่วยวางแผนที่สร้างจากข้อมูลสาธารณะและงานบรรณาธิการ

- **แผนผังอาคารผู้โดยสารเป็นภาพประกอบเท่านั้น** แผนผังเหล่านี้สร้างจากจำนวนอาคารผู้โดยสารและประตูขึ้นเครื่อง รวมถึงจุดเชื่อมต่อการคมนาคมภาคพื้นดิน เพื่อแสดงโครงสร้างโดยรวมของสนามบิน มิได้มาจากแบบแปลนที่สำรวจจริง รูปร่าง มาตราส่วน และทิศทางอาจแตกต่างจากอาคารจริง
- **ข้อมูลล้าสมัยได้** อาคารผู้โดยสารเปิดและปิด หมายเลขประตูขึ้นเครื่องเปลี่ยนแปลง สายการบินย้ายอาคารผู้โดยสาร และเส้นทางคมนาคม เวลาให้บริการเที่ยวแรกและเที่ยวสุดท้าย ตลอดจนค่าโดยสารอาจมีการปรับเปลี่ยนโดยไม่แจ้งให้ทราบ
- **ตรวจสอบก่อนเดินทาง** สำหรับประตูขึ้นเครื่อง กำหนดเวลาปิดรับเช็คอิน เวลาต่อเครื่องขั้นต่ำ วีซ่า กฎการเข้าเมือง และข้อกำหนดด้านความปลอดภัย โปรดอ้างอิงจากสนามบิน สายการบินของคุณ และหน่วยงานที่เกี่ยวข้อง

## ค่าโดยสาร ข้อเสนอ และการจอง

ค่าโดยสารในส่วนข้อเสนอ **ส่งโดยผู้อ่าน** และเว็บไซต์นี้ไม่ได้ตรวจสอบหรือรับประกัน

- ราคาที่แสดงคือราคาที่บุคคลหนึ่งเห็น ณ ขณะหนึ่ง ภาษี ค่าธรรมเนียม สัมภาระ การเลือกที่นั่ง วันที่เดินทาง และจำนวนที่นั่งที่เหลือ อาจทำให้ราคาเปลี่ยนไป
- เว็บไซต์นี้ไม่จำหน่ายตั๋ว ไม่กันที่นั่ง และไม่รับชำระเงิน การจองทุกครั้งเสร็จสิ้นบนเว็บไซต์ของบุคคลที่สาม ภายใต้ข้อกำหนดและนโยบายความเป็นส่วนตัวของเว็บไซต์นั้น
- ไม่รับประกันว่าข้อเสนอใดจะยังคงมีอยู่ ประกาศอาจถูกนำออกหรือหมดอายุได้ทุกเมื่อ และราคาที่เปลี่ยนไปไม่ใช่การแสดงข้อมูลอันเป็นเท็จของเว็บไซต์นี้

## ลิงก์พันธมิตร

ลิงก์ภายนอกบางส่วนบนเว็บไซต์นี้เป็น**ลิงก์พันธมิตร** โดยหลักคือลิงก์จองที่แนบมากับค่าโดยสาร และคำแนะนำด้านการคมนาคมและบริการบางส่วน หากคุณไปตามลิงก์ดังกล่าวและทำการซื้อให้เสร็จสิ้น ผู้ให้บริการอาจจ่ายค่าคอมมิชชั่นให้เว็บไซต์นี้

- ค่าคอมมิชชั่นมาจากส่วนต่างรายได้ของผู้ให้บริการ **ไม่ได้เปลี่ยนแปลงราคาที่คุณจ่าย** และคุณไม่ถูกเรียกเก็บเพิ่มเพราะเข้ามาผ่านเว็บไซต์นี้
- ค่าคอมมิชชั่นไม่ได้ซื้อการนำเสนอ เว็บไซต์นี้ไม่ขายอันดับ การรีวิว หรือตำแหน่งแสดงผล และไม่มีการชำระเงินใดกำหนดว่าเพจจะเขียนอะไร
- การเปิดเผยปรากฏทั้งบนหน้าที่มีลิงก์แต่ละลิงก์และที่หน้านี้ หน้านี้เป็นคำแถลงสำหรับทั้งเว็บไซต์

## โฆษณา

โฆษณาบนเว็บไซต์นี้ให้บริการโดยเครือข่ายโฆษณาบุคคลที่สาม ซึ่งนโยบายความเป็นส่วนตัวระบุรายชื่อปัจจุบันไว้ ผู้ลงโฆษณาไม่ได้รับข้อมูลผู้อ่านผ่านเว็บไซต์นี้และไม่สามารถมีอิทธิพลต่อเนื้อหาบรรณาธิการ การที่โฆษณาปรากฏที่นี่ไม่ถือเป็นการรับรองสินค้าหรือบริการนั้น และไม่ใช่การรับประกันความปลอดภัย ความชอบด้วยกฎหมาย หรือคุณภาพ

## เนื้อหาที่ผู้อ่านส่งมา

ค่าโดยสาร ความคิดเห็น และการแก้ไขส่งโดยผู้อ่าน เนื้อหาที่ผิดกฎหมายอย่างชัดแจ้งจะถูกนำออก แต่เว็บไซต์ไม่สามารถตรวจสอบความถูกต้อง ความเป็นปัจจุบัน หรือความครบถ้วนของแต่ละรายการที่ส่งมาได้ การตัดสินใจที่อิงจากข้อมูลดังกล่าวเป็นความรับผิดชอบของคุณเอง

## เว็บไซต์ภายนอก

เว็บไซต์นี้อาจมีลิงก์ไปยังสนามบิน สายการบิน ผู้ให้บริการคมนาคม และบุคคลที่สามอื่น ๆ เนื้อหา ราคา ความพร้อมใช้งาน และแนวปฏิบัติด้านความเป็นส่วนตัวของพวกเขาเป็นความรับผิดชอบของพวกเขาเอง เว็บไซต์นี้ไม่ได้ควบคุมและไม่รับผิดชอบใด ๆ ต่อพวกเขา

## ข้อจำกัดความรับผิด

ข้อกำหนดฉบับเต็มอยู่ในข้อกำหนดการใช้งาน โดยสรุป: ตามขอบเขตสูงสุดที่กฎหมายอนุญาต เว็บไซต์ไม่รับผิดชอบต่อการพลาดเที่ยวบิน ตารางเดินทางที่เปลี่ยนแปลง การถูกปฏิเสธการขึ้นเครื่อง ค่าใช้จ่ายเพิ่มเติม หรือข้อมูลสูญหายอันเกิดจากการใช้เว็บไซต์นี้

## คำถามและการแก้ไข

หากราคา แผนที่ หรือเส้นทางในหน้านี้ไม่ถูกต้อง โปรดแจ้งผ่านหน้าติดต่อเรา โดยการแก้ไขจะได้รับการดำเนินการก่อน คำถามทางกฎหมายเกี่ยวกับหน้านี้ก็มาถึงเราในช่องทางเดียวกัน`,
  },
};
