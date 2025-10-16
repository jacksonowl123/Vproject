<template>
  <footer class="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-50">
    <div class="grid grid-cols-5 gap-1">
      <router-link 
        to="/promotion" 
        class="flex flex-col items-center py-2 text-xs text-gray-600"
      >
        <i class="fas fa-gift mb-1"></i>
        <span>Promotion</span>
      </router-link>

      <router-link 
        to="/member" 
        class="flex flex-col items-center py-2 text-xs text-gray-600"
      >
        <i class="fas fa-calendar-check mb-1"></i>
        <span>Member</span>
      </router-link>

      <router-link 
        to="/" 
        class="flex flex-col items-center py-2 text-xs text-blue-600"
      >
        <div class="bg-blue-600 rounded-full p-3 -mt-6 mb-1">
          <i class="fas fa-home text-white"></i>
        </div>
        <span>Home</span>
      </router-link>

      <router-link 
        to="/wallet-dashboard" 
        class="flex flex-col items-center py-2 text-xs text-gray-600"
      >
        <i class="fas fa-wallet mb-1"></i>
        <span>Wallet</span>
      </router-link>

      <router-link 
        to="/userProfile" 
        class="flex flex-col items-center py-2 text-xs text-gray-600"
      >
        <i class="fas fa-user mb-1"></i>
        <span>Profile</span>
      </router-link>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'MobileFooter'
}
</script> 