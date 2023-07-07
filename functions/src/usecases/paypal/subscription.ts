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
import { IPlan } from "../../models/paypal/plan";
import { getLastDateOfMonth, setDate, setTime } from "../../helpers/index"
import { Response as GetSubscriptionsResponse } from "../../responses/subscription.get";
import { Response as CreateSubscriptionResponse } from "../../responses/subscription.create";

export const getSubscriptionDetail = async (subscriptionId: string, token?: string): Promise<GetSubscriptionsResponse> => {
    if (!token) {
        token = await getToken();
    }

    return (await get<GetSubscriptionsResponse>(`${config.paypal.url}/v1/billing/subscriptions/${subscriptionId}`, {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
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

    console.log(`--------------->subscription`);
    console.log(subscription);

    if (subscription.status == 'ACTIVE' && (new Date(+sapshot.docs[0].data().createAt)) < (new Date(subscription.billingInfo.lastPayment.time))) {
        console.log(`--------------->ACTIVE`);
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
                'updateAt': (new Date(subscription.updateTime)).getTime(),
                'endCycleAt': getLastDateOfMonth(new Date(subscription.updateTime).getFullYear(), new Date(subscription.updateTime).getMonth()).getTime()
            });
        /*  step 1
        */

        if (sapshot.docs[0].data().fromPlanId) {
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
                .get())
                .forEach(async (doc) => {
                    await postJson<any, any>(`${config.paypal.url}/v1/billing/subscriptions/${subscriptionId}/cancel`, {
                        reason: `cancel the current service for ${sapshot.docs[0].data().email}`
                    }, {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`,
                        'PayPal-Request-Id': uuidv4()
                    });

                    await doc.ref.update({
                        status: -1,
                        toPlanId: subscription.planId,
                        cancelAt: (new Date()).getTime()
                    })
                });
            /*  step 2
            */
        }

        return {
            subscriptionId: subscriptionId,
            status: 'ACTIVE',
            fromPlan: sapshot.docs[0].data().fromPlanId,
            toPlan: subscription.planId,
            returnUrl: sapshot.docs[0].data().returnUrl
        }
    }
    else {
        console.log(`--------------->INACTIVE`);
        await getFirestore()
            .collection('subscriptions')
            .doc(sapshot.docs[0].id)
            .update({
                status: -1,
                cancelAt: (new Date()).getTime()
            });

        return {
            subscriptionId: subscriptionId,
            status: 'CANCELED',
            returnUrl: sapshot.docs[0].data().returnUrl
        }
    }
}

export const compensate01 = async () => {
    const token = await getToken();

    (await getFirestore()
        .collection('subscriptions')
        .where('createAt', '<=', (new Date()).getTime())
        .where('status', '==', 0)
        .orderBy('createAt', 'asc')
        .limit(10)
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
            catch (error) { }
        });
}

export const compensate02 = async () => {
    const token = await getToken();

    (await getFirestore()
        .collection('subscriptions')
        .where('createAt', '<=', (new Date()).getTime())
        .where('fromPlanId', '!=', null)
        .where('status', '==', 1)
        .orderBy('createAt', 'asc')
        .limit(10)
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
                        catch (error) { }
                    });
            }
            catch (error) { }
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

    (await getFirestore()
        .collection('subscriptions')
        .where('subscriptionId', '==', subscriptionId)
        .where('status', '==', 1)
        .orderBy('createAt', 'desc')
        .limit(1)
        .get())
        .forEach(async (doc) => {
            await postJson<any, any>(`${config.paypal.url}/v1/billing/subscriptions/${subscriptionId}/cancel`, {
                reason: reason
            }, {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`,
                'PayPal-Request-Id': uuidv4()
            });

            await doc.ref.update({
                status: -1,
                toPlanId: doc.data().planId,
                cancelAt: (new Date()).getTime()
            })
        });
}

export const createSubscription = async (planId: string, returnUrl: string, user: IUser, token?: string): Promise<string> => {
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

    const createSubscriptionRes = (
        await postJson<IRequest, CreateSubscriptionResponse>(`${config.paypal.url}/v1/billing/subscriptions`,
            getDefault(planId, user.email, user.givenName, user.familyName), {
            'Authorization': `Bearer ${token}`,
            'PayPal-Request-Id': uuidv4()
        })
    ).data;

    const href = createSubscriptionRes.links.find((link: ILink) => link.rel == 'approve')!.href;

    await getFirestore()
        .collection('subscriptions')
        .add({
            'email': user.email,
            'subscriptionId': createSubscriptionRes.id,
            'planId': planId,
            'createAt': (new Date()).toISOString(),
            'status': 0,
            'sessionId': new URLSearchParams(new URL(href).search).get('ba_token'),
            'returnUrl': returnUrl
        });

    return href;
}

export const changePlan = async (subscriptionId: string, planId: string, user: IUser, token?: string): Promise<string> => {
    if (!token) {
        token = await getToken();
    }

    const sapshot = await getFirestore()
        .collection('subscriptions')
        .where('planId', '==', planId)
        .where('subscriptionId', '==', subscriptionId)
        .get();

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
        - clear an empty subscription sub-plan manualy
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
    const createSubscriptionRes = (
        await postJson<IRequest, CreateSubscriptionResponse>(`${config.paypal.url}/v1/billing/subscriptions`,
            getDefault(subPlan.id, user.email, user.givenName, user.familyName), {
            'Authorization': `Bearer ${token}`,
            'PayPal-Request-Id': uuidv4()
        })
    ).data;
    /*  step 2
    */

    const href = createSubscriptionRes.links.find((link: ILink) => link.rel == 'approve')!.href;

    /*  step 3: persist the new temporary subscription to firestore
        - there is no compensation task
        - retry util success
    */
    const fn = () => {
        getFirestore()
            .collection('subscriptions')
            .add({
                'email': user.email,
                'subscriptionId': createSubscriptionRes.id,
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

export const retrieveSubscriptions = async (page: number, pageSize: number) => {
    const token = await getToken();

    (await getFirestore()
        .collection('subscriptions')
        .where('status', '==', '1')
        .where('endCycleAt', '<', setTime(new Date(), 0, 0, 0))
        .where('endCycleAt', '>', setTime(setDate(new Date(), new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 1), 0, 0, 0))
        .orderBy('createAt', 'desc')
        .offset(page * pageSize)
        .limit(pageSize)
        .get()).forEach(async (doc) => {
            try {
                if (doc.data().backLog && JSON.parse(`${doc.data().backLog}`)[`${new Date().getFullYear()}_${new Date().getMonth()}_${new Date().getDate()}`]) {

                }
                const subscription = await getSubscriptionDetail(doc.data().subscriptionId, token);
                if (subscription && (subscription.status == 'CANCELLED' || subscription.status == 'SUSPENDED')) {
                    doc.ref.update({
                        'status': -1,
                        'cancelAt': new Date(subscription.statusUpdateTime).getTime(),
                        'cancelReson': subscription.statusChangeNote,
                    });
                }
            }
            catch (error) { }
        });
}