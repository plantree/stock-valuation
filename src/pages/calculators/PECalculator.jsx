import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import InputField from '../../components/InputField'
import ResultCard from '../../components/ResultCard'
import FormulaDisplay from '../../components/FormulaDisplay'
import StockSelector from '../../components/StockSelector'
import DataSourceInfo from '../../components/DataSourceInfo'

function PECalculator() {
  const [stockPrice, setStockPrice] = useState('')
  const [eps, setEps] = useState('')
  const [industryPE, setIndustryPE] = useState('')
  const [selectedStock, setSelectedStock] = useState(null)

  // 当选择股票时自动填充数据
  const handleStockSelect = (stockData) => {
    setSelectedStock(stockData)
    if (stockData) {
      setStockPrice(stockData.price ? stockData.price.toString() : '')
      setEps(stockData.eps ? stockData.eps.toString() : '')
      setIndustryPE(stockData.industryPE ? stockData.industryPE.toString() : '')
      console.log('PE计算器填充数据:', { price: stockData.price, eps: stockData.eps, industryPE: stockData.industryPE })
    } else {
      setStockPrice('')
      setEps('')
      setIndustryPE('')
    }
  }

  const results = useMemo(() => {
    const price = parseFloat(stockPrice)
    const earnings = parseFloat(eps)
    const avgPE = parseFloat(industryPE)

    if (!price || !earnings || earnings === 0) return null

    const pe = price / earnings
    let fairValue = null
    let upside = null

    if (avgPE > 0) {
      fairValue = avgPE * earnings
      upside = ((fairValue - price) / price) * 100
    }

    let assessment = ''
    if (pe < 10) {
      assessment = '估值较低，可能被低估或存在风险'
    } else if (pe < 20) {
      assessment = '估值合理，处于正常水平'
    } else if (pe < 30) {
      assessment = '估值偏高，需关注增长预期'
    } else {
      assessment = '估值很高，可能存在泡沫风险'
    }

    return {
      pe: pe.toFixed(2),
      fairValue: fairValue?.toFixed(2),
      upside: upside?.toFixed(2),
      assessment
    }
  }, [stockPrice, eps, industryPE])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <nav className="text-sm text-gray-500 mb-2">
          <Link to="/" className="hover:text-primary-600">首页</Link>
          <span className="mx-2">/</span>
          <Link to="/relative" className="hover:text-primary-600">相对估值</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">市盈率 (PE)</span>
        </nav>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">市盈率 (P/E Ratio) 计算器</h1>
        <p className="text-gray-600">
          市盈率是最常用的估值指标之一，表示投资者愿意为每一元的公司利润支付多少价格。
          较低的PE可能意味着股票被低估，但也要结合公司增长前景和行业特点综合判断。
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
            <InputField
              label="当前股价"
              value={stockPrice}
              onChange={setStockPrice}
              placeholder="请输入股价"
              unit="元"
              helpText={selectedStock ? `数据来源: 实时行情` : "股票的当前市场价格"}
            />
            
            <InputField
              label="每股收益 (EPS)"
              value={eps}
              onChange={setEps}
              placeholder="请输入EPS"
              unit="元"
              helpText={selectedStock ? `数据来源: 利润表 (归属净利润/总股本)` : "过去12个月的每股净利润（TTM EPS）"}
            />

            <InputField
              label="行业平均PE（可选）"
              value={industryPE}
              onChange={setIndustryPE}
              placeholder="请输入行业PE"
              helpText={selectedStock ? `数据来源: ${selectedStock.industry}行业平均值` : "同行业公司的平均市盈率，用于计算合理估值"}
            />
          </div>

          {/* Formula */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">计算公式</h3>
            <FormulaDisplay
              formula="PE = 股价 / 每股收益"
              variables={[
                { symbol: 'PE', description: '市盈率' },
                { symbol: '股价', description: '当前市场价格' },
                { symbol: 'EPS', description: '每股收益 (Earnings Per Share)' }
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
                  title="市盈率 (PE)"
                  value={results.pe}
                  unit="倍"
                  highlight
                />
                {results.fairValue && (
                  <ResultCard
                    title="合理估值"
                    value={results.fairValue}
                    unit="元"
                  />
                )}
              </div>

              {results.upside && (
                <div className={`p-4 rounded-lg ${parseFloat(results.upside) >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">潜在空间</span>
                    <span className={`text-xl font-bold ${parseFloat(results.upside) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {parseFloat(results.upside) >= 0 ? '+' : ''}{results.upside}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    基于行业平均PE计算的理论上涨/下跌空间
                  </p>
                </div>
              )}

              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">估值评估</h3>
                <p className="text-blue-800">{results.assessment}</p>
              </div>
            </>
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <p>请输入股价和每股收益开始计算</p>
            </div>
          )}

          {/* Reference Values */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4">参考数值</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">PE &lt; 10</span>
                <span className="text-green-600 font-medium">可能被低估</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">PE 10-20</span>
                <span className="text-blue-600 font-medium">估值合理</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">PE 20-30</span>
                <span className="text-orange-600 font-medium">估值偏高</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">PE &gt; 30</span>
                <span className="text-red-600 font-medium">估值很高</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              注：不同行业的合理PE区间差异很大，科技成长股PE通常较高，传统行业PE较低
            </p>
          </div>
        </div>
      </div>

      {/* Educational Content */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">PE指标详解</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">静态PE vs 动态PE</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li><strong>静态PE：</strong>使用上一财年的每股收益计算</li>
              <li><strong>动态PE (TTM)：</strong>使用过去12个月的每股收益</li>
              <li><strong>预测PE：</strong>使用未来12个月的预期收益</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">使用注意事项</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• 亏损公司的PE无意义，需用其他指标</li>
              <li>• 需考虑公司的增长潜力和盈利质量</li>
              <li>• 一次性收益/损失会扭曲PE</li>
              <li>• 周期性行业需关注周期位置</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PECalculator
