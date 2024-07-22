// types.ts

// RunningLog.json のデータ型
export interface RunningLog {
    TID: string;
    IID: number;
    CT: {
      ScenarioPath: string;
      TriggerType: string;
      IsInterruption: boolean;
      EndTime: {
        TID: string;
        CT: {
          Binary: string;
          IID: number;
          CT: string;
        };
      };
      ScenarioHash: string;
      BeginTime: {
        TID: string;
        CT: {
          Binary: string;
          IID: number;
          CT: string;
        };
      };
      Version: string;
      UserName: string;
      MachineName: string;
    };
  }
  
  // ExceptionLog.json のデータ型
  export interface ExceptionLog {
    TID: string;
    IID: number;
    CT: {
      OccuredTime: {
        TID: string;
        CT: {
          Binary: string;
          IID: number;
          CT: string;
        };
      };
      Line: number;
      ErrorMessage: string;
      ErrorDescription: string;
    };
  }
  
  // JSONファイルのデータを統一するための型
  export type JSONData = RunningLog | ExceptionLog;
  