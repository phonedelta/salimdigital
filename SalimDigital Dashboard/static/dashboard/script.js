// DOM Elements
const dashboardSidebar = document.getElementById("dashboardSidebar");
const userMenu = document.getElementById("userMenu");
const userMenuTrigger = document.getElementById("user-menu-trigger");
const userMenuDropdown = document.querySelector(".user-menu-dropdown");
const themeToggle = document.getElementById("theme-toggle");
const dashboardViews = document.querySelectorAll(".dashboard-view");
const dashboardNavItems = document.querySelectorAll(".dashboard-nav-item");
const dashboardTitle = document.getElementById("dashboardTitle");
const dashboardSidebarOverlay = document.getElementById("dashboardSidebarOverlay");
const searchContainer = document.getElementById("searchContainer");
const searchInput = document.getElementById("searchInput");
const searchClose = document.getElementById("searchClose");
const mobileSearchBtn = document.getElementById("mobileSearchBtn");

// State
let sidebarCollapsed = false;
let currentView = "overview";

// ===================================
// INITIALIZATION
// ===================================

document.addEventListener("DOMContentLoaded", function () {
  initTheme();
  initThemeToggle();
  initSidebar();
  initUserMenu();
  initNavigation();
  initSearch();
  initCharts();
  initOrders();
});
function toggleLivraison(orderId) {
  // Support both order_id and timestamp as identifier
  const order = lastOrders.find(o => o.order_id === orderId || o.timestamp === orderId);
  if (!order) return;
  const newStatus = order.livraison === 'livré' ? 'non livré' : 'livré';
  // Build body depending on available identifier
  const body = order.order_id
    ? `order_id=${encodeURIComponent(order.order_id)}&livraison=${encodeURIComponent(newStatus)}`
    : `timestamp=${encodeURIComponent(order.timestamp)}&livraison=${encodeURIComponent(newStatus)}`;
  // Appel backend pour sauvegarder
  fetch('/update-livraison', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        order.livraison = newStatus;
        displayOrders(lastOrders);
      } else {
        alert('Erreur lors de la mise à jour: ' + (data.error || ''));
      }
    })
    .catch(err => {
      alert('Erreur réseau: ' + err);
    });
}

// ===================================
    // Ajout d'un champ livraison si absent
    orders.forEach(o => { if (!('livraison' in o)) o.livraison = 'non livré'; });
    lastOrders = orders;
// ===================================

function initSidebar() {
  // Load saved sidebar state
  sidebarCollapsed = localStorage.getItem("dashboard-sidebar-collapsed") === "true";
  dashboardSidebar.classList.toggle("collapsed", sidebarCollapsed);

  // Sidebar toggle functionality
  document.querySelectorAll(".dashboard-sidebar-toggle").forEach((toggle) => {
    toggle.addEventListener("click", toggleSidebar);
  });

  // Sidebar overlay functionality
  dashboardSidebarOverlay?.addEventListener("click", closeSidebar);
}

function toggleSidebar() {
  sidebarCollapsed = !sidebarCollapsed;
  const isMobile = window.innerWidth <= 1024;

  if (isMobile) {
    // Mobile behavior - toggle sidebar and overlay together
    const isOpen = dashboardSidebar.classList.contains("collapsed");
    dashboardSidebar.classList.toggle("collapsed", !isOpen);
    dashboardSidebarOverlay?.classList.toggle("active", !isOpen);
  } else {
    // Desktop behavior
    dashboardSidebar.classList.toggle("collapsed", sidebarCollapsed);
  }

  localStorage.setItem("dashboard-sidebar-collapsed", sidebarCollapsed.toString());
}

function closeSidebar() {
  if (window.innerWidth <= 1024) {
    dashboardSidebar.classList.remove("collapsed");
    dashboardSidebarOverlay?.classList.remove("active");
  }
}

// ===================================
// USER MENU FUNCTIONALITY
// ===================================

