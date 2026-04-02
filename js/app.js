// ============================================================================
// DATA MODELS AND VALIDATION (Task 2.1)
// ============================================================================

/**
 * Validates transaction item name
 * @param {string} item - The item name to validate
 * @returns {Object} Validation result with isValid and error properties
 */
function validateItem(item) {
  if (typeof item !== 'string' || item.trim().length === 0) {
    return { isValid: false, error: 'Item name is required' };
  }
  return { isValid: true };
}

/**
 * Validates transaction amount
 * @param {number} amount - The amount to validate
 * @returns {Object} Validation result with isValid and error properties
 */
function validateAmount(amount) {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return { isValid: false, error: 'Amount must be a valid number' };
  }
  if (amount <= 0) {
    return { isValid: false, error: 'Amount must be greater than zero' };
  }
  return { isValid: true };
}

/**
 * Validates transaction category
 * @param {string} category - The category to validate
 * @param {string[]} validCategories - Array of valid category names
 * @returns {Object} Validation result with isValid and error properties
 */
function validateCategory(category, validCategories) {
  if (typeof category !== 'string' || !validCategories.includes(category)) {
    return { isValid: false, error: 'Please select a valid category' };
  }
  return { isValid: true };
}

/**
 * Creates a Transaction object
 * @param {string} id - Unique identifier
 * @param {string} item - Item name
 * @param {number} amount - Transaction amount
 * @param {string} category - Category name
 * @param {number} timestamp - Unix timestamp
 * @returns {Object} Transaction object
 */
function createTransaction(id, item, amount, category, timestamp) {
  return {
    id,
    item: item.trim(),
    amount,
    category,
    timestamp
  };
}

// ============================================================================
// TRANSACTION MANAGER (Task 2.2)
// ============================================================================

/**
 * TransactionManager - Manages transaction data and business logic
 */
class TransactionManager {
  constructor() {
    this.transactions = [];
    this.categories = ['Food', 'Transport', 'Fun'];
  }

  /**
   * Generates a unique ID for a transaction
   * @returns {string} Unique identifier
   */
  generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Adds a new transaction with validation
   * @param {string} item - Item name
   * @param {number} amount - Transaction amount
   * @param {string} category - Category name
   * @returns {Object|null} Created transaction or null if validation fails
   */
  addTransaction(item, amount, category) {
    // Validate inputs
    const itemValidation = validateItem(item);
    if (!itemValidation.isValid) {
      return null;
    }

    const amountValidation = validateAmount(amount);
    if (!amountValidation.isValid) {
      return null;
    }

    const categoryValidation = validateCategory(category, this.categories);
    if (!categoryValidation.isValid) {
      return null;
    }

    // Create transaction with unique ID and timestamp
    const transaction = createTransaction(
      this.generateId(),
      item,
      amount,
      category,
      Date.now()
    );

    this.transactions.push(transaction);
    return transaction;
  }

  /**
   * Deletes a transaction by ID
   * @param {string} id - Transaction ID to delete
   * @returns {boolean} True if deleted, false if not found
   */
  deleteTransaction(id) {
    const initialLength = this.transactions.length;
    this.transactions = this.transactions.filter(t => t.id !== id);
    return this.transactions.length < initialLength;
  }

  /**
   * Gets all transactions
   * @returns {Object[]} Array of all transactions
   */
  getTransactions() {
    return [...this.transactions];
  }

  /**
   * Calculates total balance (sum of all transaction amounts)
   * @returns {number} Total balance
   */
  getBalance() {
    return this.transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  }

  /**
   * Calculates total spending per category
   * @returns {Map<string, number>} Map of category names to total amounts
   */
  getCategoryTotals() {
    const totals = new Map();
    
    this.transactions.forEach(transaction => {
      const current = totals.get(transaction.category) || 0;
      totals.set(transaction.category, current + transaction.amount);
    });

    return totals;
  }

  /**
   * Gets all available categories (default + custom)
   * @returns {string[]} Array of category names
   */
  getCategories() {
    return [...this.categories];
  }

  /**
   * Adds a custom category (Task 11.1)
   * @param {string} categoryName - Name of the category to add
   * @returns {Object} Result object with success flag and optional error message
   */
  addCategory(categoryName) {
    // Validate category name is non-empty
    if (!categoryName || typeof categoryName !== 'string' || categoryName.trim().length === 0) {
      return { success: false, error: 'Category name cannot be empty' };
    }

    const trimmedName = categoryName.trim();

    // Validate category name is unique (case-insensitive)
    const existingCategory = this.categories.find(
      cat => cat.toLowerCase() === trimmedName.toLowerCase()
    );

    if (existingCategory) {
      return { success: false, error: 'Category already exists' };
    }

    // Add the category
    this.categories.push(trimmedName);
    return { success: true };
  }

  /**
   * Gets sorted transactions based on specified criteria (Task 8.1)
   * @param {string} sortBy - Sort field ('date', 'amount', or 'category')
   * @param {string} order - Sort order ('asc' or 'desc')
   * @returns {Object[]} Array of sorted transactions
   */
  getSortedTransactions(sortBy, order) {
    // Create a copy to avoid mutating the original array
    const sorted = [...this.transactions];

    // Sort based on the specified field
    if (sortBy === 'amount') {
      sorted.sort((a, b) => {
        if (order === 'asc') {
          return a.amount - b.amount;
        } else {
          return b.amount - a.amount;
        }
      });
    } else if (sortBy === 'category') {
      // Sort alphabetically by category name
      sorted.sort((a, b) => {
        const comparison = a.category.localeCompare(b.category);
        if (order === 'asc') {
          return comparison;
        } else {
          return -comparison;
        }
      });
    } else {
      // Default to sorting by date (timestamp)
      sorted.sort((a, b) => {
        if (order === 'asc') {
          return a.timestamp - b.timestamp;
        } else {
          return b.timestamp - a.timestamp;
        }
      });
    }

    return sorted;
  }

  /**
   * Gets transactions filtered by year and month (Task 9.1)
   * @param {number} year - Year to filter by (e.g., 2024)
   * @param {number} month - Month to filter by (1-12)
   * @returns {Object[]} Array of transactions for the specified month
   */
  getTransactionsByMonth(year, month) {
    return this.transactions.filter(transaction => {
      const date = new Date(transaction.timestamp);
      return date.getFullYear() === year && date.getMonth() === month - 1;
    });
  }

