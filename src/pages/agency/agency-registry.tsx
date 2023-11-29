import React, { useState, useEffect } from 'react';
import ClipLoader from 'react-spinners/ClipLoader';
import $ from 'jquery';
import { Select } from 'antd';
import humps from 'humps';
import { GetServerSideProps } from 'next';
import CustomHead from '../../components/elements/CustomHead/CustomHead';
import * as useJwt from '../../features/auth/useJwt';
import * as utils from '../../utils/utils';
import config from '../../consts/config';
import { HTTP_STATUS_CODE } from '../../consts/constants';
import GlobalStyles from '../../styles/Global.module.css';
import styles from './AgencyHistory.module.css';

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
  const { accountName } = agency;
  const { accountNum } = agency;
  const { notifyFlag } = agency;
  const { validityDate } = agency;

  return {
    props: {
      id,
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
      accountName,
      accountNum,
      notifyFlag,
      validityDate,
    },
  };
};

// Settings
const BANK_CODE_DIGITS = 4;
const BRANCH_CODE_DIGITS = 3;

interface Banks {
  id: string;
  bank_main_name: string;
  bank_name: string;
  bank_name_kana: string;
  branch_name: string;
  branch_name_kana: string;
  bank_code: string;
  branch_code: string;
  yucho_symbol: string;
}

interface BankNames {
  value: string;
  label: string;
}

