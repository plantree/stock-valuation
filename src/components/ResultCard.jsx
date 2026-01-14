function ResultCard({ title, value, unit, description, highlight = false }) {
  return (
    <div className={`p-6 rounded-xl ${highlight ? 'bg-primary-50 border-2 border-primary-200' : 'bg-gray-50'}`}>
      <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
      <div className="flex items-baseline space-x-1">
        <span className={`text-3xl font-bold ${highlight ? 'text-primary-600' : 'text-gray-900'}`}>
          {value}
        </span>
        {unit && <span className="text-lg text-gray-500">{unit}</span>}
      </div>
      {description && (
        <p className="mt-2 text-sm text-gray-600">{description}</p>
      )}
    </div>
  )
}

export default ResultCard
