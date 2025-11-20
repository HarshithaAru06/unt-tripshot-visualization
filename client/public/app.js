// Simple JavaScript for month navigation and data display

let currentMonthIndex = 0;
let monthsData = [];

// Load data when page loads
async function loadData() {
    try {
        const response = await fetch('/tripshot_data.json');
        const data = await response.json();
        monthsData = data.months;
        updateDisplay();
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// Update display with current month data
function updateDisplay() {
    if (monthsData.length === 0) return;
    
    const month = monthsData[currentMonthIndex];
    
    // Update month name
    document.getElementById('current-month').textContent = month.name;
    document.getElementById('routes-month').textContent = month.name;
    
    // Update statistics
    document.getElementById('total-rides').textContent = month.total_rides.toLocaleString();
    document.getElementById('completed-rides').textContent = month.completed_rides.toLocaleString();
    document.getElementById('cancelled-rides').textContent = month.cancelled_rides.toLocaleString();
    document.getElementById('completion-rate').textContent = month.completion_rate.toFixed(1) + '%';
    
    // Update top routes
    const routesList = document.getElementById('routes-list');
    routesList.innerHTML = '';
    
    month.top_routes.forEach(route => {
        const routeItem = document.createElement('div');
        routeItem.className = 'route-item';
        routeItem.innerHTML = `
            <span class="route-name">${route.route}</span>
            <span class="route-count">${route.count}</span>
        `;
        routesList.appendChild(routeItem);
    });
}

// Navigate to previous month
function previousMonth() {
    currentMonthIndex = (currentMonthIndex - 1 + monthsData.length) % monthsData.length;
    updateDisplay();
}

// Navigate to next month
function nextMonth() {
    currentMonthIndex = (currentMonthIndex + 1) % monthsData.length;
    updateDisplay();
}

// Load data when page loads
loadData();
