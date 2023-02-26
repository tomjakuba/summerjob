enum InternalErrorType {
  INVALID_DATA = "INVALID_DATA",
}

export class InternalError extends Error {
  readonly type: InternalErrorType;
  readonly reason: string;
  constructor(reason: string, errorType: InternalErrorType) {
    super(reason);
    this.reason = reason;
    this.type = errorType;
  }
}

export class InvalidDataError extends InternalError {
  constructor(message?: string) {
    super(message ?? "Invalid data.", InternalErrorType.INVALID_DATA);
  }
}
