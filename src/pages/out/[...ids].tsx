import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import ClipLoader from 'react-spinners/ClipLoader';
import { useRouter } from 'next/router';
import Image from 'next/image';
import $ from 'jquery';
import humps from 'humps';
import Script from 'next/script';
import { Button } from 'antd';
import moment from 'moment';
import { GetServerSideProps } from 'next';
import CustomHead from '../../components/elements/CustomHead/CustomHead';
import config from '../../consts/config';
import LogoImg from '../../img/logo.svg';
import PayPayImg from '../../img/paypay.svg';
import GlobalStyles from '../../styles/Global.module.css';
import InOutStyles from '../../styles/InOut.module.css';
import 'react-toastify/dist/ReactToastify.css';

interface SpaceNum {
  value: string;
  label: string;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const info = context.query;
  let spaceNum = '-1';
  if (info.no) {
    spaceNum = info.no.toString();
  }
  const placeUrlKey = info.ids[0] as string;
  const postData = JSON.stringify({ place_url_key: placeUrlKey });
  const res = await fetch(config.backendUrl + config.getPlaceByKeyUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: postData,
  });
  if (!res.ok) {
    throw new Error('Failed to fetch data');
  }
  const { place } = await res.json();

  const placeId = place.id;
  const placeName = place.place_name;
  const price = place.price as number;
  const perMinute = place.per_minute;

  const numList = place.space_num_list.split(',');
  const tempList = [];
  if (numList.length > 0) {
    for (let i = 0; i < numList.length; i += 1) {
      tempList.push({
        value: numList[i],
        label: numList[i],
      });
    }
  }
  const spaceNumList: SpaceNum[] = tempList as SpaceNum[];
  const now = new Date().toISOString();
  return {
    props: {
      placeUrlKey,
      placeId,
      placeName,
      price,
      perMinute,
      spaceNumList,
      spaceNum,
      now,
    },
  };
};

