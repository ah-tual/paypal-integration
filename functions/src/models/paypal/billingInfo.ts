import { IBalance } from "./balance";
import { ICycleExecutions } from "./cycleExecution";
import { IPayment } from "./payment";

export interface IBillingInfo {
    outstandingBalance: IBalance,
    cycleExecutions: ICycleExecutions[],
    lastPayment: IPayment,
    nextBillingTime: string,
    failedPaymentsCount: number
}