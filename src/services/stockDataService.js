/**
 * 股票财务数据服务 - 完全实时获取版本
 * 
 * 数据来源：
 * - 新浪财经API: 实时行情数据
 * - 东方财富API: 股票搜索、财务数据
 * - 腾讯财经API: 备用行情数据
 * 
 * 通过Vite代理解决跨域问题
 */

// 行业分类映射
const industryMap = {
  '酿酒行业': '白酒',
  '白酒': '白酒',
  '银行': '银行',
  '保险': '保险',
  '证券': '证券',
  '电力设备': '新能源',
  '新能源': '新能源',
  '汽车整车': '汽车',
  '汽车': '汽车',
  '光伏设备': '光伏',
  '光伏': '光伏',
  '医药制造': '医药',
  '医药': '医药',
  '房地产开发': '房地产',
  '房地产': '房地产',
  '软件开发': '科技',
  '互联网服务': '科技',
  '科技': '科技',
  '食品饮料': '消费',
  '家用电器': '消费',
  '消费': '消费',
}

// 行业平均估值数据
const industryAverages = {
  '白酒': { pe: 32.5, pb: 6.8, ps: 12.0 },
  '银行': { pe: 5.8, pb: 0.62, ps: 1.5 },
  '保险': { pe: 10.2, pb: 1.1, ps: 0.85 },
  '证券': { pe: 18.0, pb: 1.5, ps: 3.0 },
  '新能源': { pe: 28.5, pb: 4.8, ps: 2.8 },
  '汽车': { pe: 18.5, pb: 2.5, ps: 0.8 },
  '光伏': { pe: 15.2, pb: 2.2, ps: 1.8 },
  '医药': { pe: 25.0, pb: 3.5, ps: 4.0 },
  '房地产': { pe: 8.0, pb: 0.8, ps: 0.5 },
  '科技': { pe: 35.0, pb: 5.0, ps: 6.0 },
  '消费': { pe: 22.0, pb: 4.0, ps: 2.5 },
  '其他': { pe: 15.0, pb: 2.0, ps: 1.5 },
}

/**
 * 获取股票代码前缀
 */
function getStockPrefix(code) {
  const pureCode = code.replace(/\.(SH|SZ)$/i, '')
  if (pureCode.startsWith('6')) {
    return { sinaPrefix: 'sh', tencentPrefix: 'sh', market: 'SH' }
  } else {
    return { sinaPrefix: 'sz', tencentPrefix: 'sz', market: 'SZ' }
  }
}

/**
 * 从东方财富搜索股票 - 实时
 */
