import { IAmount } from "./amount";

export interface IPayment {
    amount: IAmount,
    time: string
}