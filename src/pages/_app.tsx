import type { AppProps } from 'next/app';
import React, { Router } from 'next/router';

import NProgress from 'nprogress';

import '../styles/globals.css';

Router.events.on('routeChangeStart', () => NProgress.start());
Router.events.on('routeChangeComplete', () => NProgress.done());
Router.events.on('routeChangeError', () => NProgress.done());

const MyApp = ({ Component, pageProps }: AppProps) => {
  let code: React.ReactElement = <></>;
  code = (
    <>
      <Component {...pageProps} />
    </>
  );
  return code;
};

export default MyApp;
