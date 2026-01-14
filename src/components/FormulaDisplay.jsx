function FormulaDisplay({ formula, variables }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="text-center mb-4">
        <code className="text-lg font-mono text-gray-800">{formula}</code>
      </div>
      {variables && variables.length > 0 && (
        <div className="space-y-1 text-sm text-gray-600">
          <p className="font-medium text-gray-700 mb-2">其中：</p>
          {variables.map((v, i) => (
            <p key={i}>
              <code className="text-primary-600 font-mono">{v.symbol}</code> = {v.description}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}

export default FormulaDisplay
