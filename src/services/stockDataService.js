/**
 * 股票财务数据服务 - 完全实时获取版本
 * 
 * 数据来源：
 * - 新浪财经API: 实时行情数据 (A股、港股、美股)
 * - 东方财富API: 股票搜索、财务数据
 * - 腾讯财经API: 备用行情数据
 * 
 * 支持市场：
 * - A股: 上海(SH)、深圳(SZ)
 * - 港股: 香港(HK)
 * - 美股: 纳斯达克、纽约证券交易所(US)
 * 
 * 通过Vite代理解决跨域问题
 */

// 市场类型枚举
export const MarketType = {
  CN: 'CN',   // A股
  HK: 'HK',   // 港股
  US: 'US',   // 美股
}

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
 * 获取股票代码前缀和市场信息
 * 支持A股、港股、美股
 */
function getStockPrefix(code, marketType = null) {
  // 清理代码后缀
  const pureCode = code.replace(/\.(SH|SZ|HK|US|O|N)$/i, '').toUpperCase()
  
  // 如果明确指定了市场类型
  if (marketType === MarketType.HK) {
    return { sinaPrefix: 'hk', tencentPrefix: 'hk', market: 'HK', marketType: MarketType.HK }
  }
  if (marketType === MarketType.US) {
    return { sinaPrefix: 'gb_', tencentPrefix: 'us', market: 'US', marketType: MarketType.US }
  }
  
  // 自动检测市场
  // 港股: 5位数字
  if (/^\d{5}$/.test(pureCode)) {
    return { sinaPrefix: 'hk', tencentPrefix: 'hk', market: 'HK', marketType: MarketType.HK }
  }
  
  // 美股: 纯字母或字母+数字（如 AAPL, BABA, TSLA）
  if (/^[A-Z]{1,5}$/.test(pureCode) || code.includes('.US') || code.includes('.O') || code.includes('.N')) {
    return { sinaPrefix: 'gb_', tencentPrefix: 'us', market: 'US', marketType: MarketType.US }
  }
  
  // A股: 6位数字
  if (/^6\d{5}$/.test(pureCode)) {
    return { sinaPrefix: 'sh', tencentPrefix: 'sh', market: 'SH', marketType: MarketType.CN }
  }
  if (/^[03]\d{5}$/.test(pureCode)) {
    return { sinaPrefix: 'sz', tencentPrefix: 'sz', market: 'SZ', marketType: MarketType.CN }
  }
  
  // 默认为A股上海
  return { sinaPrefix: 'sh', tencentPrefix: 'sh', market: 'SH', marketType: MarketType.CN }
}

/**
 * 从东方财富搜索股票 - 实时
 * 支持A股、港股、美股
 * @param {string} keyword - 搜索关键词
 * @param {string} marketFilter - 市场筛选: 'all', 'CN', 'HK', 'US'
 */
