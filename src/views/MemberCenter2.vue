<template>
  <div class="p-4 max-w-6xl mx-auto">
    <!-- Tab Navigation -->
    <div class="tabs mb-4 flex overflow-x-auto bg-white p-2 rounded-lg shadow-sm">
      <router-link to="/deposit" class="tab" :class="{ 'tab-active': isActiveTab('deposit') }">
        <i class="fas fa-money-bill-wave mr-2"></i>Deposit
      </router-link>
      <router-link to="/withdraw" class="tab" :class="{ 'tab-active': isActiveTab('withdraw') }">
        <i class="fas fa-hand-holding-usd mr-2"></i>Withdraw
      </router-link>
      <!-- Report tab hidden -->
      <router-link to="/wallet" class="tab" :class="{ 'tab-active': isActiveTab('wallet') }">
        <i class="fas fa-wallet mr-2"></i>Wallet
      </router-link>
    </div>
    
    <!-- Content Area -->
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useRoute } from 'vue-router';

export default defineComponent({
  name: 'MemberCenter2',
  setup() {
    const route = useRoute();
    
    const isActiveTab = (tab: string) => {
      const path = route.path.toLowerCase();
      return path.includes(`/${tab.toLowerCase()}`);
    };
    
    return {
      isActiveTab
    };
  }
});
</script>

<style scoped>
.tabs {
  display: flex;
  border-bottom: 2px solid #e5e7eb;
}
.tab {
  padding: 12px 20px;
  cursor: pointer;
  text-decoration: none;
  color: #4b5563;
  border-bottom: 2px solid transparent;
  font-weight: 500;
  white-space: nowrap;
  transition: all 0.2s ease;
}
.tab:hover {
  color: #3b82f6;
  background-color: #f3f4f6;
}
.tab-active {
  border-bottom: 2px solid #3b82f6;
  color: #3b82f6;
}
</style> 