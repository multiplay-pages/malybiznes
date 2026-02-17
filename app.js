const VAT = 0.23;

const data = {
  plans: [
    // UZUPEŁNIJ realnymi danymi (u Ciebie część już jest w obecnej stronie)
    // przykład:
    { id: "100", label: "100 Mb/s", price24: 49, price12: 59, note: "Netto / m-c" },
    { id: "600", label: "600 Mb/s", price24: 69, price12: 79, note: "Netto / m-c" },
    { id: "1000", label: "1000 Mb/s", price24: 89, price12: 99, note: "Netto / m-c" }
  ],
  addons: {
    phone: [
      { id: "tel60", label: "60 min (PL/UE)", price: 10 },
      { id: "tel300", label: "300 min (PL/UE)", price: 15 },
      { id: "telnolimit", label: "No-Limit (PL)", price: 20 }
    ],
    infra: [
      { id: "ip", label: "Stały adres IP", price: 20 },
      { id: "mesh", label: "WiFi Premium (Mesh)", price: 10 },
      { id: "install", label: "Instalacja Std.", price: 200, oneTime: true }
    ],
    sec: [
      { id: "bdmob", label: "Bitdefender Mobile", price: 6 },
      { id: "bd1", label: "Bitdefender 1 PC", price: 9 },
      { id: "bd3", label: "Bitdefender 3 PC", price: 15 }
    ]
  }
};

let state = {
  term: 24,
  planId: null,
  addons: new Set()
};

const els = {
  btn24: document.getElementById("btn24"),
  btn12: document.getElementById("btn12"),
  plans: document.getElementById("plans"),
  addonsPhone: document.getElementById("addonsPhone"),
  addonsInfra: document.getElementById("addonsInfra"),
  addonsSec: document.getElementById("addonsSec"),
  summaryLines: document.getElementById("summaryLines"),
  totalNet: document.getElementById("totalNet"),
  totalGross: document.getElementById("totalGross"),
  copySummary: document.getElementById("copySummary")
};

function fmtPLN(v){
  return `${Math.round(v * 100) / 100} zł`;
}

function getSelectedPlan(){
  return data.plans.find(p => p.id === state.planId) || null;
}

function addonById(id){
  const all = [...data.addons.phone, ...data.addons.infra, ...data.addons.sec];
  return all.find(a => a.id === id) || null;
}

function monthlyNet(){
  const plan = getSelectedPlan();
  let sum = 0;
  if (plan){
    sum += (state.term === 24 ? plan.price24 : plan.price12);
  }

  for (const id of state.addons){
    const a = addonById(id);
    if (!a) continue;
    if (a.oneTime) continue; // jednorazówki nie wliczamy do miesięcznego
    sum += a.price;
  }
  return sum;
}

function oneTimeNet(){
  let sum = 0;
  for (const id of state.addons){
    const a = addonById(id);
    if (a?.oneTime) sum += a.price;
  }
  return sum;
}

function renderPlans(){
  els.plans.innerHTML = "";
  data.plans.forEach(p => {
    const price = state.term === 24 ? p.price24 : p.price12;
    const div = document.createElement("div");
    div.className = "card plan" + (state.planId === p.id ? " is-selected" : "");
    div.innerHTML = `
      <div class="plan__speed">${p.label}</div>
      <div class="plan__price">${fmtPLN(price)}</div>
      <div class="plan__meta">${p.note || "Netto / m-c"}</div>
    `;
    div.addEventListener("click", () => {
      state.planId = p.id;
      renderAll();
    });
    els.plans.appendChild(div);
  });
}

function renderAddonList(targetEl, items){
  targetEl.innerHTML = "";
  items.forEach(a => {
    const row = document.createElement("div");
    row.className = "item";
    const checked = state.addons.has(a.id) ? "checked" : "";
    const priceLabel = a.oneTime ? `${fmtPLN(a.price)} (jednorazowo)` : fmtPLN(a.price);
    row.innerHTML = `
      <label>
        <input type="checkbox" data-id="${a.id}" ${checked}/>
        <span>${a.label}</span>
      </label>
      <div class="item__price">${priceLabel}</div>
    `;
    row.querySelector("input").addEventListener("change", (e) => {
      const id = e.target.getAttribute("data-id");
      if (e.target.checked) state.addons.add(id);
      else state.addons.delete(id);
      renderSummary();
    });
    targetEl.appendChild(row);
  });
}

