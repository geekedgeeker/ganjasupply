class AuthManager {
  constructor() {
    this.currentUser = null;
    this.sessionKey = 'ganja_supply_session';
    this.userDatabase = null;
    this.init();
  }

  async init() {
    await this.loadUserDatabase();
    this.restoreSession();
  }

  async loadUserDatabase() {
    try {
      const response = await fetch('../data/UserDB.json');
      this.userDatabase = await response.json();
    } catch (error) {
      console.error('Failed to load user database');
    }
  }

  authenticate(username, password) {
    if (!this.userDatabase) return false;

    const user = this.userDatabase.users.find(
      u => u.username === username && u.password === password && u.active
    );

    if (user) {
      this.currentUser = user;
      this.saveSession();
      return true;
    }

    return false;
  }

  saveSession() {
    if (this.currentUser) {
      const sessionData = {
        userId: this.currentUser.id,
        username: this.currentUser.username,
        role: this.currentUser.role,
        timestamp: Date.now()
      };
      sessionStorage.setItem(this.sessionKey, JSON.stringify(sessionData));
    }
  }

  restoreSession() {
    const sessionData = sessionStorage.getItem(this.sessionKey);
    if (sessionData) {
      const parsed = JSON.parse(sessionData);
      this.currentUser = this.userDatabase?.users.find(
        u => u.id === parsed.userId
      );
    }
  }

  logout() {
    this.currentUser = null;
    sessionStorage.removeItem(this.sessionKey);
    window.location.href = '../pages/sign-in.html';
  }

  isAuthenticated() {
    return this.currentUser !== null;
  }

  hasPermission(permission) {
    if (!this.currentUser) return false;
    const rolePermissions = this.userDatabase?.roles[this.currentUser.role]?.permissions || [];
    return rolePermissions.includes(permission);
  }

  getCurrentUser() {
    return this.currentUser;
  }

  getRole() {
    return this.currentUser?.role || null;
  }
}

const auth = new AuthManager();
