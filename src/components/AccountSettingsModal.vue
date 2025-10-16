<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 overflow-auto">
    <div class="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-auto">
      <!-- Modal Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b">
        <h2 class="text-xl font-bold">Account Settings</h2>
        <button @click="close" class="text-gray-500 hover:text-gray-700 focus:outline-none">
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>
      
      <!-- Modal Body -->
      <div class="p-6">
        <!-- Tabs -->
        <div class="flex border-b mb-6">
          <button 
            @click="activeTab = 'profile'" 
            class="px-6 py-3 font-medium transition-colors duration-200"
            :class="activeTab === 'profile' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'"
          >
            <i class="fas fa-user mr-2"></i>Profile
          </button>
          <button 
            @click="activeTab = 'password'" 
            class="px-6 py-3 font-medium transition-colors duration-200"
            :class="activeTab === 'password' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'"
          >
            <i class="fas fa-lock mr-2"></i>Password
          </button>
        </div>
        
        <!-- Profile Section -->
        <div v-if="activeTab === 'profile'" class="space-y-4">
          <div v-if="successMessage" class="mb-4 bg-green-100 text-green-700 p-3 rounded-lg flex items-start">
            <i class="fas fa-check-circle mt-1 mr-2"></i>
            <span>{{ successMessage }}</span>
          </div>

          <div v-if="errorMessage" class="mb-4 bg-red-100 text-red-700 p-3 rounded-lg flex items-start">
            <i class="fas fa-exclamation-circle mt-1 mr-2"></i>
            <span>{{ errorMessage }}</span>
          </div>
          
          <form @submit.prevent="updateProfile">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input 
                  type="text" 
                  v-model="profile.username" 
                  class="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600" 
                  disabled
                />
                <p class="mt-1 text-xs text-gray-500">Username cannot be changed</p>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input 
                  type="email" 
                  v-model="profile.email" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" 
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input 
                  type="text" 
                  v-model="profile.firstName" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" 
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input 
                  type="text" 
                  v-model="profile.lastName" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" 
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input 
                  type="tel" 
                  v-model="profile.mobile" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" 
                />
              </div>
            </div>
            
            <div class="flex justify-end pt-4">
              <button
                type="button" 
                @click="resetProfileForm" 
                class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 mr-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                :disabled="isProfileUpdating"
              >
                <span v-if="isProfileUpdating" class="mr-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                {{ isProfileUpdating ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>
          </form>
        </div>
        
        <!-- Password Section -->
        <div v-if="activeTab === 'password'" class="space-y-4">
          <div v-if="successMessage" class="mb-4 bg-green-100 text-green-700 p-3 rounded-lg flex items-start">
            <i class="fas fa-check-circle mt-1 mr-2"></i>
            <span>{{ successMessage }}</span>
          </div>

          <div v-if="errorMessage" class="mb-4 bg-red-100 text-red-700 p-3 rounded-lg flex items-start">
            <i class="fas fa-exclamation-circle mt-1 mr-2"></i>
            <span>{{ errorMessage }}</span>
          </div>
          
          <form @submit.prevent="changePassword">
            <div class="space-y-4 mb-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <div class="relative">
                  <input 
                    :type="showCurrentPassword ? 'text' : 'password'" 
                    v-model="passwordForm.currentPassword" 
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" 
                    required
                  />
                  <button 
                    type="button"
                    @click="showCurrentPassword = !showCurrentPassword"
                    class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >
                    <i :class="showCurrentPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                  </button>
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <div class="relative">
                  <input 
                    :type="showNewPassword ? 'text' : 'password'" 
                    v-model="passwordForm.newPassword" 
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" 
                    required
                  />
                  <button 
                    type="button"
                    @click="showNewPassword = !showNewPassword"
                    class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >
                    <i :class="showNewPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                  </button>
                </div>
                <div class="mt-1">
                  <p class="text-xs text-gray-500">Password must be at least 6 characters long</p>
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <div class="relative">
                  <input 
                    :type="showConfirmPassword ? 'text' : 'password'" 
                    v-model="passwordForm.confirmPassword" 
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" 
                    required
                  />
                  <button 
                    type="button"
                    @click="showConfirmPassword = !showConfirmPassword"
                    class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >
                    <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                  </button>
                </div>
              </div>
            </div>
            
            <!-- Password strength indicator -->
            <div class="mb-4">
              <p class="text-sm font-medium text-gray-700 mb-1">Password Strength</p>
              <div class="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div 
                  class="h-full rounded-full transition-all duration-300"
                  :class="passwordStrengthClass"
                  :style="{ width: `${passwordStrength}%` }"
                ></div>
              </div>
              <p class="mt-1 text-xs" :class="passwordStrengthTextClass">
                {{ passwordStrengthText }}
              </p>
            </div>
            
            <div class="flex justify-end pt-4">
              <button
                type="button" 
                @click="resetPasswordForm" 
                class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 mr-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                :disabled="isPasswordUpdating || !isPasswordValid"
              >
                <span v-if="isPasswordUpdating" class="mr-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                {{ isPasswordUpdating ? 'Updating...' : 'Update Password' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, reactive, watch, onMounted } from 'vue';
