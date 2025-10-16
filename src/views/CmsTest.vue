<template>
  <div class="max-w-4xl mx-auto p-6">
    <div class="bg-white rounded-lg shadow-lg p-6">
      <h1 class="text-2xl font-bold mb-6">CMS Content Test</h1>
      
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-8">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p class="text-gray-600">Loading CMS content...</p>
      </div>
      
      <!-- Error State -->
      <div v-else-if="error" class="text-center py-8">
        <div class="text-red-500 text-5xl mb-4">
          <i class="fas fa-exclamation-circle"></i>
        </div>
        <h3 class="text-xl font-medium text-gray-700 mb-2">Error Loading CMS Content</h3>
        <p class="text-red-600 mb-4">{{ error }}</p>
        <button 
          @click="fetchCmsContent" 
          class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
        >
          Try Again
        </button>
      </div>
      
      <!-- Content -->
      <div v-else>
        <div class="mb-6">
          <h2 class="text-lg font-semibold mb-2">Raw API Response:</h2>
          <pre class="bg-gray-100 p-4 rounded-lg text-sm overflow-auto">{{ JSON.stringify(rawResponse, null, 2) }}</pre>
        </div>
        
        <div v-if="cmsContent.length > 0">
          <h2 class="text-lg font-semibold mb-4">CMS Content Items ({{ cmsContent.length }}):</h2>
          
          <div v-for="(item, index) in cmsContent" :key="item.iid || index" class="border border-gray-200 rounded-lg p-4 mb-4">
            <div class="flex justify-between items-start mb-2">
              <h3 class="text-lg font-bold">{{ item.title }}</h3>
              <span class="text-sm text-gray-500">ID: {{ item.iid }} | Status: {{ item.status }}</span>
            </div>
            
            <div class="mb-3">
              <p class="text-sm text-gray-600 mb-2"><strong>Banner URL:</strong></p>
              <p class="text-blue-600 break-all">{{ item.urlbanner }}</p>
            </div>
            
            <div class="mb-3">
              <p class="text-sm text-gray-600 mb-2"><strong>Decoded Content:</strong></p>
              <div class="bg-gray-50 p-3 rounded border max-h-48 overflow-y-auto">
                <div v-html="item.content"></div>
              </div>
            </div>
            
            <div>
              <p class="text-sm text-gray-600 mb-2"><strong>Raw Base64 Content:</strong></p>
              <textarea 
                :value="originalContent[index]" 
                readonly 
                class="w-full h-20 p-2 text-xs bg-gray-100 border rounded resize-none"
              ></textarea>
            </div>
          </div>
        </div>
        
        <div v-else class="text-center py-8">
          <p class="text-gray-600">No CMS content found</p>
        </div>
        
        <div class="mt-6 pt-6 border-t">
          <button 
            @click="fetchCmsContent" 
            class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
          >
            Refresh Content
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { laravelApi as api } from '@/services/laravelApi';

export default defineComponent({
  name: 'CmsTest',
  setup() {
    const loading = ref(false);
    const error = ref('');
    const cmsContent = ref<any[]>([]);
    const rawResponse = ref<any>(null);
    const originalContent = ref<string[]>([]);

    const fetchCmsContent = async () => {
      loading.value = true;
      error.value = '';
      
      try {
        console.log('🔍 Fetching CMS content...');
        const response = await api.getCmsContent();
        
        console.log('✅ CMS Response:', response);
        rawResponse.value = response;
        
        if (response.success && response.data && Array.isArray(response.data)) {
          // Store original base64 content
          originalContent.value = response.data.map((item: any) => item.content || '');
          
          // Use the decoded content (which should be decoded in the API service)
          cmsContent.value = response.data;
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err: any) {
        console.error('❌ CMS Error:', err);
        error.value = err.message || 'Failed to fetch CMS content';
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      fetchCmsContent();
    });

    return {
      loading,
      error,
      cmsContent,
      rawResponse,
      originalContent,
      fetchCmsContent
    };
  }
});
</script>

<style scoped>
pre {
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style> 