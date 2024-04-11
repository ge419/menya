export const possibleIngredients = ["strawberry", "milk", "banana"];

export interface DraftOrder {
  customerId: string;
  ingredients: string[];
}

export interface StringIdDocument {
  _id: string;
}

export interface Order extends DraftOrder, StringIdDocument {
  state: "draft" | "queued" | "blending" | "done";
  operatorId?: string;
}

export interface Customer extends StringIdDocument {
  name: string;
}

export interface CustomerWithOrders extends Customer {
  orders: Order[];
}

export interface OperatorWithOrders extends Operator {
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
  _id: string;
  word: string;
}

export interface Review {
  _id: string;
  userId: string;
  productId: string;
  rating: number;
  buyAgain: boolean;
  text: string;
  rags: Tag[];
}

export interface Order {
  _id: string;
  userId: string;
  status: "draft" | "paid";
  totalCost: number;
}
