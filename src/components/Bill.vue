<template>
  <div>
    <el-card shadow="never">
      <el-row>
        <el-col :span="1.5">
          <span>参与者：</span>
        </el-col>
        <el-col :span="21.5">
          <el-tag
            :key="tag.id"
            v-for="tag in aaers"
            closable
            :disable-transitions="true"
            @close="handleClose(tag.id)"
            @click="editTag(tag)"
          >{{tag.name}}</el-tag>
          <el-input
            class="input-new-tag"
            v-if="inputVisible"
            v-model="inputValue"
            ref="saveTagInput"
            size="small"
            @keyup.enter.native="handleInputConfirm"
            @blur="handleInputConfirm"
          ></el-input>
          <el-button v-else class="button-new-tag" size="small" @click="showInput">+ 添加参与者</el-button>
        </el-col>
      </el-row>
      <el-row>
        <el-button type="primary" @click="addDialogVisible = true">添加账单</el-button>
        <el-button type="primary" @click="testData">test</el-button>
      </el-row>

      <el-table :data="addForms" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="支付人" prop="payman"></el-table-column>
        <el-table-column label="支付金额" prop="paynum"></el-table-column>
        <el-table-column label="参与人">
          <template v-slot="scope">
            <el-tag v-for="item in scope.row.aaersName" :key="item">{{item}}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template v-slot="scope">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              @click="editBillDialog(scope.row)"
            >编辑</el-button>
            <el-button size="mini" type="danger" icon="el-icon-delete" @click="delBill(scope)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-button class="clsBtn" type="primary" @click="calAAerBill">分账</el-button>
    </el-card>

    <el-dialog title="添加账单" :visible.sync="addDialogVisible" width="30%" @close="addDialogClosed">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="80px">
        <el-form-item label="支付人" prop="payManId">
          <el-select class="select-payman" v-model="addForm.payManId" placeholder="请选择">
            <el-option v-for="item in aaers" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="支付金额" prop="paynum">
          <el-input type="number" v-model.number="addForm.paynum"></el-input>
        </el-form-item>
        <el-form-item label="参与人" prop="aaersName">
          <el-checkbox-group v-model="addForm.aaersId">
            <el-checkbox v-for="item in aaers" :label="item.id" :key="item.id" checked>{{item.name}}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addAAerBill">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog title="编辑账单" :visible.sync="editDialogVisible" width="30%">
      <el-form :model="editForm" :rules="addFormRules" ref="editFormRef" label-width="80px">
        <el-form-item label="支付人" prop="payManId">
          <el-input disabled v-model="editForm.payman"></el-input>
        </el-form-item>
        <el-form-item label="支付金额" prop="paynum">
          <el-input type="number" v-model.number="editForm.paynum"></el-input>
        </el-form-item>
        <el-form-item label="参与人" prop="aaersName">
          <el-checkbox-group v-model="editForm.aaersId">
            <el-checkbox v-for="item in aaers" :label="item.id" :key="item.id">{{item.name}}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editAAerBill">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog title="分账" :visible.sync="calDialogVisible" width="30%">
      <el-row v-for="(item,index) in listLog" :key="index">
        <span>{{item}}</span>
      </el-row>
      <span slot="footer" class="dialog-footer">
        <el-button @click="calDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="calDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      aaers: [],
      inputVisible: false,
      inputValue: "",
      addDialogVisible: false,
      editDialogVisible: false,
      calDialogVisible: false,
      addForms: [],
      addForm: {
        payman: "",
        payManId: "",
        paynum: 0,
        aaersName: [],
        aaersId: []
      },
      editForm: {
        payman: "",
        payManId: "",
        paynum: 0,
        aaersName: [],
        aaersId: []
      },
      addFormRules: {
        paynum: [{ required: true, message: "请输入支付金额", trigger: "blur" }]
      },
      listLog: []
    };
  },
  methods: {
    editAAerBill() {
      let index = this.addForms.findIndex(
        x => x.payManId === this.editForm.payManId
      );
      this.addForms[index].paynum = this.editForm.paynum;
      this.addForms[index].aaersId = this.editForm.aaersId;
      let listName = [];
      for (let item of this.editForm.aaersId) {
        let index2 = this.aaers.findIndex(x => x.id == item);
        let name = this.aaers[index2].name;
        listName.push(name);
      }
      this.addForms[index].aaersName = listName;

      let index3 = this.aaers.findIndex(x => x.id === this.editForm.payManId);
      this.aaers[index3].pay =
        this.aaers[index3].pay - this.addForm.paynum + this.editForm.paynum;
      for (let item2 of this.aaers) {
        item2.expend -= this.addForm.paynum / this.editForm.aaersId.length;
        item2.expend += this.editForm.paynum / this.editForm.aaersId.length;
      }

      this.calAAers();
      this.aaers.sort(this.sortObj("collect", 0));
      this.calBill(this.aaers);
      this.editDialogVisible = false;
    },
    testData() {
      this.aaers = [
        {
          collect: -30,
          expend: 90,
          id: 3,
          name: "C",
          pay: 60,
          recpay: 0
        },
        {
          collect: 0,
          expend: 90,
          id: 2,
          name: "B",
          pay: 90,
          recpay: 0
        },
        {
          collect: 30,
          expend: 90,
          id: 1,
          name: "A",
          pay: 120,
          recpay: 0
        }
      ];
      this.addForms = [
        {
          aaersId: [1, 2, 3],
          aaersName: ["A", "B", "C"],
          payManId: 1,
          payman: "A",
          paynum: 120
        },
        {
          aaersId: [1, 2, 3],
          aaersName: ["A", "B", "C"],
          payManId: 2,
          payman: "B",
          paynum: 90
        },
        {
          aaersId: [1, 2, 3],
          aaersName: ["A", "B", "C"],
          payManId: 3,
          payman: "C",
          paynum: 60
        }
      ];
    },
    editBillDialog(row) {
      this.editForm = row;
      this.addForm = {
        aaersId: row.aaersId,
        aaersName: row.aaersName,
        payManId: row.payManId,
        payman: row.payman,
        paynum: row.paynum
      };
      this.editDialogVisible = true;
    },
    calBill(list) {
      this.listLog = [];
      for (let item of this.aaers) {
        item.recpay = 0;
      }
      let minIndex = 0;

      for (let item of list) {
        if (item.collect > 0) {
          break;
        }
        minIndex++;
      }
      let log;
      for (let i = 0; i < list.length; i++) {
        if (i + 1 === list.length) {
          break;
        }
        if (i < minIndex) {
          list[minIndex].recpay += -list[i].collect;
          log = `${list[i].name} 给 ${list[minIndex].name} ${-list[i]
            .collect}元`;
          this.listLog.push(log);
        } else {
          list[i + 1].recpay += list[i].recpay - list[i].collect;
          log = `${list[i].name} 给 ${list[i + 1].name} ${list[i].recpay -
            list[i].collect}元`;
          this.listLog.push(log);
        }
      }
    },
    sortObj(propertyName, cond) {
      return function(object1, object2) {
        var value1 = object1[propertyName];
        var value2 = object2[propertyName];
        if (cond == 1) {
          //降序
          if (value2 < value1) {
            return -1;
          } else if (value2 > value1) {
            return 1;
          } else {
            return 0;
          }
        } else if (cond == 0) {
          //升序
          if (value2 < value1) {
            return 1;
          } else if (value2 > value1) {
            return -1;
          } else {
            return 0;
          }
        }
      };
    },
    calAAerBill() {
      this.calDialogVisible = true;
      this.aaers.sort(this.sortObj("collect", 0));
      this.calBill(this.aaers);
    },
    addDialogClosed() {
      // this.$refs.addFormRef.resetFields();
      // console.log(this.aaers);
    },
    clsBill(billForm) {
      billForm.aaersId.forEach(itemId => {
        this.aaers[itemId - 1].expend +=
          billForm.paynum / billForm.aaersId.length;
      });
      this.aaers[billForm.payManId - 1].pay += billForm.paynum;
      this.calAAers();
    },
    addAAerBill() {
      this.addForm.payman = this.aaers[this.addForm.payManId - 1].name;
      this.addForm.aaersId.forEach(itemId => {
        this.addForm.aaersName.push(this.aaers[itemId - 1].name);
      });

      this.addForms.push(this.addForm);

      this.clsBill(this.addForm);

      this.addDialogVisible = false;
      this.addForm = {
        payman: "",
        payManId: "",
        paynum: 0,
        aaersName: [],
        aaersId: []
      };
      // console.log(this.addForms);
    },
    handleClose(id) {
      this.aaers.splice(this.aaers.indexOf(id), 1);
    },
    delBill(scope) {
      this.$confirm("是否删除该账单条目?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          let index = this.aaers.findIndex(x => x.id === scope.row.payManId);
          this.aaers[index].pay -= scope.row.paynum;
          for (let item of scope.row.aaersId) {
            this.aaers[this.aaers.findIndex(x => x.id === item)].expend -=
              scope.row.paynum / scope.row.aaersId.length;
          }
          this.calAAers();
          this.listLog = [];
          // this.aaers.sort(this.sortObj("collect", 0));
          // this.calBill(this.aaers);
          // console.log(this.listLog);

          this.addForms.splice(scope.$index, 1);
          this.$message({
            type: "success",
            message: "删除成功!"
          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        });
    },
    showInput() {
      this.inputVisible = true;
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },

    handleInputConfirm() {
      let inputValue = this.inputValue;
      if (inputValue) {
        this.addAAer(inputValue);
      }
      this.inputVisible = false;
      this.inputValue = "";
    },

    editTag(tag) {
      // console.log(tag);
    },
    addAAer(inputValue) {
      let newAAer = {
        id: this.aaers.length + 1,
        name: inputValue,
        pay: 0,
        expend: 0,
        collect: 0,
        recpay: 0
      };
      this.aaers.push(newAAer);
      // console.log(this.aaers);
    },
    calAAers() {
      this.aaers.forEach(item => {
        item.collect = item.pay - item.expend;
      });
    }
  }
};
</script>

<style lang="less" scoped>
.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
.el-row {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}
.select-payman {
  width: 100%;
}
.clsBtn {
  margin-top: 15px;
}
</style>