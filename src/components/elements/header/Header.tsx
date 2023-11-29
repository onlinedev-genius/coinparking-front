import HeaderStyles from './Header.module.css';

type pageProps = {
  isSidebarOpen: Boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<Boolean>>;
};
const Header: React.FC<pageProps> = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const handleClick = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className={HeaderStyles.header}>
      <div className={isSidebarOpen ? HeaderStyles['left-area'] : HeaderStyles['left-area-moved']}>
        <div
          className={isSidebarOpen ? HeaderStyles['btn-trigger-clicked'] : HeaderStyles['btn-trigger']}
          onClick={handleClick}
        >
          <span className={HeaderStyles.bar1}></span>
          <span className={HeaderStyles.bar2}></span>
          <span className={HeaderStyles.bar3}></span>
        </div>
      </div>
      <div className={HeaderStyles.right_area}>
        {/* {useJwt.isAgencyLoggedIn() &&
                    <div className={styles.user}>
                        <p className={styles.user_bottom_text}>{}</p>
                    </div>
                } */}
      </div>
    </div>
  );
};

export default Header;
