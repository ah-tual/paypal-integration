import { IAmount } from "./amount";
import { IBillingInfo } from "./billingInfo";
import { ISubcriber } from "./subscriber";

export interface ISubscription {
    id: string, 
    planId: string,
    startTime: string,
    quantity: string,
    subscriber: ISubcriber,
    billingInfo: IBillingInfo,
    shippingAmount: IAmount,
    createTime: string,
    updateTime: string,
    status: string,
    statusUpdateTime: string,
    statusChangeNote?: string
}