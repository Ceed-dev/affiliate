export type ErrorType = "FirestoreUpdateAfterPaymentError";

export type ErrorLog = {
  errorType: ErrorType;
  errorMessage: string;
  additionalData?: Record<string, any>;
  createdAt: Date;
};