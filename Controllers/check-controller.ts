import { Request, Response } from 'express';
import * as itemsHelpers from '../Helpers/items-helper-functions';
import * as notifyHelpers from '../Helpers/notify-helper-functions';

export async function items(req: Request, res: Response) {
  const { tid: tableID } = req.params;
  try {
    if (!tableID || isNaN(Number(tableID))) {
      throw new Error('table id is not provided');
    }
    const checkNum = await itemsHelpers.getCheckNum(tableID);
    const printedCheck = await itemsHelpers.getPrintedCheck(checkNum);
    const items = itemsHelpers.parseItems(printedCheck.slice(5));// Remove the first 5 elements
    res.status(200).json({ items });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export async function notify(req: Request, res: Response) {
  const body = req.body;
  try {
    const checkInfo = await notifyHelpers.getCheckInfo(body);
    const isCheckClosed = await notifyHelpers.isCheckClosed(checkInfo);
    if(!isCheckClosed){
      throw new Error('Operation failed')
    }
    res.status(200).json({message: 'Operation Succeeded :)'})
  } catch (error: any) {
    res.status(500).json(error.message);
  }

}

