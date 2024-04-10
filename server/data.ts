export const possibleIngredients = [
  "strawberry",
  "milk",
  "banana",
]

export interface DraftOrder {
  customerId: string
  ingredients: string[]
}

export interface StringIdDocument {
  _id: string
}

export interface Order extends DraftOrder, StringIdDocument {
  state: "draft" | "queued" | "blending" | "done"
  operatorId?: string
}

export interface Customer extends StringIdDocument {
  name: string
}

export interface CustomerWithOrders extends Customer {
  orders: Order[]
}

export interface OperatorWithOrders extends Operator {
  orders: Order[]
}

export interface Operator {
  _id: string
  name: string
}