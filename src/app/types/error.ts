export type ErrorType = "FirestoreUpdateAfterPaymentError" | "EmailSendError";

export type ErrorLog = {
  errorType: ErrorType;
  errorMessage: string;
  additionalData?: Record<string, any>;
  createdAt: Date;
};