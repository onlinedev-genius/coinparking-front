import { IncomingMessage } from 'http';
import { ParsedUrlQuery } from 'querystring';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import ClipLoader from 'react-spinners/ClipLoader';
import NextNProgress from 'nextjs-progressbar';
import $ from 'jquery';
import { Select } from 'antd';
import { GetServerSideProps } from 'next';
import humps from 'humps';
import * as useJwt from '../../../features/auth/useJwt';
import { FieldValueTransformer } from '../../../utils/FieldValueTransformer';
import CustomHead from '../../../components/elements/CustomHead/CustomHead';
import config from '../../../consts/config';
import AdminLayout from '../../../components/layouts/Admin/AdminLayout';
import { AGENCY, HTTP_STATUS_CODE } from '../../../consts/constants';
import GlobalStyles from '../../../styles/Global.module.css';
import AdminStyles from '../../../styles/Admin.module.css';
import 'react-toastify/dist/ReactToastify.css';

// Settings
const BANK_CODE_DIGITS = 4;
const BRANCH_CODE_DIGITS = 3;

interface PostPageQuery extends ParsedUrlQuery {
  id: string;
}

interface Admin {
  adminIdName: string;
  id: number;
  role: string;
  validity: string;
}

interface Agency {
  id: string;
  agencyIdName: string;
  shopName: string;
  agencyUrlKey: string;
  postalCode: string;
  address: string;
  phoneNum: string;
  email: string;
  agencyName: string;
  bankName: string;
  branchName: string;
  depositType: string;
  accountNum: string;
  accountName: string;
  notifyFlag: string;
  validityDate: string;
  validity: string;
}

interface Bank {
  id: string;
  bankMainName: string;
  bankName: string;
  bankNameKana: string;
  branchName: string;
  branchNameKana: string;
  bankCode: string;
  branchCode: string;
  yuchoSymbol: string;
}

interface BankName {
  value: string;
  label: string;
}

interface BranchName {
  value: string;
  label: string;
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

