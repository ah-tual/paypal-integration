import { getFirestore } from "firebase-admin/firestore";
import { v4 as uuidv4 } from 'uuid';
import { getToken } from "./authentication";
import { ITransactionsReport } from "../../models/paypal/transactionsReport";
import { get } from "../../helpers/apiClient";
import { setTime } from "../../helpers";

export const retrieveTxns = async (token?: string) => {
    if (token) {
        token = await getToken();
    }

    (await getFirestore()
        .collection('txns')
        .where('status', '==', 'Pending')
        .orderBy('paymentDate', 'desc')
        .limit(10)
        .get())
        .forEach(async (doc) => {
            try {
                const report = await getTransactionsReport(setTime(new Date(+doc.data().paymentDate), 0, 0, 0), new Date(), doc.data().txnId, token);
                if (report.transactionDetails.length > 0) {
                    var status = 'Denied';
                    if (report.transactionDetails[0].transactionInfo.transactionStatus == 'S') {
                        status = 'Completed';
                    }
                    else if (report.transactionDetails[0].transactionInfo.transactionStatus == 'P') {
                        status = 'Pending';
                    }
                    await doc.ref.update({
                        status: status,
                        retrievalCount: doc.data().retrievalCount + 1
                    })
                }
            }
            catch (error) {}
        });
}

export const getTransactionsReport = async (startDate: Date, endDate: Date, pageSize: number, transactionId?: string, token?: string) : Promise<ITransactionsReport> => {
    if (token) {
        token = await getToken();
    }

    var url = `/v1/reporting/transactions?start_date=${startDate.toDateString()}&end_date=${endDate.toDateString()}&page_size=${pageSize}&page=1`;
    if (transactionId) {
        url = `${url}&transaction_id=${transactionId}`;
    }

    return (await get<ITransactionsReport>(url, {
        'Authorization': `Bearer ${token}`,
        'PayPal-Request-Id': uuidv4(),
        'Content-Type': 'application/json'
    })).data
}