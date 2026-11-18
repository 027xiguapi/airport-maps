---
slug: global-multi-airport-systems
title: "Gần 60 hệ thống đa sân bay: vì sao một vùng đô thị xây sân bay thứ hai và thứ ba"
summary: "Một nghiên cứu dựa trên dữ liệu sân bay toàn cầu năm 2018 đã xác định 59 hệ thống đa sân bay, trong đó 93,2% gồm hai hoặc ba sân bay, với mô hình “một chính, một phụ” là phổ biến nhất. Bài giải thích này trình bày ba điều kiện, ngưỡng 70 km và phương pháp tìm kiếm hai bước phía sau kết quả, cùng ý nghĩa đối với các thành phố Trung Quốc."
date: 2026-10-19
updated: 2026-10-19
tags: hệ thống đa sân bay, cụm sân bay, vùng đô thị, trung tâm hàng không, quy hoạch sân bay
cover: images/0.webp
---

![Phân bố toàn cầu của các hệ thống đa sân bay năm 2018; kích thước và màu điểm thể hiện lưu lượng hành khách và hàng hóa](./images/0.webp)

London có Heathrow, Gatwick, Stansted, Luton, London City và Southend. New York có JFK, Newark, LaGuardia và Westchester County; Tokyo có Haneda và Narita; Chicago có O'Hare và Midway; Thượng Hải có Phố Đông và Hồng Kiều. Chúng cạnh tranh và bổ sung cho nhau, cùng tạo thành cửa ngõ hàng không của một vùng đô thị.

Trong một bài báo trên tạp chí Scientia Geographica Sinica của Trung Quốc năm 2023, các nhà nghiên cứu tại Viện Khoa học và Công nghệ Hàng không Dân dụng Trung Quốc đã sử dụng dữ liệu sân bay và thành phố năm 2018 để thống kê các cụm như vậy: 59 hệ thống đa sân bay, 142 sân bay dân dụng, trong đó 89 sân bay lớn. Bài báo cũng đưa ra hai công cụ có thể tái sử dụng — phương pháp tìm kiếm hai bước và ngưỡng khoảng cách 70 km từ sân bay đến vùng đô thị — giúp xác định “những sân bay nào thuộc cùng một hệ thống” trên bản đồ.

## Thế nào là một hệ thống đa sân bay

Thuật ngữ là Multiple/Multi-Airport System, hay MAS: trong một vùng đô thị, có hai hoặc nhiều sân bay lớn cùng các sân bay khác. Ba điều kiện phải đồng thời được đáp ứng.

Thứ nhất, ít nhất hai sân bay lớn, và theo nguyên tắc, ít nhất một sân bay chính. Thứ hai, chỉ tính hoạt động thương mại, nên sân bay hàng không tổng hợp và sân bay quân sự không được tính. Thứ ba, cùng một vùng đô thị.

Cơ cấu quản lý không nằm trong định nghĩa. Vùng phụ cận chung quan trọng hơn chủ sở hữu chung: Heathrow, Gatwick và Stansted thuộc các công ty khác nhau nhưng phục vụ cùng một London.

Điều kiện thứ ba là điều kiện khó. Ranh giới vùng đô thị khác nhau theo quốc gia, và các đường hành chính bỏ sót những tổ hợp liên thành phố, liên tỉnh và thậm chí xuyên biên giới — Thâm Quyến, Hồng Kông và Ma Cao là trường hợp rõ ràng. Vì vậy mới có ngưỡng khoảng cách và thuật toán tìm kiếm.

## Tìm kiếm hai bước: tìm vùng đô thị, rồi tìm sân bay

Phương pháp là Two-Step Search (TSS). Phương pháp này ghép các vùng đô thị và sân bay theo dữ liệu và khoảng cách thay vì hỏi sân bay thuộc thành phố nào.

Bước một tìm các vùng đô thị. Bắt đầu từ các sân bay chính vượt ngưỡng lưu lượng, phương pháp tìm các thành phố hoặc vùng đô thị lân cận vượt ngưỡng dân số, gộp các trường hợp trùng lặp vào một mẫu, và giới hạn bán kính ở 70 km để không kéo vào những thành phố xa không liên quan.

Bước hai tìm sân bay. Quanh mỗi vùng đô thị mẫu, phương pháp vẽ bán kính bằng khoảng cách phục vụ từ sân bay đến vùng đô thị và tìm các sân bay thương mại vượt ngưỡng lưu lượng. Hai hoặc nhiều sân bay đủ điều kiện tạo thành một hệ thống đa sân bay. Bài báo lưu ý thuật toán không cần ngưỡng lưu lượng riêng cho sân bay chính.