function initUserMenu() {
  if (!userMenuTrigger || !userMenu) return;

  userMenuTrigger.addEventListener("click", (e) => {
    e.stopPropagation();
    userMenu.classList.toggle("active");
  });

  // Close menu when clicking outside or pressing escape
  document.addEventListener("click", (e) => {
    if (!userMenu.contains(e.target)) {
      userMenu.classList.remove("active");
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && userMenu.classList.contains("active")) {
      userMenu.classList.remove("active");
    }
  });
}

// ===================================
// NAVIGATION FUNCTIONALITY
// ===================================

function initNavigation() {
  dashboardNavItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      const viewId = item.getAttribute("data-view");
      if (viewId) switchView(viewId);
    });
  });
}

function switchView(viewId) {
  // Update active nav item
  dashboardNavItems.forEach((item) => {
    item.classList.toggle("active", item.getAttribute("data-view") === viewId);
  });

  // Hide all views and show selected one
  dashboardViews.forEach((view) => view.classList.remove("active"));

  const targetView = document.getElementById(viewId);
  if (targetView) {
    targetView.classList.add("active");
    currentView = viewId;
    updatePageTitle(viewId);
    
    // Load orders if switching to orders view
    if (viewId === 'orders') {
      loadOrders();
    }
  }

  // Close sidebar on mobile after navigation
  if (window.innerWidth <= 1024) closeSidebar();
}

function updatePageTitle(viewId) {
  const titles = {
    overview: "Overview",
    orders: "Orders",
    tasks: "Tasks",
    reports: "Reports",
    settings: "Settings",
  };

  if (dashboardTitle) {
    dashboardTitle.textContent = titles[viewId] || "Dashboard";
  }
}

// ===================================
// THEME FUNCTIONALITY
// ===================================

function initTheme() {
  // Load saved theme
  const savedTheme = localStorage.getItem("dashboard-theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);

  // Update theme toggle UI
  updateThemeToggleUI(savedTheme);
}

function initThemeToggle() {
  if (!themeToggle) return;

  themeToggle.querySelectorAll(".theme-option").forEach((option) => {
    option.addEventListener("click", (e) => {
      e.stopPropagation();
      setTheme(option.getAttribute("data-theme"));
    });
  });
}

function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("dashboard-theme", theme);
  updateThemeToggleUI(theme);
}

function updateThemeToggleUI(theme) {
  if (!themeToggle) return;

  themeToggle.querySelectorAll(".theme-option").forEach((option) => {
    option.classList.toggle("active", option.getAttribute("data-theme") === theme);
  });
}

// ===================================
// SEARCH FUNCTIONALITY
// ===================================

function initSearch() {
  mobileSearchBtn?.addEventListener("click", () => {
    searchContainer.classList.add("mobile-active");
    searchInput.focus();
  });

  searchClose?.addEventListener("click", () => {
    searchContainer.classList.remove("mobile-active");
    searchInput.value = "";
  });
}

// ===================================
// CHART INITIALIZATION
// ===================================

function initCharts() {
  initProgressChart();
  initCategoryChart();
}

function initProgressChart() {
  const ctx = document.getElementById("progressChart");
  if (!ctx) return;
  // Fetch orders and render a line chart showing orders per day for last 7 days
  fetch('/orders.json')
    .then(res => res.json())
    .then(orders => {
      // Build labels (last 7 days)
      const days = [];
      const counts = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days.push(d.toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit' }));
        counts.push(0);
      }

      // Count orders per day and delivered
      let delivered = 0;
      orders.forEach(o => {
        const d = new Date(o.timestamp);
        const key = d.toDateString();
        for (let i = 0; i < 7; i++) {
          const day = new Date(); day.setDate(day.getDate() - (6 - i));
          if (day.toDateString() === key) counts[i]++;
        }
        if (o.livraison === 'livré') delivered++;
      });

      const total = orders.length || 1;
      const deliveredPct = Math.round((delivered / total) * 100);

      // Update overview small stat
      const deliveredEl = document.getElementById('overviewDelivered');
      const totalEl = document.getElementById('overviewTotalOrders');
      const pendingEl = document.getElementById('overviewPending');
      const productsEl = document.getElementById('overviewTotalProducts');
      if (deliveredEl) deliveredEl.textContent = delivered;
      if (totalEl) totalEl.textContent = orders.length;
      if (pendingEl) pendingEl.textContent = orders.length - delivered;
      const totalProducts = orders.reduce((s,o)=>s + parseInt(o.quantity||0),0);
      if (productsEl) productsEl.textContent = totalProducts;

      new Chart(ctx, {
        type: 'line',
        data: {
          labels: days,
          datasets: [{
            label: 'Commandes (7 jours)',
            data: counts,
            borderColor: '#8b5cf6',
            backgroundColor: 'rgba(139,92,246,0.08)',
            fill: true,
            tension: 0.3,
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true, precision:0 } }
        }
      });
    })
    .catch(err => {
      console.error('Error loading orders for progress chart', err);
    });
}

