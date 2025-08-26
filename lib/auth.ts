// Authentication utilities
import type { Employee } from "./types"

export interface AuthSession {
  employee: Employee
  sessionId: string
  expiresAt: Date
}

class AuthManager {
  private static sessions = new Map<string, AuthSession>()

  static createSession(employee: Employee): string {
    const sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36)
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 8) // 8 hour session

    this.sessions.set(sessionId, {
      employee,
      sessionId,
      expiresAt,
    })

    return sessionId
  }

  static getSession(sessionId: string): AuthSession | null {
    const session = this.sessions.get(sessionId)
    if (!session) return null

    if (new Date() > session.expiresAt) {
      this.sessions.delete(sessionId)
      return null
    }

    return session
  }

  static destroySession(sessionId: string): void {
    this.sessions.delete(sessionId)
  }

  static isAuthenticated(sessionId: string): boolean {
    return this.getSession(sessionId) !== null
  }

  static hasRole(sessionId: string, roles: string[]): boolean {
    const session = this.getSession(sessionId)
    if (!session) return false
    return roles.includes(session.employee.role)
  }
}

export { AuthManager }
