<template>
  <div class="p-6">
    <MemberCenter2 />
    
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <h1 class="text-2xl font-bold mb-6">Manual Deposit</h1>
      
      <div class="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <i class="fas fa-info-circle text-yellow-400"></i>
          </div>
          <div class="ml-3">
            <p class="text-sm text-yellow-700">
              This deposit method requires manual approval via the back office. 
              Your account will be credited once the deposit is approved.
            </p>
          </div>
        </div>
      </div>
      
      <ManualDeposit @deposit-success="handleDepositSuccess" @deposit-data="handleDepositData" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import MemberCenter2 from '@/views/MemberCenter2.vue';
import ManualDeposit from '@/components/ManualDeposit.vue';

export default defineComponent({
  name: 'ManualDepositPage',
  components: {
    MemberCenter2,
    ManualDeposit
  },
  setup() {
    const router = useRouter();
    const toast = useToast();
    const lastApiResponse = ref(null);
    
    const handleDepositSuccess = () => {
      // Show success message
      toast.success('Deposit submitted successfully!');
      
      // Redirect to wallet dashboard after a short delay
      setTimeout(() => {
        router.push('/wallet');
      }, 2000);
    };

    const handleDepositData = (responseData: any) => {
      lastApiResponse.value = responseData;
    };
    
    return {
      handleDepositSuccess,
      handleDepositData,
      lastApiResponse
    };
  }
});
</script> 