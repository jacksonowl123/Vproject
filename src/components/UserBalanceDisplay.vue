<template>
  <div class="bg-gray-200 rounded-full p-4 flex items-center balance-update-trigger" ref="balanceContainer">
    <span class="mr-4">
      {{ balance.cash.currency }} <span v-if="isBalanceHidden">******</span><span v-else>{{ balance.cash.amount }}</span> Cash
    </span>
    <span class="mr-4">|</span>
    <span>
      {{ balance.chips.currency }} <span v-if="isBalanceHidden">******</span><span v-else>{{ balance.chips.amount }}</span> Chips
    </span>
    <button class="ml-4 bg-orange-400 rounded-full p-2 text-white" @click="onRecharge">Recharge</button>
    <button @click="toggleVisibility" class="ml-2" aria-label="Toggle balance visibility">
      <i :class="isBalanceHidden ? 'fas fa-eye' : 'fas fa-eye-slash'"></i>
    </button>
    <button @click="fetchBalance" class="ml-2" aria-label="Refresh balance">
      <i class="fas fa-sync-alt" :class="{'animate-spin': isRefreshing}"></i>
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted, PropType, watch } from 'vue';
import { laravelApi as api } from '@/services/laravelApi';
import { useRouter } from 'vue-router';
import { authState } from '@/store/auth';

interface BalanceData {
  cash: {
    currency: string;
    amount: string;
  };
  chips: {
    currency: string;
    amount: string;
  };
}

export default defineComponent({
  name: 'UserBalanceDisplay',
  props: {
    initialBalance: {
      type: Object as PropType<BalanceData>,
      default: () => ({
        cash: { currency: 'MYR', amount: '0.00' },
        chips: { currency: 'MYR', amount: '0.00' }
      })
    }
  },
  emits: ['balance-updated'],
  setup(props, { emit }) {
    const router = useRouter();
    const isBalanceHidden = ref(localStorage.getItem('balance_hidden') === 'true');
    const balance = ref<BalanceData>(props.initialBalance);
    const balanceContainer = ref<HTMLElement | null>(null);
    const isRefreshing = ref(false);

    const toggleVisibility = () => {
      isBalanceHidden.value = !isBalanceHidden.value;
      localStorage.setItem('balance_hidden', isBalanceHidden.value ? 'true' : 'false');
      
      document.dispatchEvent(new CustomEvent('balance-visibility-changed', {
        detail: { isHidden: isBalanceHidden.value }
      }));
    };

    const onRecharge = () => {
      router.push('/topup');
    };

    const fetchBalance = async () => {
      if (authState.isLoggedIn) {
        try {
          isRefreshing.value = true;
          
          const userData = await api.getMemberDetails();
          console.log('🔍 UserBalanceDisplay - Fetched member details:', userData);
          
          if (userData && userData.account) {
            // Update balance with received data
            if (userData.account.cash) {
              balance.value.cash = userData.account.cash;
              console.log('💰 Cash balance updated:', userData.account.cash);
            } else {
              console.warn('⚠️ No cash balance data in response');
              balance.value.cash = { currency: 'MYR', amount: '0.00' };
            }
            
            if (userData.account.chips) {
              balance.value.chips = userData.account.chips;
              console.log('🎯 Chips balance updated:', userData.account.chips);
            } else {
              console.warn('⚠️ No chips balance data in response');
              balance.value.chips = { currency: 'MYR', amount: '0.00' };
            }
            
            // Update the auth state with fresh data
            authState.memberDetails = userData;
            
            emit('balance-updated', balance.value);
          } else {
            console.error('❌ No account data received from API');
            // Set fallback values
            balance.value = {
              cash: { currency: 'MYR', amount: '0.00' },
              chips: { currency: 'MYR', amount: '0.00' }
            };
          }
        } catch (error) {
          console.error('❌ Error fetching balance:', error);
          // Set fallback values on error
          balance.value = {
            cash: { currency: 'MYR', amount: '0.00' },
            chips: { currency: 'MYR', amount: '0.00' }
          };
        } finally {
          isRefreshing.value = false;
        }
      } else {
        console.warn('⚠️ User not logged in - cannot fetch balance');
      }
    };

    const handleVisibilityChange = (event: CustomEvent) => {
      isBalanceHidden.value = event.detail.isHidden;
    };

    onMounted(() => {
      fetchBalance();
      
      document.addEventListener('balance-visibility-changed', handleVisibilityChange as EventListener);
      
      if (balanceContainer.value) {
        balanceContainer.value.addEventListener('balance-updated', (event: any) => {
          if (event.detail && event.detail.balance) {
            balance.value.cash.amount = event.detail.balance;
            emit('balance-updated', balance.value);
          }
        });
      }
    });

    onUnmounted(() => {
      document.removeEventListener('balance-visibility-changed', handleVisibilityChange as EventListener);
    });

    return {
      balance,
      isBalanceHidden,
      isRefreshing,
      toggleVisibility,
      onRecharge,
      fetchBalance,
      balanceContainer
    };
  }
});
</script> 