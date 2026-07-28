class auth_manager {
  constructor() {
    this.current_user = null;
    this.session_key = 'ganja_supply_session';
    this.user_database = null;
    this.init();
  }

  async init() {
    await this.load_user_database();
    this.restore_session();
  }

  async load_user_database() {
    try {
      const response = await fetch('../data/UserDB.json');
      this.user_database = await response.json();
    } catch (error) {
      console.error('Failed to load user database');
    }
  }

  authenticate(username, password) {
    if (!this.user_database) return false;

    const user = this.user_database.users.find(
      u => u.username === username && u.password === password && u.active
    );

    if (user) {
      this.current_user = user;
      this.save_session();
      this.log_login(user);
      return true;
    }

    return false;
  }

  save_session() {
    if (this.current_user) {
      const session_data = {
        user_id: this.current_user.id,
        username: this.current_user.username,
        role: this.current_user.role,
        timestamp: Date.now()
      };
      sessionStorage.setItem(this.session_key, JSON.stringify(session_data));
    }
  }

  restore_session() {
    const session_data = sessionStorage.getItem(this.session_key);
    if (session_data) {
      const parsed = JSON.parse(session_data);
      this.current_user = this.user_database?.users.find(
        u => u.id === parsed.user_id
      );
    }
  }

  log_login(user) {
    try {
      const storage_key = 'ganja_supply_login_history';
      const existing = localStorage.getItem(storage_key);
      let login_history = existing ? JSON.parse(existing) : [];
      
      const login_entry = {
        user_id: user.id,
        username: user.username,
        role: user.role,
        timestamp: new Date().toISOString(),
        ip_address: 'local'
      };
      
      login_history.push(login_entry);
      localStorage.setItem(storage_key, JSON.stringify(login_history));
    } catch (error) {
      console.error('Failed to log login:', error);
    }
  }

  logout() {
    this.current_user = null;
    sessionStorage.removeItem(this.session_key);
    window.location.href = '../pages/sign-in.html';
  }

  is_authenticated() {
    return this.current_user !== null;
  }

  has_permission(permission) {
    if (!this.current_user) return false;
    const role_permissions = this.user_database?.roles[this.current_user.role]?.permissions || [];
    return role_permissions.includes(permission);
  }

  get_current_user() {
    return this.current_user;
  }

  get_role() {
    return this.current_user?.role || null;
  }
}

const auth = new auth_manager();
