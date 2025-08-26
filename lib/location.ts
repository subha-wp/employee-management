// Location utilities for employee tracking
export interface LocationData {
  latitude: number
  longitude: number
  address?: string
  accuracy?: number
}

export class LocationManager {
  static async getCurrentLocation(): Promise<LocationData | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null)
        return
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude, accuracy } = position.coords

          try {
            // In production, you'd use a real geocoding service
            const address = await this.reverseGeocode(latitude, longitude)
            resolve({
              latitude,
              longitude,
              address,
              accuracy,
            })
          } catch (error) {
            resolve({
              latitude,
              longitude,
              accuracy,
            })
          }
        },
        (error) => {
          console.error("Location error:", error)
          resolve(null)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        },
      )
    })
  }

  private static async reverseGeocode(lat: number, lng: number): Promise<string> {
    // Mock geocoding - in production, use Google Maps API or similar
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`
  }

  static calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371 // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1)
    const dLng = this.toRadians(lng2 - lng1)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180)
  }
}
