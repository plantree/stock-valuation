import { Link } from 'react-router-dom'

function CalculatorCard({ title, description, icon, to, color = 'primary' }) {
  const colorClasses = {
    primary: 'bg-primary-50 text-primary-600 group-hover:bg-primary-100',
    green: 'bg-green-50 text-green-600 group-hover:bg-green-100',
    purple: 'bg-purple-50 text-purple-600 group-hover:bg-purple-100',
    orange: 'bg-orange-50 text-orange-600 group-hover:bg-orange-100',
    blue: 'bg-blue-50 text-blue-600 group-hover:bg-blue-100',
    red: 'bg-red-50 text-red-600 group-hover:bg-red-100',
  }

  return (
    <Link
      to={to}
      className="group block p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all"
    >
      <div className={`w-12 h-12 rounded-lg ${colorClasses[color]} flex items-center justify-center mb-4 transition-colors`}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
        {title}
      </h3>
      <p className="text-sm text-gray-600">{description}</p>
    </Link>
  )
}

export default CalculatorCard