export async function searchStockOnline(keyword, marketFilter = 'all') {
  if (!keyword || keyword.trim().length === 0) {
    return []
  }
  
  try {
    // 东方财富搜索API，type=14包含A股,type=12港股,type=11美股
    // 使用type=14,12,11搜索全部
    const url = `/api/eastmoney/search/api/suggest/get?input=${encodeURIComponent(keyword)}&type=14,12,11&token=D43BF722C8E33BDC906FB84D85E326E8&count=30`
    
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`搜索请求失败: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.QuotationCodeTable?.Data) {
      const results = data.QuotationCodeTable.Data
        .filter(item => {
          const code = item.Code
          const mktNum = item.MktNum // 市场编号
          if (!code) return false
          
          // 根据MktNum判断市场
          // 1=上海, 2=深圳, 116=香港, 105=纳斯达克, 106=纽约
          let itemMarket = 'CN'
          if (mktNum === '116' || mktNum === 116) {
            itemMarket = 'HK'
          } else if (mktNum === '105' || mktNum === '106' || mktNum === 105 || mktNum === 106) {
            itemMarket = 'US'
          }
          
          // 市场筛选
          if (marketFilter !== 'all' && itemMarket !== marketFilter) {
            return false
          }
          
          // A股: 只保留主板、创业板、科创板
          if (itemMarket === 'CN') {
            return /^6\d{5}$/.test(code) || /^0\d{5}$/.test(code) || /^3\d{5}$/.test(code)
          }
          
          // 港股: 5位数字
          if (itemMarket === 'HK') {
            return /^\d{5}$/.test(code)
          }
          
          // 美股: 字母代码
          if (itemMarket === 'US') {
            return /^[A-Z]{1,5}$/.test(code)
          }
          
          return false
        })
        .map(item => {
          const code = item.Code
          const mktNum = item.MktNum
          
          let market, fullCode, marketLabel, marketType
          
          if (mktNum === '116' || mktNum === 116) {
            // 港股
            market = 'HK'
            fullCode = code + '.HK'
            marketLabel = '港股'
            marketType = MarketType.HK
          } else if (mktNum === '105' || mktNum === 105) {
            // 纳斯达克
            market = 'US'
            fullCode = code + '.O'  // .O = NASDAQ
            marketLabel = '美股(纳斯达克)'
            marketType = MarketType.US
          } else if (mktNum === '106' || mktNum === 106) {
            // 纽约证券交易所
            market = 'US'
            fullCode = code + '.N'  // .N = NYSE
            marketLabel = '美股(纽交所)'
            marketType = MarketType.US
          } else {
            // A股
            market = code.startsWith('6') ? 'SH' : 'SZ'
            fullCode = code + '.' + market
            marketLabel = market === 'SH' ? '上海' : '深圳'
            marketType = MarketType.CN
          }
          
          return {
            code: code,
            name: item.Name,
            fullCode,
            market: marketLabel,
            marketType,
            industry: item.SecurityTypeName || '股票'
          }
        })
      
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
 * 支持A股、港股、美股
 * 注意：新浪API返回GBK编码，需要用TextDecoder解码
 */
export async function fetchSinaRealtime(code, marketType = null) {
  // 清理代码
  const pureCode = code.replace(/\.(SH|SZ|HK|US|O|N)$/i, '').toLowerCase()
  const { sinaPrefix, marketType: detectedMarket } = getStockPrefix(code, marketType)
  const actualMarket = marketType || detectedMarket
  
  try {
    let url
    if (actualMarket === MarketType.US) {
      // 美股使用不同的前缀格式
      url = `/api/sina/list=gb_${pureCode}`
    } else if (actualMarket === MarketType.HK) {
      // 港股
      url = `/api/sina/list=hk${pureCode}`
    } else {
      // A股
      url = `/api/sina/list=${sinaPrefix}${pureCode}`
    }
    
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`新浪API请求失败: ${response.status}`)
    }
    
    // Netlify Functions 已经将 GBK 转换为 UTF-8，直接使用 text()
    const text = await response.text()
    console.log('新浪原始返回:', text)
    
    // 解析不同市场的返回格式
    const match = text.match(/="(.+)"/)
    if (!match || !match[1]) {
      console.log('股票数据为空或不存在')
      return null
    }
    
    const parts = match[1].split(',')
    let result
    
    if (actualMarket === MarketType.US) {
      // 美股格式详细字段:
      // [0]=名称, [1]=现价, [2]=涨跌幅%, [3]=时间, [4]=涨跌额, [5]=开盘, [6]=最高, [7]=最低
      // [8]=52周最高, [9]=52周最低, [10]=成交量, [11]=成交额?, [12]=市值, [13]=EPS(TTM)
      // [14]=PE, [15-18]=其他, [19]=总股本
      if (parts.length < 20) {
        console.log('美股数据格式不完整')
        return null
      }
      const totalShares = parseFloat(parts[19]) || 0
      const eps = parseFloat(parts[13]) || 0
      const marketCap = parseFloat(parts[12]) || 0
      
      result = {
        name: parts[0],
        price: parseFloat(parts[1]) || 0,
        change: parseFloat(parts[2]) || 0,
        open: parseFloat(parts[5]) || 0,
        high: parseFloat(parts[6]) || 0,
        low: parseFloat(parts[7]) || 0,
        prevClose: (parseFloat(parts[1]) || 0) - (parseFloat(parts[4]) || 0),
        volume: parseFloat(parts[10]) || 0,
        amount: 0,
        date: parts[3]?.split(' ')[0] || '',
        time: parts[3]?.split(' ')[1] || '',
        currency: 'USD',
        // 新浪提供的额外数据
        eps: eps,  // TTM EPS
        pe: parseFloat(parts[14]) || 0,
        totalShares: totalShares,
        marketCap: marketCap / 100000000,  // 转为亿
      }
    } else if (actualMarket === MarketType.HK) {
      // 港股格式: "英文名,中文名,开盘,昨收,最高,最低,现价,涨跌额,涨跌幅,买入,卖出,成交量,成交额,..."
      if (parts.length < 12) {
        console.log('港股数据格式不完整')
        return null
      }
      result = {
        name: parts[1] || parts[0],
        open: parseFloat(parts[2]) || 0,
        prevClose: parseFloat(parts[3]) || 0,
        high: parseFloat(parts[4]) || 0,
        low: parseFloat(parts[5]) || 0,
        price: parseFloat(parts[6]) || 0,
        volume: parseFloat(parts[12]) || 0,
        amount: parseFloat(parts[11]) || 0,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().split(' ')[0],
        currency: 'HKD'
      }
    } else {
      // A股格式
      if (parts.length < 32) {
        console.log('A股数据格式不完整')
        return null
      }
      result = {
        name: parts[0],
        open: parseFloat(parts[1]) || 0,
        prevClose: parseFloat(parts[2]) || 0,
        price: parseFloat(parts[3]) || 0,
        high: parseFloat(parts[4]) || 0,
        low: parseFloat(parts[5]) || 0,
        volume: parseFloat(parts[8]) || 0,
        amount: parseFloat(parts[9]) || 0,
        date: parts[30],
        time: parts[31],
        currency: 'CNY'
      }
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
 * 支持A股、港股、美股
 */
export async function fetchTencentRealtime(code, marketType = null) {
  const pureCode = code.replace(/\.(SH|SZ|HK|US|O|N)$/i, '')
  const { tencentPrefix, marketType: detectedMarket } = getStockPrefix(code, marketType)
  const actualMarket = marketType || detectedMarket
  
  try {
    let url
    if (actualMarket === MarketType.US) {
      url = `/api/tencent/q=us${pureCode.toUpperCase()}`
    } else if (actualMarket === MarketType.HK) {
      url = `/api/tencent/q=hk${pureCode}`
    } else {
      url = `/api/tencent/q=${tencentPrefix}${pureCode}`
    }
    
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
      time: parts[30],
      currency: actualMarket === MarketType.US ? 'USD' : (actualMarket === MarketType.HK ? 'HKD' : 'CNY')
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
 * 支持A股、港股、美股
 */
export async function fetchEastMoneyFinance(code, marketType = null) {
  const pureCode = code.replace(/\.(SH|SZ|HK|US|O|N)$/i, '')
  const { market, marketType: detectedMarket } = getStockPrefix(code, marketType)
  const actualMarket = marketType || detectedMarket
  
  try {
    let url
    let secucode
    
    if (actualMarket === MarketType.US) {
      // 美股财务数据 - 获取多期数据用于计算TTM
      secucode = `${pureCode.toUpperCase()}.O`  // 默认纳斯达克
      url = `/api/eastmoney/data/securities/api/data/get?type=RPT_USF10_FN_GMAININDICATOR&sty=ALL&filter=(SECUCODE="${secucode}")&p=1&ps=8&sr=-1&st=REPORT_DATE`
    } else if (actualMarket === MarketType.HK) {
      // 港股财务数据 - 获取多期数据用于计算TTM EPS
      secucode = `${pureCode}.HK`
      url = `/api/eastmoney/data/securities/api/data/get?type=RPT_HKF10_FN_MAININDICATOR&sty=ALL&filter=(SECUCODE="${secucode}")&p=1&ps=6&sr=-1&st=REPORT_DATE`
    } else {
      // A股财务数据 - 获取多期数据用于计算TTM EPS
      secucode = `${pureCode}.${market}`
      url = `/api/eastmoney/data/securities/api/data/get?type=RPT_F10_FINANCE_MAINFINADATA&sty=ALL&filter=(SECUCODE="${secucode}")&p=1&ps=6&sr=-1&st=REPORT_DATE`
    }
    
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`东方财富API请求失败: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('东方财富财务数据:', data)
    
    if (data.result?.data?.[0]) {
      const allData = data.result.data
      
      // 美股额外获取资产负债表数据（股东权益和总负债）和现金流数据（FCF）
      let balanceSheet = { equity: 0, totalDebt: 0 }
      let cashFlow = { operatingCashFlow: 0, capitalExpenditure: 0, fcf: 0 }
      if (actualMarket === MarketType.US) {
        // 并行获取资产负债表和现金流数据
        [balanceSheet, cashFlow] = await Promise.all([
          fetchUSStockBalanceSheet(secucode),
          fetchUSStockCashFlow(secucode)
        ])
      }
      
      // 标准化不同市场的字段名，传入完整数据用于计算TTM
      return normalizeFinanceData(allData, actualMarket, balanceSheet, cashFlow)
    }
    
    return null
  } catch (error) {
    console.error('获取东方财富财务数据失败:', error)
    return null
  }
}

