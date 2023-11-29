import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ClipLoader from 'react-spinners/ClipLoader';
import moment, { MomentInput } from 'moment';
import $ from 'jquery';
import humps from 'humps';
import { GetServerSideProps } from 'next';
import CustomHead from '../../components/elements/CustomHead/CustomHead';
import * as useJwt from '../../features/auth/useJwt';
import config from '../../consts/config';
import { HTTP_STATUS_CODE } from '../../consts/constants';
import GlobalStyles from '../../styles/Global.module.css';
import styles from './AgencyHistory.module.css';

interface Agency {
  id: string;
  shopName: string;
  validityDate: string;
}

interface Reward {
  rewardDate: string;
  price: string;
  status: string;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  let getAgencyUrl = config.backendUrl + config.getAgencyUrl.replace('{id}', '');
  const token = context.req.cookies.agencyAccessToken;
  if (!token) {
    return {
      redirect: {
        destination: config.frontAgencyLogoutUrl,
        permanent: false,
      },
    };
  }
  const res = await fetch(getAgencyUrl, {
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

  const agency = humps.camelizeKeys((await res.json()).agency) as Agency;
  const { id } = agency;
  const { shopName } = agency;
  const { validityDate } = agency;

  return {
    props: {
      id,
      shopName,
      validityDate,
    },
  };
};

const AgencyRewards: React.FC<{
  id: string;
  shopName: string;
  validityDate: string;
}> = (props) => {
  const [shopName, setShopName] = useState<string>('');
  const [disPayPrice, setDisPayPrice] = useState<string>('');
  const [accessList, setAccessList] = useState<Reward[]>([]);
  const csLoading = (flag: boolean) => {
    if (flag) {
      $('#csLoader').css('display', 'flex');
    } else {
      $('#csLoader').css('display', 'none');
    }
  };

  const onSearch = (id) => {
    csLoading(true);
    setAccessList([]);
    const url = config.backendUrl + config.getAgencyRewardsUrl;
    const body = {
      agency_id_name: id,
    };
    const https = require('https');
    const postData = JSON.stringify({ reward: body });
    const postOptions = {
      path: url,
      method: 'POST',
      headers: {
        Authorization: config.tokenType + useJwt.getAgencyToken(),
        'Content-Type': 'application/json',
      },
    };
    const postReq = https.request(postOptions, (res) => {
      res.setEncoding('utf8');
      res.on('data', (chunk: string) => {
        csLoading(false);
        const rewardList: Reward[] = humps.camelizeKeys(JSON.parse(chunk).reward) as Reward[];
        if (rewardList) {
          const list = [];
          let disPrice = 0;

          for (const element of rewardList) {
            const WeekChars = ['日', '月', '火', '水', '木', '金', '土'];
            const dObj = new Date(element.rewardDate);
            const wDay = dObj.getDay();
            if (element.status === '完了') {
              disPrice += 0;
            } else {
              disPrice += parseInt(element.price, 10);
            }
            element.rewardDate = `${moment(element.rewardDate as MomentInput).format('YYYY/MM/DD')}(${
              WeekChars[wDay]
            })${moment(element.rewardDate).format('hh:mm:ss')}`;
            element.price = `¥${element.price.toLocaleString()}`;
            list.push(element);
          }
          if (disPrice > 0) {
            setDisPayPrice(`¥${disPrice.toLocaleString()}`);
          }
          setAccessList(list as Reward[]);
        } else {
          toast.error('代理店ID/パスワードをご確認ください。', { autoClose: 2000 });
        }
      });
    });
    postReq.write(postData);
    postReq.end();
  };

  useEffect(() => {
    setShopName(props.shopName);
    onSearch(props.id);
  }, [props]);

  return (
    <>
      <CustomHead title='代理店管理画面 振込履歴 | コインパーキング24' />
      <div className={styles.container}>
        <div className={GlobalStyles['loader-container']} id='csLoader'>
          <ClipLoader color={'#fff'} size={60} />
        </div>

        <div className={styles.title}>振込履歴</div>
        <div className={`${GlobalStyles['cs-flex']} ${GlobalStyles['mt20px']}`}>
          <div className={styles.subtitle}>{shopName}</div>
        </div>
        <div className={`${GlobalStyles['cs-flex']} ${GlobalStyles['mt20px']}`}>
          <div className={styles.subtitle}>未振込の報酬金額：</div>
          <div className={`${styles.subtitle} ${GlobalStyles['w400px']} ${styles.price}`}>¥1,000{disPayPrice}</div>
        </div>
        <div className={GlobalStyles['cs-flex']}>
          <div className={`${styles.itemtitle} ${GlobalStyles['w300px']}`}>
            ※未振込の報酬金額は¥10,000を超えた月の翌月末(土日祝日
            <br />
            を挟む場合は翌営業日)に振り込まれます。
          </div>
        </div>
        <div className={`${GlobalStyles['cs-flex']} ${GlobalStyles['mt20px']}`}>
          <div className={styles.list}>
            <div className={styles.tb_container}>
              <div className={styles.tb_header}>
                <div className={styles.col1}>No.</div>
                <div className={styles.col2}>年月日</div>
                <div className={styles.col3}>振込金額</div>
                <div className={styles.col4}>ステータス</div>
              </div>
              {accessList.map((data, index) => (
                <div key={index}>
                  <div className={styles.tb_item}>
                    <div className={styles.col1}>{index + 1}</div>
                    <div className={styles.col2}>{data.rewardDate}</div>
                    <div className={styles.col3}>{data.price}</div>
                    <div className={styles.col4}>{data.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AgencyRewards;
