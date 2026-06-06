// ==========================================
// 1. LOGIN SYSTEM (tanmaysahu / boss)
// ==========================================
const loginForm = document.getElementById('loginForm');

if (loginForm) {
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault(); 

        const usernameInput = document.getElementById('username').value.trim();
        const passwordInput = document.getElementById('password').value;

        const MASTER_ADMIN_USER = 'tanmaysahu';
        const MASTER_ADMIN_PASS = 'boss';

        if (usernameInput.toLowerCase() === MASTER_ADMIN_USER.toLowerCase()) {
            if (passwordInput === MASTER_ADMIN_PASS) {
                localStorage.setItem('currentUser', 'admin');
                alert('Welcome Back, Boss! Admin Access Granted.');
                window.location.href = 'home.html';
            } else {
                alert('Access Denied! Wrong Admin Password.');
            }
            return;
        }

        if (usernameInput.toLowerCase() === 'admin' || usernameInput.toLowerCase() === MASTER_ADMIN_USER.toLowerCase()) {
            alert('This username is reserved.');
            return;
        }

        let usersList = JSON.parse(localStorage.getItem('allUsers')) || [];
        const existingUser = usersList.find(user => user.username.toLowerCase() === usernameInput.toLowerCase());

        localStorage.setItem('currentUser', usernameInput);

        if (!existingUser) {
            usersList.push({ username: usernameInput, password: passwordInput });
            localStorage.setItem('allUsers', JSON.stringify(usersList));
            alert('Account created and logged in successfully!');
            window.location.href = 'home.html';
        } else {
            if (existingUser.password === passwordInput) {
                alert('Login Successful!');
                window.location.href = 'home.html';
            } else {
                alert('Wrong Password!');
            }
        }
    });
}

// ==========================================
// 2. LIVE STORE TIMING STATUS
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

// ==========================================
// 3. DYNAMIC CATEGORY LOGIC
// ==========================================
let currentCategory = 'All'; 
const DEFAULT_CATEGORIES = ['Hotel', 'Kirana', 'Dairy', 'Snacks'];

function getCategories() {
    let customCategories = JSON.parse(localStorage.getItem('customCategories')) || [];
    return [...DEFAULT_CATEGORIES, ...customCategories];
}

function createNewCategory() {
    const newCatInput = document.getElementById('newCategoryName');
    const catName = newCatInput.value.trim();

    if (catName === '') {
        alert('Please enter a category name!');
        return;
    }

    let customCategories = JSON.parse(localStorage.getItem('customCategories')) || [];
    
    if (DEFAULT_CATEGORIES.includes(catName) || customCategories.includes(catName)) {
        alert('This category already exists!');
        return;
    }

    customCategories.push(catName);
    localStorage.setItem('customCategories', JSON.stringify(customCategories));

    newCatInput.value = ''; 
    alert('New Category Created Successfully!');
    renderCategoryElements();
}

function renderCategoryElements() {
    const prodCategoryDropdown = document.getElementById('prodCategory');
    const tabsContainer = document.getElementById('categoryTabsContainer');
    const allCategories = getCategories();

    if (prodCategoryDropdown) {
        prodCategoryDropdown.innerHTML = '';
        allCategories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.innerText = cat + ' Items';
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

        allCategories.forEach(cat => {
            const btn = document.createElement('button');
            btn.innerText = cat;
            btn.className = 'filter-tab' + (currentCategory === cat ? ' active-tab' : '');
            btn.onclick = function() { selectCategory(cat); };
            tabsContainer.appendChild(btn);
        });
    }
}

// ==========================================
// 4. HOME CATALOGUE, SEARCH & FILTER
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    const welcomeMessage = document.getElementById('welcomeMessage');
    
    if (welcomeMessage) {
        const currentUser = localStorage.getItem('currentUser') || 'Guest';
        welcomeMessage.innerText = 'Welcome, ' + currentUser;

        if (currentUser.toLowerCase() === 'admin') {
            const adminSection = document.getElementById('adminSection');
            if (adminSection) adminSection.style.display = 'block';
        }

        updateShopStatus(); 
        renderCategoryElements(); 
        displayProducts();
    }
});

const addProductForm = document.getElementById('addProductForm');
if (addProductForm) {
    addProductForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const name = document.getElementById('prodName').value.trim();
        const rawPrice = document.getElementById('prodPrice').value;
        const category = document.getElementById('prodCategory').value; 
        let image = document.getElementById('prodImage').value.trim();

        if (image === '') {
            image = 'https://images.placeholders.dev/?width=150&height=150&text=No%20Image&background=%23eaeaea&color=%23666666';
        }

        const finalPrice = '₹' + rawPrice;

        let productsList = JSON.parse(localStorage.getItem('shopProducts')) || [];
        productsList.push({ name: name, price: finalPrice, image: image, category: category });
        localStorage.setItem('shopProducts', JSON.stringify(productsList));

        document.getElementById('addProductForm').reset();
        displayProducts();
        alert('Product Added Successfully!');
    });
}

function selectCategory(categoryName) {
    currentCategory = categoryName;
    renderCategoryElements(); 
    filterProducts(); 
}

function filterProducts() {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;

    const searchText = document.getElementById('searchBar').value.toLowerCase().trim();
    let productsList = JSON.parse(localStorage.getItem('shopProducts')) || [];
    const currentUser = localStorage.getItem('currentUser') || 'Guest';

    productsGrid.innerHTML = '';

    const filteredList = productsList.filter(product => {
        const matchesCategory = (currentCategory === 'All' || product.category === currentCategory);
        const matchesSearch = product.name.toLowerCase().includes(searchText);
        return matchesCategory && matchesSearch;
    });

    if (filteredList.length === 0) {
        productsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color:#999;">No products match your search.</p>';
        return;
    }

    filteredList.forEach((product) => {
        const realIndex = productsList.findIndex(p => p.name === product.name && p.price === product.price);

        const card = document.createElement('div');
        card.className = 'product-card';
        
        card.innerHTML = `
            <div onclick="openProductModal('${product.name}', '${product.price}')" style="width:100%;">
                <img src="${product.image}" alt="${product.name}" onerror="this.src='https://images.placeholders.dev/?width=150&height=150&text=No%20Image&background=%23eaeaea&color=%23666666'">
                <h4>${product.name}</h4>
                <div style="font-size: 11px; color: #888; margin-bottom: 5px; text-transform: uppercase;">${product.category || 'General'}</div>
                <div class="price">${product.price}</div>
            </div>
        `;

        if (currentUser.toLowerCase() === 'admin') {
            const delBtn = document.createElement('button');
            delBtn.innerText = 'Delete';
            delBtn.style = 'background-color: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 4px; margin-top: 10px; cursor: pointer; width: 100%;';
            delBtn.onclick = function(e) {
                e.stopPropagation(); 
                deleteProduct(realIndex);
            };
            card.appendChild(delBtn);
        }

        productsGrid.appendChild(card);
    });
}

function openProductModal(name, price) {
    document.getElementById('modalProdName').innerText = name + " — " + price;
    document.getElementById('productModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('productModal').style.display = 'none';
}

function displayProducts() {
    filterProducts();
}

function deleteProduct(index) {
    if (confirm('Are you sure you want to delete this product?')) {
        let productsList = JSON.parse(localStorage.getItem('shopProducts')) || [];
        productsList.splice(index, 1);
        localStorage.setItem('shopProducts', JSON.stringify(productsList));
        filterProducts();
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}