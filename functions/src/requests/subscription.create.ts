import { ISubcriber, getDefault as getSubscriber } from '../models/paypal/subscriber';
import { IApplicationContext, getDefault as getAppContext } from '../models/paypal/applicationContext';

export interface IRequest {
    planId: string,
    startTime: string,
    quantity: string,
    subscriber: ISubcriber,
    applicationContext: IApplicationContext
}

export const getDefault = (planId: string, email: string, givenName: string, surname: string) : IRequest => (
    {
        planId: planId,
        startTime: new Date().toISOString(),
        quantity: '1',
        subscriber: getSubscriber(email, givenName, surname),
        applicationContext: getAppContext()
    }
)