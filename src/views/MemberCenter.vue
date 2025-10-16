<template>
  <div class="p-4">
    <div class="tabs mb-4">
      <router-link to="/member/deposit" class="tab" :class="{ 'tab-active': isActive('Deposit') }">Deposit</router-link>
      <router-link to="/member/withdraw" class="tab" :class="{ 'tab-active': isActive('Withdraw') }">Withdraw</router-link>
      <!-- Report tab hidden -->
      <router-link to="/wallet" class="tab" :class="{ 'tab-active': isActive('Wallet') }">Wallet</router-link>
    </div>
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'MemberCenter',
  methods: {
    isActive(tab) {
      return this.$route.name === tab;
    }
  }
};
</script>

<style scoped>
.tabs {
  display: flex;
  border-bottom: 2px solid #e5e7eb;
}
.tab {
  padding: 10px 20px;
  cursor: pointer;
  text-decoration: none;
  color: #374151;
  border-bottom: 2px solid transparent;
}
.tab-active {
  border-bottom: 2px solid #3b82f6;
  color: #3b82f6;
}
</style>
