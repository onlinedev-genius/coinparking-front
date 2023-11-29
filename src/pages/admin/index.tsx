import React, { useState } from 'react';
import ClipLoader from 'react-spinners/ClipLoader';
import { ToastContainer } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import NextNProgress from 'nextjs-progressbar';
import { faHome } from '@fortawesome/free-solid-svg-icons';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import AdminLayout from '../../components/layouts/Admin/AdminLayout';
import CustomHead from '../../components/elements/CustomHead/CustomHead';
import { getLoginAdmin } from '../../features/admin/api/getLoginAdmin';
import { redirectPage } from '../../features/redirects/redirect';
import config from '../../consts/config';
import { fetchApi } from '../../features/api/fetchApi'
import { checkAdminAccessTokenAndRedirect } from '../../features/auth/checkLogin';
import GlobalStyles from '../../styles/Global.module.css';
import AdminStyles from '../../styles/Admin.module.css';
import 'react-toastify/dist/ReactToastify.css';
import { AdminInterface } from '../../interfaces/admin';

export const getServerSideProps: GetServerSideProps = async (context: GetServerSidePropsContext) => {
  const adminAccessToken = context.req.cookies.adminAccessToken;
  // ログイン中の管理者の情報を取得
  let admin: AdminInterface;
  try {
    const getAdminUrl = config.backendUrl + config.getAdminUrl.replace('{id}', '');
    const result = await getLoginAdmin({
      adminAccessToken: adminAccessToken,
      getAdminUrl: getAdminUrl,
      tokenType: config.tokenType,
      redirectUrl: config.frontAdminLogoutUrl,
      fetchApi: fetchApi,
      checkAdminAccessTokenAndRedirect: checkAdminAccessTokenAndRedirect,
      redirectPage: redirectPage,
    });
    if (result.redirect) { // Admin Access Tokenが正常に読み込めない場合
      // Admin 強制Logoutを実行しLogin画面へリダイレクト
      return { redirect: result.redirect };
    }
    admin = result.admin;
  } catch (error) {
    console.error('Error fetching loginAdmin:', error.message);
    if (error instanceof UnauthorizedError) { //401 Unauthorized
      // Admin 強制Logoutを実行しLogin画面へリダイレクト
      return redirectPage({redirectUrl:config.frontAdminLogoutUrl});
    }
    throw error;
  }
  const loginAdminRole = admin.role;
  const loginAdminAdminIdName = admin.adminIdName;

  return {
    props: {
      loginAdminRole,
      loginAdminAdminIdName,
    },
  };
};

const Admin: React.FC<{
  loginAdminRole: string;
  loginAdminAdminIdName: string;
}> = (props) => {
  const [loginAdminRole] = useState<string>(props.loginAdminRole);
  const [loginAdminAdminIdName] = useState<string>(props.loginAdminAdminIdName);

  return (
    <>
      <CustomHead title='管理画面 | コインパーキング24' />
      <AdminLayout loginAdminRole={loginAdminRole}>
        <NextNProgress
          height={5}
          options={{
            easing: 'ease',
            speed: 400,
            showSpinner: false,
          }}
        />
        <div className={AdminStyles.container}>
          <div className={GlobalStyles['loader-container']} id='csLoader'>
            <ClipLoader color={'#fff'} size={60} />
          </div>

          <div className={AdminStyles['title-left']}>
            <div className={AdminStyles.icon}>
              <FontAwesomeIcon icon={faHome} />
            </div>
            <span>TOP</span>
          </div>
          <div className={AdminStyles['top-container']}>
            <div className={AdminStyles['welcome-message-container']}>
              <span className={AdminStyles['welcome-message']}>
                ようこそ、
                {loginAdminAdminIdName}
                さん
              </span>
            </div>
          </div>
        </div>
        <ToastContainer />
      </AdminLayout>
    </>
  );
};

export default Admin;
class UnauthorizedError extends Error {}
