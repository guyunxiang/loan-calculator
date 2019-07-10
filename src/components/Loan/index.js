import React from 'react';
import {
  Row,
  Col,
  Card,
  Tabs,
  Form,
  Radio,
  Select,
  Input,
  DatePicker,
  Button,
  List,
  Table,
} from 'antd';
import BigNumber from 'bignumber.js';
import moment from 'moment';
import {
  toFixed,
  getMonthPlusDate,
} from '../../untils';
import {
  loanOptions
} from '../../untils/const';
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
        startDate: moment(values.startDate).format('YYYY/MM/DD'),
      });
    });
  }

  // 获取月供明细
  getLoanDetail = (amount, interest, capital, diff, startDate) => {
    let list = [];
    // 总还款额
    let capitalTotal = new BigNumber(0);
    // 总还款利息
    let interestTotal = new BigNumber(0);
    list.push({
      date: startDate,
      value: 0,
      interest: 0,
      amount: amount.toFixed(2),
    });
    // i: 利息，j: 月数，k: 本金，d:
    for (let i = interest, j = 1, k = amount.minus(capital); k.toNumber() > 0; i = i.minus(diff), j++, k = k.minus(capital)) {
      // 累加总利息
      interestTotal = interestTotal.plus(i);
      // 累加还款总额
      capitalTotal = capitalTotal.plus(capital.plus(i));
      list.push({
        date: moment(getMonthPlusDate(j, startDate)).format('YYYY/MM/DD'),
        value: toFixed(capital.plus(i).toNumber()),
        interest: toFixed(i.toNumber()),
        amount: toFixed(k.toNumber()),
      });
    }
    return {
      capitalTotal,
      interestTotal,
      list,
    };
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
        <List
          header={<strong>商业贷款</strong>}
          dataSource={[
            {
              label: '每月月供(元)',
              value: toFixed(capital.toNumber()),
            },
            {
              label: '支付总利息(元)',
              value: new BigNumber(toFixed(interestTotal.toNumber())).toFormat(),
            },
            {
              label: '总还款额(元)',
              value: new BigNumber(toFixed(capitalTotal.toNumber())).toFormat(),
            },
          ]}
          style={{ textAlign: 'left' }}
          renderItem={item => (
            <List.Item className={styles.listItem}>
              <strong>{item.label}: </strong><span>{item.value}</span>
            </List.Item>
          )}
        />
      </div>
    )
  }

  /**
   * 渲染等额本金计算结果
   * @param  {Number} amount    贷款总额
   * @param  {Number} date      贷款期数
   * @param  {Number} rate      贷款利率
   * @param  {DateString} startDate 起始日期
   * @return {[type]}           [description]
   */
  renderTabPan2(amount, date, rate, startDate) {
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
      const result = this.getLoanDetail(amount, interest, capital, diff, startDate);
      capitalTotal = result.capitalTotal;
      interestTotal = result.interestTotal;
      list = result.list;
    }
    return (
      <div className={styles.tabpan}>
        <List
          header={<strong>商业贷款</strong>}
          dataSource={[
            {
              label: '首月月供（元）',
              value: toFixed(capital.toNumber() + interest.toNumber()),
            },
            {
              label: '月供本金(元)',
              value: toFixed(capital.toNumber()),
            },
            {
              label: '首月利息(元)',
              value: toFixed(interest.toNumber()),
            },
            {
              label: '每月递减(元)',
              value: toFixed(diff),
            },
            {
              label: '支付总利息(元)',
              value: new BigNumber(toFixed(interestTotal.toNumber())).toFormat(),
            },
            {
              label: '总还款额(元)',
              value: new BigNumber(toFixed(capitalTotal.toNumber())).toFormat(),
            },
          ]}
          style={{ textAlign: 'left' }}
          renderItem={item => (
            <List.Item className={styles.listItem}>
              <strong>{item.label}: </strong><span>{item.value}</span>
            </List.Item>
          )}
        />
        <br/>
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
          rowClassName={(record) => {
            // if (new Date(record.date).getTime() - new Date().getTime() < 0) {
            //   return 'disabled';
            // }
          }}
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
      startDate,
    } = this.state;
    return (
      <Row gutter={16}>
        <Col md={{ span: 8 }}>
          <Form
            layout="vertical"
            onSubmit={this.handleSubmit}
          >
            <Form.Item label="贷款类型">
              {
                getFieldDecorator('type', {
                    initialValue: 1,
                })(
                  <Radio.Group>
                    {
                      loanOptions.map((item) => (
                        <Radio key={item.value} value={item.value}>{item.label}</Radio>
                      ))
                    }
                  </Radio.Group>
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
            <Form.Item label="贷款通过日期" required>
              {
                getFieldDecorator('startDate', {
                  initialValue: moment('2018/07/18'),
                })(
                  <DatePicker
                    type="number"
                    format="YYYY/MM/DD"
                    placeholder="请选择贷款初始日期"
                    style={{ width: '100%' }}
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
                计算月供
              </Button>
            </Form.Item>
          </Form>
        </Col>
        <Col md={{ span: 16 }}>
          <Card title="等额本息">
            {this.renderTabPan1(amount, date, rate)}
          </Card>
          <br/>
          <Card title="等额本金">
            {this.renderTabPan2(amount, date, rate, startDate)}
          </Card>
        </Col>
      </Row>
    );
  }
}

export default Form.create()(Loan);
