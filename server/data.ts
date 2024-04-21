import { StringLiteral } from "typescript";

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

export interface Product {
  _id: string;
  name: string;
  price: number;
  origin: string;
  company: string;
  avgRating?: number;
  description: string;
  tags?: Tag[];
  // reviews: Review[];
}

export interface CartProduct {
  product: Product;
  quantity: number;
}

export interface Cart {
  _id?: string;
  userId: string;
  products: CartProduct[];
  status: "draft" | "paid";
  totalCost?: number;
  address?: string;
  telephone?: string;
  name?: string;
}

export interface User {
  _id?: string;
  name: string;
  username: string;
  email: string;
  address: string;
  telephone: string;
}
