import { z } from "zod";

export enum ApiErrorType {
  GENERIC_ERROR = "GENERIC_ERROR",
  BAD_REQUEST = "BAD_REQUEST",
  DB_CONNECT_ERROR = "DB_CONNECT_ERROR",
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
}

export type WrappedError<T extends Error> = {
  error: T;
};

export const ApiErrorSchema = z.object({
  type: z.nativeEnum(ApiErrorType),
  reason: z.string(),
});

export class ApiError extends Error {
  readonly type: ApiErrorType;
  readonly reason: string;
  constructor(reason: string, errorType: ApiErrorType) {
    super(reason);
    this.reason = reason;
    this.type = errorType;
  }
}

export class ApiDbError extends ApiError {
  constructor() {
    super("Could not connect to database.", ApiErrorType.DB_CONNECT_ERROR);
  }
}

export class ApiBadRequestError extends ApiError {
  constructor(message?: string) {
    super(message ?? "Invalid input.", ApiErrorType.BAD_REQUEST);
  }
}

export class ApiInternalServerError extends ApiError {
  constructor(message?: string) {
    super(
      message ?? "An internal server error occurred.",
      ApiErrorType.INTERNAL_SERVER_ERROR
    );
  }
}
