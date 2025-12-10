type UserRecord=
    {
        email: string;
        password: string;
        balance: { balance: number };
      }


export const USERS: Record<
  string,UserRecord
 
> = {};