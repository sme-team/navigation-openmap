// ./src/Components/DatabaseManager/components/ImportModal.tsx

import React, { useState } from 'react';
import { Loader2, Upload } from 'lucide-react';
import { ImportModalProps, GoogleSheetParams } from '../types';

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
  isLoading,
}) => {
  const [formData, setFormData] = useState<GoogleSheetParams>({
    googleSheetLink:
      'https://docs.google.com/spreadsheets/d/1VPQgrDqbvVhxbjYp5Vv2Korvh2fYCubB/edit?gid=594575742#gid=594575742',
    sheets: 'categories',
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