  /**
   * Calculates total spending per month (Task 9.1)
   * @returns {Map<string, number>} Map of month keys (YYYY-MM) to total amounts
   */
  getMonthlyTotals() {
    const monthlyTotals = new Map();

    this.transactions.forEach(transaction => {
      const date = new Date(transaction.timestamp);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const monthKey = `${year}-${month}`;

      const currentTotal = monthlyTotals.get(monthKey) || 0;
      monthlyTotals.set(monthKey, currentTotal + transaction.amount);
    });

    return monthlyTotals;
  }
}

// ============================================================================
// STORAGE SERVICE (Task 3.1 & 3.2)
// ============================================================================

/**
 * StorageService - Handles data persistence using Local Storage
 */
class StorageService {
  static KEYS = {
    TRANSACTIONS: 'expense_transactions',
    CATEGORIES: 'expense_categories',
    THEME: 'expense_theme',
    SPENDING_LIMIT: 'expense_limit',
    SORT_PREFERENCE: 'expense_sort'
  };

  /**
   * Saves transactions to Local Storage
   * @param {Object[]} transactions - Array of transaction objects
   */
  saveTransactions(transactions) {
    try {
      const json = JSON.stringify(transactions);
      localStorage.setItem(StorageService.KEYS.TRANSACTIONS, json);
    } catch (error) {
      console.error('Failed to save transactions:', error);
      // Handle storage quota exceeded or other errors
      if (error.name === 'QuotaExceededError') {
        console.error('Storage quota exceeded');
      }
    }
  }

  /**
   * Loads transactions from Local Storage
   * @returns {Object[]} Array of transaction objects, empty array if none found or error
   */
  loadTransactions() {
    try {
      const json = localStorage.getItem(StorageService.KEYS.TRANSACTIONS);
      if (!json) {
        return [];
      }
      const transactions = JSON.parse(json);
      return Array.isArray(transactions) ? transactions : [];
    } catch (error) {
      console.error('Failed to load transactions:', error);
      return [];
    }
  }

  /**
   * Saves custom categories to Local Storage
   * @param {string[]} categories - Array of category names
   */
  saveCategories(categories) {
    try {
      const json = JSON.stringify(categories);
      localStorage.setItem(StorageService.KEYS.CATEGORIES, json);
    } catch (error) {
      console.error('Failed to save categories:', error);
      if (error.name === 'QuotaExceededError') {
        console.error('Storage quota exceeded');
      }
    }
  }

  /**
   * Loads custom categories from Local Storage
   * @returns {string[]} Array of category names, empty array if none found or error
   */
  loadCategories() {
    try {
      const json = localStorage.getItem(StorageService.KEYS.CATEGORIES);
      if (!json) {
        return [];
      }
      const categories = JSON.parse(json);
      return Array.isArray(categories) ? categories : [];
    } catch (error) {
      console.error('Failed to load categories:', error);
      return [];
    }
  }

  /**
   * Saves theme preference to Local Storage
   * @param {string} theme - Theme name ('light' or 'dark')
   */
  saveTheme(theme) {
    try {
      localStorage.setItem(StorageService.KEYS.THEME, theme);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  }

  /**
   * Loads theme preference from Local Storage
   * @returns {string} Theme name, defaults to 'light' if none found
   */
  loadTheme() {
    try {
      const theme = localStorage.getItem(StorageService.KEYS.THEME);
      return theme || 'light';
    } catch (error) {
      console.error('Failed to load theme:', error);
      return 'light';
    }
  }

  /**
   * Saves spending limit to Local Storage
   * @param {number} limit - Spending limit amount
   */
  saveSpendingLimit(limit) {
    try {
      localStorage.setItem(StorageService.KEYS.SPENDING_LIMIT, limit.toString());
    } catch (error) {
      console.error('Failed to save spending limit:', error);
    }
  }

  /**
   * Loads spending limit from Local Storage
   * @returns {number|null} Spending limit or null if none set
   */
  loadSpendingLimit() {
    try {
      const limit = localStorage.getItem(StorageService.KEYS.SPENDING_LIMIT);
      if (!limit) {
        return null;
      }
      const parsed = parseFloat(limit);
      return isNaN(parsed) ? null : parsed;
    } catch (error) {
      console.error('Failed to load spending limit:', error);
      return null;
    }
  }

  /**
   * Saves sort preference to Local Storage
   * @param {string} sortBy - Sort field ('date', 'amount', or 'category')
   * @param {string} order - Sort order ('asc' or 'desc')
   */
  saveSortPreference(sortBy, order) {
    try {
      const preference = { sortBy, order };
      const json = JSON.stringify(preference);
      localStorage.setItem(StorageService.KEYS.SORT_PREFERENCE, json);
    } catch (error) {
      console.error('Failed to save sort preference:', error);
    }
  }

  /**
   * Loads sort preference from Local Storage
   * @returns {Object} Sort preference object with sortBy and order, defaults to date/desc
   */
  loadSortPreference() {
    try {
      const json = localStorage.getItem(StorageService.KEYS.SORT_PREFERENCE);
      if (!json) {
        return { sortBy: 'date', order: 'desc' };
      }
      const preference = JSON.parse(json);
      return preference || { sortBy: 'date', order: 'desc' };
    } catch (error) {
      console.error('Failed to load sort preference:', error);
      return { sortBy: 'date', order: 'desc' };
    }
  }
}

// ============================================================================
// UI CONTROLLER (Task 7.1)
// ============================================================================

/**
 * UIController - Coordinates between model and view layers, handles events
 */
class UIController {
  /**
   * Constructor to initialize controller with dependencies
   * @param {TransactionManager} transactionManager - Transaction manager instance
   * @param {StorageService} storageService - Storage service instance
   */
  constructor(transactionManager, storageService) {
    this.transactionManager = transactionManager;
    this.storageService = storageService;
    
    // View instances will be initialized in init()
    this.transactionView = null;
    this.chartRenderer = null;
    this.themeManager = null;
    
    // Cache DOM element references
    this.form = document.getElementById('transaction-form');
    this.transactionList = document.getElementById('transaction-list');
    this.sortBySelect = document.getElementById('sort-by');
    
    // Track current month filter (null means "all months")
    this.currentMonthFilter = null;
    
    // Performance optimization: debounce timer for chart rendering (Task 17.1)
    this.chartRenderTimer = null;
    this.chartRenderDelay = 150; // milliseconds
    this.pendingCategoryTotals = null; // Store latest data for debounced render
  }

