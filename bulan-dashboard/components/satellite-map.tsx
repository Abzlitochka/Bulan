"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Satellite, Info, ArrowUpRight, ArrowDownRight, Clock, PackageCheck, PackageX } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

interface SatelliteMapProps {
  satellites: any[]
  isLoading: boolean
}

export default function SatelliteMap({ satellites, isLoading }: SatelliteMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [selectedSatellite, setSelectedSatellite] = useState<any | null>(null)
  const [hoveredSatellite, setHoveredSatellite] = useState<any | null>(null)
  const animationRef = useRef<number | null>(null)
  const earthImageRef = useRef<HTMLImageElement | null>(null)
  const starsImageRef = useRef<HTMLImageElement | null>(null)
  const [rotation, setRotation] = useState(0)

  useEffect(() => {
    const earthImage = new Image()
    earthImage.crossOrigin = "anonymous"
    earthImage.src = "https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
    earthImage.onload = () => {
      earthImageRef.current = earthImage
    }

    const starsImage = new Image()
    starsImage.crossOrigin = "anonymous"
    starsImage.src = "https://unpkg.com/three-globe/example/img/night-sky.png"
    starsImage.onload = () => {
      starsImageRef.current = starsImage
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const animate = () => {
      setRotation((prev) => (prev + 0.1) % 360)
      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (isLoading || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const earthRadius = Math.min(centerX, centerY) * 0.5

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (starsImageRef.current) {
      ctx.drawImage(starsImageRef.current, 0, 0, canvas.width, canvas.height)
    } else {
      drawStars(ctx, canvas.width, canvas.height)
    }

    drawEarth(ctx, centerX, centerY, earthRadius, rotation)

    satellites.forEach((satellite) => {
      const orbitRadius = earthRadius + 20 + (satellite.id % 3) * 15

      ctx.beginPath()
      ctx.arc(centerX, centerY, orbitRadius, 0, Math.PI * 2)
      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)"
      ctx.stroke()
    })

    satellites.forEach((satellite) => {
      const isSelected = selectedSatellite && selectedSatellite.id === satellite.id
      const isHovered = hoveredSatellite && hoveredSatellite.id === satellite.id

      const orbitProgress = (rotation / 360 + satellite.id * 0.1) % 1
      const angle = orbitProgress * Math.PI * 2

      const orbitRadius = earthRadius + 20 + (satellite.id % 3) * 15

      const inclination = ((satellite.id % 4) * Math.PI) / 8

      const x = centerX + Math.cos(angle) * orbitRadius * Math.cos(inclination)
      const y = centerY + Math.sin(angle) * orbitRadius

      drawSatellite(ctx, x, y, satellite, isSelected, isHovered)

      if (isSelected || isHovered) {
        drawPacketTransmission(ctx, x, y, centerX, centerY, satellite)
      }
    })

    const handleCanvasClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      let clickedSatellite = null
      for (const satellite of satellites) {
        const orbitProgress = (rotation / 360 + satellite.id * 0.1) % 1
        const angle = orbitProgress * Math.PI * 2
        const orbitRadius = earthRadius + 20 + (satellite.id % 3) * 15
        const inclination = ((satellite.id % 4) * Math.PI) / 8

        const satX = centerX + Math.cos(angle) * orbitRadius * Math.cos(inclination)
        const satY = centerY + Math.sin(angle) * orbitRadius

        const distance = Math.sqrt(Math.pow(x - satX, 2) + Math.pow(y - satY, 2))
        if (distance < 10) {
          clickedSatellite = satellite
          break
        }
      }

      setSelectedSatellite(clickedSatellite)
    }

    const handleCanvasMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      let hovered = null
      for (const satellite of satellites) {
        const orbitProgress = (rotation / 360 + satellite.id * 0.1) % 1
        const angle = orbitProgress * Math.PI * 2
        const orbitRadius = earthRadius + 20 + (satellite.id % 3) * 15
        const inclination = ((satellite.id % 4) * Math.PI) / 8

        const satX = centerX + Math.cos(angle) * orbitRadius * Math.cos(inclination)
        const satY = centerY + Math.sin(angle) * orbitRadius

        const distance = Math.sqrt(Math.pow(x - satX, 2) + Math.pow(y - satY, 2))
        if (distance < 10) {
          hovered = satellite
          break
        }
      }

      setHoveredSatellite(hovered)
    }

    canvas.addEventListener("click", handleCanvasClick)
    canvas.addEventListener("mousemove", handleCanvasMouseMove)

    return () => {
      canvas.removeEventListener("click", handleCanvasClick)
      canvas.removeEventListener("mousemove", handleCanvasMouseMove)
    }
  }, [satellites, isLoading, selectedSatellite, hoveredSatellite, rotation])

  function drawStars(ctx: CanvasRenderingContext2D, width: number, height: number) {
    ctx.fillStyle = "#000"
    ctx.fillRect(0, 0, width, height)

    ctx.fillStyle = "#fff"
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * width
      const y = Math.random() * height
      const radius = Math.random() * 1.5
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  function drawEarth(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    radius: number,
    rotation: number,
  ) {
    ctx.save()
    ctx.translate(centerX, centerY)

    const gradient = ctx.createRadialGradient(radius * 0.2, -radius * 0.2, 0, 0, 0, radius)
    gradient.addColorStop(0, "rgba(0, 0, 0, 0)")
    gradient.addColorStop(1, "rgba(0, 0, 0, 0.7)")

    if (earthImageRef.current && earthImageRef.current.complete && earthImageRef.current.naturalHeight !== 0) {
      ctx.beginPath()
      ctx.arc(0, 0, radius, 0, Math.PI * 2)
      ctx.clip()

      ctx.rotate((rotation * Math.PI) / 180)
      ctx.drawImage(earthImageRef.current, -radius, -radius, radius * 2, radius * 2)

      ctx.globalCompositeOperation = "multiply"
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(0, 0, radius, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalCompositeOperation = "source-over"
    } else {
      // Fallback if image isn't loaded
      const earthGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius)
      earthGradient.addColorStop(0, "#1E40AF")
      earthGradient.addColorStop(0.8, "#3B82F6")
      earthGradient.addColorStop(1, "#93C5FD")

      ctx.beginPath()
      ctx.arc(0, 0, radius, 0, Math.PI * 2)
      ctx.fillStyle = earthGradient
      ctx.fill()

      ctx.fillStyle = "#15803D"
      ctx.rotate((rotation * Math.PI) / 180)

      ctx.beginPath()
      ctx.ellipse(radius * 0.1, 0, radius * 0.25, radius * 0.4, 0, 0, Math.PI * 2)
      ctx.fill()

      ctx.beginPath()
      ctx.ellipse(-radius * 0.1, -radius * 0.2, radius * 0.4, radius * 0.25, 0, 0, Math.PI * 2)
      ctx.fill()

      ctx.beginPath()
      ctx.ellipse(-radius * 0.5, 0, radius * 0.2, radius * 0.4, 0, 0, Math.PI * 2)
      ctx.fill()

      ctx.beginPath()
      ctx.ellipse(-radius * 0.3, radius * 0.3, radius * 0.15, radius * 0.1, 0, 0, Math.PI * 2)
      ctx.fill()
    }

    ctx.restore()
  }

  function drawSatellite(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    satellite: any,
    isSelected: boolean,
    isHovered: boolean,
  ) {
    const deliveryRate = satellite.packetsDelivered / (satellite.packetsDelivered + satellite.packetsLost)
    let color

    if (deliveryRate > 0.95) {
      color = "#22C55E"
    } else if (deliveryRate > 0.8) {
      color = "#EAB308"
    } else {
      color = "#EF4444"
    }

    if (isSelected || isHovered) {
      ctx.beginPath()
      ctx.arc(x, y, 12, 0, Math.PI * 2)
      ctx.fillStyle = `${color}33`
      ctx.fill()
    }

    ctx.beginPath()
    ctx.arc(x, y, isSelected || isHovered ? 8 : 6, 0, Math.PI * 2)

    if (isSelected) {
      ctx.strokeStyle = "#FFFFFF"
      ctx.lineWidth = 2
      ctx.fillStyle = color
      ctx.fill()
      ctx.stroke()
    } else if (isHovered) {
      ctx.fillStyle = color
      ctx.strokeStyle = "#FFFFFF"
      ctx.lineWidth = 1
      ctx.fill()
      ctx.stroke()
    } else {
      ctx.fillStyle = color
      ctx.fill()
    }

    if (isSelected || isHovered) {
      ctx.font = "12px Arial"
      ctx.fillStyle = "#FFFFFF"
      ctx.textAlign = "center"
      ctx.fillText(`BULAN-${satellite.id}`, x, y - 15)

      ctx.font = "10px Arial"
      ctx.fillText(`${(deliveryRate * 100).toFixed(1)}%`, x, y + 15)
    }
  }

  function drawPacketTransmission(
    ctx: CanvasRenderingContext2D,
    satX: number,
    satY: number,
    earthX: number,
    earthY: number,
    satellite: any,
  ) {
    const time = Date.now() / 1000
    const packetProgress = (time * 2) % 1

    const uplinkColor = "#3B82F6"
    ctx.strokeStyle = uplinkColor
    ctx.setLineDash([5, 5])
    ctx.beginPath()
    ctx.moveTo(earthX, earthY)
    ctx.lineTo(satX, satY)
    ctx.stroke()
    ctx.setLineDash([])

    const uplinkX = earthX + (satX - earthX) * packetProgress
    const uplinkY = earthY + (satY - earthY) * packetProgress

    ctx.beginPath()
    ctx.arc(uplinkX, uplinkY, 3, 0, Math.PI * 2)
    ctx.fillStyle = uplinkColor
    ctx.fill()

    const downlinkColor = "#22C55E"
    ctx.strokeStyle = downlinkColor
    ctx.setLineDash([5, 5])
    ctx.beginPath()
    ctx.moveTo(satX, satY)
    ctx.lineTo(earthX, earthY)
    ctx.stroke()
    ctx.setLineDash([])

    const downlinkProgress = (packetProgress + 0.5) % 1
    const downlinkX = satX + (earthX - satX) * downlinkProgress
    const downlinkY = satY + (earthY - satY) * downlinkProgress

    ctx.beginPath()
    ctx.arc(downlinkX, downlinkY, 3, 0, Math.PI * 2)
    ctx.fillStyle = downlinkColor
    ctx.fill()

    const packetsPerSecond = Math.floor(5 + satellite.id * 2 + Math.sin(time) * 3)

    ctx.font = "10px Arial"
    ctx.fillStyle = "#FFFFFF"
    ctx.textAlign = "center"
    ctx.fillText(`${packetsPerSecond} pkts/s`, (satX + earthX) / 2, (satY + earthY) / 2 - 10)
  }

  if (isLoading) {
    return <Skeleton className="w-full h-full min-h-[400px]" />
  }

  return (
    <div className="relative w-full h-full">
      <canvas ref={canvasRef} className="w-full h-full min-h-[500px]" />

      {selectedSatellite && (
        <Card className="absolute bottom-4 right-4 w-80 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Satellite className="h-5 w-5" />
              <h3 className="text-lg font-medium">BULAN-{selectedSatellite.id}</h3>
              <Badge
                variant={
                  selectedSatellite.packetsDelivered /
                    (selectedSatellite.packetsDelivered + selectedSatellite.packetsLost) >
                  0.95
                    ? "success"
                    : selectedSatellite.packetsDelivered /
                          (selectedSatellite.packetsDelivered + selectedSatellite.packetsLost) >
                        0.8
                      ? "warning"
                      : "destructive"
                }
              >
                {selectedSatellite.packetsDelivered /
                  (selectedSatellite.packetsDelivered + selectedSatellite.packetsLost) >
                0.95
                  ? "Healthy"
                  : selectedSatellite.packetsDelivered /
                        (selectedSatellite.packetsDelivered + selectedSatellite.packetsLost) >
                      0.8
                    ? "Warning"
                    : "Critical"}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm mb-3">
              <div className="space-y-1">
                <div className="text-muted-foreground">Latitude:</div>
                <div className="font-medium">{selectedSatellite.latitude.toFixed(2)}°</div>
              </div>

              <div className="space-y-1">
                <div className="text-muted-foreground">Longitude:</div>
                <div className="font-medium">{selectedSatellite.longitude.toFixed(2)}°</div>
              </div>

              <div className="space-y-1">
                <div className="text-muted-foreground">Altitude:</div>
                <div className="font-medium">{selectedSatellite.altitude.toFixed(1)} km</div>
              </div>

              <div className="space-y-1">
                <div className="text-muted-foreground">Orbital Period:</div>
                <div className="font-medium">{(90 + selectedSatellite.id * 2).toFixed(1)} min</div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Packet Statistics</h4>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-1">
                  <ArrowUpRight className="h-4 w-4 text-blue-500" />
                  <span>Uplink Rate:</span>
                </div>
                <div className="font-medium">{(10 + selectedSatellite.id * 2).toFixed(1)} pkts/s</div>

                <div className="flex items-center gap-1">
                  <ArrowDownRight className="h-4 w-4 text-green-500" />
                  <span>Downlink Rate:</span>
                </div>
                <div className="font-medium">{(8 + selectedSatellite.id * 1.5).toFixed(1)} pkts/s</div>

                <div className="flex items-center gap-1">
                  <PackageCheck className="h-4 w-4 text-green-500" />
                  <span>Delivered:</span>
                </div>
                <div className="font-medium">{selectedSatellite.packetsDelivered.toLocaleString()}</div>

                <div className="flex items-center gap-1">
                  <PackageX className="h-4 w-4 text-red-500" />
                  <span>Lost:</span>
                </div>
                <div className="font-medium">{selectedSatellite.packetsLost.toLocaleString()}</div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Delivery Rate:</span>
                  <span className="font-medium">
                    {(
                      (selectedSatellite.packetsDelivered /
                        (selectedSatellite.packetsDelivered + selectedSatellite.packetsLost)) *
                      100
                    ).toFixed(2)}
                    %
                  </span>
                </div>
                <Progress
                  value={
                    (selectedSatellite.packetsDelivered /
                      (selectedSatellite.packetsDelivered + selectedSatellite.packetsLost)) *
                    100
                  }
                  className="h-2"
                />
              </div>

              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Last updated: {new Date(selectedSatellite.lastUpdated).toLocaleTimeString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="absolute top-4 right-4 p-2 rounded-full bg-background/80 hover:bg-background">
              <Info className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-sm">
              Click on a satellite to view detailed information.
              <br />
              Green = Good delivery rate ({">"}95%)
              <br />
              Yellow = Warning (80-95%)
              <br />
              Red = Poor delivery rate (&lt;80%)
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}

