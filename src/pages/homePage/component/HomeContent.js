/**
 * @Description:
 * @Author: CHEHSHUANG
 * @Date: 2019/3/15
 */
import React, {Component} from 'react';
import TodoTask from "./TodoTask";
import MyOrder from "./MyOrder";
import CompleteTask from "./CompleteTask";
import { constants, } from '@/utils';

const {TASK_TYPE} = constants;

class HomeContent extends Component {
  render() {
    const {selectedRows, dataSource,selectOrderType ,handleRowSelectChange,handlePageChange,taskType,refresh,onChange} = this.props;
    return (
      <div>
        <TodoTask
          visible={taskType===TASK_TYPE.TODO}
          handleRowSelectChange={handleRowSelectChange}
          handlePageChange={handlePageChange}
          refresh={refresh}
          selectedRows={selectedRows}
          dataSource={dataSource[TASK_TYPE.TODO]}
        />
        <CompleteTask
          visible={taskType===TASK_TYPE.COMPLETE}
          handleRowSelectChange={handleRowSelectChange}
          handlePageChange={handlePageChange}
          refresh={refresh}
          selectedRows={selectedRows}
          dataSource={dataSource[TASK_TYPE.COMPLETE]}
        />
        <MyOrder
          visible={taskType===TASK_TYPE.ORDER}
          handleRowSelectChange={handleRowSelectChange}
          // handlePageChange={handlePageChange}
          selectOrderType = {selectOrderType}
          onChange = {onChange}
          refresh={refresh}
          selectedRows={selectedRows}
          dataSource={dataSource[TASK_TYPE.ORDER]}
        />
      </div>
    );
  }
}

export default HomeContent;
