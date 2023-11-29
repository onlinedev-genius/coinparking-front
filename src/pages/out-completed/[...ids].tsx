import { useRouter } from 'next/router';
import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import ClipLoader from 'react-spinners/ClipLoader';
import CustomHead from '../../components/elements/CustomHead/CustomHead';
import LogoImg from '../../img/logo.svg';
import GlobalStyles from '../../styles/Global.module.css';
import InOutStyles from '../../styles/InOut.module.css';

const OutCompleted: React.FC = (props) => {
  const router = useRouter();
  const [placeName, setPlaceName] = useState<string>('');

  useEffect(() => {
    setPlaceName(localStorage.getItem('place_name'));
  }, [props, router]);

  return (
    <>
      <CustomHead title={`出庫完了 ${placeName} | コインパーキング24`} />
      <div className={InOutStyles.container}>
        <div className={InOutStyles.loader_container} id='csLoader'>
          <ClipLoader color={'#fff'} size={60} />
        </div>

        <div className={InOutStyles.title}>
          <h1>
            <Image className={InOutStyles.logo} src={LogoImg} alt='コインパーキング24' />
          </h1>
        </div>
        <div className={GlobalStyles['mt25px']}>
          <p className={InOutStyles.message}>
            ご利用有難うございました。
            <br />
            画面を閉じて駐車場から車を出してください。
            <br />
            またのご利用お待ちしております。
          </p>
        </div>
        <div className={GlobalStyles.margin02}></div>
      </div>
    </>
  );
};

export default OutCompleted;
