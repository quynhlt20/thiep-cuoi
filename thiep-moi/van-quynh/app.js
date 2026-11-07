(function () {
  "use strict";
  var DEFAULT = window.DEFAULT_CONFIG;
  var KEY = DEFAULT.storageKey;
  var params = new URLSearchParams(location.search);
  var EDIT = params.get("edit") === "1";
  var SVGNS = "http://www.w3.org/2000/svg";

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
  function sv(tag, attrs, kids) {
    var e = document.createElementNS(SVGNS, tag);
    Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    [].concat(kids || []).forEach(function (c) { if (c) e.appendChild(c); });
    return e;
  }
  function safeUrl(u) { if (!u) return ""; try { var x = new URL(u, location.href); return /^https?:$/.test(x.protocol) ? x.href : ""; } catch (e) { return ""; } }
  function safeImg(u) { return /^(img\/|data:image\/(jpeg|png|webp);base64,|https?:\/\/)/.test(u || "") ? u : ""; }
  function safeAudio(u) { return /^(audio\/[\w\-.\/]+\.(mp3|m4a|ogg|wav)|https:\/\/\S+)$/i.test(u || "") ? u : ""; }
  function toast(msg) { var t = document.getElementById("toast"); t.textContent = msg; t.classList.add("on"); clearTimeout(toast.t); toast.t = setTimeout(function () { t.classList.remove("on"); }, 2600); }
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
    try { var m = location.hash.match(/[#&]c=([^&]+)/); if (m) return merge(cfg, JSON.parse(b64dec(m[1]))); } catch (e) {}
    try { var s = localStorage.getItem(KEY); if (s) cfg = merge(cfg, JSON.parse(s)); } catch (e) {}
    return cfg;
  }
  var cfg = loadConfig();

  /* ---------- nhạc nền ---------- */
  var au = new Audio(); au.loop = true; au.preload = "none";
  var musicBtn = h("button", { class: "music", type: "button", "aria-label": "Bật/tắt nhạc", text: "♪", onclick: function () {
    if (au.paused) au.play().catch(function () {}); else au.pause();
  } });
  document.body.appendChild(musicBtn);
  au.addEventListener("play", function () { musicBtn.classList.add("on"); });
  au.addEventListener("pause", function () { musicBtn.classList.remove("on"); });
  au.addEventListener("error", function () { musicBtn.classList.remove("show", "on"); });
  function setupMusic() {
    var src = safeAudio(cfg.music);
    musicBtn.classList.toggle("show", !!src);
    if (!src) { au.pause(); au.removeAttribute("src"); return; }
    if (au.getAttribute("src") !== src) { au.setAttribute("src", src); }
  }

  /* ---------- phong bì ---------- */
  function names(c) { return c.couple.brideFirst ? [c.couple.bride, c.couple.groom] : [c.couple.groom, c.couple.bride]; }
  function buildEnvelope() {
    var host = document.getElementById("envHost");
    var n = names(cfg);
    var env = h("div", { class: "env" }, h("div", { class: "env-card" }, [
      h("div", { class: "stamps" }, [h("i"), h("i"), h("i")]),
      h("div", { class: "env-title" }, [h("small", { text: "WELCOME" }), h("small", { text: "TO" }), h("div", { class: "script", text: "Wedding" })]),
      h("div", { class: "flap" }),
      h("button", { class: "seal", type: "button", "aria-label": "Mở thiệp", text: "♥" }),
      h("div", { class: "env-names" }, [h("div", { class: "script", text: n[0] + " & " + n[1] }), h("p", { text: "Trân trọng kính mời" }), h("div", { class: "script", style: "font-size:28px", text: "Quý khách" })]),
      h("div", { class: "env-hint", text: "CHẠM VÀO DẤU SÁP ĐỂ MỞ THIỆP" })
    ]));
    var done = false;
    function open() {
      if (done) return; done = true;
      env.classList.add("open");
      if (safeAudio(cfg.music)) au.play().catch(function () {});
      setTimeout(function () { env.classList.add("gone"); }, 1100);
      setTimeout(function () { env.remove(); }, 2600);
    }
    env.addEventListener("click", open);
    host.appendChild(env);
  }

  /* ---------- icon timeline ---------- */
  function icon(title) {
    var a = { fill: "none", stroke: "currentColor", "stroke-width": "1.6", "stroke-linecap": "round", "stroke-linejoin": "round" };
    var s = sv("svg", { viewBox: "0 0 40 40" });
    if (/đón|khách|chụp/i.test(title)) { // máy ảnh
      [sv("rect", Object.assign({ x: 5, y: 12, width: 30, height: 20, rx: 3 }, a)), sv("circle", Object.assign({ cx: 20, cy: 22, r: 6 }, a)), sv("path", Object.assign({ d: "M14 12l2-4h8l2 4" }, a))].forEach(function (e) { s.appendChild(e); });
    } else if (/khai|tiệc|ăn|ẩm/i.test(title)) { // đĩa, dĩa, dao
      [sv("circle", Object.assign({ cx: 20, cy: 21, r: 8 }, a)), sv("path", Object.assign({ d: "M8 8v10M5 8v5a3 3 0 0 0 6 0V8M32 8c-3 2-3 8 0 10v14" }, a))].forEach(function (e) { s.appendChild(e); });
    } else if (/lễ|cưới|hôn|rước/i.test(title)) { // nhẫn
      [sv("circle", Object.assign({ cx: 15, cy: 24, r: 8 }, a)), sv("circle", Object.assign({ cx: 25, cy: 24, r: 8 }, a)), sv("path", Object.assign({ d: "M12 11l3-4 3 4-3 3z" }, a))].forEach(function (e) { s.appendChild(e); });
    } else { // trái tim
      s.appendChild(sv("path", Object.assign({ d: "M20 32S7 24 7 15a6.5 6.5 0 0 1 13-2 6.5 6.5 0 0 1 13 2c0 9-13 17-13 17z" }, a)));
    }
    return s;
  }

  /* ---------- render ---------- */
  var app = document.getElementById("app");
  var countTimer, albumIdx = 0;

  function render() {
    clearInterval(countTimer);
    app.textContent = "";
    var old = document.getElementById("giftModal"); if (old) old.remove();
    var n = names(cfg), d = new Date(cfg.event.dateISO + ":00+07:00");
    var valid = !isNaN(d), vn = valid ? new Date(d.getTime() + 7 * 3600e3) : null;
    var dd = valid ? { d: pad(vn.getUTCDate()), m: pad(vn.getUTCMonth() + 1), y: vn.getUTCFullYear(), w: WEEK[vn.getUTCDay()], t: pad(vn.getUTCHours()) + ":" + pad(vn.getUTCMinutes()), wd: vn.getUTCDay(), di: vn.getUTCDate(), dim: new Date(Date.UTC(vn.getUTCFullYear(), vn.getUTCMonth() + 1, 0)).getUTCDate() } : { d: "--", m: "--", y: "----", w: "", t: "", wd: 0, di: 0, dim: 30 };
    document.title = "Thiệp mời cưới " + n[0] + " & " + n[1];
    var photos = cfg.gallery.map(safeImg).filter(Boolean);
    function ph(k) { return safeImg(cfg.photos[k]) || photos[0] || ""; }
    var nameBlock = function (cls) { return h("div", { class: cls }, [n[0], h("span", { class: "and", text: "and" }), n[1]]); };

    /* bìa */
    var hero = h("section", { class: "hero" }, [
      h("img", { class: "bg", src: safeImg(cfg.hero), alt: n[0] + " & " + n[1] }),
      nameBlock("names"),
      h("div", { class: "dt" }, [h("b", { text: dd.d }), h("b", { text: dd.m }), h("span", { text: String(dd.y) })]),
      h("div", { class: "scroll" })
    ]);
    // sắp xếp ngày giờ trong bìa theo kiểu 28 / 11 / 2026
    hero.querySelector(".dt").innerHTML = "";
    var dt = hero.querySelector(".dt");
    dt.appendChild(h("b", { text: dd.d })); dt.appendChild(h("b", { text: dd.m, style: "font-size:24px" })); dt.appendChild(h("span", { text: String(dd.y) }));

    /* câu chuyện */
    var story = h("section", { class: "story" }, [
      h("div", { class: "photo" }, h("img", { src: ph("story"), alt: "", loading: "lazy" })),
      h("div", { class: "row rv" }, [
        h("div", {}, [h("h2", { text: cfg.story.title }), h("p", { text: cfg.story.text })]),
        h("div", { class: "bigdate" }, [h("b", { text: dd.d }), h("b", { text: dd.m }), h("span", { text: String(dd.y) })])
      ])
    ]);

    /* lời mời */
    var invite = h("section", { class: "invite" }, [
      h("div", { class: "photo" }, h("img", { src: ph("invite"), alt: "", loading: "lazy" })),
      h("div", { class: "body rv" }, [
        h("p", { class: "lead", text: cfg.invite.lead }),
        h("p", { class: "lead", text: cfg.invite.text }),
        nameBlock("nm")
      ]),
      h("div", { class: "banner rv" }, [cfg.invite.banner, h("b", { text: dd.t + ", " + dd.w })])
    ]);

    /* lịch + địa điểm + hai họ */
    var cells = [];
    ["T2", "T3", "T4", "T5", "T6", "T7", "CN"].forEach(function (x) { cells.push(h("div", { class: "h", text: x })); });
    for (var b = 0; b < (dd.wd + 6) % 7; b++) cells.push(h("div", { class: "d" }));
    for (var i = 1; i <= dd.dim; i++) cells.push(h("div", { class: "d" + (i === dd.di ? " on" : "") }, h("span", { text: String(i) })));
    var mapHref = safeUrl(cfg.event.mapUrl);
    var venue = h("section", { class: "venue" }, [
      h("div", { class: "photo" }, h("img", { src: ph("venue"), alt: "", loading: "lazy" })),
      h("div", { class: "cal rv" }, [
        h("h3", { text: "Tháng " + dd.m }),
        h("div", { class: "lunar", text: "TỨC NGÀY " + String(cfg.event.lunar).toUpperCase() }),
        h("div", { class: "grid" }, cells),
        h("div", { class: "place" }, [cfg.event.venue, h("p", { text: cfg.event.address })]),
        mapHref ? h("a", { class: "pill", href: mapHref, target: "_blank", rel: "noopener", text: "📍 Xem chỉ đường" }) : null
      ]),
      h("div", { class: "fams rv" }, ["bride", "groom"].map(function (k) {
        var f = cfg.families[k];
        return h("div", { class: "fam" }, [h("h4", { text: f.title }), h("p", { text: f.father }), h("p", { text: f.mother }), h("small", { text: f.address })]);
      }))
    ]);

    /* timeline đường cong */
    var items = cfg.timeline.filter(function (x) { return x.time || x.title; });
    var STEP = 150, H = items.length * STEP + 60;
    var xs = items.map(function (_, i) { return i % 2 ? 62 : 38; });
    var ys = items.map(function (_, i) { return 60 + i * STEP; });
    var dpath = "M50 0 C50 " + ys[0] / 2 + " " + xs[0] + " " + ys[0] / 2 + " " + xs[0] + " " + ys[0];
    for (var j = 1; j < items.length; j++) { var my = (ys[j - 1] + ys[j]) / 2; dpath += " C" + xs[j - 1] + " " + my + " " + xs[j] + " " + my + " " + xs[j] + " " + ys[j]; }
    if (items.length) dpath += " C" + xs[items.length - 1] + " " + (ys[items.length - 1] + 40) + " 50 " + (H - 40) + " 50 " + H;
    var tl = h("div", { class: "tl", style: "height:" + H + "px" });
    var svg = sv("svg", { class: "path", viewBox: "0 0 100 " + H, preserveAspectRatio: "none" }, sv("path", { d: dpath, fill: "none", stroke: "#a96d65", "stroke-width": "1.3", "vector-effect": "non-scaling-stroke" }));
    tl.appendChild(svg);
    items.forEach(function (x, i) {
      var left = i % 2 === 0;
      tl.appendChild(h("div", { class: "it " + (left ? "l" : "r"), style: "top:" + (ys[i] - 26) + "px" }, [h("div", { class: "t", text: x.time }), h("div", { class: "d", text: x.title })]));
      var ic = h("div", { class: "ic", style: "left:" + (left ? 80 : 20) + "%;top:" + ys[i] + "px" }); ic.appendChild(icon(x.title || ""));
      tl.appendChild(ic);
    });
    var tlSec = h("section", { class: "tlsec rv" }, [h("h2", { text: "Timeline" }), tl]);

    /* album */
    var main = h("div", { class: "main" }), mainImg = h("img", { alt: "Ảnh cưới" });
    main.appendChild(mainImg);
    var thumbs = h("div", { class: "thumbs" });
    function showAlbum(i, jump) {
      if (!photos.length) return;
      albumIdx = (i + photos.length) % photos.length;
      mainImg.style.opacity = 0;
      setTimeout(function () { mainImg.src = photos[albumIdx]; mainImg.onload = function () { mainImg.style.opacity = 1; }; }, jump ? 0 : 120);
      [].forEach.call(thumbs.children, function (t, k) { t.classList.toggle("on", k === albumIdx); });
      var t = thumbs.children[albumIdx]; if (t && t.scrollIntoView && !jump) thumbs.scrollTo({ left: t.offsetLeft - 80, behavior: "smooth" });
    }
    photos.forEach(function (src, i) { thumbs.appendChild(h("button", { type: "button", "aria-label": "Ảnh " + (i + 1), onclick: function () { showAlbum(i); } }, h("img", { src: src, alt: "", loading: "lazy" }))); });
    main.appendChild(h("button", { class: "nav p", type: "button", "aria-label": "Trước", text: "‹", onclick: function (e) { e.stopPropagation(); showAlbum(albumIdx - 1); } }));
    main.appendChild(h("button", { class: "nav n", type: "button", "aria-label": "Sau", text: "›", onclick: function (e) { e.stopPropagation(); showAlbum(albumIdx + 1); } }));
    main.addEventListener("click", function () { openLb(photos, albumIdx); });
    var tx0 = 0;
    main.addEventListener("touchstart", function (e) { tx0 = e.changedTouches[0].clientX; }, { passive: true });
    main.addEventListener("touchend", function (e) { var dx = e.changedTouches[0].clientX - tx0; if (Math.abs(dx) > 40) showAlbum(albumIdx + (dx < 0 ? 1 : -1)); }, { passive: true });
    var album = h("section", { class: "album rv" }, [h("h2", {}, [h("em", { text: "The" }), "ALBUM"]), main, thumbs]);
    setTimeout(function () { showAlbum(albumIdx, true); }, 0);

    /* cảm ơn */
    var thanks = h("section", { class: "thanks rv" }, h("div", { class: "box" }, [
      h("h3", { text: cfg.closing.title }), h("p", { text: cfg.closing.text }), h("div", { class: "sign", text: n[0] + " & " + n[1] })
    ]));

    /* lưu bút + xác nhận (chỉ khi có endpoint) */
    var ep = safeUrl(cfg.forms.endpoint);
    function send(payload, okMsg, form) {
      var body = Object.assign({}, cfg.forms.extra || {}, payload, { couple: n[0] + " & " + n[1] });
      fetch(ep, { method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify(body) })
        .then(function (r) { if (!r.ok) throw 0; toast(okMsg); form.reset(); })
        .catch(function () { toast("Gửi chưa được, bạn thử lại sau nhé."); });
    }
    var guest = null, rsvp = null;
    if (ep) {
      var gf = h("form", { class: "frm" }, [
        h("input", { type: "text", name: "name", required: "", placeholder: "Nhập tên của bạn*" }),
        h("textarea", { name: "wish", required: "", placeholder: "Nhập lời chúc của bạn*" }),
        h("button", { class: "btn", type: "submit", text: "Gửi lời chúc" })
      ]);
      gf.addEventListener("submit", function (e) { e.preventDefault(); send({ type: "Lời chúc", name: gf.name.value, message: gf.wish.value }, "Cảm ơn lời chúc của bạn ♥", gf); });
      guest = h("section", { class: "band rv" }, [h("h3", { text: "Guest Book" }), h("p", { class: "s", text: "Cảm ơn bạn rất nhiều vì đã gửi những lời chúc tốt đẹp nhất đến đám cưới của chúng mình!" }), gf]);
      var rf = h("form", { class: "frm" }, [
        h("input", { type: "text", name: "name", required: "", placeholder: "Họ và tên *" }),
        h("input", { type: "tel", name: "phone", placeholder: "Số điện thoại" }),
        h("input", { type: "text", name: "guests", placeholder: "Số người tham dự" }),
        h("div", { class: "radio" }, [
          h("label", {}, [h("input", { type: "radio", name: "att", value: "Sẽ tham dự", checked: "" }), "Có, tôi sẽ tham dự"]),
          h("label", {}, [h("input", { type: "radio", name: "att", value: "Rất tiếc không tham dự được" }), "Xin lỗi, tôi bận mất rồi!"])
        ]),
        h("button", { class: "btn", type: "submit", text: "Xác nhận" })
      ]);
      rf.addEventListener("submit", function (e) { e.preventDefault(); send({ type: "Xác nhận tham dự", name: rf.name.value, phone: rf.phone.value, guests: rf.guests.value, attendance: rf.att.value }, "Đã nhận xác nhận, cảm ơn bạn!", rf); });
      rsvp = h("section", { class: "rsvp rv" }, h("div", { class: "box" }, [h("h3", { text: "Xác Nhận Tham Dự" }), h("p", { class: "s", text: "Việc xác nhận giúp chúng mình chuẩn bị chu đáo hơn. Cảm ơn bạn!" }), rf]));
    }

    /* mừng cưới */
    var g = cfg.gift;
    var modal = h("div", { class: "modal", id: "giftModal" }, h("div", { class: "mcard" }, [
      h("button", { class: "x", type: "button", "aria-label": "Đóng", text: "×", onclick: function () { modal.classList.remove("on"); } }),
      h("h3", { class: "script", style: "font-size:38px", text: g.button }),
      h("p", { class: "s", text: g.text }),
      !safeImg(g.qr) ? null : (g.qr === DEFAULT.gift.qr
        ? h("div", { class: "qrbox" }, h("img", { src: safeImg(g.qr), alt: "Mã QR " + g.bank }))
        : h("img", { class: "qr", src: safeImg(g.qr), alt: "Mã QR " + g.bank })),
      h("div", { class: "bank", text: g.bank }), h("div", { class: "holder", text: g.holder }), h("div", { class: "num", text: g.number }),
      h("button", { class: "pill fill", type: "button", text: "Sao chép số tài khoản", onclick: function () { copy(g.number); } })
    ]));
    modal.addEventListener("click", function (e) { if (e.target === modal) modal.classList.remove("on"); });
    document.body.appendChild(modal);
    var gift = h("div", { class: "gift-wrap rv" }, h("button", { class: "pill fill", type: "button", text: "🎁 " + g.button, onclick: function () { modal.classList.add("on"); } }));

    /* đếm ngược + chân trang */
    var cd = h("div", { class: "cd" });
    var count = h("section", { class: "count rv" }, [h("h3", { text: "Countdown" }), cd]);
    var foot = h("section", { class: "foot" }, [
      h("img", { src: ph("closing"), alt: "", loading: "lazy" }),
      h("div", { class: "tx" }, [h("div", { class: "script", text: "Thank you!" }), h("small", { text: "THIỆP CƯỚI " + n[0].toUpperCase() + " & " + n[1].toUpperCase() + " · " + dd.d + "/" + dd.m + "/" + dd.y })])
    ]);

    [hero, story, invite, venue, tlSec, album, thanks, guest, gift, rsvp, count, foot].forEach(function (s) { if (s) app.appendChild(s); });

    setupMusic();
    startCountdown(cd, d, valid);
    observe();
  }

  function startCountdown(box, target, valid) {
    if (!valid) return;
    function cell(v, l) { return h("div", {}, [h("b", { text: v }), h("small", { text: l })]); }
    function tick() {
      var s = Math.floor((target - Date.now()) / 1000);
      box.textContent = "";
      if (s <= 0) { box.className = "cd-done"; box.textContent = "Hôm nay là ngày vui của chúng mình ♥"; clearInterval(countTimer); return; }
      box.className = "cd";
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
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }); }, { threshold: .1 });
    els.forEach(function (e) { io.observe(e); });
  }

  function copy(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { toast("Đã sao chép: " + text); }, function () { toast(text); });
    else { var t = h("textarea", { style: "position:fixed;opacity:0" }); t.value = text; document.body.appendChild(t); t.select(); try { document.execCommand("copy"); toast("Đã sao chép: " + text); } catch (e) { toast(text); } t.remove(); }
  }

  /* lightbox */
  var lb = document.getElementById("lb"), lbImg = lb.querySelector("img"), lbList = [], lbI = 0;
  function openLb(list, i) { lbList = list; lbI = i; showLb(); lb.classList.add("on"); }
  function showLb() { lbImg.src = lbList[lbI]; }
  function stepLb(d) { lbI = (lbI + d + lbList.length) % lbList.length; showLb(); }
  lb.querySelector(".x").onclick = function () { lb.classList.remove("on"); };
  lb.querySelector(".p").onclick = function (e) { e.stopPropagation(); stepLb(-1); };
  lb.querySelector(".n").onclick = function (e) { e.stopPropagation(); stepLb(1); };
  lb.addEventListener("click", function (e) { if (e.target === lb) lb.classList.remove("on"); });
  document.addEventListener("keydown", function (e) { if (!lb.classList.contains("on")) return; if (e.key === "Escape") lb.classList.remove("on"); if (e.key === "ArrowLeft") stepLb(-1); if (e.key === "ArrowRight") stepLb(1); });

  render();
  if (!EDIT) buildEnvelope();

  /* ============================================================
     EDITOR  (chỉ hiện khi mở thiệp bằng  ?edit=1 )
     ============================================================ */
  if (!EDIT) return;

  var panel = h("aside", { class: "panel", "aria-label": "Chỉnh sửa thiệp" });
  var body = h("div", { class: "scroll" });
  var fab = h("button", { class: "fab", type: "button", text: "✎ Chỉnh sửa thiệp", onclick: function () { panel.classList.toggle("on"); } });
  document.body.appendChild(fab); document.body.appendChild(panel);

  var timer;
  function changed() { render(); clearTimeout(timer); timer = setTimeout(save, 300); }
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
  function photoSelect(label, path) {
    var sel = h("select");
    cfg.gallery.forEach(function (src, i) { var o = h("option", { value: src, text: "Ảnh " + (i + 1) }); if (src === getp(cfg, path)) o.selected = true; sel.appendChild(o); });
    sel.onchange = function () { setp(cfg, path, sel.value); changed(); };
    return h("div", {}, [h("label", { text: label }), sel]);
  }

  function build() {
    body.textContent = "";
    body.appendChild(h("p", { class: "hint", text: "Mọi thay đổi được lưu ngay trên trình duyệt này. Khách mở thiệp bằng đường dẫn thường sẽ không thấy nút chỉnh sửa. Để đưa nội dung mới lên đường dẫn chính thức, dùng “Tải file cấu hình” hoặc “Tạo link chia sẻ” ở cuối bảng." }));
    body.appendChild(group("Cô dâu & chú rể", [
      field("Tên cô dâu", "couple.bride"), field("Tên chú rể", "couple.groom"),
      h("label", { class: "chk" }, [h("input", { type: "checkbox", checked: cfg.couple.brideFirst ? "" : null, onchange: function (e) { cfg.couple.brideFirst = e.target.checked; changed(); } }), "Tên cô dâu đứng trước"])
    ]));
    body.appendChild(group("Lời mời", [field("Dòng 1", "invite.lead"), field("Dòng 2", "invite.text"), field("Nhãn dải màu", "invite.banner")]));
    body.appendChild(group("Love Story", [field("Tiêu đề", "story.title"), field("Nội dung", "story.text", "area")]));
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
    body.appendChild(group("Mừng cưới", [
      field("Chữ trên nút", "gift.button"), field("Lời nhắn", "gift.text", "area"), field("Ngân hàng", "gift.bank"), field("Chủ tài khoản", "gift.holder"), field("Số tài khoản", "gift.number"),
      h("button", { class: "mini", type: "button", style: "margin-top:10px", text: "Đổi ảnh mã QR", onclick: function () { pickImage(function (u) { cfg.gift.qr = u; changed(); }); } })
    ]));
    body.appendChild(group("Lời cảm ơn", [field("Tiêu đề", "closing.title"), field("Nội dung", "closing.text", "area")]));
    body.appendChild(group("Lưu bút & xác nhận tham dự", [
      field("Link nhận dữ liệu (Formspree / Web3Forms / Google Apps Script). Để trống = ẩn hai mục này", "forms.endpoint", "url"),
      h("p", { class: "hint", text: "Cần một dịch vụ nhận biểu mẫu miễn phí để lời chúc và xác nhận của khách gửi về email/bảng tính của bạn." })
    ]));
    body.appendChild(group("Nhạc nền", [field("Đường dẫn file nhạc (ví dụ audio/mot-doi.mp3)", "music"),
      h("p", { class: "hint", text: "Đặt file .mp3 vào thư mục audio/ cạnh index.html rồi tải lên cùng thiệp." })]));

    var thumbs = h("div", { class: "thumbs2" });
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
      h("button", { class: "mini", type: "button", style: "margin-top:10px", text: "+ Thêm ảnh", onclick: function () { pickImage(function (u) { cfg.gallery.push(u); build(); changed(); }, true); } }),
      photoSelect("Ảnh mục Love Story", "photos.story"), photoSelect("Ảnh mục Lời mời", "photos.invite"), photoSelect("Ảnh mục Địa điểm", "photos.venue"), photoSelect("Ảnh cuối trang", "photos.closing"),
      h("p", { class: "hint", text: "Ảnh thêm vào được thu nhỏ và lưu trên trình duyệt này; link chia sẻ chỉ gồm chữ, không kèm ảnh mới." })]));
  }
  build();

  function download(name, text, type) {
    var a = h("a", { href: URL.createObjectURL(new Blob([text], { type: type })), download: name });
    document.body.appendChild(a); a.click(); a.remove();
  }
  function shareData() {
    var c = clone(cfg), isD = function (s) { return /^data:/.test(s); };
    if (isD(c.hero)) c.hero = DEFAULT.hero;
    Object.keys(c.photos).forEach(function (k) { if (isD(c.photos[k])) c.photos[k] = DEFAULT.photos[k]; });
    if (isD(c.gift.qr)) c.gift.qr = DEFAULT.gift.qr;
    c.gallery = c.gallery.filter(function (s) { return !isD(s); });
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
