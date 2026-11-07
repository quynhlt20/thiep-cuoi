/* ============================================================
   NỘI DUNG THIỆP MỜI – cô dâu chú rể có thể sửa trực tiếp file này,
   hoặc mở thiệp bằng đường dẫn  ...?edit=1  để chỉnh bằng giao diện.
   ============================================================ */
window.DEFAULT_CONFIG = {
  storageKey: "thiep:van-quynh",

  couple: {
    bride: "Quỳnh",
    groom: "Văn",
    brideFirst: true            // true: "Quỳnh & Văn"  |  false: "Văn & Quỳnh"
  },

  invite: {
    lead: "Trân trọng kính mời",
    text: "Tới dự lễ thành hôn của chúng tôi và chung vui cùng gia đình chúng tôi trong ngày trọng đại này."
  },

  event: {
    dateISO: "2026-11-28T16:00",          // giờ Việt Nam
    lunar: "20/10/2026 (Âm lịch)",
    venue: "Thôn Mạc Sơn",
    address: "Xã Tân Minh, tỉnh Ninh Bình",
    mapUrl: "https://maps.app.goo.gl/eD93ZYnoQ73iS3Pt8?g_st=ic"
  },

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
      address: "Quỳnh Phụ, Thái Bình"
    }
  },

  timeline: [
    { time: "15:00", title: "Đón khách" },
    { time: "16:00", title: "Khai tiệc" }
  ],

  gift: {
    title: "Hộp mừng cưới",
    text: "Sự hiện diện của bạn là niềm vui lớn nhất của chúng mình. Nếu muốn gửi lời chúc phúc, bạn có thể quét mã bên dưới.",
    bank: "Vietcombank",
    holder: "LE THI QUYNH",
    number: "2362356690",
    qr: "img/qr.webp"
  },

  closing: {
    title: "Trân trọng cảm ơn!",
    text: "Rất mong được đón tiếp bạn trong ngày vui của chúng mình. Sự có mặt của bạn là niềm vinh hạnh cho gia đình hai họ."
  },

  hero: "img/p04.jpg",
  gallery: [
    "img/p01.jpg", "img/p02.jpg", "img/p03.jpg", "img/p04.jpg", "img/p05.jpg",
    "img/p06.jpg", "img/p07.jpg", "img/p08.jpg", "img/p09.jpg", "img/p10.jpg",
    "img/p11.jpg", "img/p12.jpg", "img/p13.jpg"
  ],

  music: ""                     // dán link file .mp3 nếu muốn có nhạc nền
};