Bảy mươi ki-lô-mét là tham số trung tâm: đủ lớn để với tới các thành phố lân cận đã được gộp với vùng lõi, đủ nhỏ để không gắn hai vùng đô thị vào nhau. Với một du khách, đó là khoảng một giờ đi đường — một ngưỡng vận hành cân bằng giữa dữ liệu nhất quán và khả năng đi lại thực tế, không phải một ranh giới vật lý chính xác.

![Bước hai của phương pháp tìm kiếm hai bước: các sân bay được tìm thấy trong khoảng cách phục vụ của một vùng đô thị](./images/1.webp)

Phương pháp chỉ cần dân số đô thị và lưu lượng sân bay, không cần bản đồ hành chính hay chủ sở hữu chung. Phương pháp nhạy cảm với các ngưỡng, nên 59 hệ thống là một bản đồ cơ sở có thể so sánh, không phải một bảng xếp hạng cố định.

## Bức tranh toàn cầu: 59 hệ thống, phần lớn gồm một chính và một phụ

59 hệ thống của năm 2018 chủ yếu nằm ở bán cầu bắc; phía nam chỉ có Brazil (2), Argentina (1) và Indonesia (1). Châu Âu chiếm 21, Bắc Mỹ 16, châu Á – Thái Bình Dương 15, Trung Đông 4 và Mỹ Latinh 3. Theo quốc gia: Hoa Kỳ 13, Trung Quốc 5, Vương quốc Anh 4, Nhật Bản 4; Ý và Canada mỗi nước 3; Tây Ban Nha, Brazil, Đức và Hàn Quốc mỗi nước 2.

Một hệ thống trung bình có 2,41 sân bay, và 93,2% có hai hoặc ba sân bay. Bài báo phân biệt mô hình bổ trợ và mô hình cân bằng, rồi các dạng “một chính, một phụ”, “hai hạt nhân” và “ba hạt nhân”. Một chính một phụ là phổ biến nhất với 30 hệ thống, tiếp theo là hai hạt nhân với 11. Vì vậy phần lớn hệ thống là một trung tâm trung chuyển cùng một sân bay hỗ trợ: sân bay chính đảm nhận các tuyến quốc tế đường dài và nối chuyến, sân bay phụ tiếp nhận các chuyến nội địa, thuê chuyến, hàng không giá rẻ hoặc hàng hóa.

## Vì sao các hệ thống này quan trọng: công suất, cạnh tranh, chuyên môn hóa

Trước hết là quy mô. Năm 2018, 59 hệ thống này chiếm 5,6% số sân bay trên thế giới nhưng xử lý 3,37 tỷ hành khách và 60 triệu tấn hàng hóa — tương ứng 38,3% và 49,6% tổng số toàn cầu. Mười hệ thống đứng đầu phần lớn vượt 100 triệu hành khách và 2 triệu tấn hàng hóa.

| Vùng đô thị | Các sân bay chính | Hành khách (chục nghìn) | Hàng hóa (10.000 tấn) |
| --- | --- | --- | --- |
| London | Heathrow (LHR), Gatwick (LGW), London City (LCY), Luton (LTN), Southend (SEN), Stansted (STN) | 17.760 | 216 |
| Thâm Quyến – Hồng Kông – Ma Cao | Hồng Kông (HKG), Ma Cao (MFM), Thâm Quyến Bảo An (SZX) | 13.155 | 638 |
| Tokyo | Haneda (HND), Narita (NRT) | 12.949 | 364 |
| New York | JFK, Newark (EWR), LaGuardia (LGA), Westchester County (HPN) | 13.909 | 223 |
| Thượng Hải | Phố Đông (PVG), Hồng Kiều (SHA) | 11.763 | 418 |
| Dubai | Sân bay quốc tế Dubai (DXB), Dubai World Central (DWC), Sharjah (SHJ) | 10.210 | 372 |
| Paris | Charles de Gaulle (CDG), Orly (ORY), Beauvais (BVA) | 10.914 | 225 |
| Los Angeles | LAX, Burbank (BUR), Long Beach (LGB) | 10.735 | 230 |
| Bắc Kinh | Capital (PEK), Nanyang (NAY) | 10.750 | 210 |
| Seoul | Incheon (ICN), Gimpo (GMP) | 9.295 | 308 |

Số liệu là của năm 2018 và theo thứ tự bảng trong bài báo. Thâm Quyến – Hồng Kông – Ma Cao dẫn đầu về hàng hóa với 6,38 triệu tấn, Thượng Hải theo sau với 4,18 triệu tấn; hai hệ thống đứng thứ nhất và thứ hai trên toàn thế giới.

