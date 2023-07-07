import { IPayerInfo } from "./payerInfo";
import { ITransactionInfo } from "./transactionInfo";

export interface ITransactionDetail {
    transactionInfo: ITransactionInfo;
    payerInfo: IPayerInfo;
}