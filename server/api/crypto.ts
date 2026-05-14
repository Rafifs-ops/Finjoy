export default defineCachedEventHandler(async (event) => {

  const query = getQuery(event) // Mendapatkan data nama coin dari params URL
  const ids = query.ids || 'bitcoin,ethereum,binancecoin,solana,ripple' // Jika tidak ada params URL, maka akan menggunakan data default

  try {
    // Mengambil data dari API Coingecko
    const response = await $fetch(`${process.env.COINGECKO_BASE_URL}/simple/price`, {
      query: {
        ids: ids,
        vs_currencies: 'idr',
        x_cg_demo_api_key: process.env.COINGECKO_API_KEY
      }
    })
    return response
    // output example: {
    //   bitcoin: { idr: 100000000 },
    //   ethereum: { idr: 100000000 },
    //   binancecoin: { idr: 100000000 },
    //   solana: { idr: 100000000 },
    //   ripple: { idr: 100000000 }
    // }

  } catch (error: any) {

    console.error('Crypto API Error:', error.message)
    return { error: 'Failed to fetch crypto data' }

  }
}, {
  maxAge: 600, // 10 minutes cache
  name: 'crypto-stats', // Nama cache 
  getKey: (event) => {
    const query = getQuery(event)
    return `crypto-prices-${query.ids || 'default'}`
  }
})
