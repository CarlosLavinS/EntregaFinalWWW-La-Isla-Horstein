import type { NextFunction, Request, Response } from "express";

export function asyncHandler(
  handler: (request: Request, response: Response, next: NextFunction) => Promise<void>
) {
  return (request: Request, response: Response, next: NextFunction) => {
    handler(request, response, next).catch(next);
  };
}

export function errorMiddleware(error: Error, _request: Request, response: Response, _next: NextFunction) {
  response.status(400).json({
    message: error.message
  });
}
