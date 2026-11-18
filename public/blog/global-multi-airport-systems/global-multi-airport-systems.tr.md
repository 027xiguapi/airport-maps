---
slug: global-multi-airport-systems
title: "Neredeyse 60 Çok Havalimanlı Sistem: Bir Metropol Alanı Neden İkinci ve Üçüncü Havalimanı İnşa Eder"
summary: "2018 küresel havalimanı verilerine dayanan bir çalışma 59 çok havalimanlı sistem belirledi; bunların %93,2'si iki veya üç havalimanından oluşuyor ve “bir ana, bir ikincil” düzeni en yaygın olanı. Bu açıklayıcı yazı, bulgunun arkasındaki üç koşulu, 70 km eşiğini ve iki aşamalı aramayı ile bunun Çin şehirleri için ne anlama geldiğini ortaya koyuyor."
date: 2026-10-19
updated: 2026-10-19
tags: çok havalimanlı sistemler, havalimanı kümeleri, metropol alanları, havacılık merkezleri, havalimanı planlaması
cover: images/0.webp
---

![2018'de çok havalimanlı sistemlerin küresel dağılımı; nokta boyutu ve rengi yolcu ile kargo hacimlerini kodluyor](./images/0.webp)

Londra'da Heathrow, Gatwick, Stansted, Luton, London City ve Southend var. New York'ta JFK, Newark, LaGuardia ve Westchester County; Tokyo'da Haneda ve Narita; Chicago'da O'Hare ve Midway; Şanghay'da Pudong ve Hongqiao. Birbirleriyle yarışıyor ve birbirlerinin açığını kapatıyorlar; birlikte tek bir metropol alanın hava kapısını oluşturuyorlar.

Çin dergisi Scientia Geographica Sinica'da 2023'te yayımlanan bir makalede, Çin Sivil Havacılık Bilim ve Teknoloji Akademisi'ndeki araştırmacılar 2018 havalimanı ve şehir verilerini kullanarak bu tür kümeleri saydı: 59 çok havalimanlı sistem, 142 sivil havalimanı, bunların 89'u büyük. Makale ayrıca iki yeniden kullanılabilir araç sunuyor — iki aşamalı bir arama ve 70 km'lik havalimanı-metropol mesafe eşiği — böylece “hangi havalimanları aynı sisteme ait” sorusu harita üzerinde hesaplanabilir hale geliyor.

## Çok havalimanlı sistem nedir

Terim, Multiple/Multi-Airport System ya da MAS: tek bir metropol alanı içinde iki veya daha fazla büyük havalimanı ile diğer havalimanları. Üç koşul birlikte sağlanmalı.

Birincisi, en az iki büyük havalimanı ve kural olarak en az bir ana havalimanı. İkincisi, yalnızca ticari hizmet; yani genel havacılık ve askeri alanlar sayılmaz. Üçüncüsü, aynı metropol alanı.

Yönetim tanımın parçası değil. Ortak bir sahip olmasından çok ortak bir hinterland önemli: Heathrow, Gatwick ve Stansted farklı şirketlere ait ve aynı Londra'ya hizmet ediyor.

Üçüncü koşul zor olanı. Metropol sınırları ülkeden ülkeye değişiyor ve idari çizgiler şehirler arası, eyaletler arası, hatta sınır ötesi birleşimleri kaçırıyor — Shenzhen, Hong Kong ve Makao bariz örnek. Bu yüzden mesafe eşiği ve arama algoritması var.

## İki aşamalı arama: önce metropol alanı, sonra havalimanları

Yöntem İki Aşamalı Arama (Two-Step Search, TSS). Bir havalimanının hangi şehre ait olduğunu sormak yerine metropol alanlarını ve havalimanlarını veri ve mesafeyle eşleştiriyor.

Birinci aşama metropol alanlarını arıyor. Trafik eşiğinin üzerindeki ana havalimanlarından başlayarak yakındaki, nüfus eşiğinin üzerindeki şehirleri veya metropol alanlarını arıyor, kopyaları bir örneklemde birleştiriyor ve ilgisiz uzak şehirlerin içeri sürüklenmemesi için yarıçapı 70 km ile sınırlıyor.

İkinci aşama havalimanlarını arıyor. Her örnek metropol alanının çevresine havalimanı-metropol hizmet mesafesine eşit bir yarıçap çiziyor ve trafik eşiğinin üzerindeki ticari havalimanlarını arıyor. İki veya daha fazla nitelikli havalimanı bir çok havalimanlı sistem oluşturuyor. Makale, algoritmanın ana havalimanı için ayrı bir trafik eşiğine ihtiyaç duymadığını belirtiyor.

Yetmiş kilometre merkezi parametre: komşu şehirlere ulaşacak kadar büyük, iki metropol alanını birbirine kaynatmayacak kadar küçük. Bir yolcu için bu kabaca karayoluyla bir saat — kesin bir fiziksel sınır değil, tutarlı veri ile gerçekçi günlük ulaşımı dengeleyen operasyonel bir eşik.

![İki aşamalı aramanın ikinci aşaması: havalimanları bir metropol alanın hizmet mesafesi içinde bulunuyor](./images/1.webp)

Yöntem yalnızca kentsel nüfus ve havalimanı trafiğine ihtiyaç duyuyor; idari haritalara veya ortak mülkiyete değil. Eşiklere duyarlı, bu yüzden 59 sistem karşılaştırılabilir bir temel harita, sabit bir lig tablosu değil.

## Küresel tablo: 59 sistem, çoğunlukla bir ana artı bir ikincil

2018'in 59 sistemi çoğunlukla kuzey yarım kürede; güneyde yalnızca Brezilya (2), Arjantin (1) ve Endonezya (1) var. Avrupa 21, Kuzey Amerika 16, Asya-Pasifik 15, Orta Doğu 4 ve Latin Amerika 3 sistem barındırıyor. Ülkeye göre: Amerika Birleşik Devletleri 13, Çin 5, Birleşik Krallık 4, Japonya 4; İtalya ve Kanada 3'er; İspanya, Brezilya, Almanya ve Güney Kore 2'şer.

Bir sistem ortalama 2,41 havalimanına sahip ve %93,2'si iki veya üçten oluşuyor. Makale tamamlayıcı ve dengeli modelleri, ardından “bir ana, bir ikincil”, “ikiz çekirdek” ve “üç çekirdek” biçimlerini ayırıyor. Bir ana bir ikincil 30 sistemle en yaygın, ikiz çekirdek 11 ile onu izliyor. Dolayısıyla çoğu sistem bir merkez ve onu destekleyen bir alan: ana havalimanı uzun mesafe uluslararası hatları ve aktarmaları taşıyor, ikincil havalimanı iç hatları, charter uçuşları, düşük maliyetli trafiği veya kargoyu emiyor.

## Bu sistemler neden önemli: kapasite, rekabet, uzmanlaşma

Önce ağırlık. 2018'de bu 59 sistem dünyadaki havalimanlarının %5,6'sıydı ama 3,37 milyar yolcu ve 60 milyon ton kargo işledi — küresel toplamların %38,3'ü ve %49,6'sı. İlk on çoğunlukla 100 milyon yolcu ve 2 milyon ton kargoyu aşıyor.

| Metropol alanı | Ana havalimanları | Yolcu (10.000) | Kargo (10.000 t) |
| --- | --- | --- | --- |
| Londra | Heathrow (LHR), Gatwick (LGW), London City (LCY), Luton (LTN), Southend (SEN), Stansted (STN) | 17.760 | 216 |
| Shenzhen–Hong Kong–Makao | Hong Kong (HKG), Makao (MFM), Shenzhen Bao'an (SZX) | 13.155 | 638 |
| Tokyo | Haneda (HND), Narita (NRT) | 12.949 | 364 |
| New York | JFK, Newark (EWR), LaGuardia (LGA), Westchester County (HPN) | 13.909 | 223 |
| Şanghay | Pudong (PVG), Hongqiao (SHA) | 11.763 | 418 |
| Dubai | Dubai Uluslararası (DXB), Dubai World Central (DWC), Sharjah (SHJ) | 10.210 | 372 |
| Paris | Charles de Gaulle (CDG), Orly (ORY), Beauvais (BVA) | 10.914 | 225 |
| Los Angeles | LAX, Burbank (BUR), Long Beach (LGB) | 10.735 | 230 |
| Pekin | Capital (PEK), Nanyang (NAY) | 10.750 | 210 |
| Seul | Incheon (ICN), Gimpo (GMP) | 9.295 | 308 |

Rakamlar 2018'e ait ve makalenin tablo sırasını izliyor. Shenzhen–Hong Kong–Makao 6,38 milyon tonla kargoda lider, Şanghay 4,18 milyon tonla onu izliyor; ikisi dünya çapında birinci ve ikinci.

Önce kapasite geliyor. Büyük bir metropol alandaki talep genellikle tek bir sahanın ekleyebileceğinin ötesine geçer; arazi, gürültü, hava sahası ve yüzey erişimi sert sınırlardır. Heathrow'un slotları onlarca yıldır sıkı ve üçüncü pisti de aynı süre boyunca tartışıldı ama inşa edilmedi, bu yüzden büyüme tahsisle karneye bağlanıyor; ikinci veya üçüncü havalimanı pratik yol. İkinci olarak rekabet geliyor: ek havalimanı havayollarına başka bir üs ve pazarlık seçeneği, yolculara alternatif bir güzergâh verir, ancak aşırı parçalanma aktarma trafiğini inceltir. Üçüncü olarak uzmanlaşma geliyor. Heathrow uzun mesafe tam hizmet merkezi, Stansted ve Luton düşük maliyetli üsler, London City kısa mesafe iş uçuşlarını işliyor; Haneda iç hatlara ve yakın çevreye, Narita uzun mesafeye yatıyor. Bu roller zamanla evrildi; bir plan onları öylece kopyalayamaz.

## Çin şehirleri için ne anlama geliyor

Makale bir yargı ekliyor: Çin yükselen bölge. 2018'de beş sistemi vardı; Shenzhen–Hong Kong–Makao, Şanghay ve Pekin ön sırada. Çin'in kentsel ölçeğindeki bir ülke için beş çok değil, ama bir eğilime işaret ediyor: nüfus ve sanayi yoğunluğu yeterince yükseldiğinde, bir havalimanının kapasite tavanı talep tavanından önce gelir.

Veriler 2018'de duruyor. Pekin Daxing 2019'da açıldı ve Nanyang aynı yıl kapandı; Pekin “Capital artı Nanyang”dan “Capital artı Daxing”e dönüştü; Chengdu Tianfu 2021'de açıldı; Guangzhou'nun yeni havalimanı planlamaya girdi. Yeniden hesaplayın, sayı muhtemelen artar. 59 bir dilim, son değil.

Sayıdan daha faydalı olan, makalenin ima ettiği test: yeni bir havalimanı sisteme idari alanla değil, metropol alanın etkin hizmet aralığı içinde olup olmadığı ve mevcut merkezle rolleri bölüşüp bölemeyeceğiyle ait olur. Yolcular için ikinci bir havalimanın değeri güvenilir yüzey ulaşımında ve ana havalimanın boşluklarını dolduran hatlarda yatıyor. Planlamacılar için sıra boyuttan önemli: kapasiteden önce işlevi tanımlayın, ağdan önce kara ulaşımını bağlayın, kimin uluslararası, iç hat ve kargo yapacağını tartışmadan önce şehirler arası koordinasyonu kurun.

Çok havalimanlı bir sistem asla sayılarda bir yarış değil. Bir metropol alanın sınırlı hava sahasını, arazisini ve slotlarını en iyi işlediği hatlara ayırıp ayıramadığını test eder. İki aşamalı arama ve 70 km eşiği bu kapasiteyi tanımaya yardımcı oluyor; işleyip işlemeyeceği hâlâ şehirlerin oturup iş bölümü konusunda anlaşmasına bağlı.

## İlgili bağlantılar

- **Bu sitede**: [Heathrow (LHR)](/airport/LHR), [JFK](/airport/JFK), [Haneda (HND)](/airport/HND), [Paris Charles de Gaulle (CDG)](/airport/CDG), [O'Hare (ORD)](/airport/ORD), [Şanghay Pudong (PVG)](/airport/PVG), [Guangzhou Baiyun (CAN)](/airport/CAN), [Birleşik Krallık (GB)](/country/GB), [Amerika Birleşik Devletleri (US)](/country/US), [Japonya (JP)](/country/JP)
- **Wikipedia**: [Airport](https://en.wikipedia.org/wiki/Airport), [Metropolitan area](https://en.wikipedia.org/wiki/Metropolitan_area)
- **Baidu Baike**: [Airport cluster (机场群)](https://baike.baidu.com/item/%E6%9C%BA%E5%9C%BA%E7%BE%A4)

Görsel kaynağı: makalenin yazarları ve International Air Transport. Yolcu ve kargo rakamları makalenin atıfta bulunduğu 2018 ACI havalimanı verileridir; tanımlar ve yıllar orijinali izler. Seyahatten önce havalimanlarının ve havayollarının kendi sitelerini kontrol edin.
