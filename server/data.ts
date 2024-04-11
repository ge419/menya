export const possibleIngredients = ["strawberry", "milk", "banana"];

export interface DraftOrder {
  customerId: string;
  ingredients: string[];
}

export interface Order extends DraftOrder {
  _id: string;
  state: "draft" | "queued" | "blending" | "done";
  operatorId?: string;
}

export interface Customer {
  _id: string;
  name: string;
}

export interface CustomerWithOrders extends Customer {
  orders: Order[];
}

export interface Operator {
  _id: string;
  name: string;
}

export interface Product {
  _id: string;
  name: string;
  origin: string;
  company: string;
  avgRating: number;
  description: string;
  tags: Tag[];
  reviews: Review[];
}

export interface Tag {
  word: string;
}

export interface Review {
  _id: string;
  userId: string;
  productId: string;
  rating: number;
  buyAgain: boolean;
  text: string;
  tags: Tag[];
}

export interface Order {
  _id: string;
  userId: string;
  status: "draft" | "paid";
  totalCost: number;
}
