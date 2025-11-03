// ./src/Components/DatabaseManager/hooks/useDatabase.ts

import { useState, useMemo, useCallback } from 'react';
import { ColumnDefinition, DatabaseSchema } from '../types';
import { mockSchemas } from '../constants';

export const useDatabase = () => {
  const [selectedDbKey, setSelectedDbKey] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tableData, setTableData] = useState<any[][]>([]);
  const [tableHead, setTableHead] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [initializedDatabases, setInitializedDatabases] = useState<Set<string>>(
    new Set(['myapp'])
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

  const generateMockData = useCallback(
    (tableName: string, columns: ColumnDefinition[]): any[][] => {
      const mockData: any[][] = [];
      for (let i = 1; i <= 10; i++) {
        const row: any[] = [];
        columns.forEach((col) => {
          if (col.name === 'id') {
            row.push(i);
          } else if (col.type === 'string') {
            row.push(`${col.name} ${i}`);
          } else if (col.type === 'integer') {
            row.push(Math.floor(Math.random() * 100));
          } else if (col.type === 'decimal') {
            row.push((Math.random() * 1000).toFixed(2));
          } else if (col.type === 'boolean') {
            row.push(i % 2 === 0);
          } else if (col.type === 'timestamp') {
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
        await new Promise((resolve) => setTimeout(resolve, 500));

        if (!initializedDatabases.has(dbKey)) {
          setInitializedDatabases(
            (prev) => new Set(Array.from(prev).concat(dbKey))
          );
        }

        setSelectedDbKey(dbKey);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
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

        const mockData = generateMockData(
          tableName,
          schema.schemas[tableName].cols
        );
        setTableData(mockData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    },
    [selectedDbKey, generateMockData]
  );

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
        'Error clearing table: ' +
          (err instanceof Error ? err.message : 'An error occurred')
      );
    } finally {
      setIsLoading(false);
    }
  };

  return {
    // State
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
    // Actions
    setIsLoading,
    setTableData,
    handleDbSelect,
    handleTableSelect,
    handleClearTable,
  };
};