import React, { useState, ReactNode } from 'react';
import { useRouter } from 'next/router';
import AgencySidebar from '../../elements/sidebar/AgencySidebar';
import Header from '../../elements/header/Header';
import AdminLayoutStyles from './AdminLayout.module.css';
// import config from '../../../consts/config';

// Settings
const MOBILE_SCREEN_WIDTH = 768;

type pageProps = {
  children: ReactNode;
};
const AgencyLayout: React.FC<pageProps> = ({ children }) => {
  const router = useRouter();
  const { asPath } = useRouter();
  // const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > MOBILE_SCREEN_WIDTH);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // サイドバーの開閉時のサイドバーClass
  let sidebarWrapperClass = AdminLayoutStyles.sidebar_wrapper_close;
  if (isSidebarOpen) {
    sidebarWrapperClass = AdminLayoutStyles.sidebar_wrapper_open;
  }

  // サイドバー開閉時のコンテンツ部分Class
  let outletWrapperClass = AdminLayoutStyles.outlet_wrapper_moved;
  if (isSidebarOpen) {
    outletWrapperClass = AdminLayoutStyles.outlet_wrapper;
  }

  // useEffect(() => {
  // 	React.Children.forEach(children, element => {
  // 		if (React.isValidElement(element) && element.props.validityDate) {
  // 			const validityDate = moment(element.props.validityDate)

  // 			const diff = moment().diff(validityDate)
  // 			if (diff > 0) {
  // 				router.replace(config.frontAgencyResetPasswordUrl);
  // 				return;
  // 			}
  // 		}
  // 	});
  // 	if (location.pathname === config.frontAgencyIndexUrl || location.pathname === config.frontAgencyIndexUrl + '/') {
  // 		router.replace(config.frontAgencyRegistryUrl);
  // 	}
  // }, [router]);
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
        <AgencySidebar />
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

export default AgencyLayout;
