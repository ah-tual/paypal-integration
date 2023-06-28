import { DocumentData } from "firebase-admin/firestore";

export class Plan {
    id: string = '';
    refId?: string;
    email: string = '';
    planId: string = '';
    start: string = '';
    end: string = '';
    status: number = 0;

    public static get = (data: DocumentData): Plan => ({
        id: data.id,
        email: data.email,
        planId: data.planId,
        start: data.start,
        end: data.end,
        status: data.status
    })
}