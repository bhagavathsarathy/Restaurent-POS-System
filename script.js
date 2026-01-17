// Restaurant POS System - JavaScript

// Item Code Generation
function generateItemCode(name, existingCodes) {
    const firstLetter = name.charAt(0).toLowerCase();
    if (!existingCodes.includes(firstLetter)) {
        return firstLetter;
    }
    // Handle conflicts: try first two letters
    const twoLetters = name.substring(0, 2).toLowerCase();
    if (!existingCodes.includes(twoLetters)) {
        return twoLetters;
    }
    // If still conflict, try first letter + second available letter
    for (let i = 1; i < name.length; i++) {
        const code = firstLetter + name.charAt(i).toLowerCase();
        if (!existingCodes.includes(code)) {
            return code;
        }
    }
    // Fallback: use first letter + number
    let num = 1;
    while (existingCodes.includes(firstLetter + num)) {
        num++;
    }
    return firstLetter + num;
}

// Generate codes for menu items
function assignCodesToMenuItems(items) {
    const existingCodes = [];
    return items.map(item => {
        if (!item.code) {
            const code = generateItemCode(item.name, existingCodes);
            existingCodes.push(code);
            return { ...item, code };
        }
        existingCodes.push(item.code);
        return item;
    });
}

// Default menu items with local South Indian food images
const DEFAULT_MENU_ITEMS = [
    { id: 1, name: 'Idly', description: 'Steamed rice cakes', price: 30, category: 'Breakfast', image: 'images/idly.png' },
    { id: 2, name: 'Puttu', description: 'Steamed rice cylinders', price: 40, category: 'Breakfast', image: 'images/puttu.png' },
    { id: 3, name: 'Poori', description: 'Deep-fried bread', price: 35, category: 'Breakfast', image: 'images/poori.png' },
    { id: 4, name: 'Coffee', description: 'South Indian filter coffee', price: 20, category: 'Beverages', image: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400&h=300&fit=crop&q=80' },
    { id: 5, name: 'Dosai', description: 'Crispy rice crepe', price: 50, category: 'Breakfast', image: 'images/dosa.png' },
    { id: 6, name: 'Vada', description: 'Savory fried donut', price: 25, category: 'Snacks', image: 'images/vada.jpg' },
    { id: 7, name: 'Pazhampori', description: 'Ripe banana fritters', price: 30, category: 'Snacks', image: 'images/pazhampori.png' }
].map((item, index, arr) => {
    // Generate codes for default items
    const existingCodes = arr.slice(0, index).map(i => i.code).filter(Boolean);
    if (!item.code) {
        item.code = generateItemCode(item.name, existingCodes);
    }
    return item;
});

// Initialize data structure
function initializeData() {
    if (!localStorage.getItem('menuItems')) {
        localStorage.setItem('menuItems', JSON.stringify(DEFAULT_MENU_ITEMS));
    } else {
        // Ensure existing menu items have codes and update images
        const items = JSON.parse(localStorage.getItem('menuItems'));
        
        // Update image URLs for default items by matching name
        const defaultItemMap = {};
        DEFAULT_MENU_ITEMS.forEach(item => {
            defaultItemMap[item.name.toLowerCase()] = item.image;
        });
        
        // Update images for matching items
        items.forEach(item => {
            const lowerName = item.name.toLowerCase();
            if (defaultItemMap[lowerName]) {
                item.image = defaultItemMap[lowerName];
            }
        });
        
        const itemsWithCodes = assignCodesToMenuItems(items);
        localStorage.setItem('menuItems', JSON.stringify(itemsWithCodes));
    }
    if (!localStorage.getItem('cart')) {
        localStorage.setItem('cart', JSON.stringify([]));
    }
    if (!localStorage.getItem('transactions')) {
        localStorage.setItem('transactions', JSON.stringify([]));
    }
    if (!localStorage.getItem('cancelledItems')) {
        localStorage.setItem('cancelledItems', JSON.stringify([]));
    }
    // Set GPay QR code image URL (user will provide this)
    if (!localStorage.getItem('gpayQRCode')) {
        localStorage.setItem('gpayQRCode', ''); // User can set this in manage menu or we'll add it
    }
}

// Get data from localStorage
function getMenuItems() {
    return JSON.parse(localStorage.getItem('menuItems') || '[]');
}

function getCart() {
    return JSON.parse(localStorage.getItem('cart') || '[]');
}

function getTransactions() {
    return JSON.parse(localStorage.getItem('transactions') || '[]');
}

function getCancelledItems() {
    return JSON.parse(localStorage.getItem('cancelledItems') || '[]');
}

// Save data to localStorage
function saveMenuItems(items) {
    localStorage.setItem('menuItems', JSON.stringify(items));
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function saveTransactions(transactions) {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

function saveCancelledItems(items) {
    localStorage.setItem('cancelledItems', JSON.stringify(items));
}

// Menu CRUD Operations
function addMenuItem(name, description, price, category, image) {
    const items = getMenuItems();
    const newId = items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
    const existingCodes = items.map(i => i.code).filter(Boolean);
    const code = generateItemCode(name, existingCodes);
    const newItem = {
        id: newId,
        name,
        description,
        price: parseFloat(price),
        category,
        code,
        image: image || 'https://via.placeholder.com/400x300?text=' + encodeURIComponent(name)
    };
    items.push(newItem);
    saveMenuItems(items);
    return newItem;
}

function updateMenuItem(id, name, description, price, category, image) {
    const items = getMenuItems();
    const index = items.findIndex(item => item.id === id);
    if (index !== -1) {
        items[index] = {
            ...items[index],
            name,
            description,
            price: parseFloat(price),
            category,
            image: image || items[index].image
        };
        saveMenuItems(items);
        return items[index];
    }
    return null;
}

function deleteMenuItem(id) {
    const items = getMenuItems();
    const filtered = items.filter(item => item.id !== id);
    saveMenuItems(filtered);
    return filtered;
}

// Cart Operations
function addToCart(itemId) {
    const menuItems = getMenuItems();
    const cart = getCart();
    const item = menuItems.find(i => i.id === itemId);
    
    if (!item) return;
    
    const existingItem = cart.find(c => c.itemId === itemId);
    if (existingItem) {
        existingItem.quantity += 1;
        existingItem.subtotal = existingItem.quantity * existingItem.price;
    } else {
        cart.push({
            itemId: item.id,
            name: item.name,
            price: item.price,
            quantity: 1,
            subtotal: item.price
        });
    }
    
    saveCart(cart);
    renderCart();
    showCartNotification();
}

// Typing Area Functions
function parseItemCodes(input) {
    // Split by comma or space, then trim and filter
    const codes = input.split(/[,\s]+/).map(code => code.trim().toLowerCase()).filter(code => code.length > 0);
    return codes;
}

function addItemByCode(code) {
    const items = getMenuItems();
    const item = items.find(i => i.code && i.code.toLowerCase() === code.toLowerCase());
    if (item) {
        addToCart(item.id);
        return true;
    }
    return false;
}

function handleTypingArea(input, typingArea) {
    const value = input.value.trim().toLowerCase();
    if (value.length === 0) return;
    
    // Parse codes (support comma-separated or space-separated)
    const codes = parseItemCodes(value);
    let added = false;
    let notFound = [];
    
    codes.forEach(code => {
        if (addItemByCode(code)) {
            added = true;
        } else {
            notFound.push(code);
        }
    });
    
    // Clear input after processing
    typingArea.value = '';
    
    // Show feedback
    if (notFound.length > 0) {
        alert(`Item codes not found: ${notFound.join(', ')}`);
    } else if (added) {
        // Notification will be shown by addToCart
    }
}

function updateCartQuantity(itemId, quantity) {
    const cart = getCart();
    const item = cart.find(c => c.itemId === itemId);
    if (item) {
        if (quantity <= 0) {
            removeFromCart(itemId);
        } else {
            item.quantity = quantity;
            item.subtotal = item.quantity * item.price;
            saveCart(cart);
            renderCart();
        }
    }
}

function removeFromCart(itemId) {
    const cart = getCart();
    const filtered = cart.filter(c => c.itemId !== itemId);
    saveCart(filtered);
    renderCart();
}

function clearCart() {
    saveCart([]);
    renderCart();
}

function calculateTotal() {
    const cart = getCart();
    return cart.reduce((sum, item) => sum + item.subtotal, 0);
}

// Get current category filter
let currentCategory = 'all';

// Render Functions
function renderMenu(category = 'all') {
    const menuGrid = document.getElementById('menu-grid');
    const items = getMenuItems();
    const cart = getCart();
    
    // Filter items by category
    let filteredItems = items;
    if (category !== 'all') {
        filteredItems = items.filter(item => item.category.toLowerCase() === category.toLowerCase());
    }
    
    // Update category counts
    updateCategoryCounts();
    
    if (filteredItems.length === 0) {
        menuGrid.innerHTML = '<p class="empty-state">No menu items available in this category.</p>';
        return;
    }
    
    menuGrid.innerHTML = filteredItems.map(item => {
        const cartItem = cart.find(c => c.itemId === item.id);
        const quantity = cartItem ? cartItem.quantity : 0;
        const isSelected = quantity > 0;
        
        return `
            <div class="menu-item-card ${isSelected ? 'selected' : ''}" data-item-id="${item.id}" onclick="updateMenuQty(${item.id}, ${quantity + 1})">
                <img src="${item.image}" alt="${item.name}" class="menu-item-image" onerror="this.src='https://via.placeholder.com/400x300?text=${encodeURIComponent(item.name)}'">
                <div class="menu-item-info">
                    <div class="menu-item-category">${item.category}</div>
                    <div class="menu-item-name">${item.name}</div>
                    <div class="menu-item-bottom">
                        <div class="menu-item-price">₹${item.price.toFixed(2)}</div>
                        <div class="menu-item-qty" onclick="event.stopPropagation();">
                            ${quantity > 0 ? `
                                <button class="qty-btn-small" onclick="event.stopPropagation(); updateMenuQty(${item.id}, ${quantity - 1})">-</button>
                                <span class="qty-display-small">${quantity}</span>
                            ` : ''}
                            <button class="qty-btn-small" onclick="event.stopPropagation(); updateMenuQty(${item.id}, ${quantity + 1})">+</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function updateMenuQty(itemId, quantity) {
    if (quantity <= 0) {
        removeFromCart(itemId);
    } else {
        // Find existing item or add new
        const cart = getCart();
        const menuItems = getMenuItems();
        const item = menuItems.find(i => i.id === itemId);
        if (!item) return;
        
        const existingItem = cart.find(c => c.itemId === itemId);
        if (existingItem) {
            existingItem.quantity = quantity;
            existingItem.subtotal = existingItem.quantity * existingItem.price;
        } else {
            cart.push({
                itemId: item.id,
                name: item.name,
                price: item.price,
                quantity: quantity,
                subtotal: item.price * quantity
            });
        }
        
        saveCart(cart);
    }
    renderCart();
    renderMenu(currentCategory);
}

function updateCategoryCounts() {
    const items = getMenuItems();
    const categories = {};
    
    items.forEach(item => {
        const cat = item.category.toLowerCase();
        categories[cat] = (categories[cat] || 0) + 1;
    });
    
    // Update category tab counts
    document.querySelectorAll('.category-count').forEach(el => {
        const category = el.closest('.category-tab').dataset.category;
        const count = category === 'all' ? items.length : (categories[category] || 0);
        el.textContent = count;
    });
    
    // Update "All Menu" count
    const allMenuTab = document.querySelector('[data-category="all"] .category-count');
    if (allMenuTab) {
        allMenuTab.textContent = items.length;
    }
    
    // Display item codes in code billing area
    displayItemCodes(items);
}

function displayItemCodes(items) {
    const codesDisplayEl = document.getElementById('item-codes-display');
    if (codesDisplayEl && items.length > 0) {
        // Create a readable list of codes (first 8 items as examples)
        const exampleCodes = items.slice(0, 8).map(item => {
            const code = item.code || '?';
            return `${item.name} = ${code}`;
        }).join(', ');
        
        // If there are more items, add "..."
        const moreText = items.length > 8 ? '...' : '';
        codesDisplayEl.textContent = exampleCodes + moreText;
    } else if (codesDisplayEl) {
        // Show example codes if no items available
        codesDisplayEl.textContent = 'idly = i, puttu = p, poori = po, coffee = c, dosai = d, vada = v, pazhampori = pa';
    }
}

function renderCart() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const orderedItemsCount = document.getElementById('ordered-items-count');
    const subtotalEl = document.getElementById('subtotal');
    const cart = getCart();
    
    if (cart.length === 0) {
        if (cartItems) {
            cartItems.innerHTML = '<p class="empty-cart">No items added yet</p>';
        }
        if (cartTotal) cartTotal.textContent = '0.00';
        if (subtotalEl) subtotalEl.textContent = '0.00';
        if (orderedItemsCount) orderedItemsCount.textContent = '0';
        updatePaymentSummary();
        return;
    }
    
    if (cartItems) {
        cartItems.innerHTML = cart.map(item => `
            <div class="ordered-item">
                <div class="ordered-item-info">
                    <div class="ordered-item-name">${item.quantity}x ${item.name}</div>
                </div>
                <div class="ordered-item-price">₹${item.subtotal.toFixed(2)}</div>
            </div>
        `).join('');
    }
    
    const total = calculateTotal();
    const subtotal = total;
    const tax = subtotal * 0.05; // 5% tax
    const donation = 1.00; // Fixed donation
    const totalPayable = subtotal + tax + donation;
    
    if (cartTotal) cartTotal.textContent = totalPayable.toFixed(2);
    if (subtotalEl) subtotalEl.textContent = subtotal.toFixed(2);
    if (orderedItemsCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        orderedItemsCount.textContent = totalItems;
    }
    
    updatePaymentSummary();
}

function updatePaymentSummary() {
    const cart = getCart();
    const subtotal = calculateTotal();
    const tax = subtotal * 0.05; // 5% tax
    const donation = 1.00;
    
    const taxEl = document.getElementById('tax');
    const donationEl = document.getElementById('donation');
    
    if (taxEl) taxEl.textContent = tax.toFixed(2);
    if (donationEl) donationEl.textContent = donation.toFixed(2);
}

function renderManageMenu() {
    const manageMenuList = document.getElementById('manage-menu-list');
    const items = getMenuItems();
    
    // Load GPay QR code URL
    const gpayQRCode = localStorage.getItem('gpayQRCode') || '';
    const gpayQRInput = document.getElementById('gpay-qr-url');
    const gpayQRPreview = document.getElementById('gpay-qr-preview');
    
    if (gpayQRInput) {
        gpayQRInput.value = gpayQRCode;
    }
    
    // Show preview if QR code exists
    if (gpayQRCode && gpayQRPreview) {
        gpayQRPreview.innerHTML = `<img src="${gpayQRCode}" alt="GPay QR Code" style="max-width: 200px; border: 2px solid #667eea; border-radius: 8px; padding: 10px; background: white;">`;
    } else if (gpayQRPreview) {
        gpayQRPreview.innerHTML = '';
    }
    
    if (items.length === 0) {
        manageMenuList.innerHTML = '<p>No menu items. Add your first item below.</p>';
        return;
    }
    
    manageMenuList.innerHTML = items.map(item => `
        <div class="manage-menu-item">
            <div class="manage-item-info">
                <img src="${item.image}" alt="${item.name}" class="manage-item-image">
                <div>
                    <h4>${item.name}</h4>
                    <p>${item.description}</p>
                    <p><strong>Price:</strong> ₹${item.price.toFixed(2)} | <strong>Category:</strong> ${item.category}</p>
                </div>
            </div>
            <div class="manage-item-actions">
                <button class="btn btn-secondary" onclick="editMenuItem(${item.id})">Edit</button>
                <button class="btn btn-danger" onclick="deleteMenuItemConfirm(${item.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

// Payment Functions
// Get selected payment method
function getSelectedPaymentMethod() {
    const activeTab = document.querySelector('.payment-tab.active');
    return activeTab ? activeTab.dataset.method : 'cash';
}

// Place Order function
function handlePlaceOrder() {
    const cart = getCart();
    if (cart.length === 0) {
        alert('Please add items to the cart first.');
        return;
    }
    
    const paymentMethod = getSelectedPaymentMethod();
    
    if (paymentMethod === 'scan') {
        // Open GPay modal for scan
        openGPayModal();
    } else if (paymentMethod === 'card') {
        // For card payment, show similar to GPay
        openGPayModal(); // Using same modal for now
    } else {
        // Cash payment
        openCashModal();
    }
}

// Print Order Bill
function printOrderBill() {
    const cart = getCart();
    const total = calculateTotal();
    const subtotal = total;
    const tax = subtotal * 0.05;
    const donation = 1.00;
    const totalPayable = subtotal + tax + donation;
    const paymentMethod = getSelectedPaymentMethod();
    
    const date = new Date().toLocaleString();
    const time = new Date().toLocaleTimeString();
    
    const billContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Bill Receipt</title>
            <style>
                @media print {
                    body { margin: 0; padding: 10px; }
                    @page { size: auto; margin: 0; }
                }
                body { 
                    font-family: 'Courier New', monospace; 
                    padding: 20px;
                    max-width: 300px;
                    margin: 0 auto;
                }
                .bill-header-receipt {
                    text-align: center;
                    margin-bottom: 15px;
                }
                .bill-header-receipt h2 {
                    font-size: 18px;
                    font-weight: bold;
                    margin: 5px 0;
                    letter-spacing: 1px;
                }
                .bill-header-receipt p {
                    margin: 3px 0;
                    font-size: 12px;
                }
                .bill-items-receipt {
                    margin: 15px 0;
                }
                .bill-item-receipt {
                    display: flex;
                    justify-content: space-between;
                    margin: 5px 0;
                    font-size: 13px;
                }
                .bill-item-name {
                    flex: 1;
                }
                .bill-item-price {
                    font-weight: bold;
                }
                .bill-item-detail {
                    font-size: 11px;
                    color: #666;
                    margin-left: 10px;
                    margin-bottom: 5px;
                }
                .bill-total-receipt {
                    margin: 15px 0;
                    text-align: center;
                }
                .bill-total-receipt p {
                    margin: 5px 0;
                    font-size: 12px;
                }
                .bill-total-row {
                    display: flex;
                    justify-content: space-between;
                    font-weight: bold;
                    font-size: 14px;
                    margin: 8px 0;
                    padding: 0 10px;
                }
                .bill-footer-receipt {
                    text-align: center;
                    margin-top: 15px;
                    font-size: 12px;
                }
                .bill-footer-receipt p {
                    margin: 3px 0;
                }
            </style>
        </head>
        <body>
            ${generateBillReceipt(cart, totalPayable, paymentMethod)}
        </body>
        </html>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(billContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
}

function openPaymentMethodModal() {
    // Deprecated - payment method now selected via tabs
    handlePlaceOrder();
}

function closePaymentMethodModal() {
    // Deprecated
}

function openGPayModal() {
    const total = calculateTotal();
    const gpayQRCode = localStorage.getItem('gpayQRCode');
    const gpayImage = document.getElementById('gpay-qr-image');
    const gpayAmount = document.getElementById('gpay-amount');
    const gpayContainer = document.getElementById('gpay-qr-container');
    
    gpayAmount.textContent = total.toFixed(2);
    
    // Reset container structure
    gpayContainer.innerHTML = `
        <img id="gpay-qr-image" src="" alt="GPay QR Code" style="max-width: 100%;">
        <p>Total Amount: ₹<span id="gpay-amount">${total.toFixed(2)}</span></p>
        <p class="payment-instruction">Scan the QR code to pay with GPay</p>
    `;
    
    const newGpayImage = document.getElementById('gpay-qr-image');
    
    if (gpayQRCode) {
        newGpayImage.src = gpayQRCode;
        newGpayImage.style.display = 'block';
        newGpayImage.onerror = function() {
            this.style.display = 'none';
            gpayContainer.innerHTML = `
                <p style="color: #dc3545; padding: 20px;">Invalid QR Code image. Please check the URL in Manage Menu.</p>
                <p>Total Amount: ₹${total.toFixed(2)}</p>
            `;
        };
    } else {
        newGpayImage.style.display = 'none';
        gpayContainer.innerHTML = `
            <p style="color: #dc3545; padding: 20px;">GPay QR Code not set. Please set it in Manage Menu.</p>
            <p>Total Amount: ₹${total.toFixed(2)}</p>
        `;
    }
    
    document.getElementById('gpay-modal').style.display = 'block';
}

function closeGPayModal() {
    document.getElementById('gpay-modal').style.display = 'none';
}

function openCashModal() {
    const total = calculateTotal();
    const tax = total * 0.05;
    const donation = 1.00;
    const totalPayable = total + tax + donation;
    
    document.getElementById('cash-amount').textContent = totalPayable.toFixed(2);
    
    // Reset received amount and return amount
    const receivedAmountInput = document.getElementById('received-amount');
    const returnAmountContainer = document.getElementById('return-amount-container');
    
    if (receivedAmountInput) {
        receivedAmountInput.value = '';
        receivedAmountInput.focus();
    }
    
    if (returnAmountContainer) {
        returnAmountContainer.style.display = 'none';
    }
    
    // Show cash payment container and hide bill receipt
    const cashPaymentContainer = document.querySelector('.cash-payment-container');
    const cashBillReceipt = document.getElementById('cash-bill-receipt');
    if (cashPaymentContainer) cashPaymentContainer.style.display = 'block';
    if (cashBillReceipt) {
        cashBillReceipt.style.display = 'none';
        cashBillReceipt.innerHTML = '';
    }
    
    closePaymentMethodModal();
    document.getElementById('cash-modal').style.display = 'block';
    
    // Calculate return amount when received amount changes
    if (receivedAmountInput) {
        // Use oninput for immediate calculation
        receivedAmountInput.oninput = function() {
            calculateReturnAmount(totalPayable);
        };
    }
}

function calculateReturnAmount(totalPayable) {
    const receivedAmountInput = document.getElementById('received-amount');
    const returnAmountContainer = document.getElementById('return-amount-container');
    const returnAmountEl = document.getElementById('return-amount');
    
    if (!receivedAmountInput || !returnAmountContainer || !returnAmountEl) return;
    
    const receivedAmount = parseFloat(receivedAmountInput.value) || 0;
    
    if (receivedAmount > 0) {
        const returnAmount = receivedAmount - totalPayable;
        returnAmountEl.textContent = returnAmount.toFixed(2);
        returnAmountContainer.style.display = 'block';
        
        // Highlight if insufficient amount
        if (returnAmount < 0) {
            returnAmountEl.style.color = '#dc3545';
            returnAmountEl.textContent = '₹' + Math.abs(returnAmount).toFixed(2) + ' (Insufficient)';
        } else {
            returnAmountEl.style.color = '#28a745';
            returnAmountEl.textContent = '₹' + returnAmount.toFixed(2);
        }
    } else {
        returnAmountContainer.style.display = 'none';
    }
}

function closeCashModal() {
    document.getElementById('cash-modal').style.display = 'none';
}

function printBill() {
    const cart = getCart();
    const total = calculateTotal();
    const date = new Date().toLocaleString();
    
    const billContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Bill Receipt</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                .bill-header { text-align: center; margin-bottom: 20px; }
                .bill-items { margin: 20px 0; }
                .bill-item { display: flex; justify-content: space-between; margin: 10px 0; }
                .bill-total { border-top: 2px solid #000; padding-top: 10px; margin-top: 20px; }
                .bill-footer { margin-top: 20px; text-align: center; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="bill-header">
                <h1>Restaurant POS</h1>
                <p>Bill Receipt</p>
                <p>Date: ${date}</p>
            </div>
            <div class="bill-items">
                ${cart.map(item => `
                    <div class="bill-item">
                        <span>${item.name} x ${item.quantity}</span>
                        <span>₹${item.subtotal.toFixed(2)}</span>
                    </div>
                `).join('')}
            </div>
            <div class="bill-total">
                <div class="bill-item">
                    <strong>Total:</strong>
                    <strong>₹${total.toFixed(2)}</strong>
                </div>
            </div>
            <div class="bill-footer">
                <p>Thank you for your visit!</p>
            </div>
        </body>
        </html>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(billContent);
    printWindow.document.close();
    printWindow.print();
}

function generateBillReceipt(cart, totalPayable, paymentMethod) {
    const date = new Date().toLocaleString();
    const time = new Date().toLocaleTimeString();
    const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
    const tax = subtotal * 0.05;
    const donation = 1.00;
    
    return `
        <div class="bill-receipt-content">
            <div class="bill-header-receipt">
                <h2>RESTAURANT POS</h2>
                <p>========================</p>
                <p>Date: ${date}</p>
                <p>Time: ${time}</p>
                <p>Payment: ${paymentMethod || 'Cash'}</p>
                <p>========================</p>
            </div>
            <div class="bill-items-receipt">
                ${cart.map(item => {
                    const pricePerItem = item.price.toFixed(2);
                    return `
                        <div class="bill-item-receipt">
                            <div class="bill-item-name">${item.name} x ${item.quantity}</div>
                            <div class="bill-item-price">₹${item.subtotal.toFixed(2)}</div>
                        </div>
                        <div class="bill-item-detail">@ ₹${pricePerItem} each</div>
                    `;
                }).join('')}
            </div>
            <div class="bill-total-receipt">
                <p>========================</p>
                <div class="bill-total-row">
                    <span>Subtotal:</span>
                    <span>₹${subtotal.toFixed(2)}</span>
                </div>
                <div class="bill-total-row">
                    <span>Tax:</span>
                    <span>₹${tax.toFixed(2)}</span>
                </div>
                <div class="bill-total-row">
                    <span>Donation:</span>
                    <span>₹${donation.toFixed(2)}</span>
                </div>
                <div class="bill-total-row">
                    <span>TOTAL:</span>
                    <span>₹${totalPayable.toFixed(2)}</span>
                </div>
                <p>========================</p>
            </div>
            <div class="bill-footer-receipt">
                <p>Thank you for your visit!</p>
                <p>Visit again!</p>
            </div>
        </div>
    `;
}

function showBillInModal(paymentMethod) {
    const cart = getCart();
    const subtotal = calculateTotal();
    const tax = subtotal * 0.05;
    const donation = 1.00;
    const totalPayable = subtotal + tax + donation;
    
    // Hide QR section and show bill
    const qrSection = document.getElementById('gpay-qr-section');
    const billReceipt = document.getElementById('gpay-bill-receipt');
    const modalActions = document.getElementById('gpay-modal-actions');
    
    if (qrSection) qrSection.style.display = 'none';
    if (billReceipt) {
        billReceipt.innerHTML = generateBillReceipt(cart, totalPayable, paymentMethod);
        billReceipt.style.display = 'block';
    }
    
    // Hide payment buttons and show print and close buttons
    if (modalActions) {
        modalActions.innerHTML = '<button class="btn btn-primary" id="print-bill-btn-modal">Print</button><button class="btn btn-secondary" id="close-after-payment-btn">Close</button>';
        // Reattach event listeners
        document.getElementById('print-bill-btn-modal').addEventListener('click', function() {
            printBillReceipt(cart, totalPayable, paymentMethod);
            closeGPayModal();
            clearCart();
            renderCart();
            resetGPayModal();
        });
        document.getElementById('close-after-payment-btn').addEventListener('click', function() {
            closeGPayModal();
            clearCart();
            renderCart();
            resetGPayModal();
        });
    }
}

function receivePayment(paymentMethod) {
    const cart = getCart();
    if (cart.length === 0) {
        alert('Cart is empty.');
        return;
    }
    
    const subtotal = calculateTotal();
    const tax = subtotal * 0.05;
    const donation = 1.00;
    const totalPayable = subtotal + tax + donation;
    
    const transaction = {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        timestamp: new Date().toISOString(),
        items: [...cart],
        total: totalPayable,
        subtotal: subtotal,
        tax: tax,
        donation: donation,
        paymentMethod: paymentMethod || 'Cash'
    };
    
    const transactions = getTransactions();
    transactions.push(transaction);
    saveTransactions(transactions);
    
    // Show bill in modal instead of printing
    if (paymentMethod === 'GPay' || paymentMethod === 'Scan') {
        showBillInModal(paymentMethod);
    } else if (paymentMethod === 'Card') {
        // For card, treat similar to GPay
        showBillInModal(paymentMethod);
    } else {
        // For cash, show bill with received/return amounts
        const cashModal = document.getElementById('cash-modal');
        const cashPaymentContainer = cashModal ? cashModal.querySelector('.cash-payment-container') : null;
        const cashBillReceipt = document.getElementById('cash-bill-receipt');
        const receivedAmountInput = document.getElementById('received-amount');
        const receivedAmount = receivedAmountInput ? parseFloat(receivedAmountInput.value) || 0 : 0;
        const returnAmount = receivedAmount - totalPayable;
        
        if (cashPaymentContainer) {
            cashPaymentContainer.style.display = 'none';
        }
        
        if (cashBillReceipt) {
            cashBillReceipt.style.display = 'block';
            cashBillReceipt.innerHTML = `
                <div class="bill-receipt-content">
                    <div class="cash-summary">
                        <div class="cash-summary-row">
                            <span>Total Amount:</span>
                            <span>₹${totalPayable.toFixed(2)}</span>
                        </div>
                        <div class="cash-summary-row">
                            <span>Received Amount:</span>
                            <span>₹${receivedAmount.toFixed(2)}</span>
                        </div>
                        <div class="cash-summary-row ${returnAmount < 0 ? 'insufficient' : 'return'}" style="border-top: 2px solid #333; padding-top: 8px; margin-top: 8px; font-weight: 600;">
                            <span>${returnAmount < 0 ? 'Insufficient' : 'Return'} Amount:</span>
                            <span style="color: ${returnAmount < 0 ? '#dc3545' : '#28a745'};">₹${Math.abs(returnAmount).toFixed(2)}</span>
                        </div>
                    </div>
                    ${generateBillReceipt(cart, totalPayable, paymentMethod)}
                </div>
                <div class="modal-actions">
                    <button class="btn btn-primary" id="print-cash-bill-btn-modal">Print</button>
                    <button class="btn btn-secondary" id="close-cash-payment-btn">Close</button>
                </div>
            `;
            
            document.getElementById('print-cash-bill-btn-modal').addEventListener('click', function() {
                printBillReceipt(cart, totalPayable, paymentMethod);
                closeCashModal();
                clearCart();
                renderCart();
            });
            document.getElementById('close-cash-payment-btn').addEventListener('click', function() {
                closeCashModal();
                clearCart();
                renderCart();
            });
        }
    }
    
    // Refresh reports if on reports section
    const reportsSection = document.getElementById('reports-section');
    if (reportsSection && reportsSection.style.display !== 'none') {
        const fromDate = document.getElementById('report-from-date').value;
        const toDate = document.getElementById('report-to-date').value;
        if (fromDate && toDate) {
            viewReport();
        }
    }
}

function cancelOrder() {
    const cart = getCart();
    if (cart.length === 0) {
        alert('Cart is empty.');
        return;
    }
    
    if (!confirm('Are you sure you want to cancel this order?')) {
        return;
    }
    
    const total = calculateTotal();
    const cancelledItem = {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        timestamp: new Date().toISOString(),
        items: [...cart],
        total: total
    };
    
    const cancelledItems = getCancelledItems();
    cancelledItems.push(cancelledItem);
    saveCancelledItems(cancelledItems);
    
    clearCart();
    closePaymentMethodModal();
    closeGPayModal();
    closeCashModal();
    alert('Order cancelled and added to cancelled items report.');
    
    // Refresh cancelled items if on cancelled tab
    if (document.getElementById('cancelled-tab').classList.contains('active')) {
        const dateInput = document.getElementById('cancelled-date');
        if (dateInput.value) {
            viewCancelledItems(dateInput.value);
        }
    }
}

// Cancelled Items Report
function viewCancelledItems(date) {
    const cancelledItems = getCancelledItems();
    const filteredItems = cancelledItems.filter(item => item.date === date);
    
    if (filteredItems.length === 0) {
        document.getElementById('cancelled-results').innerHTML = `
            <p>No cancelled items found for ${new Date(date).toLocaleDateString()}.</p>
        `;
        return;
    }
    
    const totalCancelled = filteredItems.reduce((sum, item) => sum + item.total, 0);
    
    const itemsHTML = filteredItems.map(item => {
        const time = new Date(item.timestamp).toLocaleTimeString();
        const itemsList = item.items.map(i => `${i.name} x ${i.quantity}`).join(', ');
        return `
            <div class="cancelled-item-card">
                <div class="cancelled-item-header">
                    <span><strong>Time:</strong> ${time}</span>
                    <span><strong>Total:</strong> ₹${item.total.toFixed(2)}</span>
                </div>
                <div class="cancelled-item-details">
                    <p><strong>Items:</strong> ${itemsList}</p>
                </div>
            </div>
        `;
    }).join('');
    
    document.getElementById('cancelled-results').innerHTML = `
        <div class="cancelled-summary">
            <h3>Cancelled Items for ${new Date(date).toLocaleDateString()}</h3>
            <div class="summary-stats">
                <div class="stat-card">
                    <h4>Total Cancelled Orders</h4>
                    <p class="stat-value">${filteredItems.length}</p>
                </div>
                <div class="stat-card">
                    <h4>Total Cancelled Amount</h4>
                    <p class="stat-value">₹${totalCancelled.toFixed(2)}</p>
                </div>
            </div>
            <h4>Cancelled Orders Details</h4>
            <div class="cancelled-items-list">
                ${itemsHTML}
            </div>
        </div>
    `;
}

// Reports Functions
let currentReportData = null; // Store current report data for PDF download

function viewReport() {
    const fromDate = document.getElementById('report-from-date').value;
    const toDate = document.getElementById('report-to-date').value;
    
    if (!fromDate || !toDate) {
        alert('Please select both From Date and To Date.');
        return;
    }
    
    if (new Date(fromDate) > new Date(toDate)) {
        alert('From Date cannot be greater than To Date.');
        return;
    }
    
    const transactions = getTransactions();
    
    const filteredTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        const from = new Date(fromDate);
        const to = new Date(toDate);
        return tDate >= from && tDate <= to;
    });
    
    if (filteredTransactions.length === 0) {
        document.getElementById('report-results').innerHTML = `
            <p>No transactions found for the selected date range (${new Date(fromDate).toLocaleDateString()} to ${new Date(toDate).toLocaleDateString()}).</p>
        `;
        document.getElementById('download-report-btn').style.display = 'none';
        currentReportData = null;
        return;
    }
    
    const totalSales = filteredTransactions.reduce((sum, t) => sum + t.total, 0);
    const totalOrders = filteredTransactions.length;
    
    // Calculate item-wise sales
    const itemSales = {};
    filteredTransactions.forEach(t => {
        t.items.forEach(item => {
            if (!itemSales[item.name]) {
                itemSales[item.name] = { quantity: 0, revenue: 0 };
            }
            itemSales[item.name].quantity += item.quantity;
            itemSales[item.name].revenue += item.subtotal;
        });
    });
    
    const itemWiseHTML = Object.entries(itemSales)
        .map(([name, data]) => `
            <tr>
                <td>${name}</td>
                <td>${data.quantity}</td>
                <td>₹${data.revenue.toFixed(2)}</td>
            </tr>
        `).join('');
    
    const fromDateFormatted = new Date(fromDate).toLocaleDateString();
    const toDateFormatted = new Date(toDate).toLocaleDateString();
    
    document.getElementById('report-results').innerHTML = `
        <div class="report-summary">
            <h3>Sales Summary</h3>
            <p style="color: #666; margin-bottom: 20px;">Period: ${fromDateFormatted} to ${toDateFormatted}</p>
            <div class="summary-stats">
                <div class="stat-card">
                    <h4>Total Sales</h4>
                    <p class="stat-value">₹${totalSales.toFixed(2)}</p>
                </div>
                <div class="stat-card">
                    <h4>Total Orders</h4>
                    <p class="stat-value">${totalOrders}</p>
                </div>
                <div class="stat-card">
                    <h4>Average Order Value</h4>
                    <p class="stat-value">₹${(totalSales / totalOrders).toFixed(2)}</p>
                </div>
            </div>
            <h4>Item-wise Sales</h4>
            <table class="sales-table">
                <thead>
                    <tr>
                        <th>Item Name</th>
                        <th>Quantity Sold</th>
                        <th>Revenue</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemWiseHTML}
                </tbody>
            </table>
        </div>
    `;
    
    // Store data for PDF download
    currentReportData = {
        fromDate,
        toDate,
        fromDateFormatted,
        toDateFormatted,
        totalSales,
        totalOrders,
        itemSales
    };
    
    // Show download button
    document.getElementById('download-report-btn').style.display = 'inline-block';
}

function downloadReportAsPDF() {
    if (!currentReportData) {
        alert('Please view a report first before downloading.');
        return;
    }
    
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const { fromDateFormatted, toDateFormatted, totalSales, totalOrders, itemSales } = currentReportData;
        
        // Title
        doc.setFontSize(18);
        doc.text('Sales Report', 105, 20, { align: 'center' });
        
        doc.setFontSize(12);
        doc.text(`Period: ${fromDateFormatted} to ${toDateFormatted}`, 105, 30, { align: 'center' });
        
        // Summary Stats
        let yPos = 45;
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('Summary', 20, yPos);
        
        yPos += 10;
        doc.setFont(undefined, 'normal');
        doc.setFontSize(10);
        doc.text(`Total Sales: ₹${totalSales.toFixed(2)}`, 20, yPos);
        yPos += 7;
        doc.text(`Total Orders: ${totalOrders}`, 20, yPos);
        yPos += 7;
        doc.text(`Average Order Value: ₹${(totalSales / totalOrders).toFixed(2)}`, 20, yPos);
        
        // Item-wise Sales Table
        yPos += 15;
        doc.setFont(undefined, 'bold');
        doc.setFontSize(12);
        doc.text('Item-wise Sales', 20, yPos);
        
        yPos += 10;
        doc.setFontSize(10);
        
        // Table headers
        doc.setFont(undefined, 'bold');
        doc.text('Item Name', 20, yPos);
        doc.text('Quantity', 80, yPos);
        doc.text('Revenue', 130, yPos);
        
        yPos += 7;
        doc.setDrawColor(200, 200, 200);
        doc.line(20, yPos - 3, 190, yPos - 3);
        
        // Table rows
        doc.setFont(undefined, 'normal');
        const itemEntries = Object.entries(itemSales);
        itemEntries.forEach(([name, data]) => {
            if (yPos > 270) {
                doc.addPage();
                yPos = 20;
                // Redraw headers on new page
                doc.setFont(undefined, 'bold');
                doc.text('Item Name', 20, yPos);
                doc.text('Quantity', 80, yPos);
                doc.text('Revenue', 130, yPos);
                yPos += 7;
                doc.line(20, yPos - 3, 190, yPos - 3);
                doc.setFont(undefined, 'normal');
            }
            doc.text(name.substring(0, 30), 20, yPos);
            doc.text(data.quantity.toString(), 80, yPos);
            doc.text(`₹${data.revenue.toFixed(2)}`, 130, yPos);
            yPos += 7;
        });
        
        // Footer
        const pageCount = doc.internal.pages.length - 1;
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.text(`Page ${i} of ${pageCount}`, 105, 285, { align: 'center' });
            doc.text(`Generated on ${new Date().toLocaleString()}`, 105, 290, { align: 'center' });
        }
        
        // Save PDF
        const { fromDate, toDate } = currentReportData;
        const fileName = `Sales_Report_${fromDate}_to_${toDate}.pdf`;
        doc.save(fileName);
    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Error generating PDF. Please try again.');
    }
}

// Menu Management Functions
function editMenuItem(id) {
    const items = getMenuItems();
    const item = items.find(i => i.id === id);
    if (!item) return;
    
    document.getElementById('item-name').value = item.name;
    document.getElementById('item-description').value = item.description;
    document.getElementById('item-price').value = item.price;
    document.getElementById('item-category').value = item.category;
    document.getElementById('item-image').value = item.image;
    
    // Change form to edit mode
    const form = document.getElementById('add-item-form');
    form.dataset.editId = id;
    form.querySelector('button[type="submit"]').textContent = 'Update Item';
    
    // Scroll to form
    document.getElementById('item-name').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function deleteMenuItemConfirm(id) {
    if (confirm('Are you sure you want to delete this menu item?')) {
        deleteMenuItem(id);
        renderMenu();
        renderManageMenu();
    }
}

// Cart Notification
function showCartNotification() {
    const notification = document.getElementById('cart-notification');
    notification.classList.add('show');
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Section Navigation
function switchSection(section) {
    // Sidebar removed - no nav links to update
    
    // Hide all full sections
    document.querySelectorAll('.full-section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Show main content by default
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.style.display = 'flex';
    }
    
    // Handle specific sections
    if (section === 'dashboard') {
        // Dashboard shows menu
        renderMenu(currentCategory);
        renderCart();
    } else if (section === 'manage-dishes') {
        const manageSection = document.getElementById('manage-dishes-section');
        if (manageSection) {
            manageSection.style.display = 'block';
            if (mainContent) mainContent.style.display = 'none';
            renderManageMenu();
        }
    } else if (section === 'reports') {
        const reportsSection = document.getElementById('reports-section');
        if (reportsSection) {
            reportsSection.style.display = 'block';
            if (mainContent) mainContent.style.display = 'none';
            // Set default date range
            const fromDateInput = document.getElementById('report-from-date');
            const toDateInput = document.getElementById('report-to-date');
            if (fromDateInput && !fromDateInput.value) {
                const now = new Date();
                const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
                const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                fromDateInput.value = firstDay.toISOString().split('T')[0];
                toDateInput.value = lastDay.toISOString().split('T')[0];
            }
        }
    } else if (section === 'cancelled') {
        const cancelledSection = document.getElementById('cancelled-section');
        if (cancelledSection) {
            cancelledSection.style.display = 'block';
            if (mainContent) mainContent.style.display = 'none';
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('cancelled-date').value = today;
            viewCancelledItems(today);
        }
    } else if (section === 'logout') {
        if (confirm('Are you sure you want to logout?')) {
            // Handle logout
            alert('Logged out successfully!');
        }
    }
}

// Order Line Functions
function renderOrderLine(filter = 'all') {
    // For now, this is a placeholder - orders will be loaded from transactions
    const transactions = getTransactions();
    // Filter transactions by status/type
    // This can be expanded later with order status management
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Initialize data
    initializeData();
    
    // Render initial content
    renderMenu('all');
    renderCart();
    updateCategoryCounts(); // This will also display codes
    displayItemCodes(getMenuItems()); // Ensure codes are displayed on load
    
    // Set dashboard as active initially
    switchSection('dashboard');
    
    // Sidebar navigation removed
    
    // Admin dropdown
    const adminProfile = document.getElementById('admin-profile');
    const adminDropdown = document.getElementById('admin-dropdown');
    
    if (adminProfile && adminDropdown) {
        adminProfile.addEventListener('click', function(e) {
            e.stopPropagation();
            adminDropdown.classList.toggle('show');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!adminProfile.contains(e.target)) {
                adminDropdown.classList.remove('show');
            }
        });
        
        // Admin menu items
        document.querySelectorAll('.admin-menu-item').forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                const section = this.dataset.section;
                adminDropdown.classList.remove('show');
                if (section) {
                    switchSection(section);
                }
            });
        });
    }
    
    // Code input (billing area)
    const codeInput = document.getElementById('code-input');
    if (codeInput) {
        codeInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                handleTypingArea(this, this);
            }
        });
        
        codeInput.addEventListener('blur', function() {
            if (this.value.trim()) {
                handleTypingArea(this, this);
            }
        });
    }
    
    // Category tabs
    document.querySelectorAll('.category-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            const category = this.dataset.category;
            currentCategory = category;
            renderMenu(category);
        });
    });
    
    // Order tabs removed - no longer needed
    
    // Payment method tabs
    document.querySelectorAll('.payment-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.payment-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Add/Edit menu item form
    document.getElementById('add-item-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('item-name').value.trim();
        const description = document.getElementById('item-description').value.trim();
        const price = document.getElementById('item-price').value;
        const category = document.getElementById('item-category').value.trim();
        const image = document.getElementById('item-image').value.trim();
        const editId = this.dataset.editId;
        
        if (editId) {
            updateMenuItem(parseInt(editId), name, description, price, category, image);
            this.dataset.editId = '';
            this.querySelector('button[type="submit"]').textContent = 'Add Item';
        } else {
            addMenuItem(name, description, price, category, image);
        }
        
        this.reset();
        renderMenu(currentCategory);
        renderManageMenu();
        updateCategoryCounts();
    });
    
    // Place Order button
    const placeOrderBtn = document.getElementById('place-order-btn');
    if (placeOrderBtn) {
        placeOrderBtn.addEventListener('click', function() {
            handlePlaceOrder();
        });
    }
    
    // Print Order button removed
    
    // Delete Order button (Clear Cart)
    const deleteOrderBtn = document.getElementById('delete-order-btn');
    
    if (deleteOrderBtn) {
        deleteOrderBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to clear the cart?')) {
                clearCart();
            }
        });
    }
    
    // Close section buttons
    const closeReportsBtn = document.getElementById('close-reports-btn');
    if (closeReportsBtn) {
        closeReportsBtn.addEventListener('click', function() {
            document.getElementById('reports-section').style.display = 'none';
            document.querySelector('.main-content').style.display = 'flex';
            switchSection('dashboard');
        });
    }
    
    const closeManageBtn = document.getElementById('close-manage-btn');
    if (closeManageBtn) {
        closeManageBtn.addEventListener('click', function() {
            document.getElementById('manage-dishes-section').style.display = 'none';
            document.querySelector('.main-content').style.display = 'flex';
            switchSection('dashboard');
        });
    }
    
    const closeCancelledBtn = document.getElementById('close-cancelled-btn');
    if (closeCancelledBtn) {
        closeCancelledBtn.addEventListener('click', function() {
            document.getElementById('cancelled-section').style.display = 'none';
            document.querySelector('.main-content').style.display = 'flex';
            switchSection('dashboard');
        });
    }
    
    // Payment Method Selection
    // Payment method selection now done via tabs in order panel
    
    // GPay Modal buttons
    document.getElementById('receive-payment-btn').addEventListener('click', function() {
        receivePayment('GPay');
    });
    
    document.getElementById('not-receive-btn').addEventListener('click', function() {
        closeGPayModal();
        // Do nothing - just close modal, payment not received
    });
    
    document.getElementById('cancel-gpay-btn').addEventListener('click', function() {
        cancelOrder();
    });
    
    document.getElementById('close-gpay-modal').addEventListener('click', function() {
        closeGPayModal();
        resetGPayModal();
    });
    
    // Close after payment button (dynamically created)
    document.addEventListener('click', function(e) {
        if (e.target.id === 'close-after-payment-btn') {
            closeGPayModal();
            clearCart();
            renderCart();
            resetGPayModal();
        }
    });
    
    // Cash Modal buttons
    document.getElementById('receive-cash-btn').addEventListener('click', function() {
        const receivedAmountInput = document.getElementById('received-amount');
        const receivedAmount = receivedAmountInput ? parseFloat(receivedAmountInput.value) || 0 : 0;
        const total = calculateTotal();
        const tax = total * 0.05;
        const donation = 1.00;
        const totalPayable = total + tax + donation;
        
        if (receivedAmount <= 0) {
            alert('Please enter the received amount.');
            receivedAmountInput?.focus();
            return;
        }
        
        if (receivedAmount < totalPayable) {
            const insufficient = totalPayable - receivedAmount;
            if (!confirm(`Received amount is ₹${insufficient.toFixed(2)} less than the total. Do you still want to proceed?`)) {
                return;
            }
        }
        
        receivePayment('Cash');
    });
    
    document.getElementById('cancel-cash-btn').addEventListener('click', function() {
        cancelOrder();
    });
    
    document.getElementById('close-cash-modal').addEventListener('click', function() {
        closeCashModal();
    });
    
    // View Report button
    document.getElementById('view-report-btn').addEventListener('click', function() {
        viewReport();
    });
    
    // Download Report button
    document.getElementById('download-report-btn').addEventListener('click', function() {
        downloadReportAsPDF();
    });
    
    // View Cancelled Items button
    document.getElementById('view-cancelled-btn').addEventListener('click', function() {
        const date = document.getElementById('cancelled-date').value;
        if (!date) {
            alert('Please select a date first.');
            return;
        }
        viewCancelledItems(date);
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', function(e) {
        const paymentMethodModal = document.getElementById('payment-method-modal');
        const gpayModal = document.getElementById('gpay-modal');
        const cashModal = document.getElementById('cash-modal');
        
        if (e.target === paymentMethodModal) {
            closePaymentMethodModal();
        }
        if (e.target === gpayModal) {
            closeGPayModal();
        }
        if (e.target === cashModal) {
            closeCashModal();
        }
    });
    
    // Set default date range to current month
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const fromDateInput = document.getElementById('report-from-date');
    const toDateInput = document.getElementById('report-to-date');
    
    if (fromDateInput) {
        fromDateInput.value = firstDay.toISOString().split('T')[0];
    }
    if (toDateInput) {
        toDateInput.value = lastDay.toISOString().split('T')[0];
    }
    
    // Go to Cart button in notification - just show cart sidebar if items exist
    document.getElementById('go-to-cart-btn').addEventListener('click', function() {
        const cart = getCart();
        if (cart.length > 0) {
            const cartSidebar = document.getElementById('cart-sidebar');
            if (cartSidebar) {
                cartSidebar.classList.add('visible');
            }
        }
    });
    
    // Close Cart button
    const closeCartBtn = document.getElementById('close-cart-btn');
    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', function() {
            const cartSidebar = document.getElementById('cart-sidebar');
            if (cartSidebar) {
                cartSidebar.classList.remove('visible');
            }
        });
    }
    
    // Typing Area Event Listeners (Menu only)
    const menuTypingArea = document.getElementById('menu-typing-area');
    
    if (menuTypingArea) {
        menuTypingArea.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                handleTypingArea(this, this);
            }
        });
        
        // Also handle on blur (when user clicks away)
        menuTypingArea.addEventListener('blur', function() {
            if (this.value.trim()) {
                handleTypingArea(this, this);
            }
        });
    }
    
    // Handle GPay QR Code file upload
    document.getElementById('gpay-qr-file').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const base64Image = e.target.result;
                document.getElementById('gpay-qr-url').value = base64Image;
                const preview = document.getElementById('gpay-qr-preview');
                preview.innerHTML = `<img src="${base64Image}" alt="GPay QR Code" style="max-width: 200px; border: 2px solid #667eea; border-radius: 8px; padding: 10px; background: white;">`;
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Save GPay QR Code
    document.getElementById('save-gpay-qr-btn').addEventListener('click', function() {
        const qrUrl = document.getElementById('gpay-qr-url').value.trim();
        if (qrUrl) {
            localStorage.setItem('gpayQRCode', qrUrl);
            alert('GPay QR Code saved successfully!');
            const preview = document.getElementById('gpay-qr-preview');
            if (qrUrl.startsWith('data:') || qrUrl.startsWith('http')) {
                preview.innerHTML = `<img src="${qrUrl}" alt="GPay QR Code" style="max-width: 200px; border: 2px solid #667eea; border-radius: 8px; padding: 10px; background: white;">`;
            }
        } else {
            alert('Please upload an image or enter a valid image URL.');
        }
    });
    
    // Update preview when URL changes
    document.getElementById('gpay-qr-url').addEventListener('input', function() {
        const qrUrl = this.value.trim();
        const preview = document.getElementById('gpay-qr-preview');
        if (qrUrl && (qrUrl.startsWith('data:') || qrUrl.startsWith('http'))) {
            preview.innerHTML = `<img src="${qrUrl}" alt="GPay QR Code" style="max-width: 200px; border: 2px solid #667eea; border-radius: 8px; padding: 10px; background: white;">`;
        } else if (!qrUrl) {
            preview.innerHTML = '';
        }
    });
});
