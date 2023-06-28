import { getFirestore } from "firebase-admin/firestore";
import { v4 as uuidv4 } from 'uuid';
import { IRequest, getDefault } from "../../requests/subscription.create"
import { IResponse } from "../../responses/subscription.create"
import { postJson } from '../../helpers/apiClient';
import config from '../../default';
import { IUser } from '../../models/google/user';
import { ILink } from "../../models/link";
import { getToken } from "./authentication";
import { InvalidResourceError, ResourceNotFoundError } from "../../errors/resource";
import { getPlanById } from "./plan";
import { Subscription } from "../../models/firestore/subscription";

export const createSubscription = async (planId: string, user: IUser, token?: string): Promise<string> => {
    console.log('----------------------getToken-------------------');
    if (!token) {
        token = await getToken();
    }
    console.log(token);
    console.log('----------------------getToken-------------------');

    const plan = getPlanById(planId, token);
    if (!plan) {
        throw new ResourceNotFoundError(`Plan ${planId} not found`);
    }

    const sapshot = await getFirestore().collection('subscription').where('email', '==', user.email).get();
    if (!sapshot.empty && sapshot.docs[0].data().planId) {
        const subscription = Subscription.get(sapshot.docs[0].data());
        if (subscription.planId && subscription.status == 1) {
            throw new InvalidResourceError(`Invalid subscription ${user.email}`);
        }
    }

    const href = (
        await postJson<IRequest, IResponse>(`${config.paypal.url}/v1/billing/subscriptions`, 
        getDefault(planId, user.email, user.givenName, user.familyName), {
            'Authorization': `Bearer ${token}`,
            'PayPal-Request-Id': uuidv4()
        })
    ).data.links.find((link: ILink) => link.rel == 'approve')!.href;

    await getFirestore()
        .collection('subscriptions')
        .add({
            'email': user.email,
            'planId': planId,
            'start': (new Date()).toISOString(),
            'status': 0
        });

    return href;
}