(function () {
  const KEY = "jogazone-cookie-consent";
  const depth = location.pathname.split("/").filter(Boolean).length;
  const prefix = depth > 1 ? "../../" : "";

  function setConsent(value) {
    localStorage.setItem(KEY, value);
    const banner = document.querySelector(".cookie-banner");
    if (banner) banner.remove();
    if (value === "accepted") {
      window.dispatchEvent(new CustomEvent("jogazone-consent-accepted"));
    }
  }

  function createBanner() {
    const banner = document.createElement("div");
    banner.className = "cookie-banner";
    banner.innerHTML = `
      <p>Usamos cookies para melhorar a tua experiência e, com o teu consentimento, mostrar anúncios. Consulta a <a href="${prefix}privacidade.html">Política de Privacidade</a>.</p>
      <div class="cookie-banner-actions">
        <button class="btn secondary" type="button" id="cookie-reject">Rejeitar</button>
        <button class="btn" type="button" id="cookie-accept">Aceitar</button>
      </div>
    `;
    document.body.appendChild(banner);
    document.getElementById("cookie-accept").addEventListener("click", () => setConsent("accepted"));
    document.getElementById("cookie-reject").addEventListener("click", () => setConsent("rejected"));
  }

  const stored = localStorage.getItem(KEY);
  if (!stored) {
    document.addEventListener("DOMContentLoaded", createBanner);
  } else if (stored === "accepted") {
    window.dispatchEvent(new CustomEvent("jogazone-consent-accepted"));
  }
})();
