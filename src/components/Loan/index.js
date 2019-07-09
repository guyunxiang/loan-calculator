import React from 'react';
import {
  Tabs,
  Form,
  Select,
  Input,
  Button,
  Table,
} from 'antd';
import BigNumber from 'bignumber.js';
import moment from 'moment';
import {
  toFixed,
  getMonthPlusDate,
} from '../../untils';
import styles from './index.less';


const { TabPane } = Tabs;
const { Option } = Select;

class Loan extends React.Component {

  state = {
    amount: 0,
    date: 0,
    rate: 0,
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (err) { return }
      this.setState({
        amount: new BigNumber(values.amount).multipliedBy(10000),
        date: new BigNumber(values.date),
        rate: new BigNumber(values.rate).shiftedBy(-2),
      });
    });
  }

  // 渲染等额本息计算结果
  renderTabPan1(amount, date, rate) {
    // 总月数
    let monthNums = new BigNumber(0);
    // 每月还款本金
    let capital = new BigNumber(0);
    // 总还款额
    let capitalTotal = new BigNumber(0);
    // 总还款利息
    let interestTotal = new BigNumber(0);
    if (amount) {
      if (amount) {
        monthNums = date.multipliedBy(12);
        capital = amount.dividedBy(monthNums);
      }
      // R*(1+R)^N
      let a = rate.dividedBy(12).multipliedBy(rate.dividedBy(12).plus(1).exponentiatedBy(monthNums));
      // ((1+R)^N)-1
      let b = rate.dividedBy(12).plus(1).exponentiatedBy(monthNums).minus(1);
      // amount*a/b
      capital = amount.multipliedBy(a.dividedBy(b));
      // 月供 * 月数
      capitalTotal = capital.multipliedBy(monthNums);
      // 总还款额 - 本金
      interestTotal = capitalTotal.minus(amount);
    }
    return (
      <div className={styles.tabpan}>
        <div className={styles.tabpan__header}>
          <h1>{toFixed(capital.toNumber())}</h1>
          <span>每月月供(元)</span>
        </div>
        <div className={styles.tabpan__content}>
          <ul className={styles.ul2}>
            <li>
              <h2>{new BigNumber(toFixed(interestTotal.toNumber())).toFormat()}</h2>
              <span>支付总利息(元)</span>
            </li>
            <li>
              <h2>{new BigNumber(toFixed(capitalTotal.toNumber())).toFormat()}</h2>
              <span>总还款额(元)</span>
            </li>
          </ul>
        </div>
      </div>
    )
  }

  // 渲染等额本金计算结果
  renderTabPan2(amount, date, rate) {
    // 总月数
    let monthNums = new BigNumber(0);
    // 每月还款本金
    let capital = new BigNumber(0);
    // 总还款额
    let capitalTotal = new BigNumber(0);
    // 首月利息
    let interest = new BigNumber(0);
    // 总还款利息
    let interestTotal = new BigNumber(0);
    // 每月递减金额
    let diff = new BigNumber(0);
    // 月供明细
    let list = [];
    // 如果金额存在
    if (amount) {
      monthNums = date.multipliedBy(12);
      capital = amount.dividedBy(monthNums);
      interest = amount.multipliedBy(rate.dividedBy(12));
      diff = capital.multipliedBy(rate.dividedBy(12));
      // 明细列表添加初始记录
      list.push({
        date: '2018/07/18',
        value: 0,
        interest: 0,
        amount: '967000.00',
      });
      // i: 利息，j: 月数，k: 本金，d:
      for (let i = interest, j = 1, k = amount.minus(capital); k.toNumber() > 0; i = i.minus(diff), j++, k = k.minus(capital)) {
        // 累加总利息
        interestTotal = interestTotal.plus(i);
        // 累加还款总额
        capitalTotal = capitalTotal.plus(capital.plus(i));
        list.push({
          date: moment(getMonthPlusDate(j)).format('YYYY/MM/DD'),
          value: toFixed(capital.plus(i).toNumber()),
          interest: toFixed(i.toNumber()),
          amount: toFixed(k.toNumber()),
        });
      }
    }
    return (
      <div className={styles.tabpan}>
        <div className={styles.tabpan__header}>
          <h1>{toFixed(capital.toNumber() + interest.toNumber())}</h1>
          <span>首月月供(元)</span>
        </div>
        <div className={styles.tabpan__content}>
          <ul className={styles.ul1}>
            <li>
              <h2>{toFixed(capital.toNumber())}</h2>
              <span>月供本金(元)</span>
            </li>
            <li>
              <h2>{toFixed(interest.toNumber())}</h2>
              <span>首月利息(元)</span>
            </li>
            <li>
              <h2>{toFixed(diff)}</h2>
              <span>每月递减(元)</span>
            </li>
          </ul>
          <ul className={styles.ul2}>
            <li>
              <h2>{new BigNumber(toFixed(interestTotal.toNumber())).toFormat()}</h2>
              <span>支付总利息(元)</span>
            </li>
            <li>
              <h2>{new BigNumber(toFixed(capitalTotal.toNumber())).toFormat()}</h2>
              <span>总还款额(元)</span>
            </li>
          </ul>
        </div>
        <Table
          columns={[
            {
              title: '日期',
              dataIndex: 'date',
              key: 'date',
              align: 'center',
            },
            {
              title: '月供',
              dataIndex: 'value',
              key: 'value',
              align: 'right',
            },
            {
              title: '利息',
              dataIndex: 'interest',
              key: 'interest',
              align: 'right',
            },
            {
              title: '剩余贷款',
              dataIndex: 'amount',
              key: 'amount',
              align: 'right',
            }
          ]}
          rowKey="date"
          dataSource={list}
          size="small"
        />
      </div>
    );
  }

  render() {
    const {
      getFieldDecorator
    } = this.props.form;
    const {
      amount,
      date,
      rate,
    } = this.state;
    return (
      <div>
        <Form
          layout="vertical"
          onSubmit={this.handleSubmit}
        >
          <Form.Item label="贷款类型">
            {
              getFieldDecorator('type', {
                initialValue: '1',
              })(
                <Select>
                  <Option value="1">商业贷款</Option>
                  <Option value="2">公积金贷款</Option>
                </Select>
              )
            }
          </Form.Item>
          <Form.Item label="贷款金额" required>
            {
              getFieldDecorator('amount', {
                rules: [{ required: true, message: '请输入贷款金额！' }],
                initialValue: 96.7,
              })(
                <Input
                  type="number"
                  addonAfter="万元"
                />
              )
            }
          </Form.Item>
          <Form.Item label="贷款年数" required>
            {
              getFieldDecorator('date', {
                initialValue: 30,
              })(
                <Input
                  type="number"
                  addonAfter="年数"
                />
              )
            }
          </Form.Item>
          <Form.Item label="贷款利率" required>
            {
              getFieldDecorator('rate', {
                initialValue: 5.39,
              })(
                <Input
                  type="number"
                  addonAfter="%"
                />
              )
            }
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              style={{ width: '100%' }}
            >
              计算
            </Button>
          </Form.Item>
        </Form>
        <Tabs
          defaultActiveKey="1"
          style={{ textAlign: 'center' }}
        >
          <TabPane tab="等额本息" key="1">
            {this.renderTabPan1(amount, date, rate)}
          </TabPane>
          <TabPane tab="等额本金" key="2">
            {this.renderTabPan2(amount, date, rate)}
          </TabPane>
        </Tabs>
      </div>
    );
  }
}

export default Form.create()(Loan);
