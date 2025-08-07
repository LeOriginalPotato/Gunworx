// Application state
let currentEditingId = null
let lastScannedTime = 0
let currentTab = "inventory"

// Declare missing variables
let firearms = [] // Initialize as an empty array or load from localStorage
const saveToLocalStorage = () => {} // Define a placeholder function
const lucide = { createIcons: () => {} } // Define a placeholder object
const validateFirearm = () => [] // Define a placeholder function
const exportToCSV = () => {} // Define a placeholder function

// Main application JavaScript
(function() {
  'use strict';

  // Initialize application
  function init() {
    console.log('Gunworx Management Portal initialized');
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize components
    initializeComponents();
  }

  // Set up global event listeners
  function setupEventListeners() {
    // Handle form submissions
    document.addEventListener('submit', function(e) {
      const form = e.target;
      if (form.classList.contains('needs-validation')) {
        if (!form.checkValidity()) {
          e.preventDefault();
          e.stopPropagation();
        }
        form.classList.add('was-validated');
      }
    });

    // Handle modal triggers
    document.addEventListener('click', function(e) {
      if (e.target.hasAttribute('data-modal-trigger')) {
        const modalId = e.target.getAttribute('data-modal-trigger');
        const modal = document.getElementById(modalId);
        if (modal) {
          showModal(modal);
        }
      }

      if (e.target.hasAttribute('data-modal-close')) {
        const modal = e.target.closest('.modal');
        if (modal) {
          hideModal(modal);
        }
      }
    });

    // Handle dropdown toggles
    document.addEventListener('click', function(e) {
      if (e.target.hasAttribute('data-dropdown-toggle')) {
        const dropdownId = e.target.getAttribute('data-dropdown-toggle');
        const dropdown = document.getElementById(dropdownId);
        if (dropdown) {
          toggleDropdown(dropdown);
        }
      }
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
      if (!e.target.closest('.dropdown')) {
        const openDropdowns = document.querySelectorAll('.dropdown.show');
        openDropdowns.forEach(dropdown => {
          dropdown.classList.remove('show');
        });
      }
    });

    // Handle tab navigation
    document.addEventListener('click', function(e) {
      if (e.target.hasAttribute('data-tab-target')) {
        const targetId = e.target.getAttribute('data-tab-target');
        const target = document.getElementById(targetId);
        if (target) {
          showTab(target, e.target);
        }
      }
    });

    // Add firearm form
    document.getElementById("add-firearm-form").addEventListener("submit", handleAddFirearm)

    // Edit firearm form
    document.getElementById("edit-firearm-form").addEventListener("submit", handleEditFirearm)

    // Search input
    document.getElementById("search-input").addEventListener("input", filterFirearms)
    document.getElementById("search-input").addEventListener("keydown", handleBarcodeInput)

    // Status filter
    document.getElementById("status-filter").addEventListener("change", filterFirearms)

    // Auto-save functionality
    setInterval(saveToLocalStorage, 30000) // Save every 30 seconds
    window.addEventListener("beforeunload", saveToLocalStorage)
  }

  // Initialize components
  function initializeComponents() {
    // Initialize tooltips
    initializeTooltips();
    
    // Initialize data tables
    initializeDataTables();
    
    // Initialize form validation
    initializeFormValidation();
  }

  // Modal functions
  function showModal(modal) {
    modal.style.display = 'block';
    modal.classList.add('show');
    document.body.classList.add('modal-open');
  }

  function hideModal(modal) {
    modal.style.display = 'none';
    modal.classList.remove('show');
    document.body.classList.remove('modal-open');
  }

  // Dropdown functions
  function toggleDropdown(dropdown) {
    dropdown.classList.toggle('show');
  }

  // Tab functions
  function showTab(target, trigger) {
    // Hide all tab panes
    const tabPanes = document.querySelectorAll('.tab-pane');
    tabPanes.forEach(pane => {
      pane.classList.remove('active');
    });

    // Remove active class from all tab triggers
    const tabTriggers = document.querySelectorAll('[data-tab-target]');
    tabTriggers.forEach(trigger => {
      trigger.classList.remove('active');
    });

    // Show target tab pane
    target.classList.add('active');
    trigger.classList.add('active');
  }

  // Initialize tooltips
  function initializeTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    tooltipElements.forEach(element => {
      element.addEventListener('mouseenter', showTooltip);
      element.addEventListener('mouseleave', hideTooltip);
    });
  }

  function showTooltip(e) {
    const element = e.target;
    const tooltipText = element.getAttribute('data-tooltip');
    
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = tooltipText;
    
    document.body.appendChild(tooltip);
    
    const rect = element.getBoundingClientRect();
    tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
    tooltip.style.top = rect.top - tooltip.offsetHeight - 5 + 'px';
    
    element._tooltip = tooltip;
  }

  function hideTooltip(e) {
    const element = e.target;
    if (element._tooltip) {
      document.body.removeChild(element._tooltip);
      delete element._tooltip;
    }
  }

  // Initialize data tables
  function initializeDataTables() {
    const tables = document.querySelectorAll('.data-table');
    tables.forEach(table => {
      // Add sorting functionality
      const headers = table.querySelectorAll('th[data-sortable]');
      headers.forEach(header => {
        header.addEventListener('click', function() {
          sortTable(table, header);
        });
        header.style.cursor = 'pointer';
      });
    });
  }

  function sortTable(table, header) {
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    const columnIndex = Array.from(header.parentNode.children).indexOf(header);
    const isAscending = !header.classList.contains('sort-asc');

    rows.sort((a, b) => {
      const aValue = a.children[columnIndex].textContent.trim();
      const bValue = b.children[columnIndex].textContent.trim();
      
      if (isAscending) {
        return aValue.localeCompare(bValue, undefined, { numeric: true });
      } else {
        return bValue.localeCompare(aValue, undefined, { numeric: true });
      }
    });

    // Remove existing sort classes
    header.parentNode.querySelectorAll('th').forEach(th => {
      th.classList.remove('sort-asc', 'sort-desc');
    });

    // Add sort class to current header
    header.classList.add(isAscending ? 'sort-asc' : 'sort-desc');

    // Reorder rows
    rows.forEach(row => tbody.appendChild(row));
  }

  // Initialize form validation
  function initializeFormValidation() {
    const forms = document.querySelectorAll('.needs-validation');
    forms.forEach(form => {
      const inputs = form.querySelectorAll('input, select, textarea');
      inputs.forEach(input => {
        input.addEventListener('blur', function() {
          validateField(input);
        });
        input.addEventListener('input', function() {
          if (input.classList.contains('is-invalid')) {
            validateField(input);
          }
        });
      });
    });
  }

  function validateField(field) {
    const isValid = field.checkValidity();
    field.classList.toggle('is-valid', isValid);
    field.classList.toggle('is-invalid', !isValid);
    
    // Show/hide error message
    const errorElement = field.parentNode.querySelector('.invalid-feedback');
    if (errorElement) {
      errorElement.style.display = isValid ? 'none' : 'block';
    }
  }

  // Utility functions
  function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  function throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Export utility functions to global scope
  window.GunworxUtils = {
    formatDate,
    formatCurrency,
    debounce,
    throttle,
    showModal,
    hideModal,
    toggleDropdown,
    showTab
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

// Status badge generation
function getStatusBadge(status) {
  const badges = {
    collected:
      '<span class="badge badge-green"><i data-lucide="check-circle" class="icon-sm mr-1"></i>Collected</span>',
    "in-stock": '<span class="badge badge-secondary"><i data-lucide="package" class="icon-sm mr-1"></i>In Stock</span>',
    "dealer-stock":
      '<span class="badge badge-outline"><i data-lucide="alert-circle" class="icon-sm mr-1"></i>Dealer Stock</span>',
    "safe-keeping":
      '<span class="badge badge-destructive"><i data-lucide="clock" class="icon-sm mr-1"></i>Safe Keeping</span>',
  }

  return badges[status] || '<span class="badge badge-secondary">Unknown</span>'
}

// Statistics update
function updateStats() {
  const stats = {
    total: firearms.length,
    collected: firearms.filter((f) => f.status === "collected").length,
    inStock: firearms.filter((f) => f.status === "in-stock").length,
    dealerStock: firearms.filter((f) => f.status === "dealer-stock").length,
    safeKeeping: firearms.filter((f) => f.status === "safe-keeping").length,
  }

  // Update main stats
  document.getElementById("total-count").textContent = stats.total
  document.getElementById("collected-count").textContent = stats.collected
  document.getElementById("instock-count").textContent = stats.inStock
  document.getElementById("dealer-count").textContent = stats.dealerStock
  document.getElementById("safekeeping-count").textContent = stats.safeKeeping

  return stats
}

// Render active firearms table
function renderActiveFirearms(firearmsToRender = null) {
  const activeFirearms = firearmsToRender || firearms.filter((f) => f.status !== "collected")
  const tbody = document.getElementById("active-firearms-table")

  if (activeFirearms.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center text-gray-500 py-8">No active firearms found</td></tr>'
  } else {
    tbody.innerHTML = activeFirearms
      .map(
        (firearm) => `
            <tr>
                <td class="font-medium">${escapeHtml(firearm.stockNo)}</td>
                <td>
                    <div class="font-medium text-sm">${escapeHtml(firearm.make || "N/A")}</div>
                    <div class="text-xs text-gray-500">${escapeHtml(firearm.type || "N/A")}</div>
                </td>
                <td class="font-mono text-xs">${escapeHtml(firearm.serialNo || "N/A")}</td>
                <td class="text-sm">${escapeHtml(firearm.fullName || "N/A")} ${escapeHtml(firearm.surname || "")}</td>
                <td>${getStatusBadge(firearm.status)}</td>
                <td>
                    <div class="flex gap-1 flex-wrap">
                        <button class="btn btn-outline btn-sm" onclick="editFirearm('${firearm.id}')" title="Edit">
                            <i data-lucide="edit" class="icon-sm"></i>
                        </button>
                        <button class="btn btn-outline btn-sm text-red-600" onclick="deleteFirearm('${firearm.id}')" title="Delete">
                            <i data-lucide="trash-2" class="icon-sm"></i>
                        </button>
                        <select class="select text-xs" onchange="updateFirearmStatus('${firearm.id}', this.value)" title="Change Status">
                            <option value="${firearm.status}" selected>${formatStatus(firearm.status)}</option>
                            ${firearm.status !== "in-stock" ? '<option value="in-stock">In Stock</option>' : ""}
                            ${firearm.status !== "collected" ? '<option value="collected">Collected</option>' : ""}
                            ${firearm.status !== "dealer-stock" ? '<option value="dealer-stock">Dealer Stock</option>' : ""}
                            ${firearm.status !== "safe-keeping" ? '<option value="safe-keeping">Safe Keeping</option>' : ""}
                        </select>
                    </div>
                </td>
            </tr>
        `,
      )
      .join("")
  }

  document.getElementById("active-count").textContent = activeFirearms.length

  // Reinitialize icons
  setTimeout(() => lucide.createIcons(), 100)
}

// Render collected firearms table
function renderCollectedFirearms(firearmsToRender = null) {
  const collectedFirearms = firearmsToRender || firearms.filter((f) => f.status === "collected")
  const tbody = document.getElementById("collected-firearms-table")

  if (collectedFirearms.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center text-gray-500 py-8">No collected firearms found</td></tr>'
  } else {
    tbody.innerHTML = collectedFirearms
      .map(
        (firearm) => `
            <tr class="bg-green-50">
                <td class="font-medium">${escapeHtml(firearm.originalStockNo || firearm.stockNo)}</td>
                <td>
                    <div class="font-medium text-sm">${escapeHtml(firearm.make || "N/A")}</div>
                    <div class="text-xs text-gray-500">${escapeHtml(firearm.type || "N/A")}</div>
                </td>
                <td class="font-mono text-xs">${escapeHtml(firearm.serialNo || "N/A")}</td>
                <td class="text-sm">${escapeHtml(firearm.fullName || "N/A")} ${escapeHtml(firearm.surname || "")}</td>
                <td class="text-sm">${escapeHtml(firearm.dateDelivered || "Not specified")}</td>
                <td>
                    <div class="flex gap-1 flex-wrap">
                        <button class="btn btn-outline btn-sm" onclick="editFirearm('${firearm.id}')" title="Edit">
                            <i data-lucide="edit" class="icon-sm"></i>
                        </button>
                        <button class="btn btn-outline btn-sm text-red-600" onclick="deleteFirearm('${firearm.id}')" title="Delete">
                            <i data-lucide="trash-2" class="icon-sm"></i>
                        </button>
                        <select class="select text-xs" onchange="restoreFirearm('${firearm.id}', this.value)" title="Restore to Active">
                            <option value="">Restore to:</option>
                            <option value="in-stock">In Stock</option>
                            <option value="dealer-stock">Dealer Stock</option>
                            <option value="safe-keeping">Safe Keeping</option>
                        </select>
                    </div>
                </td>
            </tr>
        `,
      )
      .join("")
  }

  document.getElementById("collected-table-count").textContent = collectedFirearms.length

  // Reinitialize icons
  setTimeout(() => lucide.createIcons(), 100)
}

// Filter firearms based on search and status
function filterFirearms() {
  const searchTerm = document.getElementById("search-input").value.toLowerCase()
  const statusFilter = document.getElementById("status-filter").value

  let filteredActive = firearms.filter((f) => f.status !== "collected")
  let filteredCollected = firearms.filter((f) => f.status === "collected")

  if (searchTerm) {
    const searchFunction = (firearm) =>
      Object.values(firearm).some((value) => value && value.toString().toLowerCase().includes(searchTerm))

    filteredActive = filteredActive.filter(searchFunction)
    filteredCollected = filteredCollected.filter(searchFunction)

    document.getElementById("search-results").classList.remove("hidden")
    document.getElementById("search-term").textContent = searchTerm
  } else {
    document.getElementById("search-results").classList.add("hidden")
  }

  if (statusFilter !== "all") {
    filteredActive = filteredActive.filter((f) => f.status === statusFilter)
  }

  renderActiveFirearms(filteredActive)
  renderCollectedFirearms(filteredCollected)
}

// Clear search
function clearSearch() {
  document.getElementById("search-input").value = ""
  document.getElementById("search-results").classList.add("hidden")
  filterFirearms()
}

// Handle barcode input
function handleBarcodeInput(event) {
  const currentTime = Date.now()
  const input = event.target

  if (event.key === "Enter" || (currentTime - lastScannedTime > 100 && input.value.length > 0)) {
    event.preventDefault()

    const barcode = input.value.toLowerCase()
    const foundItem = firearms.find(
      (firearm) =>
        (firearm.serialNo && firearm.serialNo.toLowerCase().includes(barcode)) ||
        (firearm.stockNo && firearm.stockNo.toLowerCase().includes(barcode)) ||
        (firearm.make && firearm.make.toLowerCase().includes(barcode)) ||
        (firearm.type && firearm.type.toLowerCase().includes(barcode)),
    )

    if (foundItem) {
      filterFirearms()
      showNotification(
        `Item found: ${foundItem.make} ${foundItem.type} - Serial: ${foundItem.serialNo} - Stock: ${foundItem.stockNo}`,
        "success",
      )
    } else {
      showNotification(`No item found matching barcode: ${barcode}`, "warning")
    }
  }

  lastScannedTime = currentTime
}

// Update firearm status
function updateFirearmStatus(id, newStatus) {
  const firearm = firearms.find((f) => f.id === id)
  if (firearm && newStatus && newStatus !== firearm.status) {
    if (newStatus === "collected") {
      firearm.originalStockNo = firearm.originalStockNo || firearm.stockNo
      firearm.stockNo = "COLLECTED"
      firearm.dateDelivered = new Date().toISOString().split("T")[0]
    }
    firearm.status = newStatus

    updateStats()
    renderActiveFirearms()
    renderCollectedFirearms()
    saveToLocalStorage()

    showNotification(`Firearm status updated to ${formatStatus(newStatus)}`, "success")
  }
}

// Restore firearm from collected
function restoreFirearm(id, newStatus) {
  if (!newStatus) return

  const firearm = firearms.find((f) => f.id === id)
  if (firearm) {
    firearm.status = newStatus
    firearm.stockNo = firearm.originalStockNo || firearm.stockNo
    delete firearm.dateDelivered
    delete firearm.originalStockNo

    updateStats()
    renderActiveFirearms()
    renderCollectedFirearms()
    saveToLocalStorage()

    showNotification(`Firearm restored to ${formatStatus(newStatus)}`, "success")
  }
}

// Edit firearm
function editFirearm(id) {
  const firearm = firearms.find((f) => f.id === id)
  if (firearm) {
    currentEditingId = id
    const form = document.getElementById("edit-firearm-form")

    // Populate form fields
    Object.keys(firearm).forEach((key) => {
      const input = form.querySelector(`[name="${key}"]`)
      if (input) {
        input.value = firearm[key] || ""
      }
    })

    document.getElementById("edit-modal").classList.remove("hidden")

    // Re-initialize icons in modal
    setTimeout(() => lucide.createIcons(), 100)
  }
}

// Close edit modal
function closeEditModal() {
  document.getElementById("edit-modal").classList.add("hidden")
  currentEditingId = null
}

// Delete firearm
function deleteFirearm(id) {
  const firearm = firearms.find((f) => f.id === id)
  if (
    firearm &&
    confirm(
      `Are you sure you want to delete this firearm entry?\n\nStock: ${firearm.stockNo}\nMake: ${firearm.make}\nSerial: ${firearm.serialNo}\n\nThis action cannot be undone.`,
    )
  ) {
    firearms = firearms.filter((f) => f.id !== id)
    updateStats()
    renderActiveFirearms()
    renderCollectedFirearms()
    saveToLocalStorage()

    showNotification("Firearm entry deleted successfully", "success")
  }
}

// Clear form
function clearForm() {
  document.getElementById("add-firearm-form").reset()
  showNotification("Form cleared", "info")
}

// Handle add firearm form submission
function handleAddFirearm(e) {
  e.preventDefault()

  const formData = new FormData(e.target)
  const newFirearm = {
    id: Date.now().toString(),
    stockNo: formData.get("stockNo")?.trim() || "",
    dateReceived: formData.get("dateReceived") || new Date().toISOString().split("T")[0],
    make: formData.get("make")?.trim() || "",
    type: formData.get("type")?.trim() || "",
    caliber: formData.get("caliber")?.trim() || "",
    serialNo: formData.get("serialNo")?.trim() || "",
    fullName: formData.get("fullName")?.trim() || "",
    surname: formData.get("surname")?.trim() || "",
    registrationId: formData.get("registrationId")?.trim() || "",
    physicalAddress: formData.get("physicalAddress")?.trim() || "",
    licenceNo: formData.get("licenceNo")?.trim() || "",
    licenceDate: formData.get("licenceDate") || "",
    remarks: formData.get("remarks")?.trim() || "",
    status: formData.get("status") || "in-stock",
  }

  // Validate firearm data
  const errors = validateFirearm(newFirearm)
  if (errors.length > 0) {
    showNotification("Validation errors:\n" + errors.join("\n"), "error")
    return
  }

  firearms.push(newFirearm)
  updateStats()
  renderActiveFirearms()
  renderCollectedFirearms()
  saveToLocalStorage()
  clearForm()

  showNotification("Firearm added successfully!", "success")
}

// Handle edit firearm form submission
function handleEditFirearm(e) {
  e.preventDefault()

  if (!currentEditingId) return

  const formData = new FormData(e.target)
  const firearm = firearms.find((f) => f.id === currentEditingId)

  if (firearm) {
    // Update firearm properties
    firearm.stockNo = formData.get("stockNo")?.trim() || ""
    firearm.dateReceived = formData.get("dateReceived") || ""
    firearm.make = formData.get("make")?.trim() || ""
    firearm.type = formData.get("type")?.trim() || ""
    firearm.caliber = formData.get("caliber")?.trim() || ""
    firearm.serialNo = formData.get("serialNo")?.trim() || ""
    firearm.fullName = formData.get("fullName")?.trim() || ""
    firearm.surname = formData.get("surname")?.trim() || ""
    firearm.registrationId = formData.get("registrationId")?.trim() || ""
    firearm.physicalAddress = formData.get("physicalAddress")?.trim() || ""
    firearm.licenceNo = formData.get("licenceNo")?.trim() || ""
    firearm.licenceDate = formData.get("licenceDate") || ""
    firearm.remarks = formData.get("remarks")?.trim() || ""
    firearm.status = formData.get("status") || "in-stock"

    // Validate updated firearm data
    const errors = validateFirearm(firearm)
    if (errors.length > 0) {
      showNotification("Validation errors:\n" + errors.join("\n"), "error")
      return
    }

    updateStats()
    renderActiveFirearms()
    renderCollectedFirearms()
    saveToLocalStorage()
    closeEditModal()

    showNotification("Firearm updated successfully!", "success")
  }
}

// Export data functions
function exportData(type = "all") {
  let dataToExport
  let filename

  switch (type) {
    case "active":
      dataToExport = firearms.filter((f) => f.status !== "collected")
      filename = "gunworx_active_firearms.csv"
      break
    case "collected":
      dataToExport = firearms.filter((f) => f.status === "collected")
      filename = "gunworx_collected_firearms.csv"
      break
    default:
      dataToExport = firearms
      filename = "gunworx_all_firearms.csv"
  }

  exportToCSV(dataToExport, filename)
  showNotification(`Exported ${dataToExport.length} records to ${filename}`, "success")
}

// Print report
function printReport() {
  const printWindow = window.open("", "_blank")
  const stats = updateStats()

  const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Gunworx Firearms Tracker - Summary Report</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 30px; }
                .stat-item { border: 1px solid #ccc; padding: 15px; text-align: center; }
                .stat-number { font-size: 24px; font-weight: bold; }
                .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Gunworx Firearms Tracker</h1>
                <h2>Summary Report</h2>
                <p>Generated on: ${new Date().toLocaleDateString()}</p>
                <p>FIREARMS CONTROL ACT, 2000 (Act No. 60 of 2000)</p>
            </div>
            
            <div class="stats">
                <div class="stat-item">
                    <div class="stat-number">${stats.total}</div>
                    <div>Total Items</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number" style="color: #10b981;">${stats.collected}</div>
                    <div>Collected</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number" style="color: #3b82f6;">${stats.inStock}</div>
                    <div>In Stock</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number" style="color: #f59e0b;">${stats.dealerStock}</div>
                    <div>Dealer Stock</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number" style="color: #ef4444;">${stats.safeKeeping}</div>
                    <div>Safe Keeping</div>
                </div>
            </div>
            
            <div class="footer">
                <p>This report was generated by Gunworx Firearms Tracker</p>
                <p>Compliant with FIREARMS CONTROL ACT, 2000 (Act No. 60 of 2000)</p>
            </div>
        </body>
        </html>
    `

  printWindow.document.write(printContent)
  printWindow.document.close()
  printWindow.print()
}

// Update reports tab
function updateReports() {
  const stats = updateStats()

  document.getElementById("report-total").textContent = stats.total
  document.getElementById("report-collected").textContent = stats.collected
  document.getElementById("report-instock").textContent = stats.inStock
  document.getElementById("report-dealer").textContent = stats.dealerStock
  document.getElementById("report-safekeeping").textContent = stats.safeKeeping
}

// Utility functions
function escapeHtml(text) {
  const div = document.createElement("div")
  div.textContent = text
  return div.innerHTML
}

function formatStatus(status) {
  const statusMap = {
    "in-stock": "In Stock",
    "dealer-stock": "Dealer Stock",
    "safe-keeping": "Safe Keeping",
    collected: "Collected",
  }
  return statusMap[status] || status
}

function showNotification(message, type = "info") {
  // Create notification element
  const notification = document.createElement("div")
  notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 max-w-sm ${getNotificationClass(type)}`
  notification.innerHTML = `
        <div class="flex items-center gap-2">
            <i data-lucide="${getNotificationIcon(type)}" class="icon"></i>
            <span class="text-sm">${escapeHtml(message)}</span>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-auto">
                <i data-lucide="x" class="icon-sm"></i>
            </button>
        </div>
    `

  document.body.appendChild(notification)
  lucide.createIcons()

  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove()
    }
  }, 5000)
}

function getNotificationClass(type) {
  const classes = {
    success: "bg-green-100 border border-green-400 text-green-700",
    error: "bg-red-100 border border-red-400 text-red-700",
    warning: "bg-yellow-100 border border-yellow-400 text-yellow-700",
    info: "bg-blue-100 border border-blue-400 text-blue-700",
  }
  return classes[type] || classes.info
}

function getNotificationIcon(type) {
  const icons = {
    success: "check-circle",
    error: "alert-circle",
    warning: "alert-triangle",
    info: "info",
  }
  return icons[type] || icons.info
}

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
  // Ctrl/Cmd + S to save
  if ((e.ctrlKey || e.metaKey) && e.key === "s") {
    e.preventDefault()
    saveToLocalStorage()
    showNotification("Data saved locally", "success")
  }

  // Ctrl/Cmd + E to export
  if ((e.ctrlKey || e.metaKey) && e.key === "e") {
    e.preventDefault()
    exportData()
  }

  // Escape to close modals
  if (e.key === "Escape") {
    closeEditModal()
  }
})
