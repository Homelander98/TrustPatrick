export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  VerifyEmail: { email?: string } | undefined;
  ResetPassword: { reset_token: string };
};

export type RootStackParamList = {
  Auth: undefined;
  Home: undefined;
  Profile: undefined;
  UpdateProfile: undefined;
  ContractorList: { scCode: string; serviceTitle: string };
  QuoteRequest: {
    memberSlugs: string[];
    serviceTypeId: number;
    mainCategoryId: number;
    categoryId: number;
    serviceTitle: string;
  };
};
