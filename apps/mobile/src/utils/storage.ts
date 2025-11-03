// utils/storage.ts

import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEYS = {
  // New optimized keys
  SETUP_CONFIG: 'mypos.setup',
  USER_SESSION: 'mypos.currentUser',

  // Legacy keys (for migration)
  IS_SETTING: 'mypos.is_setting',
  ROLES: 'mypos.roles',
  INDUSTRIES: 'mypos.industries',
  DATABASE: 'mypos.databases',
  USER_ID: 'mypos.user_id',
  STORE_ID: 'mypos.store_id',
  ENTERPRISE_ID: 'mypos.enterprise_id',

  // Additional keys
  APP_THEME: 'mypos.theme',
  APP_LANGUAGE: 'mypos.language',
  LAST_SYNC: 'mypos.lastSync',
  PENDING_CHANGES: 'mypos.pendingChanges',
} as const;

//Storage utility
export class StorageService {
  // Save key
  static async saveKey(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('❌ Storage saveKey failed:', error);
    }
  }

  // Get key
  static async getKey(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error('❌ Storage getKey failed:', error);
      return null;
    }
  }

  // Remove key
  static async removeKey(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {}
  }

}
