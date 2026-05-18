export const StatCard = ({ title, value, icon, colorClass }) => (
  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
        {title}
      </p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
    <div className={`p-3 rounded-lg ${colorClass}`}>{icon}</div>
  </div>
);
