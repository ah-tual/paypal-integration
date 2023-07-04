import { IAmount } from "../models/paypal/amount";
import { IBillingInfo } from "../models/paypal/billingInfo";
import { ILink } from "../models/paypal/link";
import { ISubcriber } from "../models/paypal/subscriber";

export interface IResponse {
    id: string, 
    planId: string,
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