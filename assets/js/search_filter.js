/**
 * Search and Filter Utilities
 * Provides universal search and advanced filtering across all data types
 */
class SearchFilterManager {
  constructor(dataManager) {
    this.dataManager = dataManager;
    this.searchHistory = [];
    this.savedFilters = [];
    this.maxHistory = 20;
  }

  // Universal search across all data types
  search(query, options = {}) {
    const {
      types = ['products', 'orders', 'suppliers'],
      caseSensitive = false,
      exactMatch = false
    } = options;

    const results = {};
    const searchQuery = caseSensitive ? query : query.toLowerCase();

    if (types.includes('products')) {
      results.products = this.searchProducts(searchQuery, caseSensitive, exactMatch);
    }

    if (types.includes('orders')) {
      results.orders = this.searchOrders(searchQuery, caseSensitive, exactMatch);
    }

    if (types.includes('suppliers')) {
      results.suppliers = this.searchSuppliers(searchQuery, caseSensitive, exactMatch);
    }

    // Add to history
    this.addToHistory(query, types);

    return results;
  }

  searchProducts(query, caseSensitive, exactMatch) {
    const products = this.dataManager.get_products();
    return products.filter(product => {
      const name = caseSensitive ? product.name : product.name.toLowerCase();
      const type = caseSensitive ? product.type : product.type.toLowerCase();
      const comments = caseSensitive ? (product.comments || '') : (product.comments || '').toLowerCase();

      if (exactMatch) {
        return name === query || type === query;
      }

      return name.includes(query) || type.includes(query) || comments.includes(query);
    });
  }

  searchOrders(query, caseSensitive, exactMatch) {
    const orders = this.dataManager.get_orders();
    return orders.filter(order => {
      const customer = caseSensitive ? (order.customer_name || '') : (order.customer_name || '').toLowerCase();
      const status = caseSensitive ? (order.status || '') : (order.status || '').toLowerCase();
      const productName = caseSensitive ? (order.product_name || '') : (order.product_name || '').toLowerCase();

      if (exactMatch) {
        return customer === query || status === query || productName === query;
      }

      return customer.includes(query) || status.includes(query) || productName.includes(query);
    });
  }

  searchSuppliers(query, caseSensitive, exactMatch) {
    const suppliers = this.dataManager.get_suppliers();
    return suppliers.filter(supplier => {
      const name = caseSensitive ? supplier.name : supplier.name.toLowerCase();
      const contact = caseSensitive ? (supplier.contact || '') : (supplier.contact || '').toLowerCase();
      const location = caseSensitive ? (supplier.location || '') : (supplier.location || '').toLowerCase();

      if (exactMatch) {
        return name === query || contact === query || location === query;
      }

      return name.includes(query) || contact.includes(query) || location.includes(query);
    });
  }