export async function searchStockOnline(keyword) {
  if (!keyword || keyword.trim().length === 0) {
    return []
  }
  
  try {
    const url = `/api/eastmoney/search/api/suggest/get?input=${encodeURIComponent(keyword)}&type=14&token=D43BF722C8E33BDC906FB84D85E326E8&count=20`
    
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`搜索请求失败: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.QuotationCodeTable?.Data) {
      const results = data.QuotationCodeTable.Data
        .filter(item => {
          // 只保留A股主板、创业板、科创板
          const code = item.Code
          return code && (
            /^6\d{5}$/.test(code) ||  // 上海主板
            /^0\d{5}$/.test(code) ||  // 深圳主板
            /^3\d{5}$/.test(code)     // 创业板
          )
        })
        .map(item => ({
          code: item.Code,
          name: item.Name,
          fullCode: item.Code + '.' + (item.Code.startsWith('6') ? 'SH' : 'SZ'),
          market: item.Code.startsWith('6') ? '上海' : '深圳',
          industry: item.SecurityTypeName || '股票'
        }))
      
      console.log('搜索结果:', results)
      return results
    }
    
    return []
  } catch (error) {
    console.error('搜索股票失败:', error)
    return []
  }
}

// 兼容旧接口
export function searchStock(keyword) {
  return []
}

export function getAllStocks() {
  return []
}

export function getStockData(code) {
  return null
}

/**
 * 从新浪获取实时行情
 * 注意：新浪API返回GBK编码，需要用TextDecoder解码
 */
export async function fetchSinaRealtime(code) {
  const pureCode = code.replace(/\.(SH|SZ)$/i, '')
  const { sinaPrefix } = getStockPrefix(pureCode)
  
  try {
    const url = `/api/sina/list=${sinaPrefix}${pureCode}`
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`新浪API请求失败: ${response.status}`)
    }
    
    // 新浪返回的是GBK编码，需要正确解码
    const buffer = await response.arrayBuffer()
    const decoder = new TextDecoder('gbk')
    const text = decoder.decode(buffer)
    console.log('新浪原始返回:', text)
    
    // 解析: var hq_str_sh600519="贵州茅台,开盘价,昨收,现价,..."
    const match = text.match(/="(.+)"/)
    if (!match || !match[1]) {
      console.log('股票数据为空或不存在')
      return null
    }
    
    const parts = match[1].split(',')
    if (parts.length < 32) {
      console.log('数据格式不完整')
      return null
    }
    
    const result = {
      name: parts[0],
      open: parseFloat(parts[1]) || 0,
      prevClose: parseFloat(parts[2]) || 0,
      price: parseFloat(parts[3]) || 0,
      high: parseFloat(parts[4]) || 0,
      low: parseFloat(parts[5]) || 0,
      volume: parseFloat(parts[8]) || 0,
      amount: parseFloat(parts[9]) || 0,
      date: parts[30],
      time: parts[31]
    }
    
    console.log('新浪实时数据:', result)
    return result
  } catch (error) {
    console.error('获取新浪实时行情失败:', error)
    return null
  }
}

/**
 * 从腾讯获取实时行情 (备用)
 */
export async function fetchTencentRealtime(code) {
  const pureCode = code.replace(/\.(SH|SZ)$/i, '')
  const { tencentPrefix } = getStockPrefix(pureCode)
  
  try {
    const url = `/api/tencent/q=${tencentPrefix}${pureCode}`
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`腾讯API请求失败: ${response.status}`)
    }
    
    const text = await response.text()
    console.log('腾讯原始返回:', text)
    
    // 解析: v_sh600519="1~贵州茅台~600519~1680.00~..."
    const match = text.match(/="(.+)"/)
    if (!match || !match[1]) return null
    
    const parts = match[1].split('~')
    if (parts.length < 45) return null
    
    const result = {
      name: parts[1],
      code: parts[2],
      price: parseFloat(parts[3]) || 0,
      prevClose: parseFloat(parts[4]) || 0,
      open: parseFloat(parts[5]) || 0,
      volume: parseFloat(parts[6]) || 0,
      high: parseFloat(parts[33]) || 0,
      low: parseFloat(parts[34]) || 0,
      date: parts[30],
      time: parts[30]
    }
    
    console.log('腾讯实时数据:', result)
    return result
  } catch (error) {
    console.error('获取腾讯实时行情失败:', error)
    return null
  }
}

/**
 * 从东方财富获取财务数据
 */
export async function fetchEastMoneyFinance(code) {
  const pureCode = code.replace(/\.(SH|SZ)$/i, '')
  const { market } = getStockPrefix(pureCode)
  const secucode = `${pureCode}.${market}`
  
  try {
    const url = `/api/eastmoney/data/securities/api/data/get?type=RPT_F10_FINANCE_MAINFINADATA&sty=ALL&filter=(SECUCODE="${secucode}")&p=1&ps=1&sr=-1&st=REPORT_DATE`
    
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`东方财富API请求失败: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('东方财富财务数据:', data)
    
    if (data.result?.data?.[0]) {
      return data.result.data[0]
    }
    
    return null
  } catch (error) {
    console.error('获取东方财富财务数据失败:', error)
    return null
  }
}

/**
 * 获取股票完整数据（整合多个API）
 */
