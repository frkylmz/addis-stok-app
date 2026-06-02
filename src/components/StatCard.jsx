export const StatCard = ({ title, value, icon, colorClass }) => {
  return (
    <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-between transition-colors duration-200">
      <div className="space-y-1">
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
          {title}
        </span>
        <span className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white block">
          {value}
        </span>
      </div>
      {/* dark:bg-opacity-20 sayesinde aydınlık moddaki canlı renkler karanlık modda gözü yormaz */}
      <div
        className={`p-3 rounded-xl ${colorClass} dark:bg-opacity-25 flex-shrink-0`}
      >
        {icon}
      </div>
    </div>
  );
};
