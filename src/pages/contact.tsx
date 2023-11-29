import 'react-toastify/dist/ReactToastify.css';
import { IncomingMessage } from 'http';
import { Button, Input } from 'antd';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import $ from 'jquery';
import ClipLoader from 'react-spinners/ClipLoader';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import CustomHead from '../components/elements/CustomHead/CustomHead';
import { CONTACT } from '../consts/constants';
import config from '../consts/config';
import ContactStyles from '../styles/Contact.module.css';
import GlobalStyles from '../styles/Global.module.css';

const { TextArea } = Input;

const Contact = () => {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [email2, setEmail2] = useState('');
  const [phoneNum, setPhoneNum] = useState('');
  const [title, setTitle] = useState('');
  const [placeName, setPlaceName] = useState('');
  const [content, setContent] = useState('');
  const [nameErrorMsg, setNameErrorMsg] = useState('');
  const [emailErrorMsg, setEmailErrorMsg] = useState('');
  const [email2ErrorMsg, setEmail2ErrorMsg] = useState('');
  const [phoneNumErrorMsg, setPhoneNumErrorMsg] = useState('');
  const [titleErrorMsg, setTitleErrorMsg] = useState('');
  const [placeNameErrorMsg, setPlaceNameErrorMsg] = useState('');
  const [contentErrorMsg, setContentErrorMsg] = useState('');
  const [sendButtonErrorMsg, setSendButtonErrorMsg] = useState('');
  const csLoading = (flag: boolean) => {
    if (flag) {
      $('#csLoader').css('display', 'flex');
    } else {
      $('#csLoader').css('display', 'none');
    }
  };

  // 初期表示時に駐車場名を自動入力
  useEffect(() => {
    const placeUrlKey = localStorage.getItem('placeUrlKey');
    if (placeUrlKey) {
      const https = require('https');
      const getPlaceByKeyUrl = config.backendUrl + config.getPlaceByKeyUrl;
      const postOptions = {
        path: getPlaceByKeyUrl,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      };
      const postReq = https.request(postOptions, (res: IncomingMessage) => {
        res.setEncoding('utf8');
        res.on('data', (chunk: string) => {
          const { place } = JSON.parse(chunk);
          if (place) {
            setPlaceName(place.placeName);
          } else {
            toast.error('駐車場名の取得に失敗しました。', { autoClose: 2000 });
          }
        });
      });
      postReq.on('error', function () {
        toast.error('駐車場名の取得に失敗しました。', { autoClose: 2000 });
      });
      const postData = JSON.stringify({
        placeUrlKey,
      });
      postReq.write(postData);
      postReq.end();
    }
  }, []);

  useEffect(() => {
    // 何か入力されたらSendButtonErrorMsgを削除
    setSendButtonErrorMsg('');
  }, [name, email, email2, phoneNum, title, placeName, content]);

  const checkNameValidate = (newValue?: string): boolean => {
    let value = '';
    if (typeof newValue === 'undefined') {
      // 値がundefinedの場合は元々の値を入れる
      value = name;
    } else {
      value = newValue;
    }
    setNameErrorMsg('');
    if (value === '') {
      setNameErrorMsg('お名前は必須項目です。');
      return false;
    }
    if (value.length > CONTACT.NAME__MAX_LENGTH) {
      setNameErrorMsg(`お名前は${CONTACT.NAME__MAX_LENGTH}文字以内で入力してください。`);
      return false;
    }
    return true;
  };

  const checkEmailValidate = (newValue?: string): boolean => {
    let value = '';
    if (typeof newValue === 'undefined') {
      // 値がundefinedの場合は元々の値を入れる
      value = email;
    } else {
      value = newValue;
    }
    setEmailErrorMsg('');
    if (value === '') {
      setEmailErrorMsg('メールアドレスは必須項目です。');
      return false;
    }
    if (value.length > CONTACT.EMAIL__MAX_LENGTH) {
      setEmailErrorMsg(`メールアドレスは${CONTACT.EMAIL__MAX_LENGTH}文字以内で入力してください。`);
      return false;
    }
    const regex = CONTACT.EMAIL__REGEX;
    if (!regex.test(value)) {
      setEmailErrorMsg('メールアドレスの入力内容が不正です。');
      return false;
    }
    return true;
  };

  const checkEmail2Validate = (newValue?: string): boolean => {
    let value = '';
    if (typeof newValue === 'undefined') {
      // 値がundefinedの場合は元々の値を入れる
      value = email2;
    } else {
      value = newValue;
    }
    setEmail2ErrorMsg('');
    if (value === '') {
      setEmail2ErrorMsg('メールアドレス(確認)は必須項目です。');
      return false;
    }
    if (value.length > CONTACT.EMAIL2__MAX_LENGTH) {
      setEmail2ErrorMsg(`メールアドレス(確認)は${CONTACT.EMAIL2__MAX_LENGTH}文字以内で入力してください。`);
      return false;
    }
    const regex = CONTACT.EMAIL2__REGEX;
    if (!regex.test(value)) {
      setEmail2ErrorMsg('メールアドレス(確認)の入力内容が不正です。');
      return false;
    }
    if (email !== value) {
      setEmail2ErrorMsg('メールアドレスが一致しません。');
      return false;
    }
    return true;
  };

  const checkPhoneNumValidate = (newValue?: string): boolean => {
    let value = '';
    if (typeof newValue === 'undefined') {
      // 値がundefinedの場合は元々の値を入れる
      value = phoneNum;
    } else {
      value = newValue;
    }
    setPhoneNumErrorMsg('');
    if (value.length > CONTACT.PHONE_NUM__MAX_LENGTH) {
      setPhoneNumErrorMsg(`電話番号は${CONTACT.PHONE_NUM__MAX_LENGTH}文字以内で入力してください。`);
      return false;
    }
    const regex = CONTACT.PHONE_NUM__REGEX;
    if (!regex.test(value)) {
      setPhoneNumErrorMsg('電話番号の入力内容が不正です。');
      return false;
    }
    return true;
  };

  const checkTitleValidate = (newValue?: string): boolean => {
    let value = '';
    if (typeof newValue === 'undefined') {
      // 値がundefinedの場合は元々の値を入れる
      value = title;
    } else {
      value = newValue;
    }
    setTitleErrorMsg('');
    if (value === '') {
      setTitleErrorMsg('件名は必須項目です。');
      return false;
    }
    if (value.length > CONTACT.TITLE__MAX_LENGTH) {
      setTitleErrorMsg(`件名は${CONTACT.TITLE__MAX_LENGTH}文字以内で入力してください。`);
      return false;
    }
    return true;
  };

  const checkPlaceNameValidate = (newValue?: string): boolean => {
    let value = '';
    if (typeof newValue === 'undefined') {
      // 値がundefinedの場合は元々の値を入れる
      value = placeName;
    } else {
      value = newValue;
    }
    setPlaceNameErrorMsg('');
    if (value.length > CONTACT.PLACE_NAME__MAX_LENGTH) {
      setPlaceNameErrorMsg(`駐車場名は${CONTACT.PLACE_NAME__MAX_LENGTH}文字以内で入力してください。`);
      return false;
    }
    return true;
  };

  const checkContentValidate = (newValue?: string): boolean => {
    let value = '';
    if (typeof newValue === 'undefined') {
      // 値がundefinedの場合は元々の値を入れる
      value = content;
    } else {
      value = newValue;
    }
    setContentErrorMsg('');
    if (value === '') {
      setContentErrorMsg('お問い合わせ内容は必須項目です。');
      return false;
    }
    if (value.length > CONTACT.CONTENT__MAX_LENGTH) {
      setContentErrorMsg(`お問合せ内容は${CONTACT.CONTENT__MAX_LENGTH}文字以内で入力してください。`);
      return false;
    }
    return true;
  };

  const handleChangeName = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setName(newValue);
    checkNameValidate(newValue);
  };
  const handleChangeEmail = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setEmail(newValue);
    checkEmailValidate(newValue);
  };
  const handleChangeEmail2 = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setEmail2(newValue);
    checkEmail2Validate(newValue);
  };
  const handleChangePhoneNum = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setPhoneNum(newValue);
    checkPhoneNumValidate(newValue);
  };
  const handleChangeTitle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setTitle(newValue);
    checkTitleValidate(newValue);
  };
  const handleChangePlaceName = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setPlaceName(newValue);
    checkPlaceNameValidate(newValue);
  };
  const handleChangeContent = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(event.target.value);
    const newValue = event.target.value;
    setContent(newValue);
    checkContentValidate(newValue);
  };
  const handleClickSendButton = () => {
    let isValid = true;
    if (!checkNameValidate()) {
      isValid = false;
    }
    if (!checkEmailValidate()) {
      isValid = false;
    }
    if (!checkEmail2Validate()) {
      isValid = false;
    }
    if (!checkPhoneNumValidate()) {
      isValid = false;
    }
    if (!checkTitleValidate()) {
      isValid = false;
    }
    if (!checkPlaceNameValidate()) {
      isValid = false;
    }
    if (!checkContentValidate()) {
      isValid = false;
    }
    setSendButtonErrorMsg('');
    if (!isValid) {
      setSendButtonErrorMsg('入力内容に不備があります。');
      return;
    }
    csLoading(true);
    const body = {
      name,
      email,
      email2,
      phoneNum,
      title,
      placeName,
      content,
    };
    const url = config.backendUrl + config.sendContactByMailUrl;
    const https = require('https');
    const postData = JSON.stringify(body);
    const postOptions = {
      path: url,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    };
    const postReq = https.request(postOptions, (res: IncomingMessage) => {
      res.setEncoding('utf8');
      res.on('data', (chunk: string) => {
        csLoading(false);
        if (JSON.parse(chunk).result) {
          // お問い合わせ成功
          router.push(config.frontContactCompleteUrl);
        } else {
          toast.error('お問い合わせに失敗しました。', { autoClose: 2000 });
        }
      });
    });
    postReq.on('error', function () {
      csLoading(false);
      toast.error('お問い合わせに失敗しました。', { autoClose: 2000 });
    });
    postReq.write(postData);
    postReq.end();
  };
  return (
    <>
      <CustomHead title='お問い合わせ | コインパーキング24' />
      <div className={ContactStyles.container}>
        <div className={GlobalStyles['loader-container']} id='csLoader'>
          <ClipLoader color={'#fff'} size={60} />
        </div>
        <div className={ContactStyles.title}> お問い合わせ </div>
        <div className={ContactStyles.content}>
          <div className={ContactStyles['name-input-container']}>
            <div className={ContactStyles['name-input-title-container']}>
              <span className={ContactStyles['name-input-title']}>お名前</span>
              <span className={ContactStyles.require}>必須</span>
            </div>
            <Input
              type={'text'}
              className={ContactStyles['name-input']}
              value={name}
              placeholder='例)山田 太郎'
              maxLength={CONTACT.NAME__MAX_LENGTH}
              onChange={handleChangeName}
            />
            <div className={ContactStyles['error-msg-container']}>
              <span className={ContactStyles['error-msg']}>{nameErrorMsg}</span>
            </div>
          </div>
          <div className={ContactStyles['email-input-container']}>
            <div className={ContactStyles['email-input-title-container']}>
              <span className={ContactStyles['email-input-title']}>メールアドレス</span>
              <span className={ContactStyles.require}>必須</span>
            </div>
            <Input
              type={'email'}
              className={ContactStyles['email-input']}
              value={email}
              placeholder='例)aaa@example.com'
              maxLength={CONTACT.EMAIL__MAX_LENGTH}
              onChange={handleChangeEmail}
            />
            <div className={ContactStyles['error-msg-container']}>
              <span className={ContactStyles['error-msg']}>{emailErrorMsg}</span>
            </div>
          </div>
          <div className={ContactStyles['email2-input-container']}>
            <div className={ContactStyles['email2-input-title-container']}>
              <span className={ContactStyles['email2-input-title']}>メールアドレス(確認用)</span>
              <span className={ContactStyles.require}>必須</span>
            </div>
            <Input
              type={'email'}
              className={ContactStyles['email2-input']}
              value={email2}
              placeholder='例)aaa@example.com'
              maxLength={CONTACT.EMAIL2__MAX_LENGTH}
              onChange={handleChangeEmail2}
            />
            <div className={ContactStyles['error-msg-container']}>
              <span className={ContactStyles['error-msg']}>{email2ErrorMsg}</span>
            </div>
          </div>
          <div className={ContactStyles['phone-num-input-container']}>
            <div className={ContactStyles['phone-num-input-title-container']}>
              <span className={ContactStyles['phone-num-input-title']}>電話番号</span>
            </div>
            <Input
              type={'tel'}
              className={ContactStyles['phone-num-input']}
              value={phoneNum}
              placeholder='例)00-0000-0000'
              maxLength={CONTACT.PHONE_NUM__MAX_LENGTH}
              onChange={handleChangePhoneNum}
            />
            <div className={ContactStyles['error-msg-container']}>
              <span className={ContactStyles['error-msg']}>{phoneNumErrorMsg}</span>
            </div>
          </div>
          <div className={ContactStyles['title-input-container']}>
            <div className={ContactStyles['title-input-title-container']}>
              <span className={ContactStyles['title-input-title']}>件名</span>
              <span className={ContactStyles.require}>必須</span>
            </div>
            <Input
              type={'text'}
              className={ContactStyles['title-input']}
              value={title}
              placeholder='例)○○○の件'
              maxLength={CONTACT.TITLE__MAX_LENGTH}
              onChange={handleChangeTitle}
            />
            <div className={ContactStyles['error-msg-container']}>
              <span className={ContactStyles['error-msg']}>{titleErrorMsg}</span>
            </div>
          </div>
          <div className={ContactStyles['place-name-input-container']}>
            <div className={ContactStyles['place-name-input-title-container']}>
              <span className={ContactStyles['place-name-input-title']}>駐車場名</span>
            </div>
            <Input
              type={'text'}
              className={ContactStyles['place-name-input']}
              value={placeName}
              maxLength={CONTACT.PLACE_NAME__MAX_LENGTH}
              onChange={handleChangePlaceName}
            />
            <div className={ContactStyles['error-msg-container']}>
              <span className={ContactStyles['error-msg']}>{placeNameErrorMsg}</span>
            </div>
          </div>
          <div className={ContactStyles['content-text-area-container']}>
            <div className={ContactStyles['content-text-area-title-container']}>
              <span className={ContactStyles['content-text-area-title']}>お問い合わせ内容</span>
              <span className={ContactStyles.require}>必須</span>
            </div>
            <TextArea
              id='content'
              className={ContactStyles['content-text-area']}
              placeholder='例)○○○について'
              maxLength={CONTACT.CONTENT__MAX_LENGTH}
              onChange={handleChangeContent}
            ></TextArea>
            <div className={ContactStyles['error-msg-container']}>
              <span className={ContactStyles['error-msg']}>{contentErrorMsg}</span>
            </div>
          </div>
          <div className={ContactStyles['send-button-container']}>
            <Button type='primary' className={ContactStyles['send-button']} onClick={handleClickSendButton}>
              送信
            </Button>
            <div className={ContactStyles['error-msg-container']}>
              <span className={ContactStyles['error-msg']}>{sendButtonErrorMsg}</span>
            </div>
          </div>
          <div className={GlobalStyles.margin01}></div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
};

export default Contact;
