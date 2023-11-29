import Image from 'next/image';
import CustomHead from '../components/elements/CustomHead/CustomHead';
import LogoImg from '../img/logo.svg';
import HomeStyles from '../styles/Home.module.css';
import GlobalStyles from '../styles/Global.module.css';

const Home = () => (
  <>
    <CustomHead description='コインパーキング24はスマホ決済もできるコインパーキングです。' />
    <div className={HomeStyles.container}>
      <div className={HomeStyles.title}>
        <h1>
          <Image className={HomeStyles.logo} src={LogoImg} alt='コインパーキング24' />
        </h1>
      </div>

      <div className={HomeStyles.content}>
        <p>コインパーキング24はスマホ決済も可能なコインパーキングです。</p>
        <div className={GlobalStyles.margin01}></div>
      </div>
    </div>
  </>
);

export default Home;
