/**
 * @description 业务订单查看
 * @author 何灿坤
 */

import React, {Component} from 'react';
import {withRouter} from "react-router-dom";
import queryString from "query-string";
import { WorkFlow } from 'suid';
import BusinessModel2Detail from "../DefaultBusinessModel2/BusinessModel2Detail"

const { Approve } = WorkFlow;

class DetailBusinessModel2Suid extends Component {

  constructor(props) {
    super(props);
    let params = queryString.parse(props.location.search);
    this.state ={
      id:params.id,
      taskId:params.taskId,
      instanceId:params.instanceId
    }
  }


  closeWin = (res) => {
     if(res.success){
       window.close();
     }
  }

  render() {
    const appProps = {
      businessId: this.state.id,
      instanceId: this.state.instanceId,
      taskId: this.state.taskId,
      submitComplete: this.closeWin
    };

    return (
      <Approve {...appProps}>
        <BusinessModel2Detail id={this.state.id}  {...this.props}/>
      </Approve>
    );
  }
}


export default withRouter(DetailBusinessModel2Suid)
