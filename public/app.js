/* Трекер гостей — общий список на 22–24 сентября.
   Хранилище: Cloud Firestore через REST API (без SDK, без сборки). */
(function () {
  "use strict";

  var DATES = ["22.09", "23.09", "24.09"];
  var MONTH_NAMES = { "22.09": "22 сентября", "23.09": "23 сентября", "24.09": "24 сентября" };
  var STATUSES = [
    { v: "confirmed", label: "✅ Подтвердил" },
    { v: "pending", label: "❓ Ожидаем ответ" },
    { v: "declined", label: "❌ Не придёт" }
  ];
  var DEFAULT_TEMPLATE =
    "Привет, {Имя}! 🎉\n\n" +
    "Очень хочу позвать тебя к нам {Дата}. Начнём ближе к вечеру, будет еда, музыка и все свои.\n\n" +
    "Скажи, получится ли у тебя прийти? Мне важно понимать заранее 💛";

  var SEED = [
    { name: "Абросимов Женя", date: "22.09", status: "confirmed", groupId: null, pairLabel: "" },
    { name: "Паша", date: "22.09", status: "confirmed", groupId: null, pairLabel: "" },
    { name: "Вероника", date: "22.09", status: "confirmed", groupId: null, pairLabel: "" },
    { name: "Алеся", date: "22.09", status: "confirmed", groupId: "p1", pairLabel: "в паре с Лешей" },
    { name: "Леша", date: "22.09", status: "confirmed", groupId: "p1", pairLabel: "в паре с Алесей" },
    { name: "Стас", date: "22.09", status: "pending", groupId: "p2", pairLabel: "в паре с Марго" },
    { name: "Марго", date: "22.09", status: "pending", groupId: "p2", pairLabel: "в паре со Стасом" },
    { name: "Света", date: "22.09", status: "confirmed", groupId: "p3", pairLabel: "в паре с Костей" },
    { name: "Костя", date: "22.09", status: "confirmed", groupId: "p3", pairLabel: "в паре со Светой" },
    { name: "Саша", date: "22.09", status: "confirmed", groupId: "p4", pairLabel: "+1 гость" },
    { name: "Гость Саши", date: "22.09", status: "confirmed", groupId: "p4", pairLabel: "+1 гостя Саши" },
    { name: "Федоров Ваня", date: "22.09", status: "confirmed", groupId: null, pairLabel: "" },
    { name: "Вал", date: "22.09", status: "confirmed", groupId: null, pairLabel: "" },
    { name: "Вика", date: "22.09", status: "confirmed", groupId: "p5", pairLabel: "в паре с Сашей" },
    { name: "Саша", date: "22.09", status: "confirmed", groupId: "p5", pairLabel: "в паре с Викой" },
    { name: "Ваня", date: "23.09", status: "confirmed", groupId: "p6", pairLabel: "в паре с Яной" },
    { name: "Яна", date: "23.09", status: "confirmed", groupId: "p6", pairLabel: "в паре с Ваней" },
    { name: "Мага", date: "23.09", status: "confirmed", groupId: null, pairLabel: "" },
    { name: "Марат", date: "23.09", status: "confirmed", groupId: null, pairLabel: "" },
    { name: "Ксюша", date: "23.09", status: "confirmed", groupId: null, pairLabel: "" },
    { name: "Митя", date: "23.09", status: "confirmed", groupId: "p7", pairLabel: "в паре с Настей" },
    { name: "Настя", date: "23.09", status: "confirmed", groupId: "p7", pairLabel: "в паре с Митей" },
    { name: "Георгий", date: "23.09", status: "pending", groupId: null, pairLabel: "" },
    { name: "Ксюша", date: "23.09", status: "confirmed", groupId: "p8", pairLabel: "в паре с Костей" },
    { name: "Костя", date: "23.09", status: "confirmed", groupId: "p8", pairLabel: "в паре с Ксюшей" },
    { name: "Суладзе", date: "23.09", status: "confirmed", groupId: null, pairLabel: "" },
    { name: "Руслан", date: "23.09", status: "confirmed", groupId: null, pairLabel: "" },
    { name: "Онегин Женя", date: "23.09", status: "confirmed", groupId: null, pairLabel: "" },
    { name: "Леша", date: "23.09", status: "pending", groupId: "p9", pairLabel: "+1 гость" },
    { name: "Гость Леши", date: "23.09", status: "pending", groupId: "p9", pairLabel: "+1 гостя Леши" },
    { name: "Кирилл Егоров", date: "24.09", status: "confirmed", groupId: "p10", pairLabel: "в паре с Аней" },
    { name: "Аня", date: "24.09", status: "confirmed", groupId: "p10", pairLabel: "в паре с Кириллом" },
    { name: "Аксиния", date: "24.09", status: "confirmed", groupId: "p11", pairLabel: "в паре с Владом" },
    { name: "Влад", date: "24.09", status: "confirmed", groupId: "p11", pairLabel: "в паре с Аксинией" },
    { name: "Коля Риш", date: "24.09", status: "pending", groupId: "p12", pairLabel: "+1 гость" },
    { name: "Гость Коли Риша", date: "24.09", status: "pending", groupId: "p12", pairLabel: "+1 гостя Коли Риша" },
    { name: "Андрей", date: "24.09", status: "pending", groupId: null, pairLabel: "" },
    { name: "Саша повар", date: "24.09", status: "confirmed", groupId: null, pairLabel: "" },
    { name: "Джордж", date: "24.09", status: "confirmed", groupId: null, pairLabel: "" },
    { name: "Оля", date: "24.09", status: "confirmed", groupId: "p13", pairLabel: "в паре с Ваней" },
    { name: "Ваня", date: "24.09", status: "confirmed", groupId: "p13", pairLabel: "в паре с Олей" },
    { name: "Аня", date: "24.09", status: "confirmed", groupId: "p14", pairLabel: "в паре с Сашей" },
    { name: "Саша", date: "24.09", status: "confirmed", groupId: "p14", pairLabel: "в паре с Аней" },
    { name: "Виталик", date: "24.09", status: "confirmed", groupId: "p15", pairLabel: "+1 гость" },
    { name: "Гость Виталика", date: "24.09", status: "confirmed", groupId: "p15", pairLabel: "+1 гостя Виталика" },
    { name: "Катя Ри", date: "24.09", status: "pending", groupId: null, pairLabel: "" }
  ];

  /* ---------------- Firestore REST ---------------- */

  var CFG = window.GUESTS_CONFIG || {};
  var HOST = CFG.host || "https://firestore.googleapis.com";
  var BASE = HOST + "/v1/projects/" + CFG.projectId + "/databases/(default)/documents";

  function enc(v) {
    if (v === null || v === undefined) return { nullValue: null };
    if (typeof v === "boolean") return { booleanValue: v };
    if (typeof v === "number") {
      return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
    }
    return { stringValue: String(v) };
  }
  function dec(f) {
    if (!f) return null;
    if ("nullValue" in f) return null;
    if ("booleanValue" in f) return f.booleanValue;
    if ("integerValue" in f) return parseInt(f.integerValue, 10);
    if ("doubleValue" in f) return f.doubleValue;
    if ("stringValue" in f) return f.stringValue;
    return null;
  }
  function encFields(obj) {
    var out = {};
    for (var k in obj) if (Object.prototype.hasOwnProperty.call(obj, k)) out[k] = enc(obj[k]);
    return out;
  }
  function decFields(fields) {
    var out = {};
    for (var k in fields) if (Object.prototype.hasOwnProperty.call(fields, k)) out[k] = dec(fields[k]);
    return out;
  }
  function mask(keys) {
    return keys.map(function (k) { return "updateMask.fieldPaths=" + encodeURIComponent(k); }).join("&");
  }
  function qs(extra) {
    return "?key=" + encodeURIComponent(CFG.apiKey) + (extra ? "&" + extra : "");
  }

  function fsError(res, body) {
    var msg = (body && body.error && body.error.message) || ("HTTP " + res.status);
    var e = new Error(msg);
    e.status = res.status;
    return e;
  }

  async function fsFetch(url, opts) {
    var res = await fetch(url, opts);
    var body = null;
    try { body = await res.json(); } catch (e) { /* пустой ответ у DELETE */ }
    if (!res.ok) throw fsError(res, body);
    return body || {};
  }

  async function fsList(collection) {
    var docs = [];
    var token = "";
    do {
      var url = BASE + "/" + collection + qs("pageSize=300" + (token ? "&pageToken=" + encodeURIComponent(token) : ""));
      var data = await fsFetch(url);
      (data.documents || []).forEach(function (d) {
        var id = d.name.split("/").pop();
        var obj = decFields(d.fields || {});
        obj.id = id;
        docs.push(obj);
      });
      token = data.nextPageToken || "";
    } while (token);
    return docs;
  }

  function fsPatch(path, data, opts) {
    var keys = Object.keys(data);
    var extra = mask(keys);
    if (opts && opts.mustNotExist) extra += "&currentDocument.exists=false";
    return fsFetch(BASE + "/" + path + qs(extra), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fields: encFields(data) })
    });
  }

  function fsDelete(path) {
    return fsFetch(BASE + "/" + path + qs(), { method: "DELETE" });
  }

  /* ---------------- Состояние ---------------- */

  var state = {
    guests: [],
    template: DEFAULT_TEMPLATE,
    filter: "all",
    query: "",
    loaded: false,
    pending: 0,
    signature: ""
  };

  var $ = function (id) { return document.getElementById(id); };
  var els = {};
  var dark = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;

  function newId() {
    var s = "abcdefghijklmnopqrstuvwxyz0123456789";
    var r = "";
    for (var i = 0; i < 16; i++) r += s.charAt(Math.floor(Math.random() * s.length));
    return "g" + Date.now().toString(36) + r.slice(0, 8);
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function normalizeGuest(g) {
    return {
      id: g.id,
      name: typeof g.name === "string" ? g.name : "",
      date: DATES.indexOf(g.date) >= 0 ? g.date : DATES[0],
      status: ["confirmed", "pending", "declined"].indexOf(g.status) >= 0 ? g.status : "pending",
      groupId: g.groupId || "",
      pairLabel: g.pairLabel || "",
      responsible: g.responsible || "",
      sent: g.sent === true,
      notes: g.notes || "",
      pos: typeof g.pos === "number" ? g.pos : 0
    };
  }

  /* ---------------- Цвета групп ---------------- */

  var groupColors = {};
  function recomputeGroupColors() {
    var ids = [];
    state.guests.forEach(function (g) {
      if (g.groupId && ids.indexOf(g.groupId) < 0) ids.push(g.groupId);
    });
    ids.sort(function (a, b) {
      var na = parseInt(String(a).replace(/\D/g, ""), 10);
      var nb = parseInt(String(b).replace(/\D/g, ""), 10);
      if (!isNaN(na) && !isNaN(nb) && na !== nb) return na - nb;
      return String(a) < String(b) ? -1 : 1;
    });
    var isDark = dark && dark.matches;
    groupColors = {};
    ids.forEach(function (id, i) {
      var h = Math.round((i * 137.508 + 12) % 360);
      groupColors[id] = {
        bg: "hsla(" + h + ", 70%, 50%, " + (isDark ? "0.16" : "0.13") + ")",
        accent: isDark ? "hsl(" + h + ", 72%, 70%)" : "hsl(" + h + ", 62%, 38%)"
      };
    });
  }

  /* ---------------- Загрузка / сохранение ---------------- */

  function setSync(stateName, text) {
    els.sync.setAttribute("data-state", stateName);
    els.syncText.textContent = text;
  }

  async function loadAll(silent) {
    try {
      var results = await Promise.all([fsList("guests"), fsList("meta")]);
      var guests = results[0].map(normalizeGuest);
      var settings = null;
      results[1].forEach(function (d) { if (d.id === "settings") settings = d; });

      if (!guests.length && !settings) {
        await seed();
        return loadAll(true);
      }

      guests.sort(function (a, b) { return a.pos - b.pos; });
      var tpl = settings ? settings.template : null;

      state.guests = guests;
      if (typeof tpl === "string" && tpl.length) state.template = tpl;
      state.loaded = true;

      var sig = JSON.stringify(state.guests) + "|" + state.template;
      var changed = sig !== state.signature;
      state.signature = sig;

      els.main.hidden = false;
      els.setup.hidden = true;
      if (state.pending === 0) setSync("idle", "все сохранено");
      if (changed || !silent) render(!changed);
      return true;
    } catch (e) {
      handleError(e);
      return false;
    }
  }

  async function seed() {
    // Создаём meta/settings только если его ещё нет — это защищает от
    // двойного засева, если страницу открыли одновременно с двух устройств.
    await fsPatch("meta/settings", { template: DEFAULT_TEMPLATE, seeded: true }, { mustNotExist: true });
    for (var i = 0; i < SEED.length; i++) {
      var s = SEED[i];
      await fsPatch("guests/" + newId(), {
        name: s.name, date: s.date, status: s.status,
        groupId: s.groupId || "", pairLabel: s.pairLabel || "",
        responsible: "", sent: false, notes: "", pos: (i + 1) * 10
      });
    }
  }

  async function save(fn, optimistic) {
    state.pending++;
    setSync("saving", "сохраняем…");
    try {
      await fn();
      state.pending--;
      if (state.pending === 0) setSync("idle", "все сохранено");
      state.signature = "";
      await loadAll(true);
    } catch (e) {
      state.pending--;
      handleError(e);
      await loadAll(true);
    }
  }

  function updateGuest(id, patch) {
    var g = findGuest(id);
    if (g) for (var k in patch) g[k] = patch[k];
    render(true);
    return save(function () { return fsPatch("guests/" + id, patch); });
  }

  function findGuest(id) {
    for (var i = 0; i < state.guests.length; i++) if (state.guests[i].id === id) return state.guests[i];
    return null;
  }

  function handleError(e) {
    console.error(e);
    var msg = String((e && e.message) || e);
    if (e && (e.status === 403 || e.status === 401) || /permission|PERMISSION_DENIED/i.test(msg)) {
      setSync("error", "нет доступа к базе");
      showSetup("rules", msg);
    } else if (e && e.status === 404) {
      setSync("error", "база не найдена");
      showSetup("missing", msg);
    } else {
      setSync("error", "нет связи — правки не сохранены");
    }
  }

  /* ---------------- Экран настройки ---------------- */

  function showSetup(kind, detail) {
    var html = "";
    if (kind === "empty") {
      html =
        '<div class="notice notice--warn">' +
        "<h2>⚙️ Осталось подключить базу данных</h2>" +
        "<p>Интерфейс готов, но не указано, где хранить список гостей. Нужно один раз создать бесплатную базу Firebase Firestore:</p>" +
        "<ol>" +
        '<li>Откройте <a href="https://console.firebase.google.com/" target="_blank" rel="noopener">console.firebase.google.com</a> и создайте проект (Google Analytics можно выключить).</li>' +
        "<li>В меню слева: <code>Build → Firestore Database → Create database</code>, режим <b>Production</b>, регион <code>eur3</code> или <code>europe-west</code>.</li>" +
        "<li>Вкладка <code>Rules</code> → вставьте правила открытого доступа и нажмите <b>Publish</b>.</li>" +
        "<li>Шестерёнка <code>Project settings → General</code> → внизу <b>Add app → Web</b> → скопируйте <code>projectId</code> и <code>apiKey</code>.</li>" +
        "<li>Впишите их в файл <code>public/config.js</code> и запушьте в GitHub.</li>" +
        "</ol></div>";
    } else if (kind === "rules") {
      html =
        '<div class="notice notice--warn">' +
        "<h2>🔒 База есть, но доступ закрыт</h2>" +
        "<p>В Firebase Console откройте <code>Firestore Database → Rules</code>, вставьте правила открытого доступа и нажмите <b>Publish</b>.</p>" +
        "<p><code>" + esc(detail || "") + "</code></p></div>";
    } else {
      html =
        '<div class="notice notice--warn">' +
        "<h2>❓ База данных не найдена</h2>" +
        "<p>Проверьте <code>projectId</code> в <code>public/config.js</code> и что в проекте Firebase создана база Firestore.</p>" +
        "<p><code>" + esc(detail || "") + "</code></p></div>";
    }
    els.setup.innerHTML = html;
    els.setup.hidden = false;
  }

  /* ---------------- Отрисовка ---------------- */

  function visibleGuests() {
    var q = state.query.trim().toLowerCase();
    return state.guests.filter(function (g) {
      if (state.filter !== "all" && g.date !== state.filter) return false;
      if (q && g.name.toLowerCase().indexOf(q) < 0) return false;
      return true;
    });
  }

  function renderSummary() {
    var total = state.guests.length;
    var conf = state.guests.filter(function (g) { return g.status === "confirmed"; }).length;
    var html =
      '<div class="stat stat--accent"><span class="stat__num">' + total + '</span>' +
      '<span class="stat__label">всего гостей</span></div>' +
      '<div class="stat stat--ok"><span class="stat__num">' + conf + '</span>' +
      '<span class="stat__label">всего подтвердили</span></div>';
    DATES.forEach(function (d) {
      var on = state.guests.filter(function (g) { return g.date === d; });
      var ok = on.filter(function (g) { return g.status === "confirmed"; }).length;
      var wait = on.filter(function (g) { return g.status === "pending"; }).length;
      html +=
        '<div class="stat"><span class="stat__num">' + ok + '</span>' +
        '<span class="stat__label">' + d + " — подтвердили</span>" +
        '<span class="stat__sub">в списке: ' + on.length + (wait ? " · ждём: " + wait : "") + "</span></div>";
    });
    els.summary.innerHTML = html;
  }

  function renderTabs() {
    var html = "";
    var items = [{ v: "all", label: "Все" }].concat(DATES.map(function (d) { return { v: d, label: d }; }));
    items.forEach(function (it) {
      var n = it.v === "all" ? state.guests.length
        : state.guests.filter(function (g) { return g.date === it.v; }).length;
      html += '<button class="tab" role="tab" type="button" data-date="' + it.v + '" aria-selected="' +
        (state.filter === it.v) + '">' + it.label + '<span class="cnt">' + n + "</span></button>";
    });
    els.tabs.innerHTML = html;
  }

  function statusOptions(cur) {
    return STATUSES.map(function (s) {
      return '<option value="' + s.v + '"' + (s.v === cur ? " selected" : "") + ">" + s.label + "</option>";
    }).join("");
  }
  function dateOptions(cur) {
    return DATES.map(function (d) {
      return '<option value="' + d + '"' + (d === cur ? " selected" : "") + ">" + d + "</option>";
    }).join("");
  }

  /* Перерисовка таблицы откладывается, пока человек с ней работает:
     событие change прилетает ровно в момент перехода фокуса между полями,
     и перестройка DOM в этот миг уничтожила бы поле, в которое только что
     кликнули (вместе с несохранённым текстом). */
  var rowsDirty = false, rowsTimer = null, rowsTouchedAt = 0;

  function rowsBusy() {
    return els.rows.contains(document.activeElement) || (Date.now() - rowsTouchedAt) < 600;
  }

  function renderRows() {
    if (rowsBusy()) {
      rowsDirty = true;
      if (!rowsTimer) {
        rowsTimer = setInterval(function () {
          if (rowsBusy()) return;
          clearInterval(rowsTimer);
          rowsTimer = null;
          if (rowsDirty) { rowsDirty = false; paintRows(); renderInvites(); }
        }, 250);
      }
      return;
    }
    rowsDirty = false;
    paintRows();
  }

  function paintRows() {
    var list = visibleGuests();
    if (!list.length) {
      els.rows.innerHTML = '<div class="empty">' +
        (state.query ? "Никого не нашли по запросу «" + esc(state.query) + "»." : "Пока никого нет — добавьте первого гостя.") +
        "</div>";
      return;
    }
    var html = list.map(function (g) {
      var c = g.groupId ? groupColors[g.groupId] : null;
      var style = c ? ' style="--g-bg:' + c.bg + ";--g-accent:" + c.accent + '"' : "";
      return '<div class="row' + (c ? " row--grouped" : "") + '"' + style + ' data-id="' + g.id + '">' +
        '<div class="cell cell--name"><span class="cell__label">Имя</span>' +
        '<input class="f f--name" type="text" data-field="name" value="' + esc(g.name) + '" aria-label="Имя">' +
        (g.pairLabel ? '<span class="pair">• ' + esc(g.pairLabel) + "</span>" : "") +
        "</div>" +
        '<div class="cell"><span class="cell__label">Дата</span>' +
        '<select class="f" data-field="date" aria-label="Дата">' + dateOptions(g.date) + "</select></div>" +
        '<div class="cell"><span class="cell__label">Статус</span>' +
        '<span class="st" data-v="' + g.status + '"><select class="f" data-field="status" aria-label="Статус">' +
        statusOptions(g.status) + "</select></span></div>" +
        '<div class="cell"><span class="cell__label">Ответственный</span>' +
        '<input class="f" type="text" data-field="responsible" value="' + esc(g.responsible) +
        '" placeholder="кто пишет" aria-label="Ответственный за отправку"></div>' +
        '<div class="cell"><span class="cell__label">Отправлено</span>' +
        '<label class="toggle"><input type="checkbox" data-field="sent"' + (g.sent ? " checked" : "") +
        '><span class="track"></span><span>' + (g.sent ? "да" : "нет") + "</span></label></div>" +
        '<div class="cell cell--notes"><span class="cell__label">Заметки</span>' +
        '<input class="f" type="text" data-field="notes" value="' + esc(g.notes) +
        '" placeholder="—" aria-label="Заметки"></div>' +
        '<div class="cell cell--del"><button class="del" type="button" data-action="delete" title="Удалить гостя" aria-label="Удалить ' +
        esc(g.name) + '">✕</button></div>' +
        "</div>";
    }).join("");
    els.rows.innerHTML = html;
  }

  function buildInvite(g) {
    return String(state.template)
      .replace(/\{\s*имя\s*\}/gi, g.name)
      .replace(/\{\s*дата\s*цифрами\s*\}/gi, g.date)
      .replace(/\{\s*датацифрами\s*\}/gi, g.date)
      .replace(/\{\s*дата\s*\}/gi, MONTH_NAMES[g.date] || g.date);
  }

  function renderInvites() {
    if (els.invites.contains(document.activeElement)) return;
    var list = visibleGuests();
    els.invHint.textContent = list.length
      ? "Тексты собраны по текущему фильтру — " + list.length + " шт. Нажмите «Копировать» и вставьте в мессенджер."
      : "Нет гостей по текущему фильтру.";
    els.invites.innerHTML = list.map(function (g) {
      var c = g.groupId ? groupColors[g.groupId] : null;
      var style = c ? ' style="--g-accent:' + c.accent + '"' : "";
      return '<div class="inv' + (c ? " inv--grouped" : "") + '"' + style + ">" +
        '<div class="inv__top"><span class="inv__name">' + esc(g.name || "Без имени") + "</span>" +
        '<span class="inv__meta">' + g.date + (g.sent ? " · отправлено" : "") + "</span></div>" +
        '<pre class="inv__text">' + esc(buildInvite(g)) + "</pre>" +
        '<button class="btn btn--sm" type="button" data-copy="' + g.id + '">Копировать</button>' +
        "</div>";
    }).join("");
  }

  function render(skipTemplate) {
    recomputeGroupColors();
    renderSummary();
    renderTabs();
    renderRows();
    renderInvites();
    if (!skipTemplate && document.activeElement !== els.tpl) els.tpl.value = state.template;
  }

  /* ---------------- События ---------------- */

  function isEditing() {
    var a = document.activeElement;
    if (!a) return false;
    return els.rows.contains(a) || a === els.tpl || els.addBox.contains(a);
  }

  function bind() {
    els.tabs.addEventListener("click", function (e) {
      var t = e.target.closest("[data-date]");
      if (!t) return;
      state.filter = t.getAttribute("data-date");
      render(true);
    });

    els.search.addEventListener("input", function () {
      state.query = els.search.value;
      renderRows();
      renderInvites();
    });

    els.addToggle.addEventListener("click", function () {
      els.addBox.hidden = !els.addBox.hidden;
      if (!els.addBox.hidden) $("newName").focus();
    });

    els.addBox.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = $("newName").value.trim();
      if (!name) return;
      var maxPos = state.guests.reduce(function (m, g) { return Math.max(m, g.pos); }, 0);
      var g = {
        name: name, date: $("newDate").value, status: $("newStatus").value,
        groupId: "", pairLabel: "", responsible: "", sent: false, notes: "", pos: maxPos + 10
      };
      var id = newId();
      state.guests.push(normalizeGuest(Object.assign({ id: id }, g)));
      $("newName").value = "";
      els.addBox.hidden = true;
      render(true);
      save(function () { return fsPatch("guests/" + id, g); });
    });

    els.rows.addEventListener("change", function (e) {
      var row = e.target.closest(".row");
      if (!row) return;
      var id = row.getAttribute("data-id");
      var field = e.target.getAttribute("data-field");
      if (!field) return;
      var patch = {};
      if (field === "sent") patch.sent = e.target.checked;
      else patch[field] = e.target.value;
      if (field === "name") patch.name = String(patch.name).trim();
      updateGuest(id, patch);
    });

    ["focusin", "focusout", "input", "change", "pointerdown"].forEach(function (ev) {
      els.rows.addEventListener(ev, function () { rowsTouchedAt = Date.now(); }, true);
    });

    els.rows.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && e.target.tagName === "INPUT" && e.target.type === "text") {
        e.preventDefault();
        e.target.blur();
      }
    });

    els.rows.addEventListener("click", function (e) {
      var btn = e.target.closest('[data-action="delete"]');
      if (!btn) return;
      var row = btn.closest(".row");
      var id = row.getAttribute("data-id");
      var g = findGuest(id);
      if (!window.confirm("Удалить «" + ((g && g.name) || "гостя") + "» из списка?")) return;
      state.guests = state.guests.filter(function (x) { return x.id !== id; });
      render(true);
      save(function () { return fsDelete("guests/" + id); });
    });

    els.invites.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-copy]");
      if (!btn) return;
      var g = findGuest(btn.getAttribute("data-copy"));
      if (!g) return;
      copyText(buildInvite(g)).then(function () {
        var old = btn.textContent;
        btn.textContent = "Скопировано ✓";
        btn.classList.add("copied");
        setTimeout(function () { btn.textContent = old; btn.classList.remove("copied"); }, 1600);
      }, function () {
        window.prompt("Скопируйте текст вручную:", buildInvite(g));
      });
    });

    els.tplSave.addEventListener("click", function () {
      state.template = els.tpl.value;
      els.tplNote.textContent = "";
      renderInvites();
      save(function () { return fsPatch("meta/settings", { template: state.template }); })
        .then(function () { els.tplNote.textContent = "Шаблон сохранён для всех ✓"; });
    });

    els.tplReset.addEventListener("click", function () {
      els.tpl.value = DEFAULT_TEMPLATE;
      els.tplSave.click();
    });

    els.tpl.addEventListener("input", function () {
      state.template = els.tpl.value;
      renderInvites();
      els.tplNote.textContent = "есть несохранённые правки";
    });

    if (dark && dark.addEventListener) {
      dark.addEventListener("change", function () { render(true); });
    }

    document.addEventListener("visibilitychange", function () {
      if (!document.hidden) loadAll(true);
    });
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (resolve, reject) {
      try {
        var ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        var ok = document.execCommand("copy");
        document.body.removeChild(ta);
        ok ? resolve() : reject(new Error("copy failed"));
      } catch (err) { reject(err); }
    });
  }

  /* ---------------- Старт ---------------- */

  function init() {
    els = {
      setup: $("setup"), main: $("main"), summary: $("summary"), tabs: $("tabs"),
      search: $("search"), addToggle: $("addToggle"), addBox: $("addBox"), rows: $("rows"),
      tpl: $("tpl"), tplSave: $("tplSave"), tplReset: $("tplReset"), tplNote: $("tplNote"),
      invites: $("invites"), invHint: $("invHint"), sync: $("sync"), syncText: $("syncText")
    };

    if (!CFG.projectId || !CFG.apiKey) {
      setSync("error", "база не подключена");
      showSetup("empty");
      return;
    }

    els.tpl.value = DEFAULT_TEMPLATE;
    bind();
    setSync("saving", "загружаем…");
    loadAll(false);

    setInterval(function () {
      if (document.hidden || isEditing() || state.pending > 0) return;
      loadAll(true);
    }, 5000);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
