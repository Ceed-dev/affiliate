export type ErrorType = 
  "FirestoreUpdateAfterPaymentError" | 
  "EmailSendError" | 
  "UserPaymentError" |
  "ImageDeletionError" |
  "GeoLocationError";

export type ErrorLog = {
  errorType: ErrorType;
  errorMessage: string;
  additionalData?: Record<string, any>;
  createdAt: Date;
};