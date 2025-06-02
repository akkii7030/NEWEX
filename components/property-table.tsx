import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Trash } from "lucide-react";

interface ResaleProperty {
  id?: string;
  station: string;
  developerName: string;
  projectName: string;
  storey: number;
  flatType: string;
  saleableArea: number;
  reraCarpet: number;
  pfsRate: number;
  avRate: number;
  flatValue: number;
  agreementValue: number;
  floor: number;
  totalAv: number;
  stampDuty: number;
  registration: number;
  gst: number;
  totalPackage: number;
  type: string;
  mahaReraNumber: string;
  possession: string;
  subLocation: string;
  landParcel: string;
  towers: string;
  cashAmount: number;
  floorRise: string;
  floorRisePerFlr: number;
  fixedComponent: string;
  possessionCharges: number;
  parkingCharge: number;
  finalPackage: number;
  isCosmo: boolean;
  amenities: string;
  highlights: string;
  paymentScheme: string;
  availability: string;
  timestamp?: string;
}

interface RentalProperty {
  id?: string;
  buildingSocietyName: string;
  connectedPerson: string;
  cosmo: string;
  expectedPrice: number;
  roadLocation: string;
  station: string;
  status: string;
  directBroker: string;
  tarreceGallery: string;
  zone: string;
  type: string;
  timestamp?: string;
}

type Property = ResaleProperty | RentalProperty;

interface PropertyTableProps {
  properties: Property[];
  onDelete: (id?: string) => void;
}

