import { IBillingCycle } from '../models/paypal/billingCycle';
import { IPaymentPreferences } from '../models/paypal/paymentPreferences';
import { ITaxes } from '../models/paypal/taxes';

export interface IRequest {
    productId: string;
    name: string;
    description: string;
    status: string;
    billingCycles: IBillingCycle[];
    paymentPreferences?: IPaymentPreferences;
    taxes?: ITaxes;
    quantitysupported: boolean;
}

export const get = (productId: string, planName: string, planDescription: string, billingCycles: IBillingCycle[], setupFee: number) : IRequest => ({
    productId: productId,
    name: planName,
    description: planDescription,
    status: 'ACTIVE',
    billingCycles: billingCycles,
    paymentPreferences: {
        autoBillOutstanding: true,
        setupFee: {
            currencyCode: 'USD',
            value: `${setupFee}`
        },
        setupFeeFailureAction: 'CONTINUE',
        paymentFailureThreshold: 2
    },
    quantitysupported: false,
});