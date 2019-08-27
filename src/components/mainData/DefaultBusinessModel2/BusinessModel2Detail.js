/**
 * @description 采购订单编辑弹窗
 * @author 何灿坤
 */

import React, {Component} from 'react'
import {Form,Row,Col} from 'antd';
import queryString from "query-string";
import {findById} from "./BusinessModel2Service";
import { seiLocale } from 'sei-utils';
const { seiIntl } = seiLocale;
const Formitem = Form.Item;

class BusinessModel2Detail extends Component {
  constructor(props) {
    super(props);
    let id = this.props.id;
    if (!id) {
      id = queryString.parse(window.location.search).id;
    }
    this.state = {
      tabTitle: seiIntl.get({key: 'flow_000148', desc: '采购订单'}),
      id: id,
      showData:{}
    }

  }

  componentDidMount(){
    this.refresh();
  }

  refresh = () => {
    let id = this.state.id;
    if (id) {
      findById(id).then(res => {
        if(res){
          this.setState({showData : res});
        }
      }).finally(() => {
      })
    }
    if (this.props.onRef) {
      this.props.onRef(this);
    }
  }


  render() {
    const {showData} = this.state;
    const formItemLayout = {
      labelCol: {
        span: 8
      },
      wrapperCol: {
        span: 12
      },
    };
    return (
      <div>
        <Form  style={{padding: '10px'}}>
          <Row>
            <Col span={8}><Formitem label={seiIntl.get({key: 'flow_000126', desc: '组织机构'})} {...formItemLayout}>
              <span>{showData.orgName||''}</span>
            </Formitem></Col>
          </Row>
          <Row>
            <Col span={8}><Formitem label={seiIntl.get({key: 'flow_000133', desc: '业务名称'})} {...formItemLayout}>
              <span>{showData.name||''}</span>
            </Formitem></Col>
          </Row>
          <Row>
            <Col span={8}><Formitem label={seiIntl.get({key: 'flow_000134', desc: '申请说明'})} {...formItemLayout}>
              <span>{showData.applyCaption||''}</span>
            </Formitem></Col>
          </Row>
          <Row>
            <Col span={8}><Formitem label={seiIntl.get({key: 'flow_000138', desc: '单价'})} {...formItemLayout}>
              <span>{showData.unitPrice||''}</span>
            </Formitem></Col>
          </Row>
          <Row>
            <Col span={8}><Formitem label={seiIntl.get({key: 'flow_000139', desc: '数量'})} {...formItemLayout}>
              <span>{showData.count||''}</span>
            </Formitem></Col>
          </Row>
          <Row>
            <Col span={8}><Formitem label={seiIntl.get({key: 'flow_000147', desc: '备注说明'})} {...formItemLayout}>
              <span>{showData.workCaption||''}</span>
            </Formitem></Col>
          </Row>
        </Form>
      </div>
    )
  }


}


export default BusinessModel2Detail;
