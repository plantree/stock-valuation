import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import InputField from '../../components/InputField'
import ResultCard from '../../components/ResultCard'
import FormulaDisplay from '../../components/FormulaDisplay'
import StockSelector from '../../components/StockSelector'
import DataSourceInfo from '../../components/DataSourceInfo'

function PSCalculator() {
  const [stockPrice, setStockPrice] = useState('')
  const [sps, setSps] = useState('')
  const [netMargin, setNetMargin] = useState('')
  const [industryPS, setIndustryPS] = useState('')
  const [selectedStock, setSelectedStock] = useState(null)

  // 当选择股票时自动填充数据
  const handleStockSelect = (stockData) => {
    setSelectedStock(stockData)
    if (stockData) {
      setStockPrice(stockData.price ? stockData.price.toString() : '')
      // 计算每股收入
      if (stockData.sps) {
        setSps(stockData.sps.toFixed(2))
      } else if (stockData.revenue && stockData.sharesOutstanding) {
        const salesPerShare = (stockData.revenue / stockData.sharesOutstanding).toFixed(2)
        setSps(salesPerShare)
      } else {
        setSps('')
      }
      // 计算净利率
      if (stockData.netProfit && stockData.revenue) {
        const margin = ((stockData.netProfit / stockData.revenue) * 100).toFixed(2)
        setNetMargin(margin)
      } else {
        setNetMargin('')
      }
      setIndustryPS(stockData.industryPS ? stockData.industryPS.toString() : '')
      console.log('PS计算器填充数据:', stockData)
    } else {
      setStockPrice('')
      setSps('')
      setNetMargin('')
      setIndustryPS('')
    }
  }

  const results = useMemo(() => {
    const price = parseFloat(stockPrice)
    const salesPerShare = parseFloat(sps)
    const margin = parseFloat(netMargin)
    const avgPS = parseFloat(industryPS)

    if (!price || !salesPerShare || salesPerShare === 0) return null

    const ps = price / salesPerShare
    let fairValue = null
    let upside = null
    let impliedPE = null

    // 如果有净利率，计算隐含PE
    if (margin > 0) {
      impliedPE = ps / (margin / 100)
    }

    if (avgPS > 0) {
      fairValue = avgPS * salesPerShare
      upside = ((fairValue - price) / price) * 100
    }

    let assessment = ''
    if (ps < 1) {
      assessment = 'PS小于1倍，估值很低，需关注公司盈利能力'
    } else if (ps < 3) {
      assessment = '估值合理，处于正常水平'
    } else if (ps < 6) {
      assessment = '估值偏高，通常需要高增长或高利润率支撑'
    } else if (ps < 10) {
      assessment = '估值较高，适用于高成长性科技公司'
    } else {
      assessment = '估值非常高，需要极高的增长预期支撑'
    }

    return {
      ps: ps.toFixed(2),
      fairValue: fairValue?.toFixed(2),
      upside: upside?.toFixed(2),
      impliedPE: impliedPE?.toFixed(2),
      assessment
    }
  }, [stockPrice, sps, netMargin, industryPS])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <nav className="text-sm text-gray-500 mb-2">
          <Link to="/" className="hover:text-primary-600">首页</Link>
          <span className="mx-2">/</span>
          <Link to="/relative" className="hover:text-primary-600">相对估值</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">市销率 (PS)</span>
        </nav>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">市销率 (P/S Ratio) 计算器</h1>
        <p className="text-gray-600">
          市销率衡量股价与每股销售收入的比率，特别适用于尚未盈利但收入增长迅速的公司。
          由于销售收入比利润更难操纵，PS常被视为更稳定的估值指标。
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
              helpText={selectedStock ? "数据来源: 实时行情" : "股票的当前市场价格"}
            />
            
            <InputField
              label="每股销售收入 (SPS)"
              value={sps}
              onChange={setSps}
              placeholder="请输入每股收入"
              unit="元"
              helpText={selectedStock ? "数据来源: 利润表 (营业收入/总股本)" : "总营业收入除以总股数"}
            />

            <InputField
              label="净利润率（可选）"
              value={netMargin}
              onChange={setNetMargin}
              placeholder="请输入净利润率"
              unit="%"
              helpText="用于计算隐含PE"
            />

            <InputField
              label="行业平均PS（可选）"
              value={industryPS}
              onChange={setIndustryPS}
              placeholder="请输入行业PS"
              helpText="同行业公司的平均市销率"
            />
          </div>

          {/* Formula */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">计算公式</h3>
            <FormulaDisplay
              formula="PS = 股价 / 每股销售收入"
              variables={[
                { symbol: 'PS', description: '市销率' },
                { symbol: '股价', description: '当前市场价格' },
                { symbol: 'SPS', description: '每股销售收入 (Sales Per Share)' }
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
                  title="市销率 (PS)"
                  value={results.ps}
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

              {results.impliedPE && (
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">隐含PE（基于净利率）</span>
                    <span className="text-xl font-bold text-purple-600">{results.impliedPE}倍</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    PS / 净利润率 = 隐含的市盈率水平
                  </p>
                </div>
              )}

              {results.upside && (
                <div className={`p-4 rounded-lg ${parseFloat(results.upside) >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">潜在空间</span>
                    <span className={`text-xl font-bold ${parseFloat(results.upside) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {parseFloat(results.upside) >= 0 ? '+' : ''}{results.upside}%
                    </span>
                  </div>
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
              <p>请输入股价和每股销售收入开始计算</p>
            </div>
          )}

          {/* Industry Reference */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4">行业PS参考范围</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">SaaS软件</span>
                <span className="font-medium">5-15倍</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">互联网平台</span>
                <span className="font-medium">3-10倍</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">消费品</span>
                <span className="font-medium">1-4倍</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">零售业</span>
                <span className="font-medium">0.3-1.5倍</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">制造业</span>
                <span className="font-medium">0.5-2倍</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Educational Content */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">PS指标详解</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">优点</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>✓ 适用于亏损公司（PE无法使用）</li>
              <li>✓ 收入数据比利润更难操纵</li>
              <li>✓ 对会计政策差异敏感度低</li>
              <li>✓ 便于跨国公司比较</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">局限性</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• 忽略盈利能力差异</li>
              <li>• 高收入低利润公司可能被高估</li>
              <li>• 需结合利润率综合判断</li>
              <li>• 行业间差异大，可比性受限</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PSCalculator
