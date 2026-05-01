import NextAuth from 'next-auth';
import AzureADB2C from 'next-auth/providers/azure-ad-b2c';
import { authConfig } from './auth.config';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  debug: true,
  providers: [
    AzureADB2C({
      clientId: process.env.AUTH_AZURE_AD_B2C_CLIENT_ID,
      clientSecret: process.env.AUTH_AZURE_AD_B2C_CLIENT_SECRET,
      // 1. Vẫn giữ nguyên Issuer có mã GUID để NextAuth so sánh và xác thực Token hợp lệ
      issuer: `https://${process.env.AUTH_AZURE_AD_B2C_TENANT_NAME}.b2clogin.com/${process.env.AUTH_AZURE_AD_B2C_TENANT_ID}/v2.0/`,

      // 2. KHAI BÁO TRỰC TIẾP CÁC ENDPOINT ĐỂ NEXTAUTH KHÔNG TỰ ĐỘNG TÌM KIẾM NỮA
      authorization: {
        url: `https://${process.env.AUTH_AZURE_AD_B2C_TENANT_NAME}.b2clogin.com/${process.env.AUTH_AZURE_AD_B2C_TENANT_NAME}.onmicrosoft.com/${process.env.AUTH_AZURE_AD_B2C_PRIMARY_USER_FLOW}/oauth2/v2.0/authorize`,
        params: {
          //scope: `offline_access openid profile ${process.env.AUTH_AZURE_AD_B2C_CLIENT_ID}`,
          scope: `offline_access openid profile ${process.env.AUTH_AZURE_AD_B2C_DEMO_READ_SCOPE} ${process.env.AUTH_AZURE_AD_B2C_DEMO_WRITE_SCOPE}`,
          response_type: 'code',
        },
      },
      token: `https://${process.env.AUTH_AZURE_AD_B2C_TENANT_NAME}.b2clogin.com/${process.env.AUTH_AZURE_AD_B2C_TENANT_NAME}.onmicrosoft.com/${process.env.AUTH_AZURE_AD_B2C_PRIMARY_USER_FLOW}/oauth2/v2.0/token`,
      jwks_endpoint: `https://${process.env.AUTH_AZURE_AD_B2C_TENANT_NAME}.b2clogin.com/${process.env.AUTH_AZURE_AD_B2C_TENANT_NAME}.onmicrosoft.com/${process.env.AUTH_AZURE_AD_B2C_PRIMARY_USER_FLOW}/discovery/v2.0/keys`,
      profile(profile: {
        sub?: string;
        given_name?: string;
        name?: string;
        emails?: string[];
      }) {
        return {
          id: profile.sub,
          name: profile.given_name || profile.name,
          email: profile.emails?.[0] || null,
          image: null,
        };
      },
    }),
  ],
});
