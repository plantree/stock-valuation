import { useState, useRef, useEffect, useCallback } from 'react'
import { searchStock, getAllStocks, getStockData, fetchRealStockData, searchStockOnline } from '../services/stockDataService'

/**
 * 股票搜索选择器组件
 * 支持按代码或名称搜索股票，并获取财务数据
 * 支持键盘上下箭头导航和回车选择
 */
export default function StockSelector({ onSelect, className = '' }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedStock, setSelectedStock] = useState(null)
  const [loading, setLoading] = useState(false)
  const [useOnline, setUseOnline] = useState(true) // 是否使用在线查询
  const [activeIndex, setActiveIndex] = useState(-1) // 键盘导航当前索引
  const inputRef = useRef(null)
  const dropdownRef = useRef(null)
  const itemRefs = useRef([]) // 选项元素引用，用于滚动

  // 防抖搜索
  const debounceRef = useRef(null)

  // 搜索股票（支持在线/离线）
  const performSearch = useCallback(async (keyword) => {
    if (!keyword.trim()) {
      const allStocks = getAllStocks()
      setResults(allStocks)
      setShowDropdown(false)
      return
    }

    setLoading(true)
    try {
      let searchResults
      if (useOnline) {
        // 先尝试在线搜索
        searchResults = await searchStockOnline(keyword)
      }
      
      // 如果在线搜索失败或返回空，使用本地搜索
      if (!searchResults || searchResults.length === 0) {
        searchResults = searchStock(keyword)
      }
      
      setResults(searchResults)
      setShowDropdown(searchResults.length > 0)
    } catch (error) {
      console.error('搜索失败:', error)
      // 回退到本地搜索
      const localResults = searchStock(keyword)
      setResults(localResults)
      setShowDropdown(localResults.length > 0)
    } finally {
      setLoading(false)
    }
  }, [useOnline])

  // 输入变化时的搜索（带防抖）
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    
    debounceRef.current = setTimeout(() => {
      performSearch(query)
      setActiveIndex(-1) // 搜索时重置选中索引
    }, 300) // 300ms 防抖

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [query, performSearch])

  // 键盘导航处理
  const handleKeyDown = useCallback((e) => {
    if (!showDropdown || results.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActiveIndex(prev => {
          const next = prev < results.length - 1 ? prev + 1 : prev
          // 滚动到可视区
          setTimeout(() => {
            itemRefs.current[next]?.scrollIntoView({ block: 'nearest' })
          }, 0)
          return next
        })
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveIndex(prev => {
          const next = prev > 0 ? prev - 1 : 0
          setTimeout(() => {
            itemRefs.current[next]?.scrollIntoView({ block: 'nearest' })
          }, 0)
          return next
        })
        break
      case 'Enter':
        e.preventDefault()
        if (activeIndex >= 0 && activeIndex < results.length) {
          handleSelect(results[activeIndex])
        }
        break
      case 'Escape':
        e.preventDefault()
        setShowDropdown(false)
        setActiveIndex(-1)
        break
    }
  }, [showDropdown, results, activeIndex])

  // 点击外部关闭下拉框
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          inputRef.current && !inputRef.current.contains(event.target)) {
        setShowDropdown(false)
        setActiveIndex(-1)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 选择股票
  const handleSelect = async (stock) => {
    setLoading(true)
    setQuery(`${stock.code} ${stock.name}`)
    setShowDropdown(false)
    
    try {
      let stockData
      if (useOnline) {
        // 尝试获取实时数据
        stockData = await fetchRealStockData(stock.code)
      } else {
        stockData = getStockData(stock.code)
      }
      
      setSelectedStock(stockData)
      if (onSelect && stockData) {
        onSelect(stockData)
      }
    } catch (error) {
      console.error('获取股票数据失败:', error)
      // 回退到本地数据
      const localData = getStockData(stock.code)
      setSelectedStock(localData)
      if (onSelect && localData) {
        onSelect(localData)
      }
    } finally {
      setLoading(false)
    }
  }

  // 刷新数据
  const handleRefresh = async () => {
    if (!selectedStock) return
    
    setLoading(true)
    try {
      const freshData = await fetchRealStockData(selectedStock.code?.replace(/\.(SH|SZ)$/i, '') || '')
      setSelectedStock(freshData)
      if (onSelect && freshData) {
        onSelect(freshData)
      }
    } catch (error) {
      console.error('刷新数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 清除选择
  const handleClear = () => {
    setQuery('')
    setSelectedStock(null)
    setShowDropdown(false)
    if (onSelect) {
      onSelect(null)
    }
  }

  return (
    <div className={`relative ${className}`}>
      <div className="flex justify-between items-center mb-1">
        <label className="block text-sm font-medium text-gray-700">
          股票代码/名称
        </label>
        <label className="flex items-center text-xs text-gray-500 cursor-pointer">
          <input
            type="checkbox"
            checked={useOnline}
            onChange={(e) => setUseOnline(e.target.checked)}
            className="mr-1 w-3 h-3"
          />
          实时查询
        </label>
      </div>
      
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={handleKeyDown}
          placeholder="输入股票代码或名称搜索..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 pr-10"
        />
        {loading ? (
          <span className="absolute right-3 top-1/2 -translate-y-1/2">
            <svg className="animate-spin h-4 w-4 text-primary-500" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </span>
        ) : query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>

      {/* 下拉搜索结果 */}
      {showDropdown && results.length > 0 && (
        <div 
          ref={dropdownRef}
          className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto"
        >
          {results.map((stock, index) => (
            <button
              key={stock.code}
              ref={el => itemRefs.current[index] = el}
              onClick={() => handleSelect(stock)}
              onMouseEnter={() => setActiveIndex(index)}
              className={`w-full px-4 py-2 text-left flex justify-between items-center transition-colors ${
                index === activeIndex 
                  ? 'bg-primary-100 text-primary-900' 
                  : 'hover:bg-primary-50'
              }`}
            >
              <span>
                <span className="font-medium text-gray-900">{stock.code}</span>
                <span className="ml-2 text-gray-600">{stock.name}</span>
              </span>
              <span className="text-xs text-gray-400">{stock.industry || stock.market}</span>
            </button>
          ))}
        </div>
      )}

      {/* 已选股票信息 */}
      {selectedStock && (
        <div className="mt-3 p-3 bg-primary-50 rounded-lg">
          <div className="flex justify-between items-start">
            <div>
              <div className="font-medium text-primary-900">
                {selectedStock.name} ({selectedStock.code})
              </div>
              <div className="text-sm text-primary-700 mt-1">
                行业: {selectedStock.industry || '未知'} 
                {selectedStock.marketCap && ` | 市值: ${selectedStock.marketCap}亿`}
              </div>
              {selectedStock.updateTime && (
                <div className="text-xs text-primary-600 mt-1">
                  更新: {selectedStock.updateTime}
                  {selectedStock.dataSource && ` (${selectedStock.dataSource})`}
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-primary-900">
                ¥{selectedStock.price?.toFixed(2) || '--'}
              </div>
              <div className="text-xs text-primary-600">当前价格</div>
              {useOnline && (
                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className="mt-1 text-xs text-primary-600 hover:text-primary-800 underline"
                >
                  刷新数据
                </button>
              )}
            </div>
          </div>
          
          {/* 显示更多实时数据 */}
          {selectedStock.isRealtime && (
            <div className="mt-2 pt-2 border-t border-primary-200 grid grid-cols-4 gap-2 text-xs">
              <div>
                <span className="text-primary-600">开盘:</span>
                <span className="ml-1 text-primary-900">{selectedStock.open?.toFixed(2) || '--'}</span>
              </div>
              <div>
                <span className="text-primary-600">最高:</span>
                <span className="ml-1 text-primary-900">{selectedStock.high?.toFixed(2) || '--'}</span>
              </div>
              <div>
                <span className="text-primary-600">最低:</span>
                <span className="ml-1 text-primary-900">{selectedStock.low?.toFixed(2) || '--'}</span>
              </div>
              <div>
                <span className="text-primary-600">昨收:</span>
                <span className="ml-1 text-primary-900">{selectedStock.prevClose?.toFixed(2) || '--'}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 提示信息 */}
      <p className="mt-2 text-xs text-gray-500">
        {useOnline 
          ? '✓ 实时查询已开启，数据来自新浪/东方财富API' 
          : '○ 使用本地缓存数据，勾选"实时查询"获取最新数据'}
      </p>
    </div>
  )
}
