class auth_manager {
  constructor() {
    this.current_user = null;
    this.session_key = 'ganja_supply_session';
    this.remember_key = 'ganja_supply_remember';
    this.user_database = null;
    this.session_timeout = 30 * 60 * 1000; // 30 minutes
    this.session_warning = 5 * 60 * 1000; // 5 minutes warning
    this.session_timer = null;
    this.warning_timer = null;
    this.init();
  }

  async init() {
    await this.load_user_database();
    this.restore_session();
    this.setup_session_timeout();
  }

  async load_user_database() {
    try {
      const response = await fetch('../data/UserDB.json');
      this.user_database = await response.json();
    } catch (error) {
      console.error('Failed to load user database');
    }
  }

  authenticate(username, password, remember_me = false) {
    if (!this.user_database) return false;

    const user = this.user_database.users.find(
      u => u.username === username && u.password === password && u.active
    );

    if (user) {
      this.current_user = user;
      this.save_session(remember_me);
      this.log_login(user);
      this.setup_session_timeout();
      return true;
    }

    return false;
  }

  save_session(remember_me = false) {
    if (this.current_user) {
      const session_data = {
        user_id: this.current_user.id,
        username: this.current_user.username,
        role: this.current_user.role,
        timestamp: Date.now()
      };
      
      sessionStorage.setItem(this.session_key, JSON.stringify(session_data));
      
      if (remember_me) {
        localStorage.setItem(this.remember_key, JSON.stringify({
          ...session_data,
          expires_at: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
        }));
      }
    }
  }

  restore_session() {
    // Try sessionStorage first
    const session_data = sessionStorage.getItem(this.session_key);
    if (session_data) {
      const parsed = JSON.parse(session_data);
      this.current_user = this.user_database?.users.find(
        u => u.id === parsed.user_id
      );
      if (this.current_user) {
        this.setup_session_timeout();
        return;
      }
    }

    // Try localStorage (remember me)
    const remember_data = localStorage.getItem(this.remember_key);
    if (remember_data) {
      const parsed = JSON.parse(remember_data);
      
      // Check if expired
      if (Date.now() > parsed.expires_at) {
        localStorage.removeItem(this.remember_key);
        return;
      }

      this.current_user = this.user_database?.users.find(
        u => u.id === parsed.user_id
      );
      
      if (this.current_user) {
        // Restore to sessionStorage
        this.save_session(true);
        this.setup_session_timeout();
      }
    }
  }

  setup_session_timeout() {
    this.clear_session_timers();

    if (!this.current_user) return;

    // Warning timer
    this.warning_timer = setTimeout(() => {
      this.show_session_warning();
    }, this.session_timeout - this.session_warning);

    // Timeout timer
    this.session_timer = setTimeout(() => {
      this.logout();
    }, this.session_timeout);

    // Reset on activity
    this.reset_session_on_activity();
  }

  clear_session_timers() {
    if (this.session_timer) {
      clearTimeout(this.session_timer);
      this.session_timer = null;
    }
    if (this.warning_timer) {
      clearTimeout(this.warning_timer);
      this.warning_timer = null;
    }
  }

  reset_session_on_activity() {
    const activities = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    
    const reset = () => {
      this.clear_session_timers();
      this.setup_session_timeout();
    };

    activities.forEach(event => {
      document.addEventListener(event, reset);
    });
  }

  show_session_warning() {
    // Dispatch event for UI to handle
    const event = new CustomEvent('sessionWarning', {
      detail: { minutes: this.session_warning / (60 * 1000) }
    });
    window.dispatchEvent(event);
  }

  refresh_session() {
    this.clear_session_timers();
    this.setup_session_timeout();
  }

  validate_password_strength(password) {
    const result = {
      score: 0,
      feedback: [],
      valid: false
    };

    if (password.length < 8) {
      result.feedback.push('Password must be at least 8 characters');
    } else {
      result.score += 1;
    }

    if (!/[a-z]/.test(password)) {
      result.feedback.push('Password must contain lowercase letters');
    } else {
      result.score += 1;
    }

    if (!/[A-Z]/.test(password)) {
      result.feedback.push('Password must contain uppercase letters');
    } else {
      result.score += 1;
    }

    if (!/[0-9]/.test(password)) {
      result.feedback.push('Password must contain numbers');
    } else {
      result.score += 1;
    }

    if (!/[^a-zA-Z0-9]/.test(password)) {
      result.feedback.push('Password must contain special characters');
    } else {
      result.score += 1;
    }

    result.valid = result.score >= 4;
    return result;
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
    this.clear_session_timers();
    this.current_user = null;
    sessionStorage.removeItem(this.session_key);
    localStorage.removeItem(this.remember_key);
    window.location.href = 'sign-in.html';
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
