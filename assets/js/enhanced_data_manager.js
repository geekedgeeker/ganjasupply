class Validation {
  static required(value, field_name = 'Field') {
    if (value === null || value === undefined || value === '') {
      throw new Error(`${field_name} is required`);
    }
    return value;
  }

  static string(value, field_name = 'Field', min_length = 0, max_length = 1000) {
    this.required(value, field_name);
    if (typeof value !== 'string') {
      throw new Error(`${field_name} must be a string`);
    }
    if (value.length < min_length) {
      throw new Error(`${field_name} must be at least ${min_length} characters`);
    }
    if (value.length > max_length) {
      throw new Error(`${field_name} must not exceed ${max_length} characters`);
    }
    return value.trim();
  }

  static number(value, field_name = 'Field', min = 0, max = Infinity) {
    this.required(value, field_name);
    const num = Number(value);
    if (isNaN(num)) {
      throw new Error(`${field_name} must be a valid number`);
    }
    if (num < min) {
      throw new Error(`${field_name} must be at least ${min}`);
    }
    if (num > max) {
      throw new Error(`${field_name} must not exceed ${max}`);
    }
    return num;
  }

  static email(value, field_name = 'Email') {
    this.required(value, field_name);
    const email_regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email_regex.test(value)) {
      throw new Error(`${field_name} must be a valid email address`);
    }
    return value.trim().toLowerCase();
  }

  static enum(value, field_name = 'Field', allowed_values) {
    this.required(value, field_name);
    if (!allowed_values.includes(value)) {
      throw new Error(`${field_name} must be one of: ${allowed_values.join(', ')}`);
    }
    return value;
  }

  static rating(value, field_name = 'Rating') {
    this.required(value, field_name);
    const num = Number(value);
    if (isNaN(num) || num < 1 || num > 5 || !Number.isInteger(num)) {
      throw new Error(`${field_name} must be an integer between 1 and 5`);
    }
    return num;
  }

  static date(value, field_name = 'Date') {
    this.required(value, field_name);
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      throw new Error(`${field_name} must be a valid date`);
    }
    return date.toISOString();
  }

  static array(value, field_name = 'Field', item_validator = null) {
    if (!Array.isArray(value)) {
      throw new Error(`${field_name} must be an array`);
    }
    if (item_validator) {
      return value.map((item, index) => {
        try {
          return item_validator(item, `${field_name}[${index}]`);
        } catch (error) {
          throw new Error(`${field_name}[${index}]: ${error.message}`);
        }
      });
    }
    return value;
  }

  static object(value, field_name = 'Field', schema = null) {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      throw new Error(`${field_name} must be an object`);
    }
    if (schema) {
      const validated = {};
      for (const [key, validator] of Object.entries(schema)) {
        try {
          validated[key] = validator(value[key], key);
        } catch (error) {
          throw new Error(`${field_name}.${key}: ${error.message}`);
        }
      }
      return validated;
    }
    return value;
  }
}

class ErrorHandler {
  static handle(error, context = 'Operation') {
    console.error(`[${context}] Error:`, error);
    
    if (error instanceof ValidationError) {
      return {
        success: false,
        error: error.message,
        type: 'validation',
        context
      };
    }
    
    if (error instanceof StorageError) {
      return {
        success: false,
        error: error.message,
        type: 'storage',
        context
      };
    }
    
    return {
      success: false,
      error: 'An unexpected error occurred',
      type: 'unknown',
      context
    };
  }
}

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

class StorageError extends Error {
  constructor(message) {
    super(message);
    this.name = 'StorageError';
  }
}

class enhanced_data_manager {
  constructor() {
    this.storage_prefix = 'ganja_supply_';
    this.products = [];
    this.orders = [];
    this.suppliers = [];
    this.login_history = [];
    this.audit_logs = [];
    this.listeners = new Map();
    this.cache = cache_manager;
    this.backup = backup_manager;
    this.schema_version = '1.0.0';
    this.init();
  }

