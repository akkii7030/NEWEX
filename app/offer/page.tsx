"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Navbar from "@/components/navbar"
import Link from "next/link"
import { Building2 } from "lucide-react"

const offers = [
	{
		id: 1,
		title: "Zero Brokerage Offer",
		description:
			"List your property with us and pay zero brokerage on your first deal!",
		validTill: "30 June 2025",
	},
	{
		id: 2,
		title: "Premium Listing Discount",
		description: "Get 50% off on premium listing for new users.",
		validTill: "15 July 2025",
	},
	{
		id: 3,
		title: "Free Property Valuation",
		description: "Book a free property valuation with our experts.",
		validTill: "31 July 2025",
	},
]

export default function OfferPage() {
	return (
		<div className="min-h-screen bg-gray-50">
			<Navbar />
			<header>
				<Link
					href="/offer"
					className="flex items-center space-x-2 focus:outline-none"
					aria-label="Go to Offers"
				>
					<Building2 className="h-8 w-8 text-orange-600" />
					<span className="text-2xl font-bold text-gray-900">
						RealEstate Pro
					</span>
				</Link>
			</header>
			<div>Offer Page</div>
			<div>
				{offers.map((offer) => (
					<div key={offer.id}>
						<h2>{offer.title}</h2>
						<p>{offer.description}</p>
						<span>{offer.validTill}</span>
					</div>
				))}
			</div>
		</div>
	)
}