/**
 * 获取美股资产负债表数据（股东权益和总负债）
 */
async function fetchUSStockBalanceSheet(secucode) {
  try {
    // 获取股东权益合计 (004017999) 和总负债 (004011999)
    const [equityRes, debtRes] = await Promise.all([
      fetch(`/api/eastmoney/data/securities/api/data/get?type=RPT_USF10_FN_BALANCE&sty=ALL&filter=(SECUCODE="${secucode}")(STD_ITEM_CODE="004017999")&p=1&ps=1&sr=-1&st=REPORT_DATE`),
      fetch(`/api/eastmoney/data/securities/api/data/get?type=RPT_USF10_FN_BALANCE&sty=ALL&filter=(SECUCODE="${secucode}")(STD_ITEM_CODE="004011999")&p=1&ps=1&sr=-1&st=REPORT_DATE`)
    ])
    
    let equity = 0, totalDebt = 0
    
    if (equityRes.ok) {
      const data = await equityRes.json()
      equity = data.result?.data?.[0]?.AMOUNT || 0
    }
    
    if (debtRes.ok) {
      const data = await debtRes.json()
      totalDebt = data.result?.data?.[0]?.AMOUNT || 0
    }
    
    console.log(`美股资产负债表: ${secucode} 股东权益=${(equity/1e9).toFixed(1)}B 总负债=${(totalDebt/1e9).toFixed(1)}B`)
    return { equity, totalDebt }
  } catch (error) {
    console.error('获取资产负债表失败:', error)
    return { equity: 0, totalDebt: 0 }
  }
}

/**
 * 获取美股现金流量表数据（计算FCF）
 * FCF = 经营活动现金流(003999) - 资本支出(005002)
 */
