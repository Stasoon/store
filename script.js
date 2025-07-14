// --- Глобальні змінні
let currentCategory = 'all';
let searchText = '';
let cart = JSON.parse(localStorage.getItem('cart') || '[]');

// --- Категорії
function renderCategories() {
  const cats = [...new Set(products.map(p => p.category))];
  const nav = document.getElementById('categories');
  nav.innerHTML =
    `<button class="${currentCategory=='all'?'active':''}" onclick="filterByCat('all')">Всі</button>` +
    cats.map(c =>
      `<button class="${currentCategory==c?'active':''}" onclick="filterByCat('${c}')">${c}</button>`
    ).join('');
}
window.filterByCat = function(cat) {
  currentCategory = cat;
  renderCategories();
  renderProducts();
}

// --- Пошук
document.getElementById('search').oninput = function() {
  searchText = this.value;
  renderProducts();
};

// --- Рендер товарів
function renderProducts() {
  let filtered = products;
  if (currentCategory && currentCategory !== 'all')
    filtered = filtered.filter(p => p.category === currentCategory);
  if (searchText)
    filtered = filtered.filter(p => p.name.toLowerCase().includes(searchText.toLowerCase()));
  const productsDiv = document.getElementById('products');
  productsDiv.innerHTML = filtered.length ? '' : '<p>Товарів не знайдено.</p>';
  filtered.forEach(p => {
    const div = document.createElement('div');
    div.className = 'product-card';
    div.innerHTML = `
      <span class="more-btn" onclick="showProductModal(${p.id})">...</span>
      <img src="${p.img}" alt="">
      <h3>${p.name}</h3>
      <p>${p.price} грн</p>
      <button onclick="addToCart(${p.id})">Додати в кошик</button>
    `;
    productsDiv.appendChild(div);
  });
}

// --- Модалка товару
window.showProductModal = function(id) {
  const p = products.find(p => p.id === id);
  document.getElementById('product-modal').innerHTML = `
    <div class="modal-content">
      <span onclick="closeProductModal()" class="close">&times;</span>
      <h2>${p.name}</h2>
      <img src="${p.img}">
      <p>${p.description}</p>
      <p>Ціна: ${p.price} грн</p>
      <button onclick="addToCart(${p.id});closeProductModal()">Додати в кошик</button>
    </div>
  `;
  document.getElementById('product-modal').classList.add('show');
};
window.closeProductModal = function() {
  document.getElementById('product-modal').classList.remove('show');
};

// --- Кошик
function updateCartCount() {
  document.getElementById('cart-count').textContent =
    cart.reduce((sum, i) => sum + i.qty, 0);
}
function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
}
window.addToCart = function(id) {
  const found = cart.find(i => i.id === id);
  if (found) found.qty++;
  else cart.push({ id, qty: 1 });
  saveCart();
  showCart(); // для миттєвого оновлення в модалці
};

// --- Модалка кошика
document.getElementById('cart-btn').onclick = function() {
  showCart();
  document.getElementById('cart-modal').classList.add('show');
};
window.closeCartModal = function() {
  document.getElementById('cart-modal').classList.remove('show');
};

function showCart() {
  const modal = document.getElementById('cart-modal');
  let html = `<div class="modal-content">
    <span onclick="closeCartModal()" class="close">&times;</span>
    <h2>Ваш кошик</h2>`;
  if (!cart.length) {
    html += `<p>Кошик порожній</p>`;
  } else {
    let sum = 0;
    html += cart.map(item => {
      const prod = products.find(p => p.id === item.id);
      sum += prod.price * item.qty;
      return `<div class="cart-item">
        <span>${prod.name}</span>
        <span>
          <button onclick="changeQty(${item.id},-1)">-</button>
          ${item.qty}
          <button onclick="changeQty(${item.id},1)">+</button>
        </span>
        <span>${prod.price * item.qty} грн</span>
        <button onclick="removeFromCart(${item.id})">&times;</button>
      </div>`;
    }).join('');
    html += `<p><b>Сума: ${sum} грн</b></p>`;
    // Форма оформлення
    html += `<form class="cart-form" id="order-form">
      <input type="text" name="name" placeholder="Ваше ім'я" required>
      <input type="tel" name="phone" placeholder="Телефон" pattern="[0-9\\+\\- ]{7,}" required>
      <button type="submit">Оформити замовлення</button>
    </form>`;
  }
  html += `</div>`;
  modal.innerHTML = html;

  // Додаємо обробник форми
  const form = document.getElementById('order-form');
  if (form) {
    form.onsubmit = function(e) {
      e.preventDefault();
      alert('Дякуємо за замовлення!\nМи зв\'яжемося з вами.');
      cart = [];
      saveCart();
      closeCartModal();
    };
  }
}
window.removeFromCart = function(id) {
  cart = cart.filter(i => i.id !== id);
  saveCart();
  showCart();
};
window.changeQty = function(id, d) {
  const found = cart.find(i => i.id === id);
  if (found) {
    found.qty += d;
    if (found.qty <= 0) removeFromCart(id);
    else saveCart();
    showCart();
  }
};

// --- Перший запуск
renderCategories();
renderProducts();
updateCartCount();

// --- Закриття модалок по кліку на фон
window.onclick = function(event) {
  if (event.target.classList.contains('modal')) {
    event.target.classList.remove('show');
  }
};

