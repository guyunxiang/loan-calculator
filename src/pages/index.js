import React from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import {
  Icon
} from 'antd';
import styles from './index.less';

class HomePage extends React.Component {

  render () {
    return (
      <div className={styles.normal}>
        <h2>便捷计算器</h2>
        <div className={styles.normal__enter}>
          <ul>
            <li>
              <Link to="/house">
                <Icon type="home" /> 房贷计算器
              </Link>
            </li>
            <li className={styles.comingsoon}>
              <Link to="#">
                <Icon type="carry-out" /> 月供计算器
              </Link>
            </li>
            <li className={styles.comingsoon}>
              <Link to="#">
                <Icon type="pay-circle" /> 理财计算器
              </Link>
            </li>
          </ul>
        </div>
      </div>
    );
  }
}

export default connect()(HomePage);
