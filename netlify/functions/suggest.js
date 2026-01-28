// 东方财富搜索API代理 (兼容旧路径)
export async function handler(event) {
  const path = event.path.replace('/api/suggest', '/api/suggest') || '/'
  const query = event.rawQuery ? `?${event.rawQuery}` : ''
  const url = `https://searchapi.eastmoney.com${path}${query}`

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    // 获取原始文本并确保UTF-8编码
    const buffer = await response.arrayBuffer()
    const decoder = new TextDecoder('utf-8')
    const text = decoder.decode(buffer)

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
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
