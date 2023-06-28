import { DocumentData } from "firebase-admin/firestore";

export class Subscription {
    id: string = '';
    email: string = '';
    planId: string = '';
    start: string = '';
    end: string = '';
    status: number = 0;

    public static get = (data: DocumentData): Subscription => ({
        id: data.id,
        email: data.email,
        planId: data.planId,
        start: data.start,
        end: data.end,
        status: data.status
    })
}