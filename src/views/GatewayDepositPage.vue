<template>
  <div class="p-6">
    <MemberCenter2 />
    
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <h1 class="text-2xl font-bold mb-6">Gateway Deposit</h1>
      
      <div class="mb-6 bg-blue-50 border-l-4 border-blue-400 p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <i class="fas fa-credit-card text-blue-400"></i>
          </div>
          <div class="ml-3">
            <p class="text-sm text-blue-700">
              This deposit method processes payments through our secure gateway. 
              Your account will be credited upon successful payment processing.
            </p>
          </div>
        </div>
      </div>
      
      <GatewayDeposit @deposit-success="handleDepositSuccess" @deposit-data="handleDepositData" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import MemberCenter2 from '@/views/MemberCenter2.vue';
import GatewayDeposit from '@/components/GatewayDeposit.vue';

export default defineComponent({
  name: 'GatewayDepositPage',
  components: {
    MemberCenter2,
    GatewayDeposit
  },
  setup() {
    const router = useRouter();
    const toast = useToast();
    const lastApiResponse = ref(null);
    
    const handleDepositSuccess = () => {
      // Show success message
      toast.success('Gateway deposit processed successfully!');
      
      // Redirect to wallet dashboard after a short delay
      setTimeout(() => {
        router.push('/wallet');
      }, 2000);
    };

    const handleDepositData = (responseData: any) => {
      lastApiResponse.value = responseData;
      console.log('Gateway deposit response:', responseData);
    };
    
    return {
      handleDepositSuccess,
      handleDepositData,
      lastApiResponse
    };
  }
});
</script> 