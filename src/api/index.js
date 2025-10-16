// src/api/index.js
import * as userApi from './userApi';
import * as transactionApi from './transactionApi';
import * as platformApi from './platformApi';
import * as bankApi from './bankApi';
import * as miscApi from './miscApi';

export default {
  ...userApi,
  ...transactionApi,
  ...platformApi,
  ...bankApi,
  ...miscApi,
};