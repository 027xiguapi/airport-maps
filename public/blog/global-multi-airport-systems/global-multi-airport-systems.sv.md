---
slug: global-multi-airport-systems
title: "Nästan 60 multiflygplatssystem: varför ett storstadsområde bygger en andra och tredje flygplats"
summary: "En studie baserad på global flygplatsdata från 2018 identifierade 59 multiflygplatssystem, varav 93,2 % bestod av två eller tre flygplatser, med mönstret ”en primär, en sekundär” som det vanligaste. Den här förklaringen redogör för de tre villkoren, 70-kilometersgränsen och den tvåstegssökning som ligger bakom resultatet, och vad det betyder för kinesiska städer."
date: 2026-10-19
updated: 2026-10-19
tags: multi-flygplatsystem, flygplatskluster, storstadsområden, flygplatshubbar, flygplatsplanering
cover: images/0.webp
---

![Den globala fördelningen av multiflygplatssystem 2018; punktstorlek och färg anger passagerar- och fraktvolymer](./images/0.webp)

London har Heathrow, Gatwick, Stansted, Luton, London City och Southend. New York har JFK, Newark, LaGuardia och Westchester County; Tokyo har Haneda och Narita; Chicago har O'Hare och Midway; Shanghai har Pudong och Hongqiao. De konkurrerar och täcker upp för varandra och bildar tillsammans ett storstadsområdes flygport.

I en artikel i den kinesiska tidskriften Scientia Geographica Sinica 2023 använde forskare vid China Academy of Civil Aviation Science and Technology flygplats- och stadsdata från 2018 för att räkna sådana kluster: 59 multiflygplatssystem, 142 civila flygplatser, varav 89 stora. Artikeln erbjuder också två återanvändbara verktyg – en tvåstegssökning och en gräns på 70 km för avståndet mellan flygplats och storstadsområde – som gör det möjligt att beräkna på en karta vilka flygplatser som tillhör ett och samma system.

## Vad som räknas som ett multiflygplatssystem

Termen är multiflygplatssystem (Multiple/Multi-Airport System, MAS): inom ett storstadsområde, två eller fler stora flygplatser plus andra flygplatser. Tre villkor måste gälla samtidigt.

För det första: minst två stora flygplatser, och som regel minst en primär. För det andra: endast kommersiell trafik, så allmänflyg- och militärflygfält räknas inte. För det tredje: samma storstadsområde.

Ägandet ingår inte i definitionen. Ett gemensamt upptagningsområde betyder mer än en gemensam ägare: Heathrow, Gatwick och Stansted tillhör olika företag och betjänar samma London.

Det tredje villkoret är det svåra. Storstadsgränser skiljer sig mellan länder, och administrativa gränser missar kombinationer över stads-, provins- och till och med landsgränser – Shenzhen, Hongkong och Macau är det uppenbara exemplet. Därav avståndsgränsen och sökalgoritmen.

## Tvåstegssökning: hitta storstadsområdet, sedan flygplatserna

Metoden är tvåstegssökning (Two-Step Search, TSS). Den parar ihop storstadsområden och flygplatser utifrån data och avstånd i stället för att fråga vilken stad en flygplats tillhör.

Steg ett letar efter storstadsområden. Med utgångspunkt i primära flygplatser över en trafiktröskel söker den efter närliggande städer eller storstadsområden över en befolkningströskel, slår samman dubbletter till ett urval och begränsar radien till 70 km så att orelaterade avlägsna städer inte dras in.

Steg två letar efter flygplatser. Runt varje storstadsområde i urvalet dras en radie som motsvarar tjänsteavståndet mellan flygplats och storstadsområde, och inom den söks kommersiella flygplatser över en trafiktröskel. Två eller fler kvalificerade flygplatser bildar ett multiflygplatssystem. Artikeln noterar att algoritmen inte behöver någon separat trafiktröskel för den primära flygplatsen.

Sjuttio kilometer är den centrala parametern: tillräckligt stort för att nå grannstäder som redan slagits samman med kärnan, tillräckligt litet för att inte svetsa ihop två storstadsområden. För en resenär är det ungefär en timme på väg – en operativ tröskel som balanserar konsekvent data och realistisk pendling, inte en exakt fysisk gräns.

![Det andra steget i tvåstegssökningen: flygplatser hittas inom tjänsteavståndet från ett storstadsområde](./images/1.webp)

Metoden behöver bara urban befolkning och flygplatstrafik, inte administrativa kartor eller gemensamt ägande. Den är känslig för tröskelvärden, så de 59 systemen är en jämförbar baskarta, inte en fast rangordning.

## Den globala bilden: 59 system, mestadels en huvudflygplats plus en sekundär

De 59 systemen 2018 ligger mestadels på norra halvklotet; söderut finns bara Brasilien (2), Argentina (1) och Indonesien (1). Europa står för 21, Nordamerika 16, Asien-Stillahavsområdet 15, Mellanöstern 4 och Latinamerika 3. Per land: USA 13, Kina 5, Storbritannien 4, Japan 4; Italien och Kanada 3 var; Spanien, Brasilien, Tyskland och Sydkorea 2 var.

Ett system har i genomsnitt 2,41 flygplatser, och 93,2 % har två eller tre. Artikeln skiljer mellan komplementära och balanserade modeller och sedan mellan formerna ”en primär, en sekundär”, ”två kärnor” och ”tre kärnor”. En primär och en sekundär är vanligast med 30 system, därefter två kärnor med 11. De flesta system är alltså en hubb med ett stödjande fält: den primära bär långdistansrutter och anslutningar, den sekundära tar inrikesflyg, charter, lågkostnadstrafik eller frakt.

## Varför dessa system spelar roll: kapacitet, konkurrens, specialisering

