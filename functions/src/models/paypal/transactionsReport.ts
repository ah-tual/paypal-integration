import { ILink } from "./link";
import { ITransactionDetail } from "./transactionDetail";

export interface ITransactionsReport {
    transactionDetails: ITransactionDetail[]
    accountNumber: string;
    startDate: string;
    endDate: string;
    lastRefreshedDatetime: string;
    page: number;
    totalItems: number;
    totalPages: number;
    links: ILink[]
}