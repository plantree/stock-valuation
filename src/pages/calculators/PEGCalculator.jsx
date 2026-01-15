import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import InputField from '../../components/InputField'
import ResultCard from '../../components/ResultCard'
import FormulaDisplay from '../../components/FormulaDisplay'
import StockSelector from '../../components/StockSelector'
import DataSourceInfo from '../../components/DataSourceInfo'

function PEGCalculator() {
  const [pe, setPE] = useState('')
  const [growthRate, setGrowthRate] = useState('')
  const [stockPrice, setStockPrice] = useState('')
  const [eps, setEps] = useState('')
  const [selectedStock, setSelectedStock] = useState(null)

  // 当选择股票时自动填充数据
  const handleStockSelect = (stockData) => {
    setSelectedStock(stockData)
    if (stockData) {
      setPE(stockData.pe ? stockData.pe.toString() : '')
      setStockPrice(stockData.price ? stockData.price.toString() : '')
      setEps(stockData.eps ? stockData.eps.toString() : '')
      setGrowthRate(stockData.profitGrowth3Y ? stockData.profitGrowth3Y.toString() : '10')
    } else {
      setPE('')
      setStockPrice('')
      setEps('')
      setGrowthRate('')
    }
  }

  const results = useMemo(() => {
    let peValue = parseFloat(pe)
    const growth = parseFloat(growthRate)
    const price = parseFloat(stockPrice)
    const earnings = parseFloat(eps)

    // 如果没有直接输入PE，从股价和EPS计算
    if (!peValue && price && earnings && earnings > 0) {
      peValue = price / earnings
    }

    if (!peValue || !growth || growth === 0) return null

    const peg = peValue / growth
    
    let assessment = ''
    let color = ''
    if (peg < 0) {
      assessment = 'PEG为负值，可能是公司亏损或增长率为负，需特别关注'
      color = 'red'
    } else if (peg < 0.5) {
      assessment = 'PEG显著低于1，可能是被严重低估的成长股'
      color = 'green'
    } else if (peg < 1) {
      assessment = 'PEG小于1，估值合理偏低，具有较好的投资价值'
      color = 'green'
    } else if (peg < 1.5) {
      assessment = 'PEG接近1，估值合理，增长与估值基本匹配'
      color = 'blue'
    } else if (peg < 2) {
      assessment = 'PEG偏高，估值略贵，需确认增长的可持续性'
      color = 'orange'
    } else {
      assessment = 'PEG显著高于1，估值偏贵，需谨慎投资'
      color = 'red'
    }

    // 计算合理PE（假设PEG=1为合理）
    const fairPE = growth
    let fairPrice = null
    if (earnings) {
      fairPrice = fairPE * earnings
    }

    return {
      pe: peValue.toFixed(2),
      peg: peg.toFixed(2),
      fairPE: fairPE.toFixed(2),
      fairPrice: fairPrice?.toFixed(2),
      assessment,
      color
    }
  }, [pe, growthRate, stockPrice, eps])

  const colorClasses = {
    green: 'bg-green-50 text-green-800',
    blue: 'bg-blue-50 text-blue-800',
    orange: 'bg-orange-50 text-orange-800',
    red: 'bg-red-50 text-red-800'
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <nav className="text-sm text-gray-500 mb-2">
          <Link to="/" className="hover:text-primary-600">首页</Link>
          <span className="mx-2">/</span>
          <Link to="/relative" className="hover:text-primary-600">相对估值</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">PEG比率</span>
        </nav>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">PEG 比率计算器</h1>
        <p className="text-gray-600">
          PEG比率将市盈率与盈利增长率结合，用于评估成长股的估值合理性。
          彼得·林奇认为PEG=1是合理估值，低于1可能被低估，高于1可能被高估。
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Calculator */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">计算参数</h2>
          
          {/* 股票选择器 */}
          <div className="mb-6">
            <StockSelector onSelect={handleStockSelect} />
          </div>

          {/* 数据来源说明 */}
          <div className="mb-6">
            <DataSourceInfo />
          </div>
          
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-3">方式一：直接输入PE</p>
              <InputField
                label="市盈率 (PE)"
                value={pe}
                onChange={setPE}
                placeholder="请输入PE"
                unit="倍"
                helpText={selectedStock ? "数据来源: 股价/每股收益" : "当前市盈率"}
              />
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-3">方式二：通过股价和EPS计算PE</p>
              <div className="grid grid-cols-2 gap-3">
                <InputField
                  label="股价"
                  value={stockPrice}
                  onChange={setStockPrice}
                  placeholder="股价"
                  unit="元"
                />
                <InputField
                  label="每股收益"
                  value={eps}
                  onChange={setEps}
                  placeholder="EPS"
                  unit="元"
                />
              </div>
            </div>
            
            <InputField
              label="预期盈利增长率"
              value={growthRate}
              onChange={setGrowthRate}
              placeholder="请输入增长率"
              unit="%"
              helpText={selectedStock ? `参考: 近3年利润复合增长率 ${selectedStock.profitGrowth3Y}%` : "未来3-5年的预期年化盈利增长率"}
            />
          </div>

          {/* Formula */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">计算公式</h3>
            <FormulaDisplay
              formula="PEG = PE / 盈利增长率(%)"
              variables={[
                { symbol: 'PEG', description: '市盈率相对盈利增长比率' },
                { symbol: 'PE', description: '市盈率' },
                { symbol: 'G', description: '预期盈利增长率（%形式的数值）' }
              ]}
            />
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">计算结果</h2>
          
          {results ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <ResultCard
                  title="PEG 比率"
                  value={results.peg}
                  highlight
                  description={parseFloat(results.peg) < 1 ? '小于1，具有投资价值' : '大于1，估值偏高'}
                />
                <ResultCard
                  title="当前PE"
                  value={results.pe}
                  unit="倍"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <ResultCard
                  title="合理PE（PEG=1时）"
                  value={results.fairPE}
                  unit="倍"
                />
                {results.fairPrice && (
                  <ResultCard
                    title="合理股价"
                    value={results.fairPrice}
                    unit="元"
                  />
                )}
              </div>

              <div className={`p-4 rounded-lg ${colorClasses[results.color]}`}>
                <h3 className="font-medium mb-2">估值评估</h3>
                <p>{results.assessment}</p>
              </div>

              {/* Visual Scale */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h3 className="font-medium text-gray-900 mb-4">PEG估值标尺</h3>
                <div className="relative h-8 bg-gradient-to-r from-green-400 via-yellow-400 to-red-400 rounded-full">
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-gray-800 rounded-full shadow-md"
                    style={{ 
                      left: `${Math.min(Math.max(parseFloat(results.peg) / 2.5 * 100, 0), 100)}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  <span>0</span>
                  <span>0.5</span>
                  <span>1.0</span>
                  <span>1.5</span>
                  <span>2.0</span>
                  <span>2.5+</span>
                </div>
                <div className="flex justify-between mt-1 text-xs">
                  <span className="text-green-600">低估</span>
                  <span className="text-blue-600">合理</span>
                  <span className="text-red-600">高估</span>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <p>请输入PE和预期增长率开始计算</p>
            </div>
          )}

          {/* Reference */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4">PEG 参考标准</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">PEG &lt; 0.5</span>
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">严重低估</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">PEG 0.5 - 1.0</span>
                <span className="px-2 py-1 bg-green-50 text-green-600 rounded text-xs font-medium">合理偏低</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">PEG = 1.0</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">合理估值</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">PEG 1.0 - 1.5</span>
                <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium">略微偏高</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">PEG &gt; 1.5</span>
                <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">估值偏高</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Educational Content */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">PEG指标详解</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">彼得·林奇的投资法则</h3>
            <div className="text-sm text-gray-600 space-y-2">
              <p>传奇投资者彼得·林奇普及了PEG的使用：</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>PEG = 1：PE与增长率匹配，估值合理</li>
                <li>PEG &lt; 1：增长未被充分定价，可能被低估</li>
                <li>PEG &gt; 2：通常过于昂贵</li>
              </ul>
            </div>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">使用注意事项</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• 增长率预测的准确性至关重要</li>
              <li>• 不适用于周期性行业</li>
              <li>• 低增长公司的PEG可能失真</li>
              <li>• 需结合行业特点调整判断标准</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PEGCalculator
