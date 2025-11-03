// ./src/Components/DatabaseManager/components/FormModal.tsx

import React, { useState, useEffect } from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import { FormModalProps, ColumnDefinition } from '../types';

export const FormModal: React.FC<FormModalProps> = ({
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
        if (col.type === 'boolean') {
          initialData[col.name] = col.default ?? false;
        } else {
          initialData[col.name] = col.default ?? '';
        }
      });
      setFormData(initialData);
    }
  }, [data, columns]);

  if (!isOpen) return null;

  const isAutoIncrement = (col: ColumnDefinition): boolean => {
    return (
      col.autoIncrement || col.constraints?.includes('AUTO_INCREMENT') || false
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
              col.required || col.constraints?.includes('NOT NULL');
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

                {col.type === 'boolean' ? (
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
                      {formData[col.name] ? 'Yes' : 'No'}
                    </span>
                  </label>
                ) : col.type === 'text' ? (
                  <textarea
                    value={formData[col.name] || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, [col.name]: e.target.value })
                    }
                    disabled={isDisabled}
                    placeholder={
                      isAuto ? 'Auto-generated' : `Enter ${col.name}`
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-gray-700"
                  />
                ) : (
                  <input
                    type={
                      col.type === 'integer' || col.type === 'decimal'
                        ? 'number'
                        : col.type === 'timestamp'
                        ? 'datetime-local'
                        : 'text'
                    }
                    value={formData[col.name] || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, [col.name]: e.target.value })
                    }
                    disabled={isDisabled}
                    placeholder={
                      isAuto ? 'Auto-generated' : `Enter ${col.name}`
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
              {data ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};