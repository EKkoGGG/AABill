<template>
  <div>
    <el-card shadow="never">
      <el-row>
        <el-col :span="1.5">
          <span>参与者：</span>
        </el-col>
        <el-col :span="21.5">
          <el-tag
            :key="tag.payerId"
            v-for="tag in Bill.payerInfo"
            closable
            :disable-transitions="true"
            @close="DelPayer(tag.payerId)"
          >{{tag.payerName}}</el-tag>
          <el-input
            class="input-new-tag"
            v-if="inputTagVisible"
            v-model="inputTagValue"
            ref="saveTagInput"
            size="small"
            @keyup.enter.native="CreatPayer"
            @blur="CreatPayer"
          ></el-input>
          <el-button v-else class="button-new-tag" size="small" @click="showInput">+ 添加参与者</el-button>
        </el-col>
      </el-row>
      <el-row>
        <el-button type="primary" @click="billInfoDialogVisible = true">添加账单</el-button>
      </el-row>

      <el-table :data="BillInfo" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="支付人" prop="payerName"></el-table-column>
        <el-table-column label="支付金额" prop="payNum"></el-table-column>
        <el-table-column label="参与人">
          <template v-slot="scope">
            <el-tag v-for="item in scope.row.payerIds" :key="item">{{item}}</el-tag>
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
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="DelBillInfo(scope.row.billInfoId)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-button class="clsBtn" type="primary" @click="calAAerBill">分账</el-button>
    </el-card>

    <el-dialog
      title="添加账单"
      :visible.sync="billInfoDialogVisible"
      width="30%"
      @close="billInfoDialogClosed"
    >
      <el-form
        :model="billInfoForm"
        :rules="billInfoFormRules"
        ref="billInfoFormRef"
        label-width="80px"
      >
        <el-form-item label="支付人" prop="payerId">
          <el-select class="select-payer" v-model="billInfoForm.payerId" placeholder="请选择">
            <el-option
              v-for="item in Bill.payerInfo"
              :key="item.payerId"
              :label="item.payerName"
              :value="item.payerId"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="支付金额" prop="payNum">
          <el-input type="number" v-model.number="billInfoForm.payNum"></el-input>
        </el-form-item>
        <el-form-item label="参与人" prop="payerIds">
          <el-checkbox-group v-model="billInfoForm.payerIds">
            <el-checkbox
              v-for="item in Bill.payerInfo"
              :label="item.payerId"
              :key="item.payerId"
              checked
            >{{item.payerName}}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="billInfoDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="CreatBillInfo">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog title="编辑账单" :visible.sync="editDialogVisible" width="30%">
      <el-form :model="editForm" :rules="billInfoFormRules" ref="editFormRef" label-width="80px">
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
      inputTagVisible: false,
      inputTagValue: "",
      billInfoDialogVisible: false,
      editDialogVisible: false,
      calDialogVisible: false,
      billInfoForms: [],
      billInfoForm: {
        payerId: null,
        payNum: null,
        payerIds: []
      },
      editForm: {
        payman: "",
        payManId: "",
        paynum: 0,
        aaersName: [],
        aaersId: []
      },
      billInfoFormRules: {
        payNum: [
          { required: true, message: "请输入支付金额", trigger: "blur" }
        ],
        payerIds: [
          {
            type: "array",
            required: true,
            message: "请至少选择一个参与人",
            trigger: "change"
          }
        ],
        payerId: [
          { required: true, message: "请选择支付人", trigger: "change" }
        ]
      },
      listLog: [],
      BillInfo: [],
      Bill: {}
    };
  },
  created() {
    this.GetBill();
  },
  methods: {
    async DelBillInfo(billInfoId) {
      this.$confirm("是否删除该账单条目?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(async () => {
          let url = this.$route.params.roomId + "/BillInfo/" + billInfoId;
          await this.$http.delete(url).then(res => {
            if (res.status != 200) {
              return this.$message.error("删除账单失败，请重试！");
            }
            this.GetBill();
          });
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
    CheckBillInfoForm() {
      let res = true;
      this.$refs.billInfoFormRef.validate(valid => {
        if (!valid) {
          this.$message.error("账单信息填写错误，请重试！");
          res = false;
        }
      });
      return res;
    },
    GetPayerIds() {
      let payerIds = [];
      this.Bill.payerInfo.forEach(r => payerIds.push(r.payerId));
      return payerIds;
    },
    async CreatBillInfo() {
      if (this.CheckBillInfoForm()) {
        let url = this.$route.params.roomId + "/BillInfo";
        await this.$http.post(url, this.billInfoForm).then(res => {
          if (res.status != 200) {
            return this.$message.error("添加账单失败，请重试！");
          }
          this.GetBill();
        });
        this.billInfoDialogVisible = false;
        this.billInfoForm = {
          payerId: null,
          payNum: null,
          payerIds: this.GetPayerIds()
        };
      }
    },
    async CreatPayer() {
      let tagValue = this.inputTagValue;
      if (tagValue) {
        let url =
          this.$route.params.roomId + "/PayerInfo?payerName=" + tagValue;
        await this.$http.post(url).then(res => {
          if (res.status != 200) {
            return this.$message.error("添加用户失败，请重试！");
          }
          this.GetBill();
          return this.$message.success("添加用户成功！");
        });
      }
      this.inputTagVisible = false;
      this.inputTagValue = "";
    },
    async EditPayer(tag) {
      let url =
        this.$route.params.roomId +
        "/PayerInfo/" +
        tag.payerId +
        "?payerName=" +
        tag.payerName;
      await this.$http.patch(url).then(res => {
        console.log(res);
        if (res.status != 200) {
          return this.$message.error("删除用户失败，请重试！");
        }
        this.GetBill();
      });
    },
    async DelPayer(payerId) {
      this.$confirm("是否删除该用户?涉及到此用户的账单也会对应删除", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(async () => {
          let url = this.$route.params.roomId + "/PayerInfo/" + payerId;
          await this.$http.delete(url).then(res => {
            // console.log(res);
            if (res.status != 200) {
              return this.$message.error("删除用户失败，请重试！");
            }
            this.GetBill();
          });
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
    GetPayerNamesByIds(payerIds) {
      let payerNames = [];
      for (let payerId of payerIds) {
        for (let item of this.Bill.payerInfo) {
          if (item.payerId === payerId) {
            payerNames.push(item.payerName);
          }
        }
      }
      return payerNames;
    },
    GetPayerNameById(payerId) {
      for (let item of this.Bill.payerInfo) {
        if (item.payerId === payerId) {
          return item.payerName;
        }
      }
    },
    GetBillInfo() {
      this.BillInfo = [];
      for (let item of this.Bill.billInfo) {
        let billInfo = {
          billInfoId: item.billInfoId,
          payerName: this.GetPayerNameById(item.payerId),
          payNum: item.payNum,
          payerIds: this.GetPayerNamesByIds(item.payerIds)
        };
        this.BillInfo.push(billInfo);
      }
    },
    async GetBill() {
      await this.$http.get(this.$route.params.roomId).then(res => {
        // console.log(res);
        if (res.status != 200) {
          return this.$message.error("获取账单失败，请重试！");
        }
        this.Bill = res.data;
        this.GetBillInfo();
      });
    },
    editAAerBill() {
      let index = this.billInfoForms.findIndex(
        x => x.payManId === this.editForm.payManId
      );
      this.billInfoForms[index].paynum = this.editForm.paynum;
      this.billInfoForms[index].aaersId = this.editForm.aaersId;
      let listName = [];
      for (let item of this.editForm.aaersId) {
        let index2 = this.aaers.findIndex(x => x.id == item);
        let name = this.aaers[index2].name;
        listName.push(name);
      }
      this.billInfoForms[index].aaersName = listName;

      let index3 = this.aaers.findIndex(x => x.id === this.editForm.payManId);
      this.aaers[index3].pay =
        this.aaers[index3].pay -
        this.billInfoForm.paynum +
        this.editForm.paynum;
      for (let item2 of this.aaers) {
        item2.expend -= this.billInfoForm.paynum / this.editForm.aaersId.length;
        item2.expend += this.editForm.paynum / this.editForm.aaersId.length;
      }

      this.calAAers();
      this.aaers.sort(this.sortObj("collect", 0));
      this.calBill(this.aaers);
      this.editDialogVisible = false;
    },
    editBillDialog(row) {
      this.editForm = row;
      this.billInfoForm = {
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
    billInfoDialogClosed() {
      // this.$refs.billInfoFormRef.resetFields();
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
      this.billInfoForm.payman = this.aaers[
        this.billInfoForm.payManId - 1
      ].name;
      this.billInfoForm.aaersId.forEach(itemId => {
        this.billInfoForm.aaersName.push(this.aaers[itemId - 1].name);
      });

      this.billInfoForms.push(this.billInfoForm);

      this.clsBill(this.billInfoForm);

      this.billInfoDialogVisible = false;
      this.billInfoForm = {
        payman: "",
        payManId: "",
        paynum: 0,
        aaersName: [],
        aaersId: []
      };
      // console.log(this.billInfoForms);
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

          this.billInfoForms.splice(scope.$index, 1);
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
      this.inputTagVisible = true;
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    addAAer(inputTagValue) {
      let newAAer = {
        id: this.aaers.length + 1,
        name: inputTagValue,
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
.select-payer {
  width: 100%;
}
.clsBtn {
  margin-top: 15px;
}
</style>