Volym först. 2018 utgjorde dessa 59 system 5,6 % av världens flygplatser men hanterade 3,37 miljarder passagerare och 60 miljoner ton frakt – 38,3 % respektive 49,6 % av de globala totalerna. Topp tio överstiger mestadels 100 miljoner passagerare och 2 miljoner ton frakt.

| Storstadsområde | Huvudflygplatser | Passagerare (10 000) | Frakt (10 000 t) |
| --- | --- | --- | --- |
| London | Heathrow (LHR), Gatwick (LGW), London City (LCY), Luton (LTN), Southend (SEN), Stansted (STN) | 17 760 | 216 |
| Shenzhen–Hongkong–Macau | Hong Kong (HKG), Macau (MFM), Shenzhen Bao'an (SZX) | 13 155 | 638 |
| Tokyo | Haneda (HND), Narita (NRT) | 12 949 | 364 |
| New York | JFK, Newark (EWR), LaGuardia (LGA), Westchester County (HPN) | 13 909 | 223 |
| Shanghai | Pudong (PVG), Hongqiao (SHA) | 11 763 | 418 |
| Dubai | Dubai International (DXB), Dubai World Central (DWC), Sharjah (SHJ) | 10 210 | 372 |
| Paris | Charles de Gaulle (CDG), Orly (ORY), Beauvais (BVA) | 10 914 | 225 |
| Los Angeles | LAX, Burbank (BUR), Long Beach (LGB) | 10 735 | 230 |
| Beijing | Capital (PEK), Nanyang (NAY) | 10 750 | 210 |
| Seoul | Incheon (ICN), Gimpo (GMP) | 9 295 | 308 |

Siffrorna avser 2018 och följer artikelns tabellordning. Shenzhen–Hongkong–Macau leder på frakt med 6,38 miljoner ton, Shanghai följer med 4,18 miljoner; de två rankas etta och tvåa i världen.

Kapaciteten kommer först. Efterfrågan i ett stort storstadsområde växer vanligtvis förbi vad en enda anläggning kan lägga till; mark, buller, luftrum och marktransporter är hårda gränser. Heaths slottar har varit trånga i decennier och dess tredje rullbana har debatterats lika länge utan att byggas, så tillväxten ransoneras genom tilldelning; en andra eller tredje flygplats är den praktiska vägen. Konkurrensen kommer sedan: en extra flygplats ger flygbolagen ytterligare en bas och ett förhandlingsalternativ och passagerarna en alternativ väg, även om alltför stor splittring tunnar ut anslutningstrafiken. Specialiseringen kommer sist. Heathrow är fullservicehubben för långdistans, Stansted och Luton är lågkostnadsbaser, London City hanterar kortdistansaffärsresor; Haneda lutar mot inrikes och närliggande destinationer, Narita mot långdistans. Rollerna växte fram; en plan kan inte bara kopiera dem.

## Vad det betyder för kinesiska städer

Artikeln lägger till en bedömning: Kina är den framväxande regionen. 2018 fanns fem system, med Shenzhen–Hongkong–Macau, Shanghai och Beijing i främsta ledet. Fem är inte många för ett land av Kinas urbana skala, men det pekar på en trend: när befolknings- och industritätheten är tillräckligt hög kommer en flygplats kapacitetstak före efterfrågetaket.

Datan tar slut 2018. Beijing Daxing öppnade 2019 och Nanyang stängde samma år, vilket förvandlade Beijing från ”Capital plus Nanyang” till ”Capital plus Daxing”; Chengdu Tianfu öppnade 2021; Guangzhous nya flygplats har gått in i planeringsfasen. Räknar man om skulle antalet förmodligen stiga. De 59 är en skiva, inte slutet.

Mer användbart än antalet är det test som artikeln antyder: en ny flygplats tillhör systemet inte genom administrativt område utan genom huruvida den ligger inom storstadsområdets effektiva tjänsteavstånd och kan fördela roller med den befintliga hubben. För resenärer ligger en andra flygplats värde i pålitliga marktransporter och rutter som fyller den primäras luckor. För planerare spelar ordningen större roll än storleken: definiera funktionen före kapaciteten, koppla marktransporterna före nätverket, bygg samverkan mellan städer innan man bråkar om vem som sköter internationellt, inrikes och frakt.

Ett multiflygplatssystem är aldrig en tävling i siffror. Det prövar om ett storstadsområde kan fördela begränsat luftrum, mark och slottar till de rutter det hanterar bäst. Tvåstegssökningen och 70-kilometersgränsen hjälper till att identifiera den kapaciteten; om det fungerar beror fortfarande på att städerna sätter sig ner och enas om arbetsfördelningen.

## Relaterade länkar

- **På den här webbplatsen**: [Heathrow (LHR)](/airport/LHR), [JFK](/airport/JFK), [Haneda (HND)](/airport/HND), [Paris Charles de Gaulle (CDG)](/airport/CDG), [O'Hare (ORD)](/airport/ORD), [Shanghai Pudong (PVG)](/airport/PVG), [Guangzhou Baiyun (CAN)](/airport/CAN), [Storbritannien (GB)](/country/GB), [USA (US)](/country/US), [Japan (JP)](/country/JP)
- **Wikipedia**: [Flygplats](https://en.wikipedia.org/wiki/Airport), [Storstadsområde](https://en.wikipedia.org/wiki/Metropolitan_area)
- **Baidu Baike**: [Flygplatskluster (机场群)](https://baike.baidu.com/item/%E6%9C%BA%E5%9C%BA%E7%BE%A4)

Bildkälla: artikelns författare och International Air Transport. Passagerar- och fraktsiffrorna är den ACI-flygplatsdata för 2018 som artikeln citerar; definitioner och år följer originalet. Kontrollera flygplatsernas och flygbolagens egna webbplatser före resan.
