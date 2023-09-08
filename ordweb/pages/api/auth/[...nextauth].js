import NextAuth from "next-auth";
import TwitterProvider from "next-auth/providers/twitter";
export const authOptions = {
  // Configure one or more authentication providers
  providers: [
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID,
      clientSecret: process.env.TWITTER_CLIENT_SECRET,

      callbacks: {
        async signIn({ user, account, profile, email, credentials }) {
          console.log("ACCOUNT", account);
          return true;
        },
        async redirect({ url, baseUrl }) {
          console.log(url, baseUrl);
          return baseUrl;
        },
        async session({ session, token, user }) {
          console.log(session, token, user);
          return session;
        },
        async jwt({ token, user, account, profile, isNewUser }) {
          console.log(token, user, account, profile, isNewUser);
          return token;
        },
      },
      version: "2.0",
    }),
    // ...add more providers here
  ],
};
export default NextAuth(authOptions);
