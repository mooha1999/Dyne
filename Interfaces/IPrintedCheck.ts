export interface IPrintedCheckResponse {
  GetPrintedCheckResponse: {
    ppCheckPrintLines: {
      OperationalResult: {
        Success: boolean;
        ErrorCode: string;
        ErrorMessage: string;
      };
      CheckPrintLines: {
        string: string[];
      };
    };
  }
}
