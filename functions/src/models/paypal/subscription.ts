import { IAmount } from "./amount";
import { IBillingInfo } from "./billingInfo";
import { ILink } from "./link";
import { ISubcriber } from "./subscriber";

export interface ISubscription {
    id: string, 
    planId: string,
    planOverridden: boolean,
    startTime: string,
    quantity: string,
    shippingAmount: IAmount,
    subscriber: ISubcriber,
    billingInfo: IBillingInfo,
    createTime: string,
    updateTime: string,
    status: string,
    statusUpdateTime: string,
    links: ILink[]
}