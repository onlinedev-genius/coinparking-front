import Image from 'next/image';
import CustomHead from '../../components/elements/CustomHead/CustomHead';
import LogoImg from '../../img/logo.svg';
import GlobalStyles from '../../styles/Global.module.css';
import InOutStyles from '../../styles/InOut.module.css';

const Home = () => (
  <>
    <CustomHead title='出庫 | コインパーキング24' />
    <div className={InOutStyles.container}>
      <div className={InOutStyles.title}>
        <h1>
          <Image className={InOutStyles.logo} src={LogoImg} alt='コインパーキング24' />
        </h1>
      </div>

      <div className={InOutStyles.content}>
        <p>
          駐車場情報が読み取れませんでした。
          <br />
          QRコードから再度接続してください。
        </p>
        <div className={GlobalStyles.margin01}></div>
      </div>
    </div>
  </>
);

export default Home;
