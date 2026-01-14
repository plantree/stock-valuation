import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import InputField from '../../components/InputField'
import ResultCard from '../../components/ResultCard'
import FormulaDisplay from '../../components/FormulaDisplay'
import StockSelector from '../../components/StockSelector'
import DataSourceInfo from '../../components/DataSourceInfo'

function PBCalculator() {
  const [stockPrice, setStockPrice] = useState('')
  const [bvps, setBvps] = useState('')
  const [roe, setRoe] = useState('')
  const [industryPB, setIndustryPB] = useState('')
  const [selectedStock, setSelectedStock] = useState(null)

  // 当选择股票时自动填充数据
  const handleStockSelect = (stockData) => {
    setSelectedStock(stockData)
    if (stockData) {
      setStockPrice(stockData.price ? stockData.price.toString() : '')
      setBvps(stockData.bvps ? stockData.bvps.toString() : '')
      setRoe(stockData.roe ? stockData.roe.toString() : '')
      setIndustryPB(stockData.industryPB ? stockData.industryPB.toString() : '')
      console.log('PB计算器填充数据:', { price: stockData.price, bvps: stockData.bvps, roe: stockData.roe })
    } else {
      setStockPrice('')
      setBvps('')
      setRoe('')
      setIndustryPB('')
    }
  }

  const results = useMemo(() => {
    const price = parseFloat(stockPrice)
    const bookValue = parseFloat(bvps)
    const returnOnEquity = parseFloat(roe)
    const avgPB = parseFloat(industryPB)

    if (!price || !bookValue || bookValue === 0) return null

    const pb = price / bookValue
    let fairValue = null
    let upside = null
    let theoreticalPB = null

    // 使用ROE计算理论PB（基于简化的Gordon模型）
    if (returnOnEquity > 0) {
      // 假设长期增长率约为ROE的一半，折现率约为10%
      const g = Math.min(returnOnEquity / 2, 8) // 限制增长率
      const r = 10
      if (r > g) {
        theoreticalPB = (returnOnEquity / 100 - g / 100) / (r / 100 - g / 100)
      }
    }

    if (avgPB > 0) {
      fairValue = avgPB * bookValue
      upside = ((fairValue - price) / price) * 100
    }

    let assessment = ''
    if (pb < 1) {
      assessment = '股价低于每股净资产，可能被严重低估（或公司资产质量存疑）'
    } else if (pb < 1.5) {
      assessment = '估值较低，需结合ROE判断是否有投资价值'
    } else if (pb < 3) {
      assessment = '估值合理，处于正常水平'
    } else if (pb < 5) {
      assessment = '估值偏高，通常需要较高的ROE支撑'
    } else {
      assessment = '估值很高，需要极强的盈利能力支撑'
    }

    return {
      pb: pb.toFixed(2),
      fairValue: fairValue?.toFixed(2),
      upside: upside?.toFixed(2),
      theoreticalPB: theoreticalPB?.toFixed(2),
      assessment
    }
  }, [stockPrice, bvps, roe, industryPB])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <nav className="text-sm text-gray-500 mb-2">
          <Link to="/" className="hover:text-primary-600">首页</Link>
          <span className="mx-2">/</span>
          <Link to="/relative" className="hover:text-primary-600">相对估值</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">市净率 (PB)</span>
        </nav>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">市净率 (P/B Ratio) 计算器</h1>
        <p className="text-gray-600">
          市净率反映股价相对于每股账面价值的溢价程度。PB小于1意味着股价低于公司的清算价值，
          常用于银行、保险等重资产行业的估值。
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
              label="每股净资产 (BVPS)"
              value={bvps}
              onChange={setBvps}
              placeholder="请输入每股净资产"
              unit="元"
              helpText={selectedStock ? "数据来源: 资产负债表 (股东权益/总股本)" : "总股东权益除以总股数"}
            />

            <InputField
              label="净资产收益率 ROE（可选）"
              value={roe}
              onChange={setRoe}
              placeholder="请输入ROE"
              unit="%"
              helpText={selectedStock ? "数据来源: 净利润/平均股东权益" : "用于评估PB的合理性"}
            />

            <InputField
              label="行业平均PB（可选）"
              value={industryPB}
              onChange={setIndustryPB}
              placeholder="请输入行业PB"
              helpText={selectedStock ? `数据来源: ${selectedStock.industry}行业平均值` : "同行业公司的平均市净率"}
            />
          </div>

          {/* Formula */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">计算公式</h3>
            <FormulaDisplay
              formula="PB = 股价 / 每股净资产"
              variables={[
                { symbol: 'PB', description: '市净率' },
                { symbol: '股价', description: '当前市场价格' },
                { symbol: 'BVPS', description: '每股净资产 (Book Value Per Share)' }
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
                  title="市净率 (PB)"
                  value={results.pb}
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

              {results.theoreticalPB && (
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">基于ROE的理论PB</span>
                    <span className="text-xl font-bold text-purple-600">{results.theoreticalPB}倍</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    高ROE公司理应享有更高的PB估值
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
              <p>请输入股价和每股净资产开始计算</p>
            </div>
          )}

          {/* PB-ROE Matrix */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4">PB-ROE 对照表</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left">ROE</th>
                    <th className="px-3 py-2 text-left">合理PB区间</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="px-3 py-2">&lt; 8%</td>
                    <td className="px-3 py-2">0.5 - 1.0</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2">8% - 12%</td>
                    <td className="px-3 py-2">1.0 - 1.5</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2">12% - 15%</td>
                    <td className="px-3 py-2">1.5 - 2.5</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2">15% - 20%</td>
                    <td className="px-3 py-2">2.0 - 4.0</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2">&gt; 20%</td>
                    <td className="px-3 py-2">3.0+</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              注：高ROE公司应享有PB溢价，低ROE公司的低PB可能是价值陷阱
            </p>
          </div>
        </div>
      </div>

      {/* Educational Content */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">PB指标详解</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">适用行业</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>✓ 银行、保险等金融机构</li>
              <li>✓ 房地产开发企业</li>
              <li>✓ 重资产制造业</li>
              <li>✓ 资源类企业</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">局限性</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• 不适用于轻资产科技公司</li>
              <li>• 账面价值可能不反映真实价值</li>
              <li>• 不同会计准则影响可比性</li>
              <li>• 需结合ROE综合判断</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PBCalculator
