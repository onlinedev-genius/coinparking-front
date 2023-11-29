import Link from 'next/link';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuilding, faChartLine, faMoneyCheck, faSignOutAlt, faHome } from '@fortawesome/free-solid-svg-icons';
import * as useJwt from '../../../features/auth/useJwt';
import LogoImg from '../../../img/logo.svg';
import config from '../../../consts/config';
import SidebarStyles from './Sidebar.module.css';

const EditorSidebar: React.FC = () => {
  const router = useRouter();
  const logout = () => {
    useJwt.AdminLogout();
    router.push(config.frontAdminLoginUrl);
  };
  return (
    <div className={SidebarStyles.sidebar}>
      <div className={SidebarStyles['logo-area']}>
        <Image src={LogoImg} className={SidebarStyles.logo} alt='コインパーキング24' />
      </div>
      <Link href={config.frontAdminIndexUrl} className={`${SidebarStyles.link} ${SidebarStyles.first}`}>
        <div className={SidebarStyles.icon}>
          <FontAwesomeIcon icon={faHome} />
        </div>
        TOP
      </Link>
      <Link href={config.frontAdminSaleListUrl} className={SidebarStyles.link}>
        <div className={SidebarStyles.icon}>
          <FontAwesomeIcon icon={faChartLine} />
        </div>
        売上管理
      </Link>
      <Link href={config.frontAdminPaymentListUrl} className={SidebarStyles.link}>
        <div className={SidebarStyles.icon}>
          <FontAwesomeIcon icon={faMoneyCheck} />
        </div>
        報酬支払い管理
      </Link>
      <Link href={config.frontAdminAgencyListUrl} className={SidebarStyles.link}>
        <div className={SidebarStyles.icon}>
          <FontAwesomeIcon icon={faBuilding} />
        </div>
        代理店検索
      </Link>
      <Link href={config.frontAdminLogoutUrl} className={SidebarStyles.link}>
        <div className={SidebarStyles.icon}>
          <FontAwesomeIcon icon={faSignOutAlt} />
        </div>
        ログアウト
      </Link>
    </div>
  );
};

export default EditorSidebar;
