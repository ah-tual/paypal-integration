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
import { createSubPlan, getPlanById } from "./plan";
import { Subscription } from "../../models/firestore/subscription";
import { ISubscription } from "../../models/paypal/subscription";
import { IPlan } from "../../models/paypal/plan";

export const getSubscriptionDetail = async (subscriptionId: string, token?: string): Promise<ISubscription> => {
    if (!token) {
        token = await getToken();
    }

    return (await get<ISubscription>(`${config.paypal.url}/v1/billing/subscriptions/${subscriptionId}`, {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    })).data;
}

export const verifySubcription = async (sessionId: string, subscriptionId: string, token?: string): Promise<any> => {
    const sapshot = await getFirestore().collection('subscriptions').where('sessionId', '==', sessionId).get();

    if (sapshot.empty || sapshot.docs[0].data().status == 1 || sapshot.docs[0].data().subscriptionId != subscriptionId) {
        throw new InvalidResourceError(`Invalid session ${sessionId}`);
    }

    if (!token) {
        token = await getToken();
    }

    const subscription = await getSubscriptionDetail(subscriptionId, token);

    if (subscription && subscription.status == 'ACTIVE' && (new Date(+sapshot.docs[0].data().createAt)) < (new Date(subscription.billingInfo.lastPayment.time))) {
        /*  step 1: update subscription status to 1 - ACTIVE
            - throw an error to break the current flow
            - compensate01: waiting for the job scheduler to correct information
                - query all subscriptions containing status = 0 - TEMPORARY
                - retrieve subscription detail from paypal
                - update subscription status to 1 - ACTIVE
        */
        await getFirestore()
            .collection('subscriptions')
            .doc(sapshot.docs[0].id)
            .update({
                'status': 1,
                'updateAt': (new Date()).toISOString()
            });
        /*  step 1
        */

        /*  step 2: cancel old subscriptions
            - throw an error to break the current flow
            - compensate02: waiting for the job scheduler to correct information
                - query all subscriptions containing status = 1 and fromPlanId != null
                - cancel the subscriptions corresponding to the fromPlanId values
                - update subscription status to -1 - INACTIVE
        */
        (await getFirestore()
            .collection('subscriptions')
            .where('fromPlanId', '==', sapshot.docs[0].data().fromPlanId)
            .where('email', '==', sapshot.docs[0].data().email)
            .where('subscriptionId', '!=', sapshot.docs[0].data().subscriptionId)
            .where('sessionId', '!=', sessionId)
            .where('status', '==', 1)
            .get())
            .forEach(async (doc) => {
                await cancelSubscription(doc.data().subscriptionId, `${sapshot.docs[0].data().email} changes the service package`, token);

                await doc.ref.update({
                    status: -1,
                    toPlanId: subscription.planId,
                    cancelAt: (new Date()).toISOString()
                })
            });
        /*  step 2
        */
    }
}

export const compensate01 =async () => {
    const token = await getToken();

    (await getFirestore()
        .collection('subscriptions')
        .where('createAt', '<=', (new Date()).getTime())
        .where('status', '==', 0)
        .get())
        .forEach(async (doc) => {
            try {
                const subscription = await getSubscriptionDetail(doc.data().subscriptionId, token);

                await getFirestore()
                    .collection('subscriptions')
                    .doc(doc.id)
                    .update({
                        'status': subscription && subscription.status == 'ACTIVE' ? 1 : -1,
                        'updateAt': (new Date()).getTime()
                    });

                if (subscription.status == 'ACTIVE' && doc.data().fromPlanId) {
                    await cancelSubscription(subscription.id, `${doc.data().email} changes the service package`, token);

                    (await getFirestore()
                        .collection('subscriptions')
                        .where('planId', '==', doc.data().fromPlanId)
                        .get())
                        .forEach(async (x) => {
                            await x.ref.update({
                                status: -1,
                                toPlanId: doc.data().planId,
                                cancelAt: (new Date()).getTime()
                            })
                        });
                }
            }
            catch (error) {}
        });
}

