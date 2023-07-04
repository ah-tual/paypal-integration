import { IBillingCycle } from '../models/paypal/billingCycle';
import { ILink } from '../models/paypal/link';
import { IPaymentPreferences } from '../models/paypal/paymentPreferences';
import { IPlan } from '../models/paypal/plan';
import { ITaxes } from '../models/paypal/taxes';

export class Response implements IPlan {
    id: string = '';
    productId: string = '';
    name: string = '';
    description: string = '';
    status: string = '';
    usageType?: string;
    billingCycles: IBillingCycle[] = [];
    paymentPreferences?: IPaymentPreferences;
    taxes?: ITaxes;
    quantitysupported: boolean = false;
    createTime: string = '';
    updateTime?: string;
    links: ILink[] = [];
} 