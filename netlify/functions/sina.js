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

    const text = await response.text()

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/plain; charset=gbk',
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
