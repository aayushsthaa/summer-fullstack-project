const StatItem = ({ label, value }: { label: string; value: string | number }) => (
    <div className="flex justify-between items-center text-sm">
      <p className="text-gray-600 dark:text-gray-400">{label}</p>
      <p className="font-bold text-gray-800 dark:text-gray-200">{value}</p>
    </div>
  );

export default StatItem;
