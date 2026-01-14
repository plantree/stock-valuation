import { Link } from 'react-router-dom'
import CalculatorCard from '../components/CalculatorCard'

function Home() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl text-white">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">股票估值计算器</h1>
        <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto px-4">
          专业的股票估值工具，提供多种相对估值和绝对估值计算方法，帮助您做出更明智的投资决策
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            to="/relative"
            className="px-6 py-3 bg-white text-primary-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            相对估值
          </Link>
          <Link
            to="/absolute"
            className="px-6 py-3 bg-primary-400 text-white font-semibold rounded-lg hover:bg-primary-300 transition-colors"
          >
            绝对估值
          </Link>
        </div>
      </section>

      {/* Introduction */}
      <section className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-xl shadow-sm">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">相对估值法</h2>
          <p className="text-gray-600 mb-4">
            通过比较类似公司的市场倍数来评估股票价值。常用指标包括市盈率(PE)、市净率(PB)、市销率(PS)和PEG比率等。
          </p>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center">
              <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              计算简单，易于理解
            </li>
            <li className="flex items-center">
              <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              便于同行业公司比较
            </li>
            <li className="flex items-center">
              <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              反映市场当前定价水平
            </li>
          </ul>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-sm">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">绝对估值法</h2>
          <p className="text-gray-600 mb-4">
            通过预测公司未来现金流并折现到现值来计算股票的内在价值。主要方法包括现金流折现(DCF)和股利折现模型(DDM)。
          </p>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center">
              <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              基于内在价值分析
            </li>
            <li className="flex items-center">
              <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              考虑未来增长潜力
            </li>
            <li className="flex items-center">
              <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              适合长期价值投资
            </li>
          </ul>
        </div>
      </section>

      {/* Quick Access */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">常用估值方法</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <CalculatorCard
            title="市盈率 (PE)"
            description="股价与每股收益的比率，衡量投资者愿意为每元利润支付的价格"
            to="/relative/pe"
            color="primary"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <CalculatorCard
            title="市净率 (PB)"
            description="股价与每股净资产的比率，反映股票相对于账面价值的溢价程度"
            to="/relative/pb"
            color="green"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            }
          />
          <CalculatorCard
            title="DCF 现金流折现"
            description="预测未来自由现金流并折现到当前价值，计算公司的内在价值"
            to="/absolute/dcf"
            color="purple"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            }
          />
        </div>
      </section>

      {/* Disclaimer */}
      <section className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <svg className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <h3 className="text-lg font-semibold text-yellow-800 mb-1">免责声明</h3>
            <p className="text-yellow-700 text-sm">
              本工具提供的估值计算仅供学习和参考使用，不构成任何投资建议。股票估值涉及诸多假设和不确定性，
              实际投资决策应综合考虑多种因素，并咨询专业财务顾问。投资有风险，入市需谨慎。
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