async function fetchUSStockCashFlow(secucode) {
  try {
    // 获取最新年报的现金流数据
    // 003999 = 经营活动产生的现金流量净额
    // 005002 = 购买固定资产（资本支出，通常为负数）
    const [ocfRes, capexRes] = await Promise.all([
      fetch(`/api/eastmoney/data/securities/api/data/get?type=RPT_USSK_FN_CASHFLOW&sty=ALL&filter=(SECUCODE="${secucode}")(STD_ITEM_CODE="003999")(DATE_TYPE_CODE="001")&p=1&ps=1&sr=-1&st=REPORT_DATE`),
      fetch(`/api/eastmoney/data/securities/api/data/get?type=RPT_USSK_FN_CASHFLOW&sty=ALL&filter=(SECUCODE="${secucode}")(STD_ITEM_CODE="005002")(DATE_TYPE_CODE="001")&p=1&ps=1&sr=-1&st=REPORT_DATE`)
    ])
    
    let operatingCashFlow = 0, capitalExpenditure = 0
    
    if (ocfRes.ok) {
      const data = await ocfRes.json()
      operatingCashFlow = data.result?.data?.[0]?.AMOUNT || 0
    }
    
    if (capexRes.ok) {
      const data = await capexRes.json()
      capitalExpenditure = Math.abs(data.result?.data?.[0]?.AMOUNT || 0)  // 取绝对值
    }
    
    const fcf = operatingCashFlow - capitalExpenditure
    console.log(`美股现金流: ${secucode} OCF=${(operatingCashFlow/1e9).toFixed(1)}B CapEx=${(capitalExpenditure/1e9).toFixed(1)}B FCF=${(fcf/1e9).toFixed(1)}B`)
    return { operatingCashFlow, capitalExpenditure, fcf }
  } catch (error) {
    console.error('获取现金流量表失败:', error)
    return { operatingCashFlow: 0, capitalExpenditure: 0, fcf: 0 }
  }
}

/**
 * 计算美股TTM EPS
 * 支持不同财年结束月份的公司（如MSFT是6月，META是12月）
 * 方法：累加最近4个季度的单季EPS
 */
function calculateUSStockTTMEps(allData) {
  if (!allData || allData.length === 0) return 0
  
  // 方法1: 使用最近4个季度的单季报累加（最准确）
  const quarterlyReports = allData
    .filter(d => d.DATE_TYPE === '单季报')
    .sort((a, b) => new Date(b.REPORT_DATE) - new Date(a.REPORT_DATE))
    .slice(0, 4)
  
  if (quarterlyReports.length === 4) {
    const ttmEps = quarterlyReports.reduce((sum, q) => sum + (q.BASIC_EPS || 0), 0)
    console.log(`TTM EPS (4季度累加): ${quarterlyReports.map(q => q.REPORT_TYPE + '=' + q.BASIC_EPS).join(' + ')} = ${ttmEps.toFixed(2)}`)
    return ttmEps
  }
  
  // 方法2: 如果有年报且是最新的，直接使用年报EPS
  const annualReport = allData.find(d => d.DATE_TYPE === '年报')
  if (annualReport) {
    const latestData = allData[0]
    if (latestData.REPORT_TYPE?.includes('FY')) {
      console.log('使用年报EPS:', annualReport.BASIC_EPS)
      return annualReport.BASIC_EPS || 0
    }
  }
  
  // 方法3: 使用累计季报 + 补充季度（适用于12月财年）
  const latestCumulative = allData.find(d => d.DATE_TYPE === '累计季报')
  const lastYearQ4 = allData.find(d => d.REPORT_TYPE?.includes('Q4') && d.DATE_TYPE === '单季报')
  
  if (latestCumulative && lastYearQ4) {
    const ttmEps = (latestCumulative.BASIC_EPS || 0) + (lastYearQ4.BASIC_EPS || 0)
    console.log(`TTM EPS (累计+Q4): ${latestCumulative.REPORT_TYPE}(${latestCumulative.BASIC_EPS}) + Q4(${lastYearQ4.BASIC_EPS}) = ${ttmEps}`)
    return ttmEps
  }
  
  // 方法4: 回退到年报EPS
  if (annualReport) {
    console.log('回退使用年报EPS:', annualReport.BASIC_EPS)
    return annualReport.BASIC_EPS || 0
  }
  
  // 方法5: 使用最新单季报 * 4 估算
  const latestQuarter = allData.find(d => d.DATE_TYPE === '单季报')
  if (latestQuarter) {
    console.log('使用单季报估算TTM:', latestQuarter.BASIC_EPS, '* 4')
    return (latestQuarter.BASIC_EPS || 0) * 4
  }
  
  return allData[0]?.BASIC_EPS || 0
}

/**
 * 获取静态EPS（最近年报的每股收益）
 * 用于计算静态PE
 */
function getStaticEps(allData, profitField = 'PARENTNETPROFIT', epsField = 'EPSJB') {
  if (!allData || allData.length === 0) return { staticEps: 0, annualReportDate: null }
  
  // 按报告日期排序（最新在前）
  const sortedData = [...allData].sort((a, b) => 
    new Date(b.REPORT_DATE) - new Date(a.REPORT_DATE)
  )
  
  // 查找最近的年报（12月）
  const annualReport = sortedData.find(d => {
    const date = new Date(d.REPORT_DATE)
    return date.getMonth() === 11  // 12月
  })
  
  if (annualReport) {
    // 获取最新股本（从最新报告推算）
    const latest = sortedData[0]
    const latestProfit = latest?.[profitField] || 0
    const latestEps = latest?.[epsField] || 0
    const latestShares = latestEps > 0 ? latestProfit / latestEps : 0
    
    // 用最新股本重新计算年报EPS（保持一致性）
    const annualProfit = annualReport[profitField] || 0
    const staticEps = latestShares > 0 ? annualProfit / latestShares : (annualReport[epsField] || 0)
    
    const reportDate = new Date(annualReport.REPORT_DATE)
    return { 
      staticEps, 
      annualReportDate: `${reportDate.getFullYear()}年报`,
      annualProfit,
      rawAnnualEps: annualReport[epsField] || 0
    }
  }
  
  return { staticEps: 0, annualReportDate: null }
}

