function generateMockSatelliteData() {
  const satellites = []
  const numSatellites = 8 // Number of BULAN satellites in the constellation

  // Define some realistic orbital paths
  const orbitalPaths = [
    // Polar orbit
    { baseLatitude: 0, baseLongitude: -120, latitudeRange: 80, longitudeRange: 40 },
    { baseLatitude: 0, baseLongitude: -60, latitudeRange: 80, longitudeRange: 40 },
    { baseLatitude: 0, baseLongitude: 0, latitudeRange: 80, longitudeRange: 40 },
    { baseLatitude: 0, baseLongitude: 60, latitudeRange: 80, longitudeRange: 40 },
    { baseLatitude: 0, baseLongitude: 120, latitudeRange: 80, longitudeRange: 40 },
    // Equatorial orbit
    { baseLatitude: 0, baseLongitude: -150, latitudeRange: 20, longitudeRange: 60 },
    { baseLatitude: 0, baseLongitude: -30, latitudeRange: 20, longitudeRange: 60 },
    { baseLatitude: 0, baseLongitude: 90, latitudeRange: 20, longitudeRange: 60 },
  ]

  for (let i = 1; i <= numSatellites; i++) {
    // Get orbital path for this satellite
    const orbit = orbitalPaths[(i - 1) % orbitalPaths.length]

    // Generate position along the orbital path
    const orbitProgress = Math.random() // 0-1 representing position in orbit
    const longitude = orbit.baseLongitude + (Math.random() * orbit.longitudeRange - orbit.longitudeRange / 2)
    const latitude = orbit.baseLatitude + Math.sin(orbitProgress * Math.PI * 2) * orbit.latitudeRange
    const altitude = 500 + Math.random() * 100 // 500-600 km altitude

    // Generate random packet statistics
    // Higher ID satellites have better performance (newer satellites)
    const baseDeliveryRate = 0.75 + (i / numSatellites) * 0.2 // 0.75-0.95 base rate
    const deliveryRate = Math.min(0.99, baseDeliveryRate + (Math.random() * 0.1 - 0.05)) // Add some randomness

    const totalPackets = 10000 + Math.floor(Math.random() * 90000) // 10,000 to 100,000 packets
    const packetsDelivered = Math.floor(totalPackets * deliveryRate)
    const packetsLost = totalPackets - packetsDelivered

    satellites.push({
      id: i,
      name: `BULAN-${i}`,
      longitude,
      latitude,
      altitude,
      packetsDelivered,
      packetsLost,
      lastUpdated: new Date(Date.now() - Math.random() * 3600000).toISOString(), // Within the last hour
    })
  }

  return satellites
}

// Simulate API call with a delay
export async function getSatelliteData() {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800))

  return generateMockSatelliteData()
}

