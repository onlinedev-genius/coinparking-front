import { GetServerSideProps, GetServerSidePropsResult } from 'next';
import config from '../../consts/config';

interface RedirectProps {
  destination: string;
  permanent: boolean;
}

export const getServerSideProps: GetServerSideProps<RedirectProps> = (context) => {
  // Delete JWT Token
  const accessAgencyTokenCookie = `${config.storageAgencyTokenKeyName}=; Max-Age=0; Path=/`;
  context.res.setHeader('Set-Cookie', [accessAgencyTokenCookie]);

  const redirect: GetServerSidePropsResult<RedirectProps> = {
    redirect: {
      destination: config.frontAgencyLoginUrl,
      permanent: false,
    },
  };

  return Promise.resolve(redirect);
};

const AdminLogout = () => <div>Redirecting...</div>;

export default AdminLogout;