/**
 * 计算A股TTM EPS（滚动12个月每股收益）
 * 公式：TTM EPS = 当前累计EPS + (上年年报EPS - 上年同期累计EPS)
 * 例如：2025Q3的TTM = 2025Q3累计 + (2024年报 - 2024Q3累计)
 */
/**
 * 计算港股TTM EPS（使用净利润法，避免股本变化影响）
 */
function calculateHKStockTTMEps(allData) {
  if (!allData || allData.length === 0) return 0
  
  // 按报告日期排序（最新在前）
  const sortedData = [...allData].sort((a, b) => 
    new Date(b.REPORT_DATE) - new Date(a.REPORT_DATE)
  )
  
  const latest = sortedData[0]
  const latestDate = new Date(latest?.REPORT_DATE)
  const latestMonth = latestDate.getMonth() + 1  // 1-12
  const latestYear = latestDate.getFullYear()
  
  // 港股字段：HOLDER_PROFIT=股东应占利润, BASIC_EPS=每股收益
  const latestProfit = latest?.HOLDER_PROFIT || 0
  const latestEps = latest?.BASIC_EPS || 0
  const latestShares = latestEps > 0 ? latestProfit / latestEps : 0
  
  // 如果是年报（12月），直接返回
  if (latestMonth === 12) {
    console.log(`港股TTM EPS (年报): ${latestEps}`)
    return latestEps
  }
  
  // 查找上年年报
  const lastYearAnnual = sortedData.find(d => {
    const date = new Date(d.REPORT_DATE)
    return date.getMonth() === 11 && date.getFullYear() === latestYear - 1
  })
  
  // 查找上年同期报告
  const lastYearSamePeriod = sortedData.find(d => {
    const date = new Date(d.REPORT_DATE)
    return date.getMonth() === latestMonth - 1 && date.getFullYear() === latestYear - 1
  })
  
  if (lastYearAnnual && lastYearSamePeriod && latestShares > 0) {
    const annualProfit = lastYearAnnual.HOLDER_PROFIT || 0
    const samePeriodProfit = lastYearSamePeriod.HOLDER_PROFIT || 0
    const q4Profit = annualProfit - samePeriodProfit
    const ttmProfit = latestProfit + q4Profit
    const ttmEps = ttmProfit / latestShares
    
    console.log(`港股TTM EPS: (${(latestProfit/1e8).toFixed(1)}亿 + ${(q4Profit/1e8).toFixed(1)}亿) / ${(latestShares/1e8).toFixed(1)}亿股 = ${ttmEps.toFixed(2)}`)
    return ttmEps
  }
  
  // 如果没有足够数据，使用年化估算
  const annualizedEps = latestMonth === 3 ? latestEps * 4 :
                        latestMonth === 6 ? latestEps * 2 :
                        latestMonth === 9 ? latestEps * 4 / 3 : latestEps
  console.log(`港股TTM EPS (年化估算): ${latestEps} * ${12/latestMonth} = ${annualizedEps.toFixed(2)}`)
  return annualizedEps
}

function calculateAStockTTMEps(allData) {
  if (!allData || allData.length === 0) return 0
  
  // 按报告日期排序（最新在前）
  const sortedData = [...allData].sort((a, b) => 
    new Date(b.REPORT_DATE) - new Date(a.REPORT_DATE)
  )
  
  const latest = sortedData[0]
  const latestDate = new Date(latest?.REPORT_DATE)
  const latestMonth = latestDate.getMonth() + 1  // 1-12
  const latestYear = latestDate.getFullYear()
  
  // 获取最新的净利润和股本
  const latestProfit = latest?.PARENTNETPROFIT || 0  // 归属净利润
  const latestEps = latest?.EPSJB || 0
  // 从最新EPS和净利润反推股本（更准确）
  const latestShares = latestEps > 0 ? latestProfit / latestEps : 0
  
  // 如果是年报（12月），直接返回
  if (latestMonth === 12) {
    console.log(`A股TTM EPS (年报): ${latestEps}`)
    return latestEps
  }
  
  // 查找上年年报
  const lastYearAnnual = sortedData.find(d => {
    const date = new Date(d.REPORT_DATE)
    return date.getMonth() === 11 && date.getFullYear() === latestYear - 1  // 12月 = 11
  })
  
  // 查找上年同期报告
  const lastYearSamePeriod = sortedData.find(d => {
    const date = new Date(d.REPORT_DATE)
    return date.getMonth() === latestMonth - 1 && date.getFullYear() === latestYear - 1
  })
  
  if (lastYearAnnual && lastYearSamePeriod && latestShares > 0) {
    // 使用净利润计算TTM（避免股本变化导致的EPS不可比）
    const annualProfit = lastYearAnnual.PARENTNETPROFIT || 0
    const samePeriodProfit = lastYearSamePeriod.PARENTNETPROFIT || 0
    const q4Profit = annualProfit - samePeriodProfit  // 上年Q4净利润
    const ttmProfit = latestProfit + q4Profit  // TTM净利润
    const ttmEps = ttmProfit / latestShares  // 用最新股本计算TTM EPS
    
    console.log(`A股TTM EPS: (${(latestProfit/1e8).toFixed(1)}亿 + ${(q4Profit/1e8).toFixed(1)}亿) / ${(latestShares/1e8).toFixed(1)}亿股 = ${ttmEps.toFixed(2)}`)
    return ttmEps
  }
  
  // 如果没有足够数据，使用年化估算
  const annualizedEps = latestMonth === 3 ? latestEps * 4 :
                        latestMonth === 6 ? latestEps * 2 :
                        latestMonth === 9 ? latestEps * 4 / 3 : latestEps
  console.log(`A股TTM EPS (年化估算): ${latestEps} * ${12/latestMonth} = ${annualizedEps.toFixed(2)}`)
  return annualizedEps
}

