// src/components/molecules/ExportActions.tsx
// Component for print and export actions for tax calculation results

import { Download, Printer } from 'lucide-react';
import type React from 'react';

interface ExportActionsProps {
  onPrint: () => void;
  onDownload: () => void;
  className?: string;
}

const ExportActions: React.FC<ExportActionsProps> = ({ onPrint, onDownload, className }) => {
  return (
    <div className={`flex space-x-2 ${className || ''}`}>
      <button
        type="button"
        onClick={onPrint}
        className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <Printer className="h-4 w-4 mr-1" />
        Print
      </button>

      <button
        type="button"
        onClick={onDownload}
        className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <Download className="h-4 w-4 mr-1" />
        CSV
      </button>
    </div>
  );
};

export default ExportActions;
