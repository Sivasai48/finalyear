// Utility functions for formatting data

export const formatters = {
  currency: (value: number, symbol = "₹") => {
    return `${symbol}${value.toLocaleString("en-IN")}`
  },

  phone: (phone: string) => {
    const cleaned = phone.replace(/\D/g, "")
    if (cleaned.length !== 10) return phone
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`
  },

  date: (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  },

  percentage: (value: number, decimals = 1) => {
    return `${(value * 100).toFixed(decimals)}%`
  },

  yield: (value: number) => {
    return `${value.toFixed(2)} quintals`
  },

  quantity: (value: number, unit = "kg") => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(2)} tonnes`
    }
    return `${value.toFixed(0)} ${unit}`
  },
}
