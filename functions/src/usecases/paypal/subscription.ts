import { getFirestore } from "firebase-admin/firestore";
import { v4 as uuidv4 } from 'uuid';
import { URLSearchParams } from 'url';
import { IRequest, getDefault } from "../../requests/subscription.create"
import { postJson, get } from '../../helpers/apiClient';
import config from '../../default';
import { IUser } from '../../models/google/user';
import { ILink } from "../../models/paypal/link";
import { getToken } from "./authentication";
import { InvalidResourceError, ResourceNotFoundError } from "../../errors/resource";
import { getPlanById } from "./plan";
import { Subscription } from "../../models/firestore/subscription";
import { ISubscription } from "../../models/paypal/subscription";

export const getSubscriptionDetail = async (subscriptionId: string, token?: string) : Promise<ISubscription> => {
    if (!token) {
        token = await getToken();
    }

    return (await get<ISubscription>(`${config.paypal.url}/v1/billing/subscriptions/${subscriptionId}`, {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    })).data;
}

export const verifySubcription = async (sessionId: string, subscriptionId: string, token?: string) : Promise<any> => {
    const sapshot = await getFirestore().collection('subscriptions').where('sessionId', '==', sessionId).get();
    if (sapshot.empty || sapshot.docs[0].data().status == 1 || sapshot.docs[0].data().subscriptionId != subscriptionId) {
        throw new InvalidResourceError(`Invalid session ${sessionId}`);
    }

    if (!token) {
        token = await getToken();
    }

    const subscription = await getSubscriptionDetail(subscriptionId, token);
    if (subscription && subscription.status == 'ACTIVE' && (new Date(sapshot.docs[0].data().start) < (new Date(subscription.billingInfo.lastPayment.time)) )) {
        await getFirestore()
        .collection('subscriptions')
        .doc(sapshot.docs[0].id)
        .update({
            'status': 1
        });
    }
}

export const createSubscription = async (planId: string, user: IUser, token?: string): Promise<string> => {
    if (!token) {
        token = await getToken();
    }

    const plan = await getPlanById(planId, token);
    if (!plan) {
        throw new ResourceNotFoundError(`Plan ${planId} not found`);
    }

    const sapshot = await getFirestore().collection('subscriptions').where('email', '==', user.email).get();
    if (!sapshot.empty && sapshot.docs[0].data().planId) {
        const subscription = Subscription.get(sapshot.docs[0].data());
        if (subscription.planId && subscription.status == 1) {
            throw new InvalidResourceError(`Invalid subscription ${user.email}`);
        }
    }

    const subscription = (
        await postJson<IRequest, ISubscription>(`${config.paypal.url}/v1/billing/subscriptions`, 
        getDefault(planId, user.email, user.givenName, user.familyName), {
            'Authorization': `Bearer ${token}`,
            'PayPal-Request-Id': uuidv4()
        })
    ).data;

    const href = subscription.links.find((link: ILink) => link.rel == 'approve')!.href;

    await getFirestore()
        .collection('subscriptions')
        .add({
            'email': user.email,
            'subscriptionId': subscription.id,
            'planId': planId,
            'start': (new Date()).toISOString(),
            'status': 0,
            'sessionId': new URLSearchParams(href).get('ba_token')
        });

    return href;
}