/**
 * Backup Manager
 * Handles data versioning, backup creation, and restore functionality
 */
class BackupManager {
  constructor() {
    this.storageKey = 'ganja_supply_backups';
    this.maxBackups = 10;
    this.autoBackupInterval = 86400000; // 24 hours
    this.init();
  }

  init() {
    this.loadBackups();
    this.startAutoBackup();
  }

  loadBackups() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      this.backups = stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load backups:', error);
      this.backups = [];
    }
  }

  saveBackups() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.backups));
    } catch (error) {
      console.error('Failed to save backups:', error);
    }
  }

  createBackup(name = null, data = null) {
    const backup = {
      id: 'backup_' + Date.now(),
      name: name || `Backup ${new Date().toLocaleString()}`,
      timestamp: new Date().toISOString(),
      data: data || this.captureCurrentData(),
      size: JSON.stringify(data || this.captureCurrentData()).length
    };

    this.backups.unshift(backup);
    this.enforceBackupLimit();
    this.saveBackups();
    
    return backup;
  }

  captureCurrentData() {
    return {
      products: JSON.parse(localStorage.getItem('ganja_supply_products') || '[]'),
      orders: JSON.parse(localStorage.getItem('ganja_supply_orders') || '[]'),
      suppliers: JSON.parse(localStorage.getItem('ganja_supply_suppliers') || '[]'),
      login_history: JSON.parse(localStorage.getItem('ganja_supply_login_history') || '[]'),
      audit_logs: JSON.parse(localStorage.getItem('ganja_supply_audit_logs') || '[]')
    };
  }

  restoreBackup(backupId) {
    const backup = this.backups.find(b => b.id === backupId);
    if (!backup) {
      return { success: false, error: 'Backup not found' };
    }

    try {
      const data = backup.data;
      localStorage.setItem('ganja_supply_products', JSON.stringify(data.products || []));
      localStorage.setItem('ganja_supply_orders', JSON.stringify(data.orders || []));
      localStorage.setItem('ganja_supply_suppliers', JSON.stringify(data.suppliers || []));
      localStorage.setItem('ganja_supply_login_history', JSON.stringify(data.login_history || []));
      localStorage.setItem('ganja_supply_audit_logs', JSON.stringify(data.audit_logs || []));
      
      return { success: true, backup };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  deleteBackup(backupId) {
    const index = this.backups.findIndex(b => b.id === backupId);
    if (index > -1) {
      this.backups.splice(index, 1);
      this.saveBackups();
      return { success: true };
    }
    return { success: false, error: 'Backup not found' };
  }

  enforceBackupLimit() {
    if (this.backups.length > this.maxBackups) {
      this.backups = this.backups.slice(0, this.maxBackups);
    }
  }

  startAutoBackup() {
    setInterval(() => {
      this.createBackup('Auto Backup');
    }, this.autoBackupInterval);
  }

  getBackups() {
    return this.backups;
  }

  getBackup(backupId) {
    return this.backups.find(b => b.id === backupId);
  }

  exportBackup(backupId) {
    const backup = this.getBackup(backupId);
    if (!backup) {
      return { success: false, error: 'Backup not found' };
    }

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${backup.name.replace(/[^a-z0-9]/gi, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);

    return { success: true };
  }

  importBackup(jsonString) {
    try {
      const backup = JSON.parse(jsonString);
      
      if (!backup.id || !backup.data) {
        return { success: false, error: 'Invalid backup format' };
      }

      this.backups.unshift(backup);
      this.enforceBackupLimit();
      this.saveBackups();

      return { success: true, backup };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

const backup_manager = new BackupManager();