/**
 * 标准化不同市场的财务数据字段
 * @param {Array|Object} rawData - 原始数据（美股为数组，其他为对象）
 * @param {string} marketType - 市场类型
 * @param {Object} balanceSheet - 资产负债表数据 { equity, totalDebt }
 * @param {Object} cashFlow - 现金流数据 { operatingCashFlow, capitalExpenditure, fcf }
 */
function normalizeFinanceData(rawData, marketType, balanceSheet = { equity: 0, totalDebt: 0 }, cashFlow = { operatingCashFlow: 0, capitalExpenditure: 0, fcf: 0 }) {
  // 美股传入的是数组，需要特殊处理
  const data = Array.isArray(rawData) ? rawData[0] : rawData
  const allData = Array.isArray(rawData) ? rawData : [rawData]
  
  if (marketType === MarketType.US) {
    // 美股字段映射 - 使用TTM EPS
    const ttmEps = calculateUSStockTTMEps(allData)
    // 获取年报数据
    const annualReport = allData.find(d => d.DATE_TYPE === '年报')
    const cumulativeReport = allData.find(d => d.DATE_TYPE === '累计季报')
    const annualRoe = annualReport?.ROE_AVG || cumulativeReport?.ROE_AVG || data.ROE_AVG || 0
    
    // 获取静态EPS（年报EPS）
    let staticEps = 0
    let annualReportDate = null
    if (annualReport) {
      staticEps = annualReport.BASIC_EPS || 0
      const reportDate = new Date(annualReport.REPORT_DATE)
      // 美股财年可能不是12月结束，显示具体日期
      annualReportDate = `FY${reportDate.getFullYear()}`
    }
    
    // 获取增长率数据（优先使用年报）
    const growthData = annualReport || cumulativeReport || data
    const revenueGrowthYOY = growthData?.OPERATE_INCOME_YOY || 0  // 营收同比增长
    const profitGrowthYOY = growthData?.PARENT_HOLDER_NETPROFIT_YOY || 0  // 净利润同比增长
    const epsGrowthYOY = growthData?.BASIC_EPS_YOY || 0  // EPS同比增长
    
    // BPS计算 - 传递股东权益供后续计算（需要配合总股本）
    // 实际BPS将在fetchRealStockData中计算
    let estimatedBps = 0
    
    return {
      ...data,
      EPSJB: ttmEps,  // 使用计算的TTM EPS
      EPSJB_STATIC: staticEps,  // 静态EPS（年报）
      ANNUAL_REPORT_DATE: annualReportDate,  // 年报日期
      BASIC_EPS_QUARTERLY: data.BASIC_EPS || 0,  // 保留单季度EPS
      BPS: estimatedBps,  // BPS将在fetchRealStockData中用equity/shares计算
      EQUITY: balanceSheet.equity,     // 传递股东权益
      TOTAL_DEBT: balanceSheet.totalDebt,  // 传递总负债
      FCF_TOTAL: cashFlow.fcf,         // 传递年度自由现金流（总额）
      OCF_TOTAL: cashFlow.operatingCashFlow,  // 经营活动现金流
      CAPEX_TOTAL: cashFlow.capitalExpenditure,  // 资本支出
      ROEJQ: annualRoe,   // 使用年报ROE
      TOTALOPERATEREVE: data.OPERATE_INCOME || 0,
      PARENTNETPROFIT: data.PARENT_HOLDER_NETPROFIT || 0,
      TOTAL_SHARE: data.TOTAL_SHARES || 0,
      MGJYXJJE: data.CFPS || 0,
      INDUSTRY: data.INDUSTRY || 'Technology',
      SECURITY_NAME_ABBR: data.SECURITY_NAME_ABBR || data.SECURITY_CODE,
      // 增长率数据（年报）
      REVENUE_GROWTH_YOY: revenueGrowthYOY,
      PROFIT_GROWTH_YOY: profitGrowthYOY,
      EPS_GROWTH_YOY: epsGrowthYOY,
      currency: 'USD'
    }
  } else if (marketType === MarketType.HK) {
    // 港股字段映射 (基于实际API返回: RPT_HKF10_FN_MAININDICATOR)
    // 计算TTM EPS（使用净利润法）
    const ttmEps = calculateHKStockTTMEps(allData)
    // 获取静态EPS（年报）
    const { staticEps, annualReportDate } = getStaticEps(allData, 'HOLDER_PROFIT', 'BASIC_EPS')
    
    return {
      ...data,
      EPSJB: ttmEps,  // 使用TTM EPS
      EPSJB_ORIGINAL: data.BASIC_EPS || 0,  // 保留原始EPS
      EPSJB_STATIC: staticEps,  // 静态EPS（年报）
      ANNUAL_REPORT_DATE: annualReportDate,  // 年报日期
      BPS: data.BPS || 0,
      ROEJQ: data.ROE_AVG || data.ROE_YEARLY || 0,
      TOTALOPERATEREVE: data.OPERATE_INCOME || 0,  // 营业收入
      PARENTNETPROFIT: data.HOLDER_PROFIT || 0,     // 股东应占利润
      TOTAL_SHARE: data.ISSUED_COMMON_SHARES || data.HK_COMMON_SHARES || 0,
      MGJYXJJE: data.PER_NETCASH_OPERATE || 0,     // 每股经营现金流
      INDUSTRY: data.INDUSTRY || '其他',
      SECURITY_NAME_ABBR: data.SECURITY_NAME_ABBR || data.SECUCODE,
      // 港股增长率字段
      REVENUE_GROWTH_YOY: data.OPERATE_INCOME_YOY || 0,  // 营收同比增长
      PROFIT_GROWTH_YOY: data.HOLDER_PROFIT_YOY || 0,    // 股东应占利润同比增长
      EPS_GROWTH_YOY: data.BASIC_EPS_YOY || 0,           // EPS同比增长
      currency: 'HKD'
    }
  }
  
  // A股 - 计算TTM EPS并添加增长率数据
  const ttmEps = calculateAStockTTMEps(allData)
  // 获取静态EPS（年报）
  const { staticEps, annualReportDate } = getStaticEps(allData, 'PARENTNETPROFIT', 'EPSJB')
  
  return { 
    ...data, 
    EPSJB: ttmEps,  // 使用TTM EPS替代累计EPS
    EPSJB_ORIGINAL: data.EPSJB,  // 保留原始累计EPS
    EPSJB_STATIC: staticEps,  // 静态EPS（年报）
    ANNUAL_REPORT_DATE: annualReportDate,  // 年报日期
    currency: 'CNY',
    // A股增长率字段
    REVENUE_GROWTH_YOY: data.TOTALOPERATEREVETZ || 0,  // 营业总收入同比增长
    PROFIT_GROWTH_YOY: data.PARENTNETPROFITTZ || data.DJD_DPNP_YOY || 0,  // 净利润同比增长
    EPS_GROWTH_YOY: data.BASICEPS_YOY || 0,  // EPS同比增长
  }
}

