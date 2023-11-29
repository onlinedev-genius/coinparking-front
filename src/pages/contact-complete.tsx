import CustomHead from '../components/elements/CustomHead/CustomHead';
import ContactStyles from '../styles/Contact.module.css';
import GlobalStyles from '../styles/Global.module.css';

const ContactComplete = () => (
  <>
    <CustomHead title='お問い合わせ | コインパーキング24' />
    <div className={ContactStyles.container}>
      <div className={ContactStyles.title}> お問い合わせ </div>
      <div className={ContactStyles.content}>
        <div>お問い合わせを受け付けました。</div>
        <div className={GlobalStyles.margin01}></div>
      </div>
    </div>
  </>
);

export default ContactComplete;
