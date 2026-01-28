// 东方财富财务数据API代理
export async function handler(event) {
  const path = event.path.replace('/api/eastmoney/data', '') || '/'
  const query = event.rawQuery ? `?${event.rawQuery}` : ''
  const url = `https://datacenter.eastmoney.com${path}${query}`

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    const data = await response.json()

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(data)
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    }
  }
}