import { authState } from '@/store/auth';
import { laravelApi as api } from '@/services/laravelApi';
import Swal from 'sweetalert2';
import { MemberDetails, ProfileUpdatePayload } from '@/types/api';

export default defineComponent({
  name: 'AccountSettingsModal',
  props: {
    isOpen: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close', 'profile-updated'],
  setup(props, { emit }) {
    const activeTab = ref('profile');
    const isProfileUpdating = ref(false);
    const isPasswordUpdating = ref(false);
    const successMessage = ref('');
    const errorMessage = ref('');
    
    // Profile form data
    const profile = reactive({
      username: '',
      email: '',
      firstName: '',
      lastName: '',
      mobile: ''
    });
    
    // Password form data
    const passwordForm = reactive({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    
    // Password visibility toggles
    const showCurrentPassword = ref(false);
    const showNewPassword = ref(false);
    const showConfirmPassword = ref(false);
    
    // Load member details
    const populateProfileForm = () => {
      if (authState.memberDetails) {
        profile.username = authState.memberDetails.usr || '';
        profile.email = authState.memberDetails.email || '';
        
        // Parse the name field if it exists
        if (authState.memberDetails.name) {
          const nameParts = authState.memberDetails.name.split(' ');
          profile.firstName = nameParts[0] || '';
          profile.lastName = nameParts.slice(1).join(' ') || '';
        }
        
        profile.mobile = authState.memberDetails.mobile || '';
      }
    };
    
    // Close modal
    const close = () => {
      emit('close');
      // Reset forms when modal is closed
      resetProfileForm();
      resetPasswordForm();
      // Reset active tab
      activeTab.value = 'profile';
    };
    
    // Reset profile form
    const resetProfileForm = () => {
      populateProfileForm();
      successMessage.value = '';
      errorMessage.value = '';
    };
    
    // Reset password form
    const resetPasswordForm = () => {
      passwordForm.currentPassword = '';
      passwordForm.newPassword = '';
      passwordForm.confirmPassword = '';
      successMessage.value = '';
      errorMessage.value = '';
    };
    
    // Update profile information
    const updateProfile = async () => {
      try {
        isProfileUpdating.value = true;
        errorMessage.value = '';
        successMessage.value = '';
        
        // Simple validation
        if (!profile.email || !profile.firstName) {
          errorMessage.value = 'Email and first name are required.';
          return;
        }
        
        // Format the update payload
        const updateData: ProfileUpdatePayload = {
          email: profile.email,
          name: `${profile.firstName} ${profile.lastName}`.trim(),
          mobile: profile.mobile
        };
        
        // Make API call to update profile
        await api.updateMemberProfile(updateData);
        
        // Show success message
        successMessage.value = 'Profile updated successfully!';
        
        // Refresh member details
        const updatedDetails = await api.getMemberDetails();
        if (updatedDetails) {
          // Update authState with new details
          authState.memberDetails = updatedDetails;
          // Emit profile updated event
          emit('profile-updated', updatedDetails);
        }
        
        // Show success notification
        Swal.fire({
          icon: 'success',
          title: 'Profile Updated',
          text: 'Your profile information has been updated successfully.',
          confirmButtonColor: '#0066FF'
        });
      } catch (error: any) {
        console.error('Failed to update profile:', error);
        errorMessage.value = error.message || 'Failed to update profile. Please try again.';
        
        // Show error notification
        Swal.fire({
          icon: 'error',
          title: 'Update Failed',
          text: errorMessage.value,
          confirmButtonColor: '#0066FF'
        });
      } finally {
        isProfileUpdating.value = false;
      }
    };
    
    // Calculate password strength
    const passwordStrength = computed(() => {
      const password = passwordForm.newPassword;
      
      if (!password) return 0;
      
      let strength = 0;
      
      // Length check
      if (password.length >= 6) strength += 20;
      if (password.length >= 10) strength += 10;
      
      // Contains numbers
      if (/\d/.test(password)) strength += 20;
      
      // Contains lowercase letters
      if (/[a-z]/.test(password)) strength += 20;
      
      // Contains uppercase letters
      if (/[A-Z]/.test(password)) strength += 20;
      
      // Contains special characters
      if (/[^A-Za-z0-9]/.test(password)) strength += 20;
      
      return Math.min(strength, 100);
    });
    
    // Get password strength text
    const passwordStrengthText = computed(() => {
      const strength = passwordStrength.value;
      
      if (strength === 0) return 'No password entered';
      if (strength < 40) return 'Weak password';
      if (strength < 70) return 'Moderate password';
      return 'Strong password';
    });
    
    // Get password strength class
    const passwordStrengthClass = computed(() => {
      const strength = passwordStrength.value;
      
      if (strength < 40) return 'bg-red-500';
      if (strength < 70) return 'bg-yellow-500';
      return 'bg-green-500';
    });
    
    // Get password strength text class
    const passwordStrengthTextClass = computed(() => {
      const strength = passwordStrength.value;
      
      if (strength === 0) return 'text-gray-500';
      if (strength < 40) return 'text-red-500';
      if (strength < 70) return 'text-yellow-500';
      return 'text-green-500';
    });
    
    // Validate password
    const isPasswordValid = computed(() => {
      // Check if passwords match
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        return false;
      }
      
      // Check password length
      if (passwordForm.newPassword.length < 6) {
        return false;
      }
      
      return true;
    });
    
    // Change password
    const changePassword = async () => {
      try {
        isPasswordUpdating.value = true;
        errorMessage.value = '';
        successMessage.value = '';
        
        // Validate password
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
          errorMessage.value = 'Passwords do not match.';
          return;
        }
        
        // Check password length
        if (passwordForm.newPassword.length < 6) {
          errorMessage.value = 'Password must be at least 6 characters long.';
          return;
        }
        
        // Make API call to change password
        await api.updatePassword(passwordForm.newPassword);
        
        // Show success message
        successMessage.value = 'Password updated successfully!';
        
        // Reset password form
        passwordForm.currentPassword = '';
        passwordForm.newPassword = '';
        passwordForm.confirmPassword = '';
        
        // Show success notification
        Swal.fire({
          icon: 'success',
          title: 'Password Updated',
          text: 'Your password has been changed successfully.',
          confirmButtonColor: '#0066FF'
        });
      } catch (error: any) {
        console.error('Failed to change password:', error);
        errorMessage.value = error.message || 'Failed to change password. Please try again.';
        
        // Show error notification
        Swal.fire({
          icon: 'error',
          title: 'Password Change Failed',
          text: errorMessage.value,
          confirmButtonColor: '#0066FF'
        });
      } finally {
        isPasswordUpdating.value = false;
      }
    };
    
    // Clear messages when tab changes
    watch(activeTab, () => {
      successMessage.value = '';
      errorMessage.value = '';
    });
    
    // Watch for modal open to populate form
    watch(() => props.isOpen, (newVal) => {
      if (newVal) {
        populateProfileForm();
      }
    });
    
    // Populate form on mount
    onMounted(() => {
      if (props.isOpen) {
        populateProfileForm();
      }
    });
    
    return {
      activeTab,
      authState,
      profile,
      passwordForm,
      isProfileUpdating,
      isPasswordUpdating,
      successMessage,
      errorMessage,
      showCurrentPassword,
      showNewPassword,
      showConfirmPassword,
      passwordStrength,
      passwordStrengthText,
      passwordStrengthClass,
      passwordStrengthTextClass,
      isPasswordValid,
      updateProfile,
      changePassword,
      resetProfileForm,
      resetPasswordForm,
      close
    };
  }
});
</script> 