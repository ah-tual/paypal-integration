import { IBillingCycle } from "./billingCycle";
import { IPaymentPreferences } from "./paymentPreferences";
import { ITaxes } from "./taxes";

export interface IPlan {
    id: string,
    productId: string,
    name: string,
    description: string,
    status: string,
    billingCycles: IBillingCycle[],
    paymentPreferences?: IPaymentPreferences,
    taxes?: ITaxes,
    createTime: string,
    updateTime?: string
}