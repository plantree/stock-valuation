import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import InputField from '../../components/InputField'
import ResultCard from '../../components/ResultCard'
import FormulaDisplay from '../../components/FormulaDisplay'
import StockSelector from '../../components/StockSelector'
import DataSourceInfo from '../../components/DataSourceInfo'

function DDMCalculator() {
  const [modelType, setModelType] = useState('gordon') // gordon, two-stage, h-model
  
  // Gordon模型参数
  const [currentDividend, setCurrentDividend] = useState('')
  const [requiredReturn, setRequiredReturn] = useState('10')
  const [growthRate, setGrowthRate] = useState('5')
  
  // 两阶段模型参数
  const [highGrowthRate, setHighGrowthRate] = useState('15')
  const [highGrowthYears, setHighGrowthYears] = useState('5')
  const [stableGrowthRate, setStableGrowthRate] = useState('3')

  // 当前股价（用于比较）
  const [currentPrice, setCurrentPrice] = useState('')
  const [selectedStock, setSelectedStock] = useState(null)

  // 当选择股票时自动填充数据
  const handleStockSelect = (stockData) => {
    setSelectedStock(stockData)
    if (stockData) {
      setCurrentDividend(stockData.dividend ? stockData.dividend.toString() : '')
      setCurrentPrice(stockData.price ? stockData.price.toString() : '')
      // 根据历史股利增长率设置预期增长率
      const divGrowth = stockData.dividendGrowth3Y || 5
      setGrowthRate(divGrowth.toString())
      setHighGrowthRate(Math.min(divGrowth * 1.2, 20).toFixed(0))
      setStableGrowthRate(Math.min(divGrowth * 0.3, 4).toFixed(0))
      console.log('DDM计算器填充数据:', stockData)
    } else {
      setCurrentDividend('')
      setCurrentPrice('')
      setGrowthRate('5')
    }
  }

  const results = useMemo(() => {
    const d0 = parseFloat(currentDividend)
    const r = parseFloat(requiredReturn) / 100
    const g = parseFloat(growthRate) / 100
    const gHigh = parseFloat(highGrowthRate) / 100
    const gStable = parseFloat(stableGrowthRate) / 100
    const years = parseInt(highGrowthYears) || 5
    const price = parseFloat(currentPrice)

    if (!d0 || !r) return null

    let intrinsicValue = 0
    let dividendProjections = []

    if (modelType === 'gordon') {
      // Gordon Growth Model: P = D1 / (r - g)
      if (r <= g) return { error: '要求回报率必须大于增长率' }
      
      const d1 = d0 * (1 + g)
      intrinsicValue = d1 / (r - g)
      
      // 5年股利预测
      let currentDiv = d0
      for (let i = 1; i <= 5; i++) {
        currentDiv = currentDiv * (1 + g)
        const pv = currentDiv / Math.pow(1 + r, i)
        dividendProjections.push({
          year: i,
          dividend: currentDiv,
          pv: pv
        })
      }
    } else if (modelType === 'two-stage') {
      // Two-Stage DDM
      if (r <= gStable) return { error: '要求回报率必须大于稳定期增长率' }
      
      let pvSum = 0
      let currentDiv = d0
      
      // 高增长期
      for (let i = 1; i <= years; i++) {
        currentDiv = currentDiv * (1 + gHigh)
        const pv = currentDiv / Math.pow(1 + r, i)
        pvSum += pv
        dividendProjections.push({
          year: i,
          dividend: currentDiv,
          pv: pv,
          phase: 'high'
        })
      }
      
      // 稳定期终值
      const terminalDiv = currentDiv * (1 + gStable)
      const terminalValue = terminalDiv / (r - gStable)
      const pvTerminal = terminalValue / Math.pow(1 + r, years)
      
      intrinsicValue = pvSum + pvTerminal
      
      // 添加几年稳定期预测
      for (let i = years + 1; i <= years + 3; i++) {
        currentDiv = currentDiv * (1 + gStable)
        const pv = currentDiv / Math.pow(1 + r, i)
        dividendProjections.push({
          year: i,
          dividend: currentDiv,
          pv: pv,
          phase: 'stable'
        })
      }
    } else if (modelType === 'h-model') {
      // H-Model: 增长率线性下降
      if (r <= gStable) return { error: '要求回报率必须大于稳定期增长率' }
      
      const H = years / 2
      const d1 = d0 * (1 + gStable)
      intrinsicValue = (d0 * (1 + gStable) + d0 * H * (gHigh - gStable)) / (r - gStable)
      
      // 预测股利（简化）
      let currentDiv = d0
      for (let i = 1; i <= years + 3; i++) {
        const decayRate = Math.max(gHigh - (gHigh - gStable) * (i / years), gStable)
        currentDiv = currentDiv * (1 + decayRate)
        const pv = currentDiv / Math.pow(1 + r, i)
        dividendProjections.push({
          year: i,
          dividend: currentDiv,
          pv: pv,
          growthRate: decayRate * 100
        })
      }
    }

    // 计算安全边际
    let margin = null
    let recommendation = ''
    if (price > 0) {
      margin = ((intrinsicValue - price) / price) * 100
      if (margin > 30) {
        recommendation = '当前价格显著低于内在价值，存在较大安全边际'
      } else if (margin > 10) {
        recommendation = '当前价格低于内在价值，具有一定投资价值'
      } else if (margin > -10) {
        recommendation = '当前价格接近内在价值，估值合理'
      } else if (margin > -30) {
        recommendation = '当前价格高于内在价值，估值偏高'
      } else {
        recommendation = '当前价格显著高于内在价值，存在较大风险'
      }
    }

    // 计算隐含回报率
    let impliedReturn = null
    if (price > 0 && modelType === 'gordon') {
      impliedReturn = (d0 * (1 + g) / price + g) * 100
    }

    return {
      intrinsicValue: intrinsicValue.toFixed(2),
      dividendProjections,
      margin: margin?.toFixed(2),
      recommendation,
      impliedReturn: impliedReturn?.toFixed(2),
      d1: (d0 * (1 + g)).toFixed(2)
    }
  }, [modelType, currentDividend, requiredReturn, growthRate, highGrowthRate, highGrowthYears, stableGrowthRate, currentPrice])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <nav className="text-sm text-gray-500 mb-2">
          <Link to="/" className="hover:text-primary-600">首页</Link>
          <span className="mx-2">/</span>
          <Link to="/absolute" className="hover:text-primary-600">绝对估值</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">DDM 股利折现</span>
        </nav>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">DDM 股利折现模型</h1>
        <p className="text-gray-600">
          股利折现模型认为股票的价值等于未来所有股利的现值之和。
          适用于有稳定股利支付历史的成熟公司，如公用事业、银行等。
        </p>
      </div>

      {/* Model Selection */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">选择模型类型</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <button
            onClick={() => setModelType('gordon')}
            className={`p-4 rounded-lg border-2 text-left transition-all ${
              modelType === 'gordon'
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <h3 className="font-medium text-gray-900">Gordon 增长模型</h3>
            <p className="text-sm text-gray-500 mt-1">
              假设股利永续稳定增长，最简单的DDM模型
            </p>
          </button>
          <button
            onClick={() => setModelType('two-stage')}
            className={`p-4 rounded-lg border-2 text-left transition-all ${
              modelType === 'two-stage'
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <h3 className="font-medium text-gray-900">两阶段模型</h3>
            <p className="text-sm text-gray-500 mt-1">
              先高增长，后稳定增长，适合成长期公司
            </p>
          </button>
          <button
            onClick={() => setModelType('h-model')}
            className={`p-4 rounded-lg border-2 text-left transition-all ${
              modelType === 'h-model'
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <h3 className="font-medium text-gray-900">H 模型</h3>
            <p className="text-sm text-gray-500 mt-1">
              增长率线性下降至稳定水平，更平滑的过渡
            </p>
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Calculator */}
        <div className="space-y-6">
          {/* 股票选择器 */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">选择股票</h2>
            <StockSelector onSelect={handleStockSelect} />
            <div className="mt-4">
              <DataSourceInfo />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">基本参数</h2>
            <div className="space-y-4">
              <InputField
                label="当前股息 (D₀)"
                value={currentDividend}
                onChange={setCurrentDividend}
                placeholder="最近一年的每股股息"
                unit="元"
                helpText={selectedStock ? "数据来源: 分红公告 (每股派息)" : "最近12个月支付的每股股利"}
              />
              
              <InputField
                label="要求回报率 (r)"
                value={requiredReturn}
                onChange={setRequiredReturn}
                placeholder="10"
                unit="%"
                helpText="投资者期望的最低回报率"
              />

              {modelType === 'gordon' && (
                <InputField
                  label="股息增长率 (g)"
                  value={growthRate}
                  onChange={setGrowthRate}
                  placeholder="5"
                  unit="%"
                  helpText={selectedStock ? `参考: 近3年股利复合增长率 ${selectedStock.dividendGrowth3Y}%` : "预期的永续股息增长率"}
                />
              )}

              {(modelType === 'two-stage' || modelType === 'h-model') && (
                <>
                  <InputField
                    label="高增长期年限"
                    value={highGrowthYears}
                    onChange={setHighGrowthYears}
                    placeholder="5"
                    unit="年"
                    helpText={modelType === 'h-model' ? '增长率下降至稳定水平的时间' : '高增长阶段持续年数'}
                  />
                  <InputField
                    label="高增长期股息增长率"
                    value={highGrowthRate}
                    onChange={setHighGrowthRate}
                    placeholder="15"
                    unit="%"
                  />
                  <InputField
                    label="稳定期股息增长率"
                    value={stableGrowthRate}
                    onChange={setStableGrowthRate}
                    placeholder="3"
                    unit="%"
                    helpText="进入稳定期后的永续增长率"
                  />
                </>
              )}

              <div className="border-t pt-4 mt-4">
                <InputField
                  label="当前股价（可选）"
                  value={currentPrice}
                  onChange={setCurrentPrice}
                  placeholder="用于计算安全边际"
                  unit="元"
                  helpText={selectedStock ? "数据来源: 实时行情" : "输入当前股价以计算投资价值"}
                />
              </div>
            </div>
          </div>

          {/* Formula */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">计算公式</h2>
            {modelType === 'gordon' && (
              <FormulaDisplay
                formula="P = D₁ / (r - g)"
                variables={[
                  { symbol: 'P', description: '股票内在价值' },
                  { symbol: 'D₁', description: '下一年预期股息 = D₀ × (1 + g)' },
                  { symbol: 'r', description: '要求回报率（折现率）' },
                  { symbol: 'g', description: '股息永续增长率' }
                ]}
              />
            )}
            {modelType === 'two-stage' && (
              <FormulaDisplay
                formula="P = Σ Dt/(1+r)^t + Pn/(1+r)^n"
                variables={[
                  { symbol: 'Dt', description: '第t年的股息' },
                  { symbol: 'Pn', description: '第n年末的股票价值 (使用Gordon模型)' },
                  { symbol: 'r', description: '要求回报率' },
                  { symbol: 'n', description: '高增长期年数' }
                ]}
              />
            )}
            {modelType === 'h-model' && (
              <FormulaDisplay
                formula="P = D₀(1+gL) + D₀×H×(gS-gL) / (r-gL)"
                variables={[
                  { symbol: 'H', description: '半衰期 = 高增长期年限 / 2' },
                  { symbol: 'gS', description: '初始高增长率' },
                  { symbol: 'gL', description: '长期稳定增长率' },
                  { symbol: 'r', description: '要求回报率' }
                ]}
              />
            )}
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {results && !results.error ? (
            <>
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">估值结果</h2>
                <div className="grid grid-cols-2 gap-4">
                  <ResultCard
                    title="股票内在价值"
                    value={results.intrinsicValue}
                    unit="元"
                    highlight
                  />
                  {modelType === 'gordon' && (
                    <ResultCard
                      title="预期下年股息 (D₁)"
                      value={results.d1}
                      unit="元"
                    />
                  )}
                </div>

                {results.margin && (
                  <div className={`mt-4 p-4 rounded-lg ${parseFloat(results.margin) >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-700">安全边际</span>
                      <span className={`text-xl font-bold ${parseFloat(results.margin) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {parseFloat(results.margin) >= 0 ? '+' : ''}{results.margin}%
                      </span>
                    </div>
                    <p className={`text-sm ${parseFloat(results.margin) >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                      {results.recommendation}
                    </p>
                  </div>
                )}

                {results.impliedReturn && (
                  <div className="mt-4 bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">隐含预期回报率</span>
                      <span className="text-xl font-bold text-purple-600">{results.impliedReturn}%</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      基于当前股价计算的预期年化回报 = 股息收益率 + 增长率
                    </p>
                  </div>
                )}
              </div>

              {/* Dividend Projections */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">股息预测</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left">年份</th>
                        {(modelType === 'two-stage') && <th className="px-3 py-2 text-left">阶段</th>}
                        {modelType === 'h-model' && <th className="px-3 py-2 text-right">增长率</th>}
                        <th className="px-3 py-2 text-right">股息</th>
                        <th className="px-3 py-2 text-right">现值</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {results.dividendProjections.map((p) => (
                        <tr key={p.year}>
                          <td className="px-3 py-2">第{p.year}年</td>
                          {modelType === 'two-stage' && (
                            <td className="px-3 py-2">
                              <span className={`text-xs px-2 py-0.5 rounded ${
                                p.phase === 'high' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                              }`}>
                                {p.phase === 'high' ? '高增长' : '稳定期'}
                              </span>
                            </td>
                          )}
                          {modelType === 'h-model' && (
                            <td className="px-3 py-2 text-right font-mono">{p.growthRate?.toFixed(1)}%</td>
                          )}
                          <td className="px-3 py-2 text-right font-mono">{p.dividend.toFixed(2)}</td>
                          <td className="px-3 py-2 text-right font-mono">{p.pv.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : results?.error ? (
            <div className="bg-red-50 rounded-xl p-6 text-center">
              <svg className="w-12 h-12 mx-auto mb-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-700 font-medium">{results.error}</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <p className="text-lg">请输入股息和回报率开始计算</p>
            </div>
          )}

          {/* Tips */}
          <div className="bg-yellow-50 rounded-xl p-6">
            <h3 className="font-semibold text-yellow-900 mb-3">使用提示</h3>
            <ul className="space-y-2 text-sm text-yellow-800">
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mr-2 mt-1.5"></span>
                <span>DDM只适用于支付稳定股息的公司</span>
              </li>
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mr-2 mt-1.5"></span>
                <span>要求回报率(r)必须大于增长率(g)，否则模型无解</span>
              </li>
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mr-2 mt-1.5"></span>
                <span>永续增长率通常不应超过GDP长期增速(2-4%)</span>
              </li>
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mr-2 mt-1.5"></span>
                <span>对增长率假设非常敏感，需谨慎设定</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DDMCalculator
