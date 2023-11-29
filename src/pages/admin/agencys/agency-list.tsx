import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuilding } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import ClipLoader from 'react-spinners/ClipLoader';
import NextNProgress from 'nextjs-progressbar';
import $ from 'jquery';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import humps from 'humps';
import * as useJwt from '../../../features/auth/useJwt';
import config from '../../../consts/config';
import AdminLayout from '../../../components/layouts/Admin/AdminLayout';
import CustomHead from '../../../components/elements/CustomHead/CustomHead';
import { HTTP_STATUS_CODE } from '../../../consts/constants';
import GlobalStyles from '../../../styles/Global.module.css';
import AdminStyles from '../../../styles/Admin.module.css';
import 'react-toastify/dist/ReactToastify.css';

interface Admin {
  adminIdName: string;
  id: number;
  role: string;
  validity: string;
}

interface Agency {
  id: string;
  agency_id_name: string;
  shop_name: string;
  agency_url_key: string;
  postal_code: string;
  address: string;
  phone_num: string;
  email: string;
  agency_name: string;
  bank_name: string;
  branch_name: string;
  deposit_type: string;
  account_num: string;
  account_name: string;
  notify_flag: string;
  validity_date: string;
  delete_flag: string;
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

const AgencyList: React.FC<{
  loginAdminRole: string;
}> = (props) => {
  const [loginAdminRole] = useState<string>(props.loginAdminRole);
  const [agencyIdName, setAgencyIdName] = useState('');
  const [address, setAddress] = useState<string>('');
  const [shopName, setShopName] = useState<string>('');
  const [agencyList, setAgencyList] = useState<Agency[]>([]);
  const router = useRouter();
  const csLoading = (flag: boolean) => {
    if (flag) {
      $('#csLoader').css('display', 'flex');
    } else {
      $('#csLoader').css('display', 'none');
    }
  };

  const handleChangeAgencyIdName = (event) => {
    setAgencyIdName(event.target.value);
  };
  const handleChangeAddress = (event) => {
    setAddress(event.target.value);
  };
  const handleChangeShopName = (event) => {
    setShopName(event.target.value);
  };
  const onSearch = () => {
    const body = {
      agency_id_name: agencyIdName,
      address,
      shop_name: shopName,
    };
    setAgencyList([]);
    csLoading(true);
    const url = config.backendUrl + config.getAgenciesUrl;
    const https = require('https');
    const post_data = JSON.stringify({ agency: body });
    const post_options = {
      path: url,
      method: 'POST',
      headers: {
        Authorization: config.tokenType + useJwt.getAdminToken(),
        'Content-Type': 'application/json',
      },
    };
    const post_req = https.request(post_options, (res) => {
      res.setEncoding('utf8');
      res.on('data', (chunk: string) => {
        csLoading(false);
        const agencyArray = JSON.parse(chunk).agency;
        if (agencyArray) {
          setAgencyList(agencyArray);
        } else {
          toast.error('代理店情報が見つかりません。', { autoClose: 2000 });
        }
      });
    });
    post_req.write(post_data);
    post_req.end();
  };
  const onConfirm = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>, ind: number) => {
    const agency = agencyList[ind];

    router.push(
      {
        pathname: config.frontAdminAgencyIndexUrl,
        query: {
          agency_id: agency.id,
          agency_id_name: agency.agency_id_name,
          shop_name: agency.shop_name,
          agency_url_key: agency.agency_url_key,
          postal_code: agency.postal_code,
          address: agency.address,
          phone_num: agency.phone_num,
          email: agency.email,
          agency_name: agency.agency_name,
          bank_name: agency.bank_name,
          branch_name: agency.branch_name,
          deposit_type: agency.deposit_type,
          account_num: agency.account_num,
          account_name: agency.account_name,
          notify_flag: agency.notify_flag,
          validityDate: agency.validity_date,
          delete_flag: agency.delete_flag,
        },
      },
      config.frontAdminAgencyIndexUrl
    );
  };

  return (
    <>
      <CustomHead title='管理画面 代理店検索 | コインパーキング24' />
      <AdminLayout loginAdminRole={loginAdminRole}>
        <NextNProgress height={5} options={{ easing: 'ease', speed: 400, showSpinner: false }} />
        <div className={AdminStyles.container}>
          <div className={GlobalStyles['loader-container']} id='csLoader'>
            <ClipLoader color={'#fff'} size={60} />
          </div>

          <div className={AdminStyles['title-left']}>
            <div className={AdminStyles.icon}>
              <FontAwesomeIcon icon={faBuilding} />
            </div>
            <span>代理店検索</span>
          </div>

          <div className={AdminStyles['search-container']}>
            <div className={AdminStyles['search-item-container']}>
              <div className={AdminStyles['search-item-title-container']}>
                <div className={AdminStyles['search-item-title']}>絞り込み検索</div>
              </div>
            </div>
            <div className={AdminStyles['search-item-container']}>
              <div className={AdminStyles['search-item-title-container']}>
                <div className={AdminStyles['search-item-title']}>代理店ID</div>
              </div>
              <input
                type='text'
                className={AdminStyles['search-item-input']}
                onChange={handleChangeAgencyIdName}
                value={agencyIdName}
              />
            </div>
            <div className={AdminStyles['search-item-container']}>
              <div className={AdminStyles['search-item-title-container']}>
                <div className={AdminStyles['search-item-title']}>代理店名</div>
              </div>
              <input
                type='text'
                className={AdminStyles['search-item-input']}
                onChange={handleChangeShopName}
                value={shopName}
              />
            </div>
            <div className={AdminStyles['search-item-container']}>
              <div className={AdminStyles['search-item-title-container']}>
                <div className={AdminStyles['search-item-title']}>住所</div>
              </div>
              <input
                type='text'
                className={AdminStyles['search-item-input']}
                onChange={handleChangeAddress}
                value={address}
              />
            </div>
            <div className={`${AdminStyles['search-btn-container']}`}>
              <button className={AdminStyles['search-btn']} onClick={onSearch}>
                検索
              </button>
            </div>
          </div>
          <div className={AdminStyles['right-btn-container']}>
            <Link href={config.frontAdminAgencyAddAgencyUrl} className={AdminStyles.link}>
              代理店を登録
            </Link>
          </div>
          <div className={AdminStyles['tb-container']}>
            <div className={AdminStyles.tb}>
              <div className={AdminStyles['tb-header']}>
                <div className={AdminStyles['agency-list-col1']}>No.</div>
                <div className={AdminStyles['agency-list-col2']}>代理店ID</div>
                <div className={AdminStyles['agency-list-col3']}>代理店名</div>
                <div className={AdminStyles['agency-list-col4']}>住所</div>
                <div className={AdminStyles['agency-list-col5']}>操作</div>
              </div>
              {agencyList.map((data, index) => (
                <div key={index}>
                  <div className={AdminStyles['tb-item']}>
                    <div className={AdminStyles['agency-list-col1']}>{index + 1}</div>
                    <div className={AdminStyles['agency-list-col2']}>{data.agency_id_name}</div>
                    <div className={AdminStyles['agency-list-col3']}>{data.shop_name}</div>
                    <div className={AdminStyles['agency-list-col4']}>{data.address}</div>
                    <div className={AdminStyles['agency-list-col5']}>
                      <a className={AdminStyles.link} onClick={(e) => onConfirm(e, index)}>
                        編集
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <ToastContainer />
      </AdminLayout>
    </>
  );
};

export default AgencyList;
