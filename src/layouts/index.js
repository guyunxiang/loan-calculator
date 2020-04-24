import { ConfigProvider } from 'antd';
import locale from 'antd/es/locale/zh_CN';

import styles from './index.css';
import 'antd/dist/antd.less';

function BasicLayout(props) {
  return (
    <div className={styles.normal}>
      <ConfigProvider locale={locale}>
        {props.children}
      </ConfigProvider>
    </div>
  );
}

export default BasicLayout;
