<template>
  <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50" @click.self="$emit('close')">
    <div class="bg-white p-8 rounded-lg w-96 relative">
      <h2 class="text-2xl mb-4">{{ title }}</h2>
      <form @submit.prevent="handleSubmit">
        <div class="mb-4">
          <label for="username" class="block text-sm font-medium text-gray-700">Username</label>
          <input type="text" id="username" v-model="username" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
        </div>
        <div class="mb-4">
          <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
          <input type="password" id="password" v-model="password" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
        </div>
        <div class="flex justify-end space-x-2">
          <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded-lg">{{ buttonText }}</button>
          <button type="button" @click="$emit('close')" class="bg-red-500 text-white px-4 py-2 rounded-lg">Close</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AuthModal',
  props: {
    title: {
      type: String,
      required: true,
    },
    buttonText: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      username: '',
      password: '',
    };
  },
  methods: {
    handleSubmit() {
      // Emit the login or register event with username and password
      this.$emit('submit', { username: this.username, password: this.password });
    },
  },
};
</script>

<style scoped>
/* Ensure modal is on top */
.z-50 {
  z-index: 50;
}
</style>