/**
 * 获取股票完整数据（整合多个API）
 * 支持A股、港股、美股
 * @param {string} code - 股票代码
 * @param {string} marketType - 市场类型 (可选，自动检测)
 */
export async function fetchRealStockData(code, marketType = null) {
  // 清理代码并检测市场
  const pureCode = code.replace(/\.(SH|SZ|HK|US|O|N)$/i, '')
  const { market, marketType: detectedMarket } = getStockPrefix(code, marketType)
  const actualMarket = marketType || detectedMarket
  
  try {
    // 并行获取实时行情和财务数据
    const [sinaData, financeData] = await Promise.all([
      fetchSinaRealtime(pureCode, actualMarket),
      fetchEastMoneyFinance(pureCode, actualMarket)
    ])
    
    // 如果新浪失败，尝试腾讯
    let realtimeData = sinaData
    if (!realtimeData || !realtimeData.price) {
      console.log('新浪数据获取失败，尝试腾讯API')
      realtimeData = await fetchTencentRealtime(pureCode, actualMarket)
    }
    
    if (!realtimeData && !financeData) {
      console.error('所有数据源都获取失败')
      return null
    }
    
    // 获取货币单位
    const currency = realtimeData?.currency || financeData?.currency || 'CNY'
    
    // 美股/港股的单位处理不同
    let unitDivisor = 100000000 // A股单位：亿
    if (actualMarket === MarketType.US) {
      unitDivisor = 1000000000 // 美股单位：十亿(Billion)
    } else if (actualMarket === MarketType.HK) {
      unitDivisor = 100000000 // 港股单位：亿
    }
    
    // 从财务数据和实时数据提取
    // 美股优先使用新浪提供的TTM EPS（更准确）
    let eps = financeData?.EPSJB || financeData?.BASIC_EPS || 0
    if (actualMarket === MarketType.US && realtimeData?.eps) {
      eps = realtimeData.eps  // 新浪提供的TTM EPS
      console.log('使用新浪TTM EPS:', eps)
    }
    
    const roe = financeData?.ROEJQ || financeData?.ROE_WEIGHT || 0
    const revenue = financeData?.TOTALOPERATEREVE ? financeData.TOTALOPERATEREVE / unitDivisor : 
                   (financeData?.TOTAL_OPERATE_INCOME ? financeData.TOTAL_OPERATE_INCOME / unitDivisor : 0)
    const netProfit = financeData?.PARENTNETPROFIT ? financeData.PARENTNETPROFIT / unitDivisor : 
                     (financeData?.PARENT_NETPROFIT ? financeData.PARENT_NETPROFIT / unitDivisor : 0)
    
    // 总股本：优先使用新浪API的数据（更准确）
    // 统一使用"亿股"作为单位
    let totalShares = 0
    let totalSharesRaw = 0  // 原始股本数（股）
    const sharesUnitDivisor = 100000000  // 固定为亿（不受market影响）
    if (actualMarket === MarketType.US && realtimeData?.totalShares) {
      totalSharesRaw = realtimeData.totalShares
      totalShares = totalSharesRaw / sharesUnitDivisor  // 统一转为亿股
    } else {
      totalSharesRaw = financeData?.TOTAL_SHARE || financeData?.TOTAL_SHARES || 0
      totalShares = totalSharesRaw ? totalSharesRaw / sharesUnitDivisor : 0
    }
    
    // BPS处理 - 美股使用股东权益/总股本计算
    let bvps = financeData?.BPS || 0
    if (actualMarket === MarketType.US && financeData?.EQUITY && totalSharesRaw > 0) {
      bvps = financeData.EQUITY / totalSharesRaw
      console.log(`美股BPS计算: 股东权益(${(financeData.EQUITY/1e9).toFixed(1)}B) / 股本(${(totalSharesRaw/1e9).toFixed(2)}B) = $${bvps.toFixed(2)}`)
    }
    
    // FCF处理
    let fcfPerShare = financeData?.MGJYXJJE || 0
    // 美股：优先使用现金流量表的真实FCF数据
    if (actualMarket === MarketType.US) {
      if (financeData?.FCF_TOTAL && totalSharesRaw > 0) {
        // 使用真实FCF数据：FCF总额 / 总股本 = 每股FCF
        fcfPerShare = financeData.FCF_TOTAL / totalSharesRaw
        console.log(`美股FCF(真实): FCF(${(financeData.FCF_TOTAL/1e9).toFixed(1)}B) / 股本(${(totalSharesRaw/1e9).toFixed(2)}B) = $${fcfPerShare.toFixed(2)}`)
      } else if (eps > 0) {
        // 如果没有真实数据，使用EPS估算（保守）
        fcfPerShare = eps * 0.80  // 估算：FCF ≈ 净利润 × 80%
        console.log(`美股FCF(估算): EPS(${eps}) × 0.80 = ${fcfPerShare.toFixed(2)}`)
      }
    }
    
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
    
    // 市场显示名称
    let marketLabel = 'A股'
    let codeWithSuffix = pureCode + '.' + market
    if (actualMarket === MarketType.US) {
      marketLabel = '美股'
      codeWithSuffix = pureCode.toUpperCase() + '.US'
    } else if (actualMarket === MarketType.HK) {
      marketLabel = '港股'
      codeWithSuffix = pureCode + '.HK'
    }
    
    // 整合数据
    const result = {
      // 基本信息
      name,
      code: codeWithSuffix,
      market: marketLabel,
      marketType: actualMarket,
      industry,
      currency,
      
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
      eps,  // TTM EPS（动态）
      epsStatic: financeData?.EPSJB_STATIC || eps,  // 静态EPS（年报）
      annualReportDate: financeData?.ANNUAL_REPORT_DATE || '',  // 年报日期
      bvps,
      roe,
      revenue,
      netProfit,
      sharesOutstanding,
      sps,
      fcf,
      
      // 美股总负债（用于DCF等计算）
      totalDebt: financeData?.TOTAL_DEBT ? financeData.TOTAL_DEBT / unitDivisor : 0,
      
      // 估算数据
      dividend: eps > 0 ? eps * 0.3 : 0, // 假设30%派息率
      dividendYield: price > 0 && eps > 0 ? (eps * 0.3 / price * 100) : 0,
      netDebt: financeData?.TOTAL_DEBT ? financeData.TOTAL_DEBT / unitDivisor : 0,  // 简化：净债务≈总负债
      
      // 增长率数据 - 优先使用财报真实数据
      revenueGrowthYOY: financeData?.REVENUE_GROWTH_YOY || 0,  // 营收同比增长(年报)
      profitGrowthYOY: financeData?.PROFIT_GROWTH_YOY || 0,    // 净利润同比增长(年报)
      epsGrowthYOY: financeData?.EPS_GROWTH_YOY || 0,          // EPS同比增长(年报)
      // 兼容旧字段（用于没有真实数据时的估算）
      revenueGrowth3Y: financeData?.REVENUE_GROWTH_YOY || (roe > 0 ? roe * 0.5 : 10),
      profitGrowth3Y: financeData?.PROFIT_GROWTH_YOY || (roe > 0 ? roe * 0.6 : 10),
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
  supportedMarkets: [
    { market: 'A股', description: '上海/深圳交易所', currency: 'CNY' },
    { market: '港股', description: '香港交易所', currency: 'HKD' },
    { market: '美股', description: '纳斯达克/纽交所', currency: 'USD' },
  ],
  
  directFromReport: [
    { key: 'eps', name: '每股收益', source: '东方财富API', location: 'A股: EPSJB / 港股美股: BASIC_EPS' },
    { key: 'bvps', name: '每股净资产', source: '东方财富API', location: 'BPS' },
    { key: 'revenue', name: '营业收入', source: '东方财富API', location: 'TOTALOPERATEREVE / REVENUE' },
    { key: 'netProfit', name: '净利润', source: '东方财富API', location: 'PARENTNETPROFIT / NET_PROFIT' },
    { key: 'roe', name: 'ROE', source: '东方财富API', location: 'ROEJQ / ROE' },
    { key: 'price', name: '实时股价', source: '新浪/腾讯API', location: '实时行情接口 (A股/港股/美股)' },
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