export default function PropertyTable({ properties, onDelete }: PropertyTableProps) {
  if (properties.length === 0) {
    return <div>No properties found.</div>;
  }

  const isResale = properties[0]?.type === "resale";

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/50">
          {isResale ? (
            <>
              <TableHead>Project/Society</TableHead>
              <TableHead>Flat Type</TableHead>
              <TableHead>Station</TableHead>
              <TableHead>Total Package</TableHead>
              <TableHead>Possession</TableHead>
              <TableHead>Agreement Value</TableHead>
              <TableHead>Amenities</TableHead>
              <TableHead>AV Rate</TableHead>
              <TableHead>Availability</TableHead>
              <TableHead>Cash Amount</TableHead>
              <TableHead>Developer</TableHead>
              <TableHead>Final Package</TableHead>
              <TableHead>Fixed Component</TableHead>
              <TableHead>Flat Value</TableHead>
              <TableHead>Floor</TableHead>
              <TableHead>Floor Rise</TableHead>
              <TableHead>Rise/Floor</TableHead>
              <TableHead>GST (%)</TableHead>
              <TableHead>Highlights</TableHead>
              <TableHead>Cosmo Member</TableHead>
              <TableHead>Land Parcel</TableHead>
              <TableHead>MahaRERA</TableHead>
              <TableHead>Parking Charge</TableHead>
              <TableHead>Payment Scheme</TableHead>
              <TableHead>PFS Rate</TableHead>
              <TableHead>Possession Charges</TableHead>
              <TableHead>Registration</TableHead>
              <TableHead>RERA Carpet</TableHead>
              <TableHead>Saleable Area</TableHead>
              <TableHead>Stamp Duty</TableHead>
              <TableHead>Storey</TableHead>
              <TableHead>Sub Location</TableHead>
              <TableHead>Timestamp</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </>
          ) : (
            <>
              <TableHead>Building Society</TableHead>
              <TableHead>Connected Person</TableHead>
              <TableHead>Cosmo</TableHead>
              <TableHead>Expected Price</TableHead>
              <TableHead>Road Location</TableHead>
              <TableHead>Station</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Direct Broker</TableHead>
              <TableHead>Tarrece Gallery</TableHead>
              <TableHead>Zone</TableHead>
              <TableHead>Timestamp</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {properties.map((property) => (
          <TableRow key={property.id}>
            {isResale ? (
              <>
                <TableCell>{(property as ResaleProperty).projectName}</TableCell>
                <TableCell>{(property as ResaleProperty).flatType}</TableCell>
                <TableCell>{property.station}</TableCell>
                <TableCell>{(property as ResaleProperty).totalPackage?.toLocaleString()}</TableCell>
                <TableCell>{(property as ResaleProperty).possession}</TableCell>
                <TableCell>{(property as ResaleProperty).agreementValue?.toLocaleString()}</TableCell>
                <TableCell>{(property as ResaleProperty).amenities}</TableCell>
                <TableCell>{(property as ResaleProperty).avRate}</TableCell>
                <TableCell>{(property as ResaleProperty).availability}</TableCell>
                <TableCell>{(property as ResaleProperty).cashAmount?.toLocaleString()}</TableCell>
                <TableCell>{(property as ResaleProperty).developerName}</TableCell>
                <TableCell>{(property as ResaleProperty).finalPackage?.toLocaleString()}</TableCell>
                <TableCell>{(property as ResaleProperty).fixedComponent}</TableCell>
                <TableCell>{(property as ResaleProperty).flatValue?.toLocaleString()}</TableCell>
                <TableCell>{(property as ResaleProperty).floor}</TableCell>
                <TableCell>{(property as ResaleProperty).floorRise}</TableCell>
                <TableCell>{(property as ResaleProperty).floorRisePerFlr}</TableCell>
                <TableCell>{(property as ResaleProperty).gst}%</TableCell>
                <TableCell>{(property as ResaleProperty).highlights}</TableCell>
                <TableCell>{(property as ResaleProperty).isCosmo ? "Yes" : "No"}</TableCell>
                <TableCell>{(property as ResaleProperty).landParcel}</TableCell>
                <TableCell>{(property as ResaleProperty).mahaReraNumber}</TableCell>
                <TableCell>{(property as ResaleProperty).parkingCharge?.toLocaleString()}</TableCell>
                <TableCell>{(property as ResaleProperty).paymentScheme}</TableCell>
                <TableCell>{(property as ResaleProperty).pfsRate}</TableCell>
                <TableCell>{(property as ResaleProperty).possessionCharges?.toLocaleString()}</TableCell>
                <TableCell>{(property as ResaleProperty).registration}</TableCell>
                <TableCell>{(property as ResaleProperty).reraCarpet}</TableCell>
                <TableCell>{(property as ResaleProperty).saleableArea}</TableCell>
                <TableCell>{(property as ResaleProperty).stampDuty?.toLocaleString()}</TableCell>
                <TableCell>{(property as ResaleProperty).storey}</TableCell>
                <TableCell>{(property as ResaleProperty).subLocation}</TableCell>
                <TableCell>{new Date(property.timestamp || "").toLocaleDateString()}</TableCell>
              </>
            ) : (
              <>
                <TableCell>{(property as RentalProperty).buildingSocietyName}</TableCell>
                <TableCell>{(property as RentalProperty).connectedPerson}</TableCell>
                <TableCell>{(property as RentalProperty).cosmo}</TableCell>
                <TableCell>{(property as RentalProperty).expectedPrice?.toLocaleString()}</TableCell>
                <TableCell>{(property as RentalProperty).roadLocation}</TableCell>
                <TableCell>{property.station}</TableCell>
                <TableCell>{(property as RentalProperty).status}</TableCell>
                <TableCell>{(property as RentalProperty).directBroker}</TableCell>
                <TableCell>{(property as RentalProperty).tarreceGallery}</TableCell>
                <TableCell>{(property as RentalProperty).zone}</TableCell>
                <TableCell>{new Date(property.timestamp || "").toLocaleDateString()}</TableCell>
              </>
            )}
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="default" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="flex items-center gap-2 text-red-500"
                    onClick={() => onDelete(property.id)}
                  >
                    <Trash className="h-4 w-4" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
