export type RootStackParamList = {
  Home: undefined;
  AppInitializationScreen: undefined;
  Database: undefined;
  Login: undefined;
  Settings: {userId?: string | null};
  EnterpriseInfo: undefined;
  DatabaseSetup: undefined;
  Setup: undefined;
  UserProfile: undefined;
  Main: {userInfo: any | null};
  Dashboard: {
    roles: string[];
    fields: string[];
  };
  Example: undefined;
  TreeMenu: undefined;
  FlatMenu: undefined;
  SalesPointsScreen: undefined;
  SalesScreen: undefined;
  Payment: undefined;
  Accounting: undefined;
  Retail: undefined;
  Hospitality: undefined;
  Accommodation: undefined;
  FNB: undefined;
  OnlineOrder: undefined;
  AdminPaymentConfig: undefined;
  Billing: undefined;
  DatabaseManager: undefined;
  // Các màn hình chỉ demo làm cấu trúc menu con
  EmployeeList: undefined;
  AddEmployee: undefined;
  Attendance: undefined;
  FinancialReports: undefined;
  IncomeExpense: undefined;
  ProductList: undefined;
  StockManagement: undefined;
  SalesReport: undefined;
  PerformanceReport: undefined;
};

export interface AppError {
  type:
    | 'SETUP'
    | 'DATABASE'
    | 'SESSION'
    | 'NAVIGATION'
    | 'UNKNOWN'
    | 'VALIDATION';
  message: string;
  code?: string;
  details?: unknown;
}

export interface SetupConfig {
  installed: boolean;
  field: string;
  role: string;
  databaseList: string[];
  requiredSchemas?: string[];
  optionalSchemas?: string[];
  version: string;
  setupDate: string;
}

export interface UserInfo {
  id?: string;
  store_id: string;
  username: string;
  full_name: string;
  email?: string;
  phone?: string;
  role?: UserRole;
  permissions?: any;
  avatar_url?: string;
  is_active?: boolean;
  last_login?: string;
  failed_login_attempts?: number;
  locked_until?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserSession {
  userId: string;
  storeId?: string;
  enterpriseId?: string;
  roles?: UserRole[];
  lastLogin?: string;
  expiresAt: string;
}

export interface InitializationState {
  // Setup state
  setupConfig: SetupConfig | null;
  userSession: UserSession | null;

  // Database state
  databaseConnections: string[];
  isDatabaseReady: boolean;

  // Loading states
  isLoading: boolean;
  isCheckingSetup: boolean;
  isOpeningDatabases: boolean;
  isValidatingSession: boolean;

  // Error handling
  error: AppError | null; // Property 'type' does not exist on type 'AppError | null'.
}

// industryRoleTypes.ts
// ========================================
// INDUSTRY TYPES
// ========================================

export type IndustryCategory =
  | 'fnb'           // Food & Beverage
  | 'retail'        // Retail
  | 'healthcare'    // Healthcare & Wellness
  | 'service'       // Service
  | 'education'     // Education
  | 'accommodation' // Hotel, Homestay, Rental
  | 'general'       // General store
  | 'chain'         // Chain stores
  | 'ecommerce';    // E-commerce

export type IndustryId =
  // F&B Category
  | 'restaurant'
  | 'cafe' 
  | 'fastfood'
  | 'food_delivery'
  // Retail Category
  | 'fashion'
  | 'electronics'
  | 'grocery'
  | 'cosmetics'
  | 'bookstore'
  // Healthcare Category
  | 'pharmacy'
  | 'clinic'
  | 'spa'
  | 'gym'
  // Education Category
  | 'language_center'
  | 'tutoring'
  // Service Category
  | 'repair_service'
  | 'laundry'
  | 'car_wash'
  // Accommodation Category
  | 'hotel'
  | 'homestay'
  | 'long_term_rental'
  // General & Chain Category
  | 'general'
  | 'chain'
  | 'ecommerce';

export type ComplexityLevel = 'low' | 'medium' | 'high' | 'very_high';
export type MarketSize = 'small' | 'medium' | 'large' | 'growing' | 'variable';

// ========================================
// USER ROLES
// ========================================

export type UserRole =
  // System & Enterprise Level
  | 'super_admin'
  | 'enterprise_admin'
  // Store Management Level
  | 'store_manager'
  | 'assistant_manager'
  // Staff Level
  | 'cashier'
  | 'sales_staff'
  | 'inventory_staff'
  | 'accountant'
  | 'marketing_staff'
  // F&B Specific
  | 'waiter'
  | 'kitchen_staff'
  // Accommodation Specific
  | 'property_manager'
  | 'front_desk'
  | 'housekeeping'
  | 'reservation_agent'
  // General
  | 'viewer'
  // Legacy roles (for backward compatibility)
  | 'trial'
  | 'individual'
  | 'employee'
  | 'manager'
  | 'owner';

// ========================================
// DATABASE SCHEMAS/MODULES
// ========================================

export type DatabaseSchema =
  // Core required schemas
  | 'core'
  | 'media'
  | 'product'
  | 'oms'        // Order Management System
  | 'payment'
  // Business domain schemas
  | 'fnb'        // Food & Beverage
  | 'inventory'
  | 'crm'        // Customer Relationship Management
  | 'scm'        // Supply Chain Management
  | 'analytics'
  | 'config'
  | 'booking'
  | 'property'   // Property/Room management
  | 'maintenance'
  | 'healthcare'
  | 'education';

// ========================================
// INTERFACE DEFINITIONS
// ========================================

export interface Industry {
  id: IndustryId;
  name: string;
  nameKey: string;
  description: string;
  keyFeatures: string[];
  complexity: ComplexityLevel;
  marketSize: MarketSize;
  category: IndustryCategory;
  requiredSchemas: DatabaseSchema[];
  optionalSchemas: DatabaseSchema[];
}

export interface Permissions {
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
  manage_users: boolean;
  manage_stores: boolean;
  manage_enterprises: boolean;
}

export interface Role {
  id: UserRole;
  name: string;
  nameKey: string;
  description: string;
  requiredSchemas: DatabaseSchema[];
  optionalSchemas: DatabaseSchema[];
  priority: number;
  permissions: Permissions;
}

// ========================================
// UTILITY TYPES
// ========================================

export type IndustryByCategory = {
  [K in IndustryCategory]: IndustryId[];
};

export type RolesByPriority = {
  [priority: number]: UserRole;
};

export type SchemasByRole = {
  [K in UserRole]: {
    required: DatabaseSchema[];
    optional: DatabaseSchema[];
  };
};

// ========================================
// BACKWARD COMPATIBILITY MAPPINGS
// ========================================

// Mapping old IndustryType to new IndustryCategory
export const INDUSTRY_TYPE_MAPPING: Record<string, IndustryCategory> = {
  'fnb': 'fnb',
  'retail': 'retail', 
  'service': 'service',
  'healthcare': 'healthcare',
  'education': 'education',
  'other': 'general'
};

// Mapping old UserRole to new UserRole (for roles that changed)
export const USER_ROLE_MAPPING: Record<string, UserRole> = {
  'admin_store': 'store_manager',
  'admin_enterprise': 'enterprise_admin'
};

// Mapping old DatabaseModule to new DatabaseSchema
export const DATABASE_MODULE_MAPPING: Record<string, DatabaseSchema> = {
  'retail': 'inventory', // Old retail module maps to inventory
  'service': 'booking',  // Old service module maps to booking
  'accounting': 'analytics', // Old accounting maps to analytics
  'hr': 'crm' // Old HR maps to CRM
};