import React from 'react';
import App from 'next/app';
import '../app/globals.css';
import favicon from '../public/favicon.ico';

class MyApp extends App {
  render() {
    const { Component, pageProps } = this.props;
    // You can add any global layouts or components here

    // Render the actual page component with its props
    return <Component {...pageProps} />;
  }
}

export default MyApp;


