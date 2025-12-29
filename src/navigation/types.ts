import type { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  VerifyEmail: { email?: string } | undefined;
  VerifyPhone: { phone?: string } | undefined;
  ResetPassword: { reset_token: string };
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList> | undefined;
  Home: undefined;
  Profile: undefined;
  UpdateProfile: undefined;
  ContractorList: {
    scCode: string;
    serviceTitle: string;
    serviceTypeId: number;
    mainCategoryId: number;
    categoryId: number;
  };
  QuoteRequest: {
    memberSlugs: string[];
    serviceTypeId: number;
    mainCategoryId: number;
    categoryId: number;
    serviceTitle: string;
    leadEndpoint?: 'memberleadbyslug' | 'generalleadv1';
  };
};