function renderSummary(){
  els.summaryLines.innerHTML = "";

  const plan = getSelectedPlan();
  if (plan){
    const price = state.term === 24 ? plan.price24 : plan.price12;
    addLine(`Internet: ${plan.label} (umowa ${state.term} m-cy)`, fmtPLN(price));
  } else {
    addLine(`Internet`, `— wybierz taryfę`);
  }

  // dodatki
  const monthly = [];
  const oneTime = [];
  for (const id of state.addons){
    const a = addonById(id);
    if (!a) continue;
    (a.oneTime ? oneTime : monthly).push(a);
  }

  monthly.sort((x,y) => x.price - y.price).forEach(a => addLine(a.label, fmtPLN(a.price)));
  oneTime.sort((x,y) => x.price - y.price).forEach(a => addLine(`${a.label} (jednorazowo)`, fmtPLN(a.price)));

  const mNet = monthlyNet();
  const mGross = mNet * (1 + VAT);

  els.totalNet.textContent = fmtPLN(mNet);
  els.totalGross.textContent = fmtPLN(mGross);

  // dopis jednorazówki jeśli są
  const ot = oneTimeNet();
  if (ot > 0){
    const hint = document.createElement("div");
    hint.className = "tiny muted";
    hint.style.marginTop = "10px";
    hint.textContent = `Jednorazowo (netto): ${fmtPLN(ot)} • brutto: ${fmtPLN(ot * (1 + VAT))}`;
    els.summaryLines.appendChild(hint);
  }
}

function addLine(left, right){
  const div = document.createElement("div");
  div.className = "line";
  div.innerHTML = `<div>${left}</div><div><strong>${right}</strong></div>`;
  els.summaryLines.appendChild(div);
}

function setTerm(term){
  state.term = term;
  els.btn24.classList.toggle("is-active", term === 24);
  els.btn12.classList.toggle("is-active", term === 12);
  renderAll();
}

function copySummaryToClipboard(){
  const plan = getSelectedPlan();
  const lines = [];
  lines.push(`Oferta Biznes 3.1 — podsumowanie (netto)`);
  lines.push(`Umowa: ${state.term} m-cy`);
  if (plan){
    const price = state.term === 24 ? plan.price24 : plan.price12;
    lines.push(`Internet: ${plan.label} — ${fmtPLN(price)} / m-c`);
  } else {
    lines.push(`Internet: (nie wybrano taryfy)`);
  }

  for (const id of state.addons){
    const a = addonById(id);
    if (!a) continue;
    lines.push(`${a.label}${a.oneTime ? " (jednorazowo)" : ""}: ${fmtPLN(a.price)}`);
  }

  lines.push(`Miesięcznie netto: ${fmtPLN(monthlyNet())}`);
  lines.push(`Miesięcznie brutto: ${fmtPLN(monthlyNet() * (1 + VAT))}`);
  const ot = oneTimeNet();
  if (ot > 0){
    lines.push(`Jednorazowo netto: ${fmtPLN(ot)}`);
    lines.push(`Jednorazowo brutto: ${fmtPLN(ot * (1 + VAT))}`);
  }

  navigator.clipboard.writeText(lines.join("\n")).catch(() => {});
}

function renderAll(){
  renderPlans();
  renderAddonList(els.addonsPhone, data.addons.phone);
  renderAddonList(els.addonsInfra, data.addons.infra);
  renderAddonList(els.addonsSec, data.addons.sec);
  renderSummary();
}

// events
els.btn24.addEventListener("click", () => setTerm(24));
els.btn12.addEventListener("click", () => setTerm(12));
els.copySummary.addEventListener("click", copySummaryToClipboard);

// init
setTerm(24);
