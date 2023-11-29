import { ParsedUrlQuery } from 'querystring';
import React, { useState } from 'react';
import ClipLoader from 'react-spinners/ClipLoader';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { GetServerSideProps } from 'next';
import humps from 'humps';
import { formatInTimeZone } from 'date-fns-tz';
import CustomHead from '../../components/elements/CustomHead/CustomHead';
import config from '../../consts/config';
import LogoImg from '../../img/logo.svg';
import GlobalStyles from '../../styles/Global.module.css';
import InOutStyles from '../../styles/InOut.module.css';

interface PostPageQuery extends ParsedUrlQuery {
  placeName: string;
  price: string;
  perMinute: string;
  spaceNum: string;
}

interface In {
  inAt: string;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { placeId } = context.query;
  const { spaceNum } = context.query;
  const body = {
    placeId,
    spaceNum,
  };
  const getInDataUrl = config.backendUrl + config.getInDataUrl;
  const postData = JSON.stringify({ inItem: body });
  const res = await fetch(getInDataUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: postData,
  });
  if (!res.ok) {
    throw new Error('Failed to fetch data');
  }

  const inData = humps.camelizeKeys((await res.json()).in_item) as In;
  const inAt = formatInTimeZone(inData.inAt, 'Asia/Tokyo', 'yyyy/MM/dd HH:mm');

  return {
    props: {
      inAt,
    },
  };
};

const Home: React.FC<{
  inAt: string;
}> = (props) => {
  const router = useRouter();
  const query = router.query as PostPageQuery;
  const [placeName] = useState<string>(query.placeName);
  const [price] = useState<string>(query.price);
  const [perMinute] = useState<string>(query.perMinute);
  const [inAt] = useState<string>(props.inAt);
  const [spaceNum] = useState<string>(query.spaceNum);

  return (
    <>
      <CustomHead title={`入庫完了 ${placeName} | コインパーキング24`} />
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
        <div className={InOutStyles.subtitle}>駐車番号: {spaceNum} </div>
        <div className={InOutStyles.subtitle}>ご利用開始日時: {inAt} </div>
        <div className={GlobalStyles['mt25px']}>
          <p className={InOutStyles.message}>
            ご利用開始手続きが完了しました。
            <br />
            お気をつけて行ってらっしゃいませ。
          </p>
        </div>
        <div className={GlobalStyles.margin02}></div>
      </div>
    </>
  );
};

export default Home;
