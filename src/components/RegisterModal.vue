<template>
  <div v-if="visible" class="modal" @click.self="$emit('close')">
    <div class="modal-content">
      <button class="close-button" @click="$emit('close')">×</button>
      <h2>Register</h2>
      <form @submit.prevent="register">
        <div v-if="error" class="error-message">{{ error }}</div>
        <input type="text" v-model="username" placeholder="Username" required />
        <input type="password" v-model="password" placeholder="Password" required />
        <button type="submit" :disabled="loading">
          {{ loading ? 'Registering...' : 'Register' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import { createMember } from "@/api/userApi";

export default {
  props: ["visible"],
  data() {
    return {
      username: "",
      password: "",
      loading: false,
      error: null,
    };
  },
  methods: {
    validateForm() {
      this.error = null;

      // Username validation
      if (this.username.length < 3) {
        this.error = "Username must be at least 3 characters long";
        return false;
      }
      
      // Password validation
      if (this.password.length < 6) {
        this.error = "Password must be at least 6 characters long";
        return false;
      }

      return true;
    },
    
    async register() {
      if (!this.validateForm()) return;
      
      this.loading = true;
      try {
        const response = await createMember(undefined, undefined, undefined, this.username, this.password, undefined);
        console.log("Registration successful:", response);
        this.$emit("register-success", response);
        this.$emit("close");
      } catch (error) {
        console.error("Registration failed:", error);
        this.error = error.response?.data?.message || "Registration failed. Please try again.";
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5); /* 半透明遮罩 */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-content {
  position: relative;
  background: #ffffff;
  padding: 2rem;
  border-radius: 8px;
  width: 320px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.modal-content h2 {
  margin-top: 0;
  text-align: center;
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
}

.modal-content form input[type="text"],
.modal-content form input[type="password"],
.modal-content form input[type="email"] {
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border-radius: 4px;
  border: 1px solid #ddd;
  font-size: 1rem;
  outline: none;
}

.modal-content form input:focus {
  border-color: #666;
}

.modal-content form button {
  width: 100%;
  padding: 0.75rem;
  border-radius: 4px;
  background-color: #2ecc71;
  color: #fff;
  font-size: 1rem;
  border: none;
  cursor: pointer;
}

.modal-content form button:hover {
  background-color: #27ae60;
}

.close-button {
  position: absolute;
  top: 0.5rem;
  right: 0.75rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  line-height: 1;
  color: #333;
}
.close-button:hover {
  color: #000;
}

.error-message {
  color: #e74c3c;
  margin-bottom: 1rem;
  text-align: center;
  font-size: 0.9rem;
}

.modal-content form button:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
}
</style>
