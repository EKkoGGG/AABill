<template>
  <div>
    <el-card shadow="never">
      <el-row>
        <el-col :span="1.5">
          <span>参与者：</span>
        </el-col>
        <el-col :span="18.5">
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
        <el-col class="room-title" :span="4">
          <span>{{Bill.roomTitle}}</span>
          <el-button type="primary" icon="el-icon-edit" size="mini" circle @click="billTitleVisible = true"></el-button>
        </el-col>
      </el-row>
      <el-row>
        <el-button type="primary" @click="OpenBillInfoDig">添加账单</el-button>
      </el-row>

      <el-table :data="BillInfo" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="支付人" prop="payerName"></el-table-column>
        <el-table-column label="支付金额" prop="payNum"></el-table-column>
        <el-table-column label="参与人">
          <template v-slot="scope">
            <el-tag v-for="item in scope.row.payerNames" :key="item">{{item}}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template v-slot="scope">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              @click="OpenEditBillInfoDig(scope.row)"
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

      <el-button class="clsBtn" type="primary" @click="CalBill">分账</el-button>
    </el-card>

    <el-dialog
      title="添加账单"
      :visible.sync="billInfoDialogVisible"
      width="30%"
      @close="billInfoDialogVisible =false"
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
            >{{item.payerName}}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="billInfoDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="CreatBillInfo">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog title="编辑账单" :visible.sync="editBillInfoVisible" width="30%">
      <el-form
        :model="billInfoForm"
        :rules="billInfoFormRules"
        ref="billInfoFormRef"
        label-width="80px"
      >
        <el-form-item label="支付人" prop="payerName">
          <el-input disabled v-model="billInfoForm.payerName"></el-input>
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
            >{{item.payerName}}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="CloseEditBillInfoDig">取 消</el-button>
        <el-button type="primary" @click="EditBillInfo">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog title="分账" :visible.sync="calBillVisible" width="30%">
      <el-row v-for="(item,index) in billList" :key="index">
        <span>{{item}}</span>
      </el-row>
      <span slot="footer" class="dialog-footer">
        <el-button @click="calBillVisible = false">取 消</el-button>
        <el-button type="primary" @click="calBillVisible = false">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog title="编辑账单名称" :visible.sync="billTitleVisible" width="30%">
      <el-row>
        <el-input v-model="Bill.roomTitle">{{Bill.roomTitle}}</el-input>
      </el-row>
      <span slot="footer" class="dialog-footer">
        <el-button @click="billTitleVisible = false">取 消</el-button>
        <el-button type="primary" @click="EditBillTitle">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      inputTagVisible: false,
      inputTagValue: "",
      billInfoDialogVisible: false,
      editBillInfoVisible: false,
      calBillVisible: false,
      billTitleVisible: false,
      billInfoForm: {
        payerId: null,
        payNum: null,
        payerIds: []
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
      billList: [],
      BillInfo: [],
      Bill: {}
    };
  },
  created() {
    this.GetBill();
  },
  methods: {
    async EditBillTitle(){
      let url =
        this.$route.params.roomId +
        "?roomTitle=" +
        this.Bill.roomTitle;
      await this.$http.patch(url).then(res => {
        if (res.status != 200) {
          return this.$message.error("修改账单名称失败，请重试！");
        }
      });
        this.GetBill();
        this.billTitleVisible = false;
    },
    CleanBillInfoForm() {
      this.billInfoForm = {
        payerId: null,
        payNum: null,
        payerIds: []
      };
    },
    AddCollect(calBillObj) {
      for (let item of calBillObj) {
        item.collect = Number((item.payNum - item.expend).toFixed(2));
      }
    },
    AddPayerNum(calBillObj, payerId, payNum) {
      let index = 0;
      for (let billObj of calBillObj) {
        if (billObj.payerId == payerId) {
          calBillObj[index].payNum += payNum;
          break;
        }
        index++;
      }
    },
    AddExpend(calBillObj, payerIds, expend) {
      for (let item of payerIds) {
        let index = 0;
        for (let billObj of calBillObj) {
          if (billObj.payerId == item) {
            calBillObj[index].expend += expend;
          }
          index++;
        }
      }
    },
    CalBill() {
      this.calBillVisible = true;
      let calBillObj = JSON.parse(JSON.stringify(this.Bill.payerInfo));
      calBillObj.forEach(c => (c.expend = 0));
      calBillObj.forEach(c => (c.payNum = 0));
      calBillObj.forEach(c => (c.collect = 0));
      calBillObj.forEach(c => (c.recpay = 0));
      for (let item of this.BillInfo) {
        let expend = item.payNum / item.payerIds.length;
        expend = Number(expend.toFixed(2));
        this.AddExpend(calBillObj, item.payerIds, expend);

        this.AddPayerNum(calBillObj, item.payerId, item.payNum);
      }
      this.AddCollect(calBillObj);
      calBillObj.sort(this.sortObj("collect", 0));
      this.OutBillList(calBillObj);
    },
    OutBillList(calBillObj) {
      console.log(calBillObj);
      this.billList = [];
      let minIndex = 0;
      for (let item of calBillObj) {
        if (item.collect > 0) {
          break;
        }
        minIndex++;
      }
      let log;
      if (minIndex === calBillObj.length) {
        log = "此账单不用分账，每位参与人都收支平衡！";
        this.billList.push(log);
        return;
      }
      for (let i = 0; i < calBillObj.length; i++) {
        if (i + 1 === calBillObj.length) {
          break;
        }
        if (i < minIndex) {
          if (calBillObj[i].collect === 0) {
            continue;
          }
          calBillObj[minIndex].recpay += -calBillObj[i].collect;
          log = `${calBillObj[i].payerName} 给 ${
            calBillObj[minIndex].payerName
          } ${-calBillObj[i].collect}元`;
          this.billList.push(log);
        } else {
          if (calBillObj[i].recpay - calBillObj[i].collect === 0) {
            continue;
          }
          calBillObj[i + 1].recpay += Number(
            (calBillObj[i].recpay - calBillObj[i].collect).toFixed(2)
          );
          log = `${calBillObj[i].payerName} 给 ${
            calBillObj[i + 1].payerName
          } ${(calBillObj[i].recpay - calBillObj[i].collect).toFixed(2)}元`;
          this.billList.push(log);
        }
      }
    },
    OpenBillInfoDig() {
      this.billInfoForm = {
        payerId: null,
        payNum: null,
        payerIds: this.GetPayerIds()
      };
      this.billInfoDialogVisible = true;
    },
    OpenEditBillInfoDig(row) {
      this.billInfoForm = {
        billInfoId: row.billInfoId,
        payerId: row.payerId,
        payerName: row.payerName,
        payNum: row.payNum,
        payerIds: row.payerIds,
        payerNames: row.payerNames
      };
      this.editBillInfoVisible = true;
    },
    CloseEditBillInfoDig() {
      this.editBillInfoVisible = false;
      this.CleanBillInfoForm();
    },
    async EditBillInfo() {
      let url =
        this.$route.params.roomId + "/BillInfo/" + this.billInfoForm.billInfoId;
      await this.$http.patch(url, this.billInfoForm).then(res => {
        if (res.status != 200) {
          return this.$message.error("编辑账单失败，请重试！");
        }
        this.GetBill();
      });
      this.CleanBillInfoForm();
      this.editBillInfoVisible = false;
      this.$message.success("编辑账单成功！");
    },
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
        });
      }
      this.GetBill();
      this.billInfoDialogVisible = false;
      this.billInfoForm = {
        payerId: null,
        payNum: null,
        payerIds: this.GetPayerIds()
      };
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
          return this.$message.error("修改用户失败，请重试！");
        }
        this.GetBill();
      });
    },
    async DelPayer(payerId) {
      this.$confirm(
        "是否删除该用户，涉及到此用户的账单也会对应删除！",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      )
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
          payerId: item.payerId,
          payerName: this.GetPayerNameById(item.payerId),
          payNum: item.payNum,
          payerIds: item.payerIds,
          payerNames: this.GetPayerNamesByIds(item.payerIds)
        };
        this.BillInfo.push(billInfo);
      }
    },
    async GetBill() {
      await this.$http.get(this.$route.params.roomId).then(res => {
        if (res.status != 200) {
          return this.$message.error("获取账单失败，请重试！");
        }
        this.Bill = res.data;
        console.log(this.Bill);
      });
      this.GetBillInfo();
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
    showInput() {
      this.inputTagVisible = true;
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus();
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
.room-title {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  color: #409eff;
  font-size: 30px;
  margin-left: auto;
  > button {
    margin-left: 10px;
  }
}
</style>