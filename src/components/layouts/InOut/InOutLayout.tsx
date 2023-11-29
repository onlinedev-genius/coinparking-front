import React, { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/router';
import Footer from '../../elements/footer/Footer';
import config from '../../../consts/config';

type pageProps = {
  children: ReactNode;
};
const InOutLayout: React.FC<pageProps> = ({ children }) => {
  const router = useRouter();
  const { asPath } = useRouter();

  useEffect(() => {
    if (asPath === '' || asPath === config.frontOutUrl.replace('/{place-url-key}', '')) {
      if (localStorage.getItem('place_url_key')) {
        router.replace(config.frontOutUrl.replace('{place-url-key}', localStorage.getItem('place_url_key')));
      } else {
        router.replace(config.frontOutUrl.replace('/{place-url-key}', ''));
      }
    }
  }, [asPath, router, children]);

  return (
    <div>
      <div>{children}</div>
      <Footer />
    </div>
  );
};

export default InOutLayout;
