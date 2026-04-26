"use client"

/**
 * Authenticated fetch utility
 * Automatically adds auth token and handles 401 errors by redirecting to login
 */

export async function authFetch(
    url: string,
    options: RequestInit = {}
): Promise<Response> {
    const token = localStorage.getItem("auth-token")

    const headers = {
        ...options.headers,
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    }

    const response = await fetch(url, { ...options, headers })

    // If unauthorized, clear token and redirect to appropriate login page
    if (response.status === 401) {
        console.warn("Auth token invalid/expired - redirecting to login")

        // Determine which type of user was logged in
        const authUser = localStorage.getItem("auth-user")
        let userType = "farmer" // default

        try {
            if (authUser) {
                const parsed = JSON.parse(authUser)
                userType = parsed.type || "farmer"
            }
        } catch (e) {
            console.error("Error parsing auth-user", e)
        }

        // Clear auth data
        localStorage.removeItem("auth-token")
        localStorage.removeItem("auth-user")

        // Redirect to login
        if (typeof window !== "undefined") {
            const loginUrl = userType === "dhalari" ? "/dhalari/auth" : "/auth/farmer"
            window.location.href = loginUrl
        }
    }

    return response
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
    if (typeof window === "undefined") return false

    const token = localStorage.getItem("auth-token")
    const user = localStorage.getItem("auth-user")

    return !!(token && user)
}

/**
 * Get current user from localStorage
 */
export function getCurrentUser(): { id: string; name: string; type: string } | null {
    if (typeof window === "undefined") return null

    const user = localStorage.getItem("auth-user")
    if (!user) return null

    try {
        return JSON.parse(user)
    } catch {
        return null
    }
}

/**
 * Get auth token
 */
export function getAuthToken(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem("auth-token")
}
