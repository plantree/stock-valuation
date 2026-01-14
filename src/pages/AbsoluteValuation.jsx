import { Link } from 'react-router-dom'
import CalculatorCard from '../components/CalculatorCard'

function AbsoluteValuation() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <nav className="text-sm text-gray-500 mb-2">
          <Link to="/" className="hover:text-primary-600">首页</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">绝对估值</span>
        </nav>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">绝对估值法</h1>
        <p className="text-lg text-gray-600 max-w-3xl">
          绝对估值法通过预测公司未来的现金流或股利，并将其折现到现在，来计算公司或股票的内在价值。
          这种方法不依赖于市场比较，而是基于公司自身的基本面进行估值。
        </p>
      </div>

      {/* Methods Grid */}
      <div className="grid sm:grid-cols-2 gap-6">
        <CalculatorCard
          title="DCF 现金流折现模型"
          description="通过预测未来自由现金流并使用加权平均资本成本(WACC)折现到现值，计算公司的企业价值。这是最广泛使用的绝对估值方法。"
          to="/absolute/dcf"
          color="purple"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
        />

        <CalculatorCard
          title="DDM 股利折现模型"
          description="基于公司未来支付的股利来估算股票价值。适用于有稳定股利政策的成熟公司，如公用事业、银行等。"
          to="/absolute/ddm"
          color="red"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />
      </div>

      {/* DCF Explanation */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">DCF 模型详解</h2>
        <div className="space-y-4">
          <p className="text-gray-600">
            现金流折现模型(Discounted Cash Flow)是金融领域最基础、最重要的估值方法。
            其核心思想是：一家公司的价值等于其未来所有自由现金流的现值之和。
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">计算步骤</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-600">
              <li>预测未来5-10年的自由现金流(FCF)</li>
              <li>确定适当的折现率(通常使用WACC)</li>
              <li>计算预测期内现金流的现值</li>
              <li>计算终值(永续增长法或退出倍数法)</li>
              <li>将终值折现到现在</li>
              <li>加总得到企业价值(EV)</li>
              <li>减去净债务得到股权价值</li>
            </ol>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-purple-50 rounded-lg p-4">
              <h4 className="font-medium text-purple-900 mb-2">优点</h4>
              <ul className="text-sm text-purple-800 space-y-1">
                <li>• 基于内在价值，不受市场情绪影响</li>
                <li>• 考虑了货币时间价值</li>
                <li>• 可以进行敏感性分析</li>
                <li>• 适用于各种类型的公司</li>
              </ul>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <h4 className="font-medium text-orange-900 mb-2">局限性</h4>
              <ul className="text-sm text-orange-800 space-y-1">
                <li>• 高度依赖假设的准确性</li>
                <li>• 对折现率非常敏感</li>
                <li>• 预测期较长增加不确定性</li>
                <li>• 计算相对复杂</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* DDM Explanation */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">DDM 模型详解</h2>
        <div className="space-y-4">
          <p className="text-gray-600">
            股利折现模型(Dividend Discount Model)认为股票的价值等于未来所有股利的现值之和。
            最简单的形式是Gordon增长模型，假设股利以恒定速率永续增长。
          </p>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Gordon 增长模型</h3>
            <div className="text-center py-4">
              <code className="text-lg font-mono text-gray-800">P = D₁ / (r - g)</code>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p><code className="text-primary-600">P</code> = 股票内在价值</p>
              <p><code className="text-primary-600">D₁</code> = 下一年预期股利</p>
              <p><code className="text-primary-600">r</code> = 要求回报率(折现率)</p>
              <p><code className="text-primary-600">g</code> = 股利永续增长率</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-2">适用公司</h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• 有稳定股利支付历史</li>
                <li>• 成熟期的大型公司</li>
                <li>• 公用事业、银行、保险</li>
                <li>• 房地产投资信托(REITs)</li>
              </ul>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <h4 className="font-medium text-red-900 mb-2">不适用情况</h4>
              <ul className="text-sm text-red-800 space-y-1">
                <li>• 不支付股利的公司</li>
                <li>• 股利不稳定的公司</li>
                <li>• 高速增长期的公司</li>
                <li>• 周期性行业公司</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Key Concepts */}
      <div className="bg-indigo-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-indigo-900 mb-4">核心概念</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-indigo-800 mb-2">自由现金流 (FCF)</h4>
            <p className="text-sm text-indigo-700">
              公司在支付运营费用和资本支出后剩余的现金流，可供分配给股东和债权人。
              FCF = 经营现金流 - 资本支出
            </p>
          </div>
          <div>
            <h4 className="font-medium text-indigo-800 mb-2">WACC 加权平均资本成本</h4>
            <p className="text-sm text-indigo-700">
              公司各种资本来源(股权和债务)的加权平均成本，通常作为DCF模型的折现率。
            </p>
          </div>
          <div>
            <h4 className="font-medium text-indigo-800 mb-2">终值 (Terminal Value)</h4>
            <p className="text-sm text-indigo-700">
              预测期之后所有现金流的现值，通常占企业价值的很大比例。
            </p>
          </div>
          <div>
            <h4 className="font-medium text-indigo-800 mb-2">安全边际</h4>
            <p className="text-sm text-indigo-700">
              内在价值与市场价格之间的差距。较大的安全边际可以降低估值误差带来的风险。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AbsoluteValuation
