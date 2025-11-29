export interface ShippingEstimate {
  carrier: string;
  service: string;
  cost: number;
  estimatedDays: number;
  estimatedDelivery: Date;
}

export function calculateShippingOptions(
  destination: { country: string; state?: string },
  subtotal: number
): ShippingEstimate[] {
  const options: ShippingEstimate[] = [];
  const today = new Date();

  if (subtotal >= 100) {
    options.push({
      carrier: "Free Shipping",
      service: "Standard",
      cost: 0,
      estimatedDays: destination.country === "US" ? 5 : 10,
      estimatedDelivery: addBusinessDays(today, destination.country === "US" ? 5 : 10)
    });
  }

  if (destination.country === "US") {
    options.push(
      {
        carrier: "USPS",
        service: "Ground",
        cost: 6.99,
        estimatedDays: 5,
        estimatedDelivery: addBusinessDays(today, 5)
      },
      {
        carrier: "USPS",
        service: "Priority",
        cost: 12.99,
        estimatedDays: 3,
        estimatedDelivery: addBusinessDays(today, 3)
      },
      {
        carrier: "FedEx",
        service: "2-Day",
        cost: 19.99,
        estimatedDays: 2,
        estimatedDelivery: addBusinessDays(today, 2)
      },
      {
        carrier: "FedEx",
        service: "Overnight",
        cost: 34.99,
        estimatedDays: 1,
        estimatedDelivery: addBusinessDays(today, 1)
      }
    );
  } else if (destination.country === "CA") {
    options.push(
      {
        carrier: "Canada Post",
        service: "Standard",
        cost: 14.99,
        estimatedDays: 7,
        estimatedDelivery: addBusinessDays(today, 7)
      },
      {
        carrier: "Canada Post",
        service: "Express",
        cost: 29.99,
        estimatedDays: 3,
        estimatedDelivery: addBusinessDays(today, 3)
      }
    );
  } else {
    options.push(
      {
        carrier: "International",
        service: "Standard",
        cost: 24.99,
        estimatedDays: 14,
        estimatedDelivery: addBusinessDays(today, 14)
      },
      {
        carrier: "International",
        service: "Express",
        cost: 49.99,
        estimatedDays: 7,
        estimatedDelivery: addBusinessDays(today, 7)
      }
    );
  }

  return options;
}

export function trackShipment(trackingNumber: string, carrier: string) {
  const trackingUrls: Record<string, string> = {
    USPS: `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`,
    FedEx: `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`,
    UPS: `https://www.ups.com/track?tracknum=${trackingNumber}`,
    DHL: `https://www.dhl.com/en/express/tracking.html?AWB=${trackingNumber}`,
    "Canada Post": `https://www.canadapost-postescanada.ca/track-reperage/en#/search?searchFor=${trackingNumber}`
  };

  return trackingUrls[carrier] || `https://www.google.com/search?q=${trackingNumber}+tracking`;
}

export function getShippingStatus(status: string): { label: string; color: string; icon: string } {
  const statuses: Record<string, { label: string; color: string; icon: string }> = {
    not_shipped: { label: "Not Shipped", color: "gray", icon: "📦" },
    processing: { label: "Processing", color: "blue", icon: "⚙️" },
    shipped: { label: "Shipped", color: "purple", icon: "🚚" },
    in_transit: { label: "In Transit", color: "yellow", icon: "🛫" },
    out_for_delivery: { label: "Out for Delivery", color: "orange", icon: "🚛" },
    delivered: { label: "Delivered", color: "green", icon: "✅" },
    failed: { label: "Delivery Failed", color: "red", icon: "❌" },
    returned: { label: "Returned", color: "red", icon: "↩️" }
  };

  return statuses[status] || statuses.not_shipped;
}

function addBusinessDays(date: Date, days: number): Date {
  const result = new Date(date);
  let addedDays = 0;

  while (addedDays < days) {
    result.setDate(result.getDate() + 1);
    const dayOfWeek = result.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      addedDays++;
    }
  }

  return result;
}

export function formatDeliveryDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  };
  return date.toLocaleDateString('en-US', options);
}
