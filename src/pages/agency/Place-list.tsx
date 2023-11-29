import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import ClipLoader from 'react-spinners/ClipLoader';
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
  shopName: string;
  validityDate: string;
}

interface Places {
  place_url_key: string;
  place_name: string;
  id: string;
  image: string;
  space_num_list: string;
  agency_id: string;
  price: string;
  pre_minute: string;
  created_at: string;
  updated_at: string;
  deleted_at: string;
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
  const { shopName } = agency;
  const { validityDate } = agency;

  return {
    props: {
      shopName,
      validityDate,
    },
  };
};

const PlaceList: React.FC<{
  shopName: string;
  validityDate: string;
}> = (props) => {
  const [shopName, setShopName] = useState<string>('');
  const [placeList, setPlaceList] = useState<Places[]>([]);
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
    const body = {
      id: '',
    };
    setPlaceList([]);
    const url = config.backendUrl + config.getPlacesUrl;
    const https = require('https');
    const postData = JSON.stringify(body);
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
        const placeArray = JSON.parse(chunk).place;
        if (placeArray) {
          const list = [];

          for (const element of placeArray) {
            list.push(element);
          }
          setPlaceList(list as Places[]);
        } else {
          toast.error('駐車場情報が見つかりません。', { autoClose: 2000 });
        }
      });
    });
    postReq.write(postData);
    postReq.end();
  };

  useEffect(() => {
    setShopName(props.shopName);
    onSearch();
  }, [props]);

  return (
    <>
      <CustomHead title='代理店管理画面 駐車場一覧 | コインパーキング24' />
      <div className={styles.container}>
        <div className={GlobalStyles['loader-container']} id='csLoader'>
          <ClipLoader color={'#fff'} size={60} />
        </div>

        <div className={styles.title}>駐車場一覧</div>
        <div className={`${GlobalStyles['cs-flex']} ${styles.mt20px}`}>
          <div className={styles.subtitle}>{shopName}</div>
        </div>
        <div className={`${styles.btn_container} ${styles.mt30px}`}>
          <ul>
            {placeList.map((data, index) => (
              <div key={index}>
                <li>
                  {/* <a className={styles.link} onClick={(e) => toQRCodePrint(e, index)}>{data.place_name}</a> */}
                  <span>aaaaaa</span>
                </li>
              </div>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default PlaceList;
