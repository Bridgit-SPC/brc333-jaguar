import React from "react";
import App from "next/app";
import "../app/globals.css";
import favicon from "../public/favicon.ico";
import { SessionProvider } from "next-auth/react";

export default function MyApp({ Component, pageProps }) {
  return (
    <SessionProvider session={pageProps.session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
}
