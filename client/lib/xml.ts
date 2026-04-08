import { parseStringPromise } from 'xml2js';

export async function parseXml(xml: string) {
  const result = await parseStringPromise(xml, {
    explicitArray: false,
  });

  return result;
}