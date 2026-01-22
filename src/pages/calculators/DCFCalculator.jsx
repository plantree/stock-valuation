import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import InputField from '../../components/InputField'
import ResultCard from '../../components/ResultCard'
import FormulaDisplay from '../../components/FormulaDisplay'
import StockSelector from '../../components/StockSelector'
import DataSourceInfo from '../../components/DataSourceInfo'

function DCFCalculator() {
  // 基本参数
  const [currentFCF, setCurrentFCF] = useState('')
  const [growthRate1, setGrowthRate1] = useState('15')
  const [growthRate2, setGrowthRate2] = useState('8')
  const [terminalGrowth, setTerminalGrowth] = useState('3')
  const [wacc, setWacc] = useState('10')
  const [sharesOutstanding, setSharesOutstanding] = useState('')
  const [netDebt, setNetDebt] = useState('0')
  const [forecastYears1, setForecastYears1] = useState('5')
  const [forecastYears2, setForecastYears2] = useState('5')
  const [selectedStock, setSelectedStock] = useState(null)

  // 当选择股票时自动填充数据
  const handleStockSelect = (stockData) => {
    setSelectedStock(stockData)
    if (stockData) {
      setCurrentFCF(stockData.fcf ? stockData.fcf.toString() : '')
      setSharesOutstanding(stockData.sharesOutstanding ? stockData.sharesOutstanding.toString() : '')
      setNetDebt(stockData.netDebt !== undefined ? stockData.netDebt.toString() : '0')
      // 根据财报真实增长率设置预期增长率
      // 优先使用净利润同比增长率，其次使用营收增长率
      const growth = stockData.profitGrowthYOY || stockData.revenueGrowthYOY || stockData.profitGrowth3Y || 10
      // 第一阶段：使用财报增长率（限制在5%-30%之间）
      const g1 = Math.max(5, Math.min(growth, 30))
      setGrowthRate1(g1.toFixed(0))
      // 第二阶段：增长率衰减到一半（限制在3%-15%之间）
      const g2 = Math.max(3, Math.min(g1 * 0.5, 15))
      setGrowthRate2(g2.toFixed(0))
      console.log('DCF计算器填充数据:', stockData, '增长率:', growth.toFixed(1) + '%')
    } else {
      setCurrentFCF('')
      setSharesOutstanding('')
      setNetDebt('0')
    }
  }

  const results = useMemo(() => {
    const fcf = parseFloat(currentFCF)
    const g1 = parseFloat(growthRate1) / 100
    const g2 = parseFloat(growthRate2) / 100
    const tg = parseFloat(terminalGrowth) / 100
    const r = parseFloat(wacc) / 100
    const shares = parseFloat(sharesOutstanding)
    const debt = parseFloat(netDebt) || 0
    const years1 = parseInt(forecastYears1) || 5
    const years2 = parseInt(forecastYears2) || 5

    if (!fcf || !r || r <= tg || !shares) return null

    // 计算每年的FCF和现值
    const projections = []
    let pvSum = 0
    let currentCashFlow = fcf

    // 第一阶段：高速增长期
    for (let i = 1; i <= years1; i++) {
      currentCashFlow = currentCashFlow * (1 + g1)
      const pv = currentCashFlow / Math.pow(1 + r, i)
      pvSum += pv
      projections.push({
        year: i,
        fcf: currentCashFlow,
        pv: pv,
        phase: 1
      })
    }

    // 第二阶段：稳定增长期
    for (let i = years1 + 1; i <= years1 + years2; i++) {
      currentCashFlow = currentCashFlow * (1 + g2)
      const pv = currentCashFlow / Math.pow(1 + r, i)
      pvSum += pv
      projections.push({
        year: i,
        fcf: currentCashFlow,
        pv: pv,
        phase: 2
      })
    }

    // 终值计算 (Gordon Growth Model)
    const terminalYear = years1 + years2
    const terminalFCF = currentCashFlow * (1 + tg)
    const terminalValue = terminalFCF / (r - tg)
    const pvTerminal = terminalValue / Math.pow(1 + r, terminalYear)

    // 企业价值
    const enterpriseValue = pvSum + pvTerminal

    // 股权价值
    const equityValue = enterpriseValue - debt

    // 每股价值
    const shareValue = equityValue / shares

    // 敏感性分析
    const sensitivityData = []
    const waccRange = [-2, -1, 0, 1, 2]
    const growthRange = [-1, -0.5, 0, 0.5, 1]

    for (const waccDelta of waccRange) {
      const row = []
      for (const tgDelta of growthRange) {
        const newR = r + waccDelta / 100
        const newTg = tg + tgDelta / 100
        if (newR > newTg && newR > 0) {
          // 简化计算终值
          const newTV = terminalFCF / (newR - newTg)
          const newPVTV = newTV / Math.pow(1 + newR, terminalYear)
          // 重新计算FCF现值（简化）
          const adjustedPVSum = pvSum * Math.pow((1 + r) / (1 + newR), terminalYear / 2)
          const newEV = adjustedPVSum + newPVTV
          const newShareValue = (newEV - debt) / shares
          row.push(newShareValue.toFixed(2))
        } else {
          row.push('-')
        }
      }
      sensitivityData.push({
        wacc: (r * 100 + waccDelta).toFixed(1),
        values: row
      })
    }

    return {
      projections,
      pvSum: pvSum.toFixed(2),
      terminalValue: terminalValue.toFixed(2),
      pvTerminal: pvTerminal.toFixed(2),
      enterpriseValue: enterpriseValue.toFixed(2),
      equityValue: equityValue.toFixed(2),
      shareValue: shareValue.toFixed(2),
      terminalPercent: ((pvTerminal / enterpriseValue) * 100).toFixed(1),
      sensitivityData
    }
  }, [currentFCF, growthRate1, growthRate2, terminalGrowth, wacc, sharesOutstanding, netDebt, forecastYears1, forecastYears2])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <nav className="text-sm text-gray-500 mb-2">
          <Link to="/" className="hover:text-primary-600">首页</Link>
          <span className="mx-2">/</span>
          <Link to="/absolute" className="hover:text-primary-600">绝对估值</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">DCF 现金流折现</span>
        </nav>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">DCF 现金流折现模型</h1>
        <p className="text-gray-600">
          DCF模型通过预测公司未来的自由现金流，并使用适当的折现率将其折现到现在，
          计算公司的内在价值。这是最广泛使用的绝对估值方法。
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Calculator */}
        <div className="lg:col-span-1 space-y-6">
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
                label="当前自由现金流 (FCF)"
                value={currentFCF}
                onChange={setCurrentFCF}
                placeholder="亿元"
                unit="亿元"
                helpText={selectedStock ? "数据来源: 现金流量表 (经营现金流-资本支出)" : "最近12个月的自由现金流"}
              />
              
              <InputField
                label="总股本"
                value={sharesOutstanding}
                onChange={setSharesOutstanding}
                placeholder="亿股"
                unit="亿股"
                helpText={selectedStock ? "数据来源: 资产负债表/公司公告" : "公司的总股份数量"}
              />

              <InputField
                label="净债务"
                value={netDebt}
                onChange={setNetDebt}
                placeholder="0"
                unit="亿元"
                helpText={selectedStock ? "数据来源: 资产负债表 (有息负债-现金)" : "有息负债 - 现金及等价物"}
              />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">增长假设</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <InputField
                  label="高增长期"
                  value={forecastYears1}
                  onChange={setForecastYears1}
                  placeholder="5"
                  unit="年"
                />
                <InputField
                  label="增长率"
                  value={growthRate1}
                  onChange={setGrowthRate1}
                  placeholder="15"
                  unit="%"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <InputField
                  label="稳定期"
                  value={forecastYears2}
                  onChange={setForecastYears2}
                  placeholder="5"
                  unit="年"
                />
                <InputField
                  label="增长率"
                  value={growthRate2}
                  onChange={setGrowthRate2}
                  placeholder="8"
                  unit="%"
                />
              </div>

              <InputField
                label="永续增长率"
                value={terminalGrowth}
                onChange={setTerminalGrowth}
                placeholder="3"
                unit="%"
                helpText="长期稳定增长率，通常接近GDP增速"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">折现率</h2>
            <InputField
              label="WACC (加权平均资本成本)"
              value={wacc}
              onChange={setWacc}
              placeholder="10"
              unit="%"
              helpText="反映投资风险的折现率"
            />
            <div className="mt-3 text-xs text-gray-500 space-y-1">
              <p>参考范围：</p>
              <p>• 大型蓝筹股：7-9%</p>
              <p>• 一般企业：9-12%</p>
              <p>• 高风险企业：12-15%+</p>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-2 space-y-6">
          {results ? (
            <>
              {/* Main Results */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">估值结果</h2>
                <div className="grid sm:grid-cols-3 gap-4">
                  <ResultCard
                    title="每股内在价值"
                    value={results.shareValue}
                    unit="元"
                    highlight
                  />
                  <ResultCard
                    title="股权价值"
                    value={results.equityValue}
                    unit="亿元"
                  />
                  <ResultCard
                    title="企业价值"
                    value={results.enterpriseValue}
                    unit="亿元"
                  />
                </div>
              </div>

              {/* Value Breakdown */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">价值构成</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="text-sm text-blue-600 mb-1">预测期现金流现值</div>
                    <div className="text-2xl font-bold text-blue-900">{results.pvSum} 亿元</div>
                    <div className="text-sm text-blue-600">占比: {(100 - parseFloat(results.terminalPercent)).toFixed(1)}%</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="text-sm text-purple-600 mb-1">终值现值</div>
                    <div className="text-2xl font-bold text-purple-900">{results.pvTerminal} 亿元</div>
                    <div className="text-sm text-purple-600">占比: {results.terminalPercent}%</div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  注：终值通常占企业价值的50-80%，对假设非常敏感
                </p>
              </div>

              {/* Cash Flow Projections */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">现金流预测</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left">年份</th>
                        <th className="px-3 py-2 text-left">阶段</th>
                        <th className="px-3 py-2 text-right">FCF (亿元)</th>
                        <th className="px-3 py-2 text-right">现值 (亿元)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {results.projections.map((p) => (
                        <tr key={p.year} className={p.phase === 1 ? 'bg-blue-50/30' : 'bg-purple-50/30'}>
                          <td className="px-3 py-2">第{p.year}年</td>
                          <td className="px-3 py-2">
                            <span className={`text-xs px-2 py-0.5 rounded ${p.phase === 1 ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                              {p.phase === 1 ? '高增长期' : '稳定期'}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-right font-mono">{p.fcf.toFixed(2)}</td>
                          <td className="px-3 py-2 text-right font-mono">{p.pv.toFixed(2)}</td>
                        </tr>
                      ))}
                      <tr className="bg-gray-100 font-medium">
                        <td className="px-3 py-2">终值</td>
                        <td className="px-3 py-2">
                          <span className="text-xs px-2 py-0.5 rounded bg-gray-200 text-gray-700">永续期</span>
                        </td>
                        <td className="px-3 py-2 text-right font-mono">{results.terminalValue}</td>
                        <td className="px-3 py-2 text-right font-mono">{results.pvTerminal}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sensitivity Analysis */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">敏感性分析</h2>
                <p className="text-sm text-gray-600 mb-4">每股价值随WACC和永续增长率变化</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-3 py-2 text-left">WACC</th>
                        {[-1, -0.5, 0, 0.5, 1].map(d => (
                          <th key={d} className="px-3 py-2 text-center">
                            g={((parseFloat(terminalGrowth) + d)).toFixed(1)}%
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {results.sensitivityData.map((row, i) => (
                        <tr key={i} className={i === 2 ? 'bg-yellow-50' : ''}>
                          <td className="px-3 py-2 font-medium">{row.wacc}%</td>
                          {row.values.map((v, j) => (
                            <td key={j} className={`px-3 py-2 text-center font-mono ${i === 2 && j === 2 ? 'bg-yellow-100 font-bold' : ''}`}>
                              {v}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  黄色高亮为当前参数对应的估值
                </p>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <p className="text-lg">请输入基本参数开始DCF估值</p>
              <p className="text-sm mt-2">需要输入：自由现金流、总股本</p>
            </div>
          )}

          {/* Formula */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">计算公式</h2>
            <FormulaDisplay
              formula="企业价值 = Σ FCFt/(1+r)^t + TV/(1+r)^n"
              variables={[
                { symbol: 'FCFt', description: '第t年的自由现金流' },
                { symbol: 'r', description: 'WACC (加权平均资本成本)' },
                { symbol: 'TV', description: '终值 = FCFn+1 / (r - g)' },
                { symbol: 'g', description: '永续增长率' },
                { symbol: 'n', description: '预测期年数' }
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default DCFCalculator
