import { IncomingMessage } from 'http';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import ClipLoader from 'react-spinners/ClipLoader';
import moment, { MomentInput } from 'moment';
import NextNProgress from 'nextjs-progressbar';
import $ from 'jquery';
import { GetServerSideProps } from 'next';
import humps from 'humps';
import CustomHead from '../../../components/elements/CustomHead/CustomHead';
import * as useJwt from '../../../features/auth/useJwt';
import { DateTimeManager } from '../../../utils/DateTimeManager';
import config from '../../../consts/config';
import AdminLayout from '../../../components/layouts/Admin/AdminLayout';
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

interface Sale {
  sale_date: String;
  price: String;
  place_name: String;
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

const AdminAgencyHistory: React.FC<{
  loginAdminRole: string;
}> = (props) => {
  const [loginAdminRole] = useState<string>(props.loginAdminRole);
  const [agencyId, setAgencyId] = useState<string>('');
  const [shopName, setShopName] = useState<string>('');
  const [searchDate, setSearchDate] = useState<string>(DateTimeManager.nowKebabYYYYMM());
  const [accessList, setAccessList] = useState<Sale[]>([]);
  const router = useRouter();

  const csLoading = (flag: boolean) => {
    if (flag) {
      $('#csLoader').css('display', 'flex');
    } else {
      $('#csLoader').css('display', 'none');
    }
  };

  useEffect(() => {
    if (!useJwt.isAdminLoggedIn()) {
      router.replace(config.frontAdminLogoutUrl);
    }

    const info = router.query;
    if (info) {
      setAgencyId(info.agency_id as string);
      setShopName(info.shop_name as string);
    }
  }, [props, router]);

  const onSearch = (start: string) => {
    const startDate = moment(start, 'YYYY年MM月');
    const body = {
      id: agencyId,
      start_date: `${startDate.year()}-${startDate.format('MM')}-01`,
      end_date: `${startDate.year()}-${startDate.format('MM')}-${startDate.daysInMonth()}`,
    };

    setAccessList([]);
    csLoading(true);
    const url = config.backendUrl + config.getAgencySalesUrl;
    const https = require('https');
    const postData = JSON.stringify({ sale: body });
    const postOptions = {
      path: url,
      method: 'POST',
      headers: {
        Authorization: config.tokenType + useJwt.getAdminToken(),
        'Content-Type': 'application/json',
      },
    };
    const postReq = https.request(postOptions, (res: IncomingMessage) => {
      res.setEncoding('utf8');
      res.on('data', (chunk: string) => {
        csLoading(false);
        const sales: Sale[] = JSON.parse(chunk).sale;
        if (sales) {
          const list: Sale[] = [];
          moment.locale('ja', {
            weekdaysShort: ['日', '月', '火', '水', '木', '金', '土'],
          });
          for (const element of sales) {
            element.sale_date = moment(element.sale_date as MomentInput)
              .locale('ja')
              .format('yyyy/MM/DD(ddd) HH:mm:ss');
            element.price = `¥${element.price.toLocaleString()}`;
            list.push(element);
          }
          setAccessList(list as Sale[]);
        } else {
          toast.error('アクセス履歴が見つかりません。', { autoClose: 2000 });
        }
      });
    });
    postReq.write(postData);
    postReq.end();
  };

  const handleChangeSearchDate = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setSearchDate(newValue);
    onSearch(newValue);
  };

  return (
    <>
      <CustomHead title='管理画面 代理店 アクセス履歴 | コインパーキング24' />
      <AdminLayout loginAdminRole={loginAdminRole}>
        <NextNProgress height={5} options={{ easing: 'ease', speed: 400, showSpinner: false }} />
        <div className={AdminStyles.container}>
          <div className={GlobalStyles['loader-container']} id='csLoader'>
            <ClipLoader color={'#fff'} size={60} />
          </div>

          <div className={AdminStyles['title-left']}>
            <span>アクセス履歴</span>
          </div>
          <div className={AdminStyles['subtitle']}>{shopName}</div>
          <div className={AdminStyles['search-container']}>
            <div className={AdminStyles['search-item-container']}>
              <div className={AdminStyles['search-item-title-container']}>
                <div className={AdminStyles['search-item-title']}>絞り込み検索</div>
              </div>
            </div>
            <div className={AdminStyles['search-item-container']}>
              <div className={AdminStyles['search-item-title-container']}>
                <div className={AdminStyles['search-item-title']}>年月</div>
              </div>
              <input
                type='month'
                className={AdminStyles['search-item-input-month']}
                value={searchDate}
                onChange={handleChangeSearchDate}
              ></input>
            </div>
          </div>
          <div className={AdminStyles['tb-container']}>
            <div className={AdminStyles.tb}>
              <div className={AdminStyles['tb-header']}>
                <div className={AdminStyles['agency-histry-col1']}>No.</div>
                <div className={AdminStyles['agency-histry-col2']}>日時</div>
                <div className={AdminStyles['agency-histry-col3']}>駐車場名</div>
              </div>
              {accessList.map((data, index) => (
                <div key={index}>
                  <div className={AdminStyles['tb-item']}>
                    <div className={AdminStyles['agency-histry-col1']}>{index + 1}</div>
                    <div className={AdminStyles['agency-histry-col2']}>{data.sale_date}</div>
                    <div className={AdminStyles['agency-histry-col3']}>{data.place_name}</div>
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

export default AdminAgencyHistory;
