import { Request, Response } from 'express';
import * as helpers from './helper-functions';

export async function items(req: Request, res: Response) {
  const { tid: tableID } = req.params;
  try {
    if (!tableID|| isNaN(Number(tableID))) {
      throw new Error('table id is not provided');
    }
    const checkNum = await helpers.getCheckNum(tableID);
    const printedCheck = await helpers.getPrintedCheck(checkNum);
    const items = helpers.parseItems(printedCheck.slice(5));// Remove the first 5 elements
    res.status(200).json({ items });
  } catch (error: any) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
}

export async function notify(req: Request, res: Response){
  
}