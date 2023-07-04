import { IAmount } from "./amount";

export interface IPaymentPreferences {
    serviceType?: string;
    autoBillOutstanding: boolean;
    setupFee?: IAmount,
    setupFeeFailureAction: string;
    paymentFailureThreshold: number
}