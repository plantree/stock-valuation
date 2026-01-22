# Stock Valuation 股票估值计算器

一个简单易用的股票估值工具，支持绝对估值和相对估值方法。

## Features 功能特性

### Relative Valuation 相对估值
- **PE Calculator** - 市盈率计算器（支持动态PE/静态PE）
- **PB Calculator** - 市净率计算器
- **PS Calculator** - 市销率计算器
- **PEG Calculator** - PEG计算器

### Absolute Valuation 绝对估值
- **DCF Calculator** - 现金流折现模型
- **DDM Calculator** - 股利折现模型

### Multi-Market Support 多市场支持
- 🇨🇳 A-Shares (A股)
- 🇭🇰 Hong Kong Stocks (港股)
- 🇺🇸 US Stocks (美股)

### Real-time Data 实时数据
- Real-time stock price quotes
- Financial data from Eastmoney API
- TTM EPS calculation using net profit method

## Data Sources 数据来源

| Data 数据 | Source 来源 | Description 说明 |
|-----------|-------------|------------------|
| Stock Quotes 实时行情 | [Tencent 腾讯](https://qt.gtimg.cn) | Real-time price, PE, PB |
| Financial Data 财务数据 | [Eastmoney 东方财富](https://datacenter.eastmoney.com) | EPS, Net Profit, Revenue |
| Stock Search 股票搜索 | [Eastmoney 东方财富](https://searchapi.eastmoney.com) | A/HK/US stock search |
| Backup Quotes 备用行情 | [Sina 新浪](https://hq.sinajs.cn) | A-share price data |

## Tech Stack 技术栈

- React 18
- Vite
- Tailwind CSS
- React Router
- Recharts

## Getting Started 快速开始

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Disclaimer 免责声明

This tool is for educational purposes only and does not constitute investment advice.

本工具仅供学习参考，不构成投资建议。

## License

MIT
