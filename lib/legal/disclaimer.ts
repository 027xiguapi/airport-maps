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
 * Chinese, Traditional Chinese, German, French, Italian and Korean versions
 * deploy atomically with the app.
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
};