export const compensate02 =async () => {
    const token = await getToken();

    (await getFirestore()
        .collection('subscriptions')
        .where('createAt', '<=', (new Date()).getTime())
        .where('fromPlanId', '!=', null)
        .where('status', '==', 1)
        .get())
        .forEach(async (doc) => {
            try {
                (await getFirestore()
                    .collection('subscriptions')
                    .where('planId', '==', doc.data().fromPlanId)
                    .where('status', '==', 1)
                    .get())
                    .forEach(async (doc) => {
                        try {
                            await cancelSubscription(doc.data().subscriptionId, `${doc.data().email} changes the service package`, token);

                            await doc.ref.update({
                                status: -1,
                                toPlanId: doc.data().planId,
                                cancelAt: (new Date()).getTime()
                            })
                        }
                        catch (error) {}
                    });
            }
            catch (error) {}
        });
}

export const cancelSubscription = async (subscriptionId: string, reason: string, token?: string) => {
    if (!token) {
        token = await getToken();
    }

    await postJson<any, any>(`${config.paypal.url}/v1/billing/subscriptions/${subscriptionId}/cancel`, {
        reason: reason
    }, {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        'PayPal-Request-Id': uuidv4()
    });
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
            'createAt': (new Date()).toISOString(),
            'status': 0,
            'sessionId': new URLSearchParams(href).get('ba_token')
        });

    return href;
}

export const changePlan = async (subscriptionId: string, planId: string, user: IUser, token?: string) : Promise<string> => {
    if (!token) {
        token = await getToken();
    }

    const sapshot = await getFirestore().collection('subscriptions').where('planId', '==', planId).where('subscriptionId', '==', subscriptionId).get();
    if (sapshot.empty || sapshot.docs[0].data().status != 1) {
        throw new InvalidResourceError(`Invalid subscription ${subscriptionId}`);
    }

    const subscription = await getSubscriptionDetail(subscriptionId, token);
    if (!subscription || subscription.status != 'ACTIVE') {
        throw new ResourceNotFoundError(`Invalid subscription ${subscriptionId}`);
    }

    const nextBillingTime = new Date(subscription.billingInfo.nextBillingTime);
    const lastPaymentAmount = Number(subscription.billingInfo.lastPayment.amount);
    const setupFee = Math.round((30 / (nextBillingTime.getDate() - (new Date()).getDate())) * lastPaymentAmount)

    /*  step 1: create a new sub-plan
        - throw an error to break the current flow
        - waiting for the job scheduler to clear an empty subscription plan
    */
    const subPlan = (await createSubPlan(planId, setupFee, token)) as IPlan;

    await getFirestore()
        .collection('plans')
        .add({
            'id': subPlan.id,
            'name': subPlan.name,
            'parentId': planId,
            'setupFee': setupFee,
            'intervalUnit': subPlan.billingCycles.find(x => x.tenureType == 'REGULAR')!.frequency.intervalUnit,
            'value': subPlan.billingCycles.find(x => x.tenureType == 'REGULAR')!.pricingScheme.fixedPrice.value,
            'email': user.email,
            'start': (new Date()).getTime(),
            'status': 0 //temporary plan
        });
    /*  step 1
    */

    /*  step 2: create a new subscription on a new sub-plan
        - throw an error to break the current flow
        - there is no compensation task
    */
    const newSubscription = (
        await postJson<IRequest, ISubscription>(`${config.paypal.url}/v1/billing/subscriptions`,
            getDefault(subPlan.id, user.email, user.givenName, user.familyName), {
            'Authorization': `Bearer ${token}`,
            'PayPal-Request-Id': uuidv4()
        })
    ).data;
    /*  step 2
    */

    const href = newSubscription.links.find((link: ILink) => link.rel == 'approve')!.href;

    /*  step 3: persist the new temporary subscription to firestore
        - there is no compensation task
        - retry util success
    */
    const fn = () => {
        getFirestore()
        .collection('subscriptions')
        .add({
            'email': user.email,
            'subscriptionId': newSubscription.id,
            'planId': subPlan.id,
            'createAt': (new Date()).getTime(),
            'status': 0, //temporary subscription
            'sessionId': new URLSearchParams(href).get('ba_token'),
            'fromPlanId': planId
        })
        .catch(() => {
            setTimeout(fn, 1000);
        });
    }
    fn();
    /*  step 3
    */
    
    return href;
}