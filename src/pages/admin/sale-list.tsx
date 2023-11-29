/* eslint-disable camelcase */
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import ClipLoader from 'react-spinners/ClipLoader';
import NextNProgress from 'nextjs-progressbar';
import moment from 'moment';
import $ from 'jquery';
import { GetServerSideProps } from 'next';
import humps from 'humps';
import CustomHead from '../../components/elements/CustomHead/CustomHead';
import * as useJwt from '../../features/auth/useJwt';
import AdminLayout from '../../components/layouts/Admin/AdminLayout';
import config from '../../consts/config';
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

interface Sales {
  place_name: string;
  sold_at: string;
  shop_name: string;
  agency_id_name: string;
  payment_type: string;
  price: string;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const getAdminUrl = config.backendUrl + config.getAdminUrl.replace('{id}', '');
  const token = context.req.cookies.adminAccessToken;

  if (!token) {
    //jwtトークンが切れている場合
    return {
      redirect: {
        destination: config.frontAdminLogoutUrl,
        permanent: false,
      },
    };
  }
  const res = await fetch(getAdminUrl, {
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
  const admin = humps.camelizeKeys((await res.json()).admin) as Admin;
  const loginAdminRole = admin.role;

  return {
    props: {
      loginAdminRole,
    },
  };
};

const SalesList: React.FC<{
  loginAdminRole: string;
}> = (props) => {
  const [loginAdminRole] = useState<string>(props.loginAdminRole);
  const [placeName, setPlaceName] = useState<string>('');
  const [agencyIdName, setAgencyIdName] = useState<string>('');
  const [shopName, setShopName] = useState<string>('');
  const [salesList, setSalesList] = useState<Sales[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!useJwt.isAdminLoggedIn()) {
      router.replace(config.frontAdminLogoutUrl);
    }
  }, [props, router]);
  const csLoading = (flag: boolean) => {
    if (flag) {
      $('#csLoader').css('display', 'flex');
    } else {
      $('#csLoader').css('display', 'none');
    }
  };

  const handleChangePlaceName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPlaceName(event.target.value);
  };
  const handleChangeagencyIdName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAgencyIdName(event.target.value);
  };
  const handleChangeShopName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShopName(event.target.value);
  };
  const onSearch = () => {
    const body = {
      place_name: placeName,
      agency_id_name: agencyIdName,
      shop_name: shopName,
    };
    setSalesList([]);
    csLoading(true);
    const url = config.backendUrl + config.adminSalesUrl;
    const https = require('https');
    const post_data = JSON.stringify({ sale: body });
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
        const saleArray = JSON.parse(chunk).sale;
        if (saleArray) {
          const list: Sales[] = [];
          moment.locale('ja', {
            weekdaysShort: ['日', '月', '火', '水', '木', '金', '土'],
          });
          for (const element of saleArray) {
            element.sold_at = moment(element.sold_at).locale('ja').format('yyyy/MM/DD(ddd) HH:mm');
            element.price = `¥${element.price.toLocaleString()}`;
            list.push(element);
          }
          setSalesList(list as Sales[]);
        } else {
          toast.error('売上情報が見つかりません。', { autoClose: 2000 });
        }
      });
    });
    post_req.write(post_data);
    post_req.end();
  };

  return (
    <>
      <CustomHead title='管理画面 売上管理 | コインパーキング24' />
      <AdminLayout loginAdminRole={loginAdminRole}>
        <NextNProgress height={5} options={{ easing: 'ease', speed: 400, showSpinner: false }} />
        <div className={AdminStyles.container}>
          <div className={GlobalStyles['loader-container']} id='csLoader'>
            <ClipLoader color={'#fff'} size={60} />
          </div>

          <div className={AdminStyles['title-left']}>
            <div className={AdminStyles.icon}>
              <FontAwesomeIcon icon={faChartLine} />
            </div>
            <span>売上管理</span>
          </div>

          <div className={AdminStyles['search-container']}>
            <div className={AdminStyles['search-item-container']}>
              <div className={AdminStyles['search-item-title-container']}>
                <div className={AdminStyles['search-item-title']}>絞り込み検索</div>
              </div>
            </div>
            <div className={AdminStyles['search-item-container']}>
              <div className={AdminStyles['search-item-title-container']}>
                <div className={AdminStyles['search-item-title']}>駐車場名</div>
              </div>
              <input
                type='text'
                className={AdminStyles['search-item-input']}
                onChange={handleChangePlaceName}
                value={placeName}
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
                <div className={AdminStyles['search-item-title']}>代理店ID</div>
              </div>
              <input
                type='text'
                className={AdminStyles['search-item-input']}
                onChange={handleChangeagencyIdName}
                value={agencyIdName}
              />
            </div>
            <div className={`${AdminStyles['search-btn-container']}`}>
              <button className={AdminStyles['search-btn']} onClick={onSearch}>
                検索
              </button>
            </div>
          </div>
          <div className={AdminStyles['tb-container']}>
            <div className={AdminStyles.tb}>
              <div className={AdminStyles['tb-header']}>
                <div className={AdminStyles['sales-list-col1']}>No.</div>
                <div className={AdminStyles['sales-list-col2']}>駐車場名</div>
                <div className={AdminStyles['sales-list-col3']}>日時</div>
                <div className={AdminStyles['sales-list-col4']}>代理店</div>
                <div className={AdminStyles['sales-list-col5']}>支払方法</div>
                <div className={AdminStyles['sales-list-col6']}>売上額</div>
              </div>
              {salesList.map((data, index) => (
                <div key={index}>
                  <div className={AdminStyles['tb-item']}>
                    <div className={AdminStyles['sales-list-col1']}>{index + 1}</div>
                    <div className={AdminStyles['sales-list-col2']}>{data.place_name}</div>
                    <div className={AdminStyles['sales-list-col3']}>{data.sold_at}</div>
                    <div className={AdminStyles['sales-list-col4']}>
                      {data.shop_name}(ID:{data.agency_id_name})
                    </div>
                    {data.payment_type === '0' && (
                      <div className={AdminStyles['sales-list-col5']}>クレジットカード</div>
                    )}
                    {data.payment_type === '1' && <div className={AdminStyles['sales-list-col5']}>PayPay</div>}
                    <div className={AdminStyles['sales-list-col6']}>{data.price}</div>
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

export default SalesList;