  // -------------------- Get AgencyInfo --------------------
  const info = context.query as PostPageQuery;
  const { id } = info;
  const getAgencyUrl = config.backendUrl + config.getAgencyUrl.replace('{id}', id);
  if (!token) {
    //jwtトークンが切れている場合
    return {
      redirect: {
        destination: config.frontAdminLogoutUrl,
        permanent: false,
      },
    };
  }
  const resAgency = await fetch(getAgencyUrl, {
    method: 'GET',
    headers: {
      Authorization: config.tokenType + token,
      'Content-Type': 'application/json',
    },
  });
  if (!resAgency.ok) {
    if (resAgency.status === HTTP_STATUS_CODE.UNAUTHORIZED) {
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

  const agency = humps.camelizeKeys((await resAgency.json()).agency) as Agency;
  const { agencyIdName } = agency;
  const { shopName } = agency;
  const { agencyUrlKey } = agency;
  const { postalCode } = agency;
  const { address } = agency;
  const { phoneNum } = agency;
  const { email } = agency;
  const { agencyName } = agency;
  const { bankName } = agency;
  const { branchName } = agency;
  const { depositType } = agency;
  const { accountNum } = agency;
  const { accountName } = agency;
  const { notifyFlag } = agency;
  const { validityDate } = agency;
  const { validity } = agency;

  // -------------------- Get BanksInfo --------------------
  const getBanksUrl = config.backendUrl + config.getBanksUrl;
  if (!token) {
    //jwtトークンが切れている場合
    return {
      redirect: {
        destination: config.frontAdminLogoutUrl,
        permanent: false,
      },
    };
  }
  const resBanks = await fetch(getBanksUrl, {
    method: 'GET',
    headers: {
      Authorization: config.tokenType + token,
      'Content-Type': 'application/json',
    },
  });
  if (!resBanks.ok) {
    if (resBanks.status === HTTP_STATUS_CODE.UNAUTHORIZED) {
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

  const banks = humps.camelizeKeys((await resBanks.json()).bank) as Bank[];
  // ドロップダウンリスト用の銀行の配列の生成
  const bankNames = [];
  for (const bank of banks) {
    const bankCode = bank.bankCode.padStart(BANK_CODE_DIGITS, '0');
    if (!bankNames.some((bankName) => bankName.value.includes(`${bank.bankMainName} (銀行コード:${bankCode})`))) {
      const bankNameOption = {
        value: `${bank.bankMainName} (銀行コード:${bankCode})`,
        label: `${bank.bankMainName} (銀行コード:${bankCode})`,
      };
      bankNames.push(bankNameOption);
    }
  }

  // ドロップダウンリスト用の支店名の配列を更新
  const branchNames = [];
  for (const bank of banks) {
    const bankCode = bank.bankCode.padStart(BANK_CODE_DIGITS, '0');
    const selectedBankNameLabel = bankNames.find((option) => option.value === bankName)?.label;
    if (`${bank.bankMainName} (銀行コード:${bankCode})` === selectedBankNameLabel) {
      // 銀行名が一致した場合
      const branchCode = bank.branchCode.padStart(BRANCH_CODE_DIGITS, '0');
      const branchNameOption = {
        value: `${bank.branchName} (支店コード:${branchCode})`,
        label: `${bank.branchName} (支店コード:${branchCode})`,
      };
      branchNames.push(branchNameOption);
    }
  }

  return {
    props: {
      id,
      loginAdminRole,
      agencyIdName,
      shopName,
      agencyUrlKey,
      postalCode,
      address,
      phoneNum,
      email,
      agencyName,
      bankName,
      branchName,
      depositType,
      accountNum,
      accountName,
      notifyFlag,
      validityDate,
      validity,
      banks,
      bankNames,
      branchNames,
    },
  };
};

const AdminAgencyRegistry: React.FC<{
  loginAdminRole: string;
  id: string;
  agencyIdName: string;
  shopName: string;
  agencyUrlKey: string;
  postalCode: string;
  address: string;
  phoneNum: string;
  email: string;
  agencyName: string;
  bankName: string;
  branchName: string;
  depositType: string;
  accountNum: string;
  accountName: string;
  notifyFlag: string;
  validityDate: string;
  validity: string;
  banks: Bank[];
  bankNames: BankName[];
  branchNames: BranchName[];
}> = (props) => {
  const [loginAdminRole] = useState<string>(props.loginAdminRole);
  const [agencyId, setAgencyId] = useState<string>(props.id);
  const [agencyIdName, setAgencyIdName] = useState<string>(props.agencyIdName);
  const [password, setPassword] = useState<string>('');
  const [shopName, setShopName] = useState<string>(props.shopName);
  const [agencyUrlKey, setAgencyUrlKey] = useState<string>(props.agencyUrlKey);
  const [postalCode, setPostalCode] = useState<string>(props.postalCode);
  const [address, setAddress] = useState<string>(props.address);
  const [phoneNum, setPhoneNum] = useState<string>(props.phoneNum);
  const [email, setEmail] = useState<string>(props.email);
  const [agencyName, setAgencyName] = useState<string>(props.agencyName);
  const [bankName, setBankName] = useState<string>(props.bankName);
  const [branchName, setBranchName] = useState<string>(props.branchName);
  const [depositType, setDepositType] = useState<string>(props.depositType);
  const [accountNum, setAccountNum] = useState<string>(props.accountNum);
  const [accountName, setAccountName] = useState<string>(props.accountName);
  const [notifyFlag, setNotifyFlag] = useState<boolean>(FieldValueTransformer.integerStringToBoolean(props.notifyFlag));
  const [banks] = useState<Bank[]>(props.banks);
  const [bankNames] = useState<BankName[]>(props.bankNames);
  const [branchNames, setBranchNames] = useState<BranchName[]>(props.branchNames);
  const [validityDate, setValidityDate] = useState<string>(
    FieldValueTransformer.datetimeStringToDateString(props.validityDate)
  );
  const [validity, setValidity] = useState<boolean>(FieldValueTransformer.integerStringToBoolean(props.validity));
  const [passwordErrorMsg, setPasswordErrorMsg] = useState('');
  const [validityDateErrorMsg, setValidityDateErrorMsg] = useState('');
  const [shopNameErrorMsg, setShopNameErrorMsg] = useState('');
  const [agencyUrlKeyErrorMsg, setAgencyUrlKeyErrorMsg] = useState('');
  const [postalCodeErrorMsg, setPostalCodeErrorMsg] = useState('');
  const [addressErrorMsg, setAddressErrorMsg] = useState('');
  const [phoneNumErrorMsg, setPhoneNumErrorMsg] = useState('');
  const [emailErrorMsg, setEmailErrorMsg] = useState('');
  const [notifyFlagErrorMsg, setNotifyFlagErrorMsg] = useState('');
  const [agencyNameErrorMsg, setAgencyNameErrorMsg] = useState('');
  const [bankNameErrorMsg, setBankNameErrorMsg] = useState('');
  const [branchNameErrorMsg, setBranchNameErrorMsg] = useState('');
  const [depositTypeErrorMsg, setDepositTypeErrorMsg] = useState('');
  const [accountNumErrorMsg, setAccountNumErrorMsg] = useState('');
  const [accountNameErrorMsg, setAccountNameErrorMsg] = useState('');
  const [validityErrorMsg, setValidityErrorMsg] = useState('');
  const [saveButtonErrorMsg, setSaveButtonErrorMsg] = useState('');
  const router = useRouter();
  const isFirstRun = useRef(true);

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
  }, [
    agencyIdName,
    password,
    shopName,
    agencyUrlKey,
    postalCode,
    address,
    phoneNum,
    email,
    agencyName,
    bankName,
    branchName,
    depositType,
    accountNum,
    accountName,
    notifyFlag,
    validityDate,
    validity,
  ]);

  const checkPasswordValidate = (newValue?: string): boolean => {
    let value = '';
    if (typeof newValue === 'undefined') {
      // 値がundefinedの場合は元々の値を入れる
      value = password;
    } else {
      value = newValue;
    }
    setPasswordErrorMsg('');
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

  const checkShopNameValidate = (newValue?: string): boolean => {
    let value = '';
    if (typeof newValue === 'undefined') {
      // 値がundefinedの場合は元々の値を入れる
      value = shopName;
    } else {
      value = newValue;
    }
    setShopNameErrorMsg('');
    if (value.length > AGENCY.SHOP_NAME__MAX_LENGTH) {
      setShopNameErrorMsg(`店舗名は${AGENCY.SHOP_NAME__MAX_LENGTH}文字以内で入力してください。`);
      return false;
    }
    return true;
  };

  const checkAddressValidate = (newValue?: string): boolean => {
    let value = '';
    if (typeof newValue === 'undefined') {
      // 値がundefinedの場合は元々の値を入れる
      value = address;
    } else {
      value = newValue;
    }
    setAddressErrorMsg('');
    if (value.length > AGENCY.ADDRESS__MAX_LENGTH) {
      setAddressErrorMsg(`住所は${AGENCY.ADDRESS__MAX_LENGTH}文字以内で入力してください。`);
      return false;
    }
    const regex = AGENCY.ADDRESS__REGEX;
    if (!regex.test(value)) {
      setAddressErrorMsg('住所の入力内容が不正です。使用できない文字が含まれています。');
      return false;
    }
    return true;
  };

  const checkPostalCodeValidate = (newValue?: string): boolean => {
    let value = '';
    if (typeof newValue === 'undefined') {
      // 値がundefinedの場合は元々の値を入れる
      value = postalCode;
    } else {
      value = newValue;
    }
    setPostalCodeErrorMsg('');
    if (value.length > AGENCY.POSTAL_CODE__MAX_LENGTH) {
      setPostalCodeErrorMsg(`郵便番号は${AGENCY.POSTAL_CODE__MAX_LENGTH}文字以内で入力してください。`);
      return false;
    }
    const regex = AGENCY.POSTAL_CODE__REGEX;
    if (!regex.test(value)) {
      setPostalCodeErrorMsg('郵便番号の入力内容が不正です。「000-0000」の形式で入力してください。');
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
    if (value.length > AGENCY.PHONE_NUM__MAX_LENGTH) {
      setPhoneNumErrorMsg(`電話番号は${AGENCY.PHONE_NUM__MAX_LENGTH}文字以内で入力してください。`);
      return false;
    }
    const regex = AGENCY.PHONE_NUM__REGEX;
    if (!regex.test(value)) {
      setPhoneNumErrorMsg(
        '電話番号の入力内容が不正です。半角数字とハイフンのみで入力してください。市外局番から入力してください。'
      );
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
    if (value.length > AGENCY.EMAIL__MAX_LENGTH) {
      setEmailErrorMsg(`メールアドレスは${AGENCY.EMAIL__MAX_LENGTH}文字以内で入力してください。`);
      return false;
    }
    const regex = AGENCY.EMAIL__REGEX;
    if (!regex.test(value)) {
      setEmailErrorMsg(
        'メールアドレスの入力内容が不正です。半角で入力してください。半角スペースなど余計な文字が含まれていないか確認してください。'
      );
      return false;
    }
    return true;
  };

  const checkAgencyUrlKeyValidate = (newValue?: string): boolean => {
    let value = '';
    if (typeof newValue === 'undefined') {
      // 値がundefinedの場合は元々の値を入れる
      value = agencyUrlKey;
    } else {
      value = newValue;
    }
    setAgencyUrlKeyErrorMsg('');
    if (value.length > AGENCY.AGENCY_URL_KEY__MAX_LENGTH) {
      setAgencyUrlKeyErrorMsg(`代理店URLKeyは${AGENCY.AGENCY_URL_KEY__MAX_LENGTH}文字以内で入力してください。`);
      return false;
    }
    const regex = AGENCY.AGENCY_URL_KEY__REGEX;
    if (!regex.test(value)) {
      setAgencyUrlKeyErrorMsg('代理店URLKeyの入力内容が不正です。半角英数のみで入力してください。');
      return false;
    }
    return true;
  };

  const checkAgencyNameValidate = (newValue?: string): boolean => {
    let value = '';
    if (typeof newValue === 'undefined') {
      // 値がundefinedの場合は元々の値を入れる
      value = agencyName;
    } else {
      value = newValue;
    }
    setAgencyNameErrorMsg('');
    if (value.length > AGENCY.AGENCY_NAME__MAX_LENGTH) {
      setAgencyNameErrorMsg(`代表者氏名は${AGENCY.AGENCY_NAME__MAX_LENGTH}文字以内で入力してください。`);
      return false;
    }
    const regex = AGENCY.AGENCY_NAME__REGEX;
    if (!regex.test(value)) {
      setAgencyNameErrorMsg('代表者氏名の入力内容が不正です。使用できない文字が含まれています。');
      return false;
    }
    return true;
  };

  const checkNotifyFlagValidate = (newValue?: boolean): boolean => {
    let value = false;
    if (typeof newValue === 'undefined') {
      // 値がundefinedの場合は元々の値を入れる
      value = notifyFlag;
    } else {
      value = newValue;
    }
    setNotifyFlagErrorMsg('');
    // 特にチェックは無し
    return true;
  };

  const checkValidityValidate = (newValue?: boolean): boolean => {
    let value = false;
    if (typeof newValue === 'undefined') {
      // 値がundefinedの場合は元々の値を入れる
      value = validity;
    } else {
      value = newValue;
    }
    setValidityErrorMsg('');
    // 特にチェックは無し
    return true;
  };

  const checkBankNameValidate = (newValue?: string): boolean => {
    let value = '';
    if (typeof newValue === 'undefined') {
      // 値がundefinedの場合は元々の値を入れる
      value = bankName;
    } else {
      value = newValue;
    }
    setBankNameErrorMsg('');
    if (value in bankNames) {
      setBankNameErrorMsg('銀行名が不正です。');
      return false;
    }
    return true;
  };

  const checkBranchNameValidate = (newValue?: string): boolean => {
    let value = '';
    if (typeof newValue === 'undefined') {
      // 値がundefinedの場合は元々の値を入れる
      value = branchName;
    } else {
      value = newValue;
    }
    setBranchNameErrorMsg('');
    if (value in branchNames) {
      setBranchNameErrorMsg('支店名が不正です。');
      return false;
    }
    // TODO 支店名と銀行名が合致しているかのif文を追加する

    return true;
  };

  const checkAccountNumValidate = (newValue?: string): boolean => {
    let value = '';
    if (typeof newValue === 'undefined') {
      // 値がundefinedの場合は元々の値を入れる
      value = accountNum;
    } else {
      value = newValue;
    }
    setAccountNumErrorMsg('');
    if (value.length > AGENCY.ACCOUNT_NUM__MAX_LENGTH) {
      setAccountNumErrorMsg(`口座番号は${AGENCY.ACCOUNT_NUM__MAX_LENGTH}文字以内で入力してください。`);
      return false;
    }
    const regex = AGENCY.ACCOUNT_NUM__REGEX;
    if (!regex.test(value)) {
      setAccountNumErrorMsg('口座番号の入力内容が不正です。7桁の数字で入力してください。');
      return false;
    }
    return true;
  };

  const checkAccountNameValidate = (newValue?: string): boolean => {
    let value = '';
    if (typeof newValue === 'undefined') {
      // 値がundefinedの場合は元々の値を入れる
      value = accountName;
    } else {
      value = newValue;
    }
    setAccountNameErrorMsg('');
    if (value.length > AGENCY.ACCOUNT_NAME__MAX_LENGTH) {
      setAccountNameErrorMsg(`口座名義は${AGENCY.ACCOUNT_NAME__MAX_LENGTH}文字以内で入力してください。`);
      return false;
    }
    const regex = AGENCY.ACCOUNT_NAME__REGEX;
    if (!regex.test(value)) {
      setAccountNameErrorMsg('口座名義の入力内容が不正です。全角カナと括弧のみで入力してください。');
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
      setValidityDateErrorMsg('パスワード有効期限は必須項目です。');
      return false;
    }
    const regex = AGENCY.VALIDITY_DATE__REGEX;
    if (!regex.test(value)) {
      setValidityDateErrorMsg('パスワード有効期限の入力内容が不正です。年月日を正しく入力してください。');
      return false;
    }
    return true;
  };

  const checkDepositTypeValidate = (newValue?: string): boolean => {
    let value = '';
    if (typeof newValue === 'undefined') {
      // 値がundefinedの場合は元々の値を入れる
      value = depositType;
    } else {
      value = newValue;
    }
    setDepositTypeErrorMsg('');
    if (value != '' && !AGENCY.DEPOSIT_TYPE__LIST.includes(value)) {
      setDepositTypeErrorMsg(`預金種別を選択してください。`);
      return false;
    }
    return true;
  };

  const handleClickSaveButton = () => {
    let isValid = true;
    if (!checkPasswordValidate()) {
      isValid = false;
    }
    if (!checkShopNameValidate()) {
      isValid = false;
    }
    if (!checkAddressValidate()) {
      isValid = false;
    }
    if (!checkPostalCodeValidate()) {
      isValid = false;
    }
    if (!checkPhoneNumValidate()) {
      isValid = false;
    }
    if (!checkEmailValidate()) {
      isValid = false;
    }
    if (!checkAgencyUrlKeyValidate()) {
      isValid = false;
    }
    if (!checkAgencyNameValidate()) {
      isValid = false;
    }
    if (!checkNotifyFlagValidate()) {
      isValid = false;
    }
    if (!checkValidityValidate()) {
      isValid = false;
    }
    if (!checkBankNameValidate()) {
      isValid = false;
    }
    if (!checkBranchNameValidate()) {
      isValid = false;
    }
    if (!checkAccountNumValidate()) {
      isValid = false;
    }
    if (!checkAccountNameValidate()) {
      isValid = false;
    }
    if (!checkValidityDateValidate()) {
      isValid = false;
    }
    if (!checkDepositTypeValidate()) {
      isValid = false;
    }
    setSaveButtonErrorMsg('');
    if (!isValid) {
      setSaveButtonErrorMsg('入力内容に不備があります。');
      return;
    }

    csLoading(true);
    const agencyUpdateUrl = config.backendUrl + config.updateAgencyUrl;
    const postOptions = {
      path: agencyUpdateUrl,
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
          toast.error('保存に失敗しました。', { autoClose: 2000 });
        }
      });
    });
    postReq.on('error', function () {
      csLoading(false);
      toast.error('保存に失敗しました。', { autoClose: 2000 });
    });
    const body = {
      id: agencyId,
      password,
      validityDate: FieldValueTransformer.dateStringToDatetimeString(validityDate),
      shopName: shopName,
      agencyUrlKey: agencyUrlKey,
      postalCode: postalCode,
      address,
      phoneNum: phoneNum,
      email,
      agencyName: agencyName,
      bankName: bankName,
      branchName: branchName,
      depositType: depositType,
      accountNum: accountNum,
      accountName: accountName,
      notifyFlag: FieldValueTransformer.booleanToIntegerString(notifyFlag),
      validity: FieldValueTransformer.booleanToIntegerString(validity),
    };
    const postData = JSON.stringify({ agency: body });
    postReq.write(postData);
    postReq.end();
  };

  const handleChangePassword = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    checkPasswordValidate(newValue);
    setPassword(newValue);
  };

