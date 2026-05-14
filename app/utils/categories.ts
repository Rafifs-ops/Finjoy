export const CATEGORIES = [
  { name: 'Makanan', type: 'EXPENSE', icon: '🍔' },
  { name: 'Transport', type: 'EXPENSE', icon: '🚗' },
  { name: 'Belanja', type: 'EXPENSE', icon: '🛍️' },
  { name: 'Hiburan', type: 'EXPENSE', icon: '🎮' },
  { name: 'Tagihan', type: 'EXPENSE', icon: '🧾' },
  { name: 'Gaji', type: 'INCOME', icon: '💸' },
  { name: 'Bonus', type: 'INCOME', icon: '🎉' },
  { name: 'Tabungan', type: 'EXPENSE', icon: '🏦' },
]

export const getCategoryIcon = (name: string) => {
  const cat = CATEGORIES.find(c => c.name === name)
  return cat ? cat.icon : '💸'
}
