// ./src/Components/DatabaseManager/types.ts

export interface ColumnDefinition {
  name: string;
  type: string;
  primaryKey?: boolean;
  autoIncrement?: boolean;
  required?: boolean;
  unique?: boolean;
  length?: number;
  default?: any;
  constraints?: string;
  description?: string;
  enum?: string[];
  precision?: number;
  scale?: number;
}

/**
 * Index definition
 */
interface IndexDefinitionBase {
  name: string;
  unique?: boolean;
  type?: "BTREE" | "HASH" | "GIST" | "GIN";
  description?: string;
}

export type IndexDefinition = IndexDefinitionBase & { columns: string[] };

/**
 * Foreign key definition
 */
interface ReferencesBase {
  table: string;
}
type References = ReferencesBase &
  ({ column: string; columns?: never } | { column?: never; columns: string[] });

// Định nghĩa base cho ForeignKeyDefinition
interface ForeignKeyDefinitionBase {
  name: string;
  references: References;
  on_delete?: "CASCADE" | "SET NULL" | "RESTRICT" | "NO ACTION";
  on_update?: "CASCADE" | "SET NULL" | "RESTRICT" | "NO ACTION";
  description?: string;
}

// Ràng buộc ForeignKeyDefinition phải có ít nhất column hoặc columns
export type ForeignKeyDefinition = ForeignKeyDefinitionBase &
  ({ column: string; columns?: never } | { column?: never; columns: string[] });

/**
 * Table options
 */
export interface TableOptions {
  engine?: string; // MySQL: InnoDB, MyISAM
  charset?: string;
  collation?: string;
  comment?: string;
}

export interface TableSchema {
  name?: string;
  cols: ColumnDefinition[];
  indexes?: IndexDefinition[];
  foreign_keys?: ForeignKeyDefinition[];
  options?: TableOptions;
  description?: string;
}

export interface DatabaseSchema {
  version: string;
  database_type?: string;
  database_name: string;
  schemas: Record<string, TableSchema>;
  description?: string;
  type_mapping?: Record<string, Record<string, string>>;
}

export interface GoogleSheetParams {
  googleSheetLink: string;
  sheets: string;
  startFromRow: number;
}

export interface DropdownProps {
  label: string;
  options: string[];
  value: string | null;
  onChange: (value: string, index: number) => void;
  disabled?: boolean;
}

export interface DataTableProps {
  columns: string[];
  data: any[][];
  onRowClick: (row: any[]) => void;
}

export interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  columns: ColumnDefinition[];
  data: Record<string, any> | null;
  onSave: (formData: Record<string, any>) => void;
  onDelete: (() => void) | null;
  isLoading: boolean;
}

export interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (formData: GoogleSheetParams) => void;
  isLoading: boolean;
}