function initCategoryChart() {
  const ctx = document.getElementById("categoryChart");
  if (!ctx) return;
  // Product distribution (pie/doughnut) based on orders
  fetch('/orders.json')
    .then(res => res.json())
    .then(orders => {
      const counts = {};
      orders.forEach(o => {
        const key = (o.product || 'Autre').toLowerCase();
        counts[key] = (counts[key] || 0) + (parseInt(o.quantity||1) || 1);
      });
      const labels = Object.keys(counts).map(k => k.charAt(0).toUpperCase() + k.slice(1));
      const data = Object.values(counts);
      const colors = ["#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#a78bfa"];

      new Chart(ctx, {
        type: 'doughnut',
        data: { labels, datasets: [{ data, backgroundColor: colors.slice(0, labels.length), borderWidth: 0 }] },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom', labels: { usePointStyle: true } } }
        }
      });
    })
    .catch(err => console.error('Error loading orders for category chart', err));
}

// ===================================
// ORDERS FUNCTIONALITY
// ===================================

function initOrders() {
  const refreshBtn = document.getElementById('refreshOrders');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', loadOrders);
  }
}

async function loadOrders() {
  const tableBody = document.getElementById('ordersTableBody');
  const refreshBtn = document.getElementById('refreshOrders');
  
  if (!tableBody) return;
  
  // Show loading state
  refreshBtn.disabled = true;
  refreshBtn.textContent = 'Loading...';
  
  try {
    // Récupérer les commandes depuis le serveur
    const response = await fetch('/orders.json');
    
    if (!response.ok) {
      throw new Error('Failed to fetch orders');
    }
    
    const orders = await response.json();
    displayOrders(orders);
    
  } catch (error) {
    console.error('Error loading orders:', error);
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-state">
          <div class="empty-state-content">
            <span class="material-symbols-rounded empty-state-icon">error</span>
            <h4 class="empty-state-title">Error loading orders</h4>
            <p class="empty-state-description">${error.message}</p>
          </div>
        </td>
      </tr>
    `;
  } finally {
    refreshBtn.disabled = false;
    refreshBtn.textContent = 'Refresh';
  }
}

function displayOrders(orders) {
  const tableBody = document.getElementById('ordersTableBody');
  // Initialiser le champ livraison si absent
  orders.forEach(order => {
    if (!('livraison' in order)) order.livraison = 'non livré';
  });
  // Trier les commandes par date (les plus récentes en premier)
  const sortedOrders = orders.slice().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  lastOrders = sortedOrders;

  if (orders.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-state">
          <div class="empty-state-content">
            <span class="material-symbols-rounded empty-state-icon">shopping_cart</span>
            <h4 class="empty-state-title">Aucune commande</h4>
            <p class="empty-state-description">Les commandes de votre site web apparaîtront ici.</p>
          </div>
        </td>
      </tr>
    `;
    // Reset stats
    updateOrderStats([]);
    return;
  }

  // Update statistics (use sorted list for consistency)
  updateOrderStats(sortedOrders);

  const rows = sortedOrders.map(order => {
    // Format the date
    const date = new Date(order.timestamp);
    const formattedDate = date.toLocaleString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Get product class for badge
    const productClass = order.product.toLowerCase().replace(/\s+/g, '');

    // Create customer info
    const customerInfo = `
      <div class="customer-name">${order.fullName}</div>
      <div class="customer-email">${order.email}</div>
    `;

    // Create product badge
    const productBadge = `
      <span class="product-badge ${productClass}">
        <span class="material-symbols-rounded" style="font-size: 14px;">${getProductIcon(order.product)}</span>
        ${order.product}
      </span>
    `;

    // Create quantity badge
    const quantityBadge = `<span class="quantity-badge">${order.quantity}</span>`;

    // Create phone link
    const phoneLink = `<a href="tel:${order.phone}" class="phone-link">${order.phone}</a>`;

    const btnClass = order.livraison === 'livré' ? 'btn-livraison livre' : 'btn-livraison nonlivre';
    const identifier = order.order_id ? order.order_id : order.timestamp;
    return `
      <tr>
        <td>
          <div class="order-date">${formattedDate}</div>
        </td>
        <td>${customerInfo}</td>
        <td>${productBadge}</td>
        <td style="text-align: center;">${quantityBadge}</td>
        <td>${phoneLink}</td>
        <td>
          <button class="btn ${btnClass}" onclick="toggleLivraison('${identifier}')" title="Changer le statut">
            ${order.livraison === 'livré' ? '<span class="material-symbols-rounded" style="color:green;">check_circle</span> Livré' : '<span class="material-symbols-rounded" style="color:orange;">local_shipping</span> Non livré'}
          </button>
          <button class="btn btn-error" onclick="deleteOrder('${identifier}')" title="Supprimer la commande">
            <span class="material-symbols-rounded">delete</span>
          </button>
        </td>
      </tr>
    `;
  }).join('');

  tableBody.innerHTML = rows;
}

