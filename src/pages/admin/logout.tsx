import { GetServerSideProps, GetServerSidePropsResult } from 'next';
import config from '../../consts/config';

interface RedirectProps {
  destination: string;
  permanent: boolean;
}

export const getServerSideProps: GetServerSideProps<RedirectProps> = (context) => {
  // Delete JWT Token
  const accessAdminTokenCookie = `${config.storageAdminTokenKeyName}=; Max-Age=0; Path=/`;
  context.res.setHeader('Set-Cookie', [accessAdminTokenCookie]);

  const redirect: GetServerSidePropsResult<RedirectProps> = {
    redirect: {
      destination: config.frontAdminLoginUrl,
      permanent: false,
    },
  };

  return Promise.resolve(redirect);
};

const AdminLogout = () => <div>Redirecting...</div>;

export default AdminLogout;
