import { IBillingCycle } from "./billingCycle";
import { ILink } from "./link";
import { ITaxes } from "./taxes";

export interface IPlan {
    id: string,
    product_id: string,
    name: string,
    description: string,
    status: string,
    billingCycles: IBillingCycle[]
    taxes: ITaxes,
    create_time: string,
    update_time: string,
    links: ILink[]
}