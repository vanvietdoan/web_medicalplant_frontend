

export interface EvalueUpdate {
    rating: number;
    content: string | null;
    user_id: number;
    advice_id: number;
  }
  
  export interface EvalueCreate {
    rating: number;
    content: string | null;
    user_id: number;
    advice_id: number;
  }
  export interface EvalueResponse {
    id: number;
    rating: number;
    content: string | null;
    user_id: number;
    advice_id: number;
    created_at: Date;
    updated_at: Date;
    user: {
      user_id: number;
      created_at: Date;
      full_name: string;
      proof: string;
    };
  }