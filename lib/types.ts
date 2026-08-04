export type Concert = {
  id: string;
  user_id: string;
  concert_name: string;
  artist: string;
  venue: string;
  city: string;
  state: string;
  concert_date: string;
  distance_from_home: number;
  hours_at_event: number;
  ticket_cost: number;
  ticket_fees: number;
  parking_cost: number;
  food_drink_cost: number;
  merchandise_cost: number;
  lodging_cost: number;
  travel_cost: number;
  other_cost: number;
  fun_rating: number;
  notes: string | null;
  created_at: string;
};

export type ConcertCosts = Pick<
  Concert,
  | "ticket_cost"
  | "ticket_fees"
  | "parking_cost"
  | "food_drink_cost"
  | "merchandise_cost"
  | "lodging_cost"
  | "travel_cost"
  | "other_cost"
>;

export const COST_FIELDS = [
  { key: "ticket_cost" as const, label: "Ticket cost" },
  { key: "ticket_fees" as const, label: "Ticket fees" },
  { key: "parking_cost" as const, label: "Parking cost" },
  { key: "food_drink_cost" as const, label: "Food and drink cost" },
  { key: "merchandise_cost" as const, label: "Merchandise cost" },
  { key: "lodging_cost" as const, label: "Hotel or lodging cost" },
  { key: "travel_cost" as const, label: "Travel or gas cost" },
  { key: "other_cost" as const, label: "Other cost" },
];

export const THEMES = [
  "light",
  "dark",
  "cupcake",
  "synthwave",
  "retro",
  "cyberpunk",
  "valentine",
  "aqua",
  "forest",
  "night",
] as const;

export type ThemeName = (typeof THEMES)[number];
