<template>
  <div class="max-w-lg mx-auto py-4">
    <button class="mb-4 text-blue-600 font-medium" type="button" @click="router.back()">
      <i class="fas fa-arrow-left mr-2"></i>Back to Games
    </button>

    <div v-if="game" class="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div class="bg-gradient-to-br from-blue-700 to-indigo-900 px-6 py-8 text-center text-white">
        <h1 class="text-3xl font-bold">{{ game.name }}</h1>
        <p class="mt-2 text-blue-100">Mobile App Login</p>
      </div>

      <div class="p-6">
        <div v-if="loading" class="py-8 text-center text-gray-500">
          <div class="mx-auto mb-4 h-10 w-10 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
          Preparing your game account...
        </div>

        <template v-else>
          <div v-if="error" class="mb-5 rounded-lg bg-red-50 p-4 text-red-700">
            {{ error }}
            <button class="block mt-2 font-semibold underline" type="button" @click="loadCredentials">
              Try Again
            </button>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1">Username</label>
              <div class="flex rounded-lg border border-gray-300 overflow-hidden">
                <input :value="username" readonly class="min-w-0 flex-1 px-4 py-3 bg-gray-50 text-gray-900" />
                <button
                  type="button"
                  class="px-4 bg-blue-600 text-white font-semibold disabled:bg-gray-400"
                  :disabled="!username"
                  @click="copyText(username, 'Username')"
                >
                  Copy
                </button>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1">Password</label>
              <div class="flex rounded-lg border border-gray-300 overflow-hidden">
                <input :value="password" readonly class="min-w-0 flex-1 px-4 py-3 bg-gray-50 text-gray-900" />
                <button
                  type="button"
                  class="px-4 bg-blue-600 text-white font-semibold disabled:bg-gray-400"
                  :disabled="!password"
                  @click="copyText(password, 'Password')"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>

          <a
            :href="game.downloadUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="mt-6 flex w-full items-center justify-center rounded-lg bg-green-600 px-5 py-3 font-bold text-white hover:bg-green-700"
          >
            <i class="fas fa-download mr-2"></i>Download {{ game.name }}
          </a>
        </template>
      </div>
    </div>

    <div v-else class="rounded-lg bg-red-50 p-5 text-center text-red-700">
      Mobile game not found.
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Swal from 'sweetalert2';
import { laravelApi as api } from '@/services/laravelApi';
import { getMobileGameLaunchStorageKey, MOBILE_GAMES } from '@/utils/mobile-games';

const route = useRoute();
const router = useRouter();
const platformId = Number(route.params.platformId);
const game = computed(() => MOBILE_GAMES[platformId]);
const username = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

function applyLaunchResponse(response: {
  isapp?: boolean;
  usr?: string;
  pwd?: string;
}) {
    if (!response.isapp) {
      username.value = '';
      password.value = '';
      error.value = 'The game provider did not return an app login account. Please contact support.';
      return;
    }

    username.value = response.usr ? String(response.usr) : '';
    password.value = response.pwd ? String(response.pwd) : '';

    if (!username.value || !password.value) {
      error.value = 'The game provider did not return account credentials. Please contact support.';
    }
}

function consumePreparedLaunch() {
  const storageKey = getMobileGameLaunchStorageKey(platformId);
  const storedLaunch = sessionStorage.getItem(storageKey);

  if (!storedLaunch) return false;

  sessionStorage.removeItem(storageKey);

  try {
    applyLaunchResponse(JSON.parse(storedLaunch));
    return true;
  } catch {
    return false;
  }
}

async function loadCredentials() {
  if (!game.value) return;

  loading.value = true;
  error.value = '';

  try {
    const response = await api.launchGame(platformId);
    applyLaunchResponse(response);
  } catch (credentialError: any) {
    error.value = credentialError.message || 'Unable to load game credentials.';
  } finally {
    loading.value = false;
  }
}

async function copyText(value: string, label: string) {
  await navigator.clipboard.writeText(value);
  Swal.fire({
    icon: 'success',
    title: `${label} copied`,
    timer: 1200,
    showConfirmButton: false
  });
}

onMounted(() => {
  if (!consumePreparedLaunch()) {
    loadCredentials();
  }
});
</script>
