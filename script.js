// ==========================================
// 1. GLOBAL LIVE CLOUD DATABASE CONFIGURATION
// ==========================================
// तन्मय भाई, यह सीधे आपके लाइव डेटाबेस का रस्ता है, अब कोई एरर नहीं आएगा
const DB_URL = "https://sahu-hotel-app-default-rtdb.firebaseio.com";

let currentCategory = 'All';
let DEFAULT_CATEGORIES = ['Hotel', 'Kirana', 'Dairy', 'Snacks'];

// ==========================================
// 2. LIVE LOGIN & REGISTER SYSTEM (GLOBAL)
// ==========================================
const loginForm = document.getElementById('loginForm');

if (loginForm) {
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const errorMsg = document.getElementById('errorMessage');

    usernameInput.addEventListener('input', clearErrors);
    passwordInput.addEventListener('input', clearErrors);

    function clearErrors() {
        usernameInput.classList.remove('error-border');
        passwordInput.classList.remove('error-border');
        if (errorMsg) errorMsg.style.display = 'none';
    }

    loginForm.addEventListener('submit', function(event) {
        event.preventDefault(); 
        clearErrors();

        const originalUsername = usernameInput.value.trim();
        const uValue = originalUsername.toLowerCase(); 
        const pValue = passwordInput.value;

        if (uValue.includes(" ")) {
            showRedError("⚠️ Spaces are not allowed in username!");
            usernameInput.classList.add('error-border');
            return;
        }

        if (pValue.length < 4) {
            showRedError("⚠️ Password must be at least 4 characters long!");
            passwordInput.classList.add('error-border');
            return;
        }

        // 🛑 एडमिन के लिए परमानेंट फिक्स
        if (uValue === "tanmaysahu" && pValue === "boss") {
            localStorage.setItem('currentUser', 'tanmaysahu');
            localStorage.setItem('userRole', 'admin');
            alert('Welcome Back, Boss!');
            window.location.href = "./home.html";
            return;
        }

        // लाइव क्लाउड से यूजर्स की चेकिंग
        fetch(`${DB_URL}/users/${uValue}.json`)
        .then(res => res.json())
        .then(registeredUser => {

            // शर्त 1: अगर यूजर पहली बार आया है (नया रजिस्ट्रेशन - ऑटो सेव)
            if (!registeredUser) {
                const newUserData = { username: originalUsername, password: pValue, role: 'customer' };
                
                fetch(`${DB_URL}/users/${uValue}.json`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newUserData)
                })
                .then(() => {
                    localStorage.setItem('currentUser', originalUsername);
                    localStorage.setItem('userRole', 'customer');
                    alert('New Account Created & Saved on Cloud Network!');
                    window.location.href = "./home.html";
                });
            } 
            // शर्त 2: अगर यूजर का अकाउंट पहले से बना हुआ है
            else {
                if (registeredUser.password === pValue) {
                    localStorage.setItem('currentUser', registeredUser.username);
                    localStorage.setItem('userRole', registeredUser.role);
                    alert('Login Successful!');
                    window.location.href = "./home.html";
                } else {
                    showRedError("⚠️ Incorrect Password! Access Denied.");
                    passwordInput.classList.add('error-border');
                }
            }
        })
        .catch(() => {
            showRedError("⚠️ Cloud Connection Error!");
        });
    });

    function showRedError(message) {
        if (errorMsg) {
            errorMsg.style.display = 'block';
            errorMsg.innerText = message;
        }
    }
}

// ==========================================
// 3. HOME DASHBOARD PROTECTION CONTROL
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    const welcomeMessage = document.getElementById('welcomeMessage');
    
    if (window.location.pathname.includes('home.html') && !localStorage.getItem('currentUser')) {
        window.location.href = "./index.html";
        return;
    }

    if (welcomeMessage) {
        const currentUser = localStorage.getItem('currentUser') || 'Guest';
        const userRole = localStorage.getItem('userRole') || 'customer';
        
        welcomeMessage.innerText = 'Welcome, ' + currentUser;
        
        if (userRole === 'admin') {
            const adminSection = document.getElementById('adminSection');
            if (adminSection) adminSection.style.display = 'block';
        }
        
        updateShopStatus(); 
        
        // लाइव कैटेगरीज लोड करना
        fetch(`${DB_URL}/categories.json`)
        .then(res => res.json())
        .then(data => {
            if(data) {
                DEFAULT_CATEGORIES = Object.values(data).map(c => c.name);
            }
            renderCategoryElements(); 
            filterProducts();
        })
        .catch(() => {
            renderCategoryElements(); 
            filterProducts();
        });
    }
});

function logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userRole');
    window.location.href = "./index.html";
}

// ==========================================
// 4. MANAGEMENT STATIONS & FILTER TABS
// ==========================================
function updateShopStatus() {
    const banner = document.getElementById('shopStatusBanner');
    if (!banner) return;
    const now = new Date();
    const currentHour = now.getHours();
    if (currentHour >= 6 && currentHour < 22) {
        banner.innerHTML = '● Open Now (Store is Open)';
        banner.style.color = '#28a745';
    } else {
        banner.innerHTML = '● Closed (Store is Closed)';
        banner.style.color = '#dc3545';
    }
}

