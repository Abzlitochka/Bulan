"use client"

import { useEffect, useRef, useState } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

interface MapComponentProps {
  satellites: any[]
  onSelectSatellite: (satellite: any) => void
}

export default function MapComponent({ satellites, onSelectSatellite }: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const leafletMap = useRef<L.Map | null>(null)
  const markersRef = useRef<{ [key: string]: L.Marker }>({})
  const coverageLayersRef = useRef<{ [key: string]: L.Circle }>({})
  const packetLayersRef = useRef<{ [key: string]: L.Polyline[] }>({})
  const groundStationMarkersRef = useRef<L.Marker[]>([])
  const [animationFrame, setAnimationFrame] = useState(0)

  useEffect(() => {
    const animate = () => {
      setAnimationFrame((prev) => (prev + 1) % 100)
      requestAnimationFrame(animate)
    }

    const animationId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationId)
  }, [])

  useEffect(() => {
    if (!mapRef.current) return

    if (!leafletMap.current) {
      if (!document.getElementById("satellite-marker-style")) {
        const style = document.createElement("style")
        style.id = "satellite-marker-style"
        style.innerHTML = `
          .satellite-marker {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            border-radius: 50% !important;
            width: 32px !important;
            height: 32px !important;
            color: white !important;
            font-weight: bold !important;
          }
          .satellite-marker.good {
            background-color: #22c55e !important;
          }
          .satellite-marker.warning {
            background-color: #eab308 !important;
          }
          .satellite-marker.poor {
            background-color: #ef4444 !important;
          }
          .satellite-marker.selected {
            border: 2px solid white !important;
            box-shadow: 0 0 10px rgba(0,0,0,0.5) !important;
          }
          .packet-dot {
            width: 8px !important;
            height: 8px !important;
            border-radius: 50% !important;
            background-color: #3b82f6 !important;
            display: block !important;
          }
          .packet-dot.uplink {
            background-color: #3b82f6 !important;
          }
          .packet-dot.downlink {
            background-color: #22c55e !important;
          }
          .ground-station-marker {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            border-radius: 50% !important;
            background-color: #9333ea !important;
            width: 24px !important;
            height: 24px !important;
            color: white !important;
            font-size: 10px !important;
            font-weight: bold !important;
          }
          .packet-stats-tooltip {
            background-color: rgba(0, 0, 0, 0.8) !important;
            border: 1px solid rgba(255, 255, 255, 0.2) !important;
            border-radius: 4px !important;
            padding: 8px !important;
            font-size: 12px !important;
            color: white !important;
          }
          .packet-stats-tooltip h4 {
            margin: 0 0 5px 0 !important;
            font-size: 14px !important;
            font-weight: bold !important;
          }
          .packet-stats-tooltip .stats-grid {
            display: grid !important;
            grid-template-columns: auto auto !important;
            gap: 4px !important;
          }
          .packet-stats-tooltip .label {
            color: rgba(255, 255, 255, 0.7) !important;
          }
          .packet-stats-tooltip .value {
            font-weight: bold !important;
            text-align: right !important;
          }
          .packet-stats-tooltip .progress-bar {
            height: 4px !important;
            background-color: rgba(255, 255, 255, 0.2) !important;
            border-radius: 2px !important;
            margin-top: 5px !important;
            overflow: hidden !important;
          }
          .packet-stats-tooltip .progress-fill {
            height: 100% !important;
            background-color: #22c55e !important;
          }
          .packet-stats-tooltip .progress-fill.warning {
            background-color: #eab308 !important;
          }
          .packet-stats-tooltip .progress-fill.poor {
            background-color: #ef4444 !important;
          }
        `
        document.head.appendChild(style)
      }

      const map = L.map(mapRef.current, {
        center: [0, 0],
        zoom: 2,
        minZoom: 2,
        maxBounds: [
          [-90, -180],
          [90, 180],
        ],
      })

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map)

      leafletMap.current = map
    }

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove()
        leafletMap.current = null
      }

      const style = document.getElementById("satellite-marker-style")
      if (style) {
        document.head.removeChild(style)
      }
    }
  }, [])

  useEffect(() => {
    const map = leafletMap.current
    if (!map) return

    Object.values(markersRef.current).forEach((marker) => marker.remove())
    Object.values(coverageLayersRef.current).forEach((circle) => circle.remove())
    Object.values(packetLayersRef.current).forEach((lines) => lines.forEach((line) => line.remove()))
    groundStationMarkersRef.current.forEach((marker) => marker.remove())

    markersRef.current = {}
    coverageLayersRef.current = {}
    packetLayersRef.current = {}
    groundStationMarkersRef.current = []

    const groundStations = [
      { id: 1, name: "Main Control Center", lat: 51.5074, lng: -0.1278 },
      { id: 2, name: "Secondary Station", lat: 40.7128, lng: -74.006 },
      { id: 3, name: "Backup Station", lat: 35.6762, lng: 139.6503 },
    ]

    groundStations.forEach((station) => {
      const stationIcon = L.divIcon({
        html: `<div>GS</div>`,
        className: "ground-station-marker",
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      })

      const marker = L.marker([station.lat, station.lng], {
        icon: stationIcon,
        title: station.name,
      }).addTo(map)

      const tooltipContent = `
        <div>
          <strong>${station.name}</strong><br>
          Ground Station #${station.id}
        </div>
      `

      marker.bindTooltip(tooltipContent, {
        direction: "top",
        offset: [0, -12],
        opacity: 0.9,
      })

      groundStationMarkersRef.current.push(marker)
    })

    satellites.forEach((satellite) => {
      const deliveryRate = satellite.packetsDelivered / (satellite.packetsDelivered + satellite.packetsLost)
      let statusClass = "poor"

      if (deliveryRate > 0.95) {
        statusClass = "good"
      } else if (deliveryRate > 0.8) {
        statusClass = "warning"
      }

      const customIcon = L.divIcon({
        className: `satellite-marker ${statusClass}`,
        html: `<div>${satellite.id}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      })

      const marker = L.marker([satellite.latitude, satellite.longitude], {
        icon: customIcon,
        title: `BULAN-${satellite.id}`,
      }).addTo(map)

      const tooltipContent = `
        <div class="packet-stats-tooltip">
          <h4>BULAN-${satellite.id} Packet Statistics</h4>
          <div class="stats-grid">
            <div class="label">Delivered:</div>
            <div class="value">${satellite.packetsDelivered.toLocaleString()}</div>
            
            <div class="label">Lost:</div>
            <div class="value">${satellite.packetsLost.toLocaleString()}</div>
            
            <div class="label">Rate:</div>
            <div class="value">${(deliveryRate * 100).toFixed(2)}%</div>
          </div>
          <div class="progress-bar">
            <div class="progress-fill ${statusClass}" style="width: ${deliveryRate * 100}%"></div>
          </div>
        </div>
      `

      marker.bindTooltip(tooltipContent, {
        direction: "top",
        offset: [0, -16],
        opacity: 0.9,
        className: "custom-tooltip",
      })

      const coverageRadius = 1000000
      const coverageCircle = L.circle([satellite.latitude, satellite.longitude], {
        radius: coverageRadius,
        color: deliveryRate > 0.95 ? "#22c55e" : deliveryRate > 0.8 ? "#eab308" : "#ef4444",
        fillColor: deliveryRate > 0.95 ? "#22c55e" : deliveryRate > 0.8 ? "#eab308" : "#ef4444",
        fillOpacity: 0.1,
        weight: 1,
      }).addTo(map)

      let closestStation = groundStations[0]
      let minDistance = Number.MAX_VALUE

      groundStations.forEach((station) => {
        const distance = Math.sqrt(
          Math.pow(satellite.latitude - station.lat, 2) + Math.pow(satellite.longitude - station.lng, 2),
        )

        if (distance < minDistance) {
          minDistance = distance
          closestStation = station
        }
      })

      const packetLines: L.Polyline[] = []

      const uplinkLine = L.polyline(
        [
          [closestStation.lat, closestStation.lng],
          [satellite.latitude, satellite.longitude],
        ],
        {
          color: "#3b82f6",
          weight: 1,
          opacity: 0.6,
          dashArray: "5,5",
        },
      ).addTo(map)

      packetLines.push(uplinkLine)

      const downlinkLine = L.polyline(
        [
          [satellite.latitude, satellite.longitude],
          [closestStation.lat, closestStation.lng],
        ],
        {
          color: "#22c55e",
          weight: 1,
          opacity: 0.6,
          dashArray: "5,5",
        },
      ).addTo(map)

      packetLines.push(downlinkLine)

      marker.on("click", () => {
        onSelectSatellite(satellite)

        Object.values(markersRef.current).forEach((m) => {
          const icon = m.getIcon() as L.DivIcon
          const newIcon = L.divIcon({
            ...icon.options,
            className: icon.options.className?.replace(" selected", "") || "",
          })
          m.setIcon(newIcon)
        })

        const selectedIcon = L.divIcon({
          ...customIcon.options,
          className: `${customIcon.options.className} selected`,
        })
        marker.setIcon(selectedIcon)
      })

      markersRef.current[satellite.id] = marker
      coverageLayersRef.current[satellite.id] = coverageCircle
      packetLayersRef.current[satellite.id] = packetLines
    })
  }, [satellites, onSelectSatellite])

  useEffect(() => {
    const map = leafletMap.current
    if (!map) return

    document.querySelectorAll(".packet-dot").forEach((el) => el.remove())

    satellites.forEach((satellite) => {
      const packetLines = packetLayersRef.current[satellite.id]
      if (!packetLines || packetLines.length < 2) return

      const uplinkLine = packetLines[0]
      const downlinkLine = packetLines[1]

      const uplinkCoords = uplinkLine.getLatLngs() as L.LatLng[]
      const downlinkCoords = downlinkLine.getLatLngs() as L.LatLng[]

      if (uplinkCoords.length < 2 || downlinkCoords.length < 2) return

      const uplinkProgress = (animationFrame / 100 + satellite.id * 0.1) % 1
      const downlinkProgress = ((animationFrame + 50) / 100 + satellite.id * 0.1) % 1

      const uplinkLat = uplinkCoords[0].lat + (uplinkCoords[1].lat - uplinkCoords[0].lat) * uplinkProgress
      const uplinkLng = uplinkCoords[0].lng + (uplinkCoords[1].lng - uplinkCoords[0].lng) * uplinkProgress

      const uplinkIcon = L.divIcon({
        className: "packet-dot uplink",
        html: "<div></div>",
        iconSize: [8, 8],
        iconAnchor: [4, 4],
      })

      L.marker([uplinkLat, uplinkLng], { icon: uplinkIcon }).addTo(map)

      const downlinkLat = downlinkCoords[0].lat + (downlinkCoords[1].lat - downlinkCoords[0].lat) * downlinkProgress
      const downlinkLng = downlinkCoords[0].lng + (downlinkCoords[1].lng - downlinkCoords[0].lng) * downlinkProgress

      const downlinkIcon = L.divIcon({
        className: "packet-dot downlink",
        html: "<div></div>",
        iconSize: [8, 8],
        iconAnchor: [4, 4],
      })

      L.marker([downlinkLat, downlinkLng], { icon: downlinkIcon }).addTo(map)
    })
  }, [satellites, animationFrame])

  return <div ref={mapRef} className="w-full h-[500px] rounded-md overflow-hidden" />
}

