/**
 * @description 采购订单查看
 * @author 何灿坤
 */

import React, {Component} from 'react';
import {withRouter} from "react-router-dom";
import queryString from "query-string";
import { Approve } from 'seid';
import BusinessModel2Detail from "../DefaultBusinessModel2/BusinessModel2Detail"

class DetailBusinessModel2 extends Component {

  constructor(props) {
    super(props);
    let params = queryString.parse(props.location.search);
    this.state ={
      id:params.id,
      taskId:params.taskId,
      instanceId:params.instanceId
    }
  }


  render() {
    return (
      <Approve
        businessId={this.state.id}
        instanceId={this.state.instanceId}
        taskId={this.state.taskId}>
        <BusinessModel2Detail id={this.state.id}  {...this.props}/>
      </Approve>
    );
  }
}


export default withRouter(DetailBusinessModel2)
