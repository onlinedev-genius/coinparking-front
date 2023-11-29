import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import ClipLoader from 'react-spinners/ClipLoader';
import NextNProgress from 'nextjs-progressbar';
import { GetServerSideProps } from 'next';
import humps from 'humps';
import config from '../../../consts/config';
import AdminLayout from '../../../components/layouts/Admin/AdminLayout';
import CustomHead from '../../../components/elements/CustomHead/CustomHead';
import { HTTP_STATUS_CODE } from '../../../consts/constants';
import GlobalStyles from '../../../styles/Global.module.css';
import AdminStyles from '../../../styles/Admin.module.css';

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
  return {
    props: {
      loginAdminRole,
    },
  };
};

const Agency: React.FC<{
  loginAdminRole: string;
}> = (props) => {
  const [loginAdminRole] = useState<string>(props.loginAdminRole);
  const [agencyId, setAgencyId] = useState<string>('');
  const [agencyIdName, setAgencyIdName] = useState<string>('');
  const [shopName, setShopName] = useState<string>('');
  const [agencyUrlKey, setAgencyUrlKey] = useState<string>('');
  const [postalCode, setPostalCode] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [phoneNum, setPhoneNum] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [agencyName, setAgencyName] = useState<string>('');
  const [bankName, setBankName] = useState<string>('');
  const [branchName, setBranchName] = useState<string>('');
  const [depositType, setDepositType] = useState<string>('0');
  const [accountNum, setAccountNum] = useState<string>('');
  const [accountName, setAccountName] = useState<string>('');
  const [notifyFlag, setNotifyFlag] = useState<string>('');
  const [validityDate, setValidityDate] = useState<string>('');
  const [deleteFlag, setDeleteFlag] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    const info = router.query;
    if (info.agency_id) {
      setAgencyId(info.agency_id as string);
      setShopName(info.shop_name as string);
      setAgencyUrlKey(info.agency_url_key as string);
      setAgencyIdName(info.agency_id_name as string);
      setPostalCode(info.postal_code as string);
      setAddress(info.address as string);
      setPhoneNum(info.phone_num as string);
      setEmail(info.email as string);
      setAgencyName(info.agency_name as string);
      setBankName(info.bank_name as string);
      setBranchName(info.branch_name as string);
      setDepositType(info.deposit_type as string);
      setAccountNum(info.account_num as string);
      setAccountName(info.account_name as string);
      setNotifyFlag(info.notify_flag as string);
      setValidityDate(info.validityDate as string);
      setDeleteFlag(info.delete_flag as string);
    }
  }, [props, router]);

  const toAgencyInfo = () => {
    router.push(
      {
        pathname: config.frontAdminAgencyRegistryUrl,
        query: {
          id: agencyId,
        },
      },
      config.frontAdminAgencyRegistryUrl
    );
  };
  const toAgencyHistory = () => {
    router.push(
      {
        pathname: config.frontAdminAgencyHistoryUrl,
        query: {
          agency_id: agencyId,
          shop_name: shopName,
        },
      },
      config.frontAdminAgencyHistoryUrl
    );
  };
  const toAgencySales = () => {
    router.push(
      {
        pathname: config.frontAdminAgencySalesUrl,
        query: {
          agency_id: agencyId,
          shop_name: shopName,
        },
      },
      config.frontAdminAgencySalesUrl
    );
  };
  const toAgencyRewards = () => {
    router.push(
      {
        pathname: config.frontAdminAgencyRewardsUrl,
        query: {
          agency_id: agencyId,
          shop_name: shopName,
        },
      },
      config.frontAdminAgencyRewardsUrl
    );
  };
  return (
    <>
      <CustomHead title='管理画面 代理店管理 | コインパーキング24' />
      <AdminLayout loginAdminRole={loginAdminRole}>
        <NextNProgress height={5} options={{ easing: 'ease', speed: 400, showSpinner: false }} />
        <div className={AdminStyles.container}>
          <div className={GlobalStyles['loader-container']} id='csLoader'>
            <ClipLoader color={'#fff'} size={60} />
          </div>

          <div className={AdminStyles['title-left']}>
            <span>代理店管理</span>
          </div>
          <div className={AdminStyles['subtitle']}>{shopName}</div>
          <div className={`${AdminStyles['agency-admin-menu-container']}`}>
            <ul>
              <li>
                <a className={AdminStyles.link} onClick={toAgencyInfo}>
                  基本情報登録
                </a>
              </li>
              <li>
                <a className={AdminStyles.link} onClick={toAgencyHistory}>
                  アクセス履歴
                </a>
              </li>
              <li>
                <a className={AdminStyles.link} onClick={toAgencySales}>
                  売上履歴
                </a>
              </li>
              <li>
                <a className={AdminStyles.link} onClick={toAgencyRewards}>
                  振込履歴
                </a>
              </li>
            </ul>
          </div>
        </div>
      </AdminLayout>
    </>
  );
};

export default Agency;
