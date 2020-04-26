import {
  Menu,
  Icon,
} from 'antd';
import Link from 'umi/link';

import styles from './styles.less';

const WebHeader = () => {
  return (
    <div className={styles.WebHeader}>
      <div className={styles.WebHeader__wrap}>
        <Link to="/">尘飞扬</Link>
      </div>
      <div className={styles.WebHeader__wrap}>
        <Menu>
          <Menu.Item key="house">
            <Link to="/house">
              <Icon type="calculator" /> 房贷计算器
            </Link>
          </Menu.Item>
        </Menu>
      </div>
    </div>
  )
}

export default WebHeader;
