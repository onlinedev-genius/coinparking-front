import Head from 'next/head';
import config from '../../../consts/config';

interface CustomHeadProps {
  title?: string;
  description?: string;
}

const CustomHead: React.FC<CustomHeadProps> = ({ title, description }) => {
  return (
    <Head>
      <title>{title || 'コインパーキング24'}</title>
      {description && <meta name='description' content={description} />}
      <link rel='icon' href={`${config.basePath}/favicon.ico`} />
      <meta charSet='utf-8' />
      <meta
        name='viewport'
        content='width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no'
      ></meta>
    </Head>
  );
};

export default CustomHead;
