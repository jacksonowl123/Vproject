<template>
  <div class="min-h-screen bg-gray-950 text-white flex items-center justify-center px-6">
    <div class="w-full max-w-md text-center">
      <template v-if="!error">
        <div class="mx-auto mb-6 h-14 w-14 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
        <h1 class="text-2xl font-bold mb-2">Launching Game</h1>
        <p class="text-gray-400">Please wait while we prepare your game.</p>
      </template>

      <template v-else>
        <div class="text-red-400 text-5xl mb-5">
          <i class="fas fa-circle-exclamation"></i>
        </div>
        <h1 class="text-2xl font-bold mb-2">Unable to Launch Game</h1>
        <p class="text-gray-400 mb-6">{{ error }}</p>
        <div class="flex flex-col gap-3">
          <button
            type="button"
            class="w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-700"
            @click="launch"
          >
            Try Again
          </button>
          <button
            type="button"
            class="w-full rounded-lg bg-gray-800 px-5 py-3 font-semibold hover:bg-gray-700"
            @click="returnToGames"
          >
            Return to Games
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { laravelApi as api } from '@/services/laravelApi';

const route = useRoute();
const error = ref('');

function normalizeLaunchUrl(url: string): string {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = url.trim().replace(/^['"]|['"]$/g, '');
  return textarea.value;
}

async function launch() {
  error.value = '';
  const platformId = Number(route.params.platformId);

  if (!Number.isInteger(platformId) || platformId <= 0) {
    error.value = 'Invalid game platform.';
    return;
  }

  try {
    const response = await api.launchGame(platformId);
    if (!response.url) {
      throw new Error('Game URL not available.');
    }

    window.location.replace(normalizeLaunchUrl(response.url));
  } catch (launchError: any) {
    error.value = launchError.message || 'Unable to launch game. Please try again.';
  }
}

function returnToGames() {
  if (window.opener) {
    window.close();
  } else {
    window.location.assign('/');
  }
}

onMounted(launch);
</script>
