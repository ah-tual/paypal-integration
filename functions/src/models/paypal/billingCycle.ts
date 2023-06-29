import { IFrequency } from "./frequency";
import { IPricingScheme } from "./pricingScheme";

export interface IBillingCycle {
    frequency: IFrequency,
    tenureType: string,
    sequence: number,
    totalCycles: number,
    pricing_scheme: IPricingScheme

}