import { IBillingCycle } from "./billingCycle";
import { ILink } from "./link";

export interface IPlan {
    id: string,
    product_id: string,
    name: string,
    description: string,
    status: string,
    billingCycles: IBillingCycle[]
    links: ILink[]
}