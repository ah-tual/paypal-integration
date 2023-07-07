import { IAmount } from "./amount";

export interface ITransactionInfo {
    paypalAccountId: string;
    transactionId: string;
    transactionEventCode: string;
    transactionInitiationDate: string;
    transactionUpdatedDate: string;
    transactionAmount: IAmount;
    feeAmount: IAmount;
    transactionStatus: string;
    transactionSubject: string;
    transactionNote: string;
    protectionEligibility: string;
}