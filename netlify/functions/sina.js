import iconv from 'iconv-lite'

// 新浪股票行情API代理
export async function handler(event) {
  const path = event.path.replace('/api/sina', '') || '/'
  const query = event.rawQuery ? `?${event.rawQuery}` : ''
  const url = `https://hq.sinajs.cn${path}${query}`

  try {
    const response = await fetch(url, {
      headers: {
        'Referer': 'https://finance.sina.com.cn',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    // 获取原始二进制数据并使用iconv-lite转换GBK为UTF-8
    const buffer = await response.arrayBuffer()
    const text = iconv.decode(Buffer.from(buffer), 'gbk')

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Access-Control-Allow-Origin': '*'
      },
      body: text
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    }
  }
}
