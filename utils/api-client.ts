// Centralized API client for all requests
class ApiClient {
  private baseUrl = ""

  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error || `HTTP ${response.status}`)
    }

    return response.json()
  }

  get(endpoint: string) {
    return this.request(endpoint, { method: "GET" })
  }

  post(endpoint: string, body: any) {
    return this.request(endpoint, { method: "POST", body: JSON.stringify(body) })
  }

  put(endpoint: string, body: any) {
    return this.request(endpoint, { method: "PUT", body: JSON.stringify(body) })
  }

  delete(endpoint: string) {
    return this.request(endpoint, { method: "DELETE" })
  }
}

export const apiClient = new ApiClient()
