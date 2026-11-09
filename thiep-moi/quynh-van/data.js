/* ============================================================
   NỘI DUNG THIỆP MỜI (BẢN NHÀ TRAI) – cô dâu chú rể có thể sửa trực tiếp file này,
   hoặc mở thiệp bằng đường dẫn  ...?edit=1  để chỉnh bằng giao diện.
   ============================================================ */
window.DEFAULT_CONFIG = {
  storageKey: "thiep:nha-trai:v1",

  couple: {
    bride: "Quỳnh",
    groom: "Văn",
    brideFirst: true            // true: "Quỳnh & Văn"  |  false: "Văn & Quỳnh"
  },

  invite: {
    lead: "Trân trọng kính mời quý khách",
    text: "Tới dự buổi tiệc chung vui cùng gia đình chúng tôi",
    banner: "Lễ thành hôn"
  },

  story: {
    title: "Love Story",
    text: "Từ một lần gặp gỡ tình cờ đến lời hẹn ước trọn đời, câu chuyện của chúng mình được viết nên bằng tiếng cười, sự tin tưởng và niềm vui khi tìm thấy nhau."
  },

  event: {
    dateISO: "2026-11-28T16:00",          // giờ Việt Nam
    lunar: "20/10/2026 (Âm lịch)",
    venue: "Thôn Lương Mỹ",
    address: "Xã Quỳnh Phụ, tỉnh Hưng Yên",
    mapUrl: "https://www.google.com/maps?q=J9M2+V96+%C4%90%C3%ACnh+L%C6%B0%C6%A1ng+M%E1%BB%B9,+L%C6%B0%C6%A1ng+M%E1%BB%B9,+Qu%E1%BB%B3nh+Ph%E1%BB%A5,+H%C6%B0ng+Y%C3%AAn&ftid=0x3135f27d08a2bd27:0x981503d64a56b3d9&entry=gps&shh=CAE&lucs=,94297699,94231188,100821559,47071704,94218641,94282134,100835694,94286869,100820247,100822504,100838877,121816461,100798793&g_ep=CAISEjI2LjQzLjEuMDAxOTUxMTAxMBgAIMi8Byp8LDk0Mjk3Njk5LDk0MjMxMTg4LDEwMDgyMTU1OSw0NzA3MTcwNCw5NDIxODY0MSw5NDI4MjEzNCwxMDA4MzU2OTQsOTQyODY4NjksMTAwODIwMjQ3LDEwMDgyMjUwNCwxMDA4Mzg4NzcsMTIxODE2NDYxLDEwMDc5ODc5M0ICVk4%3D&skid=f23d01a2-aa5f-4a4b-ae53-67de211435cc&g_st=ic&g_st=ic"
  },

  /* thứ tự hiển thị hai họ: nhà trai bên trái */
  familiesOrder: ["groom", "bride"],

  families: {
    bride: {
      title: "Nhà gái",
      father: "Ông Lê Xuân Tân",
      mother: "Bà Phạm Thị Phương",
      address: "Tân Minh, Ninh Bình"
    },
    groom: {
      title: "Nhà trai",
      father: "Ông Nguyễn Đức Chình",
      mother: "Bà Nguyễn Thị Chín",
      address: "Xã Quỳnh Phụ, tỉnh Hưng Yên"
    }
  },

  timeline: [
    { time: "15:00", title: "Đón khách" },
    { time: "15:30", title: "Chụp ảnh kỉ niệm" },
    { time: "16:00", title: "Khai tiệc" }
  ],

  gift: {
    button: "Mừng cưới chú rể",
    text: "Sự hiện diện của bạn là niềm vui lớn nhất của chúng mình. Nếu muốn gửi lời chúc phúc, bạn có thể quét mã bên dưới.",
    bank: "PGD Khâm Thiên",
    holder: "NGUYEN DUC VAN",
    number: "9766376575",
    qr: "img/qr-van.jpg"
  },

  closing: {
    title: "Trân trọng cảm ơn!",
    // mỗi đoạn cách nhau một dòng trống
    text: "Chúng tôi rất vui khi được mời bạn đến dự lễ cưới của Quỳnh và Văn – một dấu mốc ý nghĩa trong hành trình chung đôi.\n\nSẽ thật hạnh phúc nếu bạn có thể đến chung vui và cùng lưu giữ những khoảnh khắc đẹp trong ngày đặc biệt này.\n\nRất mong bạn có thể sắp xếp thời gian đến tham dự và cùng chúc phúc cho chúng tôi."
  },

  /* Lưu bút + Xác nhận tham dự: cách nhận dữ liệu (ưu tiên từ trên xuống)
     1. endpoint: link nhận biểu mẫu (Formspree / Web3Forms / Google Apps Script...) – gửi thẳng, khách không cần làm gì thêm
     2. phone: số điện thoại cô dâu/chú rể – mở sẵn tin nhắn SMS để khách bấm gửi
     3. để trống cả hai: mở bảng chia sẻ của điện thoại (Zalo, Messenger...) hoặc sao chép nội dung */
  forms: {
    endpoint: "https://api.web3forms.com/submit",
    extra: { "access_key": "9c69baef-0b81-42f2-a538-ca4a5309f8db", "subject": "Thiệp cưới Quỳnh & Văn (bản nhà trai) – tin nhắn từ khách" },
    phone: ""                    // ví dụ "0912345678"
  },

  hero: "img/p07.jpg",           // DSC03403
  photos: {                      // ảnh của từng mục
    story: "img/p02.jpg",
    invite: "img/p04.jpg",
    venue: "img/p09.jpg",
    closing: "img/p13.jpg"
  },
  gallery: [
    "img/p07.jpg", "img/p01.jpg", "img/p02.jpg", "img/p03.jpg", "img/p04.jpg",
    "img/p05.jpg", "img/p06.jpg", "img/p08.jpg", "img/p09.jpg", "img/p10.jpg",
    "img/p11.jpg", "img/p12.jpg", "img/p13.jpg"
  ],

  /* Nhạc nền "Một đời": đặt file nhạc vào thư mục audio/ với đúng tên dưới đây */
  music: "audio/mot-doi.mp3"
};
