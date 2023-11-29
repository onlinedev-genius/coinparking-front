import CustomHead from '../components/elements/CustomHead/CustomHead';
import ErrorStyles from '../styles/Error.module.css';

const NotFoundPage = () => (
  <>
    <CustomHead title='404 | コインパーキング24' />
    <div className={ErrorStyles.container}>
      <div className={ErrorStyles.title}>
        <p className={ErrorStyles['error-code']}>404</p>
        <p className={ErrorStyles['error-message']}>Page Not Found</p>
      </div>
    </div>
  </>
);

export default NotFoundPage;