  // Advanced filtering
  filterProducts(filters) {
    const products = this.dataManager.get_products();
    return products.filter(product => {
      if (filters.type && product.type !== filters.type) return false;
      if (filters.minRating && product.rating < filters.minRating) return false;
      if (filters.maxRating && product.rating > filters.maxRating) return false;
      if (filters.minGrams && product.total_grams < filters.minGrams) return false;
      if (filters.maxGrams && product.total_grams > filters.maxGrams) return false;
      if (filters.search && !product.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
      return true;
    });
  }

  filterOrders(filters) {
    const orders = this.dataManager.get_orders();
    return orders.filter(order => {
      if (filters.status && order.status !== filters.status) return false;
      if (filters.minAmount && (order.sale_amount || 0) < filters.minAmount) return false;
      if (filters.maxAmount && (order.sale_amount || 0) > filters.maxAmount) return false;
      if (filters.dateFrom && new Date(order.created_at) < new Date(filters.dateFrom)) return false;
      if (filters.dateTo && new Date(order.created_at) > new Date(filters.dateTo)) return false;
      if (filters.search && !order.customer_name?.toLowerCase().includes(filters.search.toLowerCase())) return false;
      return true;
    });
  }

  filterSuppliers(filters) {
    const suppliers = this.dataManager.get_suppliers();
    return suppliers.filter(supplier => {
      if (filters.minRating && supplier.rating < filters.minRating) return false;
      if (filters.maxRating && supplier.rating > filters.maxRating) return false;
      if (filters.location && !supplier.location?.toLowerCase().includes(filters.location.toLowerCase())) return false;
      if (filters.search && !supplier.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
      return true;
    });
  }

  // Sorting
  sortProducts(products, sortBy = 'name', order = 'asc') {
    return [...products].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
        case 'rating':
          comparison = (a.rating || 0) - (b.rating || 0);
          break;
        case 'total_grams':
          comparison = (a.total_grams || 0) - (b.total_grams || 0);
          break;
        case 'created_at':
          comparison = new Date(a.created_at) - new Date(b.created_at);
          break;
        default:
          comparison = 0;
      }

      return order === 'desc' ? -comparison : comparison;
    });
  }

  sortOrders(orders, sortBy = 'created_at', order = 'desc') {
    return [...orders].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'created_at':
          comparison = new Date(a.created_at) - new Date(b.created_at);
          break;
        case 'sale_amount':
          comparison = (a.sale_amount || 0) - (b.sale_amount || 0);
          break;
        case 'customer_name':
          comparison = (a.customer_name || '').localeCompare(b.customer_name || '');
          break;
        case 'status':
          comparison = (a.status || '').localeCompare(b.status || '');
          break;
        default:
          comparison = 0;
      }

      return order === 'desc' ? -comparison : comparison;
    });
  }

  sortSuppliers(suppliers, sortBy = 'name', order = 'asc') {
    return [...suppliers].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'rating':
          comparison = (a.rating || 0) - (b.rating || 0);
          break;
        case 'location':
          comparison = (a.location || '').localeCompare(b.location || '');
          break;
        case 'created_at':
          comparison = new Date(a.created_at) - new Date(b.created_at);
          break;
        default:
          comparison = 0;
      }

      return order === 'desc' ? -comparison : comparison;
    });
  }

  // Search history management
  addToHistory(query, types) {
    const entry = {
      query,
      types,
      timestamp: new Date().toISOString()
    };

    // Remove if already exists
    const existingIndex = this.searchHistory.findIndex(h => h.query === query);
    if (existingIndex > -1) {
      this.searchHistory.splice(existingIndex, 1);
    }

    this.searchHistory.unshift(entry);

    // Enforce max history
    if (this.searchHistory.length > this.maxHistory) {
      this.searchHistory = this.searchHistory.slice(0, this.maxHistory);
    }

    this.saveHistory();
  }

  getHistory() {
    return this.searchHistory;
  }

  clearHistory() {
    this.searchHistory = [];
    this.saveHistory();
  }

  saveHistory() {
    try {
      localStorage.setItem('ganja_supply_search_history', JSON.stringify(this.searchHistory));
    } catch (error) {
      console.error('Failed to save search history:', error);
    }
  }

  loadHistory() {
    try {
      const stored = localStorage.getItem('ganja_supply_search_history');
      this.searchHistory = stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load search history:', error);
      this.searchHistory = [];
    }
  }

  // Saved filters management
  saveFilter(name, filters, type) {
    const filter = {
      id: 'filter_' + Date.now(),
      name,
      type,
      filters,
      createdAt: new Date().toISOString()
    };

    this.savedFilters.push(filter);
    this.saveSavedFilters();
    
    return filter;
  }

  getSavedFilters(type = null) {
    if (type) {
      return this.savedFilters.filter(f => f.type === type);
    }
    return this.savedFilters;
  }

  deleteFilter(filterId) {
    const index = this.savedFilters.findIndex(f => f.id === filterId);
    if (index > -1) {
      this.savedFilters.splice(index, 1);
      this.saveSavedFilters();
      return true;
    }
    return false;
  }

  saveSavedFilters() {
    try {
      localStorage.setItem('ganja_supply_saved_filters', JSON.stringify(this.savedFilters));
    } catch (error) {
      console.error('Failed to save filters:', error);
    }
  }

  loadSavedFilters() {
    try {
      const stored = localStorage.getItem('ganja_supply_saved_filters');
      this.savedFilters = stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load filters:', error);
      this.savedFilters = [];
    }
  }

  init() {
    this.loadHistory();
    this.loadSavedFilters();
  }
}
