export type StoreMenuItem = {
  id: number;
  slug: string;
  title: string;
  description: string;
  priceKobo: number;
  imagePath: string;
  isSpicy: boolean;
  isVegan: boolean;
  isAvailable: boolean;
};

export type CartLine = {
  item: StoreMenuItem;
  quantity: number;
};

export type FulfillmentType = "delivery" | "pickup";

export type OrderStatus = "pending" | "preparing" | "dispatched" | "completed" | "cancelled";
