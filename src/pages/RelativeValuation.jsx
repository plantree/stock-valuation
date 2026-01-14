import { Link } from 'react-router-dom'
import CalculatorCard from '../components/CalculatorCard'

function RelativeValuation() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <nav className="text-sm text-gray-500 mb-2">
          <Link to="/" className="hover:text-primary-600">首页</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">相对估值</span>
        </nav>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">相对估值法</h1>
        <p className="text-lg text-gray-600 max-w-3xl">
          相对估值法通过将目标公司与可比公司或行业平均水平进行比较，使用市场倍数来评估股票的合理价格。
          这种方法简单直观，是投资分析中最常用的估值方法之一。
        </p>
      </div>

      {/* Methods Grid */}
      <div className="grid sm:grid-cols-2 gap-6">
        <CalculatorCard
          title="市盈率 (P/E Ratio)"
          description="股价与每股收益的比率。PE越低，说明投资者为每单位利润支付的价格越低，可能被低估。适用于盈利稳定的成熟公司。"
          to="/relative/pe"
          color="primary"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />

        <CalculatorCard
          title="市净率 (P/B Ratio)"
          description="股价与每股净资产的比率。PB小于1表示股价低于账面价值。特别适用于重资产行业，如银行、保险等金融机构。"
          to="/relative/pb"
          color="green"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
        />

        <CalculatorCard
          title="市销率 (P/S Ratio)"
          description="股价与每股销售收入的比率。适用于尚未盈利但收入增长迅速的成长型公司，如科技初创企业。"
          to="/relative/ps"
          color="orange"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          }
        />

        <CalculatorCard
          title="PEG 比率"
          description="市盈率与盈利增长率的比率。PEG结合了估值和成长性，小于1通常被认为是被低估的成长股。"
          to="/relative/peg"
          color="blue"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
        />
      </div>

      {/* Comparison Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">估值方法对比</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">指标</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">公式</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">适用场景</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">局限性</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">P/E</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">股价 / EPS</td>
                <td className="px-6 py-4 text-gray-600">盈利稳定的成熟公司</td>
                <td className="px-6 py-4 text-gray-600">不适用于亏损公司</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">P/B</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">股价 / BVPS</td>
                <td className="px-6 py-4 text-gray-600">重资产行业、金融机构</td>
                <td className="px-6 py-4 text-gray-600">不适用于轻资产公司</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">P/S</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">股价 / SPS</td>
                <td className="px-6 py-4 text-gray-600">高增长、尚未盈利的公司</td>
                <td className="px-6 py-4 text-gray-600">忽略盈利能力差异</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">PEG</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">PE / 增长率</td>
                <td className="px-6 py-4 text-gray-600">成长型公司</td>
                <td className="px-6 py-4 text-gray-600">依赖增长预测准确性</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">使用建议</h3>
        <ul className="space-y-2 text-blue-800">
          <li className="flex items-start">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 mt-2"></span>
            <span>应将目标公司与同行业、相似规模的公司进行比较</span>
          </li>
          <li className="flex items-start">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 mt-2"></span>
            <span>结合多个指标综合判断，避免单一指标带来的偏差</span>
          </li>
          <li className="flex items-start">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 mt-2"></span>
            <span>关注历史估值区间，判断当前估值所处的相对位置</span>
          </li>
          <li className="flex items-start">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 mt-2"></span>
            <span>考虑行业特点和公司发展阶段选择合适的估值方法</span>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default RelativeValuation