export async function fetchRealStockData(code) {
  const pureCode = code.replace(/\.(SH|SZ)$/i, '')
  const { market } = getStockPrefix(pureCode)
  
  try {
    // 并行获取实时行情和财务数据
    const [sinaData, financeData] = await Promise.all([
      fetchSinaRealtime(pureCode),
      fetchEastMoneyFinance(pureCode)
    ])
    
    // 如果新浪失败，尝试腾讯
    let realtimeData = sinaData
    if (!realtimeData || !realtimeData.price) {
      console.log('新浪数据获取失败，尝试腾讯API')
      realtimeData = await fetchTencentRealtime(pureCode)
    }
    
    if (!realtimeData && !financeData) {
      console.error('所有数据源都获取失败')
      return null
    }
    
    // 从财务数据提取（注意东方财富API的字段名）
    const eps = financeData?.EPSJB || financeData?.BASIC_EPS || 0
    const bvps = financeData?.BPS || 0
    const roe = financeData?.ROEJQ || financeData?.ROE_WEIGHT || 0
    const revenue = financeData?.TOTALOPERATEREVE ? financeData.TOTALOPERATEREVE / 100000000 : 
                   (financeData?.TOTAL_OPERATE_INCOME ? financeData.TOTAL_OPERATE_INCOME / 100000000 : 0)
    const netProfit = financeData?.PARENTNETPROFIT ? financeData.PARENTNETPROFIT / 100000000 : 
                     (financeData?.PARENT_NETPROFIT ? financeData.PARENT_NETPROFIT / 100000000 : 0)
    const totalShares = financeData?.TOTAL_SHARE ? financeData.TOTAL_SHARE / 100000000 : 
                       (financeData?.TOTAL_SHARES ? financeData.TOTAL_SHARES / 100000000 : 0)
    const fcfPerShare = financeData?.MGJYXJJE || 0
    
    // 获取股价
    const price = realtimeData?.price || 0
    const name = realtimeData?.name || financeData?.SECURITY_NAME_ABBR || '未知'
    
    // 计算每股指标
    const sharesOutstanding = totalShares || (netProfit && eps ? netProfit / eps : 0)
    const sps = sharesOutstanding > 0 ? revenue / sharesOutstanding : 0
    const fcf = sharesOutstanding > 0 ? fcfPerShare * sharesOutstanding : netProfit * 0.7
    
    // 获取行业
    const rawIndustry = financeData?.INDUSTRY || '其他'
    const industry = industryMap[rawIndustry] || '其他'
    const industryAvg = industryAverages[industry] || industryAverages['其他']
    
    // 整合数据
    const result = {
      // 基本信息
      name,
      code: pureCode + '.' + market,
      market: 'A股',
      industry,
      
      // 实时行情
      price,
      prevClose: realtimeData?.prevClose || 0,
      open: realtimeData?.open || 0,
      high: realtimeData?.high || 0,
      low: realtimeData?.low || 0,
      volume: realtimeData?.volume || 0,
      amount: realtimeData?.amount || 0,
      updateTime: realtimeData ? `${realtimeData.date} ${realtimeData.time}` : new Date().toLocaleString(),
      
      // 财务数据
      eps,
      bvps,
      roe,
      revenue,
      netProfit,
      sharesOutstanding,
      sps,
      fcf,
      
      // 估算数据
      dividend: eps > 0 ? eps * 0.3 : 0, // 假设30%派息率
      dividendYield: price > 0 && eps > 0 ? (eps * 0.3 / price * 100) : 0,
      netDebt: 0,
      
      // 增长率估算
      revenueGrowth3Y: roe > 0 ? roe * 0.5 : 10,
      profitGrowth3Y: roe > 0 ? roe * 0.6 : 10,
      dividendGrowth3Y: roe > 0 ? roe * 0.4 : 5,
      dividendPayoutRatio: 30,
      
      // 行业平均值
      industryPE: industryAvg.pe,
      industryPB: industryAvg.pb,
      industryPS: industryAvg.ps,
      
      // 计算估值指标
      pe: price && eps ? parseFloat((price / eps).toFixed(2)) : 0,
      pb: price && bvps ? parseFloat((price / bvps).toFixed(2)) : 0,
      ps: price && sps ? parseFloat((price / sps).toFixed(2)) : 0,
      
      // 市值
      marketCap: price && sharesOutstanding ? parseFloat((price * sharesOutstanding).toFixed(2)) : 0,
      
      // 数据来源标记
      dataSource: '实时API',
      isRealtime: true
    }
    
    console.log('整合后的股票数据:', result)
    return result
  } catch (error) {
    console.error('获取股票数据失败:', error)
    return null
  }
}

/**
 * 计算WACC
 */
export function calculateWACC({ 
  marketCap,
  totalDebt,
  riskFreeRate = 2.8,
  marketReturn = 9.0,
  beta = 1.0,
  debtRate = 4.5,
  taxRate = 25
}) {
  const E = marketCap
  const D = totalDebt || 0
  const total = E + D
  
  if (total === 0) return null
  
  const Re = riskFreeRate + beta * (marketReturn - riskFreeRate)
  const Rd = debtRate * (1 - taxRate / 100)
  const wacc = (E / total) * Re + (D / total) * Rd
  
  return {
    equityCost: Re.toFixed(2),
    debtCost: Rd.toFixed(2),
    wacc: wacc.toFixed(2)
  }
}

/**
 * 估算可持续增长率
 */
export function calculateSustainableGrowth(roe, payoutRatio) {
  return roe * (1 - payoutRatio / 100)
}

/**
 * 数据来源说明
 */
export const dataSourceInfo = {
  directFromReport: [
    { key: 'eps', name: '每股收益', source: '东方财富API', location: '利润表 - EPSJB (每股收益基本)' },
    { key: 'bvps', name: '每股净资产', source: '东方财富API', location: '资产负债表 - BPS' },
    { key: 'revenue', name: '营业收入', source: '东方财富API', location: 'TOTALOPERATEREVE (营业总收入)' },
    { key: 'netProfit', name: '净利润', source: '东方财富API', location: 'PARENTNETPROFIT (归母净利润)' },
    { key: 'roe', name: 'ROE', source: '东方财富API', location: 'ROEJQ (加权净资产收益率)' },
    { key: 'price', name: '实时股价', source: '新浪/腾讯API', location: '实时行情接口' },
  ],
  
  calculated: [
    { key: 'pe', name: '市盈率', formula: '股价 / 每股收益', source: '实时计算' },
    { key: 'pb', name: '市净率', formula: '股价 / 每股净资产', source: '实时计算' },
    { key: 'ps', name: '市销率', formula: '股价 / 每股收入', source: '实时计算' },
    { key: 'marketCap', name: '市值', formula: '股价 × 总股本', source: '实时计算' },
  ],
  
  needEstimation: [
    { key: 'growthRate', name: '增长率', method: '基于ROE估算，用户可自行调整' },
    { key: 'wacc', name: '折现率', method: 'CAPM模型，默认使用行业平均值' },
    { key: 'terminalGrowth', name: '永续增长率', method: '通常取GDP增速，默认3%' },
    { key: 'industryMultiple', name: '行业估值倍数', method: '预设行业平均数据' },
  ]
}
