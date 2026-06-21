// Raw account row from `user_information.account_info`
export type AccountRow = {
  username: string;
  user_email: string;
  password: string; // bcrypt hash
};
