import { IncomingMessage } from 'http';
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ClipLoader from 'react-spinners/ClipLoader';
import $ from 'jquery';
import moment, { MomentInput } from 'moment';
import humps from 'humps';
import { GetServerSideProps } from 'next';
import YearMonthDatePicker from '../../components/elements/input/YearMonthDatePicker';
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

interface Sales {
  soldAt: string;
  price: string;
  placeName: string;
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

const AgencyHistory: React.FC<{
  id: string;
  shopName: string;
  validityDate: string;
}> = (props) => {
  const [agencyId, setAgencyId] = useState<string>(props.id);
  const [shopName, setShopName] = useState<string>(props.shopName);
  const [searchDate, setSearchDate] = useState<string>(moment().format('YYYY-MM'));
  const [accessList, setAccessList] = useState<Sales[]>([]);
  const csLoading = (flag: boolean) => {
    if (flag) {
      $('#csLoader').css('display', 'flex');
    } else {
      $('#csLoader').css('display', 'none');
    }
  };

  useEffect(() => {}, [props]);

  const onSearch = (start: string) => {
    const startDate = moment(start);
    const body = {
      id: agencyId,
      start_date: `${startDate.format('YYYY-MM-01')}`,
      end_date: `${startDate.format('YYYY-MM')}-${startDate.daysInMonth()}`,
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
        Authorization: config.tokenType + useJwt.getAgencyToken(),
        'Content-Type': 'application/json',
      },
    };
    const postReq = https.request(postOptions, (res: IncomingMessage) => {
      res.setEncoding('utf8');
      res.on('data', (chunk: string) => {
        csLoading(false);
        const saleList: Sales[] = humps.camelizeKeys(JSON.parse(chunk).sale) as Sales[];
        if (saleList) {
          const list: Sales[] = [];
          moment.locale('ja', {
            weekdaysShort: ['日', '月', '火', '水', '木', '金', '土'],
          });
          for (const element of saleList) {
            element.soldAt = moment(element.soldAt as MomentInput)
              .locale('ja')
              .format('yyyy/MM/DD(ddd) HH:mm:ss');
            element.price = `¥${element.price.toLocaleString()}`;
            list.push(element);
          }
          setAccessList(list as Sales[]);
        } else {
          toast.error('アクセス履歴が見つかりません。', { autoClose: 2000 });
        }
      });
    });
    postReq.write(postData);
    postReq.end();
  };

  const handleChangeSearchDate = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.toString();
    setSearchDate(newValue);
    onSearch(newValue);
  };

  return (
    <>
      <CustomHead title='代理店管理画面 アクセス履歴 | コインパーキング24' />
      <div className={styles.container}>
        <div className={GlobalStyles['loader-container']} id='csLoader'>
          <ClipLoader color={'#fff'} size={60} />
        </div>

        <div className={styles.title}>アクセス履歴</div>
        <div className={`${GlobalStyles['cs-flex']} ${GlobalStyles['mt20px']}`}>
          <div className={styles.subtitle}>{shopName}</div>
        </div>
        <div className={`${GlobalStyles['cs-flex']} ${GlobalStyles['mt20px']}`}>
          <YearMonthDatePicker
            className={`${styles.edit_item} ${GlobalStyles['w300px']}`}
            value={searchDate}
            width={120}
            onChange={handleChangeSearchDate}
          />
        </div>
        <div className={`${GlobalStyles['cs-flex']} ${GlobalStyles['mt20px']}`}>
          <div className={styles.list}>
            <div className={styles.tb_container}>
              <div className={styles.tb_header}>
                <div className={styles.col1}>No.</div>
                <div className={styles.col2}>日時</div>
                <div className={styles.col3}>駐車場名</div>
              </div>
              {accessList.map((data, index) => (
                <div key={index}>
                  <div className={styles.tb_item}>
                    <div className={styles.col1}>{index + 1}</div>
                    <div className={styles.col2}>{data.soldAt}</div>
                    <div className={styles.col3}>{data.placeName}</div>
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

export default AgencyHistory;