Công suất đứng đầu. Nhu cầu ở một vùng đô thị lớn thường vượt quá khả năng bổ sung của một địa điểm; đất đai, tiếng ồn, không phận và giao thông mặt đất là những giới hạn cứng. Các slot tại Heathrow đã khan hiếm trong nhiều thập kỷ và đường băng thứ ba được tranh luận cũng lâu tương tự mà chưa được xây, nên tăng trưởng bị phân bổ bằng cơ chế chia slot; sân bay thứ hai hoặc thứ ba là con đường thực tế. Cạnh tranh đứng thứ hai: thêm một sân bay cho các hãng hàng không thêm một căn cứ và lựa chọn đàm phán, cho hành khách một lộ trình thay thế, dù phân mảnh quá nhiều sẽ làm mỏng lưu lượng nối chuyến. Chuyên môn hóa đứng thứ ba. Heathrow là trung tâm phục vụ đầy đủ cho đường dài, Stansted và Luton là căn cứ giá rẻ, London City phục vụ công tác ngắn, Haneda nghiêng về nội địa và các chuyến bay lân cận, Narita về đường dài. Những vai trò đó tiến hóa dần; một kế hoạch không thể chỉ sao chép chúng.

## Ý nghĩa đối với các thành phố Trung Quốc

Bài báo đưa thêm một nhận định: Trung Quốc là khu vực đang mới nổi. Năm 2018, nước này có năm hệ thống, với Thâm Quyến – Hồng Kông – Ma Cao, Thượng Hải và Bắc Kinh ở hàng đầu. Năm hệ thống không nhiều với một quốc gia có quy mô đô thị như Trung Quốc, nhưng nó cho thấy một xu hướng: khi mật độ dân số và công nghiệp đủ cao, trần công suất của một sân bay sẽ đến trước trần nhu cầu.

Dữ liệu dừng ở năm 2018. Sân bay Bắc Kinh Đại Hưng mở năm 2019 và Nanyang đóng cùng năm, biến Bắc Kinh từ “Capital cộng Nanyang” thành “Capital cộng Đại Hưng”; Sân bay Thành Đô Thiên Phủ mở năm 2021; sân bay mới của Quảng Châu đã bước vào giai đoạn quy hoạch. Tính lại thì con số có lẽ sẽ tăng. 59 chỉ là một lát cắt, không phải điểm kết thúc.

Hữu ích hơn con số là phép thử mà bài báo ngụ ý: một sân bay mới thuộc hệ thống không phải vì địa giới hành chính mà vì nó nằm trong phạm vi phục vụ hiệu quả của vùng đô thị và có thể phân chia vai trò với trung tâm trung chuyển hiện có. Với du khách, giá trị của sân bay thứ hai nằm ở giao thông mặt đất đáng tin cậy và những tuyến bù đắp khoảng trống của sân bay chính. Với nhà quy hoạch, trình tự quan trọng hơn quy mô: xác định chức năng trước công suất, kết nối giao thông mặt đất trước mạng lưới, xây dựng phối hợp liên thành phố trước khi tranh luận ai phụ trách quốc tế, nội địa và hàng hóa.

Một hệ thống đa sân bay không bao giờ là cuộc thi về số lượng. Nó kiểm tra liệu một vùng đô thị có thể phân bổ không phận, đất đai và slot hạn chế cho những tuyến mà vùng đó xử lý tốt nhất hay không. Phương pháp tìm kiếm hai bước và ngưỡng 70 km giúp nhận diện năng lực đó; việc nó có vận hành được hay không vẫn phụ thuộc vào việc các thành phố có ngồi lại để thống nhất phân công lao động hay không.

## Liên kết liên quan

- **Trên trang này**: [Heathrow (LHR)](/airport/LHR), [JFK](/airport/JFK), [Haneda (HND)](/airport/HND), [Paris Charles de Gaulle (CDG)](/airport/CDG), [O'Hare (ORD)](/airport/ORD), [Thượng Hải Phố Đông (PVG)](/airport/PVG), [Quảng Châu Bạch Vân (CAN)](/airport/CAN), [Vương quốc Anh (GB)](/country/GB), [Hoa Kỳ (US)](/country/US), [Nhật Bản (JP)](/country/JP)
- **Wikipedia**: [Sân bay](https://en.wikipedia.org/wiki/Airport), [Vùng đô thị](https://en.wikipedia.org/wiki/Metropolitan_area)
- **Baidu Baike**: [Cụm sân bay (机场群)](https://baike.baidu.com/item/%E6%9C%BA%E5%9C%BA%E7%BE%A4)

Nguồn ảnh: các tác giả bài báo và International Air Transport. Số liệu hành khách và hàng hóa là dữ liệu sân bay ACI năm 2018 được bài báo trích dẫn; định nghĩa và năm theo tài liệu gốc. Hãy kiểm tra trang web của sân bay và hãng hàng không trước khi đi.
