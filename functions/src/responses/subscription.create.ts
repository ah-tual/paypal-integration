import { ILink } from "../models/link";
import { ISubcriber } from "../models/subscriber";


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