import { ILink } from "../models/paypal/link";
import { ISubcriber } from "../models/paypal/subscriber";


export interface IResponse {
    id: string, 
    status: string,
    statusUpdateTime: string,
    planId: string,
    planOverridden: string,
    startTime: string,
    quantity: string,
    subscriber: ISubcriber,
    createTime: string,
    links: ILink[]
}