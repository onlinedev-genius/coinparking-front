import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import moment from 'moment';
import ClipLoader from 'react-spinners/ClipLoader';
import $ from 'jquery';
import { Select } from 'antd';
import CustomHead from '../../components/elements/CustomHead/CustomHead';
import config from '../../consts/config';
import * as useJwt from '../../features/auth/useJwt';
import * as utils from '../../utils/utils';
import GlobalStyles from '../../styles/Global.module.css';
import styles from './NewAgency.module.css';

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

const NewAgency: React.FC = (props) => {
  const [agencyIdName, setAgencyIdName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [shopName, setShopName] = useState<string>('');
  const [postalCode, setPostalCode] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [phoneNum, setPhoneNum] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [agencyName, setAgencyName] = useState<string>('');
  const [bankName, setBankName] = useState<string>('');
  const [branchName, setBranchName] = useState<string>('');
  const [depositType, setDepositType] = useState<string>('0');
  const [accountNum, setAccountNum] = useState<string>('');
  const [accountName, setAccountName] = useState<string>('');
  const [notifyFlag, setNotifyFlag] = useState<string>('0');
  const [bankNames, setBankNames] = useState<BankNames[]>([]);
  const [branchNames, setBranchNames] = useState<BranchNames[]>([]);
  const [bankInfos, setBankInfos] = useState<Banks[]>([]);
  const router = useRouter();

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
          const bankList = JSON.parse(result).bank;
          if (bankList) {
            setBankInfos(bankList);

            let tempBankName = '';
            const tempBankList = [];
            for (const value of bankList) {
              if (tempBankName !== value.bank_main_name) {
                tempBankName = value.bank_main_name;
                let bankCode = value.bank_code;
                const max = 4;
                bankCode = bankCode.padStart(max, '0');
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
          setBankNames([]);
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
    if (agencyIdName === '') {
      toast.error('代理店IDを入力してください。', { autoClose: 2000 });
      return;
    }
    if (password === '') {
      toast.error('パスワードを入力してください。', { autoClose: 2000 });
      return;
    }

    const addYear = 10;
    const body = {
      // "id": agencyId,
      agency_id_name: agencyIdName,
      password,
      validity_date: moment().add(addYear, 'years').format('YYYY-MM-DD'),
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
      delete_flag: '0',
    };
    csLoading(true);
    const url = config.backendUrl + config.createAgencyUrl;
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
  const handleChangeagencyIdName = (event) => {
    setAgencyIdName(event.target.value);
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
    if (event.target.checked === true) {
      setNotifyFlag('1');
    } else {
      setNotifyFlag('0');
    }
  };
  const handleChangeBankName = (value) => {
    setBankName(value);

    const tempBranchList = [];
    for (const info of bankInfos) {
      let bankCode = info.bank_code;
      let pre = '';
      const max = 4;
      for (let i = 0; i < max - bankCode.length; i += 1) {
        pre += '0';
      }
      bankCode = pre + bankCode;

      if (value === `${info.bank_main_name} (${bankCode})`) {
        let branchCode = info.branch_code;
        let preOther = '';
        const branchMax = 3;
        for (let i = 0; i < branchMax - branchCode.length; i += 1) {
          preOther += '0';
        }
        branchCode = preOther + branchCode;
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
      <CustomHead title='代理店管理画面 新規登録 | コインパーキング24' />
      <div className={styles.container}>
        <div className={GlobalStyles['loader-container']} id='csLoader'>
          <ClipLoader color={'#fff'} size={60} />
        </div>

        <div className={styles.title}>基本情報登録</div>
        <div className={`${GlobalStyles['cs-flex']} ${styles.mt20px}`}>
          <div className={styles.subtitle}>{shopName}</div>
        </div>
        <div className={`${GlobalStyles['cs-flex']} ${styles.mt20px}`}>
          <div className={`${styles.itemtitle} ${styles.w400px}`}>基本情報：</div>
        </div>
        <div className={`${GlobalStyles['cs-flex']} ${styles.mt20px}`}>
          <div>
            <div className={`${styles.itemtitle} ${styles.w300px}`}>代理店ID：</div>
            <input
              type='text'
              className={`${styles.input} ${styles.w300px}`}
              onChange={handleChangeagencyIdName}
              value={agencyIdName}
            />
          </div>
        </div>
        <div className={GlobalStyles['cs-flex']}>
          <div>
            <div className={styles.itemtitle}>パスワード：</div>
            <input
              type='password'
              className={`${styles.input} ${styles.w300px}`}
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
              className={`${styles.input} ${styles.w300px}`}
              onChange={handleChangeShopName}
              value={shopName}
            />
          </div>
        </div>
        <div className={GlobalStyles['cs-flex']}>
          <div>
            <div className={styles.itemtitle}>郵便番号：</div>
            <input
              type='text'
              maxLength={15}
              className={`${styles.input} ${styles.w300px}`}
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
              className={`${styles.input} ${styles.w300px}`}
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
              className={`${styles.input} ${styles.w300px}`}
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
              className={`${styles.input} ${styles.w300px}`}
              onChange={handleChangeEmail}
              value={email}
            />
          </div>
        </div>
        {notifyFlag === '1' && (
          <div className={`${GlobalStyles['cs-flex']} ${styles.mt10px}`}>
            <label className={styles.radio_label}>
              最新情報やお得なお知らせを受け取る
              <input
                type='checkbox'
                className={`${styles.select} ${styles.w60px}`}
                checked
                onChange={handleChangeNotifyFlag}
              />
            </label>
          </div>
        )}
        {notifyFlag === '0' && (
          <div className={`${GlobalStyles['cs-flex']} ${styles.mt10px}`}>
            <label className={styles.radio_label}>
              最新情報やお得なお知らせを受け取る
              <input type='checkbox' className={`${styles.select} ${styles.w60px}`} onChange={handleChangeNotifyFlag} />
            </label>
          </div>
        )}
        <div className={GlobalStyles['cs-flex']}>
          <div>
            <div className={styles.itemtitle}>代表者氏名：</div>
            <input
              type='text'
              maxLength={20}
              className={`${styles.input} ${styles.w300px}`}
              onChange={handleChangeAgencyName}
              value={agencyName}
              style={{ textAlign: 'left' }}
            />
          </div>
        </div>

        <div className={`${GlobalStyles['cs-flex']} ${styles.mt20px}`}>
          <div className={`${styles.itemtitle} ${styles.w400px}`}>振込先口座：</div>
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
              filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
              options={branchNames}
            />
          </div>
        </div>
        <div className={GlobalStyles['cs-flex']}>
          <div className={`${styles.itemtitle} ${styles.w300px}`}>預金種別：</div>
        </div>
        <div className={GlobalStyles['cs-flex']}>
          <label className={styles.radio_label}>
            普通
            <input
              type='radio'
              name='type'
              className={`${styles.select} ${styles.w60px}`}
              onChange={handleChangeDepositType}
              value='0'
            />
          </label>
          <label className={styles.radio_label}>
            当座
            <input
              type='radio'
              name='type'
              className={`${styles.select} ${styles.w60px}`}
              onChange={handleChangeDepositType}
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
              className={`${styles.input} ${styles.w300px}`}
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
              className={`${styles.input} ${styles.w300px}`}
              onChange={handleChangeAccountName}
              value={accountName}
            />
          </div>
        </div>
        <div className={`${GlobalStyles['cs-flex']} ${styles.mt20px}`}>
          <button className={styles.search_btn} onClick={updateUserInfo}>
            登録
          </button>
        </div>
      </div>
    </>
  );
};

export default NewAgency;
