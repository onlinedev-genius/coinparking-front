import React, { useState } from 'react';
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
  id: string;
  validityDate: string;
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
  const { validityDate } = agency;

  return {
    props: {
      id,
      validityDate,
    },
  };
};

const ResetPassword: React.FC<{
  id: string;
  validityDate: string;
}> = (props) => {
  const [currentPwd, setCurrentPwd] = useState<string>('');
  const [newPwd, setNewPwd] = useState<string>('');
  const [reNewPwd, setReNewPwd] = useState<string>('');
  const router = useRouter();

  const csLoading = (flag: boolean) => {
    if (flag) {
      $('#csLoader').css('display', 'flex');
    } else {
      $('#csLoader').css('display', 'none');
    }
  };

  const changePassword = () => {
    if (currentPwd === '') {
      toast.error('現在のパスワードを入力してください。', { autoClose: 2000 });
      return;
    }
    if (newPwd === '') {
      toast.error('新しいパスワードを入力してください。', { autoClose: 2000 });
      return;
    }
    if (reNewPwd === '') {
      toast.error('新しいパスワード(再入力)を入力してください。', { autoClose: 2000 });
      return;
    }
    if (newPwd !== reNewPwd) {
      toast.error('新しいパスワードが一致しません。', { autoClose: 2000 });
      return;
    }
    const body = {
      id: props.id,
      password: newPwd,
      passwordCurrent: currentPwd,
    };

    csLoading(true);
    const url = config.backendUrl + config.resetPasswordUrl;
    const https = require('https');
    const postData = JSON.stringify({ agency: body });
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
        const agencyList = JSON.parse(chunk).agency;
        if (agencyList) {
          useJwt.setAgencyToken(agencyList.token);
          router.push(config.frontAgencyRegistryUrl);
        }
      });
    });
    postReq.write(postData);
    postReq.end();
  };
  const handleChangeCurrentPwd = (event) => {
    setCurrentPwd(event.target.value);
  };
  const handleChangeNewPwd = (event) => {
    setNewPwd(event.target.value);
  };
  const handleChangeReNewPwd = (event) => {
    setReNewPwd(event.target.value);
  };

  return (
    <>
      <CustomHead title='代理店管理画面 パスワード変更 | コインパーキング24' />
      <div className={styles.container}>
        <div className={GlobalStyles['loader-container']} id='csLoader'>
          <ClipLoader color={'#fff'} size={60} />
        </div>

        <div className={styles.title}>パスワード変更</div>
        <div className={GlobalStyles['cs-flex']}>
          <div>
            <div className={`${styles.itemtitle} ${styles.w400px}`}>
              パスワードを変更する必要があります。
              <br />
              新しいパスワードを入力してください。
            </div>
          </div>
        </div>
        <div className={`${GlobalStyles['cs-flex']} ${styles.mt20px}`}>
          <div>
            <div className={styles.itemtitle}>現在のパスワード：</div>
            <input
              type='password'
              className={`${styles.select} ${styles.w300px}`}
              onChange={handleChangeCurrentPwd}
              value={currentPwd}
              autoComplete='new-password'
            />
          </div>
        </div>
        <div className={GlobalStyles['cs-flex']}>
          <div>
            <div className={styles.itemtitle}>新しいパスワード：</div>
            <input
              type='password'
              className={`${styles.select} ${styles.w300px}`}
              onChange={handleChangeNewPwd}
              value={newPwd}
              autoComplete='new-password'
            />
          </div>
        </div>
        <div className={GlobalStyles['cs-flex']}>
          <div>
            <div className={styles.itemtitle}>新しいパスワード(再入力)：</div>
            <input
              type='password'
              className={`${styles.select} ${styles.w300px}`}
              onChange={handleChangeReNewPwd}
              value={reNewPwd}
              autoComplete='new-password'
            />
          </div>
        </div>
        <div className={`${GlobalStyles['cs-flex']} ${styles.mt20px}`}>
          <button className={styles.add_btn} onClick={changePassword}>
            変更
          </button>
        </div>
      </div>
    </>
  );
};

export default ResetPassword;