function renderCategoryElements() {
    const prodCategoryDropdown = document.getElementById('prodCategory');
    const tabsContainer = document.getElementById('categoryTabsContainer');

    if (prodCategoryDropdown) {
        prodCategoryDropdown.innerHTML = '';
        DEFAULT_CATEGORIES.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.innerText = cat;
            prodCategoryDropdown.appendChild(option);
        });
    }

    if (tabsContainer) {
        tabsContainer.innerHTML = '';
        const allBtn = document.createElement('button');
        allBtn.innerText = 'All Items';
        allBtn.className = 'filter-tab' + (currentCategory === 'All' ? ' active-tab' : '');
        allBtn.onclick = function() { selectCategory('All'); };
        tabsContainer.appendChild(allBtn);

        DEFAULT_CATEGORIES.forEach(cat => {
            const btn = document.createElement('button');
            btn.innerText = cat;
            btn.className = 'filter-tab' + (currentCategory === cat ? ' active-tab' : '');
            btn.onclick = function() { selectCategory(cat); };
            tabsContainer.appendChild(btn);
        });
    }
}

function createNewCategory() {
    const catInput = document.getElementById('newCategoryName');
    if (!catInput) return;
    const newCat = catInput.value.trim();

    if (newCat === '') {
        alert('Please enter a valid category name!');
        return;
    }

    if (DEFAULT_CATEGORIES.map(c => c.toLowerCase()).includes(newCat.toLowerCase())) {
        alert('Category already exists!');
        return;
    }

    fetch(`${DB_URL}/categories.json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCat })
    })
    .then(() => {
        DEFAULT_CATEGORIES.push(newCat);
        catInput.value = '';
        renderCategoryElements();
        alert(`Category "${newCat}" added successfully!`);
    });
}

// ==========================================
// 5. LIVE GLOBAL PRODUCT ADD SYSTEM
// ==========================================
const addProductForm = document.getElementById('addProductForm');
if (addProductForm) {
    addProductForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const name = document.getElementById('prodName').value.trim();
        const rawPrice = document.getElementById('prodPrice').value;
        const category = document.getElementById('prodCategory').value; 
        let image = document.getElementById('prodImage').value.trim();

        if (image === '') {
            image = 'https://images.placeholders.dev/?width=150&height=150&text=No%20Image';
        }

        const productObject = {
            name: name,
            price: '₹' + rawPrice,
            image: image,
            category: category
        };

        // सीधे आपके लाइव डेटाबेस लिंक पर पोस्ट होगा
        fetch(`${DB_URL}/products.json`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productObject)
        })
        .then(() => {
            addProductForm.reset();
            filterProducts();
            alert('Product Published Globally to All Users!');
        })
        .catch(() => {
            alert('Error updating database!');
        });
    });
}

function selectCategory(categoryName) {
    currentCategory = categoryName;
    renderCategoryElements(); 
    filterProducts(); 
}

// ==========================================
// 6. RENDER LIVE ITEMS FROM CLOUD
// ==========================================
function filterProducts() {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;

    const searchText = document.getElementById('searchBar').value.toLowerCase().trim();
    productsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color:#6c757d;">Loading live items...</p>';

    fetch(`${DB_URL}/products.json`)
    .then(res => res.json())
    .then(data => {
        productsGrid.innerHTML = '';

        if (!data) {
            productsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color:#999;">No products found.</p>';
            return;
        }

        // Object को Array में बदलें ताकि आईडी संभाल सकें
        let productsList = Object.keys(data).map(key => {
            return { id: key, ...data[key] };
        });

        const filteredList = productsList.filter(product => {
            const matchesCategory = (currentCategory === 'All' || product.category === currentCategory);
            const matchesSearch = product.name.toLowerCase().includes(searchText);
            return matchesCategory && matchesSearch;
        });

        if (filteredList.length === 0) {
            productsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color:#999;">No products found.</p>';
            return;
        }

        filteredList.forEach((product) => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <div onclick="openProductModal('${product.name}', '${product.price}')" style="width:100%;">
                    <img src="${product.image}" alt="${product.name}">
                    <h4>${product.name}</h4>
                    <div class="price">${product.price}</div>
                </div>
            `;

            const userRole = localStorage.getItem('userRole') || 'customer';
            if (userRole === 'admin') {
                const delBtn = document.createElement('button');
                delBtn.innerText = 'Delete';
                delBtn.style = 'background: #dc3545; color: white; border: none; padding: 5px; margin-top: 5px; cursor: pointer; width: 100%; border-radius:4px;';
                delBtn.onclick = function(e) {
                    e.stopPropagation(); 
                    if (confirm('Delete this item from global cloud?')) {
                        fetch(`${DB_URL}/products/${product.id}.json`, { method: 'DELETE' })
                        .then(() => {
                            filterProducts();
                        });
                    }
                };
                card.appendChild(delBtn);
            }
            productsGrid.appendChild(card);
        });
    })
    .catch(() => {
        productsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color:#999;">Failed to load live items.</p>';
    });
}

function openProductModal(name, price) {
    document.getElementById('modalProdName').innerText = name + " — " + price;
    document.getElementById('productModal').style.display = 'flex';
}

// Global System Pipeline Hooks
window.logout = logout;
window.createNewCategory = createNewCategory;
window.selectCategory = selectCategory;
window.filterProducts = filterProducts;
window.openProductModal = openProductModal;
window.closeModal = function() {
    document.getElementById('productModal').style.display = 'none';
};