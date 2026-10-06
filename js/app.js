// React without a build step: h = React.createElement (no JSX, no Babel).
(function () {
  const { useState, useEffect, useCallback } = React;
  const h = React.createElement;
  const LANG_KEY = "tdc.lang";
  const LOCALE = { en: "en-GB", bn: "bn-BD" };

  // ---------- helpers ----------
  function loadLang() {
    try {
      const v = localStorage.getItem(LANG_KEY);
      if (v === "en" || v === "bn") return v;
    } catch (e) {}
    return (navigator.language || "").toLowerCase().startsWith("bn") ? "bn" : "en";
  }
  function saveLang(l) {
    try { localStorage.setItem(LANG_KEY, l); } catch (e) {}
  }
  function makeT(lang) {
    return function t(key, vars) {
      let s = (T[lang] && T[lang][key]) || T.en[key] || key;
      if (vars) {
        Object.keys(vars).forEach(function (k) {
          s = s.split("{" + k + "}").join(fmtNum(vars[k], lang));
        });
      }
      return s;
    };
  }
  function fmtNum(n, lang) {
    return typeof n === "number" ? new Intl.NumberFormat(LOCALE[lang]).format(n) : String(n);
  }
  // Parse "YYYY-MM-DD" as a local calendar date (no timezone shift).
  function parseISODate(s) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || "");
    return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
  }
  function fmtDate(s, lang) {
    const d = parseISODate(s);
    return d ? new Intl.DateTimeFormat(LOCALE[lang], { day: "numeric", month: "long", year: "numeric" }).format(d) : (s || "—");
  }
  function daysFromToday(s) {
    const d = parseISODate(s);
    if (!d) return null;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return Math.round((d - today) / 86400000);
  }

  // ---------- components ----------
  function Header({ t, lang, onToggle }) {
    return h("header", { className: "top" },
      h("div", { className: "brand" },
        h("h1", null, t("appName")),
        h("p", { className: "tagline" }, t("tagline"))
      ),
      h("button", {
        className: "lang-btn", onClick: onToggle,
        "aria-label": t("langSwitchAria"), lang: lang === "en" ? "bn" : "en"
      }, t("langSwitch"))
    );
  }

  function TenderCard({ t, lang, tender }) {
    const days = daysFromToday(tender.submission_deadline);
    let due = null;
    if (days !== null) {
      const cls = days < 0 ? "bad" : days <= 7 ? "warn" : "ok";
      const txt = days > 0 ? t("daysLeft", { n: days }) : days === 0 ? t("dueToday") : t("deadlinePassed", { n: -days });
      due = h("span", { className: "pill " + cls }, txt);
    }
    const row = (label, value, extra) =>
      h("div", { className: "kv" }, h("dt", null, label), h("dd", null, value, extra ? " " : null, extra));
    return h("section", { className: "card" },
      h("h2", null, t("tenderDetails")),
      h("dl", { className: "grid" },
        row(t("tenderId"), tender.tender_id),
        row(t("tenderTitle"), tender.title),
        row(t("procuringEntity"), tender.procuring_entity),
        row(t("bidder"), tender.bidder),
        row(t("deadline"), fmtDate(tender.submission_deadline, lang), due)
      )
    );
  }

  function RequirementsTable({ t, lang, requirements }) {
    if (!requirements.length) return h("section", { className: "card empty" }, t("noRequirements"));
    const reqs = requirements.slice().sort((a, b) => a.order - b.order);
    const mandatory = reqs.filter(r => r.mandatory).length;
    return h("section", { className: "card" },
      h("h2", null, t("requirements")),
      h("p", { className: "muted" }, t("reqSummary", { total: reqs.length, mandatory: mandatory, optional: reqs.length - mandatory })),
      h("div", { className: "table-wrap" },
        h("table", null,
          h("thead", null, h("tr", null,
            h("th", null, t("colNo")), h("th", null, t("colDocument")), h("th", null, t("colType")),
            h("th", null, t("colExpiry")), h("th", null, t("colStatus"))
          )),
          h("tbody", null, reqs.map(r => h("tr", { key: r.id },
            h("td", { "data-label": t("colNo") }, fmtNum(r.order, lang)),
            h("td", { "data-label": t("colDocument") }, lang === "bn" ? r.title_bn : r.title_en),
            h("td", { "data-label": t("colType") },
              h("span", { className: "pill " + (r.mandatory ? "req" : "opt") }, r.mandatory ? t("mandatory") : t("optional"))),
            h("td", { "data-label": t("colExpiry") }, r.has_expiry ? t("hasExpiry") : t("noExpiry")),
            h("td", { "data-label": t("colStatus") }, h("span", { className: "pill idle" }, t("statusNotChecked")))
          )))
        )
      )
    );
  }

  function App() {
    const [lang, setLang] = useState(loadLang);
    const [state, setState] = useState({ status: "loading", data: null });
    const t = makeT(lang);

    useEffect(() => {
      document.documentElement.lang = lang;
      document.title = T[lang].appName;
    }, [lang]);

    const load = useCallback(() => {
      setState({ status: "loading", data: null });
      fetch("data/requirements.json", { cache: "no-store" })
        .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(data => {
          if (!data || !data.tender || !Array.isArray(data.requirements)) throw new Error("shape");
          setState({ status: "ready", data: data });
        })
        .catch(() => setState({ status: "error", data: null }));
    }, []);
    useEffect(load, [load]);

    const toggle = () => { const n = lang === "en" ? "bn" : "en"; setLang(n); saveLang(n); };

    let body;
    if (state.status === "loading") body = h("p", { className: "card muted", role: "status" }, t("loading"));
    else if (state.status === "error") body = h("div", { className: "card error", role: "alert" },
      h("p", null, t("loadError")), h("button", { onClick: load }, t("retry")));
    else body = h(React.Fragment, null,
      h(TenderCard, { t, lang, tender: state.data.tender }),
      h(RequirementsTable, { t, lang, requirements: state.data.requirements })
    );

    return h("div", { className: "app" },
      h(Header, { t, lang, onToggle: toggle }),
      h("main", null, body),
      h("footer", null, h("p", null, t("footer")), h("p", { className: "muted" }, t("sampleNote")))
    );
  }

  ReactDOM.createRoot(document.getElementById("root")).render(h(App));
})();
