import { IncomingMessage } from 'http';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import NextNProgress from 'nextjs-progressbar';
import $ from 'jquery';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import { addYears } from 'date-fns';
import ClipLoader from 'react-spinners/ClipLoader';
import { GetServerSideProps } from 'next';
import humps from 'humps';
import CustomHead from '../../../components/elements/CustomHead/CustomHead';
import * as useJwt from '../../../features/auth/useJwt';
import { FieldValueTransformer } from '../../../utils/FieldValueTransformer';
import config from '../../../consts/config';
import GlobalStyles from '../../../styles/Global.module.css';
import AdminStyles from '../../../styles/Admin.module.css';
import AdminLayout from '../../../components/layouts/Admin/AdminLayout';
import { AGENCY, HTTP_STATUS_CODE } from '../../../consts/constants';
import 'react-toastify/dist/ReactToastify.css';

interface Admin {
  adminIdName: string;
  id: number;
  role: string;
  validity: string;
}

interface Agency {
  agencyIdName: string;
  password: string;
  validityDate: string;
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

const AddAgency: React.FC<{
  loginAdminRole: string;
}> = (props) => {
  const [loginAdminRole] = useState<string>(props.loginAdminRole);
  const [agencyIdName, setAgencyIdName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [validityDate, setValidityDate] = useState<string>(
    FieldValueTransformer.datetimeStringToDateString(addYears(new Date(), 1).toISOString())
  );
  const [agencyIdNameErrorMsg, setAgencyIdNameErrorMsg] = useState('');
  const [passwordErrorMsg, setPasswordErrorMsg] = useState('');
  const [validityDateErrorMsg, setValidityDateErrorMsg] = useState('');
  const [saveButtonErrorMsg, setSaveButtonErrorMsg] = useState('');
  const router = useRouter();
  const csLoading = (flag: boolean) => {
    if (flag) {
      $('#csLoader').css('display', 'flex');
    } else {
      $('#csLoader').css('display', 'none');
    }
  };

  useEffect(() => {
    // クライアントサイド側でのログイン判定
    if (!useJwt.isAdminLoggedIn()) {
      router.replace(config.frontAdminLogoutUrl);
    }
  }, [router]);

  useEffect(() => {
    // 何か入力されたらSendButtonErrorMsgを削除
    setSaveButtonErrorMsg('');
  }, [agencyIdName, password, validityDate]);

  const checkAgencyIdNameValidate = (newValue?: string): boolean => {
    let value = '';
    if (typeof newValue === 'undefined') {
      // 値がundefinedの場合は元々の値を入れる
      value = agencyIdName;
    } else {
      value = newValue;
    }
    setAgencyIdNameErrorMsg('');
    if (value === '') {
      setAgencyIdNameErrorMsg('代理店IDは必須項目です。');
      return false;
    }
    if (value.length < AGENCY.AGENCY_ID_NAME__MIN_LENGTH) {
      setAgencyIdNameErrorMsg(`代理店IDは${AGENCY.AGENCY_ID_NAME__MIN_LENGTH}文字以上で入力してください。`);
      return false;
    }
    if (value.length > AGENCY.AGENCY_ID_NAME__MAX_LENGTH) {
      setAgencyIdNameErrorMsg(`代理店IDは${AGENCY.AGENCY_ID_NAME__MAX_LENGTH}文字以内で入力してください。`);
      return false;
    }
    const regex = AGENCY.AGENCY_ID_NAME__REGEX;
    if (!regex.test(value)) {
      setAgencyIdNameErrorMsg('代理店IDの入力内容が不正です。半角英数のみで入力してください。');
      return false;
    }
    return true;
  };

  const checkPasswordValidate = (newValue?: string): boolean => {
    let value = '';
    if (typeof newValue === 'undefined') {
      // 値がundefinedの場合は元々の値を入れる
      value = password;
    } else {
      value = newValue;
    }
    setPasswordErrorMsg('');
    if (value === '') {
      setPasswordErrorMsg('パスワードは必須項目です。');
      return false;
    }
    if (value.length >= 1 && value.length < AGENCY.PASSWORD__MIN_LENGTH) {
      setPasswordErrorMsg(`パスワードは${AGENCY.PASSWORD__MIN_LENGTH}文字以上で入力してください。`);
      return false;
    }
    if (value.length > AGENCY.PASSWORD__MAX_LENGTH) {
      setPasswordErrorMsg(`パスワードは${AGENCY.PASSWORD__MAX_LENGTH}文字以内で入力してください。`);
      return false;
    }
    const regex = AGENCY.PASSWORD__REGEX;
    if (value !== '' && !regex.test(value)) {
      setPasswordErrorMsg(
        'パスワードの入力内容が不正です。使用できるのは半角英字、半角数字、記号「!@?%&±=&」のみで、それぞれ1文字以上含める必要があります。'
      );
      return false;
    }
    return true;
  };

  const checkValidityDateValidate = (newValue?: string): boolean => {
    let value = '';
    if (typeof newValue === 'undefined') {
      // 値がundefinedの場合は元々の値を入れる
      value = validityDate;
    } else {
      value = newValue;
    }
    setValidityDateErrorMsg('');
    if (value === '') {
      setValidityDateErrorMsg('パスワード有効期間は必須項目です。');
      return false;
    }
    return true;
  };

  const handleChangeAgencyIdName = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setAgencyIdName(newValue);
    checkAgencyIdNameValidate(newValue);
  };

  const handleChangePassword = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setPassword(newValue);
    checkPasswordValidate(newValue);
  };

