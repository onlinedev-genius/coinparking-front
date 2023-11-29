import React, { useState, ReactNode } from 'react';
// import config from '../../../consts/config';
// const AdminSidebar = dynamic(() => import('../sidebar/AdminSidebar'), { ssr: false });
// const EditorSidebar = dynamic(() => import('../sidebar/EditorSidebar'), { ssr: false });
// const OperatorSidebar = dynamic(() => import('../sidebar/OperatorSidebar'), { ssr: false });
// const Header = dynamic(() => import('../header/Header'), { ssr: false });

import { useRouter } from 'next/router';
import AdminSidebar from '../../elements/sidebar/AdminSidebar';
import EditorSidebar from '../../elements/sidebar/EditorSidebar';
import OperatorSidebar from '../../elements/sidebar/OperatorSidebar';
import Header from '../../elements/header/Header';
import AdminLayoutStyles from './AdminLayout.module.css';

// Settings
const MOBILE_SCREEN_WIDTH = 768;

type pageProps = {
  loginAdminRole: string;
  children: ReactNode;
};
const AdminLayout: React.FC<pageProps> = ({ children, loginAdminRole }) => {
  const router = useRouter();
  const { asPath } = useRouter();
  // const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > MOBILE_SCREEN_WIDTH);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  // const authentication = useJwt.isAdminLoggedIn();
  // let adminRole = loginAdminRole

  // if (authentication) {
  // 	if (children) {
  // 		children.forEach(element => {
  // 			if (element.props.role) {
  // 				if (element.props.role != 'alert') {
  // 					adminRole = element.props.role
  // 				}
  // 			}
  // 		});
  // 	}
  // }

  // サイドバーの開閉時のサイドバーClass
  let sidebarWrapperClass = AdminLayoutStyles['sidebar-wrapper-close'];
  if (isSidebarOpen) {
    sidebarWrapperClass = AdminLayoutStyles['sidebar-wrapper-open'];
  }

  // サイドバー開閉時のコンテンツ部分Class
  let outletWrapperClass = AdminLayoutStyles['outlet-wrapper-moved'];
  if (isSidebarOpen) {
    outletWrapperClass = AdminLayoutStyles['outlet-wrapper'];
  }

  // useEffect(() => {
  // 	if (asPath === config.frontAdminIndexUrl || asPath === config.frontAdminIndexUrl + '/') {
  // 		if (loginAdminRole === "ADMIN") {
  // 			router.replace(config.frontAdminUserListUrl);
  // 		} else if (loginAdminRole === "EDITOR") {
  // 			router.replace(config.frontAdminSaleListUrl);
  // 		} else if (loginAdminRole === "OPERATOR") {
  // 			router.replace(config.frontAdminAgencyListUrl);
  // 		}
  // 		router.replace(config.frontAdminIndexUrl);
  // 	}
  // }, [children, asPath, router, loginAdminRole]);
  return (
    <div className={AdminLayoutStyles.wrapper}>
      {/* {
				window.location.href.includes('development.') &&
				<div className="development">
					<div><p>dev</p></div>
				</div>
			}
			{
				window.location.href.includes('localhost') &&
				<div className="local">
					<div><p>local</p></div>
				</div>
			} */}
      <div className={sidebarWrapperClass}>
        {loginAdminRole === 'ADMIN' && <AdminSidebar />}
        {loginAdminRole === 'EDITOR' && <EditorSidebar />}
        {loginAdminRole === 'OPERATOR' && <OperatorSidebar />}
      </div>
      <div className={AdminLayoutStyles['sidebar-padding-open']}></div>
      <div className={AdminLayoutStyles['main-wrapper-spread']}>
        <div className={AdminLayoutStyles['header-padding']}></div>
        <div className={AdminLayoutStyles['header-wrapper']}>
          <Header isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
        </div>
        <div className={outletWrapperClass}>
          <div className={AdminLayoutStyles.main}>{children}</div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
