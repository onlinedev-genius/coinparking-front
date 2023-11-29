import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoneyCheck } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import ClipLoader from 'react-spinners/ClipLoader';
import { CSVLink } from 'react-csv';
import moment from 'moment';
import $ from 'jquery';
import { GetServerSideProps } from 'next';
import NextNProgress from 'nextjs-progressbar';
import humps from 'humps';
import CustomHead from '../../components/elements/CustomHead/CustomHead';
import * as useJwt from '../../features/auth/useJwt';
import config from '../../consts/config';
import AdminLayout from '../../components/layouts/Admin/AdminLayout';
import { HTTP_STATUS_CODE } from '../../consts/constants';
import GlobalStyles from '../../styles/Global.module.css';
import AdminStyles from '../../styles/Admin.module.css';
import 'react-toastify/dist/ReactToastify.css';

interface Admin {
  adminIdName: string;
  id: number;
  role: string;
  validity: string;
}

interface Companies {
  id: string;
  price: string;
  reward_date: string;
  status: string;
}

interface DateList {
  value: string;
  key: string;
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

const PaymentList: React.FC<{
  loginAdminRole: string;
}> = (props) => {
  const [loginAdminRole] = useState<string>(props.loginAdminRole);
  const [file, setFile] = useState();
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [selectedDate, setSelectedDate] = useState<string>('2022年10月集計分（11月末振り込み分）');
  const [dateList, setDateList] = useState<DateList[]>([]);
  const [rewardList, setRewardList] = useState([]);
  const router = useRouter();

  const csLoading = (flag: boolean) => {
    if (flag) {
      $('#csLoader').css('display', 'flex');
    } else {
      $('#csLoader').css('display', 'none');
    }
  };

  const getRewards = (start: string) => {
    const startDate = moment(start, 'YYYY年MM月');
    const body = {
      start_date: `${startDate.year()}-${startDate.format('MM')}-01`,
      end_date: `${startDate.year()}-${startDate.format('MM')}-${startDate.daysInMonth()}`,
    };
    csLoading(true);
    const url = config.backendUrl + config.getRewardsUrl;
    const https = require('https');
    const post_data = JSON.stringify({ admin: body });
    const post_options = {
      path: url,
      method: 'POST',
      headers: {
        Authorization: config.tokenType + useJwt.getAdminToken(),
        'Content-Type': 'application/json',
      },
    };
    const post_req = https.request(post_options, (res) => {
      res.setEncoding('utf8');
      res.on('data', (chunk: string) => {
        csLoading(false);
        const { reward } = JSON.parse(chunk);
        if (reward) {
          const list = [];
          list.push([
            'ID',
            '代理店ID',
            '銀行名',
            '支店名',
            '預金種別',
            '口座番号',
            '口座名義',
            '支払い金額',
            '支払いステータス',
            '支払い日',
          ]);
          for (const element of reward) {
            const item = [];
            item.push(element.id);
            item.push(element.agency_id_name);
            item.push(element.bank_name);
            item.push(element.branch_name);
            item.push(element.deposit_type === 0 ? '普通' : '当座');
            item.push(element.account_num);
            item.push(element.account_name);
            item.push(element.price);
            item.push(element.status);
            item.push(element.reward_date);
            list.push(item);
          }
          setRewardList(list as string[]);
        } else {
          toast.error('報酬支払い情報が見つかりません。', { autoClose: 2000 });
        }
      });
    });
    post_req.write(post_data);
    post_req.end();
  };

  useEffect(() => {
    if (!useJwt.isAdminLoggedIn()) {
      router.replace(config.frontAdminLogoutUrl);
    }

    const list = [];
    const firstDate = moment('2022/09', 'YYYY/MM');
    const max = 927,
      compare = 12;
    for (let i = 0; i < max; i += 1) {
      const year = firstDate.add(1, 'months');
      const next = parseInt(year.format('MM'), 10) + 1 > compare ? 1 : parseInt(year.format('MM'), 10) + 1;
      const item = { key: i, value: `${year.format('YYYY年MM月')}集計分（${next}月末振り込み分）` };
      list.push(item);
    }
    setDateList(list as DateList[]);
    const str = list[0].value;
    setSelectedDate(str);
    setSelectedIndex(0);
    const sub = 8;
    getRewards(str.substring(0, sub));
  }, [props]);

  const updateReward = (data: Companies) => {
    const url = config.backendUrl + config.updateRewardUrl;
    const https = require('https');
    const post_data = JSON.stringify({ reward: data });
    const post_options = {
      path: url,
      method: 'POST',
      headers: {
        Authorization: config.tokenType + useJwt.getAdminToken(),
        'Content-Type': 'application/json',
      },
    };
    const post_req = https.request(post_options, (res) => {
      res.setEncoding('utf8');
      res.on('data', () => {});
    });
    post_req.write(post_data);
    post_req.end();
  };

  const handleChangeOrderType = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    const ind = event.target.value;
    const str = dateList[ind].value as string;
    setSelectedDate(str);
    setSelectedIndex(Number(ind));
    const sub = 8;
    getRewards(str.substring(0, sub));
  };
  const csvFileToArray = (value: string) => {
    const csvHeader = value.slice(0, value.indexOf('\n')).split(',');
    const csvRows = value.slice(value.indexOf('\n') + 1).split('\n');

    const array = csvRows.map((i) => {
      const values = i.split(',');
      const obj = csvHeader.reduce((object, header: string, index: number) => {
        object[header] = values[index];
        return object;
      }, {});
      return obj;
    });

    for (let i = 0; i < array.length; i += 1) {
      const element = array[i];
      const str = JSON.stringify(element).replace(/\\["\\\/bfnrtu]/g, '');
      const json = JSON.parse(str);
      if (json['支払い金額']) {
        const item = {
          id: json.ID,
          price: json['支払い金額'],
          reward_date: json['支払い日'],
          status: json['支払いステータス'],
        };
        updateReward(item as Companies);
      }
    }
  };
  const handleOnSubmit = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    if (file) {
      const fileReader = new FileReader();
      fileReader.onload = (e: ProgressEvent<FileReader>) => {
        const text = e.target.result;
        csvFileToArray(text as string);
      };

      fileReader.readAsText(file);
    }
  };
  const handleOnChange = (e) => {
    setFile(e.target.files[0]);
  };
  return (
    <>
      <CustomHead title='管理画面 報酬支払い管理 | コインパーキング24' />
      <AdminLayout loginAdminRole={loginAdminRole}>
        <NextNProgress height={5} options={{ easing: 'ease', speed: 400, showSpinner: false }} />
        <div className={AdminStyles.container}>
          <div className={GlobalStyles['loader-container']} id='csLoader'>
            <ClipLoader color={'#fff'} size={60} />
          </div>

          <div className={AdminStyles['title-left']}>
            <div className={AdminStyles.icon}>
              <FontAwesomeIcon icon={faMoneyCheck} />
            </div>
            <span>報酬支払い管理</span>
          </div>
          <div className={AdminStyles['payment-container']}>
            <div className={AdminStyles['payment-item-csv-download']}>
              <div className={AdminStyles['payment-item-csv-download-title-container']}>
                <span className={AdminStyles['payment-item-csv-download-title']}>
                  振込報酬CSVファイルをダウンロード
                </span>
              </div>
              <div className={AdminStyles['payment-item-csv-download-select-box-container']}>
                <select
                  className={AdminStyles['payment-item-csv-download-select-box']}
                  value={selectedIndex}
                  onChange={(e) => handleChangeOrderType(e)}
                >
                  {dateList.map((data, index) => (
                    <option value={data.key} key={index}>
                      {data.value}
                    </option>
                  ))}
                </select>
                <CSVLink className={AdminStyles['download-btn']} data={rewardList} filename={`${selectedDate}.csv`}>
                  ダウンロード
                </CSVLink>
              </div>
            </div>
            <div className={AdminStyles['payment-item-csv-upload']}>
              <div className={AdminStyles['payment-item-csv-upload-title-container']}>
                <span className={AdminStyles['payment-item-csv-upload-title']}>
                  報酬支払済みCSVファイルをアップロード
                </span>
              </div>
              <form>
                <div className={AdminStyles['payment-item-csv-upload-select-btn-container']}>
                  <input
                    type={'file'}
                    id={'csvFileInput'}
                    accept={'.csv'}
                    onChange={handleOnChange}
                    className={AdminStyles['payment-item-csv-upload-select-btn']}
                  />

                  <button
                    className={AdminStyles['upload-btn']}
                    onClick={(e) => {
                      handleOnSubmit(e);
                    }}
                  >
                    アップロード
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </AdminLayout>
    </>
  );
};

export default PaymentList;
