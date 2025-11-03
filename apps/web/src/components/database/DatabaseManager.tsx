// ./src/Components/DatabaseManager/DatabaseManager.tsx
"use client";

import React, { useState, useCallback } from "react";
import {
  AlertCircle,
  Database,
  Table,
  Plus,
  Upload,
  Trash2,
  Loader2,
} from "lucide-react";

import { useDatabase } from "./hooks/useDatabase";
import { Dropdown, DataTable, FormModal, ImportModal } from "./components";
import { GoogleSheetParams } from "./types";

export default function DatabaseManager() {
  const {
    selectedDbKey,
    selectedTable,
    tableData,
    tableHead,
    isLoading,
    error,
    initializedDatabases,
    databaseKeys,
    currentSchema,
    tableList,
    tableColumns,
    setIsLoading,
    handleDbSelect,
    handleTableSelect,
    handleClearTable,
  } = useDatabase();

  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [selectedRowData, setSelectedRowData] = useState<Record<
    string,
    any
  > | null>(null);

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