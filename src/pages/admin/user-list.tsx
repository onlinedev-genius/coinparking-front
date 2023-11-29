import React, { useState } from 'react';
import { useRouter } from 'next/router';
import ClipLoader from 'react-spinners/ClipLoader';
import $ from 'jquery';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import NextNProgress from 'nextjs-progressbar';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import humps from 'humps';
import CustomHead from '../../components/elements/CustomHead/CustomHead';
import config from '../../consts/config';
import AdminLayout from '../../components/layouts/Admin/AdminLayout';
import { HTTP_STATUS_CODE } from '../../consts/constants';
import GlobalStyles from '../../styles/Global.module.css';
import AdminStyles from '../../styles/Admin.module.css';
import 'react-toastify/dist/ReactToastify.css';

interface Admin {
  adminIdName: string;
  id: number;
  role: string;
  validity: string;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const token = context.req.cookies.adminAccessToken;
  // -------------------- Get LoginAdminInfo --------------------
  const getLoginAdminUrl = config.backendUrl + config.getAdminUrl.replace('{id}', '');
  if (!token) {
    //jwtトークンが切れている場合
    return {
      redirect: {
        destination: config.frontAdminLogoutUrl,
        permanent: false,
      },
    };
  }
  const resLoginAdmin = await fetch(getLoginAdminUrl, {
    method: 'GET',
    headers: {
      Authorization: config.tokenType + token,
      'Content-Type': 'application/json',
    },
  });
  if (!resLoginAdmin.ok) {
    if (resLoginAdmin.status === HTTP_STATUS_CODE.UNAUTHORIZED) {
      // 401 Error
      return {
        redirect: {
          destination: config.frontAdminLogoutUrl,
          permanent: false,
        },
      };
    }
    throw new Error('Failed to fetch data');
  }
  const loginAdmin = humps.camelizeKeys((await resLoginAdmin.json()).admin) as Admin;
  const loginAdminRole = loginAdmin.role;

  // -------------------- Get AdminList --------------------
  const getAdminsUrl = config.backendUrl + config.getAdminsUrl;
  if (!token) {
    //jwtトークンが切れている場合
    return {
      redirect: {
        destination: config.frontAdminLogoutUrl,
        permanent: false,
      },
    };
  }
  const res = await fetch(getAdminsUrl, {
    method: 'GET',
    headers: {
      Authorization: config.tokenType + token,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) {
    if (res.status === HTTP_STATUS_CODE.UNAUTHORIZED) {
      // 401 Error
      return {
        redirect: {
          destination: config.frontAdminLogoutUrl,
          permanent: false,
        },
      };
    }
    throw new Error('Failed to fetch data');
  }

  const userList = humps.camelizeKeys((await res.json()).admins) as Admin[];
  return {
    props: {
      loginAdminRole,
      userList,
    },
  };
};

const UserList: React.FC<{
  loginAdminRole: string;
  userList: Admin[];
}> = (props) => {
  const [loginAdminRole] = useState<string>(props.loginAdminRole);
  const [userList] = useState<Admin[]>(props.userList);
  const router = useRouter();

  const csLoading = (flag: boolean) => {
    if (flag) {
      $('#csLoader').css('display', 'flex');
    } else {
      $('#csLoader').css('display', 'none');
    }
  };

  const onUpdateUser = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>, ind: number) => {
    router.push(
      {
        pathname: config.frontAdminEditUserUrl,
        query: {
          id: userList[ind].id,
        },
      },
      config.frontAdminEditUserUrl
    );
  };

  return (
    <>
      <CustomHead title='管理画面 ユーザー管理 | コインパーキング24' />
      <AdminLayout loginAdminRole={loginAdminRole}>
        <NextNProgress height={5} options={{ easing: 'ease', speed: 400, showSpinner: false }} />
        <div className={AdminStyles.container}>
          <div className={GlobalStyles['loader-container']} id='csLoader'>
            <ClipLoader color={'#fff'} size={60} />
          </div>

          <div className={AdminStyles['title-left']}>
            <div className={AdminStyles.icon}>
              <FontAwesomeIcon icon={faUser} />
            </div>
            <span>ユーザー管理</span>
          </div>
          <div className={AdminStyles['right-btn-container']}>
            <Link href={config.frontAdminAddUserUrl} className={AdminStyles.link}>
              ユーザーを登録
            </Link>
          </div>
          <div className={AdminStyles['tb-container']}>
            <div className={AdminStyles.tb}>
              <div className={AdminStyles['tb-header']}>
                <div className={AdminStyles['user-list-col1']}>No.</div>
                <div className={AdminStyles['user-list-col2']}>ユーザーID</div>
                <div className={AdminStyles['user-list-col3']}>権限</div>
                <div className={AdminStyles['user-list-col4']}>有効</div>
                <div className={AdminStyles['user-list-col5']}>操作</div>
              </div>
              {userList.map((data, index: number) => (
                <div key={index}>
                  <div className={AdminStyles['tb-item']}>
                    <div className={AdminStyles['user-list-col1']}>{index + 1}</div>
                    <div className={AdminStyles['user-list-col2']}>{data.adminIdName}</div>
                    {data.role === 'ADMIN' && <div className={AdminStyles['user-list-col3']}>管理者</div>}
                    {data.role === 'EDITOR' && <div className={AdminStyles['user-list-col3']}>編集者</div>}
                    {data.role === 'OPERATOR' && <div className={AdminStyles['user-list-col3']}>オペレーター</div>}
                    {data.validity === '1' && <div className={AdminStyles['user-list-col4']}>○</div>}
                    {data.validity === '0' && <div className={AdminStyles['user-list-col4']}>✖︎</div>}
                    <div className={AdminStyles['user-list-col5']}>
                      <a className={AdminStyles.link} onClick={(e) => onUpdateUser(e, index)}>
                        編集
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AdminLayout>
    </>
  );
};

export default UserList;
