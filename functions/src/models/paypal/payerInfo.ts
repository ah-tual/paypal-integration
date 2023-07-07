import { IName } from "./name";

export interface IPayerInfo {
    accountId: string;
    emailAddress: string;
    addressStatus: string;
    payerStatus: string;
    payerName: IName;
    countryCode: string;
}