/* The Opportunities Directory — filtering, sorting, rendering. No dependencies. */
(function () {
  "use strict";

  const state = {
    q: "",
    status: "actionable", // actionable | closing-soon | closed | all
    region: "",
    profiles: new Set(),
    type: "",
    sort: "deadline",
    expanded: new Set(),
  };

  let DATA = null;

  const $ = (sel) => document.querySelector(sel);
  const rowsEl = $("#rows");
  const summaryEl = $("#summary");
  const emptyEl = $("#empty");

  const STATUS_LABEL = {
    open: "Open",
    "closing-soon": "Closing soon",
    closed: "Closed",
    rolling: "Rolling",
    upcoming: "Upcoming",
    unverified: "Unverified",
  };
  const ACTIONABLE = new Set(["open", "closing-soon", "rolling", "upcoming"]);

  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function fmtDate(iso) {
    const [y, m, d] = iso.split("-").map(Number);
    return y === 2026 ? `${d} ${MONTHS[m - 1]}` : `${d} ${MONTHS[m - 1]} ${y}`;
  }

  /* Profile tags derived from the eligibility text once, at load */
  function deriveTags(o) {
    const hay = (o.name + " " + o.eligibility.join(" ")).toLowerCase();
    const tags = new Set();
    if (/\bwom[ae]n\b|female|girls?\b|\bher\b|mums\b/.test(hay)) tags.add("women");
    if (/aged \d|18–|–35|–30|–24|–28|youth|young /.test(hay)) tags.add("youth");
    if (/student|undergraduate|graduate|university|phd|master/.test(hay)) tags.add("student");
    if (o.country === "Nigeria" || /nigeria/.test(hay)) tags.add("nigeria");
    return tags;
  }

  function matches(o) {
    if (state.status === "actionable" && !ACTIONABLE.has(o.status)) return false;
    if (state.status === "closing-soon" && o.status !== "closing-soon") return false;
    if (state.status === "closed" && o.status !== "closed") return false;
    if (state.region) {
      if (state.region === "Middle East") {
        if (!o.regions.includes("Middle East")) return false;
      } else if (!o.regions.includes(state.region)) return false;
    }
    if (state.type && o.type !== state.type) return false;
    for (const p of state.profiles) if (!o._tags.has(p)) return false;
    if (state.q) {
      const hay = (o.name + " " + o.benefits + " " + o.eligibility.join(" ") + " " + (o.note || "") + " " + (o.type || "")).toLowerCase();
      for (const word of state.q.toLowerCase().split(/\s+/)) {
        if (word && !hay.includes(word)) return false;
      }
    }
    return true;
  }

  const STATUS_RANK = { "closing-soon": 0, open: 1, rolling: 2, upcoming: 3, unverified: 4, closed: 5 };
  function compare(a, b) {
    if (state.sort === "name") return a.name.localeCompare(b.name);
    const r = STATUS_RANK[a.status] - STATUS_RANK[b.status];
    if (r !== 0) return r;
    if (a.status === "closed") {
      // most recently closed first — the "you just missed it / next cycle" shelf
      return (b.deadline || "0").localeCompare(a.deadline || "0");
    }
    if (a.deadline && b.deadline) return a.deadline.localeCompare(b.deadline);
    if (a.deadline) return -1;
    if (b.deadline) return 1;
    return a.name.localeCompare(b.name);
  }

  function deadlineCell(o) {
    if (o.status === "closed") {
      return `<span class="dl none"><span class="dl-days">Closed</span><span class="dl-date">${o.deadline ? fmtDate(o.deadline) : "date n/a"}</span></span>`;
    }
    if (o.deadline) {
      const cls = o.status === "closing-soon" ? "urgent" : "open-dl";
      const days = o.daysLeft === 1 ? "1 day" : `${o.daysLeft} days`;
      return `<span class="dl ${cls}"><span class="dl-days">${days}</span><span class="dl-date">closes ${fmtDate(o.deadline)}</span></span>`;
    }
    const word = o.status === "rolling" ? "Rolling" : o.status === "upcoming" ? "Opens later" : "No date";
    return `<span class="dl none"><span class="dl-days">${word}</span><span class="dl-date">${o.status === "unverified" ? "unconfirmed" : "check page"}</span></span>`;
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  }

  function rowHTML(o) {
    const region = o.country ? `${o.regions.join(" / ")} · ${o.country}` : o.regions.join(" / ");
    // suppress the amount when the benefits line already carries the same figure
    const norm = (s) => String(s).toLowerCase().replace(/[\s,]/g, "");
    const firstNum = o.amount && (o.amount.match(/\d[\d,.]*/) || [])[0];
    const dupAmount = firstNum && norm(o.benefits).includes(firstNum.replace(/,/g, ""));
    const amount = o.amount && !dupAmount ? `<span class="amount">${esc(o.amount)}</span> · ` : "";
    const expanded = state.expanded.has(o.id);
    const eligItems = o.eligibility.length
      ? o.eligibility.map((e) => `<li>${esc(e)}</li>`).join("")
      : "<li>No published criteria found — check the official page.</li>";
    const noteCls = o.status === "unverified" ? "detail-note caution" : "detail-note";
    const linkLabel = o.status === "closed" ? "Official page" : "Apply / official page";
    const link = o.url
      ? `<a class="btn-apply ${o.status === "closed" ? "secondary" : ""}" href="${esc(o.url)}" target="_blank" rel="noopener">${linkLabel} ↗</a>`
      : `<p class="detail-note caution">No reliable link — the PDF's link was broken for this entry.</p>`;

    return `<li class="row ${expanded ? "expanded" : ""}" data-id="${o.id}">
      <div class="row-head" role="button" tabindex="0" aria-expanded="${expanded}" aria-label="${esc(o.name)} — ${STATUS_LABEL[o.status]}">
        ${deadlineCell(o)}
        <div class="row-main">
          <h2 class="row-name">${esc(o.name)}</h2>
          <p class="row-meta">${amount}${esc(o.benefits)}</p>
          <div class="row-tags"><span class="tag">${esc(region)}</span>${o.type ? `<span class="tag">${esc(o.type)}</span>` : ""}</div>
        </div>
        <div class="row-side">
          <span class="badge ${o.status}">${STATUS_LABEL[o.status]}</span>
          <button class="disclose" tabindex="-1" aria-hidden="true">${expanded ? "Hide" : "Who qualifies"}</button>
        </div>
      </div>
      <div class="row-detail">
        <div class="detail-cols">
          <div>
            <h3 class="detail-h">Who qualifies</h3>
            <ul class="elig">${eligItems}</ul>
          </div>
          <div>
            ${o.note ? `<h3 class="detail-h">Worth knowing</h3><p class="${noteCls}">${esc(o.note)}</p>` : ""}
            ${link}
          </div>
        </div>
      </div>
    </li>`;
  }

  function render() {
    const shown = DATA.opportunities.filter(matches).sort(compare);
    rowsEl.innerHTML = shown.map(rowHTML).join("");
    emptyEl.hidden = shown.length > 0;

    const closingSoon = shown.filter((o) => o.status === "closing-soon").length;
    const parts = [`Showing <strong>${shown.length}</strong> of <strong>${DATA.opportunities.length}</strong>`];
    if (state.sort === "deadline") parts.push("sorted by soonest deadline");
    if (closingSoon) parts.push(`<span class="alert">${closingSoon} close within 3 weeks</span>`);
    summaryEl.innerHTML = parts.join(" · ");
  }

  function setChip(facet, value, btn) {
    if (facet === "profile") {
      const on = btn.getAttribute("aria-pressed") === "true";
      btn.setAttribute("aria-pressed", String(!on));
      if (on) state.profiles.delete(value);
      else state.profiles.add(value);
    } else {
      document.querySelectorAll(`.chip[data-facet="${facet}"]`).forEach((b) => b.setAttribute("aria-pressed", "false"));
      btn.setAttribute("aria-pressed", "true");
      if (facet === "status") state.status = value;
      if (facet === "region") state.region = value;
    }
    render();
  }

  function resetFilters() {
    state.q = "";
    state.status = "all";
    state.region = "";
    state.type = "";
    state.profiles.clear();
    $("#q").value = "";
    $("#type").value = "";
    document.querySelectorAll(".chip").forEach((b) => b.setAttribute("aria-pressed", "false"));
    document.querySelector('.chip[data-facet="status"][data-value="all"]').setAttribute("aria-pressed", "true");
    document.querySelector('.chip[data-facet="region"][data-value=""]').setAttribute("aria-pressed", "true");
    render();
  }

  function init(data) {
    DATA = data;
    DATA.opportunities.forEach((o) => (o._tags = deriveTags(o)));

    const actionable = DATA.opportunities.filter((o) => ACTIONABLE.has(o.status)).length;
    const closed = DATA.opportunities.filter((o) => o.status === "closed").length;
    $("#headline-count").textContent = `Of the ${DATA.opportunities.length} opportunities in the viral PDF, ${closed} have already closed — these ${actionable} are still worth your time.`;

    const types = [...new Set(DATA.opportunities.map((o) => o.type).filter(Boolean))].sort();
    const typeSel = $("#type");
    for (const t of types) {
      const opt = document.createElement("option");
      opt.value = t;
      opt.textContent = t[0].toUpperCase() + t.slice(1) + "s";
      typeSel.appendChild(opt);
    }

    // events
    $("#q").addEventListener("input", (e) => { state.q = e.target.value.trim(); render(); });
    typeSel.addEventListener("change", (e) => { state.type = e.target.value; render(); });
    $("#sort").addEventListener("change", (e) => { state.sort = e.target.value; render(); });
    $("#reset").addEventListener("click", resetFilters);

    document.querySelectorAll(".chip").forEach((btn) => {
      btn.addEventListener("click", () => setChip(btn.dataset.facet, btn.dataset.value, btn));
    });

    rowsEl.addEventListener("click", (e) => {
      const head = e.target.closest(".row-head");
      if (!head || e.target.closest("a")) return;
      toggleRow(head.parentElement);
    });
    rowsEl.addEventListener("keydown", (e) => {
      if ((e.key === "Enter" || e.key === " ") && e.target.classList.contains("row-head")) {
        e.preventDefault();
        toggleRow(e.target.parentElement);
      }
    });

    render();
  }

  function toggleRow(row) {
    const id = Number(row.dataset.id);
    if (state.expanded.has(id)) state.expanded.delete(id);
    else state.expanded.add(id);
    const on = state.expanded.has(id);
    row.classList.toggle("expanded", on);
    const head = row.querySelector(".row-head");
    head.setAttribute("aria-expanded", String(on));
    row.querySelector(".disclose").textContent = on ? "Hide" : "Who qualifies";
  }

  // Data is inlined (artifact build) or fetched (site build)
  if (window.__DATA__) init(window.__DATA__);
  else fetch("data.json").then((r) => r.json()).then(init);
})();
