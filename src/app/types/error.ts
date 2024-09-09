export type ErrorType = 
  "FirestoreUpdateAfterPaymentError" | 
  "EmailSendError" | 
  "UserPaymentError" |
  "ImageDeletionError";

export type ErrorLog = {
  errorType: ErrorType;
  errorMessage: string;
  additionalData?: Record<string, any>;
  createdAt: Date;
};