// Function to update order statistics
function updateOrderStats(orders) {
  // Total orders
  document.getElementById('totalOrders').textContent = orders.length;
  
  // Total products sold
  const totalProducts = orders.reduce((sum, order) => sum + parseInt(order.quantity || 0), 0);
  document.getElementById('totalProducts').textContent = totalProducts;
  
  // Today's orders
  const today = new Date();
  const todayString = today.toDateString();
  const todayOrders = orders.filter(order => {
    const orderDate = new Date(order.timestamp);
    return orderDate.toDateString() === todayString;
  }).length;
  document.getElementById('todayOrders').textContent = todayOrders;
  
  // Estimated revenue (example pricing)
  const productPrices = {
    'netflix': 15,
    'spotify': 10,
    'chatgpt': 20,
    'capcut': 8
  };
  
  const totalRevenue = orders.reduce((sum, order) => {
    const price = productPrices[order.product.toLowerCase()] || 0;
    return sum + (price * parseInt(order.quantity || 0));
  }, 0);
  
  document.getElementById('totalRevenue').textContent = `${totalRevenue}€`;
}

// Helper function to get product icons
function getProductIcon(product) {
  const icons = {
    'netflix': 'movie',
    'spotify': 'music_note',
    'chatgpt': 'smart_toy',
    'capcut': 'video_camera_front'
  };
  
  const productKey = product.toLowerCase();
  return icons[productKey] || 'shopping_bag';
}

// Function to view order details (placeholder)
function viewOrderDetails(orderId) {
  alert(`Order details for: ${orderId}\n\nCette fonctionnalité peut être étendue pour afficher plus de détails.`);
}

// Function to delete an order
function deleteOrder(orderId) {
  if (!confirm('Voulez-vous vraiment supprimer cette commande ?')) return;
  // Support order_id or timestamp
  const order = lastOrders.find(o => o.order_id === orderId || o.timestamp === orderId);
  const body = order && order.order_id
    ? `order_id=${encodeURIComponent(order.order_id)}`
    : `timestamp=${encodeURIComponent(orderId)}`;
  fetch('/delete-order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        loadOrders();
      } else {
        alert('Erreur lors de la suppression : ' + (data.error || ''));
      }
    })
    .catch(err => {
      alert('Erreur réseau : ' + err);
    });
}

// Logout function: clear auth and go to login
function logout() {
  localStorage.removeItem('dashboardAuth');
  window.location = 'login.html';
}
