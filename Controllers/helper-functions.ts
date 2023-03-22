import axios, { AxiosResponse } from 'axios';
import xml2js from 'xml2js';

import { ICheckSummary } from '../Interfaces/ICheckSummary';
import { IPrintedCheckResponse } from '../Interfaces/IPrintedCheck';
import {IItems} from '../Interfaces/IItems';


export async function getCheckNum(tableID: string): Promise<string> {
  const response = await axios.post(getURL(SUMMARY_END_POINT), SUMMARY_BODY, { headers: HEADERS });
  const checks = await checksSummaries(response);
  const { CheckNum: checknum } = checks.find(check => check.CheckTableGroup === tableID) as ICheckSummary;
  return checknum
}

export async function getPrintedCheck(checkNum: string) {
  const response = await axios.post(getURL(PRINTED_END_POINT), getPrintedBody(checkNum), { headers: HEADERS });
  const { GetPrintedCheckResponse } = await parseXML(response) as IPrintedCheckResponse;

  return GetPrintedCheckResponse.ppCheckPrintLines.CheckPrintLines.string;
}

export function parseItems(printedCheck: string[]){
  let productsList: IItems = {
    items: [],
    totalPrice: 0
  };
  printedCheck.forEach( item => {
    //remove leading, trailing and duplicae white spaces from a string
    const trimmedItem = item.trim().replace(/\s+/g, ' ');
    const splittedItem = trimmedItem.split(' ');
    if(splittedItem[0] === 'Total'){
      productsList.totalPrice = Number(splittedItem[2].replace('$',''));
    }
    //test if the string's first character is a number and is not followed by 'Open'
    else if(/^[0-9]/.test(trimmedItem) && splittedItem[1] !== 'Open'){
      const price = Number(splittedItem.at(-1)) / Number(splittedItem[0]);
      productsList.items.push({
        item: splittedItem.slice(1,-1).join(' '),
        price: price
      });
    }
  });
  return productsList;
}

function getURL(endpoint: number): string {
  return `https://private-anon-cb645058d4-simphonytsapi.apiary-mock.com/${endpoint}/EGateway/SimphonyPosApiWeb.asmx`
}

async function checksSummaries(response: AxiosResponse): Promise<ICheckSummary[]> {
  const { GetOpenChecksResponse } = await parseXML(response);
  const checks = GetOpenChecksResponse.openChecks.CheckSummary.SimphonyPosApi_CheckSummary as ICheckSummary[];
  return checks;
}

async function parseXML(response: AxiosResponse) {
  const data = await xml2js.parseStringPromise(response.data, {
    explicitArray: false,
    ignoreAttrs: true,
    tagNameProcessors: [(name) => name.includes(':') ? name.slice(5) : name]
  });
  return data.Envelope.Body;
}
function getPrintedBody(checkNum: string): string {
  return `<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><GetPrintedCheck xmlns="http://micros-hosting.com/EGateway/"><vendorCode /><CheckSeq>${checkNum}</CheckSeq><EmplObjectnum>900000092</EmplObjectnum><TmedObjectNum>902</TmedObjectNum><ppCheckPrintLines /></GetPrintedCheck></soap:Body></soap:Envelope>`
}

const SUMMARY_END_POINT = 9;
const PRINTED_END_POINT = 15;
const HEADERS = {
  'Content-Type': 'text/xml;charset=UTF-8',
  'SOAPAction': 'http://micros-hosting.com/EGateway/GetCheckDetail'
};
const SUMMARY_BODY = `<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><CheckPrintJobStatus xmlns=\"http://micros-hosting.com/EGateway/\"><vendorCode /><ppJobId></ppJobId><ppJobStatus /></CheckPrintJobStatus></soap:Body></soap:Envelope>`;
