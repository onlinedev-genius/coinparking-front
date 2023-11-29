import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ClipLoader from 'react-spinners/ClipLoader';
import moment, { MomentInput } from 'moment';
import $ from 'jquery';
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
  saleDate: string;
  placeName: string;
  price: string;
  reward: string;
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

const AgencySales: React.FC<{
  id: string;
  shopName: string;
  validityDate: string;
}> = (props) => {
  const [agencyId, setAgencyId] = useState<string>('');
  const [shopName, setShopName] = useState<string>('');
  const [searchDate, setSearchDate] = useState<string>(moment().format('YYYY-MM-DD'));
  const [accessList, setAccessList] = useState<Sales[]>([]);
  const csLoading = (flag: boolean) => {
    if (flag) {
      $('#csLoader').css('display', 'flex');
    } else {
      $('#csLoader').css('display', 'none');
    }
  };

  useEffect(() => {
    setAgencyId(props.id);
    setShopName(props.shopName);
  }, [props]);

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
        Authorization: config.tokenType + useJwt.getAgencyToken(),
        'Content-Type': 'application/json',
      },
    };
    const postReq = https.request(postOptions, (res) => {
      res.setEncoding('utf8');
      res.on('data', (chunk: string) => {
        csLoading(false);
        const saleList: Sales[] = humps.camelizeKeys(JSON.parse(chunk).sale) as Sales[];
        if (saleList) {
          const list = [];
          for (const element of saleList) {
            const WeekChars = ['日', '月', '火', '水', '木', '金', '土'];
            const dObj = new Date(element.saleDate);
            const wDay = dObj.getDay();
            element.saleDate = `${moment(element.saleDate as MomentInput).format('YYYY/MM/DD')}(${
              WeekChars[wDay]
            })${moment(element.saleDate).format('hh:mm:ss')}`;
            const rate = 0.3;
            element.reward = `¥${(parseInt(element.price, 10) * rate).toLocaleString()}`;
            element.price = `¥${element.price.toLocaleString()}`;
            list.push(element);
          }
          setAccessList(list as Sales[]);
        } else {
          toast.error('売上履歴が見つかりません。', { autoClose: 2000 });
        }
      });
    });
    postReq.write(postData);
    postReq.end();
  };

  const handleChangeSearchDate = (event) => {
    setSearchDate(event);
    onSearch(event);
  };

  return (
    <>
      <CustomHead title='代理店管理画面 売上履歴 | コインパーキング24' />
      <div className={styles.container}>
        <div className={GlobalStyles['loader-container']} id='csLoader'>
          <ClipLoader color={'#fff'} size={60} />
        </div>

        <div className={styles.title}>売上履歴</div>
        <div className={`${GlobalStyles['cs-flex']} ${GlobalStyles['mt20px']}`}>
          <div className={styles.subtitle}>{shopName}</div>
        </div>
        <div className={`${GlobalStyles['cs-flex']} ${GlobalStyles['mt20px']}`}>
          <YearMonthDatePicker
            className={`${styles.edit_item} ${styles.w110px}`}
            value={searchDate}
            onChange={handleChangeSearchDate}
            width={120}
          />
        </div>
        <div className={`${GlobalStyles['cs-flex']} ${GlobalStyles['mt20px']}`}>
          <div className={styles.list}>
            <div className={styles.tb_container}>
              <div className={styles.tb_header}>
                <div className={styles.col1}>No.</div>
                <div className={styles.col2}>日時</div>
                <div className={styles.col3}>駐車場名</div>
                <div className={styles.col4}>売上</div>
                <div className={styles.col4}>報酬</div>
              </div>
              {accessList.map((data, index) => (
                <div key={index}>
                  <div className={styles.tb_item}>
                    <div className={styles.col1}>{index + 1}</div>
                    <div className={styles.col2}>{data.saleDate}</div>
                    <div className={styles.col3}>{data.placeName}</div>
                    <div className={styles.col4}>{data.price}</div>
                    <div className={styles.col4}>{data.reward}</div>
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

export default AgencySales;
