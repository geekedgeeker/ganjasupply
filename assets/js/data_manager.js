class data_manager {
  constructor() {
    this.storage_prefix = 'ganja_supply_';
    this.products = [];
    this.orders = [];
    this.suppliers = [];
    this.login_history = [];
    this.init();
  }

  async init() {
    this.load_all_data();
  }

  load_all_data() {
    this.load_products();
    this.load_orders();
    this.load_suppliers();
    this.load_login_history();
  }

  load_products() {
    try {
      const stored = localStorage.getItem(this.storage_prefix + 'products');
      if (stored) {
        this.products = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load products from localStorage');
      this.products = [];
    }
  }

  load_orders() {
    try {
      const stored = localStorage.getItem(this.storage_prefix + 'orders');
      if (stored) {
        this.orders = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load orders from localStorage');
      this.orders = [];
    }
  }

  load_suppliers() {
    try {
      const stored = localStorage.getItem(this.storage_prefix + 'suppliers');
      if (stored) {
        this.suppliers = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load suppliers from localStorage');
      this.suppliers = [];
    }
  }

  load_login_history() {
    try {
      const stored = localStorage.getItem('ganja_supply_login_history');
      if (stored) {
        this.login_history = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load login history from localStorage');
      this.login_history = [];
    }
  }

  get_products() {
    return this.products;
  }

  get_product_by_id(id) {
    return this.products.find(p => p.id === id);
  }

  get_products_by_type(type) {
    return this.products.filter(p => p.type === type);
  }

  add_product(product) {
    const new_product = {
      id: 'prod_' + Date.now(),
      created_at: new Date().toISOString(),
      ...product
    };
    this.products.push(new_product);
    this.save_products();
    return new_product;
  }

  update_product(id, updates) {
    const index = this.products.findIndex(p => p.id === id);
    if (index !== -1) {
      this.products[index] = { ...this.products[index], ...updates };
      this.save_products();
      return true;
    }
    return false;
  }

  delete_product(id) {
    this.products = this.products.filter(p => p.id !== id);
    this.save_products();
  }

  get_orders() {
    return this.orders;
  }

  get_orders_by_strain(strain_name) {
    return this.orders.filter(o => o.strain === strain_name);
  }

  add_order(order) {
    const new_order = {
      id: 'ord_' + Date.now(),
      created_at: new Date().toISOString(),
      ...order
    };
    this.orders.push(new_order);
    this.save_orders();
    return new_order;
  }

  update_order(id, updates) {
    const index = this.orders.findIndex(o => o.id === id);
    if (index !== -1) {
      this.orders[index] = { ...this.orders[index], ...updates };
      this.save_orders();
      return true;
    }
    return false;
  }

  delete_order(id) {
    this.orders = this.orders.filter(o => o.id !== id);
    this.save_orders();
  }

  get_suppliers() {
    return this.suppliers;
  }

  get_suppliers_by_rating(min_rating) {
    return this.suppliers.filter(s => s.rating >= min_rating);
  }

  add_supplier(supplier) {
    const new_supplier = {
      id: 'sup_' + Date.now(),
      created_at: new Date().toISOString(),
      ...supplier
    };
    this.suppliers.push(new_supplier);
    this.save_suppliers();
    return new_supplier;
  }

  update_supplier(id, updates) {
    const index = this.suppliers.findIndex(s => s.id === id);
    if (index !== -1) {
      this.suppliers[index] = { ...this.suppliers[index], ...updates };
      this.save_suppliers();
      return true;
    }
    return false;
  }

  delete_supplier(id) {
    this.suppliers = this.suppliers.filter(s => s.id !== id);
    this.save_suppliers();
  }

  get_login_history() {
    return this.login_history;
  }

  get_login_history_by_user(username) {
    return this.login_history.filter(l => l.username === username);
  }

  get_recent_logins(limit = 10) {
    return this.login_history
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }

  save_products() {
    try {
      localStorage.setItem(this.storage_prefix + 'products', JSON.stringify(this.products));
    } catch (error) {
      console.error('Failed to save products to localStorage');
    }
  }

  save_orders() {
    try {
      localStorage.setItem(this.storage_prefix + 'orders', JSON.stringify(this.orders));
    } catch (error) {
      console.error('Failed to save orders to localStorage');
    }
  }

  save_suppliers() {
    try {
      localStorage.setItem(this.storage_prefix + 'suppliers', JSON.stringify(this.suppliers));
    } catch (error) {
      console.error('Failed to save suppliers to localStorage');
    }
  }

  save_login_history() {
    try {
      localStorage.setItem(this.storage_prefix + 'login_history', JSON.stringify(this.login_history));
    } catch (error) {
      console.error('Failed to save login history to localStorage');
    }
  }

  get_dashboard_stats() {
    const total_products = this.products.length;
    const total_orders = this.orders.length;
    const total_suppliers = this.suppliers.length;
    const total_revenue = this.orders.reduce((sum, order) => sum + (order.sale_amount || 0), 0);
    
    return {
      total_products,
      total_orders,
      total_suppliers,
      total_revenue
    };
  }
}

const data_manager_instance = new data_manager();
