export type TrackingEvent = {
  at: string | null; // ISO string if possible
  title: string;
  location?: string | null;
  details?: string | null;
};

export type TrackingResult = {
  carrier: "CORREIOS";
  code: string;
  lastEventTitle: string | null;
  lastEventAt: string | null; // ISO
  isOutForDelivery: boolean;
  isDelivered: boolean;
  events: TrackingEvent[];
  // raw response for debugging (kept small)
  raw?: any;
};