const Home: React.FC<{
  placeUrlKey: string;
  placeId: string;
  placeName: string;
  price: number;
  perMinute: number;
  spaceNumList: SpaceNum[];
  spaceNum: string;
  now: string;
}> = (props) => {
  const [placeUrlKey] = useState<string>(props.placeUrlKey);
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [couponValue, setCouponValue] = useState<string>('');
  const [isManual, setManual] = useState<boolean>(false);
  const [manualDate, setManualDate] = useState<string>('');
  const [manualTime, setManualTime] = useState<string>('');
  const [manualInAt, setManualInAt] = useState<string>('');
  const [isTerms, setTerms] = useState<boolean>(false);
  const [placeId] = useState<string>(props.placeId);
  const [placeName] = useState<string>(props.placeName);
  const [price] = useState<number>(props.price);
  const [perMinute] = useState<number>(props.perMinute);
  const [spaceNum, setSpaceNum] = useState<string>(props.spaceNum);
  const [spaceNumList] = useState<SpaceNum[]>(humps.camelizeKeys(props.spaceNumList) as SpaceNum[]);
  const [showInAt, setShowInAt] = useState<string>('');
  const [inAt, setInAt] = useState<string>('');
  const [outTime, setOutTime] = useState<string>('');
  const [diffTime, setDiffTime] = useState<string>('');
  const [totalPrice, setTotalPrice] = useState<string>('');
  const [isManualInAtSet, setisManualInAtSet] = useState<boolean>(false);
  const csLoading = (flag: boolean) => {
    if (flag) {
      $('#csLoader').css('display', 'flex');
    } else {
      $('#csLoader').css('display', 'none');
    }
  };

  // ご利用開始日時の日時部分のClass
  let showInAtClass = InOutStyles.show_in_at;
  if (isManualInAtSet) {
    showInAtClass = InOutStyles.show_manual_in_at;
  }

  const router = useRouter();

  const getInData = (_id, _num, _price) => {
    setInAt('null');
    setManualInAt('null');
    const https = require('https');
    const now = moment(props.now).seconds(0).milliseconds(0).toISOString();
    const body = {
      place_id: _id,
      space_num: _num,
    };

    csLoading(true);
    const postData = JSON.stringify({ in_item: body });

    const postOptions = {
      path: config.backendUrl + config.getInDataUrl,
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
          if (body.space_num !== 'undefined') {
            setShowInAt('不明');
            setDiffTime('不明');
            setTotalPrice('不明');
            setOutTime(moment(now).format('YYYY/MM/DD HH:mm'));
          }
        } else {
          const inData = JSON.parse(chunk).in_item;
          if (inData) {
            setShowInAt(moment(inData.in_at).format('YYYY/MM/DD HH:mm'));
            setInAt(moment(inData.in_at).format('YYYY/MM/DD HH:mm'));
            setOutTime(moment(now).format('YYYY/MM/DD HH:mm'));
            const diff = moment(now).diff(moment(inData.in_at));
            const ms = 1000,
              hour = 3600;
            setDiffTime(`${Math.floor(diff / ms / hour)}時間${moment.utc(diff).format('mm')}分`);
            const subTotalPrice = _price * Math.ceil(diff / ms / hour);
            setTotalPrice(subTotalPrice.toString());
          }
        }
      });
    });
    postReq.write(postData);
    postReq.end();
  };
  useEffect(() => {
    if (localStorage.getItem('payment_method')) {
      setPaymentMethod(localStorage.getItem('payment_method'));
    }
    if (localStorage.getItem('is_terms') === '1') {
      setTerms(true);
    }
    if (spaceNum) {
      getInData(placeId, spaceNum, price);
    }
  }, [props]);

  const handleChangeSpaceNum = (event) => {
    if (event.target.value !== '-1') {
      setSpaceNum(event.target.value);
      getInData(placeId, event.target.value, price);
      setisManualInAtSet(false);
    }
  };

  const handleChangePaymentMethod = (event) => {
    setPaymentMethod(event.target.value);
    localStorage.setItem('payment_method', event.target.value);
  };

  const toTerms = () => {
    window.open(
      `${router.basePath}/terms`,
      'Blank',
      'toolbar=no, location=no, statusbar=no, menubar=no, scrollbars=1, resizable=0, width=1700, height=900, top=30'
    );
  };

  const calcManualPrice = () => {
    if (!/^\d{4}-\d{2}-\d{2}$/u.test(manualDate)) {
      toast.error('ご利用開始日時(手動入力)の日付を正しく入力してください。', { autoClose: 3000 });
      return;
    }
    if (!/^[0-9]*[0-9]:[0-5]*[0-9]$/u.test(manualTime)) {
      toast.error('ご利用開始日時(手動入力)の時刻を正しく入力してください。', { autoClose: 3000 });
      return;
    }
    const newDate = moment(`${manualDate} ${manualTime}`);
    const now = moment(props.now).seconds(0).milliseconds(0).toISOString();

    // 手動入力した利用開始日時
    const newInAt = newDate.format('YYYY/MM/DD HH:mm');
    // 利用終了日時(現在日時)
    const newOutTime = moment(now).format('YYYY/MM/DD HH:mm');
    // 差分(ミリ秒)
    const diff = moment(now).diff(newDate.valueOf());

    // 100日以上の場合はエラー。
    const limit = 8640000000;
    if (diff > limit) {
      toast.error('異常なご利用開始日時が入力されました。入力内容をご確認ください。', { autoClose: 3000 });
      return;
    }

    if (diff <= 0) {
      toast.error('ご利用終了日時よりも後の日時が入力されています。入力内容をご確認ください。', { autoClose: 3000 });
      return;
    }

    setManualInAt(newInAt);
    setShowInAt(newInAt);
    setOutTime(newOutTime);
    const min = 1000,
      hour = 3600;
    setDiffTime(`${Math.floor(diff / min / hour)}時間${moment.utc(diff).format('mm')}分`);

    const subTotalPrice = price * Math.ceil(diff / min / hour);
    setTotalPrice(subTotalPrice.toString());

    setManualDate('');
    setManualTime('');
    setManual(false);
    setisManualInAtSet(true);
  };

  const onPayment = () => {
    if (placeUrlKey === '') {
      toast.error('QRコードからアクセスしてください。', { autoClose: 3000 });
      return;
    }
    // ご利用開始日時の不正チェック(「不明」含む)
    if (!/^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}$/u.test(showInAt)) {
      toast.error('ご利用開始日時を正しく入力してください。', { autoClose: 3000 });
      return;
    }
    // ご利用料金の不正チェック(マイナス値を許可しない。)
    if (!/^[0-9,]+$/u.test(totalPrice)) {
      toast.error('駐車料金が不正です。駐車番号やご利用日時を正しく入力してください。', { autoClose: 3000 });
      return;
    }
    // 駐車料金が0円(ご利用時間が1分未満)
    if (totalPrice === '0') {
      toast.error(
        'ご利用時間が短すぎるため駐車料金の計算が出来ません。ご利用開始日時が異なる場合は、手動入力してください。',
        { autoClose: 3000 }
      );
      return;
    }

    if (!$('#check_terms').is(':checked')) {
      toast.error('利用規約に同意してください。', { autoClose: 2000 });
      return;
    }

    localStorage.setItem('is_terms', '1');
    if (paymentMethod === '0') {
      const token = $('input[name=payjp-token]').val();
      if (token === '') {
        toast.error('カード情報を入力してください。', { autoClose: 2000 });
      } else {
        router.push(
          {
            pathname: config.frontOutConfirmdUrl.replace('{place-url-key}', placeUrlKey),
            query: {
              method: paymentMethod,
              card_token: token,
              coupon_code: couponValue,
              payment_method: paymentMethod,
              place_id: placeId,
              place_name: placeName,
              place_price: price,
              place_per_minute: perMinute,
              space_num: spaceNum,
              show_in_at: showInAt,
              in_at: inAt,
              manual_in_at: manualInAt,
              out_time: outTime,
              diff_time: diffTime,
              total_price: totalPrice,
            },
          },
          config.frontOutConfirmdUrl.replace('{place-url-key}', placeUrlKey)
        );
      }
    } else if (paymentMethod === '1') {
      router.push(
        {
          pathname: config.frontOutConfirmdUrl.replace('{place-url-key}', placeUrlKey),
          query: {
            method: paymentMethod,
            coupon_code: couponValue,
            payment_method: paymentMethod,
            place_id: placeId,
            place_name: placeName,
            place_price: price,
            place_per_minute: perMinute,
            space_num: spaceNum,
            show_in_at: showInAt,
            in_at: inAt,
            manual_in_at: manualInAt,
            out_time: outTime,
            diff_time: diffTime,
            total_price: totalPrice,
          },
        },
        config.frontOutConfirmdUrl.replace('{place-url-key}', placeUrlKey)
      );
    } else {
      toast.error('支払方法を選択してください。', { autoClose: 2000 });
    }
  };

  const handleChangeCouponValue = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCouponValue(event.target.value);
  };

  const handleChangeIsTerms = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { target } = event;
    setTerms(target.checked as boolean);
  };

  const handleChangeIsManual = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { target } = event;
    setManual(target.checked as boolean);
  };

  const handleChangeManualDate = (event: React.ChangeEvent<HTMLInputElement>) => {
    setManualDate(event.target.value);
  };

  const handleChangemanualInAt = (event: React.ChangeEvent<HTMLInputElement>) => {
    setManualTime(event.target.value);
  };

  const handleClickApplyManualDateAtButton = () => {
    calcManualPrice();
  };

  return (
    <>
      <CustomHead title={`出庫 ${placeName} | コインパーキング24`} />
      <div className={InOutStyles.container}>
        <div className={InOutStyles.loader_container} id='csLoader'>
          <ClipLoader color={'#fff'} size={60} />
        </div>

        <div className={InOutStyles.title}>
          <h1>
            <Image className={InOutStyles.logo} src={LogoImg} alt='コインパーキング24' />
          </h1>
        </div>
        <div className={`${InOutStyles.subtitle} ${GlobalStyles['mt20px']}`}>駐車場: {placeName} </div>
        <div className={InOutStyles.subtitle}>
          {perMinute}分/{price}円
        </div>
        <div className={GlobalStyles['cs-flex']}>
          <div>
            <div className={InOutStyles['item-title']}>
              <span className={InOutStyles['space-num-select-title']}>駐車番号</span>
              <span className={InOutStyles.require}>必須</span>
            </div>
            <select
              style={{ width: 200, height: 30, textAlign: 'left' }}
              className={InOutStyles['edit-item']}
              value={spaceNum}
              onChange={handleChangeSpaceNum}
            >
              <option value='-1' key='0'>
                選択してください。
              </option>
              {spaceNumList.map((subSpaceNum) => (
                <option value={subSpaceNum.value} key={subSpaceNum.value}>
                  {subSpaceNum.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        {spaceNumList.some((item) => item.value === spaceNum) && (
          <div>
            <div className={`${InOutStyles.subtitle} ${GlobalStyles['mt15px']}`}>
              ご利用開始日時: <span className={showInAtClass}>{showInAt}</span>
            </div>
            {showInAt !== '不明' && (
              <div className={GlobalStyles['cs-flex']}>
                <input type='checkbox' checked={isManual} onChange={handleChangeIsManual}></input>
                <span className={InOutStyles.subtitle}>手動入力(ご利用開始日時が異なる場合)</span>
              </div>
            )}
            {showInAt !== '不明' && isManual && (
              <div className={GlobalStyles['cs-flex-gap']}>
                <input type='date' value={manualDate} onChange={handleChangeManualDate} />
                <input type='time' value={manualTime} onChange={handleChangemanualInAt} />
                <button
                  className={InOutStyles.apply_manual_date_at_button}
                  onClick={handleClickApplyManualDateAtButton}
                >
                  適用
                </button>
              </div>
            )}
            {showInAt === '不明' && (
              <div>
                <div className={InOutStyles['item-title']}>
                  <span className={InOutStyles['manual-in-at-input-title']}>ご利用開始日時(手動入力)</span>
                  <span className={InOutStyles.require}>必須</span>
                </div>
                <div className={GlobalStyles['cs-flex-gap']}>
                  <input type='date' value={manualDate} onChange={handleChangeManualDate} />
                  <input type='time' value={manualTime} onChange={handleChangemanualInAt} />
                  <button
                    className={InOutStyles.apply_manual_date_at_button}
                    onClick={handleClickApplyManualDateAtButton}
                  >
                    適用
                  </button>
                </div>
              </div>
            )}
            <div className={`${InOutStyles.subtitle} ${GlobalStyles['mt20px']}`}>ご利用終了日時: {outTime}</div>
            <div className={InOutStyles.subtitle}>現在までのご利用時間: {diffTime}</div>
            <div className={`${InOutStyles.subtitle} ${GlobalStyles['mt20px']}`}>
              駐車料金:{' '}
              <b>
                {totalPrice === '不明' && '不明'}
                {totalPrice !== '不明' && `${totalPrice.replace(/\B(?=(\d{3})+(?!\d))/u, ',')}円`}
              </b>
            </div>
            <div className={`${GlobalStyles['cs-flex']} ${GlobalStyles['mt20px']}`}>
              <div className={`${InOutStyles['item-title']} ${GlobalStyles['w300px']}`}>
                <span className={InOutStyles['payment-type-input-title']}>支払方法</span>
                <span className={InOutStyles.require}>必須</span>
              </div>
            </div>
            <div className={`${GlobalStyles['cs-flex']} ${GlobalStyles['mt5px']}`}>
              <div>
                <div
                  className={GlobalStyles['cs-flex']}
                  style={{ marginTop: 10, flexDirection: 'column', alignItems: 'baseline' }}
                >
                  <label
                    className={InOutStyles.radio_label}
                    style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                  >
                    {paymentMethod === '0' && (
                      <input
                        type='radio'
                        name='type'
                        className={`${InOutStyles.select} ${GlobalStyles['w30px']}`}
                        style={{ marginTop: 0, height: '20px' }}
                        onClick={handleChangePaymentMethod}
                        value='0'
                        defaultChecked
                      />
                    )}
                    {paymentMethod !== '0' && (
                      <input
                        type='radio'
                        name='type'
                        className={`${InOutStyles.select} ${GlobalStyles['w30px']}`}
                        style={{ marginTop: 0, height: '20px' }}
                        onClick={handleChangePaymentMethod}
                        value='0'
                      />
                    )}
                    <span>クレジットカード/デビットカード</span>
                  </label>
                  <div id='payjp'>
                    <Button id='payjp_button'>トークンを作成</Button>
                  </div>
                  <Script
                    type='text/javascript'
                    src='https://checkout.pay.jp/'
                    className='payjp-button'
                    data-key={config.payjpPKey}
                    data-text='カード情報を入力する'
                    data-submit-text='カード情報を入力する'
                    data-partial='true'
                  />
                  <Script id='payjp'>
                    {`
											// Next.jsでpay.jpのボタンを使おうとするとページの最下層に配置されてしまう問題対処のための処理
											// create payjp copy button
											document.getElementById("payjp_button").addEventListener("click", function(){
												document.querySelector("#payjp_checkout_box input[type=button]").click();
											});
											var interval = setInterval(() => {
												let payjpButton = document.querySelector("#payjp_button");
												let payjpCheckoutBox = document.querySelector("#payjp_checkout_box input[type=button]");
				
												if (payjpButton && payjpCheckoutBox) {
													payjpButton.innerText = payjpCheckoutBox.value;
												
													var computedStyle = window.getComputedStyle(payjpCheckoutBox);
													var bgColor = computedStyle.backgroundColor;
													var color = computedStyle.color;
												
													payjpButton.style.backgroundColor = bgColor || '#55FFFF';
													payjpButton.style.color = color || '#FFFFFF';
												}
											}, 1000);
										`}
                  </Script>

                  <label
                    className={InOutStyles.radio_label}
                    style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                  >
                    {paymentMethod === '1' && (
                      <input
                        type='radio'
                        name='type'
                        className={`${InOutStyles.select} ${GlobalStyles['w30px']}`}
                        style={{ marginTop: 0, height: '20px' }}
                        onClick={handleChangePaymentMethod}
                        value='1'
                        defaultChecked
                      />
                    )}
                    {paymentMethod !== '1' && (
                      <input
                        type='radio'
                        name='type'
                        className={`${InOutStyles.select} ${GlobalStyles['w30px']}`}
                        style={{ marginTop: 0, height: '20px' }}
                        onClick={handleChangePaymentMethod}
                        value='1'
                      />
                    )}
                    <Image className={InOutStyles.paypay} src={PayPayImg} alt='PayPay' />
                    <span>PayPay</span>
                  </label>
                </div>
              </div>
            </div>
            <div className={GlobalStyles['cs-flex']}>
              <div className={InOutStyles['coupon-code-container']}>
                <div className={InOutStyles['item-title']}>
                  <span className={InOutStyles['coupon-code-input-title']}>クーポンコード</span>
                </div>
                <input
                  type='text'
                  maxLength={200}
                  placeholder='お持ちの場合のみ入力'
                  className={InOutStyles['coupon-code-input-box']}
                  onChange={handleChangeCouponValue}
                  value={couponValue}
                />
              </div>
            </div>
            <div className={`${GlobalStyles['cs-flex']} ${GlobalStyles['mt20px']}`}>
              <input type='checkbox' id='check_terms' checked={isTerms} onChange={handleChangeIsTerms}></input>
              <span className={InOutStyles.terms} onClick={toTerms}>
                利用規約
              </span>
              <span className={InOutStyles.terms2}>に同意</span>
            </div>
            <div className={`${GlobalStyles['cs-flex']} ${GlobalStyles['mt20px']}`}>
              <button className={InOutStyles['link-button']} style={{ width: 235 }} onClick={onPayment}>
                確認画面へ(ご利用終了)
              </button>
            </div>
          </div>
        )}
        <div className={GlobalStyles.margin02}></div>
      </div>
      <ToastContainer />
    </>
  );
};

export default Home;
