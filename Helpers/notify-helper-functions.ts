import axios from "axios";

import { parseXML } from './helpers';

const endpoints = {
  postTransaction: process.env.POST_TRANSACTION_ENDPOINT as string,
  voidItems: process.env.VOID_TRANSACTION_ENDPOINT as string
}

export async function getCheckInfo(_: any): Promise<[string, string]> {
  const postTransaction = await axios.post(endpoints.postTransaction);
  const {
    PostTransactionExResponse: {
      pGuestCheck: {
        CheckNum, CheckSeq
      }
    }
  } = await parseXML(postTransaction);
  return [CheckNum, CheckSeq] as [string, string];
}

export async function isCheckClosed(checkInfo: [string, string]): Promise<boolean> {
  const voidItems = await axios.post(endpoints.voidItems, checkInfo);
  const {
    VoidTransactionResponse: {
      pGuestCheck: {
        OperationalResult
      }
    }
  } = await parseXML(voidItems);
  return OperationalResult.Success === 'true';
}