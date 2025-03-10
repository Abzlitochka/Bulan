"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowUpDown, ChevronDown, Search, ArrowUp, ArrowDown, CheckCircle2, XCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface PacketStatsProps {
  satellites: any[]
  isLoading: boolean
}

export default function PacketStats({ satellites, isLoading }: PacketStatsProps) {
  const [sortField, setSortField] = useState<string>("id")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [searchQuery, setSearchQuery] = useState<string>("")

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const filteredSatellites = satellites.filter((satellite) =>
    `BULAN-${satellite.id}`.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const sortedSatellites = [...filteredSatellites].sort((a, b) => {
    let aValue, bValue

    switch (sortField) {
      case "id":
        aValue = a.id
        bValue = b.id
        break
      case "packetsDelivered":
        aValue = a.packetsDelivered
        bValue = b.packetsDelivered
        break
      case "packetsLost":
        aValue = a.packetsLost
        bValue = b.packetsLost
        break
      case "deliveryRate":
        aValue = a.packetsDelivered / (a.packetsDelivered + a.packetsLost)
        bValue = b.packetsDelivered / (b.packetsDelivered + b.packetsLost)
        break
      default:
        aValue = a.id
        bValue = b.id
    }

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
    return 0
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search satellites..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Sort by <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleSort("id")}>
              Satellite ID
              {sortField === "id" &&
                (sortDirection === "asc" ? (
                  <ArrowUp className="ml-2 h-4 w-4" />
                ) : (
                  <ArrowDown className="ml-2 h-4 w-4" />
                ))}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSort("packetsDelivered")}>
              Packets Delivered
              {sortField === "packetsDelivered" &&
                (sortDirection === "asc" ? (
                  <ArrowUp className="ml-2 h-4 w-4" />
                ) : (
                  <ArrowDown className="ml-2 h-4 w-4" />
                ))}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSort("packetsLost")}>
              Packets Lost
              {sortField === "packetsLost" &&
                (sortDirection === "asc" ? (
                  <ArrowUp className="ml-2 h-4 w-4" />
                ) : (
                  <ArrowDown className="ml-2 h-4 w-4" />
                ))}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSort("deliveryRate")}>
              Delivery Rate
              {sortField === "deliveryRate" &&
                (sortDirection === "asc" ? (
                  <ArrowUp className="ml-2 h-4 w-4" />
                ) : (
                  <ArrowDown className="ml-2 h-4 w-4" />
                ))}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">
                <Button variant="ghost" className="p-0 font-medium" onClick={() => handleSort("id")}>
                  Satellite ID
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" className="p-0 font-medium" onClick={() => handleSort("packetsDelivered")}>
                  Packets Delivered
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" className="p-0 font-medium" onClick={() => handleSort("packetsLost")}>
                  Packets Lost
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="text-right">
                <Button variant="ghost" className="p-0 font-medium" onClick={() => handleSort("deliveryRate")}>
                  Delivery Rate
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedSatellites.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No satellites found.
                </TableCell>
              </TableRow>
            ) : (
              sortedSatellites.map((satellite) => {
                const deliveryRate = satellite.packetsDelivered / (satellite.packetsDelivered + satellite.packetsLost)
                const deliveryRatePercent = (deliveryRate * 100).toFixed(2)

                let statusColor = "text-red-500"
                if (deliveryRate > 0.95) {
                  statusColor = "text-green-500"
                } else if (deliveryRate > 0.8) {
                  statusColor = "text-yellow-500"
                }

                return (
                  <TableRow key={satellite.id}>
                    <TableCell className="font-medium">BULAN-{satellite.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        {satellite.packetsDelivered.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-500" />
                        {satellite.packetsLost.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="space-y-1">
                        <div className={`font-medium ${statusColor}`}>{deliveryRatePercent}%</div>
                        <Progress
                          value={Number.parseFloat(deliveryRatePercent)}
                          className={`h-2 ${
                            deliveryRate > 0.95 ? "bg-green-100" : deliveryRate > 0.8 ? "bg-yellow-100" : "bg-red-100"
                          }`}
                          indicatorClassName={
                            deliveryRate > 0.95 ? "bg-green-500" : deliveryRate > 0.8 ? "bg-yellow-500" : "bg-red-500"
                          }
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

