<template>
  <div class="flex">
    <SidebarMenu 
      :isOpen="sidebarOpen"
      :isLoggedIn="isLoggedIn"
      :username="username"
      :menuItems="menuItems"
      @close="closeSidebar"
    />
    <div class="flex-1">
      <!-- rest of your app content -->
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      sidebarOpen: true,
      // ... other data properties
    }
  },
  methods: {
    closeSidebar() {
      // Only close sidebar on mobile
      if (window.innerWidth < 768) {
        this.sidebarOpen = false
      }
    }
  }
}
</script> 