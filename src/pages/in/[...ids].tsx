import React, { useState } from 'react';
import { toast } from 'react-toastify';
import ClipLoader from 'react-spinners/ClipLoader';
import { useRouter } from 'next/router';
import Image from 'next/image';
import $ from 'jquery';
import NextNProgress from 'nextjs-progressbar';
import { ToastContainer } from 'react-toastify';
import { GetServerSideProps } from 'next';
import humps from 'humps';
import CustomHead from '../../components/elements/CustomHead/CustomHead';
import InOutLayout from '../../components/layouts/InOut/InOutLayout';
import config from '../../consts/config';
import LogoImg from '../../img/logo.svg';
import GlobalStyles from '../../styles/Global.module.css';
import InOutStyles from '../../styles/InOut.module.css';
import 'react-toastify/dist/ReactToastify.css';

interface SpaceNumList {
  value: string;
  label: string;
}

interface Place {
  id: string;
  placeName: string;
  price: string;
  perMinute: string;
  spaceNumList: string;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const info = context.query;
  let spaceNum = null;
  if (info.no) {
    spaceNum = info.no;
  }
  const getPlaceByKeyUrl = config.backendUrl + config.getPlaceByKeyUrl;
  const placeUrlKey = info.ids[0] as string;
  const postData = JSON.stringify({ placeUrlKey });
  const res = await fetch(getPlaceByKeyUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: postData,
  });
  if (!res.ok) {
    throw new Error('Failed to fetch data');
  }

  const place = humps.camelizeKeys((await res.json()).place) as Place;
  const placeId = place.id;
  const { placeName } = place;
  const { price } = place;
  const { perMinute } = place;
  const numList = place.spaceNumList.split(',');
  const spaceNumList: Array<SpaceNumList> = [];
  if (numList.length > 0) {
    for (let i = 0; i < numList.length; i += 1) {
      spaceNumList.push({
        value: numList[i],
        label: numList[i],
      });
    }
  }

  return {
    props: {
      placeUrlKey,
      placeId,
      placeName,
      price,
      perMinute,
      spaceNumList,
      spaceNum,
    },
  };
};

const Home: React.FC<{
  placeUrlKey: string;
  placeId: string;
  placeName: string;
  price: number;
  perMinute: number;
  spaceNumList: Array<SpaceNumList>;
  spaceNum: string;
}> = (props) => {
  const [placeUrlKey] = useState(props.placeUrlKey);
  const [placeId] = useState(props.placeId);
  const [placeName] = useState(props.placeName);
  const [price] = useState(props.price);
  const [perMinute] = useState(props.perMinute);
  const [spaceNum, setSpaceNum] = useState(props.spaceNum);
  const [spaceNumList] = useState(props.spaceNumList);
  const csLoading = (flag: Boolean) => {
    if (flag) {
      $('#csLoader').css('display', 'flex');
    } else {
      $('#csLoader').css('display', 'none');
    }
  };

  const router = useRouter();

  const handleChangeSpaceNum = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (event.target.value !== '-1') {
      setSpaceNum(event.target.value);
    }
  };

  const onStart = () => {
    if (!spaceNumList.some((item) => item.value === spaceNum)) {
      toast.error('駐車番号を選択してください。', { autoClose: 3000 });
      return;
    }
    csLoading(true);
    const addInDataUrl = config.backendUrl + config.addInDataUrl;
    const postOptions = {
      path: addInDataUrl,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    };
    const https = require('https');
    const postReq = https.request(postOptions, (res) => {
      res.setEncoding('utf8');
      res.on('data', (chunk: string) => {
        csLoading(false);

        if (JSON.parse(chunk).error) {
          toast.error(JSON.parse(chunk).message, { autoClose: 2000 });
        } else {
          router.push(
            {
              pathname: config.frontInCompletedUrl.replace('{place-url-key}', placeUrlKey),
              query: {
                placeId,
                spaceNum,
                placeName,
                perMinute,
                price,
              },
            },
            config.frontInCompletedUrl.replace('{place-url-key}', placeUrlKey)
          );
        }
      });
    });
    const body = {
      placeId,
      spaceNum,
    };
    const postData = JSON.stringify({ inItem: body });
    postReq.write(postData);
    postReq.end();
  };

  return (
    <>
      <CustomHead title={`入庫 ${placeName} | コインパーキング24`} />
      <InOutLayout>
        <NextNProgress height={5} options={{ easing: 'ease', speed: 400, showSpinner: false }} />
        <div className={InOutStyles.container}>
          <div className={GlobalStyles['loader-container']} id='csLoader'>
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
          <div className={`${InOutStyles.subtitle} ${GlobalStyles['mt15px']}`}>
            車を停めた駐車場番号を選択して、
            <br />
            「ご利用開始」ボタンを押してください。
          </div>
          <div className={InOutStyles['cs-flex']}>
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
                {spaceNumList?.map((element) => (
                  <option value={element.value} key={element.value}>
                    {element.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className={`${InOutStyles['cs-flex']} ${GlobalStyles['mt30px']}`}>
            <button className={InOutStyles['link-button']} onClick={onStart}>
              ご利用開始
            </button>
          </div>
          <div className={GlobalStyles.margin02}></div>
        </div>
        <ToastContainer />
      </InOutLayout>
    </>
  );
};

export default Home;