  const handleChangeShopName = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    checkShopNameValidate(newValue);
    setShopName(newValue);
  };

  const handleChangePostalCode = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    checkPostalCodeValidate(newValue);
    setPostalCode(newValue);
  };

  const handleChangeAddress = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    checkAddressValidate(newValue);
    setAddress(newValue);
  };

  const handleChangePhoneNum = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    checkPhoneNumValidate(newValue);
    setPhoneNum(newValue);
  };

  const handleChangeEmail = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    checkEmailValidate(newValue);
    setEmail(newValue);
  };

  const handleChangeAgencyName = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    checkAgencyNameValidate(newValue);
    setAgencyName(newValue);
  };
  const handleChangeAgencyUrlKey = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    checkAgencyUrlKeyValidate(newValue);
    setAgencyUrlKey(newValue);
  };
  const handleChangeNotifyFlag = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.checked;
    checkNotifyFlagValidate(newValue);
    setNotifyFlag(newValue);
  };

  const handleChangeValidity = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.checked;
    checkValidityValidate(newValue);
    setValidity(newValue);
  };

  const handleChangeBankName = (value: string) => {
    checkBankNameValidate(value);
    setBankName(value);
    // 銀行名が変更されたらドロップダウンリスト用の支店名の配列を更新
    const branchNames = [];
    for (const bank of banks) {
      const bankCode = bank.bankCode.padStart(BANK_CODE_DIGITS, '0');
      const selectedBankNameLabel = bankNames.find((option) => option.value === value)?.label;
      if (`${bank.bankMainName} (銀行コード:${bankCode})` === selectedBankNameLabel) {
        // 銀行名が一致した場合
        const branchCode = bank.branchCode.padStart(BRANCH_CODE_DIGITS, '0');
        const branchNameOption = {
          value: `${bank.branchName} (支店コード:${branchCode})`,
          label: `${bank.branchName} (支店コード:${branchCode})`,
        };
        branchNames.push(branchNameOption);
      }
    }
    setBranchNames(branchNames as BranchName[]);
    setBranchName('');
  };

  const handleChangeBranchName = (value: string) => {
    checkBranchNameValidate(value);
    setBranchName(value);
  };

  const handleChangeDepositType = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    checkDepositTypeValidate(newValue);
    setDepositType(newValue);
  };

  const handleChangeAccountNum = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    checkAccountNumValidate(newValue);
    setAccountNum(newValue);
  };
  const handleChangeAccountName = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    checkAccountNameValidate(newValue);
    setAccountName(newValue);
  };

  const handleChangeValidityDate = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    checkValidityDateValidate(newValue);
    setValidityDate(newValue);
  };

  return (
    <>
      <CustomHead title='管理画面 代理店 登録情報編集 | コインパーキング24' />
      <AdminLayout loginAdminRole={loginAdminRole}>
        <NextNProgress height={5} options={{ easing: 'ease', speed: 400, showSpinner: false }} />
        <div className={AdminStyles.container}>
          <div className={GlobalStyles['loader-container']} id='csLoader'>
            <ClipLoader color={'#fff'} size={60} />
          </div>

          <div className={AdminStyles['title-left']}>
            <span>基本情報登録</span>
          </div>
          <div className={AdminStyles['edit-container-2']}>
            <div className={AdminStyles['edit-item-category-container']}>
              <span className={AdminStyles['edit-item-category']}>基本情報</span>
            </div>
            <div className={AdminStyles['edit-item-container']}>
              <div className={AdminStyles['edit-item-title-container']}>
                <span className={AdminStyles['edit-item-title']}>代理店ID</span>
              </div>
              <span>{agencyIdName}</span>
            </div>
            <div className={AdminStyles['edit-item-container']}>
              <div className={AdminStyles['edit-item-title-container']}>
                <span className={AdminStyles['edit-item-title']}>パスワード</span>
              </div>
              <input
                type='password'
                className={AdminStyles['edit-item-input-1']}
                onChange={handleChangePassword}
                value={password}
                maxLength={AGENCY.PASSWORD__MAX_LENGTH}
                placeholder='パスワードを変更する場合のみ入力'
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
                className={AdminStyles['edit-item-input-5']}
                value={validityDate}
                onChange={handleChangeValidityDate}
              />
              <div className={AdminStyles['error-msg-container-1']}>
                <span className={AdminStyles['error-msg']}>{validityDateErrorMsg}</span>
              </div>
            </div>
            <div className={AdminStyles['edit-item-container']}>
              <div className={AdminStyles['edit-item-title-container']}>
                <span className={AdminStyles['edit-item-title']}>店舗名</span>
              </div>
              <input
                type={'text'}
                className={AdminStyles['edit-item-input-3']}
                value={shopName}
                maxLength={AGENCY.SHOP_NAME__MAX_LENGTH}
                onChange={handleChangeShopName}
              />
              <div className={AdminStyles['error-msg-container-1']}>
                <span className={AdminStyles['error-msg']}>{shopNameErrorMsg}</span>
              </div>
            </div>
            <div className={AdminStyles['edit-item-container']}>
              <div className={AdminStyles['edit-item-title-container']}>
                <span className={AdminStyles['edit-item-title']}>代理店URLKey</span>
                <span className={AdminStyles.require}>必須</span>
              </div>
              <input
                type={'text'}
                className={AdminStyles['edit-item-input-4']}
                value={agencyUrlKey}
                maxLength={AGENCY.AGENCY_URL_KEY__MAX_LENGTH}
                onChange={handleChangeAgencyUrlKey}
              />
              <div className={AdminStyles['error-msg-container-1']}>
                <span className={AdminStyles['error-msg']}>{agencyUrlKeyErrorMsg}</span>
              </div>
            </div>
            <div className={AdminStyles['edit-item-container']}>
              <div className={AdminStyles['edit-item-title-container']}>
                <span className={AdminStyles['edit-item-title']}>郵便番号</span>
              </div>
              <input
                type={'text'}
                className={AdminStyles['edit-item-input-4']}
                value={postalCode}
                maxLength={AGENCY.POSTAL_CODE__MAX_LENGTH}
                onChange={handleChangePostalCode}
              />
              <div className={AdminStyles['error-msg-container-1']}>
                <span className={AdminStyles['error-msg']}>{postalCodeErrorMsg}</span>
              </div>
            </div>
            <div className={AdminStyles['edit-item-container']}>
              <div className={AdminStyles['edit-item-title-container']}>
                <span className={AdminStyles['edit-item-title']}>住所</span>
              </div>
              <input
                type={'text'}
                className={AdminStyles['edit-item-input-2']}
                value={address}
                maxLength={AGENCY.ADDRESS__MAX_LENGTH}
                onChange={handleChangeAddress}
              />
              <div className={AdminStyles['error-msg-container-1']}>
                <span className={AdminStyles['error-msg']}>{addressErrorMsg}</span>
              </div>
            </div>
            <div className={AdminStyles['edit-item-container']}>
              <div className={AdminStyles['edit-item-title-container']}>
                <span className={AdminStyles['edit-item-title']}>電話番号</span>
              </div>
              <input
                type={'text'}
                className={AdminStyles['edit-item-input-5']}
                value={phoneNum}
                maxLength={AGENCY.PHONE_NUM__MAX_LENGTH}
                onChange={handleChangePhoneNum}
              />
              <div className={AdminStyles['error-msg-container-1']}>
                <span className={AdminStyles['error-msg']}>{phoneNumErrorMsg}</span>
              </div>
            </div>
            <div className={AdminStyles['edit-item-container']}>
              <div className={AdminStyles['edit-item-title-container']}>
                <span className={AdminStyles['edit-item-title']}>メールアドレス</span>
              </div>
              <input
                type={'text'}
                className={AdminStyles['edit-item-input-1']}
                value={email}
                maxLength={AGENCY.EMAIL__MAX_LENGTH}
                onChange={handleChangeEmail}
              />
              <div className={AdminStyles['error-msg-container-1']}>
                <span className={AdminStyles['error-msg']}>{emailErrorMsg}</span>
              </div>
            </div>
            <div className={AdminStyles['edit-item-container']}>
              <div className={AdminStyles['edit-item-title-container']}>
                <label>
                  <input
                    type='checkbox'
                    className={AdminStyles.checkbox}
                    checked={notifyFlag}
                    onChange={handleChangeNotifyFlag}
                  />
                  最新情報やお得なお知らせを受け取る
                </label>
              </div>
              <div className={AdminStyles['error-msg-container-1']}>
                <span className={AdminStyles['error-msg']}>{notifyFlagErrorMsg}</span>
              </div>
            </div>
            <div className={AdminStyles['edit-item-container']}>
              <div className={AdminStyles['edit-item-title-container']}>
                <span className={AdminStyles['edit-item-title']}>代表者氏名</span>
              </div>
              <input
                type={'text'}
                className={AdminStyles['edit-item-input-5']}
                value={agencyName}
                maxLength={AGENCY.AGENCY_NAME__MAX_LENGTH}
                onChange={handleChangeAgencyName}
              />
              <div className={AdminStyles['error-msg-container-1']}>
                <span className={AdminStyles['error-msg']}>{agencyNameErrorMsg}</span>
              </div>
            </div>
            <div className={AdminStyles['edit-item-category-container']}>
              <span className={AdminStyles['edit-item-category']}>振込先口座</span>
            </div>
            <div className={AdminStyles['edit-item-container']}>
              <div className={AdminStyles['edit-item-title-container']}>
                <span className={AdminStyles['edit-item-title']}>銀行名</span>
              </div>
              <Select
                showSearch
                value={bankName}
                className={AdminStyles['edit-item-select-3']}
                placeholder='銀行名を選択してください。'
                optionFilterProp='children'
                onChange={handleChangeBankName}
                filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                options={[{ label: '未選択', value: '' }, ...bankNames]}
              />
              <div className={AdminStyles['error-msg-container-1']}>
                <span className={AdminStyles['error-msg']}>{bankNameErrorMsg}</span>
              </div>
            </div>
            <div className={AdminStyles['edit-item-container']}>
              <div className={AdminStyles['edit-item-title-container']}>
                <span className={AdminStyles['edit-item-title']}>支店名</span>
              </div>
              <Select
                showSearch
                value={branchName}
                className={AdminStyles['edit-item-select-3']}
                placeholder='支店名を選択してください。'
                optionFilterProp='children'
                onChange={handleChangeBranchName}
                filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                options={[{ label: '未選択', value: '' }, ...branchNames]}
              />
              <div className={AdminStyles['error-msg-container-1']}>
                <span className={AdminStyles['error-msg']}>{branchNameErrorMsg}</span>
              </div>
            </div>
            <div className={AdminStyles['edit-item-container']}>
              <div className={AdminStyles['edit-item-title-container']}>
                <span className={AdminStyles['edit-item-title']}>預金種別</span>
              </div>
              <label>
                普通
                <input
                  type='radio'
                  name='type'
                  className={AdminStyles.radio}
                  onChange={handleChangeDepositType}
                  value='0'
                  defaultChecked={depositType === '0'}
                />
              </label>
              <label>
                当座
                <input
                  type='radio'
                  name='type'
                  className={AdminStyles.radio}
                  onChange={handleChangeDepositType}
                  value='1'
                  defaultChecked={depositType === '1'}
                />
              </label>
              <div className={AdminStyles['error-msg-container-1']}>
                <span className={AdminStyles['error-msg']}>{depositTypeErrorMsg}</span>
              </div>
            </div>
            <div className={AdminStyles['edit-item-container']}>
              <div className={AdminStyles['edit-item-title-container']}>
                <span className={AdminStyles['edit-item-title']}>口座番号</span>
              </div>
              <input
                type={'text'}
                className={AdminStyles['edit-item-input-5']}
                value={accountNum}
                maxLength={AGENCY.ACCOUNT_NUM__MAX_LENGTH}
                onChange={handleChangeAccountNum}
              />
              <div className={AdminStyles['error-msg-container-1']}>
                <span className={AdminStyles['error-msg']}>{accountNumErrorMsg}</span>
              </div>
            </div>
            <div className={AdminStyles['edit-item-container']}>
              <div className={AdminStyles['edit-item-title-container']}>
                <span className={AdminStyles['edit-item-title']}>口座名義(全角カナ)</span>
              </div>
              <input
                type={'text'}
                className={AdminStyles['edit-item-input-1']}
                value={accountName}
                maxLength={AGENCY.ACCOUNT_NAME__MAX_LENGTH}
                onChange={handleChangeAccountName}
              />
              <div className={AdminStyles['error-msg-container-1']}>
                <span className={AdminStyles['error-msg']}>{accountNameErrorMsg}</span>
              </div>
            </div>
            <div className={AdminStyles['edit-item-category-container']}>
              <span className={AdminStyles['edit-item-category']}>その他</span>
            </div>
            <div className={AdminStyles['edit-item-container']}>
              <div className={AdminStyles['edit-item-title-container']}>
                <label className={AdminStyles.radio_label} style={{ display: 'flex' }}>
                  <input
                    type='checkbox'
                    className={AdminStyles.checkbox}
                    checked={validity}
                    onChange={handleChangeValidity}
                  />
                  有効
                </label>
              </div>
              <div className={AdminStyles['error-msg-container-1']}>
                <span className={AdminStyles['error-msg']}>{validityErrorMsg}</span>
              </div>
            </div>
            <div className={AdminStyles['save-btn-container']}>
              <button className={AdminStyles['save-btn']} onClick={handleClickSaveButton}>
                保存
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

export default AdminAgencyRegistry;
