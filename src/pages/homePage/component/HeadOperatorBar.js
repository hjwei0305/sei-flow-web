/**
 * @Description:
 * @Author: CHEHSHUANG
 * @Date: 2019/3/15
 */
import React, {Component, Fragment} from 'react';
import TodoTbar from "./TodoTbar";
import CompleteTbar from "./CompleteTbar";
import MyOrderTbar from "./MyOrderTbar";
import { constants, } from '@/utils';

const {TASK_TYPE} = constants;

class HeadOperatorBar extends Component {

  render() {
    const {taskType,handleSearchValue,handleBatchApproce} = this.props;
    return (
      <Fragment>
        <TodoTbar
          handleSearchValue={handleSearchValue}
          handleBatchApproce={handleBatchApproce}
          visible={taskType===TASK_TYPE.TODO}
        />
        <CompleteTbar
          handleSearchValue={handleSearchValue}
          visible={taskType===TASK_TYPE.COMPLETE}
        />
        <MyOrderTbar
          handleSearchValue={handleSearchValue}
          visible={taskType===TASK_TYPE.ORDER}
        />
      </Fragment>
    );
  }
}

export default HeadOperatorBar;