  init() {
    this.load_all_data();
    this.setup_event_listeners();
    this.check_schema_migration();
  }

  setup_event_listeners() {
    window.addEventListener('storage', (event) => {
      if (event.key && event.key.startsWith(this.storage_prefix)) {
        this.load_all_data();
        this.emit('data_changed', { key: event.key });
      }
    });
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event).filter(cb => cb !== callback);
      this.listeners.set(event, callbacks);
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => callback(data));
    }
  }

  load_all_data() {
    this.load_products();
    this.load_orders();
    this.load_suppliers();
    this.load_login_history();
    this.load_audit_logs();
  }

  load_products() {
    try {
      const stored = localStorage.getItem(this.storage_prefix + 'products');
      if (stored) {
        const data = JSON.parse(stored);
        this.products = Array.isArray(data) ? data : [];
      }
    } catch (error) {
      console.error('Failed to load products from localStorage:', error);
      this.products = [];
    }
  }

  load_orders() {
    try {
      const stored = localStorage.getItem(this.storage_prefix + 'orders');
      if (stored) {
        const data = JSON.parse(stored);
        this.orders = Array.isArray(data) ? data : [];
      }
    } catch (error) {
      console.error('Failed to load orders from localStorage:', error);
      this.orders = [];
    }
  }

  load_suppliers() {
    try {
      const stored = localStorage.getItem(this.storage_prefix + 'suppliers');
      if (stored) {
        const data = JSON.parse(stored);
        this.suppliers = Array.isArray(data) ? data : [];
      }
    } catch (error) {
      console.error('Failed to load suppliers from localStorage:', error);
      this.suppliers = [];
    }
  }

  load_login_history() {
    try {
      const stored = localStorage.getItem('ganja_supply_login_history');
      if (stored) {
        const data = JSON.parse(stored);
        this.login_history = Array.isArray(data) ? data : [];
      }
    } catch (error) {
      console.error('Failed to load login history from localStorage:', error);
      this.login_history = [];
    }
  }

  load_audit_logs() {
    try {
      const stored = localStorage.getItem('ganja_supply_audit_logs');
      if (stored) {
        const data = JSON.parse(stored);
        this.audit_logs = Array.isArray(data) ? data : [];
      }
    } catch (error) {
      console.error('Failed to load audit logs from localStorage:', error);
      this.audit_logs = [];
    }
  }

  save_products() {
    try {
      localStorage.setItem(this.storage_prefix + 'products', JSON.stringify(this.products));
      this.emit('products_changed', this.products);
      return { success: true };
    } catch (error) {
      throw new StorageError('Failed to save products: ' + error.message);
    }
  }

  save_orders() {
    try {
      localStorage.setItem(this.storage_prefix + 'orders', JSON.stringify(this.orders));
      this.emit('orders_changed', this.orders);
      return { success: true };
    } catch (error) {
      throw new StorageError('Failed to save orders: ' + error.message);
    }
  }

  save_suppliers() {
    try {
      localStorage.setItem(this.storage_prefix + 'suppliers', JSON.stringify(this.suppliers));
      this.emit('suppliers_changed', this.suppliers);
      return { success: true };
    } catch (error) {
      throw new StorageError('Failed to save suppliers: ' + error.message);
    }
  }

  save_login_history() {
    try {
      localStorage.setItem('ganja_supply_login_history', JSON.stringify(this.login_history));
      return { success: true };
    } catch (error) {
      throw new StorageError('Failed to save login history: ' + error.message);
    }
  }

  save_audit_logs() {
    try {
      localStorage.setItem('ganja_supply_audit_logs', JSON.stringify(this.audit_logs));
      return { success: true };
    } catch (error) {
      throw new StorageError('Failed to save audit logs: ' + error.message);
    }
  }

  // Audit Logging
  log_audit_event(event_type, details, user = null) {
    const log_entry = {
      id: 'audit_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      event_type,
      details,
      user: user || this.get_current_user(),
      timestamp: new Date().toISOString(),
      ip_address: 'local'
    };

    this.audit_logs.push(log_entry);
    
    // Keep only last 1000 audit logs
    if (this.audit_logs.length > 1000) {
      this.audit_logs = this.audit_logs.slice(-1000);
    }

    this.save_audit_logs();
    this.emit('audit_log_added', log_entry);

    return log_entry;
  }

  get_audit_logs(filters = {}) {
    let results = [...this.audit_logs];

    if (filters.event_type) {
      results = results.filter(log => log.event_type === filters.event_type);
    }

    if (filters.user) {
      results = results.filter(log => log.user?.username === filters.user);
    }

    if (filters.date_from) {
      results = results.filter(log => new Date(log.timestamp) >= new Date(filters.date_from));
    }

    if (filters.date_to) {
      results = results.filter(log => new Date(log.timestamp) <= new Date(filters.date_to));
    }

    return results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  get_current_user() {
    try {
      const session = sessionStorage.getItem('ganja_supply_session');
      return session ? JSON.parse(session) : null;
    } catch (error) {
      return null;
    }
  }

  // Schema Migration
  check_schema_migration() {
    const current_version = localStorage.getItem('ganja_supply_schema_version');
    
    if (current_version !== this.schema_version) {
      this.migrate_schema(current_version);
      localStorage.setItem('ganja_supply_schema_version', this.schema_version);
    }
  }

  migrate_schema(from_version) {
    this.log_audit_event('schema_migration', {
      from_version,
      to_version: this.schema_version
    });

    // Add migration logic here when schema changes
    console.log(`Migrating schema from ${from_version} to ${this.schema_version}`);
  }

  // Caching Integration
  get_products_cached() {
    const cache_key = 'products_all';
    const cached = this.cache.get(cache_key);
    
    if (cached) {
      return cached;
    }

    const products = this.get_products();
    this.cache.set(cache_key, products);
    return products;
  }

  get_orders_cached() {
    const cache_key = 'orders_all';
    const cached = this.cache.get(cache_key);
    
    if (cached) {
      return cached;
    }

    const orders = this.get_orders();
    this.cache.set(cache_key, orders);
    return orders;
  }

  invalidate_cache(type) {
    if (type === 'products') {
      this.cache.delete('products_all');
    } else if (type === 'orders') {
      this.cache.delete('orders_all');
    } else if (type === 'all') {
      this.cache.clear();
    }
  }

  // Product Operations with Validation
  add_product(product_data) {
    try {
      const validated = Validation.object(product_data, 'Product', {
        name: (value) => Validation.string(value, 'Name', 2, 100),
        type: (value) => Validation.enum(value, 'Type', ['Indica', 'Sativa', 'Hybrid']),
        rating: (value) => Validation.rating(value, 'Rating'),
        total_grams: (value) => Validation.number(value, 'Total Grams', 0, 10000),
        quantities: (value) => Validation.array(value, 'Quantities'),
        comments: (value) => Validation.string(value, 'Comments', 0, 500, true)
      });

      const new_product = {
        id: 'prod_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...validated
      };

      this.products.push(new_product);
      this.save_products();
      this.invalidate_cache('products');
      
      this.log_audit_event('product_created', {
        product_id: new_product.id,
        product_name: new_product.name
      });
      
      return { success: true, data: new_product };
    } catch (error) {
      return ErrorHandler.handle(error, 'Add Product');
    }
  }

  update_product(id, updates) {
    try {
      const index = this.products.findIndex(p => p.id === id);
      if (index === -1) {
        throw new ValidationError('Product not found');
      }

      const validated = Validation.object(updates, 'Product Updates', {
        name: (value) => Validation.string(value, 'Name', 2, 100, true),
        type: (value) => Validation.enum(value, 'Type', ['Indica', 'Sativa', 'Hybrid'], true),
        rating: (value) => Validation.rating(value, 'Rating', true),
        total_grams: (value) => Validation.number(value, 'Total Grams', 0, 10000, true),
        quantities: (value) => Validation.array(value, 'Quantities', null, true),
        comments: (value) => Validation.string(value, 'Comments', 0, 500, true)
      });

      const old_product = { ...this.products[index] };
      this.products[index] = {
        ...this.products[index],
        ...validated,
        updated_at: new Date().toISOString()
      };
      
      this.save_products();
      this.invalidate_cache('products');
      
      this.log_audit_event('product_updated', {
        product_id: id,
        changes: validated,
        previous_state: old_product
      });
      
      return { success: true, data: this.products[index] };
    } catch (error) {
      return ErrorHandler.handle(error, 'Update Product');
    }
  }

  delete_product(id) {
    try {
      const index = this.products.findIndex(p => p.id === id);
      if (index === -1) {
        throw new ValidationError('Product not found');
      }

      const deleted_product = this.products[index];
      this.products.splice(index, 1);
      this.save_products();
      this.invalidate_cache('products');
      
      this.log_audit_event('product_deleted', {
        product_id: id,
        product_name: deleted_product.name
      });
      
      return { success: true };
    } catch (error) {
      return ErrorHandler.handle(error, 'Delete Product');
    }
  }

  // Order Operations with Validation
  add_order(order_data) {
    try {
      const validated = Validation.object(order_data, 'Order', {
        strain: (value) => Validation.string(value, 'Strain', 2, 100),
        quantity: (value) => Validation.number(value, 'Quantity', 0.1, 1000),
        sale_amount: (value) => Validation.number(value, 'Sale Amount', 0, 100000),
        remaining: (value) => Validation.number(value, 'Remaining', 0, 1000),
        customer_name: (value) => Validation.string(value, 'Customer Name', 2, 100),
        time_type: (value) => Validation.enum(value, 'Time Type', ['auto', 'manual']),
        manual_time: (value) => Validation.string(value, 'Manual Time', 0, 100, true),
        time_comment: (value) => Validation.string(value, 'Time Comment', 0, 200, true)
      });

      const new_order = {
        id: 'ord_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...validated
      };

      this.orders.push(new_order);
      this.save_orders();
      this.invalidate_cache('orders');
      
      this.log_audit_event('order_created', {
        order_id: new_order.id,
        customer_name: new_order.customer_name,
        sale_amount: new_order.sale_amount
      });
      
      return { success: true, data: new_order };
    } catch (error) {
      return ErrorHandler.handle(error, 'Add Order');
    }
  }

  update_order(id, updates) {
    try {
      const index = this.orders.findIndex(o => o.id === id);
      if (index === -1) {
        throw new ValidationError('Order not found');
      }

      const validated = Validation.object(updates, 'Order Updates', {
        strain: (value) => Validation.string(value, 'Strain', 2, 100, true),
        quantity: (value) => Validation.number(value, 'Quantity', 0.1, 1000, true),
        sale_amount: (value) => Validation.number(value, 'Sale Amount', 0, 100000, true),
        remaining: (value) => Validation.number(value, 'Remaining', 0, 1000, true),
        customer_name: (value) => Validation.string(value, 'Customer Name', 2, 100, true),
        time_type: (value) => Validation.enum(value, 'Time Type', ['auto', 'manual'], true),
        manual_time: (value) => Validation.string(value, 'Manual Time', 0, 100, true),
        time_comment: (value) => Validation.string(value, 'Time Comment', 0, 200, true)
      });

      const old_order = { ...this.orders[index] };
      this.orders[index] = {
        ...this.orders[index],
        ...validated,
        updated_at: new Date().toISOString()
      };
      
      this.save_orders();
      this.invalidate_cache('orders');
      
      this.log_audit_event('order_updated', {
        order_id: id,
        changes: validated,
        previous_state: old_order
      });
      
      return { success: true, data: this.orders[index] };
    } catch (error) {
      return ErrorHandler.handle(error, 'Update Order');
    }
  }

  delete_order(id) {
    try {
      const index = this.orders.findIndex(o => o.id === id);
      if (index === -1) {
        throw new ValidationError('Order not found');
      }

      const deleted_order = this.orders[index];
      this.orders.splice(index, 1);
      this.save_orders();
      this.invalidate_cache('orders');
      
      this.log_audit_event('order_deleted', {
        order_id: id,
        customer_name: deleted_order.customer_name
      });
      
      return { success: true };
    } catch (error) {
      return ErrorHandler.handle(error, 'Delete Order');
    }
  }

  // Supplier Operations with Validation
  add_supplier(supplier_data) {
    try {
      const validated = Validation.object(supplier_data, 'Supplier', {
        name: (value) => Validation.string(value, 'Name', 2, 100),
        type: (value) => Validation.enum(value, 'Type', ['Local', 'Online', 'Connection']),
        product_rating: (value) => Validation.rating(value, 'Product Rating'),
        overall_rating: (value) => Validation.rating(value, 'Overall Rating'),
        quantities: (value) => Validation.string(value, 'Quantities', 0, 200, true),
        prices: (value) => Validation.string(value, 'Prices', 0, 200, true),
        comments: (value) => Validation.string(value, 'Comments', 0, 500, true)
      });

      const new_supplier = {
        id: 'sup_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...validated
      };

      this.suppliers.push(new_supplier);
      this.save_suppliers();
      
      this.log_audit_event('supplier_created', {
        supplier_id: new_supplier.id,
        supplier_name: new_supplier.name
      });
      
      return { success: true, data: new_supplier };
    } catch (error) {
      return ErrorHandler.handle(error, 'Add Supplier');
    }
  }

  update_supplier(id, updates) {
    try {
      const index = this.suppliers.findIndex(s => s.id === id);
      if (index === -1) {
        throw new ValidationError('Supplier not found');
      }

      const validated = Validation.object(updates, 'Supplier Updates', {
        name: (value) => Validation.string(value, 'Name', 2, 100, true),
        type: (value) => Validation.enum(value, 'Type', ['Local', 'Online', 'Connection'], true),
        product_rating: (value) => Validation.rating(value, 'Product Rating', true),
        overall_rating: (value) => Validation.rating(value, 'Overall Rating', true),
        quantities: (value) => Validation.string(value, 'Quantities', 0, 200, true),
        prices: (value) => Validation.string(value, 'Prices', 0, 200, true),
        comments: (value) => Validation.string(value, 'Comments', 0, 500, true)
      });

      const old_supplier = { ...this.suppliers[index] };
      this.suppliers[index] = {
        ...this.suppliers[index],
        ...validated,
        updated_at: new Date().toISOString()
      };
      
      this.save_suppliers();
      
      this.log_audit_event('supplier_updated', {
        supplier_id: id,
        changes: validated,
        previous_state: old_supplier
      });
      
      return { success: true, data: this.suppliers[index] };
    } catch (error) {
      return ErrorHandler.handle(error, 'Update Supplier');
    }
  }

  delete_supplier(id) {
    try {
      const index = this.suppliers.findIndex(s => s.id === id);
      if (index === -1) {
        throw new ValidationError('Supplier not found');
      }

      const deleted_supplier = this.suppliers[index];
      this.suppliers.splice(index, 1);
      this.save_suppliers();
      
      this.log_audit_event('supplier_deleted', {
        supplier_id: id,
        supplier_name: deleted_supplier.name
      });
      
      return { success: true };
    } catch (error) {
      return ErrorHandler.handle(error, 'Delete Supplier');
    }
  }

  // Query Methods
  get_products(filters = {}) {
    let results = [...this.products];
    
    if (filters.type) {
      results = results.filter(p => p.type === filters.type);
    }
    
    if (filters.min_rating) {
      results = results.filter(p => p.rating >= filters.min_rating);
    }
    
    if (filters.search) {
      const search_lower = filters.search.toLowerCase();
      results = results.filter(p => 
        p.name.toLowerCase().includes(search_lower) ||
        p.comments?.toLowerCase().includes(search_lower)
      );
    }
    
    return results;
  }

  get_orders(filters = {}) {
    let results = [...this.orders];
    
    if (filters.strain) {
      results = results.filter(o => o.strain === filters.strain);
    }
    
    if (filters.customer_name) {
      results = results.filter(o => 
        o.customer_name.toLowerCase().includes(filters.customer_name.toLowerCase())
      );
    }
    
    if (filters.date_from) {
      results = results.filter(o => new Date(o.created_at) >= new Date(filters.date_from));
    }
    
    if (filters.date_to) {
      results = results.filter(o => new Date(o.created_at) <= new Date(filters.date_to));
    }
    
    return results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  get_suppliers(filters = {}) {
    let results = [...this.suppliers];
    
    if (filters.type) {
      results = results.filter(s => s.type === filters.type);
    }
    
    if (filters.min_rating) {
      results = results.filter(s => 
        s.overall_rating >= filters.min_rating || 
        s.product_rating >= filters.min_rating
      );
    }
    
    if (filters.search) {
      const search_lower = filters.search.toLowerCase();
      results = results.filter(s => 
        s.name.toLowerCase().includes(search_lower) ||
        s.comments?.toLowerCase().includes(search_lower)
      );
    }
    
    return results;
  }

  get_dashboard_stats() {
    const total_products = this.products.length;
    const total_orders = this.orders.length;
    const total_suppliers = this.suppliers.length;
    const total_revenue = this.orders.reduce((sum, order) => sum + (order.sale_amount || 0), 0);
    const recent_orders = this.orders.filter(o => {
      const order_date = new Date(o.created_at);
      const week_ago = new Date();
      week_ago.setDate(week_ago.getDate() - 7);
      return order_date >= week_ago;
    }).length;
    
    return {
      total_products,
      total_orders,
      total_suppliers,
      total_revenue,
      recent_orders,
      low_stock: this.products.filter(p => p.total_grams < 10).length
    };
  }

  // Utility Methods
  export_data() {
    return {
      products: this.products,
      orders: this.orders,
      suppliers: this.suppliers,
      login_history: this.login_history,
      audit_logs: this.audit_logs,
      exported_at: new Date().toISOString(),
      schema_version: this.schema_version
    };
  }

  import_data(data) {
    try {
      if (data.products) {
        this.products = Validation.array(data.products, 'Products');
        this.save_products();
      }
      
      if (data.orders) {
        this.orders = Validation.array(data.orders, 'Orders');
        this.save_orders();
      }
      
      if (data.suppliers) {
        this.suppliers = Validation.array(data.suppliers, 'Suppliers');
        this.save_suppliers();
      }
      
      if (data.login_history) {
        this.login_history = Validation.array(data.login_history, 'Login History');
        this.save_login_history();
      }
      
      return { success: true };
    } catch (error) {
      return ErrorHandler.handle(error, 'Import Data');
    }
  }

  clear_all_data() {
    try {
      localStorage.removeItem(this.storage_prefix + 'products');
      localStorage.removeItem(this.storage_prefix + 'orders');
      localStorage.removeItem(this.storage_prefix + 'suppliers');
      localStorage.removeItem('ganja_supply_login_history');
      
      this.products = [];
      this.orders = [];
      this.suppliers = [];
      this.login_history = [];
      
      this.emit('data_cleared', {});
      
      return { success: true };
    } catch (error) {
      return ErrorHandler.handle(error, 'Clear Data');
    }
  }
}

const enhanced_data_manager_instance = new enhanced_data_manager();
