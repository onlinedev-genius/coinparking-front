import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import ClipLoader from 'react-spinners/ClipLoader';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';
import CustomHead from '../../components/elements/CustomHead/CustomHead';
import config from '../../consts/config';
import * as useJwt from '../../features/auth/useJwt';
import * as utils from '../../utils/utils';
import 'react-toastify/dist/ReactToastify.css';
import GlobalStyles from '../../styles/Global.module.css';
import AdminLoginStyles from '../../styles/AdminLogin.module.css';

const AgencyLogin: React.FC = () => {
  // パスワード表示制御用のstate
  const [isRevealPassword, setIsRevealPassword] = useState<boolean>(false);
  const [agencyIdName, setAgencyIdName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const router = useRouter();
  const togglePassword = () => {
    setIsRevealPassword((prevState) => !prevState);
  };
  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (agencyIdName === '') {
      toast.error('代理店IDを入力してください。', { autoClose: 2000 });
      return;
    }
    if (password === '') {
      toast.error('パスワードを入力してください。', { autoClose: 2000 });
      return;
    }
    const body = {
      agency_id_name: agencyIdName,
      password,
    };

    const url = config.backendUrl + config.agencyLoginUrl;
    const https = require('https');
    const post_data = JSON.stringify({ agency: body });
    const post_options = {
      path: url,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    };
    const post_req = https.request(post_options, (res) => {
      res.setEncoding('utf8');
      res.on('data', (chunk: string) => {
        const { agency } = JSON.parse(chunk);
        if (agency) {
          useJwt.setAgencyToken(agency.token);
          const { role } = agency;
          router.push(config.frontAgencyIndexUrl);
        } else if (JSON.parse(chunk).code === '3') {
          toast.error('ユーザーID/パスワードをご確認ください。', { autoClose: 2000 });
        } else {
          toast.error('ログインに失敗しました。', { autoClose: 2000 });
        }
      });
    });
    post_req.on('error', () => {
      toast.error('サーバーとの接続に失敗しました。', { autoClose: 2000 });
    });
    post_req.write(post_data);
    post_req.end();
  };

  const handleChangeAgencyIdName = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const target = event.target as HTMLInputElement;
    if (utils.validation1(target.value as string)) {
      setAgencyIdName(target.value as string);
    } else {
      setAgencyIdName('');
    }
  };
  const handleChangePassword = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const target = event.target as HTMLInputElement;
    if (target.value !== '') {
      if (utils.validation1(target.value as string)) {
        setPassword(target.value);
      }
    } else {
      setPassword('');
    }
  };
  const authentication = useJwt.isAgencyLoggedIn();

  useEffect(() => {
    if (authentication === true) router.push(config.frontAgencyIndexUrl);
  });

  return (
    <>
      <CustomHead title='代理店管理画面 ログイン | コインパーキング24' />
      <div className={AdminLoginStyles.container}>
        <div className={GlobalStyles['loader-container']} id='csLoader'>
          <ClipLoader color={'#fff'} size={60} />
        </div>
        <form className={AdminLoginStyles.form} onSubmit={(e) => handleSubmit(e)}>
          <div className={AdminLoginStyles.title}>
            <span>代理店管理画面ログイン</span>
          </div>
          <div>
            <div>
              <div className={AdminLoginStyles['login-item-title']}>ユーザーID</div>
              <div className={AdminLoginStyles['login-item-input-container-1']}>
                <input
                  className={AdminLoginStyles['login-item-input-1']}
                  type='text'
                  id='coinparking24AgencyUserId'
                  placeholder='ユーザーID'
                  value={agencyIdName}
                  onChange={(e) => handleChangeAgencyIdName(e)}
                />
              </div>
            </div>
            <div>
              <div className={AdminLoginStyles['login-item-title']}>パスワード</div>
              <div className={AdminLoginStyles['login-item-input-container-2']}>
                <input
                  className={AdminLoginStyles['login-item-input-2']}
                  id='coinparking24AgencyUserPassword'
                  placeholder='Password'
                  type={isRevealPassword ? 'text' : 'password'}
                  name='password'
                  value={password}
                  onChange={(e) => handleChangePassword(e)}
                />
                {isRevealPassword ? (
                  <AiFillEyeInvisible
                    onClick={togglePassword}
                    role='presentation'
                    className={AdminLoginStyles['password-reveal']}
                  />
                ) : (
                  <AiFillEye
                    onClick={togglePassword}
                    role='presentation'
                    className={AdminLoginStyles['password-reveal']}
                  />
                )}
              </div>
            </div>

            <div className={AdminLoginStyles['login-btn-container']}>
              <button className={AdminLoginStyles['login-btn']} type='submit'>
                ログイン
              </button>
            </div>
          </div>
        </form>
      </div>
      <ToastContainer />
    </>
  );
};

export default AgencyLogin;
