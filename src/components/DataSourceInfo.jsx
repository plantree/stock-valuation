import { useState } from 'react'
import { dataSourceInfo } from '../services/stockDataService'

/**
 * 数据来源说明组件
 * 解释各个财务指标可以从哪里获取
 */
export default function DataSourceInfo() {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="bg-blue-50 rounded-lg p-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex justify-between items-center text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-blue-600">ℹ️</span>
          <span className="font-medium text-blue-900">数据来源说明</span>
        </div>
        <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          {/* 实时数据API来源 */}
          <div>
            <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              实时数据API来源
            </h4>
            <div className="bg-white rounded-lg p-3 text-sm space-y-2">
              <div className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <div>
                  <strong>新浪财经API</strong> - 实时行情数据（股价、成交量等）
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <div>
                  <strong>东方财富API</strong> - 股票搜索、财务数据
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                数据通过公开API实时获取，可能存在15分钟延迟
              </div>
            </div>
          </div>

          {/* 可直接从财报获取 */}
          <div>
            <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              可直接从财报获取的数据
            </h4>
            <div className="bg-white rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-gray-600">指标</th>
                    <th className="px-3 py-2 text-left text-gray-600">来源</th>
                    <th className="px-3 py-2 text-left text-gray-600">位置/计算方式</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {dataSourceInfo.directFromReport.map((item) => (
                    <tr key={item.key}>
                      <td className="px-3 py-2 font-medium text-gray-900">{item.name}</td>
                      <td className="px-3 py-2 text-gray-600">{item.source}</td>
                      <td className="px-3 py-2 text-gray-500 text-xs">{item.location}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 需要计算的指标 */}
          <div>
            <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
              需要计算的数据
            </h4>
            <div className="bg-white rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-gray-600">指标</th>
                    <th className="px-3 py-2 text-left text-gray-600">计算公式</th>
                    <th className="px-3 py-2 text-left text-gray-600">数据来源</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {dataSourceInfo.calculated.map((item) => (
                    <tr key={item.key}>
                      <td className="px-3 py-2 font-medium text-gray-900">{item.name}</td>
                      <td className="px-3 py-2 text-gray-600 font-mono text-xs">{item.formula}</td>
                      <td className="px-3 py-2 text-gray-500 text-xs">{item.source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 需要估算的指标 */}
          <div>
            <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              需要估算或获取市场数据
            </h4>
            <div className="bg-white rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-gray-600">指标</th>
                    <th className="px-3 py-2 text-left text-gray-600">估算方法</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {dataSourceInfo.needEstimation.map((item) => (
                    <tr key={item.key}>
                      <td className="px-3 py-2 font-medium text-gray-900">{item.name}</td>
                      <td className="px-3 py-2 text-gray-600 text-xs">{item.method}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 数据获取渠道 */}
          <div className="text-xs text-blue-700 bg-blue-100 rounded-lg p-3">
            <strong>手动查询数据渠道：</strong>
            <ul className="mt-1 ml-4 list-disc space-y-1">
              <li>上交所/深交所官网 - 上市公司年报、季报</li>
              <li>巨潮资讯网 (cninfo.com.cn) - 财务报表原文</li>
              <li>东方财富网 - 财务数据摘要</li>
              <li>同花顺/雪球 - 行业对比数据</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
