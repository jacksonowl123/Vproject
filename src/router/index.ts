import { createRouter, createWebHistory } from 'vue-router';
import GamePage from '../views/GamePage.vue';
import DepositPage from '../views/Deposit.vue';
import WithdrawPage from '../views/WithdrawPage.vue';
import ReportPage from '../views/ReportPage.vue';
import PromotionPage from '../views/Promotion.vue';
import UserProfile from '../views/UserProfile.vue';
import TransactionsPage from '../views/TransactionsPage.vue';
import GameDetailsPage from '../views/GameDetailsPage.vue'; 
import LoginPage from '../views/LoginPage.vue';
import RegisterPage from '../views/RegisterPage.vue';
import WalletPage from '../views/WalletPage.vue';
import DevLogin from '../views/DevLogin.vue';
import AccountSettings from '../views/AccountSettings.vue';
import BankAccountsPage from '../views/BankAccountsPage.vue';
import ApiDebugView from '../views/ApiDebugView.vue';
import ManualDepositPage from '../views/ManualDepositPage.vue';
import GatewayDepositPage from '../views/GatewayDepositPage.vue';
import CmsTest from '../views/CmsTest.vue';
import IncentivesTest from '../views/IncentivesTest.vue';
import PlatformBalanceTest from '../views/PlatformBalanceTest.vue';
import TransferTest from '../views/TransferTest.vue';
import { authState } from '../store/auth';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: GamePage,
  },
  {
    path: '/game/:id',
    name: 'GameDetails',
    component: GameDetailsPage,
  },
  {
    path: '/member',
    redirect: '/userProfile'
  },
  {
    path: '/member/deposit',
    redirect: '/deposit'
  },
  {
    path: '/member/withdraw',
    redirect: '/withdraw'
  },
  {
    path: '/member/report',
    redirect: '/report'
  },
  {
    path: '/withdraw',
    name: 'WithdrawDirect',
    component: WithdrawPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/report',
    name: 'ReportDirect',
    component: ReportPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/deposit',
    name: 'DepositDirect',
    component: DepositPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/deposit/manual',
    name: 'ManualDeposit',
    component: ManualDepositPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/deposit/gateway',
    name: 'GatewayDeposit',
    component: GatewayDepositPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/topup',
    redirect: '/deposit'
  },
  {
    path: '/promotion',
    name: 'PromotionPage',
    component: PromotionPage,
  },
  {
    path: '/userProfile',
    name: 'UserProfile',
    component: UserProfile,
    meta: { requiresAuth: true }
  },
  {
    path: '/transactions',
    name: 'TransactionsPage',
    component: TransactionsPage,
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterPage,
  },
  {
    path: '/wallet',
    name: 'Wallet',
    component: WalletPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/wallet/banks',
    name: 'BankAccounts',
    component: BankAccountsPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/wallet-dashboard',
    redirect: '/wallet'
  },
  {
    path: '/dev-login',
    name: 'DevLogin',
    component: DevLogin,
  },
  {
    path: '/api-debug',
    name: 'ApiDebug',
    component: ApiDebugView,
  },
  {
    path: '/cms-test',
    name: 'CmsTest',
    component: CmsTest,
  },
  {
    path: '/incentives-test',
    name: 'IncentivesTest',
    component: IncentivesTest,
    meta: { requiresAuth: true }
  },
  {
    path: '/platform-balance-test',
    name: 'PlatformBalanceTest',
    component: PlatformBalanceTest,
    meta: { requiresAuth: true }
  },
  {
    path: '/transfer-test',
    name: 'TransferTest',
    component: TransferTest,
    meta: { requiresAuth: true }
  },
  {
    path: '/mock-payment-gateway',
    name: 'MockPaymentGateway',
    component: () => import('@/views/MockPaymentGateway.vue'),
  },
  {
    path: '/account-settings',
    name: 'AccountSettings',
    component: AccountSettings,
    meta: {
      requiresAuth: true,
      title: 'Account Settings'
    }
  },
  // Add other routes as needed
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const isAuthenticated = authState.isLoggedIn;
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  if (requiresAuth && !isAuthenticated) {
    next('/login');
  } else {
    next();
  }
});

export default router;
