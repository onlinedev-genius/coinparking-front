import React, { useState } from 'react';
import ClipLoader from 'react-spinners/ClipLoader';
import { ToastContainer } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import NextNProgress from 'nextjs-progressbar';
import { faHome } from '@fortawesome/free-solid-svg-icons';
import { GetServerSideProps } from 'next';
import humps from 'humps';
import CustomHead from '../../components/elements/CustomHead/CustomHead';
import config from '../../consts/config';
import AgencyLayout from '../../components/layouts/Admin/AgencyLayout';
import { HTTP_STATUS_CODE } from '../../consts/constants';
import GlobalStyles from '../../styles/Global.module.css';
import AdminStyles from '../../styles/Admin.module.css';
import 'react-toastify/dist/ReactToastify.css';

interface Agency {
  agencyIdName: string;
  id: number;
  role: string;
  validity: string;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const getAgencyUrl = config.backendUrl + config.getAgencyUrl.replace('{id}', '');
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
          destination: config.frontAgencyLogoutUrl,
          permanent: false,
        },
      };
    }
    throw new Error('Failed to fetch data');
  }
  const agency = humps.camelizeKeys((await res.json()).agency) as Agency;
  const loginAgencyAgencyIdName = agency.agencyIdName;
  return {
    props: {
      loginAgencyAgencyIdName,
    },
  };
};

const Agency: React.FC<{
  loginAgencyAgencyIdName: string;
}> = (props) => {
  // const [userList, setUserList] = useState<Agency[]>([]);
  // const router = useRouter();
  const [loginAgencyAgencyIdName] = useState<string>(props.loginAgencyAgencyIdName);

  // const csLoading = (flag: boolean) => {
  //   if (flag) {
  //     $('#csLoader').css('display', 'flex');
  //   } else {
  //     $('#csLoader').css('display', 'none');
  //   }
  // };

  // const getAgencyUsers = useCallback(() => {
  //   csLoading(true);
  //   const url = config.backendUrl + config.getAgencysUrl;
  //   const https = require('https');
  //   const postData = JSON.stringify({});
  //   const postOption = {
  //     path: url,
  //     method: 'GET',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //   };
  //   const postReq = https.request(postOption, (res: IncomingMessage) => {
  //     res.setEncoding('utf8');
  //     res.on('data', (chunk: string) => {
  //       csLoading(false);
  //       const { agencys }: { agencys: Agency[] } = JSON.parse(chunk);
  //       if (agencys) {
  //         setUserList(agencys as Agency[]);
  //       } else {
  //         toast.error('ユーザー情報の取得に失敗しました。', { autoClose: 2000 });
  //       }
  //     });
  //   });
  //   postReq.write(postData);
  //   postReq.end();
  // }, []);

  // useEffect(() => {
  //   getAgencyUsers();
  // }, [getAgencyUsers]);

  return (
    <>
      <CustomHead title='代理店管理画面 | コインパーキング24' />
      <AgencyLayout>
        <NextNProgress height={5} options={{ easing: 'ease', speed: 400, showSpinner: false }} />
        <div className={AdminStyles.container}>
          <div className={GlobalStyles['loader-container']} id='csLoader'>
            <ClipLoader color={'#fff'} size={60} />
          </div>

          <div className={AdminStyles['title-left']}>
            <div className={AdminStyles.icon}>
              <FontAwesomeIcon icon={faHome} />
            </div>
            <span>TOP</span>
          </div>
          <div className={AdminStyles['top-container']}>
            <div className={AdminStyles['welcome-message-container']}>
              <span className={AdminStyles['welcome-message']}>ようこそ、{loginAgencyAgencyIdName}さん</span>
            </div>
          </div>
        </div>
        <ToastContainer />
      </AgencyLayout>
    </>
  );
};

export default Agency;
