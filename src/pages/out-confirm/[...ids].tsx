import { lookupService } from 'dns';
import { useRouter } from 'next/router';
import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import $ from 'jquery';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import ClipLoader from 'react-spinners/ClipLoader';
import { GetServerSideProps } from 'next';
import moment from 'moment';
import CustomHead from '../../components/elements/CustomHead/CustomHead';
import config from '../../consts/config';
import LogoImg from '../../img/logo.svg';
import GlobalStyles from '../../styles/Global.module.css';
import InOutStyles from '../../styles/InOut.module.css';
import 'react-toastify/dist/ReactToastify.css';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { req } = context;
  let ipAddress = '';
  if (req.headers['x-forwarded-for']) {
    const temp = String(req.headers['x-forwarded-for']).split(',');
    ipAddress = temp['0'];
  } else if (req.connection.remoteAddress) {
    ipAddress = req.connection.remoteAddress;
  }
  const userAgent = req.headers['user-agent'];
  const servicePort = 22;
  const getHostName = (ipAddressOther: string): Promise<string> =>
    new Promise((resolve) => {
      lookupService(ipAddressOther, servicePort, (error, hostname) => {
        if (error) {
          resolve('');
        }
        resolve(hostname);
      });
    });
  const hostName = await getHostName(ipAddress);

  return {
    props: {
      ipAddress,
      userAgent,
      hostName,
    },
  };
};

type PageProps = {
  ipAddress: string;
  userAgent: string;
  hostName: string;
};

