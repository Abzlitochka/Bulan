"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Satellite, Signal, PackageCheck, PackageX, Globe, Activity, Map } from "lucide-react"
import SatelliteMap from "@/components/satellite-map"
import InteractiveMap from "@/components/interactive-map"
import PacketStats from "@/components/packet-stats"
import { getSatelliteData } from "@/lib/satellite-data"

export default function Dashboard() {
  const [satelliteData, setSatelliteData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getSatelliteData()
        setSatelliteData(data)
        setIsLoading(false)
      } catch (error) {
        console.error("Failed to fetch satellite data:", error)
        setIsLoading(false)
      }
    }

    fetchData()
    // Refresh data every 30 seconds
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  const totalPackets = satelliteData.reduce((sum, sat) => sum + sat.packetsDelivered + sat.packetsLost, 0)
  const deliveredPackets = satelliteData.reduce((sum, sat) => sum + sat.packetsDelivered, 0)
  const lostPackets = satelliteData.reduce((sum, sat) => sum + sat.packetsLost, 0)
  const deliveryRate = totalPackets > 0 ? ((deliveredPackets / totalPackets) * 100).toFixed(2) : "0.00"

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Satellite className="h-6 w-6" />
            <h1 className="text-xl font-bold">BULAN Dashboard</h1>
            <Badge variant="outline" className="ml-2">
              For all time, for all humankind
            </Badge>
          </div>
          <nav className="flex items-center gap-4">
            <a href="#" className="text-sm font-medium hover:underline">
              Documentation
            </a>
            <a href="#" className="text-sm font-medium hover:underline">
              About
            </a>
            <a href="#" className="text-sm font-medium hover:underline">
              Contact
            </a>
          </nav>
        </div>
      </header>

      <main className="flex-1 container py-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Satellites</CardTitle>
              <Satellite className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? "..." : satelliteData.length}</div>
              <p className="text-xs text-muted-foreground">BULAN nanosatellites in orbit</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Packets Delivered</CardTitle>
              <PackageCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? "..." : deliveredPackets.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Successfully transmitted packets</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Packets Lost</CardTitle>
              <PackageX className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? "..." : lostPackets.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Failed packet transmissions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? "..." : `${deliveryRate}%`}</div>
              <p className="text-xs text-muted-foreground">Overall transmission success rate</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="interactive-map" className="mt-6">
          <TabsList>
            <TabsTrigger value="interactive-map" className="flex items-center gap-2">
              <Map className="h-4 w-4" />
              Interactive Map
            </TabsTrigger>
            <TabsTrigger value="orbit-view" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Orbit View
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <Signal className="h-4 w-4" />
              Packet Statistics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="interactive-map" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>BULAN Nanosatellite Global Network</CardTitle>
                <CardDescription>Real-time positions and coverage areas of all BULAN nanosatellites</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <InteractiveMap satellites={satelliteData} isLoading={isLoading} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orbit-view" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>BULAN Nanosatellite Orbit View</CardTitle>
                <CardDescription>3D visualization of satellite orbits around Earth</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="aspect-video w-full">
                  <SatelliteMap satellites={satelliteData} isLoading={isLoading} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Packet Delivery Statistics</CardTitle>
                <CardDescription>Detailed breakdown of packet delivery performance by satellite</CardDescription>
              </CardHeader>
              <CardContent>
                <PacketStats satellites={satelliteData} isLoading={isLoading} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t py-4">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} BULAN Project. All rights reserved.
          </p>
          <p className="text-center text-sm text-muted-foreground">"For all time, for all humankind"</p>
        </div>
      </footer>
    </div>
  )
}

