// Validation utilities for forms

export const validators = {
  phone: (phone: string) => {
    const regex = /^[6-9]\d{9}$/
    return regex.test(phone.replace(/\D/g, ""))
  },

  email: (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  },

  otp: (otp: string) => {
    return /^\d{6}$/.test(otp)
  },

  cropYield: (yield_: number) => {
    return yield_ > 0 && yield_ <= 1000
  },

  landSize: (size: number) => {
    return size > 0 && size <= 10000
  },
}

export const errorMessages = {
  phone: "Please enter a valid 10-digit phone number",
  email: "Please enter a valid email address",
  otp: "OTP must be 6 digits",
  cropYield: "Yield must be between 0 and 1000",
  landSize: "Land size must be between 0 and 10000 hectares",
}
