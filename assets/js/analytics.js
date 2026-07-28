/**
 * Analytics Engine
 * Provides comprehensive analytics for dashboard insights
 */
class AnalyticsEngine {
  constructor(dataManager) {
    this.dataManager = dataManager;
  }

  getRevenueAnalytics(period = 'monthly') {
    const orders = this.dataManager.get_orders();
    const now = new Date();
    let filteredOrders = [];

    // Filter by period
    switch (period) {
      case 'daily':
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        filteredOrders = orders.filter(o => new Date(o.created_at) >= today);
        break;
      case 'weekly':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filteredOrders = orders.filter(o => new Date(o.created_at) >= weekAgo);
        break;
      case 'monthly':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filteredOrders = orders.filter(o => new Date(o.created_at) >= monthAgo);
        break;
      default:
        filteredOrders = orders;
    }

    const totalRevenue = filteredOrders.reduce((sum, order) => sum + (order.sale_amount || 0), 0);
    const averageOrder = filteredOrders.length > 0 ? totalRevenue / filteredOrders.length : 0;

    return {
      period,
      totalRevenue,
      averageOrder,
      orderCount: filteredOrders.length,
      orders: filteredOrders
    };
  }

  getProductPerformance() {
    const products = this.dataManager.get_products();
    const orders = this.dataManager.get_orders();

    const productStats = products.map(product => {
      const productOrders = orders.filter(o => o.product_id === product.id || o.product_name === product.name);
      const totalSales = productOrders.reduce((sum, order) => sum + (order.sale_amount || 0), 0);
      const quantitySold = productOrders.reduce((sum, order) => sum + (order.quantity || 0), 0);

      return {
        ...product,
        totalSales,
        quantitySold,
        orderCount: productOrders.length,
        averageRating: product.rating || 0
      };
    });

    return productStats.sort((a, b) => b.totalSales - a.totalSales);
  }

  getOrderTrends() {
    const orders = this.dataManager.get_orders();
    const trends = {};

    orders.forEach(order => {
      const date = new Date(order.created_at);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!trends[key]) {
        trends[key] = {
          month: key,
          orderCount: 0,
          totalRevenue: 0
        };
      }

      trends[key].orderCount++;
      trends[key].totalRevenue += order.sale_amount || 0;
    });

    return Object.values(trends).sort((a, b) => a.month.localeCompare(b.month));
  }

  getSupplierPerformance() {
    const suppliers = this.dataManager.get_suppliers();
    const orders = this.dataManager.get_orders();

    const supplierStats = suppliers.map(supplier => {
      const supplierOrders = orders.filter(o => o.supplier_id === supplier.id || o.supplier_name === supplier.name);
      const totalOrders = supplierOrders.length;
      const totalRevenue = supplierOrders.reduce((sum, order) => sum + (order.sale_amount || 0), 0);

      return {
        ...supplier,
        totalOrders,
        totalRevenue,
        averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
      };
    });

    return supplierStats.sort((a, b) => b.totalRevenue - a.totalRevenue);
  }

  getUserActivity() {
    const loginHistory = this.dataManager.get_login_history();
    const activity = {};

    loginHistory.forEach(login => {
      if (!activity[login.username]) {
        activity[login.username] = {
          username: login.username,
          role: login.role,
          loginCount: 0,
          lastLogin: login.timestamp
        };
      }

      activity[login.username].loginCount++;
      if (new Date(login.timestamp) > new Date(activity[login.username].lastLogin)) {
        activity[login.username].lastLogin = login.timestamp;
      }
    });

    return Object.values(activity).sort((a, b) => b.loginCount - a.loginCount);
  }

  getDashboardSummary() {
    const products = this.dataManager.get_products();
    const orders = this.dataManager.get_orders();
    const suppliers = this.dataManager.get_suppliers();
    const loginHistory = this.dataManager.get_login_history();

    const revenueAnalytics = this.getRevenueAnalytics('monthly');
    const productPerformance = this.getProductPerformance();
    const orderTrends = this.getOrderTrends();
    const supplierPerformance = this.getSupplierPerformance();
    const userActivity = this.getUserActivity();

    return {
      overview: {
        totalProducts: products.length,
        totalOrders: orders.length,
        totalSuppliers: suppliers.length,
        totalUsers: new Set(loginHistory.map(l => l.username)).size,
        monthlyRevenue: revenueAnalytics.totalRevenue,
        monthlyOrders: revenueAnalytics.orderCount
      },
      revenue: revenueAnalytics,
      topProducts: productPerformance.slice(0, 5),
      orderTrends: orderTrends.slice(-6),
      topSuppliers: supplierPerformance.slice(0, 5),
      userActivity: userActivity.slice(0, 5)
    };
  }

  getQuickStats() {
    const products = this.dataManager.get_products();
    const orders = this.dataManager.get_orders();
    const suppliers = this.dataManager.get_suppliers();

    const totalRevenue = orders.reduce((sum, order) => sum + (order.sale_amount || 0), 0);
    const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

    const lowStockProducts = products.filter(p => (p.total_grams || 0) < 10);
    const highRatedProducts = products.filter(p => (p.rating || 0) >= 4);

    return {
      totalRevenue,
      averageOrderValue,
      totalProducts: products.length,
      totalOrders: orders.length,
      totalSuppliers: suppliers.length,
      lowStockCount: lowStockProducts.length,
      highRatedCount: highRatedProducts.length,
      averageProductRating: products.length > 0 
        ? products.reduce((sum, p) => sum + (p.rating || 0), 0) / products.length 
        : 0
    };
  }

  // Snake-case aliases for easier usage
  get_revenue_analytics(period = 'monthly') {
    return this.getRevenueAnalytics(period);
  }

  get_product_analytics() {
    return this.getProductPerformance();
  }

  get_order_analytics() {
    return this.getOrderTrends();
  }

  get_supplier_analytics() {
    return this.getSupplierPerformance();
  }

  get_user_analytics() {
    return this.getUserActivity();
  }

  get_dashboard_summary() {
    return this.getDashboardSummary();
  }

  get_quick_stats() {
    return this.getQuickStats();
  }
}

// Create global instance with enhanced data manager
let analytics;
if (typeof enhanced_data_manager_instance !== 'undefined') {
  analytics = new AnalyticsEngine(enhanced_data_manager_instance);
} else {
  // Fallback - will be initialized when data manager is available
  analytics = null;
}
