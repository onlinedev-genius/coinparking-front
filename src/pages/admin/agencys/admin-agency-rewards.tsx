import { IncomingMessage } from 'http';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import ClipLoader from 'react-spinners/ClipLoader';
import moment, { MomentInput } from 'moment';
import NextNProgress from 'nextjs-progressbar';
import $ from 'jquery';
import { GetServerSideProps } from 'next';
import humps from 'humps';
import CustomHead from '../../../components/elements/CustomHead/CustomHead';
import * as useJwt from '../../../features/auth/useJwt';
import config from '../../../consts/config';
import AdminLayout from '../../../components/layouts/Admin/AdminLayout';
import { HTTP_STATUS_CODE } from '../../../consts/constants';
import GlobalStyles from '../../../styles/Global.module.css';
import AdminStyles from '../../../styles/Admin.module.css';

interface Admin {
  adminIdName: string;
  id: number;
  role: string;
  validity: string;
}

interface Reward {
  rewardDate: string;
  price: string;
  status: string;
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

const AdminAgencyRewards: React.FC<{
  loginAdminRole: string;
}> = (props) => {
  const [loginAdminRole] = useState<string>(props.loginAdminRole);
  const [shopName, setShopName] = useState<string>('');
  const [disPayPrice, setDisPayPrice] = useState<string>('');
  const [rewards, setRewards] = useState<Reward[]>([]);
  const router = useRouter();

  const csLoading = (flag: boolean) => {
    if (flag) {
      $('#csLoader').css('display', 'flex');
    } else {
      $('#csLoader').css('display', 'none');
    }
  };
  const onSearch = () => {
    csLoading(true);
    setRewards([]);
    const url = config.backendUrl + config.getAgencyRewardsUrl;
    const https = require('https');
    const postData = JSON.stringify({});
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
        const rewards: Reward[] = JSON.parse(chunk).reward;
        if (rewards) {
          const list = [];
          let disPrice = 0;
          for (const element of rewards) {
            const WeekChars = ['日', '月', '火', '水', '木', '金', '土'];
            const dObj = new Date(element.rewardDate);
            const wDay = dObj.getDay();
            if (element.status !== '完了') {
              disPrice += parseInt(element.price, 10);
            }
            element.rewardDate = `${moment(element.rewardDate as MomentInput).format('YYYY/MM/DD')}(${
              WeekChars[wDay]
            })${moment(element.rewardDate as MomentInput).format('hh:mm:ss')}`;
            element.price = `¥${element.price.toLocaleString()}`;
            list.push(element);
          }
          if (disPrice > 0) {
            setDisPayPrice(`¥${disPrice.toLocaleString()}`);
          }
          setRewards(list as Reward[]);
        }
      });
    });
    postReq.write(postData);
    postReq.end();
  };

  useEffect(() => {
    const info = router.query;
    if (info) {
      setShopName(info.shop_name as string);
    }
    onSearch();
  }, [props, router]);

  return (
    <>
      <CustomHead title='管理画面 代理店 振込履歴 | コインパーキング24' />
      <AdminLayout loginAdminRole={loginAdminRole}>
        <NextNProgress height={5} options={{ easing: 'ease', speed: 400, showSpinner: false }} />
        <div className={AdminStyles.container}>
          <div className={GlobalStyles['loader-container']} id='csLoader'>
            <ClipLoader color={'#fff'} size={60} />
          </div>

          <div className={AdminStyles['title-left']}>
            <span>振込履歴</span>
          </div>
          <div className={AdminStyles.subtitle}>{shopName}</div>
          <div className={AdminStyles['reward-container']}>
            <div className={AdminStyles['reward-item-price-container']}>
              <span className={AdminStyles['reward-item-price-title']}>未振込の報酬金額：</span>
              <span className={AdminStyles['reward-item-price']}>{disPayPrice}¥10,000</span>
            </div>
            <div className={AdminStyles['reward-item-comment']}>
              <span>
                ※未振込の報酬金額は¥10,000を超えた月の翌月末(土日祝日
                <br />
                を挟む場合は翌営業日)に振り込まれます。
              </span>
            </div>
          </div>
          <div className={AdminStyles['tb-container']}>
            <div className={AdminStyles.tb}>
              <div className={AdminStyles['tb-header']}>
                <div className={AdminStyles['agency-rewards-col1']}>No.</div>
                <div className={AdminStyles['agency-rewards-col2']}>年月日</div>
                <div className={AdminStyles['agency-rewards-col3']}>振込金額</div>
                <div className={AdminStyles['agency-rewards-col4']}>ステータス</div>
              </div>
              {rewards.map((data, index) => (
                <div key={index}>
                  <div className={AdminStyles['tb-item']}>
                    <div className={AdminStyles['agency-rewards-col1']}>{index + 1}</div>
                    <div className={AdminStyles['agency-rewards-col2']}>{data.rewardDate}</div>
                    <div className={AdminStyles['agency-rewards-col3']}>{data.price}</div>
                    <div className={AdminStyles['agency-rewards-col4']}>{data.status}</div>
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

export default AdminAgencyRewards;
