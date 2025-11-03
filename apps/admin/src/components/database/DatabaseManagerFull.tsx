// ./src/Components/DatabaseManager.tsx
"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  AlertCircle,
  Database,
  Table,
  Plus,
  Upload,
  Trash2,
  Edit,
  ChevronDown,
  Loader2,
} from "lucide-react";

// Types
interface ColumnDefinition {
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
}

interface TableSchema {
  name: string;
  cols: ColumnDefinition[];
}

interface DatabaseSchema {
  version: string;
  database_type: string;
  database_name: string;
  schemas: Record<string, TableSchema>;
}

interface GoogleSheetParams {
  googleSheetLink: string;
  sheets: string;
  startFromRow: number;
}

interface DropdownProps {
  label: string;
  options: string[];
  value: string | null;
  onChange: (value: string, index: number) => void;
  disabled?: boolean;
}

interface DataTableProps {
  columns: string[];
  data: any[][];
  onRowClick: (row: any[]) => void;
}

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  columns: ColumnDefinition[];
  data: Record<string, any> | null;
  onSave: (formData: Record<string, any>) => void;
  onDelete: (() => void) | null;
  isLoading: boolean;
}

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (formData: GoogleSheetParams) => void;
  isLoading: boolean;
}

// Mock data for demonstration
const mockSchemas: Record<string, DatabaseSchema> = {
  myapp: {
    version: "1.0.0",
    database_type: "sqlite",
    database_name: "myapp",
    schemas: {
      users: {
        name: "users",
        cols: [
          {
            name: "id",
            type: "integer",
            primaryKey: true,
            autoIncrement: true,
          },
          { name: "name", type: "string", length: 100, required: true },
          {
            name: "email",
            type: "string",
            length: 255,
            unique: true,
            required: true,
          },
          { name: "age", type: "integer" },
          { name: "status", type: "string", length: 20, default: "active" },
          { name: "is_active", type: "boolean", default: true },
          {
            name: "created_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
        ],
      },
      products: {
        name: "products",
        cols: [
          {
            name: "id",
            type: "integer",
            primaryKey: true,
            autoIncrement: true,
          },
          { name: "name", type: "string", length: 200, required: true },
          { name: "price", type: "decimal", required: true },
          { name: "stock", type: "integer", default: 0 },
          { name: "category", type: "string", length: 50 },
        ],
      },
    },
  },
  analytics: {
    version: "1.0.0",
    database_type: "postgresql",
    database_name: "analytics",
    schemas: {
      events: {
        name: "events",
        cols: [
          {
            name: "id",
            type: "integer",
            primaryKey: true,
            autoIncrement: true,
          },
          { name: "event_name", type: "string", length: 100, required: true },
          { name: "user_id", type: "integer" },
          { name: "data", type: "text" },
          {
            name: "created_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
        ],
      },
    },
  },
};

// Dropdown Component
const Dropdown: React.FC<DropdownProps> = ({
  label,
  options,
  value,
  onChange,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-6">
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>
      <div className="relative">
        <button
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`w-full px-4 py-3 text-left bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
            disabled
              ? "opacity-50 cursor-not-allowed"
              : "hover:border-gray-400 dark:hover:border-gray-500"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-gray-700 dark:text-gray-300">
              {value || "Select an option..."}
            </span>
            <ChevronDown
              className={`w-5 h-5 text-gray-400 transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </div>
        </button>

        {isOpen && !disabled && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute z-20 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto">
              {options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => {
                    onChange(option, index);
                    setIsOpen(false);
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 first:rounded-t-lg last:rounded-b-lg"
                >
                  {option}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Data Table Component
const DataTable: React.FC<DataTableProps> = ({ columns, data, onRowClick }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <Database className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500 dark:text-gray-400">No data available</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              #
            </th>
            {columns.map((col, idx) => (
              <th
                key={idx}
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {data.map((row, rowIdx) => (
            <tr
              key={rowIdx}
              onClick={() => onRowClick(row)}
              className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
            >
              <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                {rowIdx + 1}
              </td>
              {row.map((cell, cellIdx) => (
                <td
                  key={cellIdx}
                  className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap"
                >
                  {cell === null || cell === undefined ? "-" : String(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Form Modal Component
const FormModal: React.FC<FormModalProps> = ({
  isOpen,
  onClose,
  title,
  columns,
  data,
  onSave,
  onDelete,
  isLoading,
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    if (data) {
      setFormData(data);
    } else {
      const initialData: Record<string, any> = {};
      columns.forEach((col) => {
        if (col.type === "boolean") {
          initialData[col.name] = col.default ?? false;
        } else {
          initialData[col.name] = col.default ?? "";
        }
      });
      setFormData(initialData);
    }
  }, [data, columns]);

  if (!isOpen) return null;

  const isAutoIncrement = (col: ColumnDefinition): boolean => {
    return (
      col.autoIncrement || col.constraints?.includes("AUTO_INCREMENT") || false
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            {title}
          </h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <span className="text-red-500">*</span> Required fields
            </p>
          </div>

          {columns.map((col) => {
            const isRequired =
              col.required || col.constraints?.includes("NOT NULL");
            const isAuto = isAutoIncrement(col);
            const isDisabled = isLoading || (isAuto && !data);

            return (
              <div key={col.name} className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {col.name}
                  {isRequired && <span className="text-red-500 ml-1">*</span>}
                  {col.description && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 italic">
                      {col.description}
                    </span>
                  )}
                </label>

                {col.type === "boolean" ? (
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!formData[col.name]}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          [col.name]: e.target.checked,
                        })
                      }
                      disabled={isDisabled}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {formData[col.name] ? "Yes" : "No"}
                    </span>
                  </label>
                ) : col.type === "text" ? (
                  <textarea
                    value={formData[col.name] || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, [col.name]: e.target.value })
                    }
                    disabled={isDisabled}
                    placeholder={
                      isAuto ? "Auto-generated" : `Enter ${col.name}`
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-gray-700"
                  />
                ) : (
                  <input
                    type={
                      col.type === "integer" || col.type === "decimal"
                        ? "number"
                        : col.type === "timestamp"
                        ? "datetime-local"
                        : "text"
                    }
                    value={formData[col.name] || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, [col.name]: e.target.value })
                    }
                    disabled={isDisabled}
                    placeholder={
                      isAuto ? "Auto-generated" : `Enter ${col.name}`
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-gray-700"
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-between">
          <div>
            {data && onDelete && (
              <button
                onClick={onDelete}
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Delete
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(formData)}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {data ? "Update" : "Create"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Import Modal Component
const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
  isLoading,
}) => {
  const [formData, setFormData] = useState<GoogleSheetParams>({
    googleSheetLink:
      "https://docs.google.com/spreadsheets/d/1VPQgrDqbvVhxbjYp5Vv2Korvh2fYCubB/edit?gid=594575742#gid=594575742",
    sheets: "categories",
    startFromRow: 3,
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            Import from Google Sheets
          </h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 rounded">
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              <span className="text-red-500">*</span> Required fields
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Google Sheet Link <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.googleSheetLink}
                onChange={(e) =>
                  setFormData({ ...formData, googleSheetLink: e.target.value })
                }
                disabled={isLoading}
                rows={3}
                placeholder="https://docs.google.com/spreadsheets/d/..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Enter the Google Sheet link in public mode
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sheet Names <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.sheets}
                onChange={(e) =>
                  setFormData({ ...formData, sheets: e.target.value })
                }
                disabled={isLoading}
                placeholder="categories, products"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Sheet names separated by commas
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start From Row
              </label>
              <input
                type="number"
                value={formData.startFromRow}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    startFromRow: parseInt(e.target.value) || 3,
                  })
                }
                disabled={isLoading}
                min={1}
                placeholder="3"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Starting row for data (default is 3 to skip header)
              </p>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-6 space-y-3">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">
              Instructions:
            </h3>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full flex items-center justify-center font-semibold text-xs">
                  1
                </span>
                <div>
                  <p className="font-medium text-gray-700 dark:text-gray-300">
                    Prepare Google Sheet
                  </p>
                  <p>
                    Make sure your Google Sheet is shared as public or
                    accessible via link
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full flex items-center justify-center font-semibold text-xs">
                  2
                </span>
                <div>
                  <p className="font-medium text-gray-700 dark:text-gray-300">
                    Format Data
                  </p>
                  <p>
                    Ensure the first row contains column headers matching your
                    database schema
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full flex items-center justify-center font-semibold text-xs">
                  3
                </span>
                <div>
                  <p className="font-medium text-gray-700 dark:text-gray-300">
                    Copy Link
                  </p>
                  <p>
                    Copy the full URL of your Google Sheet and paste it above
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onImport(formData)}
            disabled={
              isLoading || !formData.googleSheetLink || !formData.sheets
            }
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            Import
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Component
export default function DatabaseManager() {
  const [selectedDbKey, setSelectedDbKey] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tableData, setTableData] = useState<any[][]>([]);
  const [tableHead, setTableHead] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [selectedRowData, setSelectedRowData] = useState<Record<
    string,
    any
  > | null>(null);
  const [initializedDatabases, setInitializedDatabases] = useState<Set<string>>(
    new Set(["myapp"])
  );

  const databaseKeys = Object.keys(mockSchemas);

  const currentSchema = useMemo(() => {
    if (!selectedDbKey) return null;
    return mockSchemas[selectedDbKey] || null;
  }, [selectedDbKey]);

  const tableList = useMemo(() => {
    if (!currentSchema) return [];
    return Object.keys(currentSchema.schemas || {});
  }, [currentSchema]);

  const tableColumns = useMemo(() => {
    if (!currentSchema || !selectedTable) return [];
    return currentSchema.schemas[selectedTable]?.cols || [];
  }, [currentSchema, selectedTable]);

  // Mock data generation
  const generateMockData = useCallback(
    (tableName: string, columns: ColumnDefinition[]): any[][] => {
      const mockData: any[][] = [];
      for (let i = 1; i <= 10; i++) {
        const row: any[] = [];
        columns.forEach((col) => {
          if (col.name === "id") {
            row.push(i);
          } else if (col.type === "string") {
            row.push(`${col.name} ${i}`);
          } else if (col.type === "integer") {
            row.push(Math.floor(Math.random() * 100));
          } else if (col.type === "decimal") {
            row.push((Math.random() * 1000).toFixed(2));
          } else if (col.type === "boolean") {
            row.push(i % 2 === 0);
          } else if (col.type === "timestamp") {
            row.push(new Date().toISOString());
          } else {
            row.push(`Value ${i}`);
          }
        });
        mockData.push(row);
      }
      return mockData;
    },
    []
  );

  const handleDbSelect = useCallback(
    async (dbKey: string) => {
      setIsLoading(true);
      setError(null);
      setSelectedTable(null);
      setTableData([]);
      setTableHead([]);

      try {
        // Simulate database initialization
        await new Promise((resolve) => setTimeout(resolve, 500));

        if (!initializedDatabases.has(dbKey)) {
          setInitializedDatabases(
            (prev) => new Set(Array.from(prev).concat(dbKey))
          );
        }

        setSelectedDbKey(dbKey);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    },
    [initializedDatabases]
  );

  const handleTableSelect = useCallback(
    (tableName: string) => {
      if (!selectedDbKey) return;

      setIsLoading(true);
      setSelectedTable(tableName);

      try {
        const schema = mockSchemas[selectedDbKey];
        const columns = schema.schemas[tableName].cols.map((c) => c.name);
        setTableHead(columns);

        // Generate mock data
        const mockData = generateMockData(
          tableName,
          schema.schemas[tableName].cols
        );
        setTableData(mockData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    },
    [selectedDbKey, generateMockData]
  );

  const handleRowClick = useCallback(
    (rowData: any[]) => {
      const rowObject: Record<string, any> = {};
      tableHead.forEach((head, index) => {
        rowObject[head] = rowData[index];
      });
      setSelectedRowData(rowObject);
      setIsFormModalOpen(true);
    },
    [tableHead]
  );

  const handleSave = async (formData: Record<string, any>) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert(
        selectedRowData
          ? "Record updated successfully!"
          : "Record created successfully!"
      );
      setIsFormModalOpen(false);
      setSelectedRowData(null);
      // Refresh data
      if (selectedTable) {
        handleTableSelect(selectedTable);
      }
    } catch (err) {
      alert(
        "Error: " + (err instanceof Error ? err.message : "An error occurred")
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this record?")) return;

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert("Record deleted successfully!");
      setIsFormModalOpen(false);
      setSelectedRowData(null);
      if (selectedTable) {
        handleTableSelect(selectedTable);
      }
    } catch (err) {
      alert("Error: " + (err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async (formData: GoogleSheetParams) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      alert("Data imported successfully!");
      setIsImportModalOpen(false);
      if (selectedTable) {
        handleTableSelect(selectedTable);
      }
    } catch (err) {
      alert(
        "Import Error: " +
          (err instanceof Error ? err.message : "An error occurred")
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearTable = async () => {
    if (
      !confirm(
        `Are you sure you want to clear all data in table "${selectedTable}"? This action cannot be undone!`
      )
    ) {
      return;
    }

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setTableData([]);
      alert(
        `All data in table "${selectedTable}" has been cleared successfully!`
      );
    } catch (err) {
      alert(
        "Error clearing table: " +
          (err instanceof Error ? err.message : "An error occurred")
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2 flex items-center justify-center gap-3">
            <Database className="w-10 h-10" />
            Database Manager
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your databases with @dqcai/orm
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-800 dark:text-red-300">
                Error
              </h3>
              <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="space-y-6">
          {/* Database Selection */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <Database className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                Select Database
              </h2>
            </div>
            <Dropdown
              label="Database"
              options={databaseKeys}
              value={selectedDbKey}
              onChange={handleDbSelect}
              disabled={isLoading}
            />

            {/* Database Status */}
            {selectedDbKey && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Status:
                  </span>
                  <span
                    className={`text-sm font-semibold ${
                      initializedDatabases.has(selectedDbKey)
                        ? "text-green-600 dark:text-green-400"
                        : "text-yellow-600 dark:text-yellow-400"
                    }`}
                  >
                    {initializedDatabases.has(selectedDbKey)
                      ? "✓ Initialized"
                      : "⚠ Not Initialized"}
                  </span>
                </div>
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <div>Database Type: {currentSchema?.database_type}</div>
                  <div>Version: {currentSchema?.version}</div>
                </div>
              </div>
            )}
          </div>

          {/* Table Selection */}
          {selectedDbKey && tableList.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center gap-2 mb-4">
                <Table className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                  Select Table
                </h2>
              </div>
              <Dropdown
                label="Table"
                options={tableList}
                value={selectedTable}
                onChange={handleTableSelect}
                disabled={isLoading}
              />
            </div>
          )}

          {/* Action Buttons */}
          {selectedTable && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Actions
              </h2>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => {
                    setSelectedRowData(null);
                    setIsFormModalOpen(true);
                  }}
                  disabled={isLoading}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <Plus className="w-5 h-5" />
                  Create New
                </button>

                <button
                  onClick={() => setIsImportModalOpen(true)}
                  disabled={isLoading}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <Upload className="w-5 h-5" />
                  Import Data
                </button>

                {tableData.length > 0 && (
                  <button
                    onClick={handleClearTable}
                    disabled={isLoading}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    <Trash2 className="w-5 h-5" />
                    Clear Table
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <span className="ml-3 text-gray-600 dark:text-gray-400">
                Loading...
              </span>
            </div>
          )}

          {/* Data Table */}
          {!isLoading && selectedTable && tableData.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                    {selectedTable}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Click on a row to edit • {tableData.length} records
                  </p>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Scroll horizontally to see all columns →
                </div>
              </div>
              <DataTable
                columns={tableHead}
                data={tableData}
                onRowClick={handleRowClick}
              />
            </div>
          )}

          {!isLoading && selectedTable && tableData.length === 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
              <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                No Data Available
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                This table is empty. Click "Create New" to add your first
                record.
              </p>
              <button
                onClick={() => {
                  setSelectedRowData(null);
                  setIsFormModalOpen(true);
                }}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all flex items-center gap-2 mx-auto shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
                Create First Record
              </button>
            </div>
          )}
        </div>

        {/* Modals */}
        <FormModal
          isOpen={isFormModalOpen}
          onClose={() => {
            setIsFormModalOpen(false);
            setSelectedRowData(null);
          }}
          title={selectedRowData ? "Edit Record" : "Create New Record"}
          columns={tableColumns}
          data={selectedRowData}
          onSave={handleSave}
          onDelete={selectedRowData ? handleDelete : null}
          isLoading={isLoading}
        />

        <ImportModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onImport={handleImport}
          isLoading={isLoading}
        />

        {/* Footer Info */}
        <div className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Powered by @dqcai/orm • Universal ORM Library</p>
          <p className="mt-1">
            Supports SQLite, PostgreSQL, MySQL, MongoDB, SQL Server, and more
          </p>
        </div>
      </div>
    </div>
  );
}
