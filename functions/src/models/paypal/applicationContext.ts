import config from '../../default';

export interface IApplicationContext {
    brandName: string,
    locale: string,
    userAction: string,
    paymentMethod: IPaymentMethod,
    returnUrl: string,
    cancelUrl: string
}

interface IPaymentMethod {
    payerSelected: string,
    payeePreferred: string,
}

export const getDefault = (userAction: string = `SUBSCRIBE_NOW`) : IApplicationContext => (
    {
        brandName: config.app.brand,
        locale: `en-US`,
        userAction: userAction,
        paymentMethod: {
            payerSelected: `PAYPAL`,
            payeePreferred: `IMMEDIATE_PAYMENT_REQUIRED`,
        },
        returnUrl: config.app.returnUrl,
        cancelUrl: config.app.cancelUrl,    
    }
)