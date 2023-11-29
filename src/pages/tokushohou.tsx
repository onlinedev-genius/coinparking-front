import CustomHead from '../components/elements/CustomHead/CustomHead';
import LigalStyles from '../styles/Ligal.module.css';
import GlobalStyles from '../styles/Global.module.css';

const Tokushohou = () => (
  <>
    <CustomHead title='特定商取引法に基づく表示 | コインパーキング24' />
    <div className={LigalStyles.container}>
      <div className={LigalStyles.title}> 特定商取引法に基づく表示 </div>
      <div className={LigalStyles.content}>
        <p className={LigalStyles['sub-header']}>■販売業者</p>
        <p>クロス株式会社</p>
        <br />
        <p className={LigalStyles['sub-header']}>■所在地</p>
        <p>〒104-0061</p>
        <p>東京都中央区銀座1-22-11 銀座大竹ビジデンス 2F</p>
        <br />
        <p className={LigalStyles['sub-header']}>■代表者</p>
        <p>代表取締役 松葉瀬 稔</p>
        <br />
        <p className={LigalStyles['sub-header']}>■お問い合わせ先</p>
        <p>お問い合わせからご連絡ください。</p>
        <br />
        <p>電話番号: 03-6555-4378</p>
        <p>メール: support@coinparking24.com</p>
        <p>受付・対応時間: 10:00～17:00（土日祝日および弊社休業日を除く）</p>
        <br />
        <p className={LigalStyles['sub-header']}>■商品の販売価格</p>
        <p>駐車場/ご利用時間ごとに表示されます。</p>
        <br />
        <p className={LigalStyles['sub-header']}>■商品代金以外の必要料金</p>
        <p>無し</p>
        <br />
        <p className={LigalStyles['sub-header']}>■代金のお支払方法およびお支払時期</p>
        <p>クレジットカード/デビットカード/PayPay</p>
        <p>お支払時期はコンテンツ購入時となります。</p>
        <br />
        <p className={LigalStyles['sub-header']}>■商品の引渡時期</p>
        <p>駐車場のご利用後、お支払手続きを行って頂きます。</p>
        <br />
        <p className={LigalStyles['sub-header']}>■返品について</p>
        <p>商品の性質上、返品・キャンセルはお受けできません。</p>
        <div className={GlobalStyles.margin01}></div>
      </div>
    </div>
  </>
);

export default Tokushohou;
