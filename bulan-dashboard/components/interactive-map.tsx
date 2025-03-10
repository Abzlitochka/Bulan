"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Satellite } from "lucide-react"
import dynamic from "next/dynamic"

// Types for TypeScript
interface InteractiveMapProps {
  satellites: any[]
  isLoading: boolean
}

// Create a client-side only version of the map component
const MapComponent = dynamic(() => import("./map-component"), {
  ssr: false,
  loading: () => <Skeleton className="w-full h-[500px]" />,
})

export default function InteractiveMap({ satellites, isLoading }: InteractiveMapProps) {
  const [selectedSatellite, setSelectedSatellite] = useState<any | null>(null)

  if (isLoading) {
    return <Skeleton className="w-full h-[500px]" />
  }

  return (
    <div className="relative w-full h-full">
      <MapComponent satellites={satellites} onSelectSatellite={setSelectedSatellite} />

      {selectedSatellite && (
        <Card className="absolute bottom-4 right-4 w-64 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Satellite className="h-4 w-4" />
              <h3 className="font-medium">BULAN-{selectedSatellite.id}</h3>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-muted-foreground">Latitude:</div>
              <div>{selectedSatellite.latitude.toFixed(2)}°</div>

              <div className="text-muted-foreground">Longitude:</div>
              <div>{selectedSatellite.longitude.toFixed(2)}°</div>

              <div className="text-muted-foreground">Altitude:</div>
              <div>{selectedSatellite.altitude.toFixed(1)} km</div>

              <div className="text-muted-foreground">Packets Delivered:</div>
              <div>{selectedSatellite.packetsDelivered.toLocaleString()}</div>

              <div className="text-muted-foreground">Packets Lost:</div>
              <div>{selectedSatellite.packetsLost.toLocaleString()}</div>

              <div className="text-muted-foreground">Delivery Rate:</div>
              <div>
                {(
                  (selectedSatellite.packetsDelivered /
                    (selectedSatellite.packetsDelivered + selectedSatellite.packetsLost)) *
                  100
                ).toFixed(2)}
                %
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

