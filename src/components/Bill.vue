<template>
  <div>
    <el-card>
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
      </el-table>

      <el-button class="clsBtn" type="primary" @click="clsDialogVisible = true">分账</el-button>
    </el-card>

    <el-dialog title="添加账单" :visible.sync="addDialogVisible" width="30%" @close="addDialogClosed">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="80px">
        <el-form-item label="支付人" prop="payManId">
          <el-select class="select-payman" v-model="addForm.payManId" placeholder="请选择">
            <el-option v-for="item in aaers" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="支付金额" prop="paynum">
          <el-input type='number' v-model.number="addForm.paynum"></el-input>
        </el-form-item>
        <el-form-item label="参与人" prop="aaersName">
          <el-checkbox-group v-model="addForm.aaersId">
            <el-checkbox
              v-for="item in aaers"
              :label="item.id"
              :key="item.id"
              :value="item.id"
              checked
            >{{item.name}}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addAAerBill">确 定</el-button>
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
      addForms: [],
      addForm: {
        payman: "",
        payManId: "",
        paynum: 0,
        aaersName: [],
        aaersId: []
      },
      addFormRules: {
        paynum: [{ required: true, message: "请输入支付金额", trigger: "blur" }]
      }
    };
  },
  methods: {
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
      console.log(this.aaers);
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
        recpay:0
      };
      this.aaers.push(newAAer);
      // console.log(this.aaers);
    },
    calAAers() {
      this.aaers.forEach(item => {
        item.collect = item.pay - item.expend;
      })
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