interface BranchNames {
  value: string;
  label: string;
}
const AgencyRegistry: React.FC<{
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
}> = (props) => {
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
  const [notifyFlag, setNotifyFlag] = useState<string>(props.notifyFlag);
  const [bankNames, setBankNames] = useState<BankNames[]>([]);
  const [branchNames, setBranchNames] = useState<BranchNames[]>([]);
  const [bankInfos, setBankInfos] = useState<Banks[]>([]);
  const csLoading = (flag: boolean) => {
    if (flag) {
      $('#csLoader').css('display', 'flex');
    } else {
      $('#csLoader').css('display', 'none');
    }
  };

  const getBankList = () => {
    let result = '';
    csLoading(true);
    const url = config.backendUrl + config.getBanksUrl;
    const https = require('https');
    const postData = JSON.stringify({ id: '' });
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
        result += chunk;
        try {
          const { bank } = JSON.parse(result);
          if (bank) {
            setBankInfos(bank);

            let tempBankName = '';
            const tempBankList = [];
            for (const value of bank) {
              if (tempBankName !== value.bank_main_name) {
                tempBankName = value.bank_main_name;
                const bankCode = value.bank_code.padStart(BANK_CODE_DIGITS, '0');
                const subValue = {
                  value: `${value.bank_main_name} (${bankCode})`,
                  label: `${value.bank_main_name} (${bankCode})`,
                };
                tempBankList.push(subValue);
              }
            }

            setBankNames(tempBankList);
          }
        } catch {
          setAccountName('');
        }
      });
    });
    postReq.write(postData);
    postReq.end();
  };
  useEffect(() => {
    getBankList();
  }, [props]);

  const updateUserInfo = () => {
    const body = {
      id: agencyId,
      agency_id_name: agencyIdName,
      password,
      validity_date: '',
      shop_name: shopName,
      postal_code: postalCode,
      address,
      phone_num: phoneNum,
      email,
      agency_name: agencyName,
      bank_name: bankName,
      branch_name: branchName,
      deposit_type: depositType,
      account_num: accountNum,
      account_name: accountName,
      notify_flag: notifyFlag,
    };

    csLoading(true);
    const url = config.backendUrl + config.updateAgencyUrl;
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
        const { agency } = JSON.parse(chunk);
        if (agency) {
          useJwt.setAgencyToken(agency.token);
        }
      });
    });
    postReq.write(postData);
    postReq.end();
  };
  const handleChangePassword = (event) => {
    setPassword(event.target.value);
  };
  const handleChangeShopName = (event) => {
    setShopName(event.target.value);
  };
  const handleChangePostalCode = (event) => {
    setPostalCode(event.target.value);
  };
  const handleChangeAddress = (event) => {
    setAddress(event.target.value);
  };
  const handleChangePhoneNum = (event) => {
    setPhoneNum(event.target.value);
  };
  const handleChangeEmail = (event) => {
    if (event.target.value === '') {
      setEmail('');
    } else if (utils.validation1(event.target.value)) {
      setEmail(event.target.value);
    }
  };
  const handleChangeAgencyName = (event) => {
    setAgencyName(event.target.value);
  };
  const handleChangeNotifyFlag = (event) => {
    if (event.target.checked === true) setNotifyFlag('1');
    else setNotifyFlag('0');
  };
  const handleChangeBankName = (value) => {
    setBankName(value);

    const tempBranchList = [];
    for (const info of bankInfos) {
      const bankCode = info.bank_code.padStart(BANK_CODE_DIGITS, '0');

      if (value === `${info.bank_main_name} (${bankCode})`) {
        const branchCode = info.branch_code.padStart(BRANCH_CODE_DIGITS, '0');
        const subValue = {
          value: `${info.branch_name} (支店コード:${branchCode})`,
          label: `${info.branch_name} (支店コード:${branchCode})`,
        };

        tempBranchList.push(subValue);
      }
    }

    setBranchNames(tempBranchList);
    setBranchName('');
  };
  const handleChangeBranchName = (value) => {
    setBranchName(value);
  };
  const handleChangeDepositType = (event) => {
    setDepositType(event.target.value);
  };
  const handleChangeAccountNum = (event) => {
    if (event.target.value === '') {
      setAccountNum('');
    } else if (utils.validation2(event.target.value)) {
      setAccountNum(event.target.value);
    }
  };
  const handleChangeAccountName = (event) => {
    setAccountName(event.target.value);
  };

  return (
    <>
      <CustomHead title='代理店管理画面 登録情報変更 | コインパーキング24' />
      <div className={styles.container}>
        <div className={GlobalStyles['loader-container']} id='csLoader'>
          <ClipLoader color={'#fff'} size={60} />
        </div>

        <div className={styles.title}>基本情報登録</div>
        <div className={`${GlobalStyles['cs-flex']} ${GlobalStyles['mt20px']}`}>
          <div className={styles.subtitle}>{shopName}</div>
        </div>
        <div className={`${GlobalStyles['cs-flex']} ${GlobalStyles['mt20px']}`}>
          <div className={`${styles.itemtitle} ${GlobalStyles['w400px']}`}>基本情報：</div>
        </div>
        <div className={`${GlobalStyles['cs-flex']} ${GlobalStyles['mt20px']}`}>
          <div>
            <div className={`${styles.itemtitle} ${GlobalStyles['w300px']}`}>代理店ID：</div>
            <div className={styles.itemtitle}>{agencyIdName}</div>
          </div>
        </div>
        <div className={GlobalStyles['cs-flex']}>
          <div>
            <div className={styles.itemtitle}>パスワード：</div>
            <input
              type='password'
              className={`${styles.input} ${GlobalStyles['w300px']}`}
              onChange={handleChangePassword}
              value={password}
              autoComplete='new-password'
            />
          </div>
        </div>
        <div className={GlobalStyles['cs-flex']}>
          <div>
            <div className={styles.itemtitle}>店舗名：</div>
            <input
              type='text'
              maxLength={50}
              className={`${styles.input} ${GlobalStyles['w300px']}`}
              onChange={handleChangeShopName}
              value={shopName}
            />
          </div>
        </div>
        <div className={GlobalStyles['cs-flex']}>
          <div>
            <div className={styles.itemtitle}>代理店URLKey：</div>
            <input
              type='text'
              maxLength={8}
              className={`${styles.input} ${GlobalStyles['w300px']}`}
              value={agencyUrlKey}
              disabled
            />
          </div>
        </div>
        <div className={GlobalStyles['cs-flex']}>
          <div>
            <div className={styles.itemtitle}>郵便番号：</div>
            <input
              type='text'
              maxLength={8}
              className={`${styles.input} ${GlobalStyles['w300px']}`}
              onChange={handleChangePostalCode}
              value={postalCode}
            />
          </div>
        </div>
        <div className={GlobalStyles['cs-flex']}>
          <div>
            <div className={styles.itemtitle}>住所：</div>
            <input
              type='text'
              maxLength={100}
              className={`${styles.input} ${GlobalStyles['w300px']}`}
              onChange={handleChangeAddress}
              value={address}
            />
          </div>
        </div>
        <div className={GlobalStyles['cs-flex']}>
          <div>
            <div className={styles.itemtitle}>電話番号：</div>
            <input
              type='text'
              className={`${styles.input} ${GlobalStyles['w300px']}`}
              onChange={handleChangePhoneNum}
              value={phoneNum}
            />
          </div>
        </div>
        <div className={GlobalStyles['cs-flex']}>
          <div>
            <div className={styles.itemtitle}>メールアドレス：</div>
            <input
              type='text'
              maxLength={100}
              className={`${styles.input} ${GlobalStyles['w300px']}`}
              onChange={handleChangeEmail}
              value={email}
            />
          </div>
        </div>
        {notifyFlag === '1' && (
          <div className={`${GlobalStyles['cs-flex']} ${GlobalStyles['mt10px']}`}>
            <label className={styles.radio_label} style={{ display: 'flex' }}>
              最新情報やお得なお知らせを受け取る
              <input
                type='checkbox'
                className={`${styles.select} ${GlobalStyles['w60px']}`}
                checked
                style={{ marginTop: 0 }}
                onChange={handleChangeNotifyFlag}
              />
            </label>
          </div>
        )}
        {notifyFlag === '0' && (
          <div className={`${GlobalStyles['cs-flex']} ${GlobalStyles['mt10px']}`}>
            <label className={styles.radio_label} style={{ display: 'flex' }}>
              最新情報やお得なお知らせを受け取る
              <input
                type='checkbox'
                className={`${styles.select} ${GlobalStyles['w60px']}`}
                onChange={handleChangeNotifyFlag}
                style={{ marginTop: 0 }}
              />
            </label>
          </div>
        )}
        <div className={GlobalStyles['cs-flex']}>
          <div>
            <div className={styles.itemtitle}>代表者氏名：</div>
            <input
              type='text'
              maxLength={20}
              className={`${styles.input} ${GlobalStyles['w300px']}`}
              onChange={handleChangeAgencyName}
              value={agencyName}
            />
          </div>
        </div>

        <div className={`${GlobalStyles['cs-flex']} ${GlobalStyles['mt20px']}`}>
          <div className={`${styles.itemtitle} ${GlobalStyles['w400px']}`}>振込先口座：</div>
        </div>
        <div className={GlobalStyles['cs-flex']}>
          <div>
            <div className={styles.itemtitle}>銀行名：</div>
            <Select
              showSearch
              value={bankName}
              style={{ width: 300, textAlign: 'left' }}
              dropdownStyle={{ borderRadius: 0 }}
              placeholder='銀行名を選択してください。'
              optionFilterProp='children'
              onChange={handleChangeBankName}
              // OnSearch={onSearch}
              filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
              options={bankNames}
            />
          </div>
        </div>
        <div className={GlobalStyles['cs-flex']}>
          <div>
            <div className={styles.itemtitle}>支店名：</div>
            <Select
              showSearch
              value={branchName}
              style={{ width: 300, textAlign: 'left' }}
              dropdownStyle={{ borderRadius: 0 }}
              placeholder='支店名を選択してください。'
              optionFilterProp='children'
              onChange={handleChangeBranchName}
              // OnSearch={onSearch}
              filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
              options={branchNames}
            />
          </div>
        </div>
        <div className={GlobalStyles['cs-flex']}>
          <div className={`${styles.itemtitle} ${GlobalStyles['w300px']}`}>預金種別：</div>
        </div>
        <div className={GlobalStyles['cs-flex']} style={{ marginTop: 10 }}>
          <label className={styles.radio_label} style={{ display: 'flex' }}>
            普通
            <input
              type='radio'
              name='type'
              className={`${styles.select} ${GlobalStyles['w60px']}`}
              onChange={handleChangeDepositType}
              style={{ marginTop: 0 }}
              value='0'
            />
          </label>
          <label className={styles.radio_label} style={{ display: 'flex' }}>
            当座
            <input
              type='radio'
              name='type'
              className={`${styles.select} ${GlobalStyles['w60px']}`}
              onChange={handleChangeDepositType}
              style={{ marginTop: 0 }}
              value='1'
            />
          </label>
        </div>
        <div className={GlobalStyles['cs-flex']}>
          <div>
            <div className={styles.itemtitle}>口座番号：</div>
            <input
              type='text'
              maxLength={7}
              className={`${styles.input} ${GlobalStyles['w300px']}`}
              onChange={handleChangeAccountNum}
              value={accountNum}
            />
          </div>
        </div>
        <div className={GlobalStyles['cs-flex']}>
          <div>
            <div className={styles.itemtitle}>口座名義(全角カナ)：</div>
            <input
              type='text'
              maxLength={60}
              className={`${styles.input} ${GlobalStyles['w300px']}`}
              onChange={handleChangeAccountName}
              value={accountName}
            />
          </div>
        </div>
        <div className={`${GlobalStyles['cs-flex']} ${GlobalStyles['mt20px']}`}>
          <button className={styles.search_btn} onClick={updateUserInfo}>
            登録
          </button>
        </div>
      </div>
    </>
  );
};

export default AgencyRegistry;
