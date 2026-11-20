/**
 * Guide copy for the nine locales added after the first generated batch
 * (nl, sv, pl, cs, ro, uk, hi, bn, sw). Consumed by
 * scripts/generate-localized-guides.mjs via Object.assign, so the structure is
 * identical to the built-in T map there.
 */
export const GUIDE_T = {
  nl: {
    marker:
      'Deze pagina bundelt wat de database, de kaarten en de routedataset over deze luchthaven zeggen.',
    title: (name) => `${name}: luchthavengids`,
    summary: (o) =>
      `${o.name} (${o.iata}) bedient ${o.city}, ${o.country} als ${o.kind}. Kaart, rechtstreekse bestemmingen, nabije luchthavens en wat u nog met de luchtvaartmaatschappij moet afstemmen.`,
    intro: (o) =>
      `${o.name} (IATA **${o.iata}**${o.icao ? `, ICAO ${o.icao}` : ''}) bedient ${o.city}, ${o.country}${o.region ? ` (${o.region})` : ''} als ${o.kind}. ${o.marker}`,
    factsTitle: 'In één oogopslag',
    facts: {
      iata: 'IATA / ICAO', class: 'Luchthavenklasse', location: 'Locatie', coords: 'Coördinaten',
      pax: 'Passagiers per jaar', distance: 'Naar het stadscentrum',
      destinations: 'Rechtstreekse bestemmingen', seeBelow: 'zie hieronder',
    },
    mapTitle: 'Luchthavenkaart',
    mapText:
      'De kaart op deze pagina wordt uit OpenStreetMap-data getekend: luchthavens met terminalpolygonen tonen terminalgebouwen, platformen en toegangswegen, kleine velden tonen de omtrek van het veld en de startbaan. Iconen voor parkeren, bussen, horeca, hotels en autoverhuur volgen wat in OSM is gekarteerd.',
    mapBullets: [
      '**Volledige weergave** — open de kaart op deze pagina om in te zoomen; het origineel van 2000 px kan worden gedownload.',
      '**Locatiekaart** — de interactieve kaart laat u verschuiven en zoomen om het veld ten opzichte van stad en wegennet te zien.',
      '**Schema** — de pagina tekent ook een proportioneel schema om de schaal van de luchthaven aan te geven; dat is niet de werkelijke indeling.',
    ],
    routesTitle: 'Rechtstreekse bestemmingen',
    routesIntro:
      'Rechtstreekse bestemmingen, dichtstbij eerst (OpenFlights-routedataset, samengesteld in 2014 — indicatief, bevestig bij de luchtvaartmaatschappij):',
    routesHead: ['Bestemming', 'Afstand', 'Belangrijkste maatschappijen'],
    routesClosing: (o) =>
      `De volledige lijst van ${o.count} rechtstreekse bestemmingen staat op de [routekaart van ${o.name}](/${o.locale}/route/${o.iata}).`,
    noRoutes:
      'De routedataset bevat geen rechtstreekse diensten voor deze luchthaven. Regionale dienstregelingen veranderen vaak — bevestig bij de maatschappij of luchthaven voordat u boekt.',
    nearbyTitle: 'Nabije luchthavens',
    nearbyIntro: 'Als er niets past, is een vergelijking met deze nabije velden de moeite waard:',
    nearbyHead: ['Luchthaven', 'Afstand'],
    gettingTitle: 'Hoe komt u er',
    gettingLead: 'De luchthaven:',
    mapLink: 'Google Maps',
    gettingNote:
      'De locatiekaart op deze pagina toont het veld ten opzichte van stad en wegennet, en het hoofdstuk grondvervoer noemt het geregistreerde openbaar vervoer. Voor routes, dienstregelingen en parkeren vertrouwt u op de informatie van de luchthaven zelf.',
    sizeTitle: 'Omvang en voorzieningen',
    kindParagraph: {
      large:
        'Grote luchthavens hebben meerdere startbanen en terminals en verwerken miljoenen passagiers per jaar. Wachtrijen bij inchecken en beveiliging verschillen sterk per tijdstip; voor internationale vluchten moet u 2–3 uur voor vertrek aanwezig zijn.',
      medium:
        'Middelgrote luchthavens zijn regionale hubs: één compacte terminal, korte loopafstanden en meestal sneller inchecken dan in een grote hub — maar met minder frequenties, waardoor omboeken na een gemiste vlucht lastiger is. Reken op 90–120 minuten voor vertrek.',
      small:
        'Kleine velden hebben minimale voorzieningen, meestal één terminal op één niveau waarvan de incheckbalies kort voor de vlucht opengaan. Grondvervoer is schaars; eigen auto of een vooraf geboekte transfer is veiliger.',
      heliport:
        'Helikopterhavens bedienen alleen helikoptervluchten — geen gebruikelijke terminalstroom. Het aantal stoelen en de routes zijn kort; kom op de tijd die de exploitant noemt.',
    },
    sizeClosing:
      'Terminalplattegronden, inchecklocaties en dienstregelingen van het grondvervoer worden door de luchthaven zelf gepubliceerd; voor details die op de reisdag moeten kloppen, vertrouwt u op de informatie van de luchthaven. Ziet iets er hier verkeerd uit, meld het via de contactpagina en we controleren het.',
    tipsTitle: 'Tips',
    tipConnection: (o) =>
      `- Staat uw bestemming niet in de tabel hierboven, dan reist u meestal via ${o.name} (${o.iata}) of een grotere luchthaven.`,
    tipSearch:
      '- Gebruik het zoekvak boven aan de pagina om alternatieven te vergelijken: typ een stadsnaam of IATA-code.',
    tipPeak:
      '- In het hoogseizoen zijn parkeren en huurauto’s ook op kleine velden schaars — boek vooruit als u zelf rijdt.',
  },

  sv: {
    marker:
      'Den här sidan sammanfattar vad databasen, kartorna och ruttdatauppsättningen säger om flygplatsen.',
    title: (name) => `${name}: flygplatsguide`,
    summary: (o) =>
      `${o.name} (${o.iata}) betjänar ${o.city}, ${o.country} som ${o.kind}. Karta, direktdestinationer, närliggande flygplatser och vad som ännu behöver stämmas av med flygbolaget.`,
    intro: (o) =>
      `${o.name} (IATA **${o.iata}**${o.icao ? `, ICAO ${o.icao}` : ''}) betjänar ${o.city}, ${o.country}${o.region ? ` (${o.region})` : ''} som ${o.kind}. ${o.marker}`,
    factsTitle: 'I korthet',
    facts: {
      iata: 'IATA / ICAO', class: 'Flygplatsklass', location: 'Läge', coords: 'Koordinater',
      pax: 'Passagerare per år', distance: 'Till stadskärnan',
      destinations: 'Direktdestinationer', seeBelow: 'se nedan',
    },
    mapTitle: 'Flygplatskarta',
    mapText:
      'Kartan på den här sidan ritas från OpenStreetMap-data: flygplatser med terminalpolygoner visar terminalbyggnader, plattor och tillfartsvägar, medan små fält visar fältets kontur och startbanan. Ikoner för parkering, bussar, mat, hotell och biluthyrning följer det som är karterat i OSM.',
    mapBullets: [
      '**Fullstor vy** — öppna kartkortet på sidan för att zooma; originalet på 2000 px kan laddas ner.',
      '**Lägeskarta** — den interaktiva kartan kan panoreras och zoomas för att visa fältet mot staden och vägnätet.',
      '**Schema** — sidan ritar också ett proportionsschema för att visa flygplatsens skala; det är inte den verkliga layouten.',
    ],
    routesTitle: 'Direktdestinationer',
    routesIntro:
      'Direktdestinationer, närmast först (OpenFlights ruttdata, sammanställd 2014 — vägledande, bekräfta med flygbolaget):',
    routesHead: ['Destination', 'Avstånd', 'Huvudflygbolag'],
    routesClosing: (o) =>
      `Hela listan med ${o.count} direktdestinationer finns på [ruttkartan för ${o.name}](/${o.locale}/route/${o.iata}).`,
    noRoutes:
      'Ruttdatauppsättningen innehåller inga direktförbindelser för den här flygplatsen. Regionala tidtabeller ändras ofta — bekräfta med flygbolaget eller flygplatsen före bokning.',
    nearbyTitle: 'Närliggande flygplatser',
    nearbyIntro: 'Om inget passar är det värt att jämföra dessa närliggande fält:',
    nearbyHead: ['Flygplats', 'Avstånd'],
    gettingTitle: 'Ta sig dit',
    gettingLead: 'Flygplatsen:',
    mapLink: 'Google Maps',
    gettingNote:
      'Lägeskartan på sidan visar fältet mot staden och vägnätet, och avsnittet om marktransport listar den registrerade kollektivtrafiken. För vägbeskrivningar, tidtabeller och parkering hänvisas till flygplatsens egen information.',
    sizeTitle: 'Storlek och faciliteter',
    kindParagraph: {
      large:
        'Stora flygplatser har flera startbanor och terminaler och hanterar miljontals passagerare per år. Kötiderna vid incheckning och säkerhetskontroll varierar starkt med tiden på dygnet; för internationella flyg bör du vara på plats 2–3 timmar före avgång.',
      medium:
        'Medelstora flygplatser är regionala nav: en kompakt terminal, korta promenadavstånd och oftast snabbare incheckning än på ett stort nav — men färre avgångar, så ombokning efter en missad flight är svårare. Sikta på 90–120 minuter före avgång.',
      small:
        'Små fält har minimala faciliteter, oftast en terminal i ett plan vars incheckningsdiskar öppnar strax före flyget. Marktransporten är gles; egen bil eller en förbokad transfer är säkrare.',
      heliport:
        'Helikopterplattor betjänar endast helikopterflyg — inget vanligt terminalflöde. Antalet platser och sträckorna är korta; kom vid den tid operatören anger.',
    },
    sizeClosing:
      'Terminalplaner, incheckningslägen och tidtabeller för marktransport publiceras av flygplatsen själv; för detaljer som måste stämma på resdagen, lita på flygplatsens information. Om något här ser fel ut, meddela oss via kontaktsidan så kontrollerar vi det.',
    tipsTitle: 'Tips',
    tipConnection: (o) =>
      `- Om din destination inte finns i tabellen ovan reser du oftast via ${o.name} (${o.iata}) eller en större flygplats.`,
    tipSearch:
      '- Använd sökfältet högst upp på sidan för att jämföra alternativ: skriv ett stadsnamn eller en IATA-kod.',
    tipPeak:
      '- Under högsäsong är parkering och hyrbilar knappa även på små fält — boka i förväg om du kör själv.',
  },

  pl: {
    marker:
      'Ta strona podsumowuje, co baza danych, mapy i zbiór danych o trasach mówią o tym lotnisku.',
    title: (name) => `${name}: przewodnik po lotnisku`,
    summary: (o) =>
      `${o.name} (${o.iata}) obsługuje ${o.city}, ${o.country} jako ${o.kind}. Mapa, kierunki bezpośrednie, pobliskie lotniska i to, co jeszcze trzeba potwierdzić w linii lotniczej.`,
    intro: (o) =>
      `${o.name} (IATA **${o.iata}**${o.icao ? `, ICAO ${o.icao}` : ''}) obsługuje ${o.city}, ${o.country}${o.region ? ` (${o.region})` : ''} jako ${o.kind}. ${o.marker}`,
    factsTitle: 'W skrócie',
    facts: {
      iata: 'IATA / ICAO', class: 'Klasa lotniska', location: 'Lokalizacja', coords: 'Współrzędne',
      pax: 'Pasażerowie rocznie', distance: 'Do centrum miasta',
      destinations: 'Kierunki bezpośrednie', seeBelow: 'patrz poniżej',
    },
    mapTitle: 'Mapa lotniska',
    mapText:
      'Mapa na tej stronie jest rysowana z danych OpenStreetMap: lotniska z poligonami terminali pokazują budynki terminali, płyty postojowe i drogi dojazdowe, a małe lądowiska obrys pola i pas startowy. Ikony parkingu, autobusów, gastronomii, hoteli i wypożyczalni samochodów odpowiadają temu, co jest zmapowane w OSM.',
    mapBullets: [
      '**Widok pełnowymiarowy** — otwórz kartę mapy na tej stronie, aby powiększyć; oryginał 2000 px można pobrać.',
      '**Mapa lokalizacji** — mapa interaktywna pozwala przesuwać i powiększać, aby zobaczyć lotnisko na tle miasta i sieci dróg.',
      '**Schemat** — strona rysuje też schemat proporcjonalny, aby pokazać skalę lotniska; to nie jest rzeczywisty układ.',
    ],
    routesTitle: 'Kierunki bezpośrednie',
    routesIntro:
      'Kierunki bezpośrednie, najbliższe najpierw (zbiór tras OpenFlights, zestawiony w 2014 r. — orientacyjny, potwierdź w linii lotniczej):',
    routesHead: ['Kierunek', 'Odległość', 'Główne linie lotnicze'],
    routesClosing: (o) =>
      `Pełna lista ${o.count} kierunków bezpośrednich jest na [mapie tras ${o.name}](/${o.locale}/route/${o.iata}).`,
    noRoutes:
      'Zbiór tras nie zawiera połączeń bezpośrednich dla tego lotniska. Regionalne rozkłady często się zmieniają — potwierdź w linii lotniczej lub na lotnisku przed rezerwacją.',
    nearbyTitle: 'Pobliskie lotniska',
    nearbyIntro: 'Jeśli nic nie pasuje, warto porównać te pobliskie lotniska:',
    nearbyHead: ['Lotnisko', 'Odległość'],
    gettingTitle: 'Jak dojechać',
    gettingLead: 'Lotnisko:',
    mapLink: 'Google Maps',
    gettingNote:
      'Mapa lokalizacji pokazuje lotnisko na tle miasta i sieci dróg, a sekcja transportu naziemnego wymienia zarejestrowany transport publiczny. W sprawie tras, rozkładów i parkowania kieruj się informacjami samego lotniska.',
    sizeTitle: 'Wielkość i udogodnienia',
    kindParagraph: {
      large:
        'Duże lotniska mają kilka pasów startowych i terminali oraz obsługują miliony pasażerów rocznie. Czas oczekiwania przy odprawie i kontroli bezpieczeństwa mocno zależy od godziny; na loty międzynarodowe przyjedź 2–3 godziny przed odlotem.',
      medium:
        'Lotniska średniej wielkości to węzły regionalne: jeden kompaktowy terminal, krótkie odległości pieszo i zwykle szybsza odprawa niż w dużym węźle — ale mniej połączeń, więc rezerwacja po utracie lotu jest trudniejsza. Zaplanuj 90–120 minut przed odlotem.',
      small:
        'Małe lotniska mają minimalne udogodnienia, zwykle jeden jednopoziomowy terminal, którego stanowiska odprawy otwierają się krótko przed lotem. Transport naziemny jest rzadki; własny samochód lub zamówiony transfer jest bezpieczniejszy.',
      heliport:
        'Lądowiska dla helikopterów obsługują wyłącznie loty śmigłowcowe — bez zwykłego obiegu terminalowego. Liczba miejsc i trasy są krótkie; przyjedź o godzinie podanej przez operatora.',
    },
    sizeClosing:
      'Plany terminali, miejsca odprawy i rozkłady transportu naziemnego publikuje samo lotnisko; w sprawie informacji, które muszą być dokładne w dniu podróży, kieruj się jego komunikatami. Jeśli coś tutaj wygląda źle, zgłoś to przez stronę kontaktową, a sprawdzimy.',
    tipsTitle: 'Wskazówki',
    tipConnection: (o) =>
      `- Jeśli Twojego kierunku nie ma w tabeli powyżej, zwykle podróżujesz przez ${o.name} (${o.iata}) lub większe lotnisko.`,
    tipSearch:
      '- Użyj wyszukiwarki u góry strony, aby porównać alternatywy: wpisz nazwę miasta lub kod IATA.',
    tipPeak:
      '- W szczycie sezonu parkingi i wypożyczalnie samochodów są deficytowe także na małych lotniskach — rezerwuj z wyprzedzeniem, jeśli prowadzisz.',
  },

  cs: {
    marker:
      'Tato stránka shrnuje, co databáze, mapy a datová sada tras o tomto letišti uvádějí.',
    title: (name) => `${name}: průvodce letištěm`,
    summary: (o) =>
      `${o.name} (${o.iata}) obsluhuje ${o.city}, ${o.country} jako ${o.kind}. Mapa, přímé destinace, blízká letiště a co je ještě třeba potvrdit u aerolinky.`,
    intro: (o) =>
      `${o.name} (IATA **${o.iata}**${o.icao ? `, ICAO ${o.icao}` : ''}) obsluhuje ${o.city}, ${o.country}${o.region ? ` (${o.region})` : ''} jako ${o.kind}. ${o.marker}`,
    factsTitle: 'V kostce',
    facts: {
      iata: 'IATA / ICAO', class: 'Třída letiště', location: 'Poloha', coords: 'Souřadnice',
      pax: 'Cestující ročně', distance: 'Do centra města',
      destinations: 'Přímé destinace', seeBelow: 'viz níže',
    },
    mapTitle: 'Mapa letiště',
    mapText:
      'Mapa na této stránce se kreslí z dat OpenStreetMap: letiště s polygony terminálů zobrazují budovy terminálů, odbavovací plochy a příjezdové cesty, malá pole obrys letiště a dráhu. Ikony parkování, autobusů, stravování, hotelů a půjčoven aut odpovídají tomu, co je v OSM zaneseno.',
    mapBullets: [
      '**Plná velikost** — otevřete kartu mapy na této stránce a přibližte; originál 2000 px lze stáhnout.',
      '**Mapa polohy** — interaktivní mapu lze posouvat a přibližovat, aby bylo pole vidět vůči městu a silniční síti.',
      '**Schéma** — stránka kreslí také poměrové schéma velikosti letiště; nejde o skutečné uspořádání.',
    ],
    routesTitle: 'Přímé destinace',
    routesIntro:
      'Přímé destinace, nejbližší první (datová sada tras OpenFlights, sestavená 2014 — orientační, potvrďte u aerolinky):',
    routesHead: ['Destinace', 'Vzdálenost', 'Hlavní aerolinky'],
    routesClosing: (o) =>
      `Úplný seznam ${o.count} přímých destinací je na [mapě tras ${o.name}](/${o.locale}/route/${o.iata}).`,
    noRoutes:
      'Datová sada tras pro toto letiště neobsahuje přímé spoje. Regionální jízdní řády se často mění — před rezervací je potvrďte u aerolinky nebo letiště.',
    nearbyTitle: 'Blízká letiště',
    nearbyIntro: 'Pokud nic nevyhovuje, stojí za srovnání tato blízká pole:',
    nearbyHead: ['Letiště', 'Vzdálenost'],
    gettingTitle: 'Jak se dostat',
    gettingLead: 'Letiště:',
    mapLink: 'Google Maps',
    gettingNote:
      'Mapa polohy na této stránce ukazuje pole vůči městu a silniční síti a sekce pozemní dopravy uvádí evidovanou veřejnou dopravu. Pro trasy, jízdní řády a parkování se obraťte na informace samotného letiště.',
    sizeTitle: 'Velikost a vybavení',
    kindParagraph: {
      large:
        'Velká letiště mají několik drah a terminálů a odbavují miliony cestujících ročně. Čekací doby u odbavení a bezpečnostní kontroly silně závisí na denní době; u mezinárodních letů přijďte 2–3 hodiny před odletem.',
      medium:
        'Středně velká letiště jsou regionální uzly: jeden kompaktní terminál, krátké pěší vzdálenosti a obvykle rychlejší odbavení než ve velkém uzlu — ale méně spojů, takže přerezervování po zmeškaném letu je obtížnější. Počítejte s 90–120 minutami před odletem.',
      small:
        'Malá pole mají minimální vybavení, obvykle jeden jednopodlažní terminál, jehož přepážky se otevírají krátce před letem. Pozemní doprava je řídká; vlastní auto nebo objednaný transfer je bezpečnější.',
      heliport:
        'Heliporty obsluhují pouze vrtulníkové lety — žádný běžný terminálový proces. Počet míst a trasy jsou krátké; přijďte v čase uvedeném provozovatelem.',
    },
    sizeClosing:
      'Plány terminálů, umístění odbavení a jízdní řády pozemní dopravy zveřejňuje samo letiště; u údajů, které musí v den cesty platit, se řiďte jeho informacemi. Pokud zde něco vypadá špatně, dejte nám vědět přes kontaktní stránku a zkontrolujeme to.',
    tipsTitle: 'Tipy',
    tipConnection: (o) =>
      `- Pokud vaše destinace není v tabulce výše, obvykle cestujete přes ${o.name} (${o.iata}) nebo větší letiště.`,
    tipSearch:
      '- Hledáním v horním poli porovnejte alternativy: zadejte název města nebo kód IATA.',
    tipPeak:
      '- V sezóně bývá nedostatek parkování i půjčoven aut i na malých polích — pokud řídíte, rezervujte předem.',
  },

  ro: {
    marker:
      'Această pagină rezumă ce spun baza de date, hărțile și setul de date despre rute despre acest aeroport.',
    title: (name) => `${name}: ghidul aeroportului`,
    summary: (o) =>
      `${o.name} (${o.iata}) deservește ${o.city}, ${o.country} ca ${o.kind}. Hartă, destinații directe, aeroporturi din apropiere și ce mai trebuie confirmat cu compania aeriană.`,
    intro: (o) =>
      `${o.name} (IATA **${o.iata}**${o.icao ? `, ICAO ${o.icao}` : ''}) deservește ${o.city}, ${o.country}${o.region ? ` (${o.region})` : ''} ca ${o.kind}. ${o.marker}`,
    factsTitle: 'Pe scurt',
    facts: {
      iata: 'IATA / ICAO', class: 'Clasa aeroportului', location: 'Locație', coords: 'Coordonate',
      pax: 'Pasageri pe an', distance: 'Până în centrul orașului',
      destinations: 'Destinații directe', seeBelow: 'vezi mai jos',
    },
    mapTitle: 'Harta aeroportului',
    mapText:
      'Harta de pe această pagină este desenată din date OpenStreetMap: aeroporturile cu poligoane de terminale arată clădirile terminalelor, platformele și drumurile de acces, iar terenurile mici conturul aerodromului și pista. Pictogramele pentru parcare, autobuze, restaurante, hoteluri și închirieri auto urmează ce este cartografiat în OSM.',
    mapBullets: [
      '**Vizualizare la dimensiune completă** — deschideți cardul hărții de pe această pagină pentru a mări; originalul de 2000 px poate fi descărcat.',
      '**Harta locației** — harta interactivă permite deplasarea și mărirea pentru a vedea terenul față de oraș și rețeaua rutieră.',
      '**Schemă** — pagina desenează și o schemă proporțională pentru a indica scara aeroportului; nu este planul real.',
    ],
    routesTitle: 'Destinații directe',
    routesIntro:
      'Destinații directe, cele mai apropiate primele (setul de date OpenFlights, compilat în 2014 — orientativ, confirmați cu compania aeriană):',
    routesHead: ['Destinație', 'Distanță', 'Principalele companii'],
    routesClosing: (o) =>
      `Lista completă a ${o.count} destinații directe este pe [harta rutelor ${o.name}](/${o.locale}/route/${o.iata}).`,
    noRoutes:
      'Setul de date nu conține servicii directe pentru acest aeroport. Orarele regionale se schimbă des — confirmați cu compania aeriană sau aeroportul înainte de rezervare.',
    nearbyTitle: 'Aeroporturi din apropiere',
    nearbyIntro: 'Dacă nimic nu se potrivește, merită comparate aceste aerodromuri apropiate:',
    nearbyHead: ['Aeroport', 'Distanță'],
    gettingTitle: 'Cum ajungi',
    gettingLead: 'Aeroportul:',
    mapLink: 'Google Maps',
    gettingNote:
      'Harta locației arată terenul față de oraș și rețeaua rutieră, iar secțiunea de transport terestru enumeră transportul public înregistrat. Pentru rute, orare și parcare, folosiți informațiile aeroportului însuși.',
    sizeTitle: 'Dimensiune și facilități',
    kindParagraph: {
      large:
        'Aeroporturile mari au mai multe piste și terminale și deservesc milioane de pasageri pe an. Timpii de așteptare la check-in și securitate variază puternic în funcție de oră; pentru zboruri internaționale, ajungeți cu 2–3 ore înainte de plecare.',
      medium:
        'Aeroporturile de dimensiuni medii sunt huburi regionale: un terminal compact, distanțe scurte de mers pe jos și de obicei un check-in mai rapid decât într-un hub mare — dar cu mai puține frecvențe, așa că rerutarea după un zbor pierdut este mai dificilă. Țintiți 90–120 de minute înainte de plecare.',
      small:
        'Aerodromurile mici au facilități minime, de obicei un terminal cu un singur nivel ale cărui ghișee se deschid cu puțin timp înainte de zbor. Transportul terestru este rar; mașina proprie sau un transfer rezervat este mai sigur.',
      heliport:
        'Heliporturile deservesc doar zboruri cu elicopterul — fără fluxul obișnuit al unui terminal. Numărul de locuri și rutele sunt scurte; veniți la ora indicată de operator.',
    },
    sizeClosing:
      'Planurile terminalelor, locațiile check-inului și orarele transportului terestru sunt publicate de aeroport; pentru detalii care trebuie să fie corecte în ziua călătoriei, folosiți informațiile aeroportului. Dacă ceva pare greșit aici, spuneți-ne prin pagina de contact și verificăm.',
    tipsTitle: 'Sfaturi',
    tipConnection: (o) =>
      `- Dacă destinația dvs. nu este în tabelul de mai sus, de obicei călătoriți prin ${o.name} (${o.iata}) sau un aeroport mai mare.`,
    tipSearch:
      '- Folosiți căutarea din partea de sus pentru a compara alternative: tastați un nume de oraș sau un cod IATA.',
    tipPeak:
      '- În sezonul de vârf, parcarea și mașinile de închiriat lipsesc și pe aerodromurile mici — rezervați din timp dacă veți conduce.',
  },

  uk: {
    marker:
      'Ця сторінка збирає те, що база даних, карти та набір даних про маршрути кажуть про цей аеропорт.',
    title: (name) => `${name}: путівник аеропортом`,
    summary: (o) =>
      `${o.name} (${o.iata}) обслуговує ${o.city}, ${o.country} як ${o.kind}. Карта, прямі напрямки, сусідні аеропорти та те, що ще треба уточнити в авіакомпанії.`,
    intro: (o) =>
      `${o.name} (IATA **${o.iata}**${o.icao ? `, ICAO ${o.icao}` : ''}) обслуговує ${o.city}, ${o.country}${o.region ? ` (${o.region})` : ''} як ${o.kind}. ${o.marker}`,
    factsTitle: 'Коротко',
    facts: {
      iata: 'IATA / ICAO', class: 'Клас аеропорту', location: 'Розташування', coords: 'Координати',
      pax: 'Пасажирів на рік', distance: 'До центру міста',
      destinations: 'Прямі напрямки', seeBelow: 'див. нижче',
    },
    mapTitle: 'Карта аеропорту',
    mapText:
      'Карта на цій сторінці малюється з даних OpenStreetMap: аеропорти з полігонами терміналів показують будівлі терміналів, перони та під’їзні дороги, а невеликі майданчики — контур аеродрому й злітну смугу. Позначки паркування, автобусів, харчування, готелів і прокату авто відповідають тому, що нанесено в OSM.',
    mapBullets: [
      '**Повний розмір** — відкрийте картку карти на цій сторінці, щоб наблизити; оригінал 2000 px можна завантажити.',
      '**Карта розташування** — інтерактивну карту можна перетягувати й масштабувати, щоб побачити аеродром щодо міста та дорожньої мережі.',
      '**Схема** — сторінка також малює пропорційну схему, щоб показати масштаб аеропорту; це не реальне планування.',
    ],
    routesTitle: 'Прямі напрямки',
    routesIntro:
      'Прямі напрямки, найближчі першими (набір даних OpenFlights, укладений 2014 року — орієнтовно, уточнюйте в авіакомпанії):',
    routesHead: ['Напрямок', 'Відстань', 'Основні авіакомпанії'],
    routesClosing: (o) =>
      `Повний список ${o.count} прямих напрямків — на [карті маршрутів ${o.name}](/${o.locale}/route/${o.iata}).`,
    noRoutes:
      'У наборі даних немає прямих рейсів для цього аеропорту. Регіональні розклади часто змінюються — уточнюйте в авіакомпанії або аеропорту перед бронюванням.',
    nearbyTitle: 'Сусідні аеропорти',
    nearbyIntro: 'Якщо нічого не підходить, варто порівняти ці найближчі аеродроми:',
    nearbyHead: ['Аеропорт', 'Відстань'],
    gettingTitle: 'Як дістатися',
    gettingLead: 'Аеропорт:',
    mapLink: 'Google Maps',
    gettingNote:
      'Карта розташування показує аеродром щодо міста та дорожньої мережі, а розділ наземного транспорту перелічує врахований громадський транспорт. Для маршрутів, розкладів і паркування покладайтеся на інформацію самого аеропорту.',
    sizeTitle: 'Розмір і зручності',
    kindParagraph: {
      large:
        'Великі аеропорти мають кілька злітних смуг і терміналів та обслуговують мільйони пасажирів на рік. Час очікування на реєстрації та контролі сильно залежить від години; на міжнародні рейси приїжджайте за 2–3 години до вильоту.',
      medium:
        'Аеропорти середнього розміру — регіональні вузли: компактний термінал, короткі піші відстані й зазвичай швидша реєстрація, ніж у великому хабі, але менше рейсів, тому перебронювання після пропущеного рейсу складніше. Орієнтуйтеся на 90–120 хвилин до вильоту.',
      small:
        'Малі аеродроми мають мінімум зручностей, зазвичай один одноповерховий термінал, стійки реєстрації якого відкриваються незадовго до рейсу. Наземний транспорт рідкісний; власне авто або замовлений трансфер безпечніший.',
      heliport:
        'Вертодроми обслуговують лише вертолітні рейси — звичайного термінального процесу немає. Кількість місць і маршрути короткі; приїжджайте на час, указаний оператором.',
    },
    sizeClosing:
      'Плани терміналів, розташування реєстрації та розклади наземного транспорту публікує сам аеропорт; для відомостей, які мають бути точними в день подорожі, покладайтеся на його інформацію. Якщо щось тут виглядає неправильно, повідомте через сторінку контактів, і ми перевіримо.',
    tipsTitle: 'Поради',
    tipConnection: (o) =>
      `- Якщо вашого напрямку немає в таблиці вище, зазвичай ви летите через ${o.name} (${o.iata}) або більший аеропорт.`,
    tipSearch:
      '- Скористайтеся полем пошуку вгорі сторінки, щоб порівняти варіанти: введіть назву міста або код IATA.',
    tipPeak:
      '- У високий сезон паркування й прокат авто бракує й на малих аеродромах — бронюйте заздалегідь, якщо керуєте авто.',
  },

  hi: {
    marker:
      'यह पेज बताता है कि डेटाबेस, मैप और रूट डेटासेट इस हवाई अड्डे के बारे में क्या कहते हैं।',
    title: (name) => `${name}: हवाई अड्डा गाइड`,
    summary: (o) =>
      `${o.name} (${o.iata}) ${o.city}, ${o.country} को ${o.kind} के रूप में सेवा देता है। मैप, सीधे गंतव्य, निकटवर्ती हवाई अड्डे और एयरलाइन से पुष्टि करने योग्य बातें।`,
    intro: (o) =>
      `${o.name} (IATA **${o.iata}**${o.icao ? `, ICAO ${o.icao}` : ''}) ${o.city}, ${o.country}${o.region ? ` (${o.region})` : ''} को ${o.kind} के रूप में सेवा देता है। ${o.marker}`,
    factsTitle: 'एक नज़र में',
    facts: {
      iata: 'IATA / ICAO', class: 'हवाई अड्डा वर्ग', location: 'स्थान', coords: 'निर्देशांक',
      pax: 'वार्षिक यात्री', distance: 'शहर के केंद्र तक',
      destinations: 'सीधे गंतव्य', seeBelow: 'नीचे देखें',
    },
    mapTitle: 'हवाई अड्डा मैप',
    mapText:
      'इस पेज का मैप OpenStreetMap डेटा से बनाया जाता है: टर्मिनल पॉलीगन वाले हवाई अड्डे टर्मिनल भवन, एप्रन और पहुंच मार्ग दिखाते हैं, जबकि छोटे मैदान एयरोड्रोम की रूपरेखा और रनवे दिखाते हैं। पार्किंग, बस, भोजन, होटल और कार किराए के आइकन OSM में मैप किए गए अनुसार होते हैं।',
    mapBullets: [
      '**पूर्ण आकार दृश्य** — इस पेज पर मैप कार्ड खोलकर ज़ूम करें; 2000 px मूल डाउनलोड किया जा सकता है।',
      '**स्थान मैप** — इंटरैक्टिव मैप को खींचकर और ज़ूम करके शहर व सड़क नेटवर्क के सापेक्ष मैदान देखें।',
      '**योजनाबद्ध चित्र** — पेज हवाई अड्डे का पैमाना बताने के लिए अनुपातिक चित्र भी बनाता है; यह वास्तविक लेआउट नहीं है।',
    ],
    routesTitle: 'सीधे गंतव्य',
    routesIntro:
      'सीधे गंतव्य, सबसे नज़दीक पहले (OpenFlights रूट डेटासेट, 2014 में संकलित — सांकेतिक, एयरलाइन से पुष्टि करें):',
    routesHead: ['गंतव्य', 'दूरी', 'मुख्य एयरलाइंस'],
    routesClosing: (o) =>
      `${o.count} सीधे गंतव्यों की पूरी सूची [${o.name} रूट मैप](/${o.locale}/route/${o.iata}) पर है।`,
    noRoutes:
      'रूट डेटासेट में इस हवाई अड्डे के लिए कोई सीधी सेवा नहीं है। क्षेत्रीय समय-सारणी अक्सर बदलती है — बुकिंग से पहले एयरलाइन या हवाई अड्डे से पुष्टि करें।',
    nearbyTitle: 'निकटवर्ती हवाई अड्डे',
    nearbyIntro: 'अगर कुछ भी उपयुक्त न हो, तो इन निकटवर्ती मैदानों की तुलना करें:',
    nearbyHead: ['हवाई अड्डा', 'दूरी'],
    gettingTitle: 'कैसे पहुंचें',
    gettingLead: 'हवाई अड्डा:',
    mapLink: 'Google Maps',
    gettingNote:
      'इस पेज का स्थान मैप शहर व सड़क नेटवर्क के सापेक्ष मैदान दिखाता है, और भूमि परिवहन अनुभाग दर्ज सार्वजनिक परिवहन सूचीबद्ध करता है। मार्ग, समय-सारणी और पार्किंग के लिए हवाई अड्डे की अपनी जानकारी पर भरोसा करें।',
    sizeTitle: 'आकार और सुविधाएं',
    kindParagraph: {
      large:
        'बड़े हवाई अड्डों में कई रनवे और टर्मिनल होते हैं और सालाना लाखों यात्री आते-जाते हैं। चेक-इन और सुरक्षा में कतार का समय दिन के समय के अनुसार बहुत बदलता है; अंतर्राष्ट्रीय उड़ानों के लिए प्रस्थान से 2–3 घंटे पहले पहुंचें।',
      medium:
        'मध्यम आकार के हवाई अड्डे क्षेत्रीय हब हैं: एक छोटा टर्मिनल, कम पैदल दूरी और आम तौर पर बड़े हब से तेज़ चेक-इन — लेकिन कम उड़ानें, इसलिए छूटी उड़ान के बाद दोबारा बुक करना कठिन है। प्रस्थान से 90–120 मिनट पहले पहुंचने का लक्ष्य रखें।',
      small:
        'छोटे मैदानों में न्यूनतम सुविधाएं होती हैं, आम तौर पर एक ही मंज़िल का टर्मिनल जिसके चेक-इन काउंटर उड़ान से थोड़ा पहले खुलते हैं। भूमि परिवहन विरल है; अपनी कार या पहले से बुक किया ट्रांसफर सुरक्षित है।',
      heliport:
        'हेलीपोर्ट केवल हेलीकॉप्टर उड़ानों की सेवा करते हैं — सामान्य टर्मिनल प्रक्रिया नहीं। सीटों की संख्या और मार्ग छोटे होते हैं; ऑपरेटर के बताए समय पर पहुंचें।',
    },
    sizeClosing:
      'टर्मिनल योजनाएं, चेक-इन स्थान और भूमि परिवहन समय-सारणी हवाई अड्डा स्वयं प्रकाशित करता है; यात्रा के दिन सही होने वाली जानकारी के लिए उसकी जानकारी पर भरोसा करें। यहां कुछ गलत लगे तो संपर्क पेज से बताएं, हम जांच करेंगे।',
    tipsTitle: 'सुझाव',
    tipConnection: (o) =>
      `- अगर आपका गंतव्य ऊपर की तालिका में नहीं है, तो आम तौर पर आप ${o.name} (${o.iata}) या किसी बड़े हवाई अड्डे से जाएंगे।`,
    tipSearch:
      '- विकल्पों की तुलना के लिए पेज के ऊपर खोज बॉक्स का उपयोग करें: शहर का नाम या IATA कोड लिखें।',
    tipPeak:
      '- व्यस्त मौसम में छोटे मैदानों पर भी पार्किंग और किराए की कारें कम पड़ती हैं — अगर आप खुद चलाएंगे तो पहले से बुक करें।',
  },

  bn: {
    marker:
      'এই পৃষ্ঠাটি ব্যাখ্যা করে ডেটাবেস, মানচিত্র ও রুট ডেটাসেট এই বিমানবন্দর সম্পর্কে কী বলে।',
    title: (name) => `${name}: বিমানবন্দর গাইড`,
    summary: (o) =>
      `${o.name} (${o.iata}) ${o.city}, ${o.country}-কে ${o.kind} হিসেবে সেবা দেয়। মানচিত্র, সরাসরি গন্তব্য, কাছাকাছি বিমানবন্দর এবং এয়ারলাইনের সঙ্গে যা নিশ্চিত করতে হবে।`,
    intro: (o) =>
      `${o.name} (IATA **${o.iata}**${o.icao ? `, ICAO ${o.icao}` : ''}) ${o.city}, ${o.country}${o.region ? ` (${o.region})` : ''}-কে ${o.kind} হিসেবে সেবা দেয়। ${o.marker}`,
    factsTitle: 'এক নজরে',
    facts: {
      iata: 'IATA / ICAO', class: 'বিমানবন্দর শ্রেণি', location: 'অবস্থান', coords: 'স্থানাঙ্ক',
      pax: 'বার্ষিক যাত্রী', distance: 'নগরকেন্দ্র পর্যন্ত',
      destinations: 'সরাসরি গন্তব্য', seeBelow: 'নিচে দেখুন',
    },
    mapTitle: 'বিমানবন্দর মানচিত্র',
    mapText:
      'এই পৃষ্ঠার মানচিত্র OpenStreetMap ডেটা থেকে আঁকা: টার্মিনাল পলিগন থাকা বিমানবন্দর টার্মিনাল ভবন, অ্যাপ্রন ও প্রবেশপথ দেখায়, ছোট মাঠ এয়ারোড্রোমের রূপরেখা ও রানওয়ে দেখায়। পার্কিং, বাস, খাবার, হোটেল ও গাড়ি ভাড়ার আইকন OSM-এ মানচিত্রিত অনুযায়ী।',
    mapBullets: [
      '**পূর্ণ আকার** — এই পৃষ্ঠার মানচিত্র কার্ড খুলে জুম করুন; 2000 px মূল ডাউনলোড করা যায়।',
      '**অবস্থান মানচিত্র** — ইন্টারঅ্যাকটিভ মানচিত্র টেনে ও জুম করে শহর ও সড়ক নেটওয়ার্কের সাপেক্ষে মাঠ দেখুন।',
      '**পরিকল্পনা** — পৃষ্ঠাটি বিমানবন্দরের মাপ বোঝাতে অনুপাতভিত্তিক পরিকল্পনাও আঁকে; এটি প্রকৃত বিন্যাস নয়।',
    ],
    routesTitle: 'সরাসরি গন্তব্য',
    routesIntro:
      'সরাসরি গন্তব্য, নিকটতম আগে (OpenFlights রুট ডেটাসেট, 2014-এ সংকলিত — নির্দেশক, এয়ারলাইনে নিশ্চিত করুন):',
    routesHead: ['গন্তব্য', 'দূরত্ব', 'প্রধান এয়ারলাইন'],
    routesClosing: (o) =>
      `${o.count} সরাসরি গন্তব্যের পূর্ণ তালিকা [${o.name} রুট মানচিত্র](/${o.locale}/route/${o.iata})-এ আছে।`,
    noRoutes:
      'রুট ডেটাসেটে এই বিমানবন্দরের জন্য সরাসরি সেবা নেই। আঞ্চলিক সময়সূচি প্রায়ই বদলায় — বুকিংয়ের আগে এয়ারলাইন বা বিমানবন্দরে নিশ্চিত করুন।',
    nearbyTitle: 'কাছাকাছি বিমানবন্দর',
    nearbyIntro: 'কিছুই উপযুক্ত না হলে এই কাছাকাছি মাঠগুলো তুলনা করুন:',
    nearbyHead: ['বিমানবন্দর', 'দূরত্ব'],
    gettingTitle: 'কীভাবে পৌঁছাবেন',
    gettingLead: 'বিমানবন্দর:',
    mapLink: 'Google Maps',
    gettingNote:
      'এই পৃষ্ঠার অবস্থান মানচিত্র শহর ও সড়ক নেটওয়ার্কের সাপেক্ষে মাঠ দেখায়, এবং ভূমি পরিবহন অংশে নিবন্ধিত গণপরিবহন তালিকাভুক্ত। রুট, সময়সূচি ও পার্কিংয়ের জন্য বিমানবন্দরের নিজস্ব তথ্যের উপর নির্ভর করুন।',
    sizeTitle: 'আকার ও সুবিধা',
    kindParagraph: {
      large:
        'বড় বিমানবন্দরে একাধিক রানওয়ে ও টার্মিনাল থাকে এবং বছরে লাখ লাখ যাত্রী চলাচল করে। চেক-ইন ও নিরাপত্তায় অপেক্ষার সময় দিনের সময় অনুযায়ী ব্যাপকভাবে বদলায়; আন্তর্জাতিক ফ্লাইটের জন্য প্রস্থানের 2–3 ঘণ্টা আগে পৌঁছান।',
      medium:
        'মাঝারি বিমানবন্দর আঞ্চলিক হাব: একটি ছোট টার্মিনাল, কম হাঁটার দূরত্ব এবং বড় হাবের চেয়ে সাধারণত দ্রুত চেক-ইন — কিন্তু কম ফ্লাইট, তাই ফ্লাইট মিস হলে পুনরায় বুক করা কঠিন। প্রস্থানের 90–120 মিনিট আগে পৌঁছানোর লক্ষ্য রাখুন।',
      small:
        'ছোট মাঠে ন্যূনতম সুবিধা, সাধারণত একতলা একটি টার্মিনাল যার চেক-ইন কাউন্টার ফ্লাইটের কিছুক্ষণ আগে খোলে। ভূমি পরিবহন বিরল; নিজের গাড়ি বা আগে থেকে বুক করা ট্রান্সফার নিরাপদ।',
      heliport:
        'হেলিপোর্ট শুধু হেলিকপ্টার ফ্লাইট সেবা দেয় — স্বাভাবিক টার্মিনাল প্রবাহ নেই। আসন সংখ্যা ও রুট ছোট; অপারেটরের বলা সময়ে পৌঁছান।',
    },
    sizeClosing:
      'টার্মিনাল পরিকল্পনা, চেক-ইন অবস্থান ও ভূমি পরিবহনের সময়সূচি বিমানবন্দর নিজেই প্রকাশ করে; ভ্রমণের দিনে সঠিক হতে হবে এমন তথ্যের জন্য তার নির্দেশনা দেখুন। এখানে কিছু ভুল মনে হলে যোগাযোগ পৃষ্ঠা দিয়ে জানান, আমরা যাচাই করব।',
    tipsTitle: 'টিপস',
    tipConnection: (o) =>
      `- আপনার গন্তব্য উপরের তালিকায় না থাকলে সাধারণত ${o.name} (${o.iata}) বা বড় বিমানবন্দর দিয়ে যাবেন।`,
    tipSearch:
      '- বিকল্প তুলনার জন্য পৃষ্ঠার উপরের অনুসন্ধান বাক্স ব্যবহার করুন: শহরের নাম বা IATA কোড লিখুন।',
    tipPeak:
      '- পিক সিজনে ছোট মাঠেও পার্কিং ও ভাড়া গাড়ি কম থাকে — নিজে চালালে আগে থেকে বুক করুন।',
  },

  sw: {
    marker:
      'Ukurasa huu unaeleza kile hifadhidata, ramani na seti ya data ya njia husema kuhusu uwanja huu wa ndege.',
    title: (name) => `${name}: mwongozo wa uwanja wa ndege`,
    summary: (o) =>
      `${o.name} (${o.iata}) huhudumia ${o.city}, ${o.country} kama ${o.kind}. Ramani, marudio ya moja kwa moja, viwanja vya karibu na mambo ambayo bado yanahitaji kuthibitishwa na shirika la ndege.`,
    intro: (o) =>
      `${o.name} (IATA **${o.iata}**${o.icao ? `, ICAO ${o.icao}` : ''}) huhudumia ${o.city}, ${o.country}${o.region ? ` (${o.region})` : ''} kama ${o.kind}. ${o.marker}`,
    factsTitle: 'Kwa muhtasari',
    facts: {
      iata: 'IATA / ICAO', class: 'Aina ya uwanja', location: 'Mahali', coords: 'Kuratibu',
      pax: 'Abiria kwa mwaka', distance: 'Hadi katikati ya mji',
      destinations: 'Marudio ya moja kwa moja', seeBelow: 'tazama chini',
    },
    mapTitle: 'Ramani ya uwanja wa ndege',
    mapText:
      'Ramani ya ukurasa huu huchorwa kutoka data ya OpenStreetMap: viwanja vyenye poligoni za terminali huonyesha majengo ya terminali, viwanja vya ndege na barabara za kuingia, na viwanja vidogo huonyesha mzunguko wa uwanja na njia ya kuruka. Alama za maegesho, mabasi, chakula, hoteli na kukodisha magari hufuata yaliyowekwa kwenye OSM.',
    mapBullets: [
      '**Mwonekano kamili** — fungua kadi ya ramani kwenye ukurasa huu kukuza; asili ya 2000 px inaweza kupakuliwa.',
      '**Ramani ya mahali** — ramani inayoshirikiana inaweza kuvutwa na kukuzwa ili kuona uwanja kuhusiana na mji na mtandao wa barabara.',
      '**Mchoro** — ukurasa pia huchora mchoro wa uwiano kuonyesha ukubwa wa uwanja; si mpangilio halisi.',
    ],
    routesTitle: 'Marudio ya moja kwa moja',
    routesIntro:
      'Marudio ya moja kwa moja, yaliyo karibu kwanza (seti ya data ya njia ya OpenFlights, iliyoundwa 2014 — ni mwongozo, thibitisha na shirika la ndege):',
    routesHead: ['Marudio', 'Umbali', 'Shirika kuu za ndege'],
    routesClosing: (o) =>
      `Orodha kamili ya marudio ${o.count} ya moja kwa moja iko kwenye [ramani ya njia za ${o.name}](/${o.locale}/route/${o.iata}).`,
    noRoutes:
      'Seti ya data ya njia haina huduma za moja kwa moja kwa uwanja huu. Ratiba za kanda hubadilika mara kwa mara — thibitisha na shirika la ndege au uwanja kabla ya kuhifadhi.',
    nearbyTitle: 'Viwanja vya ndege vya karibu',
    nearbyIntro: 'Ikiwa hakuna kinachofaa, inafaa kulinganisha viwanja hivi vya karibu:',
    nearbyHead: ['Uwanja wa ndege', 'Umbali'],
    gettingTitle: 'Jinsi ya kufika',
    gettingLead: 'Uwanja wa ndege:',
    mapLink: 'Google Maps',
    gettingNote:
      'Ramani ya mahali kwenye ukurasa huu inaonyesha uwanja kuhusiana na mji na mtandao wa barabara, na sehemu ya usafiri wa ardhini inaorodhesha usafiri wa umma uliorekodiwa. Kwa njia, ratiba na maegesho, tegemea taarifa za uwanja wenyewe.',
    sizeTitle: 'Ukubwa na huduma',
    kindParagraph: {
      large:
        'Viwanja vikubwa vina njia nyingi za kuruka na terminali nyingi na huhudumia mamilioni ya abiria kwa mwaka. Muda wa kusubiri kwenye check-in na usalama hutofautiana sana kwa saa; kwa safari za kimataifa, fika saa 2–3 kabla ya kuondoka.',
      medium:
        'Viwanja vya ukubwa wa kati ni vituo vya kanda: terminali moja ndogo, umbali mfupi wa kutembea na kawaida check-in ya haraka zaidi kuliko kituo kikubwa — lakini safari chache, hivyo kuhifadhi upya baada ya kukosa ndege ni vigumu zaidi. Lenga dakika 90–120 kabla ya kuondoka.',
      small:
        'Viwanja vidogo vina huduma chache, kawaida terminali ya ghorofa moja ambayo kaunta za check-in hufunguliwa muda mfupi kabla ya ndege. Usafiri wa ardhini ni haba; gari lako au usafiri uliobookingiwa mapema ni salama zaidi.',
      heliport:
        'Heliporti huhudumia safari za helikopta pekee — hakuna mtiririko wa kawaida wa terminali. Idadi ya viti na njia ni fupi; fika kwa muda unaotajwa na mwendeshaji.',
    },
    sizeClosing:
      'Mipango ya terminali, maeneo ya check-in na ratiba za usafiri wa ardhini huchapishwa na uwanja wenyewe; kwa maelezo ambayo lazima yakuwe sahihi siku ya safari, tegemea taarifa za uwanja. Ikiwa kitu hapa kinaonekana si sahihi, tujulishe kupitia ukurasa wa mawasiliano na tutakagua.',
    tipsTitle: 'Vidokezo',
    tipConnection: (o) =>
      `- Ikiwa marudio yako hayako kwenye jedwali hapo juu, kawaida unasafiri kupitia ${o.name} (${o.iata}) au uwanja mkubwa zaidi.`,
    tipSearch:
      '- Tumia kisanduku cha utafutaji juu ya ukurasa kulinganisha chaguo: andika jina la mji au msimbo wa IATA.',
    tipPeak:
      '- Katika msimu wa shughuli nyingi, maegesho na magari ya kukodi huhitajika pia kwenye viwanja vidogo — bookingi mapema ikiwa utaendesha.',
  },
};
