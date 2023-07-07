import { IAmount } from "../models/paypal/amount";
import { IBillingInfo } from "../models/paypal/billingInfo";
import { ILink } from "../models/paypal/link";
import { ISubcriber } from "../models/paypal/subscriber";
import { ISubscription } from "../models/paypal/subscription";

export class Response implements ISubscription {
    id: string = '';
    planId: string = '';
    startTime: string = '';
    quantity: string = '';
    subscriber: ISubcriber = <ISubcriber>{};
    billingInfo: IBillingInfo = <IBillingInfo>{};
    shippingAmount: IAmount = <IAmount>{};
    createTime: string = '';
    updateTime: string = '';
    status: string = '';
    statusUpdateTime: string = '';
    statusChangeNote?: string = '';
    planOverridden: boolean = false;
    links: ILink[] = [];
    
}