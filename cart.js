/* Conquer Northwest Coffee — multi-item cart (sandbox build).
 *
 * Drop-in: include cart.css in <head> and this file before </body>.
 * The existing Stripe Payment Link "Order Now" buttons are untouched —
 * the cart is purely additive.
 *
 * SANDBOX NOTE: PRICE below holds the LIVE Stripe price IDs. For sandbox
 * testing, replace them with your Stripe TEST-mode price IDs (see
 * CLOUDFLARE_SETUP.md). The worker validates against the same list —
 * keep both in sync.
 */
(function () {
  "use strict";

  /* ── Config ── */
  // Override in the page with a script tag placed before this file loads:
  //   window.CNWC_WORKER_URL = "https://your-worker.workers.dev";
  var WORKER_URL = window.CNWC_WORKER_URL || "https://conquer-northwest-coffee.ryan-4a9.workers.dev";

  var PRICE = {
    "deep-forest":   { wb: "price_1TeLFQ0tRXn0cY2xXZM3nwbm", ground: "price_1TjhTw0tRXn0cY2xFgXCEXuo" },
    "rocky-mountain":{ wb: "price_1TeLJn0tRXn0cY2xFmyYs7DN", ground: "price_1TjhSC0tRXn0cY2xTa2grPcT" },
    "coastal":       { wb: "price_1TeLKL0tRXn0cY2xUWWOqxTo", ground: "price_1TjhRI0tRXn0cY2xeKowAumd" },
    "i5":            { wb: "price_1TeLJF0tRXn0cY2x38jteibL", ground: "price_1TjhTS0tRXn0cY2xxjWZtxL1" }
  };
  var BLEND_NAME = {
    "deep-forest": "Deep Forest Blend",
    "rocky-mountain": "Rocky Mountain Blend",
    "coastal": "Coastal Blend",
    "i5": "I5 Blend"
  };
  var GRIND_LABEL = { wb: "Whole Bean", ground: "Ground" };
  var UNIT_CENTS = 1600;
  var LS_KEY = "cnwc_cart_v1";

  /* ── State ── */
  function loadCart() {
    try {
      var raw = localStorage.getItem(LS_KEY);
      if (!raw) return {};
      var c = JSON.parse(raw);
      return (c && typeof c === "object") ? c : {};
    } catch (e) { return {}; }
  }
  function saveCart(cart) {
    try { localStorage.setItem(LS_KEY, JSON.stringify(cart)); } catch (e) {}
  }
  // cart shape: { "deep-forest:wb": 2, "coastal:ground": 1 }
  function cartCount(cart) {
    var n = 0;
    Object.keys(cart).forEach(function (k) { n += cart[k] | 0; });
    return n;
  }
  function cartSubtotalCents(cart) {
    var t = 0;
    Object.keys(cart).forEach(function (k) { t += (cart[k] | 0) * UNIT_CENTS; });
    return t;
  }
  function fmt(cents) { return "$" + (cents / 100).toFixed(2); }

  function addToCart(blend, grind, qty) {
    if (!PRICE[blend] || !PRICE[blend][grind]) return false;
    var cart = loadCart();
    var key = blend + ":" + grind;
    cart[key] = Math.min(99, (cart[key] | 0) + (qty | 0 || 1));
    saveCart(cart);
    render();
    return true;
  }
  function setQty(key, qty) {
    var cart = loadCart();
    if (qty <= 0) { delete cart[key]; } else { cart[key] = Math.min(99, qty | 0); }
    saveCart(cart);
    render();
  }

  /* ── Checkout ── */
  function checkout() {
    var cart = loadCart();
    var keys = Object.keys(cart).filter(function (k) { return cart[k] > 0; });
    var btn = document.getElementById("cnwc-checkout-btn");
    var errBox = document.getElementById("cnwc-error");
    function showErr(msg) {
      if (errBox) { errBox.textContent = msg; errBox.style.display = "block"; }
      if (btn) btn.disabled = false;
    }
    if (errBox) errBox.style.display = "none";
    if (!keys.length) { showErr("Your cart is empty."); return; }
    if (!WORKER_URL) { showErr("Checkout isn't connected yet — please try the regular order buttons."); return; }
    if (btn) btn.disabled = true;

    var items = keys.map(function (k) {
      var parts = k.split(":");
      return { price_id: PRICE[parts[0]][parts[1]], quantity: cart[k] | 0 };
    });

    fetch(WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: items })
    })
      .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, data: d }; }); })
      .then(function (res) {
        if (res.ok && res.data && res.data.url) {
          window.location.href = res.data.url;
        } else {
          showErr((res.data && res.data.error) || "Checkout failed — please try again.");
        }
      })
      .catch(function () { showErr("Couldn't reach checkout — check your connection and try again."); });
  }

  /* ── Drawer UI ── */
  var BAG_SVG = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>';

  function injectChrome() {
    // Overlay + drawer
    var overlay = document.createElement("div");
    overlay.className = "cnwc-overlay";
    overlay.id = "cnwc-overlay";
    var drawer = document.createElement("aside");
    drawer.className = "cnwc-drawer";
    drawer.id = "cnwc-drawer";
    drawer.setAttribute("aria-label", "Shopping cart");
    drawer.innerHTML =
      '<div class="cnwc-drawer-head"><h2>Your Cart</h2>' +
      '<button class="cnwc-close" id="cnwc-close" aria-label="Close cart">&times;</button></div>' +
      '<div class="cnwc-items" id="cnwc-items"></div>' +
      '<div class="cnwc-foot">' +
        '<p class="cnwc-error" id="cnwc-error" style="display:none"></p>' +
        '<div class="cnwc-subtotal"><span>Subtotal</span><strong id="cnwc-subtotal">$0.00</strong></div>' +
        '<p class="cnwc-ship-note">Shipping calculated at checkout.</p>' +
        '<button class="cnwc-checkout" id="cnwc-checkout-btn">Checkout</button>' +
        '<button class="cnwc-continue" id="cnwc-continue">Continue shopping</button>' +
      '</div>';
    document.body.appendChild(overlay);
    document.body.appendChild(drawer);

    // Nav cart button (insert before hamburger so it shows on all sizes)
    var nav = document.querySelector(".nav");
    var burger = document.querySelector(".nav-hamburger");
    if (nav) {
      var btn = document.createElement("button");
      btn.className = "cnwc-cart-btn";
      btn.id = "cnwc-cart-btn";
      btn.setAttribute("aria-label", "Open cart");
      btn.innerHTML = BAG_SVG + '<span class="cnwc-cart-count is-zero" id="cnwc-cart-count">0</span>';
      if (burger && burger.parentNode === nav) nav.insertBefore(btn, burger);
      else nav.appendChild(btn);
      btn.addEventListener("click", openDrawer);
    }

    document.getElementById("cnwc-close").addEventListener("click", closeDrawer);
    document.getElementById("cnwc-continue").addEventListener("click", closeDrawer);
    overlay.addEventListener("click", closeDrawer);
    document.getElementById("cnwc-checkout-btn").addEventListener("click", checkout);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeDrawer(); });
  }

  function openDrawer() {
    document.getElementById("cnwc-drawer").classList.add("open");
    document.getElementById("cnwc-overlay").classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function closeDrawer() {
    var d = document.getElementById("cnwc-drawer");
    if (!d) return;
    d.classList.remove("open");
    document.getElementById("cnwc-overlay").classList.remove("open");
    document.body.style.overflow = "";
  }

  function render() {
    var cart = loadCart();
    var itemsEl = document.getElementById("cnwc-items");
    var countEl = document.getElementById("cnwc-cart-count");
    if (!itemsEl) return;
    var keys = Object.keys(cart).filter(function (k) { return cart[k] > 0; });

    var n = cartCount(cart);
    if (countEl) {
      countEl.textContent = n;
      countEl.classList.toggle("is-zero", n === 0);
    }

    if (!keys.length) {
      itemsEl.innerHTML = '<p class="cnwc-empty">Your cart is empty.<br>Pick a blend and add a bag or two.</p>';
    } else {
      itemsEl.innerHTML = keys.map(function (k) {
        var parts = k.split(":");
        var qty = cart[k] | 0;
        return '<div class="cnwc-item" data-key="' + k + '">' +
          '<span class="cnwc-item-name">' + BLEND_NAME[parts[0]] + '</span>' +
          '<span class="cnwc-item-price">' + fmt(qty * UNIT_CENTS) + '</span>' +
          '<span class="cnwc-item-grind">' + GRIND_LABEL[parts[1]] + ' · 12 oz</span>' +
          '<div class="cnwc-qty">' +
            '<button data-act="dec" aria-label="Decrease quantity">−</button>' +
            '<span>' + qty + '</span>' +
            '<button data-act="inc" aria-label="Increase quantity">+</button>' +
            '<button class="cnwc-remove" data-act="rm">remove</button>' +
          '</div>' +
        '</div>';
      }).join("");
    }
    document.getElementById("cnwc-subtotal").textContent = fmt(cartSubtotalCents(cart));

    // Delegate stepper clicks
    itemsEl.onclick = function (e) {
      var b = e.target.closest("button");
      if (!b) return;
      var item = e.target.closest(".cnwc-item");
      if (!item) return;
      var key = item.getAttribute("data-key");
      var cur = loadCart()[key] | 0;
      if (b.getAttribute("data-act") === "inc") setQty(key, cur + 1);
      else if (b.getAttribute("data-act") === "dec") setQty(key, cur - 1);
      else if (b.getAttribute("data-act") === "rm") setQty(key, 0);
    };
  }

  /* ── Page integrations ── */
  function blendFromPath() {
    var p = (location.pathname.split("/").pop() || "").toLowerCase();
    if (p.indexOf("deep-forest") === 0) return "deep-forest";
    if (p.indexOf("rocky-mountain") === 0) return "rocky-mountain";
    if (p.indexOf("coastal") === 0) return "coastal";
    if (p === "i5.html" || p.indexOf("i5") === 0) return "i5";
    return null;
  }

  function wireBlendPage() {
    var blend = blendFromPath();
    var purchaseBlock = document.querySelector(".purchase-block");
    var orderBtn = document.getElementById("order-btn");
    if (!blend || !purchaseBlock || !orderBtn) return;

    var btn = document.createElement("button");
    btn.className = "cnwc-add-btn";
    btn.type = "button";
    btn.innerHTML = "Add to Cart";
    orderBtn.insertAdjacentElement("afterend", btn);

    btn.addEventListener("click", function () {
      // The active variant button determines grind: first = whole bean, second = ground.
      var opts = Array.prototype.slice.call(document.querySelectorAll(".variant-btn"));
      var idx = 0;
      opts.forEach(function (b, i) { if (b.classList.contains("active")) idx = i; });
      var grind = idx === 1 ? "ground" : "wb";
      if (addToCart(blend, grind, 1)) {
        btn.classList.add("added");
        var label = GRIND_LABEL[grind];
        btn.textContent = "Added — " + BLEND_NAME[blend] + " (" + label + ")";
        setTimeout(function () {
          btn.classList.remove("added");
          btn.textContent = "Add to Cart";
        }, 1800);
        openDrawer();
      }
    });
  }

  function wireShopPage() {
    var cards = document.querySelectorAll(".product-card");
    if (!cards.length) return;
    cards.forEach(function (card) {
      var link = card.querySelector('a[href$=".html"]');
      if (!link) return;
      var blend = null;
      var href = (link.getAttribute("href") || "").toLowerCase();
      if (href.indexOf("deep-forest") === 0) blend = "deep-forest";
      else if (href.indexOf("rocky-mountain") === 0) blend = "rocky-mountain";
      else if (href.indexOf("coastal") === 0) blend = "coastal";
      else if (href.indexOf("i5") === 0) blend = "i5";
      if (!blend) return;

      var row = document.createElement("div");
      row.className = "cnwc-quick-add";
      row.innerHTML =
        '<button type="button" data-grind="wb">Whole Bean +</button>' +
        '<button type="button" data-grind="ground">Ground +</button>';
      var footer = card.querySelector(".product-footer");
      (footer || card).appendChild(row);

      row.addEventListener("click", function (e) {
        var b = e.target.closest("button");
        if (!b) return;
        addToCart(blend, b.getAttribute("data-grind"), 1);
        var orig = b.textContent;
        b.textContent = "Added ✓";
        setTimeout(function () { b.textContent = orig; }, 1200);
      });
    });
  }

  /* ── Boot ── */
  document.addEventListener("DOMContentLoaded", function () {
    injectChrome();
    wireBlendPage();
    wireShopPage();
    render();
  });

  // Exposed for tests only.
  window.__cnwc_cart = { load: loadCart, price: PRICE, LS_KEY: LS_KEY };
})();
