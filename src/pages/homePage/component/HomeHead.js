/**
 * @Description:
 * @Author: CHEHSHUANG
 * @Date: 2019/3/12
 */
import React, {Component, Fragment} from 'react';
import {Badge, Radio} from "antd";
import HeadOperatorBar from "./HeadOperatorBar";
import { seiLocale } from 'sei-utils';
import { constants, } from '@/utils';

const {TASK_TYPE} = constants;
const { seiIntl } = seiLocale;
class HomeHead extends Component {
  state = {
    taskType: TASK_TYPE.TODO
  }

  componentDidMount() {
    this.props.onRef && this.props.onRef(this);
  }

  handleChangeTodo = (value) => {
    value = value.target.value;
    this.setState({taskType: value});
    this.props.getTaskType && this.props.getTaskType(value);
  }

  render() {
    const {taskType} = this.state;
    const {handleSearchValue, count,handleBatchApproce} = this.props;
    return (
      <Fragment>
        <div className={"tbar-box"}>
          <Radio.Group
            defaultValue={TASK_TYPE.TODO}
            buttonStyle="solid"
            onChange={this.handleChangeTodo}
          >
            <Radio.Button Button value={TASK_TYPE.TODO}>{seiIntl.get({key: 'common_000231', desc: '我的待办'})}
              <Badge
                count={count}
                style={{position: "absolute", right: -14, top: -26}}
                overflowCount={50}
              />
            </Radio.Button>
            <Radio.Button value={TASK_TYPE.COMPLETE}>{seiIntl.get({key: 'common_000232', desc: '我的已办'})}</Radio.Button>
            <Radio.Button value={TASK_TYPE.ORDER}>{seiIntl.get({key: 'common_000233', desc: '我的单据'})}</Radio.Button>
          </Radio.Group>
          <HeadOperatorBar
            handleSearchValue={handleSearchValue}
            handleBatchApproce={handleBatchApproce}
            taskType={taskType}
          />
        </div>
      </Fragment>

    );
  }
}

export default HomeHead;
