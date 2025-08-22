import type { JSX } from 'react';
import { Link } from 'react-router-dom';

const ActionCard = ({ to, title, description, icon }: { to: string, title: string, description: string, icon: JSX.Element }) => (
    <Link to={to} className="group block bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300 flex items-start gap-6">
        <div className="flex-shrink-0 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-300 rounded-lg p-4">
            {icon}
        </div>
        <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">{title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
            <div className="mt-4 text-sm font-semibold text-blue-600 dark:text-blue-400 group-hover:underline">
                Go &rarr;
            </div>
        </div>
    </Link>
);

export default ActionCard;
