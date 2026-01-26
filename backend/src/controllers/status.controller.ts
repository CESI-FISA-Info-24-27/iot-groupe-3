import { Request, Response } from "express";

export function getStatus(req: Request, res: Response) {
  res.status(200).send("API is running");
}
