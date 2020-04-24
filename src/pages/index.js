import React from 'react';
import { connect } from 'dva';
import {
  Card,
} from 'antd';
import Loan from '../components/Loan';
import styles from './index.css';

class HomePage extends React.Component {

  render () {
    return (
      <div className={styles.normal}>
        <Card
          title="房贷月供计算器"
          className={styles.card}
        >
          <Loan />
        </Card>
      </div>
    );
  }
}

export default connect()(HomePage);
