export default defineCachedEventHandler(async (event) => {

  const query = getQuery(event) // Mendapatkan data kode emiten dari params URL
  const symbols = query.symbols || 'BBCA,BBRI,BMRI,TLKM,GOTO' // Jika tidak ada params URL, maka akan menggunakan data default

  try {
    // Mengambil data dari API Stock
    const response = await $fetch(`${process.env.STOCK_API_BASE_URL}/prices`, {
      query: { symbols },
      headers: {
        'X-API-KEY': process.env.STOCK_API_KEY || '',
        'Accept': 'application/json'
      }
    })
    return response
    // output example: {
    //   'BBCA': { price: 10000, change: 100, changePercent: 10 },
    //   'BBRI': { price: 10000, change: 100, changePercent: 10 },
    //   'BMRI': { price: 10000, change: 100, changePercent: 10 },
    //   'TLKM': { price: 10000, change: 100, changePercent: 10 },
    //   'GOTO': { price: 10000, change: 100, changePercent: 10 }
    // }

  } catch (error: any) {

    console.error('Stock API Error:', error.message)
    return { error: 'Failed to fetch stock data' }

  }
}, {
  maxAge: 600, // 10 minutes cache
  name: 'stock-prices', // Nama cache 
  getKey: (event) => {
    const query = getQuery(event)
    return `saham-${query.symbols || 'default'}`
  }
})
