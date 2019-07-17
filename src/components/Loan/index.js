import React from 'react';
import {
  Row,
  Col,
  Card,
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
  loanOptions,
  rate1Options,
  rate2Options,
} from '../../untils/const';
import styles from './index.less';

const { Option } = Select;

class Loan extends React.Component {

  state = {
    type: 1,
    amount1: new BigNumber(0),
    amount2: new BigNumber(0),
    date: new BigNumber(0),
    rate1: new BigNumber(1),
    rate2: new BigNumber(1),
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (err) { return }
      console.log(values);
      this.setState({
        type: values.type,
        amount1: new BigNumber(values.amount1).multipliedBy(10000),
        amount2: new BigNumber(values.amount2).multipliedBy(10000),
        date: new BigNumber(values.date),
        rate1: new BigNumber(values.rate1).shiftedBy(-2),
        rate2: new BigNumber(values.rate2).shiftedBy(-2),
        startDate: moment(values.startDate).format('YYYY/MM/DD'),
      });
    });
  }

  // 获取等额本金月供明细
  getLoanDetail = (amount, interest, capital, diff, startDate) => {
    let list = [];
    // 总还款额
    let capitalTotal = new BigNumber(0);
    // 总还款利息
    let interestTotal = new BigNumber(0);
    // 判断是否金额正确性
    if (!amount.toNumber()) {
      return {
        capitalTotal,
        interestTotal,
        list,
      };
    }
    list.push({
      date: startDate,
      value: 0,
      interest: 0,
      amount: amount.toFixed(2),
    });
    // i: 利息，j: 月数，k: 本金，d:
    for (let i = interest, j = 1, k = amount.minus(capital); k.toNumber() > -1; i = i.minus(diff), j++, k = k.minus(capital)) {
      // 累加总利息
      interestTotal = interestTotal.plus(i);
      // 累加还款总额
      capitalTotal = capitalTotal.plus(capital.plus(i));
      list.push({
        date: moment(getMonthPlusDate(j, startDate)).format('YYYY/MM/DD'),
        value: capital.plus(i),
        interest: i,
        amount: k,
      });
    }
    return {
      capitalTotal,
      interestTotal,
      list,
    };
  }

  /**
   * 计算还贷信息
   * @param  {Number} amount    贷款总额
   * @param  {Number} date      贷款期数
   * @param  {Number} rate      贷款利率
   * @return {Object}           计算结果
   */
  getLoanData = (amount, date, rate, startDate) => {
    // 等额本息
    const debxData = this.getDEBXData(amount, date, rate);
    const debjData = this.getDEBJData(amount, date, rate, startDate);
    return {
      debxData,
      debjData,
    };
  }

  /**
   * 计算等额本息月供数据
   * @param  {[type]} amount [description]
   * @param  {[type]} date   [description]
   * @param  {[type]} rate   [description]
   * @return {[type]}        [description]
   */
  getDEBXData = (amount, date, rate) => {
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
    return {
      capital,
      capitalTotal,
      interestTotal,
    };
  }

  /**
   * 计算等额本金月供数据
   * @param  {[type]} amount [description]
   * @param  {[type]} date   [description]
   * @param  {[type]} rate   [description]
   * @return {[type]}        [description]
   */
  getDEBJData = (amount, date, rate, startDate) => {
    // 总月数
    let monthNums = date.multipliedBy(12);
    // 每月还款本金
    let capital = amount.dividedBy(monthNums);
    // 首月利息
    let interest = amount.multipliedBy(rate.dividedBy(12));
    // 每月递减金额
    let diff = capital.multipliedBy(rate.dividedBy(12));
    // 月供明细
    const {
      // 总还款额
      capitalTotal,
      // 总还款利息
      interestTotal,
      list
    } = this.getLoanDetail(amount, interest, capital, diff, startDate);
    return {
      capital,
      interest,
      diff,
      capitalTotal,
      interestTotal,
      list,
    };
  }

  // 渲染等额本息计算结果
  renderTabPan1() {
    const {
      type,
      amount1,
      amount2,
      date,
      rate1,
      rate2,
    } = this.state;

    // 渲染商贷信息
    const renderSDList = (amount, date, rate) => {
      const {
        debxData: {
          capital,
          capitalTotal,
          interestTotal,
        }
      } = this.getLoanData(amount, date, rate);
      return (
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
      )
    }

    // 渲染公积金贷款信息
    const renderGJJDList = (amount, date, rate) => {
      const {
        debxData: {
          capital,
          capitalTotal,
          interestTotal,
        }
      } = this.getLoanData(amount, date, rate);
      return (
        <List
          header={<strong>公积金贷款</strong>}
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
      )
    }

    return (
      <div className={styles.tabpan}>
        {type !== 2 ? renderSDList(amount1, date, rate1) : null}
        {type !== 1 ? renderGJJDList(amount2, date, rate2) : null}
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
  renderTabPan2() {
    const {
      type,
      amount1,
      amount2,
      date,
      rate1,
      rate2,
      startDate,
    } = this.state;

    const columns = [
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
        render: (value) => toFixed(new BigNumber(value).toNumber())
      },
      {
        title: '利息',
        dataIndex: 'interest',
        key: 'interest',
        align: 'right',
        render: (value) => toFixed(new BigNumber(value).toNumber())
      },
      {
        title: '剩余贷款',
        dataIndex: 'amount',
        key: 'amount',
        align: 'right',
        render: (value) => new BigNumber(toFixed(new BigNumber(value).toNumber())).toFormat(),
      }
    ];

    // 渲染商贷信息
    const renderSDList = (amount, date, rate) => {
      const {
        debjData: {
          capital,
          interest,
          diff,
          interestTotal,
          capitalTotal,
          list
        }
      } = this.getLoanData(amount, date, rate, startDate);
      return (
        <div>
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
            columns={columns}
            rowKey="date"
            dataSource={list}
            rowClassName={(record) => {
              // if (new Date(record.date).getTime() - new Date().getTime() < 0) {
              //   return 'disabled';
              // }
            }}
          />
        </div>
      )
    }

    // 渲染公积金贷信息
    const renderGJJDList = (amount, date, rate) => {
      const {
        debjData: {
          capital,
          interest,
          diff,
          interestTotal,
          capitalTotal,
          list
        }
      } = this.getLoanData(amount, date, rate, startDate);
      return (
        <div>
          <List
            header={<strong>公积金贷款</strong>}
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
            columns={columns}
            rowKey="date"
            dataSource={list}
            rowClassName={(record) => {
              // if (new Date(record.date).getTime() - new Date().getTime() < 0) {
              //   return 'disabled';
              // }
            }}
          />
        </div>
      )
    }

    // 渲染还贷总和信息
    const renderTotalList = () => {
      const sdData = this.getLoanData(amount1, date, rate1, startDate);
      const gjjdData = this.getLoanData(amount2, date, rate2, startDate);

      const capital = sdData.debjData.capital.plus(gjjdData.debjData.capital);
      const interest = sdData.debjData.interest.plus(gjjdData.debjData.interest);
      const diff = sdData.debjData.diff.plus(gjjdData.debjData.diff);
      const interestTotal = sdData.debjData.interestTotal.plus(gjjdData.debjData.interestTotal);
      const capitalTotal = sdData.debjData.capitalTotal.plus(gjjdData.debjData.capitalTotal);

      const list = [];
      for (let i = 0; i < sdData.debjData.list.length; i++) {
        list.push({
          date: sdData.debjData.list[i].date,
          value: new BigNumber(sdData.debjData.list[i].value).plus(gjjdData.debjData.list[i].value),
          sdValue: sdData.debjData.list[i].value,
          gjjdValue: gjjdData.debjData.list[i].value,
          interest: new BigNumber(sdData.debjData.list[i].interest).plus(gjjdData.debjData.list[i].interest),
          amount: new BigNumber(sdData.debjData.list[i].amount).plus(gjjdData.debjData.list[i].amount),
        });
      }

      return (
        <div>
          <List
            header={<strong>组合贷款</strong>}
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
                title: '商贷月供',
                dataIndex: 'sdValue',
                key: 'sdValue',
                align: 'right',
                render: (value) => toFixed(new BigNumber(value).toNumber())
              },
              {
                title: '公积金月供',
                dataIndex: 'gjjdValue',
                key: 'gjjdValue',
                align: 'right',
                render: (value) => toFixed(new BigNumber(value).toNumber())
              },
              {
                title: '总月供',
                dataIndex: 'value',
                key: 'value',
                align: 'right',
                render: (value) => toFixed(new BigNumber(value).toNumber())
              },
              {
                title: '利息',
                dataIndex: 'interest',
                key: 'interest',
                align: 'right',
                render: (value) => toFixed(new BigNumber(value).toNumber())
              },
              {
                title: '剩余贷款',
                dataIndex: 'amount',
                key: 'amount',
                align: 'right',
                render: (value) => new BigNumber(toFixed(new BigNumber(value).toNumber())).toFormat(),
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
      )
    }

    return (
      <div className={styles.tabpan}>
        {type !== 2 ? renderSDList(amount1, date, rate1) : null}
        {type !== 1 ? renderGJJDList(amount2, date, rate2) : null}
        {type === 3 ? renderTotalList() : null }
      </div>
    );
  }

  render() {
    const {
      getFieldValue,
      getFieldDecorator
    } = this.props.form;
    const type = getFieldValue('type') || 1;
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
                    initialValue: type,
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
            {
              type !== 2 ? (
                <Form.Item label="商业贷款金额" required>
                  {
                    getFieldDecorator('amount1', {
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
              ) : null
            }
            {
              type !== 1 ? (
                <Form.Item label="公积金贷款金额" required>
                  {
                    getFieldDecorator('amount2', {
                      rules: [{ required: true, message: '请输入贷款金额！' }],
                        initialValue: 34.7,
                    })(
                      <Input
                        type="number"
                        addonAfter="万元"
                      />
                    )
                  }
                </Form.Item>
              ) : null
            }
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
            {
              type !== 2 ? (
                <Form.Item label="商业贷款利率" required>
                  {
                    getFieldDecorator('rate1', {
                      initialValue: 5.39,
                    })(
                      <Select>
                        {
                          rate1Options.map((item) => (
                            <Option value={item.value} key={item.value}>{item.label}</Option>
                          ))
                        }
                      </Select>
                    )
                  }
                </Form.Item>
              ) : null
            }
            {
              type !== 1 ? (
                <Form.Item label="公积金贷款利率" required>
                  {
                    getFieldDecorator('rate2', {
                      initialValue: 3.25,
                    })(
                      <Select>
                        {
                          rate2Options.map((item) => (
                            <Option value={item.value} key={item.value}>{item.label}</Option>
                          ))
                        }
                      </Select>
                    )
                  }
                </Form.Item>
              ) : null
            }
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
            {this.renderTabPan1()}
          </Card>
          <br/>
          <Card title="等额本金">
            {this.renderTabPan2()}
          </Card>
        </Col>
      </Row>
    );
  }
}

export default Form.create()(Loan);
