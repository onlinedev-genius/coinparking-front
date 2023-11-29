import { IncomingMessage } from 'http';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import $ from 'jquery';
import ClipLoader from 'react-spinners/ClipLoader';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import humps from 'humps';
import { GetServerSideProps } from 'next';
import NextNProgress from 'nextjs-progressbar';
import GlobalStyles from '../../styles/Global.module.css';
import AdminStyles from '../../styles/Admin.module.css';
import * as useJwt from '../../features/auth/useJwt';
import config from '../../consts/config';
import AdminLayout from '../../components/layouts/Admin/AdminLayout';
import CustomHead from '../../components/elements/CustomHead/CustomHead';
import { ADMIN, HTTP_STATUS_CODE } from '../../consts/constants';
import 'react-toastify/dist/ReactToastify.css';

interface Admin {
  adminIdName: string;
  id: number;
  role: string;
  validity: string;
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

const AddUser: React.FC<{
  loginAdminRole: string;
}> = (props) => {
  const [loginAdminRole] = useState<string>(props.loginAdminRole);
  const [adminIdName, setAdminIdName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [role, setRole] = useState<string>('ADMIN');
  const [adminIdNameErrorMsg, setAdminIdNameErrorMsg] = useState('');
  const [passwordErrorMsg, setPasswordErrorMsg] = useState('');
  const [roleErrorMsg, setRoleErrorMsg] = useState('');
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
  }, [adminIdName, password, role]);

  const checkAdminIdNameValidate = (newValue?: string): boolean => {
    let value = '';
    if (typeof newValue === 'undefined') {
      // 値がundefinedの場合は元々の値を入れる
      value = adminIdName;
    } else {
      value = newValue;
    }
    setAdminIdNameErrorMsg('');
    if (value === '') {
      setAdminIdNameErrorMsg('ユーザーIDは必須項目です。');
      return false;
    }
    if (value.length < ADMIN.ADMIN_ID_NAME__MIN_LENGTH) {
      setAdminIdNameErrorMsg(`ユーザーIDは${ADMIN.ADMIN_ID_NAME__MIN_LENGTH}文字以上で入力してください。`);
      return false;
    }
    if (value.length > ADMIN.ADMIN_ID_NAME__MAX_LENGTH) {
      setAdminIdNameErrorMsg(`ユーザーIDは${ADMIN.ADMIN_ID_NAME__MAX_LENGTH}文字以内で入力してください。`);
      return false;
    }
    const regex = ADMIN.ADMIN_ID_NAME__REGEX;
    if (!regex.test(value)) {
      setAdminIdNameErrorMsg('ユーザーIDの入力内容が不正です。半角英数のみで入力してください。');
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
    if (value.length >= 1 && value.length < ADMIN.PASSWORD__MIN_LENGTH) {
      setPasswordErrorMsg(`パスワードは${ADMIN.PASSWORD__MIN_LENGTH}文字以上で入力してください。`);
      return false;
    }
    if (value.length > ADMIN.PASSWORD__MAX_LENGTH) {
      setPasswordErrorMsg(`パスワードは${ADMIN.PASSWORD__MAX_LENGTH}文字以内で入力してください。`);
      return false;
    }
    const regex = ADMIN.PASSWORD__REGEX;
    if (value !== '' && !regex.test(value)) {
      setPasswordErrorMsg(
        'パスワードの入力内容が不正です。使用できるのは半角英字、半角数字、記号「!@?%&±=&」のみで、それぞれ1文字以上含める必要があります。'
      );
      return false;
    }
    return true;
  };

  const checkRoleValidate = (newValue?: string): boolean => {
    let value = '';
    if (typeof newValue === 'undefined') {
      // 値がundefinedの場合は元々の値を入れる
      value = role;
    } else {
      value = newValue;
    }
    setRoleErrorMsg('');
    if (!ADMIN.ROLE__LIST.includes(value)) {
      setRoleErrorMsg(`権限を選択してください。`);
      return false;
    }
    return true;
  };

  const handleChangeAdminIdName = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setAdminIdName(newValue);
    checkAdminIdNameValidate(newValue);
  };

  const handleChangePassword = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setPassword(newValue);
    checkPasswordValidate(newValue);
  };

  const handleChangeRole = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = event.target.value;
    setRole(newValue);
    checkRoleValidate(newValue);
  };

  const handleClickSaveButton = () => {
    let isValid = true;
    if (!checkAdminIdNameValidate()) {
      isValid = false;
    }
    if (!checkPasswordValidate()) {
      isValid = false;
    }
    if (!checkRoleValidate()) {
      isValid = false;
    }
    setSaveButtonErrorMsg('');
    if (!isValid) {
      setSaveButtonErrorMsg('入力内容に不備があります。');
      return;
    }

    csLoading(true);
    const adminSignUpUrl = config.backendUrl + config.adminSignUpUrl;
    const postOptions = {
      path: adminSignUpUrl,
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
        const { admin } = JSON.parse(chunk);
        if (admin) {
          toast.success('登録されました。', { autoClose: 2000 });
          router.push(config.frontAdminUserListUrl);
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
      adminIdName,
      password,
      role,
    };
    const postData = JSON.stringify({ admin: body });
    postReq.write(postData);
    postReq.end();
  };

  return (
    <>
      <CustomHead title='管理画面 管理者ユーザー新規登録 | コインパーキング24' />
      <AdminLayout loginAdminRole={loginAdminRole}>
        <NextNProgress height={5} options={{ easing: 'ease', speed: 400, showSpinner: false }} />
        <div className={AdminStyles.container}>
          <div className={GlobalStyles['loader-container']} id='csLoader'>
            <ClipLoader color={'#fff'} size={60} />
          </div>

          <div className={AdminStyles['title-left']}>
            <span>管理者ユーザー新規登録</span>
          </div>

          <div className={AdminStyles['edit-container-1']}>
            <div className={AdminStyles['edit-item-container']}>
              <div className={AdminStyles['edit-item-title-container']}>
                <span className={AdminStyles['edit-item-title']}>ユーザーID</span>
                <span className={AdminStyles.require}>必須</span>
              </div>
              <input
                type={'text'}
                className={AdminStyles['edit-item-input-1']}
                value={adminIdName}
                maxLength={ADMIN.ADMIN_ID_NAME__MAX_LENGTH}
                onChange={handleChangeAdminIdName}
                autoComplete='off'
              />
              <div className={AdminStyles['error-msg-container-1']}>
                <span className={AdminStyles['error-msg']}>{adminIdNameErrorMsg}</span>
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
                maxLength={ADMIN.PASSWORD__MAX_LENGTH}
                autoComplete='new-password'
              />
              <div className={AdminStyles['error-msg-container-1']}>
                <span className={AdminStyles['error-msg']}>{passwordErrorMsg}</span>
              </div>
            </div>
            <div className={AdminStyles['edit-item-container']}>
              <div className={AdminStyles['edit-item-title-container']}>
                <span className={AdminStyles['edit-item-title']}>権限</span>
                <span className={AdminStyles.require}>必須</span>
              </div>
              <select className={AdminStyles['edit-item-select-1']} value={role} onChange={handleChangeRole}>
                <option value='ADMIN'>管理者</option>
                <option value='EDITOR'>編集者</option>
                <option value='OPERATOR'>オペレーター</option>
              </select>
              <div className={AdminStyles['error-msg-container-1']}>
                <span className={AdminStyles['error-msg']}>{roleErrorMsg}</span>
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

export default AddUser;
