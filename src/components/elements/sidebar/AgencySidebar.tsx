import Link from 'next/link';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faExchange, faHistory, faSignOutAlt, faUserEdit } from '@fortawesome/free-solid-svg-icons';
import * as useJwt from '../../../features/auth/useJwt';
import LogoImg from '../../../img/logo.svg';
import config from '../../../consts/config';
import SidebarStyles from './Sidebar.module.css';

const AgencySidebar: React.FC = () => {
  const router = useRouter();
  const logout = () => {
    useJwt.AgencyLogout();
    router.replace(config.frontAgencyLoginUrl);
  };
  return (
    <div className={SidebarStyles.sidebar}>
      <div className={SidebarStyles['logo-area']}>
        <Image src={LogoImg} className={SidebarStyles.logo} alt='コインパーキング24' />
      </div>
      <Link href={config.frontAgencyRegistryUrl} className={`${SidebarStyles.link} ${SidebarStyles.first}`}>
        <div className={SidebarStyles.icon}>
          <FontAwesomeIcon icon={faUserEdit} />
        </div>
        基本情報登録
      </Link>
      <Link href={config.frontAgencyHistoryUrl} className={SidebarStyles.link}>
        <div className={SidebarStyles.icon}>
          <FontAwesomeIcon icon={faHistory} />
        </div>
        アクセス履歴
      </Link>
      <Link href={config.frontAgencySalesUrl} className={SidebarStyles.link}>
        <div className={SidebarStyles.icon}>
          <FontAwesomeIcon icon={faChartLine} />
        </div>
        売上履歴
      </Link>
      <Link href={config.frontAgencyRewardsUrl} className={SidebarStyles.link}>
        <div className={SidebarStyles.icon}>
          <FontAwesomeIcon icon={faExchange} />
        </div>
        振込履歴
      </Link>
      <Link href={config.frontAgencyLogoutUrl} className={SidebarStyles.link}>
        <div className={SidebarStyles.icon}>
          <FontAwesomeIcon icon={faSignOutAlt} />
        </div>
        ログアウト
      </Link>
    </div>
  );
};

export default AgencySidebar;
