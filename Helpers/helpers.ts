import { AxiosResponse } from "axios";
import xml2js from 'xml2js';

export async function parseXML(response: AxiosResponse): Promise<any> {
  const data = await xml2js.parseStringPromise(response.data, {
    explicitArray: false,
    ignoreAttrs: true,
    tagNameProcessors: [(name) => name.includes(':') ? name.slice(5) : name]
  });
  return data.Envelope.Body;
}