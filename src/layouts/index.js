import {
  ConfigProvider,
} from 'antd';
import locale from 'antd/es/locale/zh_CN';
import 'antd/dist/antd.less';

import Header from '@components/Header';

import styles from './index.css';

function BasicLayout(props) {
  return (
    <div className={styles.normal}>
      <Header />
      <ConfigProvider locale={locale}>
        {props.children}
      </ConfigProvider>
    </div>
  );
}

export default BasicLayout;