  const handleChangeValidityDate = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setValidityDate(newValue);
    checkValidityDateValidate(newValue);
  };

  const handleClickSaveButton = () => {
    let isValid = true;
    if (!checkAgencyIdNameValidate()) {
      isValid = false;
    }
    if (!checkPasswordValidate()) {
      isValid = false;
    }
    if (!checkValidityDateValidate()) {
      isValid = false;
    }
    setSaveButtonErrorMsg('');
    if (!isValid) {
      setSaveButtonErrorMsg('入力内容に不備があります。');
      return;
    }

    csLoading(true);
    const agencySignUpurl = config.backendUrl + config.createAdminAgencyUrl;
    const postOptions = {
      path: agencySignUpurl,
      method: 'POST',
      headers: {
        Authorization: config.tokenType + useJwt.getAdminToken(),
        'Content-Type': 'application/json',
      },
    };

    const https = require('https');
    const postReq = https.request(postOptions, (res: IncomingMessage) => {
      res.setEncoding('utf8');
      res.on('data', (chunk: string) => {
        csLoading(false);
        const { agency } = JSON.parse(chunk);
        if (agency) {
          router.push(config.frontAdminAgencyListUrl);
        } else {
          toast.error('登録に失敗しました。', { autoClose: 2000 });
        }
      });
    });
    postReq.on('error', function () {
      csLoading(false);
      toast.error('登録に失敗しました。', { autoClose: 2000 });
    });

    const body = {
      agencyIdName,
      password,
      validityDate: FieldValueTransformer.dateStringToDatetimeString(validityDate),
    };
    const postData = JSON.stringify({ agency: body });
    postReq.write(postData);
    postReq.end();
  };

  return (
    <>
      <CustomHead title='管理画面 代理店 新規登録 | コインパーキング24' />
      <AdminLayout loginAdminRole={loginAdminRole}>
        <NextNProgress height={5} options={{ easing: 'ease', speed: 400, showSpinner: false }} />
        <div className={AdminStyles.container}>
          <div className={GlobalStyles['loader-container']} id='csLoader'>
            <ClipLoader color={'#fff'} size={60} />
          </div>

          <div className={AdminStyles.title}>代理店新規登録</div>

          <div className={AdminStyles['edit-container-1']}>
            <div className={AdminStyles['edit-item-container']}>
              <div className={AdminStyles['edit-item-title-container']}>
                <span className={AdminStyles['edit-item-title']}>代理店ID</span>
                <span className={AdminStyles.require}>必須</span>
              </div>
              <input
                type={'text'}
                className={AdminStyles['edit-item-input-1']}
                value={agencyIdName}
                maxLength={AGENCY.AGENCY_ID_NAME__MAX_LENGTH}
                onChange={handleChangeAgencyIdName}
                autoComplete='off'
              />
              <div className={AdminStyles['error-msg-container-1']}>
                <span className={AdminStyles['error-msg']}>{agencyIdNameErrorMsg}</span>
              </div>
            </div>
            <div className={AdminStyles['edit-item-container']}>
              <div className={AdminStyles['edit-item-title-container']}>
                <span className={AdminStyles['edit-item-title']}>パスワード</span>
                <span className={AdminStyles.require}>必須</span>
              </div>
              <input
                type='password'
                className={AdminStyles['edit-item-input-1']}
                onChange={handleChangePassword}
                value={password}
                maxLength={AGENCY.PASSWORD__MAX_LENGTH}
                autoComplete='new-password'
              />
              <div className={AdminStyles['error-msg-container-1']}>
                <span className={AdminStyles['error-msg']}>{passwordErrorMsg}</span>
              </div>
            </div>
            <div className={AdminStyles['edit-item-container']}>
              <div className={AdminStyles['edit-item-title-container']}>
                <span className={AdminStyles['edit-item-title']}>パスワード有効期間</span>
                <span className={AdminStyles.require}>必須</span>
              </div>
              <input
                type='date'
                className={AdminStyles['edit-item-input-1']}
                value={validityDate}
                onChange={handleChangeValidityDate}
              />
              <div className={AdminStyles['error-msg-container-1']}>
                <span className={AdminStyles['error-msg']}>{validityDateErrorMsg}</span>
              </div>
            </div>
            <div className={AdminStyles['save-btn-container']}>
              <button className={AdminStyles['save-btn']} onClick={handleClickSaveButton}>
                登録
              </button>
              <div className={AdminStyles['error-msg-container-2']}>
                <span className={AdminStyles['error-msg']}>{saveButtonErrorMsg}</span>
              </div>
            </div>
          </div>
        </div>
        <ToastContainer />
      </AdminLayout>
    </>
  );
};

export default AddAgency;
