const PRODUCTS = [
    { id: 1, name: "Sleepy Cat", emoji: "🐱", price: 3.5, group: "kids", bg: "#ffe27a" },
    { id: 2, name: "Rainbow Cloud", emoji: "🌈", price: 3.0, group: "kids", bg: "#a9d6ff" },
    { id: 3, name: "Happy Dino", emoji: "🦖", price: 3.5, group: "kids", bg: "#a6ebd0" },
    { id: 4, name: "Strawberry Pop", emoji: "🍓", price: 3.0, group: "teens", bg: "#ffe3ee" },
    { id: 5, name: "Boba Buddy", emoji: "🧋", price: 4.0, group: "teens", bg: "#ffe27a" },
    { id: 6, name: "Pixel Heart", emoji: "💖", price: 3.5, group: "teens", bg: "#ffe3ee" },
    { id: 7, name: "Cozy Coffee", emoji: "☕", price: 4.0, group: "adults", bg: "#a9d6ff" },
    { id: 8, name: "Plant Parent", emoji: "🪴", price: 4.5, group: "adults", bg: "#a6ebd0" },
    { id: 9, name: "Moon Mood", emoji: "🌙", price: 4.5, group: "adults", bg: "#d9ccff" },
    { id: 10, name: "Space Pup", emoji: "🚀", price: 4.0, group: "kids", bg: "#d9ccff" },
    { id: 11, name: "Flower Power", emoji: "🌸", price: 3.0, group: "teens", bg: "#ffe3ee" },
    { id: 12, name: "Book Nook", emoji: "📚", price: 4.5, group: "adults", bg: "#ffe27a" }
  ];
  const LABELS = { kids: "For kids", teens: "For teens", adults: "For grown-ups" };
  
  const $ = (id) => document.getElementById(id);
  const money = (n) => "$" + n.toFixed(2);
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem("stickerbee-cart")) || []; } catch (e) { cart = []; }
  
  /* ---------- Products ---------- */
  function renderProducts(filter = "all") {
    const list = PRODUCTS.filter((p) => filter === "all" || p.group === filter);
    $("grid").innerHTML = list.map((p) => `
      <article class="card">
        <div class="card-art" style="background:${p.bg}">${p.emoji}</div>
        <span class="tag">${LABELS[p.group]}</span>
        <h3>${p.name}</h3>
        <span class="price">${money(p.price)}</span>
        <button class="btn" data-add="${p.id}">Add to cart</button>
      </article>`).join("");
  }
  
  $("filters").addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    document.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
    renderProducts(chip.dataset.f);
  });
  
  $("grid").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-add]");
    if (!btn) return;
    addToCart(Number(btn.dataset.add));
  });
  
  /* ---------- Cart ---------- */
  function save() {
    try { localStorage.setItem("stickerbee-cart", JSON.stringify(cart)); } catch (e) {}
  }
  
  function addToCart(id) {
    const item = cart.find((i) => i.id === id);
    item ? item.qty++ : cart.push({ id, qty: 1 });
    const p = PRODUCTS.find((x) => x.id === id);
    renderCart();
    toast(`${p.name} added to your cart`);
    const b = document.querySelector(".cart-btn");
    b.classList.remove("bump");
    void b.offsetWidth;
    b.classList.add("bump");
  }
  
  function changeQty(id, delta) {
    const item = cart.find((i) => i.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) cart = cart.filter((i) => i.id !== id);
    renderCart();
  }
  
  function renderCart() {
    const count = cart.reduce((s, i) => s + i.qty, 0);
    const total = cart.reduce((s, i) => s + i.qty * PRODUCTS.find((p) => p.id === i.id).price, 0);
    $("cartCount").textContent = count;
    $("cartTotal").textContent = money(total);
    $("checkout").disabled = count === 0;
    $("cartList").innerHTML = cart.length
      ? cart.map((i) => {
          const p = PRODUCTS.find((x) => x.id === i.id);
          return `<li class="cart-item">
            <div class="thumb" style="background:${p.bg}">${p.emoji}</div>
            <div><small>${p.name}</small>${money(p.price)}
              <div class="qty">
                <button data-dec="${p.id}" aria-label="Remove one ${p.name}">−</button>
                <span>${i.qty}</span>
                <button data-inc="${p.id}" aria-label="Add one ${p.name}">+</button>
              </div>
            </div>
            <button class="remove" data-del="${p.id}" aria-label="Delete ${p.name}">🗑️</button>
          </li>`;
        }).join("")
      : `<li class="cart-empty">Your cart is empty.<br>Pick a few stickers to start!</li>`;
    save();
  }
  
  $("cartList").addEventListener("click", (e) => {
    const t = e.target;
    if (t.dataset.inc) changeQty(Number(t.dataset.inc), 1);
    if (t.dataset.dec) changeQty(Number(t.dataset.dec), -1);
    if (t.dataset.del) { cart = cart.filter((i) => i.id !== Number(t.dataset.del)); renderCart(); }
  });
  
  function toggleCart(open) {
    $("drawer").classList.toggle("open", open);
    $("overlay").classList.toggle("show", open);
    $("drawer").setAttribute("aria-hidden", String(!open));
  }
  $("openCart").addEventListener("click", () => toggleCart(true));
  $("closeCart").addEventListener("click", () => toggleCart(false));
  $("overlay").addEventListener("click", () => toggleCart(false));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") toggleCart(false); });
  
  $("checkout").addEventListener("click", () => {
    cart = [];
    renderCart();
    toggleCart(false);
    toast("Order placed! Thank you 💖");
  });
  
  /* ---------- Toast ---------- */
  let toastTimer;
  function toast(msg) {
    const t = $("toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
  }
  
  /* ---------- Contact form ---------- */
  $("contactForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const fields = ["name", "email"].map($);
    const msg = $("formMsg");
    fields.forEach((f) => f.classList.remove("invalid"));
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields[1].value.trim());
    const bad = fields.filter((f, i) => !f.value.trim() || (i === 1 && !emailOk));
    if (bad.length) {
      bad.forEach((f) => f.classList.add("invalid"));
      msg.className = "form-msg error";
      msg.textContent = "Please fill in your name, a valid email .";
      bad[0].focus();
      return;
    }
    msg.className = "form-msg ok";
    msg.textContent = `Thanks ${fields[0].value.trim()}! We'll reply soon.`;
    e.target.reset();
  });
  
  /* ---------- Init ---------- */
  $("year").textContent = new Date().getFullYear();
  renderProducts();
  renderCart();