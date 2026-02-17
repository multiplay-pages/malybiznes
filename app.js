// Dane (zgodne ze screenami)
const TARYFY_24 = [
  ["do 100/50 Mb/s", "70 zł", "90 zł"],
  ["do 350/175 Mb/s", "70 zł", "90 zł"],
  ["do 500/200 Mb/s", "80 zł", "100 zł"],
  ["do 600/300 Mb/s", "80 zł", "100 zł"],
  ["do 800/400 Mb/s", "85 zł", "105 zł"],
  ["do 1000/500 Mb/s", "90 zł", "110 zł"],
  ["do 2000/1000 Mb/s", "135 zł", "155 zł"],
];

const TARYFY_12 = [
  ["do 100/50 Mb/s", "80 zł", "90 zł"],
  ["do 350/175 Mb/s", "80 zł", "90 zł"],
  ["do 500/200 Mb/s", "90 zł", "100 zł"],
  ["do 600/300 Mb/s", "90 zł", "100 zł"],
  ["do 800/400 Mb/s", "95 zł", "105 zł"],
  ["do 1000/500 Mb/s", "100 zł", "110 zł"],
  ["do 2000/1000 Mb/s", "145 zł", "155 zł"],
];

const TELEFON = [
  ["Telefon 60 minut", "10 zł", "Połączenia na stacjonarne i komórkowe w Polsce oraz stacjonarne w UE"],
  ["Telefon 300 minut", "15 zł", "Połączenia na stacjonarne i komórkowe w Polsce oraz stacjonarne w UE"],
  ["Telefon No-Limit", "20 zł", "Połączenia na stacjonarne i komórkowe w Polsce oraz stacjonarne w UE"],
];

const BEZPIECZENSTWO = [
  ["📱 Bitdefender Mobile", "Telefon służbowy", "6 zł"],
  ["💻 Bitdefender 1 PC/macOS", "1 stanowisko pracy", "9 zł"],
  ["🖥️ Bitdefender 3 PC/macOS", "Małe biuro (2–3 urządzenia)", "15 zł"],
  ["👨‍👩‍👧‍👦 Bitdefender Family", "Wiele urządzeń (biuro + dom)", "20 zł"],
];

function renderPricingTable(el, headColorClass, rows) {
  el.innerHTML = `
    <thead>
      <tr>
        <th class="${headColorClass}">Taryfa</th>
        <th class="${headColorClass}" style="text-align:center">W trakcie</th>
        <th class="${headColorClass}" style="text-align:center">Po przejściu</th>
      </tr>
    </thead>
    <tbody>
      ${rows.map(r => `
        <tr>
          <td>${r[0]}</td>
          <td>${r[1]}</td>
          <td style="text-align:center">${r[2]}</td>
        </tr>
      `).join("")}
    </tbody>
  `;
}

function renderPhoneTable(el, rows) {
  el.innerHTML = `
    <thead>
      <tr>
        <th>Dodatek</th>
        <th style="text-align:center">Cena NETTO/mies.</th>
        <th>Dostępność</th>
      </tr>
    </thead>
    <tbody>
      ${rows.map(r => `
        <tr>
          <td><strong>${r[0]}</strong></td>
          <td>${r[1]}</td>
          <td>${r[2]}</td>
        </tr>
      `).join("")}
    </tbody>
  `;
}

function renderSecurityTable(el, rows) {
  el.innerHTML = `
    <thead>
      <tr>
        <th>Pakiet</th>
        <th>Dla kogo</th>
        <th style="text-align:right">Cena NETTO/mies.</th>
      </tr>
    </thead>
    <tbody>
      ${rows.map(r => `
        <tr>
          <td><strong>${r[0]}</strong></td>
          <td>${r[1]}</td>
          <td>${r[2]}</td>
        </tr>
      `).join("")}
    </tbody>
  `;
}

// Smooth scroll + aktywny pill
function setupNav() {
  const nav = document.getElementById("pillnav");
  const pills = Array.from(nav.querySelectorAll(".pill"));

  // smooth scroll
  pills.forEach(p => {
    p.addEventListener("click", (e) => {
      const href = p.getAttribute("href");
      if (!href?.startsWith("#")) return;
      e.preventDefault();
      const target = document.querySelector(href);
      if (!target) return;
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      history.replaceState(null, "", href);
    });
  });

  // active on scroll (IntersectionObserver)
  const sections = pills
    .map(p => document.getElementById(p.dataset.section))
    .filter(Boolean);

  const obs = new IntersectionObserver((entries) => {
    // wybierz najbardziej "widoczną" sekcję
    const visible = entries
      .filter(e => e.isIntersecting)
      .sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visible) return;
    const id = visible.target.id;

    pills.forEach(p => p.classList.toggle("is-active", p.dataset.section === id));
  }, { rootMargin: "-25% 0px -60% 0px", threshold: [0.12, 0.2, 0.35] });

  sections.forEach(s => obs.observe(s));
}

(function init(){
  renderPricingTable(document.getElementById("table24"), "h24", TARYFY_24);
  renderPricingTable(document.getElementById("table12"), "h12", TARYFY_12);
  renderPhoneTable(document.getElementById("tablePhone"), TELEFON);
  renderSecurityTable(document.getElementById("tableSecurity"), BEZPIECZENSTWO);

  setupNav();
})();
