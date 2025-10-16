<template>
  <nav>
    <ul>
      <li class="mb-4">
        <router-link to="/" class="flex items-center">
          <i class="fas fa-gamepad mr-2"></i> Games
        </router-link>
      </li>
      <li class="mb-4">
        <router-link to="/member" class="flex items-center">
          <i class="fas fa-users mr-2"></i> Member Center
        </router-link>
      </li>
      <li class="mb-4">
        <router-link to="/member/deposit" class="flex items-center">
          <i class="fas fa-piggy-bank mr-2"></i> Go to Deposit
        </router-link>
      </li>
      <!-- Transaction link hidden -->
      <li class="mb-4">
        <router-link to="/userProfile" class="flex items-center">
          <i class="fas fa-user mr-2"></i> Me
        </router-link>
      </li>
      <li class="mb-4">
        <router-link to="/account-settings" class="flex items-center">
          <i class="fas fa-cog mr-2"></i> Account Settings
        </router-link>
      </li>
      <li class="mb-4">
        <router-link to="/promotion" class="flex items-center">
          <i class="fas fa-bullhorn mr-2"></i> Promotion
        </router-link>
      </li>
      <li class="mb-4">
        <router-link to="/topup" class="flex items-center">
          <i class="fas fa-credit-card mr-2"></i> Top Up
        </router-link>
      </li>
      <li class="mb-4">
        <router-link to="/wallet" class="flex items-center">
          <i class="fas fa-wallet mr-2"></i> Wallet
        </router-link>
      </li>
      <li class="mb-4">
        <a @click.prevent="logout" href="#" class="flex items-center">
          <i class="fas fa-sign-out-alt mr-2"></i> Sign Out
        </a>
      </li>
    </ul>
  </nav>
</template>

<script>
export default {
  props: {
    isOpen: {
      type: Boolean,
      required: true,
    },
  },
  methods: {
    logout() {
      localStorage.removeItem('token');
      this.$router.push('/login');
    }
  }
};
</script>

<style scoped>
.fixed {
  z-index: 40; /* Ensure it's above other content */
}
.transition-transform {
  transition: transform 0.3s ease-in-out;
}
</style>
