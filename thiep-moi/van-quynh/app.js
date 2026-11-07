(function () {
  "use strict";
  var DEFAULT = window.DEFAULT_CONFIG;
  var KEY = DEFAULT.storageKey;
  var params = new URLSearchParams(location.search);
  var EDIT = params.get("edit") === "1";

  /* ---------- helpers ---------- */
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function getp(o, p) { return p.split(".").reduce(function (a, k) { return a == null ? a : a[k]; }, o); }
  function setp(o, p, v) { var ks = p.split("."), l = ks.pop(); ks.reduce(function (a, k) { return a[k]; }, o)[l] = v; }
  function h(tag, attrs, kids) {
    var e = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === "class") e.className = attrs[k];
      else if (k === "text") e.textContent = attrs[k];
      else if (k.slice(0, 2) === "on") e.addEventListener(k.slice(2), attrs[k]);
      else if (attrs[k] !== null && attrs[k] !== undefined && attrs[k] !== false) e.setAttribute(k, attrs[k]);
    });
    [].concat(kids || []).forEach(function (c) { if (c != null) e.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return e;
  }
  function safeUrl(u) { if (!u) return ""; try { var x = new URL(u, location.href); return /^https?:$/.test(x.protocol) ? x.href : ""; } catch (e) { return ""; } }
  function safeImg(u) { return /^(img\/|data:image\/(jpeg|png|webp);base64,|https?:\/\/)/.test(u || "") ? u : ""; }
  function toast(msg) { var t = document.getElementById("toast"); t.textContent = msg; t.classList.add("on"); clearTimeout(toast.t); toast.t = setTimeout(function () { t.classList.remove("on"); }, 2200); }
  function pad(n) { return String(n).padStart(2, "0"); }
  var WEEK = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];

  /* ---------- load config ---------- */
  function b64enc(s) { return btoa(unescape(encodeURIComponent(s))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); }
  function b64dec(s) { s = s.replace(/-/g, "+").replace(/_/g, "/"); while (s.length % 4) s += "="; return decodeURIComponent(escape(atob(s))); }
  function merge(base, over) {
    if (Array.isArray(base) || typeof base !== "object" || base === null) return over === undefined ? base : over;
    var out = {};
    Object.keys(base).forEach(function (k) { out[k] = merge(base[k], over && over[k]); });
    return out;
  }
  function loadConfig() {
    var cfg = clone(DEFAULT);
    try {
      var m = location.hash.match(/[#&]c=([^&]+)/);
      if (m) return merge(cfg, JSON.parse(b64dec(m[1])));
    } catch (e) {}
    try { var s = localStorage.getItem(KEY); if (s) cfg = merge(cfg, JSON.parse(s)); } catch (e) {}
    return cfg;
  }
  var cfg = loadConfig();

  /* ---------- render ---------- */
  var app = document.getElementById("app");
  var countTimer;

  function names(c) { return c.couple.brideFirst ? [c.couple.bride, c.couple.groom] : [c.couple.groom, c.couple.bride]; }

  function render() {
    clearInterval(countTimer);
    app.textContent = "";
    var n = names(cfg), d = new Date(cfg.event.dateISO + ":00+07:00");
    var valid = !isNaN(d), vn = valid ? new Date(d.getTime() + 7 * 3600e3) : null; // đọc giờ VN bằng getUTC*
    var dd = valid ? { d: pad(vn.getUTCDate()), m: pad(vn.getUTCMonth() + 1), y: vn.getUTCFullYear(), w: WEEK[vn.getUTCDay()], t: pad(vn.getUTCHours()) + ":" + pad(vn.getUTCMinutes()) } : { d: "--", m: "--", y: "----", w: "", t: "" };
    document.title = "Thiệp mời cưới " + n[0] + " & " + n[1];

    /* hero */
    var hero = h("section", { class: "hero" }, [
      h("img", { class: "bg", src: safeImg(cfg.hero), alt: n[0] + " & " + n[1] }),
      h("div", { class: "top", text: "Thiệp mời cưới" }),
      h("div", { class: "inner" }, [
        h("div", { class: "names" }, [n[0], h("span", { text: "&" }), n[1]]),
        h("div", { class: "date", text: dd.d + " · " + dd.m + " · " + dd.y }),
        h("div", { class: "scroll" })
      ])
    ]);

    /* invite + countdown */
    var cd = h("div", { class: "count", id: "cd" });
    var invite = h("section", { class: "invite" }, h("div", { class: "wrap rv" }, [
      h("div", { class: "eyebrow", text: cfg.invite.lead }),
      h("div", { class: "divider" }, h("i")),
      h("p", { class: "txt", text: cfg.invite.text }),
      cd
    ]));

    /* event */
    var mapHref = safeUrl(cfg.event.mapUrl);
    var q = [cfg.event.venue, cfg.event.address].filter(Boolean).join(", ");
    var eventSec = h("section", { class: "event" }, h("div", { class: "wrap rv" }, [
      h("div", { class: "eyebrow", text: "Lễ thành hôn" }),
      h("h2", { text: "Thời gian & Địa điểm" }),
      h("div", { class: "divider" }, h("i")),
      h("div", { class: "dateblock" }, [
        h("div", {}, [h("small", { text: "Lúc" }), h("span", { text: dd.t })]),
        h("div", { class: "mid" }, [h("small", { text: dd.w }), h("b", { text: dd.d }), h("small", { text: "Tháng " + dd.m })]),
        h("div", {}, [h("small", { text: "Năm" }), h("span", { text: String(dd.y) })])
      ]),
      h("div", { class: "lunar", text: "Tức ngày " + cfg.event.lunar }),
      h("div", { class: "venue" }, [cfg.event.venue, h("p", { text: cfg.event.address })]),
      q ? h("div", { class: "map" }, h("iframe", { loading: "lazy", title: "Bản đồ", referrerpolicy: "no-referrer-when-downgrade", src: "https://maps.google.com/maps?q=" + encodeURIComponent(q) + "&hl=vi&z=14&output=embed" })) : null,
      mapHref ? h("div", { class: "center" }, h("a", { class: "btn", href: mapHref, target: "_blank", rel: "noopener", text: "📍 Xem chỉ đường" })) : null
    ]));

    /* families */
    function fam(f) {
      return h("div", { class: "fam" }, [
        h("h3", { text: f.title }),
        h("p", { text: f.father }), h("p", { text: f.mother }),
        h("small", { text: f.address })
      ]);
    }
    var famSec = h("section", {}, h("div", { class: "wrap rv" }, [
      h("div", { class: "eyebrow", text: "Hai họ" }),
      h("h2", { text: "Gia đình chúng tôi" }),
      h("div", { class: "divider" }, h("i")),
      h("div", { class: "fam-grid" }, [fam(cfg.families.bride), fam(cfg.families.groom)])
    ]));

    /* timeline */
    var tl = h("div", { class: "tl" }, cfg.timeline.filter(function (x) { return x.time || x.title; }).map(function (x) {
      return h("div", { class: "tl-item" }, [h("div", { class: "t", text: x.time }), h("div", { class: "d", text: x.title })]);
    }));
    var tlSec = h("section", { class: "timeline" }, h("div", { class: "wrap rv" }, [
      h("div", { class: "eyebrow", text: "Chương trình" }),
      h("h2", { text: "Timeline" }),
      h("div", { class: "divider" }, h("i")),
      tl
    ]));

    /* album */
    var photos = cfg.gallery.map(safeImg).filter(Boolean);
    var album = h("section", {}, h("div", { class: "wrap rv" }, [
      h("div", { class: "eyebrow", text: "Khoảnh khắc" }),
      h("h2", { text: "The Album" }),
      h("div", { class: "divider" }, h("i")),
      h("div", { class: "grid" }, photos.map(function (src, i) {
        return h("button", { "aria-label": "Xem ảnh " + (i + 1), onclick: function () { openLb(photos, i); } }, h("img", { src: src, alt: "Ảnh cưới " + (i + 1), loading: "lazy" }));
      }))
    ]));

    /* gift */
    var g = cfg.gift;
    var giftSec = h("section", { class: "gift" }, h("div", { class: "wrap rv" }, [
      h("div", { class: "eyebrow", text: "Gửi lời chúc" }),
      h("h2", { text: g.title }),
      h("div", { class: "divider" }, h("i")),
      h("p", { class: "lead", text: g.text }),
      h("div", { class: "card", style: "margin-top:24px" }, [
        !safeImg(g.qr) ? null : (g.qr === DEFAULT.gift.qr
          ? h("div", { class: "qrbox" }, h("img", { src: safeImg(g.qr), alt: "Mã QR " + g.bank }))   // ảnh chụp màn hình app ngân hàng: cắt gọn phần thẻ
          : h("img", { class: "qr", src: safeImg(g.qr), alt: "Mã QR " + g.bank })),
        h("div", { class: "bank", text: g.bank }),
        h("div", { class: "holder", text: g.holder }),
        h("div", { class: "num", text: g.number }),
        h("button", { class: "btn", type: "button", text: "Sao chép số tài khoản", onclick: function () { copy(g.number); } })
      ])
    ]));

    /* closing */
    var closing = h("section", { class: "closing" }, [
      h("div", { class: "ph" }, h("img", { src: safeImg(photos[photos.length - 1] || cfg.hero), alt: "", loading: "lazy" })),
      h("div", { class: "body rv" }, [
        h("h2", { text: cfg.closing.title }),
        h("p", { text: cfg.closing.text }),
        h("div", { class: "sign", text: n[0] + " & " + n[1] })
      ])
    ]);

    [hero, invite, eventSec, famSec, tlSec, album, giftSec, closing,
      h("footer", { text: "Thiệp cưới " + n[0] + " & " + n[1] + " · " + dd.d + "/" + dd.m + "/" + dd.y })
    ].forEach(function (s) { app.appendChild(s); });

    /* music */
    var mu = safeUrl(cfg.music);
    if (mu) {
      var au = h("audio", { src: mu, loop: "", preload: "none" });
      var b = h("button", { class: "music", type: "button", "aria-label": "Bật/tắt nhạc", text: "♪", onclick: function () {
        if (au.paused) { au.play().then(function () { b.classList.add("on"); }).catch(function () {}); } else { au.pause(); b.classList.remove("on"); }
      } });
      app.appendChild(au); app.appendChild(b);
    }

    startCountdown(d, valid);
    observe();
  }

  function startCountdown(target, valid) {
    var box = document.getElementById("cd");
    if (!valid) return;
    function cell(v, l) { return h("div", {}, [h("b", { text: v }), h("small", { text: l })]); }
    function tick() {
      var s = Math.floor((target - Date.now()) / 1000);
      box.textContent = "";
      if (s <= 0) { box.className = "count-done"; box.textContent = "Hôm nay là ngày vui của chúng mình ♥"; clearInterval(countTimer); return; }
      box.className = "count";
      box.appendChild(cell(Math.floor(s / 86400), "Ngày"));
      box.appendChild(cell(pad(Math.floor(s % 86400 / 3600)), "Giờ"));
      box.appendChild(cell(pad(Math.floor(s % 3600 / 60)), "Phút"));
      box.appendChild(cell(pad(s % 60), "Giây"));
    }
    tick(); countTimer = setInterval(tick, 1000);
  }

  function observe() {
    var els = document.querySelectorAll(".rv");
    if (!("IntersectionObserver" in window)) { els.forEach(function (e) { e.classList.add("in"); }); return; }
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }); }, { threshold: .12 });
    els.forEach(function (e) { io.observe(e); });
  }

  function copy(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { toast("Đã sao chép: " + text); }, function () { toast(text); });
    else { var t = h("textarea", { style: "position:fixed;opacity:0" }); t.value = text; document.body.appendChild(t); t.select(); try { document.execCommand("copy"); toast("Đã sao chép: " + text); } catch (e) { toast(text); } t.remove(); }
  }

  /* lightbox */
  var lb = document.getElementById("lb"), lbImg = lb.querySelector("img"), lbList = [], lbI = 0;
  function openLb(list, i) { lbList = list; lbI = i; show(); lb.classList.add("on"); }
  function show() { lbImg.src = lbList[lbI]; }
  function step(d) { lbI = (lbI + d + lbList.length) % lbList.length; show(); }
  lb.querySelector(".x").onclick = function () { lb.classList.remove("on"); };
  lb.querySelector(".p").onclick = function (e) { e.stopPropagation(); step(-1); };
  lb.querySelector(".n").onclick = function (e) { e.stopPropagation(); step(1); };
  lb.addEventListener("click", function (e) { if (e.target === lb) lb.classList.remove("on"); });
  document.addEventListener("keydown", function (e) { if (!lb.classList.contains("on")) return; if (e.key === "Escape") lb.classList.remove("on"); if (e.key === "ArrowLeft") step(-1); if (e.key === "ArrowRight") step(1); });

  render();

  /* ============================================================
     EDITOR  (chỉ hiện khi mở thiệp bằng  ?edit=1 )
     ============================================================ */
  if (!EDIT) return;

  var panel = h("aside", { class: "panel", "aria-label": "Chỉnh sửa thiệp" });
  var body = h("div", { class: "scroll" });
  var fab = h("button", { class: "fab", type: "button", text: "✎ Chỉnh sửa thiệp", onclick: function () { panel.classList.toggle("on"); } });
  document.body.appendChild(fab); document.body.appendChild(panel);

  var timer;
  function changed() {
    render();
    clearTimeout(timer);
    timer = setTimeout(save, 300);
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(cfg)); }
    catch (e) { toast("Bộ nhớ trình duyệt đầy – hãy bớt ảnh tải lên hoặc dùng “Tải file cấu hình”."); }
  }

  function field(label, path, type) {
    var el = type === "area" ? h("textarea") : h("input", { type: type || "text" });
    var val = getp(cfg, path);
    el.value = val == null ? "" : val;
    el.addEventListener("input", function () { setp(cfg, path, el.value); changed(); });
    return h("div", {}, [h("label", { text: label }), el]);
  }
  function group(title, kids) { return h("fieldset", {}, [h("legend", { text: title })].concat(kids)); }

  function readFile(file, cb) {
    var r = new FileReader();
    r.onload = function () {
      var img = new Image();
      img.onload = function () {
        var m = 1100, s = Math.min(1, m / Math.max(img.width, img.height));
        var c = document.createElement("canvas"); c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        cb(c.toDataURL("image/jpeg", .78));
      };
      img.src = r.result;
    };
    r.readAsDataURL(file);
  }
  function pickImage(cb, multi) {
    var inp = h("input", { type: "file", accept: "image/*" });
    if (multi) inp.multiple = true;
    inp.onchange = function () { [].forEach.call(inp.files, function (f) { readFile(f, cb); }); };
    inp.click();
  }

  function build() {
    body.textContent = "";
    body.appendChild(h("p", { class: "hint", text: "Mọi thay đổi được lưu ngay trên trình duyệt này. Khách mở thiệp bằng đường dẫn thường sẽ không thấy nút chỉnh sửa. Để đưa nội dung mới lên đường dẫn chính thức, dùng “Tải file cấu hình” hoặc “Tạo link chia sẻ” ở cuối bảng." }));

    body.appendChild(group("Cô dâu & chú rể", [
      field("Tên cô dâu", "couple.bride"), field("Tên chú rể", "couple.groom"),
      h("label", { class: "chk" }, [h("input", { type: "checkbox", checked: cfg.couple.brideFirst ? "" : null, onchange: function (e) { cfg.couple.brideFirst = e.target.checked; changed(); } }), "Tên cô dâu đứng trước"])
    ]));
    body.appendChild(group("Lời mời", [field("Dòng nhỏ", "invite.lead"), field("Nội dung", "invite.text", "area")]));
    body.appendChild(group("Thời gian & địa điểm", [
      field("Ngày giờ (dương lịch)", "event.dateISO", "datetime-local"), field("Âm lịch", "event.lunar"),
      field("Tên địa điểm", "event.venue"), field("Địa chỉ", "event.address"), field("Link Google Maps", "event.mapUrl", "url")
    ]));
    ["bride", "groom"].forEach(function (k) {
      var p = "families." + k + ".";
      body.appendChild(group(k === "bride" ? "Nhà gái" : "Nhà trai", [field("Tiêu đề", p + "title"), field("Cha", p + "father"), field("Mẹ", p + "mother"), field("Địa chỉ", p + "address")]));
    });

    var tlBox = h("div");
    function drawTl() {
      tlBox.textContent = "";
      cfg.timeline.forEach(function (x, i) {
        var t = h("input", { type: "text", value: x.time, placeholder: "15:00", style: "max-width:90px" });
        var d = h("input", { type: "text", value: x.title, placeholder: "Nội dung" });
        t.oninput = function () { x.time = t.value; changed(); }; d.oninput = function () { x.title = d.value; changed(); };
        tlBox.appendChild(h("div", { class: "row", style: "margin-top:8px" }, [t, d, h("button", { class: "mini", type: "button", text: "✕", onclick: function () { cfg.timeline.splice(i, 1); drawTl(); changed(); } })]));
      });
    }
    drawTl();
    body.appendChild(group("Timeline", [tlBox, h("button", { class: "mini", type: "button", style: "margin-top:10px", text: "+ Thêm mốc", onclick: function () { cfg.timeline.push({ time: "", title: "" }); drawTl(); changed(); } })]));

    var qrBox = h("div");
    body.appendChild(group("Mừng cưới", [
      field("Tiêu đề", "gift.title"), field("Lời nhắn", "gift.text", "area"), field("Ngân hàng", "gift.bank"), field("Chủ tài khoản", "gift.holder"), field("Số tài khoản", "gift.number"),
      qrBox,
      h("button", { class: "mini", type: "button", style: "margin-top:10px", text: "Đổi ảnh mã QR", onclick: function () { pickImage(function (u) { cfg.gift.qr = u; changed(); }); } })
    ]));
    body.appendChild(group("Lời cảm ơn", [field("Tiêu đề", "closing.title"), field("Nội dung", "closing.text", "area")]));
    body.appendChild(group("Nhạc nền", [field("Link file .mp3 (để trống nếu không dùng)", "music", "url")]));

    var thumbs = h("div", { class: "thumbs" });
    function drawThumbs() {
      thumbs.textContent = "";
      cfg.gallery.forEach(function (src, i) {
        var isHero = src === cfg.hero;
        thumbs.appendChild(h("div", { class: "th" + (isHero ? " hero" : "") }, [
          h("img", { src: safeImg(src), alt: "" }),
          h("button", { class: "del", type: "button", "aria-label": "Xóa ảnh", text: "✕", onclick: function () { cfg.gallery.splice(i, 1); drawThumbs(); changed(); } }),
          h("button", { class: "cov", type: "button", text: isHero ? "Ảnh bìa" : "Đặt làm bìa", onclick: function () { cfg.hero = src; drawThumbs(); changed(); } })
        ]));
      });
    }
    drawThumbs();
    body.appendChild(group("Ảnh", [thumbs,
      h("button", { class: "mini", type: "button", style: "margin-top:10px", text: "+ Thêm ảnh", onclick: function () { pickImage(function (u) { cfg.gallery.push(u); drawThumbs(); changed(); }, true); } }),
      h("p", { class: "hint", text: "Ảnh thêm vào được thu nhỏ và lưu trên trình duyệt này; link chia sẻ chỉ gồm chữ, không kèm ảnh mới." })]));
  }
  build();

  function download(name, text, type) {
    var a = h("a", { href: URL.createObjectURL(new Blob([text], { type: type })), download: name });
    document.body.appendChild(a); a.click(); a.remove();
  }
  function shareData() {
    var c = clone(cfg);
    if (/^data:/.test(c.hero)) c.hero = DEFAULT.hero;
    if (/^data:/.test(c.gift.qr)) c.gift.qr = DEFAULT.gift.qr;
    c.gallery = c.gallery.filter(function (s) { return !/^data:/.test(s); });
    return c;
  }

  var foot = h("footer", {}, [
    h("button", { class: "mini pri", type: "button", text: "Tạo link chia sẻ", onclick: function () {
      var url = location.origin + location.pathname + "#c=" + b64enc(JSON.stringify(shareData()));
      copy(url); toast("Đã sao chép link thiệp với nội dung mới");
    } }),
    h("button", { class: "mini", type: "button", text: "Tải file cấu hình", onclick: function () {
      download("data.js", "/* Thay file data.js trên máy chủ bằng file này */\nwindow.DEFAULT_CONFIG = " + JSON.stringify(cfg, null, 2) + ";\n", "text/javascript");
    } }),
    h("button", { class: "mini", type: "button", text: "Đặt lại", onclick: function () {
      if (!confirm("Xóa mọi chỉnh sửa và quay về nội dung gốc?")) return;
      try { localStorage.removeItem(KEY); } catch (e) {}
      cfg = clone(DEFAULT); build(); render();
    } })
  ]);

  panel.appendChild(h("header", {}, [h("span", { text: "Chỉnh sửa thiệp" }), h("button", { type: "button", "aria-label": "Đóng", text: "×", onclick: function () { panel.classList.remove("on"); } })]));
  panel.appendChild(body); panel.appendChild(foot);
})();
