import { IFrequency } from "./frequency";

export interface IBillingCycle {
    frequency: IFrequency,
    tenureType: string,
    sequence: number,
    totalCycles: number
}