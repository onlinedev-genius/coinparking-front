import React from 'react';
import { useRouter } from 'next/router';
import config from '../../../consts/config';
import FooterStyles from './Footer.module.css';

const Footer: React.FC = () => {
  const router = useRouter();

  const toPrivacy = () => {
    router.push(config.frontPrivacyUrl);
  };

  const toTokushohou = () => {
    router.push(config.frontTokushohouUrl);
  };

  const toContact = () => {
    router.push(config.frontContactUrl);
  };

  const toAgencyLogin = () => {
    router.push(config.frontAgencyLoginUrl);
  };

  return (
    <footer className={FooterStyles.footer}>
      <span className={FooterStyles['under-terms']} onClick={toPrivacy}>
        プライバシーポリシー
      </span>
      <span className={FooterStyles['under-terms']} onClick={toTokushohou}>
        特定商取引法に基づく表示
      </span>
      <span className={FooterStyles['under-terms']} onClick={toContact}>
        お問い合わせ
      </span>
      <span className={FooterStyles['under-terms']} onClick={toAgencyLogin}>
        代理店管理画面ログイン
      </span>
    </footer>
  );
};

export default Footer;
