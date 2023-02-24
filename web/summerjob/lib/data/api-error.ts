export enum ApiErrorType {
  GENERIC_ERROR = "GENERIC_ERROR",
  BAD_REQUEST = "BAD_REQUEST",
  DB_CONNECT_ERROR = "DB_CONNECT_ERROR",
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
}

export type WrappedError<T extends Error> = {
  error: T;
};

export class ApiError extends Error {
  readonly type: ApiErrorType;
  constructor(message: string, errorType: ApiErrorType) {
    super(message);
    this.type = errorType;
  }
}

export class ApiDbError extends ApiError {
  constructor() {
    super("Could not connect to database.", ApiErrorType.DB_CONNECT_ERROR);
  }
}