  /**
   * Debounced chart render to optimize performance during rapid updates (Task 17.1)
   * @param {Map<string, number>} categoryTotals - Map of category names to amounts
   */
  debouncedChartRender(categoryTotals) {
    // Store the latest data
    this.pendingCategoryTotals = categoryTotals;
    
    // Clear existing timer
    if (this.chartRenderTimer) {
      clearTimeout(this.chartRenderTimer);
    }
    
    // Set new timer to render chart after delay
    this.chartRenderTimer = setTimeout(() => {
      // Use the latest stored data
      this.chartRenderer.render(this.pendingCategoryTotals);
      this.chartRenderTimer = null;
      this.pendingCategoryTotals = null;
    }, this.chartRenderDelay);
  }

  /**
   * Initializes the application - loads data and renders initial state
   */
  init() {
    // Initialize view components
    this.transactionView = new TransactionView();
    
    const canvas = document.getElementById('spending-chart');
    this.chartRenderer = new ChartRenderer(canvas);

    // Initialize ThemeManager (Task 13.2)
    this.themeManager = new ThemeManager(this.storageService);
    this.themeManager.init();

    // Load data from storage
    this.loadDataFromStorage();

    // Render initial state
    this.updateAllViews();

    // Bind event listeners
    this.bindEventListeners();
  }

  /**
   * Loads all data from storage and populates the transaction manager
   */
  loadDataFromStorage() {
    // Load transactions
    const savedTransactions = this.storageService.loadTransactions();
    if (savedTransactions.length > 0) {
      // Restore transactions to manager
      this.transactionManager.transactions = savedTransactions;
    }

    // Load custom categories
    const savedCategories = this.storageService.loadCategories();
    if (savedCategories.length > 0) {
      // Merge with default categories (avoid duplicates)
      const allCategories = [...new Set([...this.transactionManager.categories, ...savedCategories])];
      this.transactionManager.categories = allCategories;
      
      // Update category dropdown
      this.updateCategoryDropdown();
    }

    // Load spending limit
    const spendingLimit = this.storageService.loadSpendingLimit();
    if (spendingLimit !== null) {
      const limitInput = document.getElementById('spending-limit');
      if (limitInput) {
        limitInput.value = spendingLimit;
      }
    }

    // Load sort preference
    const sortPreference = this.storageService.loadSortPreference();
    if (sortPreference && this.sortBySelect) {
      // Reconstruct the sort value from sortBy and order
      let sortValue;
      if (sortPreference.sortBy === 'category') {
        sortValue = 'category';
      } else {
        sortValue = `${sortPreference.sortBy}-${sortPreference.order}`;
      }
      
      // Set the select value
      this.sortBySelect.value = sortValue;
      
      // Update the sort indicator
      this.transactionView.updateSortIndicator(sortPreference.sortBy, sortPreference.order);
    }
  }

