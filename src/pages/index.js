import React from 'react';
import { connect } from 'dva';
import {
  Form,
  Input,
  InputNumber,
  Select,
  Button,
} from 'antd';
import styles from './index.css';

const InputGroup = Input.Group;
const Option = Select.Option;

class HomePage extends React.Component {

  state = {
    annualizedRate: '',     // 年化收益率
    tenThousandIncome: '',  // 万分收益
    totalInterest: '',      // 总利息
  }

  componentDidMount() {
    console.log('ok');
  }

  // 提交表单
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.computeAnnualizedRate(values);
        this.computeTenThousandIncome(values);
      }
    });
  }

  // 计算年化收益率
  computeAnnualizedRate = (data) => {
    const {
      amount,
      date,
      dateType,
      dateAmount,
    } = data;
    // 不计利息每期应还金额
    const dateBasicAmount = amount / date;
    // 每期利息
    const dateInterest = dateAmount - dateBasicAmount;
    // 计算总利息
    const totalInterest = dateInterest * date;
    // 借贷总天数
    let totalDays = 0;
    if (dateType === 'year') {
      totalDays = date * 365;
    } else if (dateType === 'month') {
      totalDays = date / 12 * 365;
    } else if (dateType === 'day') {
      totalDays = date;
    }
    const annualizedRate = totalInterest / amount / totalDays * 365 * 100;
    this.setState({
      annualizedRate: annualizedRate.toFixed(2),
      totalInterest,
    });
  }

  computeTenThousandIncome = (data) => {
    const {
      amount,
      date,
      dateType,
      dateAmount,
    } = data;
    // 不计利息每期应还金额
    const dateBasicAmount = amount / date;
    // 每期利息
    const dateInterest = dateAmount - dateBasicAmount;
    console.log(dateInterest);
    // 计算一年总利息
    let yearTotalInterest = 0;
    if (dateType === 'year') {
      yearTotalInterest = dateInterest * 1;
    } else if (dateType === 'month') {
      yearTotalInterest = dateInterest * 12;
    } else if (dateType === 'day') {
      yearTotalInterest = dateInterest * 365;
    }
    const tenThousandIncome = yearTotalInterest / 365 / (amount / 10000);
    console.log(yearTotalInterest, tenThousandIncome);
    this.setState({
      tenThousandIncome: tenThousandIncome.toFixed(2),
    });
  }

  render () {

    const { annualizedRate, tenThousandIncome, totalInterest } = this.state;

    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 8 },
      },
    };

    const {
      getFieldDecorator,
    } = this.props.form;

    return (
      <div className={styles.normal}>
        <h3>贷款年化收益率，万分收益计算器</h3>
        <br/>
        <Form
          {...formItemLayout}
          onSubmit={this.handleSubmit}
        >
          <Form.Item label="贷款金额">
            {
              getFieldDecorator('amount', {
                reules: [{
                  required: true,
                  message: '请输入贷款金额',
                }]
              })(
                <InputNumber
                  size="large"
                  style={{ width: '100%' }}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  min={0}
                />
              )
            }
          </Form.Item>
          <Form.Item label="还款期数">
            <InputGroup compact>
              {
                getFieldDecorator('date', {
                  reules: [{
                    required: true,
                    message: '请输入还款期数',
                  }]
                })(
                  <InputNumber
                    size="large"
                    style={{ width: '80%' }}
                    min={0}
                  />
                )
              }
              {
                getFieldDecorator('dateType', {
                  reules: [{
                    required: true,
                    message: '请输入还款期数',
                  }],
                  initialValue: 'month',
                })(
                  <Select
                    size="large"
                    style={{ width: '20%' }}
                  >
                    <Option value="year">年</Option>
                    <Option value="month">月</Option>
                    <Option value="day">日</Option>
                  </Select>
                )
              }
            </InputGroup>
          </Form.Item>
          <Form.Item label="每期还款金额">
            {
              getFieldDecorator('dateAmount', {
                reules: [{
                  required: true,
                  message: '请输入每期还款金额',
                }]
              })(
                <InputNumber
                  size="large"
                  style={{ width: '100%' }}
                  min={0}
                  precision={2}
                />
              )
            }
          </Form.Item>
          <Form.Item>
            <Button
              size="large"
              type="primary"
              htmlType="submit"
              style={{ width: '100%' }}
            >
              计算
            </Button>
          </Form.Item>
        </Form>
        <div style={{ textAlign: 'left' }}>
          {
            totalInterest ? (
              <h4>总利息：<span>{totalInterest.toFixed(2)}</span></h4>
            ) : null
          }
          {
            annualizedRate ? (
              <h4>年化收益率：<span>{annualizedRate}%</span></h4>
            ) : null
          }
          {
            tenThousandIncome ? (
              <div>
                <h4>
                  万分收益：<span>{tenThousandIncome} 元</span>
                </h4>
                <p>
                  (即借贷 1 万元每天还款 {tenThousandIncome} 元)
                </p>
              </div>
            ) : null
          }
        </div>
      </div>
    );
  }
}

export default connect()(Form.create()(HomePage));
