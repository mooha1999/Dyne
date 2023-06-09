import axios, { AxiosResponse } from 'axios';

import { parseXML } from './helpers';
import { ICheckSummary } from '../Interfaces/ICheckSummary';
import { IPrintedCheckResponse } from '../Interfaces/IPrintedCheck';
import { IItems } from '../Interfaces/IItems';

const { openChecks, printedCheck } = {//environment variables
  openChecks: process.env.OPEN_CHECKS_ENDPOINT as string,
  printedCheck: process.env.PRINTED_CHECK_ENDPOINT as string,
}

export async function getCheckNum(tableID: string): Promise<string> {

  const response = await axios.post(openChecks, SUMMARY_BODY, { headers: HEADERS });
  const checks = await checksSummaries(response);
  const checkSummary = checks.find(check => check.CheckTableGroup === tableID);
  if (!checkSummary) {
    throw new Error('No table has the provided ID')
  }
  return checkSummary.CheckNum;
}

export async function getPrintedCheck(checkNum: string): Promise<string[]> {
  const response = await axios.post(printedCheck, getPrintedBody(checkNum), { headers: HEADERS });
  const { GetPrintedCheckResponse } = await parseXML(response) as IPrintedCheckResponse;

  return GetPrintedCheckResponse.ppCheckPrintLines.CheckPrintLines.string;
}

export function parseItems(printedCheck: string[]): IItems {
  let productsList: IItems = {
    items: [],
    totalPrice: 0
  };
  printedCheck.forEach(item => {
    //remove leading, trailing and duplicae white spaces from a string
    const trimmedItem = item.trim().replace(/\s+/g, ' ');
    const splittedItem = trimmedItem.split(' ');
    if (splittedItem[0] === 'Total') {
      productsList.totalPrice = Number(splittedItem[2].replace('$', ''));
    }
    //test if the string's first character is a number and is not followed by 'Open'
    else if (/^[0-9]/.test(trimmedItem) && splittedItem[1] !== 'Open') {
      const price = Number(splittedItem.at(-1)) / Number(splittedItem[0]);
      productsList.items.push({
        item: splittedItem.slice(1, -1).join(' '),
        price: price
      });
    }
  });
  return productsList;
}

async function checksSummaries(response: AxiosResponse): Promise<ICheckSummary[]> {
  const { GetOpenChecksResponse } = await parseXML(response);
  const checks = GetOpenChecksResponse.openChecks.CheckSummary.SimphonyPosApi_CheckSummary as ICheckSummary[];
  return checks;
}

function getPrintedBody(checkNum: string): string {
  return `<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><GetPrintedCheck xmlns="http://micros-hosting.com/EGateway/"><vendorCode /><CheckSeq>${checkNum}</CheckSeq><EmplObjectnum>900000092</EmplObjectnum><TmedObjectNum>902</TmedObjectNum><ppCheckPrintLines /></GetPrintedCheck></soap:Body></soap:Envelope>`
}
const HEADERS = {
  'Content-Type': 'text/xml;charset=UTF-8',
  'SOAPAction': 'http://micros-hosting.com/EGateway/GetCheckDetail'
};
const SUMMARY_BODY = `<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><CheckPrintJobStatus xmlns=\"http://micros-hosting.com/EGateway/\"><vendorCode /><ppJobId></ppJobId><ppJobStatus /></CheckPrintJobStatus></soap:Body></soap:Envelope>`;