  /**
   * Binds event listeners for form submission, delete buttons, and sort controls
   */
  bindEventListeners() {
    // Form submission event
    if (this.form) {
      this.form.addEventListener('submit', (e) => this.handleFormSubmit(e));
    }

    // Delete button events (using event delegation)
    if (this.transactionList) {
      this.transactionList.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn') || e.target.closest('.delete-btn')) {
          const button = e.target.classList.contains('delete-btn') 
            ? e.target 
            : e.target.closest('.delete-btn');
          const transactionId = button.getAttribute('data-id');
          if (transactionId) {
            this.handleDeleteTransaction(transactionId);
          }
        }
      });
    }

    // Sort control event
    if (this.sortBySelect) {
      this.sortBySelect.addEventListener('change', (e) => {
        this.handleSortChange(e.target.value);
      });
    }

    // Month filter event
    const monthFilter = document.getElementById('month-filter');
    if (monthFilter) {
      monthFilter.addEventListener('change', (e) => {
        this.handleMonthSelect(e.target.value);
      });
    }

    // Spending limit set button event (Task 12.1)
    const setLimitBtn = document.getElementById('set-limit-btn');
    if (setLimitBtn) {
      setLimitBtn.addEventListener('click', () => {
        this.handleSpendingLimitSet();
      });
    }

    // Allow Enter key in spending limit input (Task 12.1)
    const spendingLimitInput = document.getElementById('spending-limit');
    if (spendingLimitInput) {
      spendingLimitInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.handleSpendingLimitSet();
        }
      });
    }

    // Theme toggle button event (Task 13.2)
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', () => {
        this.handleThemeToggle();
      });
    }

    // Manage categories button event (Modal)
    const manageCategoriesBtn = document.getElementById('manage-categories-btn');
    if (manageCategoriesBtn) {
      manageCategoriesBtn.addEventListener('click', () => {
        this.openCategoryModal();
      });
    }

    // Modal close button
    const modalCloseBtn = document.querySelector('.modal-close');
    if (modalCloseBtn) {
      modalCloseBtn.addEventListener('click', () => {
        this.closeCategoryModal();
      });
    }

    // Modal cancel button
    const modalCancelBtn = document.getElementById('modal-cancel-btn');
    if (modalCancelBtn) {
      modalCancelBtn.addEventListener('click', () => {
        this.closeCategoryModal();
      });
    }

    // Modal save button
    const modalSaveBtn = document.getElementById('modal-save-btn');
    if (modalSaveBtn) {
      modalSaveBtn.addEventListener('click', () => {
        this.closeCategoryModal();
      });
    }

    // Modal add category button
    const modalAddCategoryBtn = document.getElementById('modal-add-category-btn');
    if (modalAddCategoryBtn) {
      modalAddCategoryBtn.addEventListener('click', () => {
        this.handleModalCategoryAdd();
      });
    }

    // Allow Enter key in modal category input
    const modalCategoryInput = document.getElementById('modal-category-input');
    if (modalCategoryInput) {
      modalCategoryInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.handleModalCategoryAdd();
        }
      });
    }

    // Close modal when clicking outside
    const modal = document.getElementById('category-modal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeCategoryModal();
        }
      });
    }

    // Modal category list delete buttons (using event delegation)
    const modalCategoryList = document.getElementById('modal-category-list');
    if (modalCategoryList) {
      modalCategoryList.addEventListener('click', (e) => {
        if (e.target.classList.contains('category-delete-btn') || e.target.closest('.category-delete-btn')) {
          const button = e.target.classList.contains('category-delete-btn') 
            ? e.target 
            : e.target.closest('.category-delete-btn');
          const categoryName = button.getAttribute('data-category');
          if (categoryName) {
            this.handleModalCategoryDelete(categoryName);
          }
        }
      });
    }
  }

  /**
   * Updates category dropdown with current categories
   */
  updateCategoryDropdown() {
    const categorySelect = document.getElementById('category');
    if (!categorySelect) return;

    // Keep the first option (placeholder)
    const placeholder = categorySelect.querySelector('option[value=""]');
    categorySelect.innerHTML = '';
    
    if (placeholder) {
      categorySelect.appendChild(placeholder);
    }

    // Add all categories
    this.transactionManager.categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = category;
      categorySelect.appendChild(option);
    });
  }

  /**
   * Handles form submission (placeholder for Task 7.2)
   * @param {Event} event - Form submit event
   */
  handleFormSubmit(event) {
    event.preventDefault();
    
    // Get form field values
    const itemInput = document.getElementById('item-name');
    const amountInput = document.getElementById('amount');
    const categorySelect = document.getElementById('category');
    
    const item = itemInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const category = categorySelect.value;
    
    // Validate inputs
    const itemValidation = validateItem(item);
    if (!itemValidation.isValid) {
      this.transactionView.showError(itemValidation.error);
      return;
    }
    
    const amountValidation = validateAmount(amount);
    if (!amountValidation.isValid) {
      this.transactionView.showError(amountValidation.error);
      return;
    }
    
    const validCategories = this.transactionManager.getCategories();
    const categoryValidation = validateCategory(category, validCategories);
    if (!categoryValidation.isValid) {
      this.transactionView.showError(categoryValidation.error);
      return;
    }
    
    // Hide any previous error messages
    this.transactionView.hideError();
    
    // Add transaction to manager
    try {
      this.transactionManager.addTransaction(item, amount, category);
      
      // Save to storage
      this.storageService.saveTransactions(this.transactionManager.getTransactions());
      
      // Update all views
      this.updateAllViews();
      
      // Clear form
      this.transactionView.clearForm();
    } catch (error) {
      this.transactionView.showError('Failed to add transaction: ' + error.message);
    }
  }

  /**
   * Handles transaction deletion (Task 7.3)
   * @param {string} id - Transaction ID to delete
   */
  handleDeleteTransaction(id) {
    // Remove transaction from TransactionManager
    const deleted = this.transactionManager.deleteTransaction(id);
    
    if (!deleted) {
      console.error('Failed to delete transaction:', id);
      return;
    }
    
    // Update storage with the modified transaction list
    this.storageService.saveTransactions(this.transactionManager.getTransactions());
    
    // Refresh all views (transaction list, balance, chart)
    this.updateAllViews();
  }

  /**
   * Handles sort change (Task 8.2)
   * @param {string} sortValue - Sort value in format "field-order" (e.g., "amount-desc", "category")
   */
  handleSortChange(sortValue) {
    // Parse the sort value to extract sortBy and order
    let sortBy, order;
    
    if (sortValue === 'category') {
      // Category sorting doesn't have an order suffix
      sortBy = 'category';
      order = 'asc'; // Default to ascending for category
    } else {
      // Split value like "amount-desc" into ["amount", "desc"]
      const parts = sortValue.split('-');
      sortBy = parts[0]; // "amount" or "date"
      order = parts[1]; // "asc" or "desc"
    }
    
    // Save sort preference to storage
    this.storageService.saveSortPreference(sortBy, order);
    
    // Update sort indicator in the view
    this.transactionView.updateSortIndicator(sortBy, order);
    
    // Re-render transaction list with sorted data
    this.updateAllViews();
  }

  /**
   * Handles month filter selection (Task 9.2)
   * @param {string} monthValue - Month value in format "YYYY-MM" or "all"
   */
  handleMonthSelect(monthValue) {
    if (monthValue === 'all') {
      // Show all transactions
      this.currentMonthFilter = null;
    } else {
      // Store the selected month filter
      this.currentMonthFilter = monthValue;
    }
    
    // Re-render views with filtered data
    this.updateAllViews();
  }

  /**
   * Handles setting spending limit (Task 12.1)
   */
  handleSpendingLimitSet() {
    const spendingLimitInput = document.getElementById('spending-limit');
    if (!spendingLimitInput) return;

    const limitValue = spendingLimitInput.value.trim();

    // Validate input
    if (!limitValue) {
      this.transactionView.showError('Please enter a spending limit');
      return;
    }

    const limit = parseFloat(limitValue);

    // Validate that it's a valid positive number
    if (isNaN(limit) || limit <= 0) {
      this.transactionView.showError('Spending limit must be a positive number');
      return;
    }

    // Save spending limit to storage
    this.storageService.saveSpendingLimit(limit);

    // Hide any error messages
    this.transactionView.hideError();

    // Update all views to reflect the new limit
    this.updateAllViews();

    // Show success feedback
    console.log(`Spending limit set to ${limit}`);
  }

  /**
   * Handles theme toggle (Task 13.2)
   */
  handleThemeToggle() {
    if (this.themeManager) {
      this.themeManager.toggleTheme();
    }
  }

  /**
   * Opens the category management modal
   */
  openCategoryModal() {
    const modal = document.getElementById('category-modal');
    if (!modal) return;

    // Populate modal with current categories
    this.updateModalCategoryList();

    // Show modal
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');

    // Focus on input
    const input = document.getElementById('modal-category-input');
    if (input) {
      setTimeout(() => input.focus(), 100);
    }
  }

  /**
   * Closes the category management modal
   */
  closeCategoryModal() {
    const modal = document.getElementById('category-modal');
    if (!modal) return;

    // Hide modal
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');

    // Clear input
    const input = document.getElementById('modal-category-input');
    if (input) {
      input.value = '';
    }

    // Update main category dropdown
    this.updateCategoryDropdown();
  }

  /**
   * Updates the category list in the modal
   */
  updateModalCategoryList() {
    const modalCategoryList = document.getElementById('modal-category-list');
    if (!modalCategoryList) return;

    // Clear existing list
    modalCategoryList.innerHTML = '';

    // Get all categories
    const categories = this.transactionManager.getCategories();

    // Create list items
    categories.forEach(category => {
      const li = document.createElement('li');
      
      const nameSpan = document.createElement('span');
      nameSpan.className = 'category-name';
      nameSpan.textContent = category;

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'category-delete-btn';
      deleteBtn.setAttribute('data-category', category);
      deleteBtn.setAttribute('aria-label', `Delete ${category}`);
      deleteBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          <line x1="10" y1="11" x2="10" y2="17"/>
          <line x1="14" y1="11" x2="14" y2="17"/>
        </svg>
      `;

      li.appendChild(nameSpan);
      li.appendChild(deleteBtn);
      modalCategoryList.appendChild(li);
    });
  }

  /**
   * Handles adding a category from the modal
   */
  handleModalCategoryAdd() {
    const input = document.getElementById('modal-category-input');
    if (!input) return;

    const categoryName = input.value.trim();

    // Validate input
    if (!categoryName) {
      alert('Please enter a category name');
      return;
    }

    // Add category to TransactionManager
    const result = this.transactionManager.addCategory(categoryName);

    if (!result.success) {
      alert(result.error);
      return;
    }

    // Save custom categories to storage
    this.storageService.saveCategories(this.transactionManager.getCategories());

    // Update modal list
    this.updateModalCategoryList();

    // Clear input
    input.value = '';

    // Focus back on input
    input.focus();
  }

  /**
   * Handles deleting a category from the modal
   */
  handleModalCategoryDelete(categoryName) {
    // Confirm deletion
    if (!confirm(`Are you sure you want to delete the category "${categoryName}"?`)) {
      return;
    }

    // Check if category is in use
    const transactions = this.transactionManager.getTransactions();
    const inUse = transactions.some(t => t.category === categoryName);

    if (inUse) {
      alert(`Cannot delete "${categoryName}" because it is being used by existing transactions.`);
      return;
    }

    // Remove category
    const index = this.transactionManager.categories.indexOf(categoryName);
    if (index > -1) {
      this.transactionManager.categories.splice(index, 1);
    }

    // Save to storage
    this.storageService.saveCategories(this.transactionManager.getCategories());

    // Update modal list
    this.updateModalCategoryList();

    // Update main dropdown
    this.updateCategoryDropdown();
  }

  /**
   * Updates all views with current data
   */
  updateAllViews() {
    // Load sort preference to maintain sort order
    const sortPreference = this.storageService.loadSortPreference();
    
    // Get transactions based on current month filter
    let transactions;
    let categoryTotals;
    
    if (this.currentMonthFilter) {
      // Parse month filter (format: "YYYY-MM")
      const [year, month] = this.currentMonthFilter.split('-');
      transactions = this.transactionManager.getTransactionsByMonth(
        parseInt(year), 
        parseInt(month)
      );
      
      // Calculate category totals from filtered transactions
      categoryTotals = new Map();
      transactions.forEach(transaction => {
        const current = categoryTotals.get(transaction.category) || 0;
        categoryTotals.set(transaction.category, current + transaction.amount);
      });
      
      console.log('Filtered transactions:', transactions.length);
      console.log('Filtered category totals:', categoryTotals);
      
      // Apply sorting to filtered transactions if preference exists
      if (sortPreference && sortPreference.sortBy) {
        // Create a temporary manager to sort filtered transactions
        const tempManager = new TransactionManager();
        tempManager.transactions = transactions;
        transactions = tempManager.getSortedTransactions(
          sortPreference.sortBy, 
          sortPreference.order
        );
      }
    } else {
      // Get all transactions (sorted if preference exists)
      if (sortPreference && sortPreference.sortBy) {
        transactions = this.transactionManager.getSortedTransactions(
          sortPreference.sortBy, 
          sortPreference.order
        );
      } else {
        transactions = this.transactionManager.getTransactions();
      }
      
      // Get category totals from all transactions
      categoryTotals = this.transactionManager.getCategoryTotals();
      
      console.log('All transactions:', transactions.length);
      console.log('All category totals:', categoryTotals);
    }
    
    const balance = this.transactionManager.getBalance();
    const spendingLimit = this.storageService.loadSpendingLimit();
    const monthlyTotals = this.transactionManager.getMonthlyTotals();

    // Update transaction list with filtered/sorted data
    this.transactionView.renderTransactionList(transactions);

    // Update balance display
    this.transactionView.renderBalance(balance, spendingLimit);

    // Update chart with debouncing for performance (Task 17.1)
    this.debouncedChartRender(categoryTotals);
    
    // Update monthly summary
    this.transactionView.renderMonthlyView(monthlyTotals);
    
    // Update month selector dropdown
    this.updateMonthSelector(monthlyTotals);
  }

  /**
   * Updates the month selector dropdown with available months (Task 9.2)
   * @param {Map<string, number>} monthlyTotals - Map of month keys to total amounts
   */
  updateMonthSelector(monthlyTotals) {
    const monthFilter = document.getElementById('month-filter');
    if (!monthFilter) return;

    // Keep the "All Months" option
    const allOption = monthFilter.querySelector('option[value="all"]');
    monthFilter.innerHTML = '';
    
    if (allOption) {
      monthFilter.appendChild(allOption);
    } else {
      const option = document.createElement('option');
      option.value = 'all';
      option.textContent = 'All Months';
      monthFilter.appendChild(option);
    }

    // Add options for each month with transactions
    if (monthlyTotals.size > 0) {
      // Convert map to array and sort by date (newest first)
      const sortedMonths = Array.from(monthlyTotals.keys())
        .sort((a, b) => b.localeCompare(a));

      sortedMonths.forEach(monthKey => {
        const option = document.createElement('option');
        option.value = monthKey;
        
        // Parse month key (format: "YYYY-MM")
        const [year, month] = monthKey.split('-');
        const date = new Date(year, parseInt(month) - 1);
        const monthName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        
        option.textContent = monthName;
        monthFilter.appendChild(option);
      });
    }
    
    // Restore current selection
    if (this.currentMonthFilter) {
      monthFilter.value = this.currentMonthFilter;
    } else {
      monthFilter.value = 'all';
    }
  }
}

console.log('Expense & Budget Visualizer loaded');

// ============================================================================
// TRANSACTION VIEW (Task 4)
// ============================================================================

/**
 * TransactionView - Handles UI rendering for transactions and related displays
 */
class TransactionView {
  constructor() {
    // Cache DOM element references
    this.transactionList = document.getElementById('transaction-list');
    this.emptyState = document.getElementById('empty-state');
    this.balanceAmount = document.getElementById('balance-amount');
    this.balanceStatus = document.getElementById('balance-status');
    this.remainingBudget = document.getElementById('remaining-budget');
    this.formError = document.getElementById('form-error');
    this.itemInput = document.getElementById('item-name');
    this.amountInput = document.getElementById('amount');
    this.categorySelect = document.getElementById('category');
    this.sortBySelect = document.getElementById('sort-by');
    this.monthlySummary = document.getElementById('monthly-summary');
  }

  /**
   * Renders the transaction list with delete buttons (Task 4.1)
   * @param {Object[]} transactions - Array of transaction objects
   */
  renderTransactionList(transactions) {
    // Clear existing list
    this.transactionList.innerHTML = '';

    // Show/hide empty state
    if (transactions.length === 0) {
      this.emptyState.style.display = 'block';
      this.transactionList.style.display = 'none';
      return;
    }

    this.emptyState.style.display = 'none';
    this.transactionList.style.display = 'block';

    // Use document fragment for batch DOM updates (Task 17.1)
    const fragment = document.createDocumentFragment();

    // Generate HTML for each transaction
    transactions.forEach(transaction => {
      const li = document.createElement('li');
      li.className = 'transaction-item';
      li.setAttribute('data-id', transaction.id);

      // Format amount with 2 decimal places
      const formattedAmount = transaction.amount.toFixed(2);

      // Create transaction item HTML
      li.innerHTML = `
        <div class="transaction-info">
          <span class="transaction-item-name">${this.escapeHtml(transaction.item)}</span>
          <span class="transaction-category">${this.escapeHtml(transaction.category)}</span>
        </div>
        <div class="transaction-actions">
          <span class="transaction-amount">$${formattedAmount}</span>
          <button class="delete-btn" data-id="${transaction.id}" aria-label="Delete ${this.escapeHtml(transaction.item)}">
            <span aria-hidden="true">×</span>
          </button>
        </div>
      `;

      fragment.appendChild(li);
    });

    // Single DOM update with all transactions (Task 17.1)
    this.transactionList.appendChild(fragment);
  }

  /**
   * Renders the balance display with spending limit indicator (Task 4.2)
   * @param {number} balance - Current total balance
   * @param {number|null} spendingLimit - Optional spending limit
   */
  renderBalance(balance, spendingLimit = null) {
    // Batch all DOM updates to minimize reflows (Task 17.1)
    // Prepare all values before making any DOM changes
    const formattedBalance = balance.toFixed(2);
    let statusText = '';
    let statusClass = 'balance-status';
    let budgetText = '';
    let budgetClass = 'remaining-budget';
    let budgetDisplay = 'none';
    let balanceHasOverLimit = false;

    // Check spending limit if set
    if (spendingLimit !== null && spendingLimit > 0) {
      const remaining = spendingLimit - balance;

      if (balance > spendingLimit) {
        // Over limit - show warning
        statusText = '⚠️ Over Limit';
        statusClass = 'balance-status over-limit';
        balanceHasOverLimit = true;
        budgetText = `Over budget by $${Math.abs(remaining).toFixed(2)}`;
        budgetClass = 'remaining-budget over-limit';
        budgetDisplay = 'block';
      } else {
        // Within limit - show remaining budget
        budgetText = `Remaining budget: $${remaining.toFixed(2)}`;
        budgetClass = 'remaining-budget within-limit';
        budgetDisplay = 'block';
      }
    }

    // Apply all DOM changes in a single batch (Task 17.1)
    this.balanceAmount.textContent = `$${formattedBalance}`;
    
    if (balanceHasOverLimit) {
      this.balanceAmount.classList.add('over-limit');
    } else {
      this.balanceAmount.classList.remove('over-limit');
    }
    
    this.balanceStatus.textContent = statusText;
    this.balanceStatus.className = statusClass;
    this.remainingBudget.textContent = budgetText;
    this.remainingBudget.className = budgetClass;
    this.remainingBudget.style.display = budgetDisplay;
  }

  /**
   * Clears all form input fields (Task 4.2)
   */
  clearForm() {
    this.itemInput.value = '';
    this.amountInput.value = '';
    this.categorySelect.value = '';
    this.hideError();
  }

  /**
   * Shows validation error message (Task 4.2)
   * @param {string} message - Error message to display
   */
  showError(message) {
    this.formError.textContent = message;
    this.formError.style.display = 'block';
    this.formError.setAttribute('role', 'alert');
  }

  /**
   * Hides validation error message (Task 4.2)
   */
  hideError() {
    this.formError.textContent = '';
    this.formError.style.display = 'none';
  }

  /**
   * Updates visual sort indicator (Task 4.3)
   * @param {string} sortBy - Current sort field
   * @param {string} order - Current sort order ('asc' or 'desc')
   */
  updateSortIndicator(sortBy, order) {
    // Construct the value that matches the select option
    const selectValue = `${sortBy}-${order}`;
    
    // Update the select element to show current sort
    if (this.sortBySelect) {
      this.sortBySelect.value = selectValue;
    }
  }

  /**
   * Renders monthly summary view (Task 4.3)
   * @param {Map<string, number>} monthlyTotals - Map of month keys to total amounts
   */
  renderMonthlyView(monthlyTotals) {
    // Clear existing summary
    this.monthlySummary.innerHTML = '';

    if (monthlyTotals.size === 0) {
      this.monthlySummary.innerHTML = '<p class="empty-summary">No monthly data available</p>';
      return;
    }

    // Convert map to array and sort by date (newest first)
    const sortedMonths = Array.from(monthlyTotals.entries())
      .sort((a, b) => b[0].localeCompare(a[0]));

    // Create summary items
    sortedMonths.forEach(([monthKey, total]) => {
      const div = document.createElement('div');
      div.className = 'monthly-summary-item';

      // Parse month key (format: "YYYY-MM")
      const [year, month] = monthKey.split('-');
      const date = new Date(year, parseInt(month) - 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

      div.innerHTML = `
        <span class="month-name">${monthName}</span>
        <span class="month-total">$${total.toFixed(2)}</span>
      `;

      this.monthlySummary.appendChild(div);
    });
  }

  /**
   * Escapes HTML special characters to prevent XSS
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// ============================================================================
// CHART RENDERER (Task 6.1)
// ============================================================================

/**
 * ChartRenderer - Handles pie chart visualization using Canvas API
 */
class ChartRenderer {
  /**
   * Constructor to initialize canvas context
   * @param {HTMLCanvasElement} canvasElement - The canvas element for rendering
   */
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');
    
    // Modern soft pastel color palette (easy on the eyes)
    this.categoryColors = {
      'Food': '#FF6B9D',        // Soft Pink
      'Transport': '#4ECDC4',   // Soft Teal
      'Fun': '#FFE66D'          // Soft Yellow
    };
    
    // Additional soft colors for custom categories
    this.additionalColors = [
      '#A8E6CF',  // Soft Mint
      '#FFD3B6',  // Soft Peach
      '#C7CEEA',  // Soft Lavender
      '#FFAAA5',  // Soft Coral
      '#B4E7CE',  // Soft Seafoam
      '#FFC8DD',  // Soft Rose
      '#BDE0FE'   // Soft Sky Blue
    ];
    
    this.colorIndex = 0;
  }

  /**
   * Calculates pie chart segments from category totals
   * @param {Map<string, number>} categoryTotals - Map of category names to amounts
   * @returns {Array<Object>} Array of segment objects with category, amount, percentage, angle, color
   */
  calculateSegments(categoryTotals) {
    const segments = [];
    
    // Calculate total amount
    let total = 0;
    categoryTotals.forEach(amount => {
      total += amount;
    });

    // If no total, return empty segments
    if (total === 0) {
      return segments;
    }

    // Calculate segments with angles and percentages
    let currentAngle = -Math.PI / 2; // Start at top (12 o'clock)
    
    console.log('=== Calculating Segments ===');
    console.log('Total amount:', total);
    
    categoryTotals.forEach((amount, category) => {
      const percentage = (amount / total) * 100;
      const angle = (amount / total) * 2 * Math.PI;
      const color = this.getColorForCategory(category);

      const segment = {
        category,
        amount,
        percentage,
        startAngle: currentAngle,
        endAngle: currentAngle + angle,
        color
      };
      
      console.log(`Segment: ${category}, start: ${currentAngle.toFixed(3)}, end: ${(currentAngle + angle).toFixed(3)}, percentage: ${percentage.toFixed(1)}%`);
      
      segments.push(segment);
      currentAngle += angle;
    });
    
    console.log('=========================');

    return segments;
  }

  /**
   * Gets or assigns a color for a category
   * @param {string} category - Category name
   * @returns {string} Hex color code
   */
  getColorForCategory(category) {
    // Return predefined color if exists
    if (this.categoryColors[category]) {
      return this.categoryColors[category];
    }

    // Assign new color for custom category
    const color = this.additionalColors[this.colorIndex % this.additionalColors.length];
    this.categoryColors[category] = color;
    this.colorIndex++;

    return color;
  }

  /**
   * Renders the complete chart with data (Task 6.2)
   * @param {Map<string, number>} categoryTotals - Map of category names to amounts
   */
  render(categoryTotals) {
    console.log('ChartRenderer.render() called with:', categoryTotals);
    
    // Store for hover effects
    this.lastCategoryTotals = categoryTotals;

    // Clear canvas first
    this.clear();

    // Handle responsive sizing
    this.handleResponsiveSizing();

    // Check if there's data to display
    if (!categoryTotals || categoryTotals.size === 0) {
      console.log('No data to display in chart');
      this.renderEmptyState();
      return;
    }

    // Calculate segments
    const segments = this.calculateSegments(categoryTotals);
    console.log('Calculated segments:', segments);

    if (segments.length === 0) {
      this.renderEmptyState();
      return;
    }

    // Draw pie chart and legend
    this.drawPieChart(segments);
    this.drawLegend(segments);
  }

  /**
   * Draws the pie chart with flat modern design
   * @param {Array<Object>} segments - Array of segment objects
   */
  drawPieChart(segments) {
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    
    // Calculate radius based on canvas size
    const radius = Math.min(centerX, centerY) * 0.75;

    // Draw segments
    segments.forEach(segment => {
      this.ctx.beginPath();
      this.ctx.fillStyle = segment.color;
      this.ctx.moveTo(centerX, centerY);
      this.ctx.arc(
        centerX,
        centerY,
        radius,
        segment.startAngle,
        segment.endAngle
      );
      this.ctx.closePath();
      this.ctx.fill();

      // Subtle stroke for separation
      this.ctx.strokeStyle = '#ffffff';
      this.ctx.lineWidth = 3;
      this.ctx.stroke();
    });

    // Store segments for hover detection
    this.segments = segments;
    this.centerX = centerX;
    this.centerY = centerY;
    this.radius = radius;
    
    // Setup canvas hover detection
    this.setupHoverDetection();
  }

  /**
   * Setup hover detection on canvas
   */
  setupHoverDetection() {
    if (this.hoverSetup) return;
    this.hoverSetup = true;

    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const hoveredSegment = this.getSegmentAtPoint(x, y);
      
      if (hoveredSegment) {
        this.canvas.style.cursor = 'pointer';
        this.showTooltip(hoveredSegment, e.clientX, e.clientY);
      } else {
        this.canvas.style.cursor = 'default';
        this.hideTooltip();
      }
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.hideTooltip();
    });
  }

  /**
   * Get segment at point
   * @param {number} x - X coordinate (canvas coordinate)
   * @param {number} y - Y coordinate (canvas coordinate)
   * @returns {Object|null} Segment or null
   */
  getSegmentAtPoint(x, y) {
    if (!this.segments) return null;

    const dx = x - this.centerX;
    const dy = y - this.centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Check if point is outside the circle
    if (distance > this.radius) return null;

    // Calculate angle from center
    // atan2 returns angle in radians from -PI to PI
    // 0 is at 3 o'clock (right), PI/2 is at 6 o'clock (bottom)
    let mouseAngle = Math.atan2(dy, dx);
    
    // Normalize to 0 to 2*PI range
    if (mouseAngle < 0) {
      mouseAngle += 2 * Math.PI;
    }

    // Check which segment contains this angle
    // Segments already have startAngle and endAngle in the correct coordinate system
    for (const segment of this.segments) {
      let start = segment.startAngle;
      let end = segment.endAngle;
      
      // Normalize segment angles to 0-2PI
      while (start < 0) start += 2 * Math.PI;
      while (end < 0) end += 2 * Math.PI;
      while (start >= 2 * Math.PI) start -= 2 * Math.PI;
      while (end >= 2 * Math.PI) end -= 2 * Math.PI;
      
      // Check if mouse angle is within segment
      if (start <= end) {
        // Normal case: segment doesn't wrap around
        if (mouseAngle >= start && mouseAngle <= end) {
          console.log('Hover detected:', segment.category, 'mouseAngle:', mouseAngle, 'start:', start, 'end:', end);
          return segment;
        }
      } else {
        // Wrap-around case: segment crosses 0/2PI boundary
        if (mouseAngle >= start || mouseAngle <= end) {
          console.log('Hover detected (wrap):', segment.category, 'mouseAngle:', mouseAngle, 'start:', start, 'end:', end);
          return segment;
        }
      }
    }
    
    return null;
  }

  /**
   * Show tooltip
   * @param {Object} segment - Segment data
   * @param {number} x - Mouse X
   * @param {number} y - Mouse Y
   */
  showTooltip(segment, x, y) {
    let tooltip = document.getElementById('chart-tooltip');
    
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.id = 'chart-tooltip';
      tooltip.className = 'chart-tooltip';
      document.body.appendChild(tooltip);
    }

    tooltip.innerHTML = `
      <div class="tooltip-category">${this.escapeHtml(segment.category)}</div>
      <div class="tooltip-amount">$${segment.amount.toFixed(2)}</div>
      <div class="tooltip-percentage">${segment.percentage.toFixed(1)}%</div>
    `;
    
    tooltip.style.display = 'block';
    tooltip.style.left = (x + 15) + 'px';
    tooltip.style.top = (y - 10) + 'px';
  }

  /**
   * Hide tooltip
   */
  hideTooltip() {
    const tooltip = document.getElementById('chart-tooltip');
    if (tooltip) {
      tooltip.style.display = 'none';
    }
  }

  /**
   * Draws the legend showing category names (simple version)
   * @param {Array<Object>} segments - Array of segment objects
   */
  drawLegend(segments) {
    const legendContainer = document.getElementById('chart-legend');
    if (!legendContainer) return;

    // Clear existing legend
    legendContainer.innerHTML = '';

    segments.forEach(segment => {
      const legendItem = document.createElement('div');
      legendItem.className = 'legend-item';
      legendItem.setAttribute('data-category', segment.category);

      const colorBox = document.createElement('div');
      colorBox.className = 'legend-color';
      colorBox.style.backgroundColor = segment.color;

      const label = document.createElement('div');
      label.className = 'legend-label';
      label.textContent = segment.category;

      legendItem.appendChild(colorBox);
      legendItem.appendChild(label);

      // Add hover effect
      legendItem.addEventListener('mouseenter', () => {
        this.highlightSegment(segment);
      });

      legendItem.addEventListener('mouseleave', () => {
        this.render(this.lastCategoryTotals);
      });

      legendContainer.appendChild(legendItem);
    });
  }

  /**
   * Highlights a segment on hover
   * @param {Object} segment - Segment to highlight
   */
  highlightSegment(segment) {
    if (!this.segments) return;

    this.clear();
    this.handleResponsiveSizing();

    const centerX = this.centerX;
    const centerY = this.centerY;
    const radius = this.radius;

    // Draw all segments
    this.segments.forEach(seg => {
      const isHighlighted = seg.category === segment.category;
      const segRadius = isHighlighted ? radius * 1.08 : radius;
      
      // Calculate offset for highlighted segment
      const midAngle = seg.startAngle + (seg.endAngle - seg.startAngle) / 2;
      const offsetX = isHighlighted ? Math.cos(midAngle) * 8 : 0;
      const offsetY = isHighlighted ? Math.sin(midAngle) * 8 : 0;

      this.ctx.beginPath();
      this.ctx.fillStyle = isHighlighted ? seg.color : this.adjustOpacity(seg.color, 0.6);
      this.ctx.moveTo(centerX + offsetX, centerY + offsetY);
      this.ctx.arc(
        centerX + offsetX,
        centerY + offsetY,
        segRadius,
        seg.startAngle,
        seg.endAngle
      );
      this.ctx.closePath();
      this.ctx.fill();

      // Stroke
      this.ctx.strokeStyle = '#ffffff';
      this.ctx.lineWidth = isHighlighted ? 4 : 3;
      this.ctx.stroke();
    });
  }

  /**
   * Adjusts opacity of a color
   * @param {string} color - Hex color code
   * @param {number} opacity - Opacity value (0-1)
   * @returns {string} RGBA color
   */
  adjustOpacity(color, opacity) {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  /**
   * Renders empty state when no transactions exist
   */
  renderEmptyState() {
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    const radius = 80;

    // Draw placeholder circle
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    this.ctx.fillStyle = '#f0f0f0';
    this.ctx.fill();
    this.ctx.strokeStyle = '#cccccc';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    // Draw text
    this.ctx.fillStyle = '#999999';
    this.ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('No data', centerX, centerY - 8);
    this.ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    this.ctx.fillText('Add transactions', centerX, centerY + 8);
  }

  /**
   * Clears the canvas (Task 6.2)
   */
  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Handles responsive canvas sizing for different screen sizes (Task 6.2)
   */
  handleResponsiveSizing() {
    // Set fixed size for better control
    const container = this.canvas.parentElement;
    if (!container) return;

    const size = Math.min(container.clientWidth, container.clientHeight) - 32; // 32px for padding
    
    // Set canvas size
    this.canvas.width = size;
    this.canvas.height = size;
  }

  /**
   * Escapes HTML special characters to prevent XSS
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// ============================================================================
// THEME MANAGER (Task 13.1)
// ============================================================================

/**
 * ThemeManager - Manages dark/light mode theme switching
 */
class ThemeManager {
  /**
   * Constructor to initialize ThemeManager with StorageService
   * @param {StorageService} storageService - Storage service instance
   */
  constructor(storageService) {
    this.storageService = storageService;
    this.currentTheme = 'light';
    this.themeToggleBtn = document.getElementById('theme-toggle');
    this.themeIcon = this.themeToggleBtn ? this.themeToggleBtn.querySelector('.theme-icon') : null;
  }

  /**
   * Initializes theme manager - loads and applies saved theme
   */
  init() {
    // Load saved theme preference
    const savedTheme = this.storageService.loadTheme();
    this.currentTheme = savedTheme;
    
    // Apply the loaded theme
    this.applyTheme(this.currentTheme);
  }

  /**
   * Toggles between dark and light themes
   */
  toggleTheme() {
    // Switch to opposite theme
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.currentTheme = newTheme;
    
    // Apply the new theme
    this.applyTheme(newTheme);
    
    // Save theme preference
    this.storageService.saveTheme(newTheme);
  }

  /**
   * Applies theme by adding/removing CSS classes on document root
   * @param {string} theme - Theme name ('light' or 'dark')
   */
  applyTheme(theme) {
    const root = document.documentElement;
    
    if (theme === 'dark') {
      // Add dark-theme class
      root.classList.add('dark-theme');
      
      // Update toggle button icon to sun (for switching to light mode)
      if (this.themeIcon) {
        this.themeIcon.textContent = '☀️';
      }
    } else {
      // Remove dark-theme class (default to light)
      root.classList.remove('dark-theme');
      
      // Update toggle button icon to moon (for switching to dark mode)
      if (this.themeIcon) {
        this.themeIcon.textContent = '🌙';
      }
    }
  }

  /**
   * Gets the current theme
   * @returns {string} Current theme name
   */
  getCurrentTheme() {
    return this.currentTheme;
  }
}

// ============================================================================
// APPLICATION INITIALIZATION
// ============================================================================

/**
 * Initialize the application when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
  // Instantiate core services
  const storageService = new StorageService();
  const transactionManager = new TransactionManager();
  
  // Instantiate UI controller with dependencies
  const uiController = new UIController(transactionManager, storageService);
  
  // Initialize the application
  uiController.init();
  
  console.log('Expense & Budget Visualizer initialized');
});
