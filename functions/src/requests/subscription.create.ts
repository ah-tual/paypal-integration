import { ISubcriber, getDefault as getSubscriber } from '../models/paypal/subscriber';
import { IApplicationContext, getDefault as getAppContext } from '../models/paypal/applicationContext';
import { setTime } from '../helpers';

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
        startTime: setTime(new Date(), new Date().getHours() + 1, 0, 0).toISOString(),
        quantity: '1',
        subscriber: getSubscriber(email, givenName, surname),
        applicationContext: getAppContext()
    }
)