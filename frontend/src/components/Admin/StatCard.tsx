import type { JSX } from "react";

const StatCard = ({ title, value, isLoading, icon }: { title: string, value?: number, isLoading: boolean, icon: JSX.Element }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 flex items-center gap-6">
      <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 rounded-lg p-4">
          {icon}
      </div>
      <div>
          <h3 className="text-md font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</h3>
          {isLoading ? (
          <div className="h-10 w-16 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse mt-1"></div>
          ) : (
          <p className="text-4xl font-bold text-gray-900 dark:text-white">{value || 0}</p>
          )}
      </div>
    </div>
  );

export default StatCard;