const OutConfirm: React.FC<PageProps> = (props) => {
  const [paymentMethod, setPaymentMethod] = useState<string>('クレジットカード/デビットカード');
  const [paymentType, setPaymentType] = useState<string>('0');
  const [cardToken, setCardToken] = useState<string>('');
  const [placeUrlKey, setPlaceUrlKey] = useState<string>('');
  const [price, setPrice] = useState<number>(0);
  const [couponValue] = useState<string>('');
  const router = useRouter();
  const [ipAddress, setIpAddress] = useState<string>('');
  const [hostName, setHostName] = useState<string>('');
  const [userAgent, setUserAgent] = useState<string>('');
  const [placeId, setPlaceId] = useState<string>('');
  const [placeName, setPlaceName] = useState<string>('');
  const [placePrice, setPlacePrice] = useState<string>('');
  const [perMinute, setPerMinute] = useState<string>('');
  const [spaceNum, setSpaceNum] = useState<string>('');
  const [inAt, setInAt] = useState<string>('');
  const [showInAt, setShowInAt] = useState<string>('');
  const [manualInAt, setManualInAt] = useState<string>('');
  const [outTime, setOutTime] = useState<string>('');
  const [diffTime, setDiffTime] = useState<string>('');

  const csLoading = (flag: boolean) => {
    if (flag) {
      $('#csLoader').css('display', 'flex');
    } else {
      $('#csLoader').css('display', 'none');
    }
  };
  const updateSaleComplete = (key: string, transactionInfo: string) => {
    const body = {
      sale_key: key,
      transaction_id: transactionInfo,
    };

    csLoading(true);
    const url = config.backendUrl + config.updateSaleCompleteUrl;
    const https = require('https');
    const postData = JSON.stringify({ sale: body });
    const postOptions = {
      path: url,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    };
    const postReq = https.request(postOptions, (res) => {
      res.setEncoding('utf8');
      res.on('data', (chunk: string) => {
        csLoading(false);
        if (JSON.parse(chunk).error) {
          toast.error(JSON.parse(chunk).message, { autoClose: 2000 });
        } else {
          router.push(
            {
              pathname: config.frontOutCompletedUrl.replace('{place-url-key}', localStorage.getItem('place_url_key')),
              query: {
                place_url_key: localStorage.getItem('place_url_key'),
              },
            },
            config.frontOutCompletedUrl.replace('{place-url-key}', localStorage.getItem('place_url_key'))
          );
        }
      });
    });
    postReq.write(postData);
    postReq.end();
  };

  useEffect(() => {
    const info = router.query;

    const ids: string[] = info.ids as string[];
    if (!ids) return;
    setPlaceUrlKey(ids[0]);
    localStorage.setItem('place_url_key', ids[0]);
    setPaymentType(localStorage.getItem('payment_method'));
    setIpAddress(props.ipAddress);
    setHostName(props.hostName);
    setUserAgent(props.userAgent);

    if (localStorage.getItem('payment_method') === '0') {
      setPaymentMethod('クレジットカード/デビットカード');
    } else {
      setPaymentMethod('PayPay');
    }

    if (info.method) {
      if (localStorage.getItem('payment_method') === '0') {
        setCardToken(info.card_token as string);
      }

      setPlaceId(info.place_id as string);
      setPlaceName(info.place_name as string);
      setPlacePrice(info.place_price as string);
      setPerMinute(info.place_per_minute as string);
      setSpaceNum(info.space_num as string);
      setInAt(info.in_at as string);
      setShowInAt(info.show_in_at as string);
      setManualInAt(info.manual_in_at as string);
      setOutTime(info.out_time as string);
      setDiffTime(info.diff_time as string);
      setPrice(Number(info.total_price));
    } else if (info.hmac) {
      if (info['transaction[status]'] === 'captured') {
        updateSaleComplete(`${info.key}`, `${info['transaction[uuid]']}`);
      } else if (localStorage.getItem('place_url_key')) {
        router.push(config.frontOutUrl.replace('{place-url-key}', localStorage.getItem('place_url_key')));
      } else {
        router.push(config.frontOutUrl);
      }
    } else {
      router.push(config.frontOutUrl);
    }
  }, [props, router]);

  const paymentByPayPay = (key: string) => {
    const body = {
      amount: `${price}`,
      payment_email: '',
      header_auth: '',
      ret_url: `${config.frontendUrl}${config.frontOutConfirmdUrl.replace('{place-url-key}', placeUrlKey)}?key=${key}`,
    };

    csLoading(true);
    const url = config.backendUrl + config.paypayPaymentUrl;
    const https = require('https');
    const postData = JSON.stringify({ paypay_item: body });
    const postOptions = {
      path: url,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    };
    const postReq = https.request(postOptions, (res) => {
      res.setEncoding('utf8');
      res.on('data', (chunk: string) => {
        csLoading(false);
        const resultList = JSON.parse(chunk).result;
        if (JSON.parse(resultList).error) {
          toast.error(JSON.parse(resultList).error.message, { autoClose: 2000 });
        } else if (JSON.parse(resultList).payment_details.redirect_url) {
          window.location.assign(JSON.parse(resultList).payment_details.redirect_url);
        } else {
          toast.error('お支払いに失敗しました。', { autoClose: 2000 });
        }
      });
    });
    postReq.write(postData);
    postReq.end();
  };

  const onPlay = (transactionInfo: string) => {
    // Backend APIに渡すためにフォーマットする。
    let fmtedInAt = null;
    if (inAt !== 'null') {
      fmtedInAt = moment(inAt).format('YYYY-MM-DDTHH:mm:ssZ');
    }
    let fmtedManualInAt = null;
    if (manualInAt !== 'null') {
      fmtedManualInAt = moment(manualInAt).format('YYYY-MM-DDTHH:mm:ssZ');
    }
    let fmtedOutTime = null;
    if (outTime !== 'null') {
      fmtedOutTime = moment(outTime).format('YYYY-MM-DDTHH:mm:ssZ');
    }

    const body = {
      place_id: placeId,
      transaction_id: transactionInfo,
      coupon_code: couponValue,
      in_at: fmtedInAt,
      manual_in_at: fmtedManualInAt,
      usage_time: diffTime,
      sold_at: fmtedOutTime,
      payment_type: localStorage.getItem('payment_method'),
      price,
      space_num: spaceNum,
      per_minute: perMinute,
      ip_address: ipAddress,
      host_name: hostName,
      user_agent: userAgent,
    };

    csLoading(true);
    const url = config.backendUrl + config.addSaleUrl;
    const https = require('https');
    const postData = JSON.stringify({ sale: body });
    const postOptions = {
      path: url,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    };
    const postReq = https.request(postOptions, (res) => {
      res.setEncoding('utf8');
      res.on('data', (chunk: string) => {
        csLoading(false);
        if (JSON.parse(chunk).error) {
          toast.error(JSON.parse(chunk).message, { autoClose: 2000 });
        } else if (transactionInfo) {
          router.push(
            {
              pathname: config.frontOutCompletedUrl.replace('{place-url-key}', localStorage.getItem('place_url_key')),
              query: {
                place_url_key: localStorage.getItem('place_url_key'),
              },
            },
            config.frontOutCompletedUrl.replace('{place-url-key}', localStorage.getItem('place_url_key'))
          );
        } else {
          const resultList = JSON.parse(chunk).result;
          paymentByPayPay(resultList.sale_key);
        }
      });
    });
    postReq.write(postData);
    postReq.end();
  };

  const paymentByCard = () => {
    const body = {
      amount: price,
      token: cardToken,
    };

    csLoading(true);
    const url = config.backendUrl + config.payjpPaymentUrl;
    const https = require('https');
    const postData = JSON.stringify({ card_item: body });
    const postOptions = {
      path: url,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    };
    const postReq = https.request(postOptions, (res) => {
      res.setEncoding('utf8');
      res.on('data', (chunk: string) => {
        csLoading(false);

        if (JSON.parse(chunk).error) {
          if (JSON.parse(chunk).error.indexOf('card_declined') >= 0) {
            toast.error('お支払いに失敗しました。カード情報をご確認ください。', { autoClose: 2000 });
          } else if (JSON.parse(chunk).error.indexOf('expired_card') >= 0) {
            toast.error('お支払いに失敗しました。カードの有効期限をご確認ください。', { autoClose: 2000 });
          } else {
            toast.error(`お支払いに失敗しました。${JSON.parse(chunk).error}`, { autoClose: 2000 });
          }
        } else {
          const resultList = JSON.parse(chunk).result;
          onPlay(resultList);
        }
      });
    });
    postReq.write(postData);
    postReq.end();
  };

  const addSalesByPayPay = () => {
    onPlay(null);
  };

  const onPayment = () => {
    if (paymentType === '0') {
      paymentByCard();
    } else {
      addSalesByPayPay();
    }
  };

  return (
    <>
      <CustomHead title={`出庫確認 ${placeName} | コインパーキング24`} />
      <div className={InOutStyles.container}>
        <div className={InOutStyles.loader_container} id='csLoader'>
          <ClipLoader color={'#fff'} size={60} />
        </div>

        <div className={InOutStyles.title}>
          <h1>
            <Image className={InOutStyles.logo} src={LogoImg} alt='コインパーキング24' />
          </h1>
        </div>
        <div className={`${InOutStyles.subtitle} ${GlobalStyles['mt20px']}`} style={{ color: 'red' }}>
          まだお支払いは完了していません。
        </div>
        <div className={InOutStyles.subtitle}>
          内容をご確認の上、よろしければ
          <br />
          「お支払い」ボタンを押してください。
        </div>

        <div className={`${InOutStyles.subtitle} ${GlobalStyles['mt20px']}`}>駐車場: {placeName} </div>
        <div className={InOutStyles.subtitle}>
          {perMinute}分/{placePrice}円
        </div>
        <div className={InOutStyles.subtitle}>駐車番号: {spaceNum} </div>
        <div className={`${InOutStyles.subtitle} ${GlobalStyles['mt20px']}`}>ご利用開始日時: {showInAt}</div>
        <div className={InOutStyles.subtitle}>ご利用終了日時: {outTime}</div>
        <div className={`${InOutStyles.subtitle} ${GlobalStyles['mt20px']}`}>ご利用時間: {diffTime}</div>
        <div className={GlobalStyles['cs-flex']}>
          <div>
            <div className={InOutStyles.subtitle}>お支払方法: {paymentMethod}</div>
          </div>
        </div>
        {paymentMethod === 'クレジットカード/デビットカード' && (
          <div className={GlobalStyles['cs-flex']}>
            <div></div>
          </div>
        )}
        {couponValue !== '' && (
          <div>
            <div className={GlobalStyles['cs-flex']}>
              <div>
                <div className={InOutStyles.subtitle}>クーポン：-¥0</div>
              </div>
            </div>
          </div>
        )}
        <div className={`${GlobalStyles['cs-flex']} ${GlobalStyles['mt20px']}`}>
          <div>
            <div className={InOutStyles.subtitle}>
              お支払い合計: <b>{price.toString().replace(/\B(?=(\d{3})+(?!\d))/u, ',')}円</b>
            </div>
          </div>
        </div>

        <div className={`${GlobalStyles['cs-flex']} ${GlobalStyles['mt20px']}`}>
          <button className={InOutStyles['link-button']} onClick={onPayment}>
            お支払い
          </button>
        </div>
        <div className={GlobalStyles.margin02}></div>
      </div>
      <ToastContainer />
    </>
  );
};

export default OutConfirm;
