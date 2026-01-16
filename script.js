// Restaurant POS System - JavaScript

// Default menu items with placeholder images
const DEFAULT_MENU_ITEMS = [
    { id: 1, name: 'Idly', description: 'Steamed rice cakes', price: 30, category: 'Breakfast', image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&h=300&fit=crop' },
    { id: 2, name: 'Puttu', description: 'Steamed rice cylinders', price: 40, category: 'Breakfast', image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop' },
    { id: 3, name: 'Poori', description: 'Deep-fried bread', price: 35, category: 'Breakfast', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop' },
    { id: 4, name: 'Coffee', description: 'South Indian filter coffee', price: 20, category: 'Beverages', image: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400&h=300&fit=crop' },
    { id: 5, name: 'Dosai', description: 'Crispy rice crepe', price: 50, category: 'Breakfast', image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=300&fit=crop' },
    { id: 6, name: 'Vada', description: 'Savory fried donut', price: 25, category: 'Snacks', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70946?w=400&h=300&fit=crop' },
    { id: 7, name: 'Pazhampori', description: 'Ripe banana fritters', price: 30, category: 'Snacks', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop' }
];

// Initialize data structure
function initializeData() {
    if (!localStorage.getItem('menuItems')) {
        localStorage.setItem('menuItems', JSON.stringify(DEFAULT_MENU_ITEMS));
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
    const newItem = {
        id: newId,
        name,
        description,
        price: parseFloat(price),
        category,
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

// Render Functions
function renderMenu() {
    const menuGrid = document.getElementById('menu-grid');
    const items = getMenuItems();
    
    if (items.length === 0) {
        menuGrid.innerHTML = '<p>No menu items available. Add items in Manage Menu tab.</p>';
        return;
    }
    
    menuGrid.innerHTML = items.map(item => `
        <div class="menu-item" onclick="addToCart(${item.id})">
            <img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/400x300?text=${encodeURIComponent(item.name)}'">
            <div class="menu-item-info">
                <h3>${item.name}</h3>
                <p class="menu-description">${item.description}</p>
                <p class="menu-price">₹${item.price.toFixed(2)}</p>
            </div>
        </div>
    `).join('');
}

function renderCart() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const cart = getCart();
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        cartTotal.textContent = '0.00';
        return;
    }
    
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>₹${item.price.toFixed(2)} each</p>
            </div>
            <div class="cart-item-controls">
                <button class="qty-btn" onclick="updateCartQuantity(${item.itemId}, ${item.quantity - 1})">-</button>
                <span class="qty-display">${item.quantity}</span>
                <button class="qty-btn" onclick="updateCartQuantity(${item.itemId}, ${item.quantity + 1})">+</button>
                <span class="cart-item-total">₹${item.subtotal.toFixed(2)}</span>
                <button class="btn-remove" onclick="removeFromCart(${item.itemId})">Remove</button>
            </div>
        </div>
    `).join('');
    
    const total = calculateTotal();
    cartTotal.textContent = total.toFixed(2);
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
function openPaymentMethodModal() {
    const cart = getCart();
    if (cart.length === 0) {
        alert('Cart is empty. Add items to cart first.');
        return;
    }
    
    document.getElementById('payment-method-modal').style.display = 'block';
}

function closePaymentMethodModal() {
    document.getElementById('payment-method-modal').style.display = 'none';
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
    
    closePaymentMethodModal();
    document.getElementById('gpay-modal').style.display = 'block';
}

function closeGPayModal() {
    document.getElementById('gpay-modal').style.display = 'none';
}

function openCashModal() {
    const total = calculateTotal();
    document.getElementById('cash-amount').textContent = total.toFixed(2);
    
    closePaymentMethodModal();
    document.getElementById('cash-modal').style.display = 'block';
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

function receivePayment(paymentMethod) {
    const cart = getCart();
    if (cart.length === 0) {
        alert('Cart is empty.');
        return;
    }
    
    const total = calculateTotal();
    const transaction = {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        timestamp: new Date().toISOString(),
        items: [...cart],
        total: total,
        paymentMethod: paymentMethod || 'Cash'
    };
    
    const transactions = getTransactions();
    transactions.push(transaction);
    saveTransactions(transactions);
    
    // Auto-print bill after payment
    printBill();
    
    clearCart();
    closeGPayModal();
    closeCashModal();
    alert('Payment received successfully! Bill printed.');
    
    // Refresh reports if on reports tab
    if (document.getElementById('reports-tab').classList.contains('active')) {
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

// Settings Dropdown Functions
function closeSettingsDropdown() {
    const dropdown = document.getElementById('settings-dropdown');
    dropdown.classList.remove('show');
}

// Tab Navigation
function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    // Activate corresponding nav button (only for menu and cart)
    const navBtn = document.querySelector(`.nav-btn[data-tab="${tabName}"]`);
    if (navBtn) {
        navBtn.classList.add('active');
    }
    
    // Refresh content based on tab
    if (tabName === 'menu') {
        renderMenu();
    } else if (tabName === 'cart') {
        renderCart();
    } else if (tabName === 'manage') {
        renderManageMenu();
    } else if (tabName === 'reports') {
        // Set default date range to current month if not already set
        const fromDateInput = document.getElementById('report-from-date');
        const toDateInput = document.getElementById('report-to-date');
        if (fromDateInput && !fromDateInput.value) {
            const now = new Date();
            const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
            const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            fromDateInput.value = firstDay.toISOString().split('T')[0];
            toDateInput.value = lastDay.toISOString().split('T')[0];
        }
    } else if (tabName === 'cancelled') {
        // Set default date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('cancelled-date').value = today;
        viewCancelledItems(today);
    }
    
    // Hide notification when switching to cart
    if (tabName === 'cart') {
        document.getElementById('cart-notification').classList.remove('show');
    }
    
    // Close settings dropdown
    closeSettingsDropdown();
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Initialize data
    initializeData();
    
    // Render initial content
    renderMenu();
    renderCart();
    renderManageMenu();
    
    // Tab navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            switchTab(this.dataset.tab);
            closeSettingsDropdown();
        });
    });
    
    // Settings dropdown toggle
    document.getElementById('settings-toggle').addEventListener('click', function(e) {
        e.stopPropagation();
        const dropdown = document.getElementById('settings-dropdown');
        dropdown.classList.toggle('show');
    });
    
    // Settings menu items navigation
    document.querySelectorAll('.settings-menu-item').forEach(btn => {
        btn.addEventListener('click', function() {
            switchTab(this.dataset.tab);
            closeSettingsDropdown();
        });
    });
    
    // Close settings dropdown when clicking outside
    document.addEventListener('click', function(e) {
        const settingsContainer = document.querySelector('.settings-container');
        if (!settingsContainer.contains(e.target)) {
            closeSettingsDropdown();
        }
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
        renderMenu();
        renderManageMenu();
    });
    
    // Pay Now button - opens payment method selection
    document.getElementById('pay-now-btn').addEventListener('click', function() {
        openPaymentMethodModal();
    });
    
    // Clear Cart button
    document.getElementById('clear-cart-btn').addEventListener('click', function() {
        if (confirm('Are you sure you want to clear the cart?')) {
            clearCart();
        }
    });
    
    // Payment Method Selection
    document.getElementById('cash-payment-btn').addEventListener('click', function() {
        openCashModal();
    });
    
    document.getElementById('gpay-payment-btn').addEventListener('click', function() {
        openGPayModal();
    });
    
    document.getElementById('cancel-payment-btn').addEventListener('click', function() {
        cancelOrder();
    });
    
    // Close Payment Method Modal
    document.getElementById('close-payment-method').addEventListener('click', function() {
        closePaymentMethodModal();
    });
    
    // GPay Modal buttons
    document.getElementById('receive-payment-btn').addEventListener('click', function() {
        receivePayment('GPay');
    });
    
    document.getElementById('cancel-gpay-btn').addEventListener('click', function() {
        cancelOrder();
    });
    
    document.getElementById('close-gpay-modal').addEventListener('click', function() {
        closeGPayModal();
    });
    
    // Cash Modal buttons
    document.getElementById('receive-cash-btn').addEventListener('click', function() {
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
    
    // Go to Cart button in notification
    document.getElementById('go-to-cart-btn').addEventListener('click', function() {
        switchTab('cart');
    });
    
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
