<template>
  <div>
    <el-card shadow="never">
      <el-button type="primary" @click="creatNewRoomGet">创建账单房间</el-button>
      <el-button type="primary" @click="inRoomDialogVisible = true">进入账单房间</el-button>
    </el-card>

    <el-dialog title="创建账单房间" :visible.sync="roomDialogVisible" width="30%">
      <el-form :model="roomForm" :rules="roomFormRules" ref="roomFormRef" label-width="100px">
        <el-form-item label="账单房间号" prop="roomId">
          <el-input disabled type="number" v-model.number="roomForm.roomId"></el-input>
        </el-form-item>
        <el-form-item label="设置密码" prop="roomPwd">
          <el-input v-model.number="roomForm.roomPwd"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="roomDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="creatNewRoomPost">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog title="进入账单房间" :visible.sync="inRoomDialogVisible" width="30%">
      <el-form :model="inRoomForm" :rules="roomFormRules" ref="inRoomFormRef" label-width="100px">
        <el-form-item label="账单房间号" prop="roomId">
          <el-input v-model.number="inRoomForm.roomId"></el-input>
        </el-form-item>
        <el-form-item label="设置密码" prop="roomPwd">
          <el-input v-model.number="inRoomForm.roomPwd"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="inRoomDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="inBillRoom">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    var checkPwd = (rule, value, callback) => {
      if (!Number.isInteger(value)) {
        callback(new Error("请输入数字值"));
      } else {
        if (value.toString().length != 4) {
          callback(new Error("必须为4位长度数字"));
        } else {
          callback();
        }
      }
    };
    var checkId = (rule, value, callback) => {
      if (!Number.isInteger(value)) {
        callback(new Error("请输入房间号"));
      } else {
        if (value.toString().length != 6) {
          callback(new Error("必须为6位长度数字"));
        } else {
          callback();
        }
      }
    };
    return {
      roomDialogVisible: false,
      inRoomDialogVisible: false,
      roomForm: {
        roomId: 123456,
        roomPwd: 1234
      },
      inRoomForm: {
        roomId: null,
        roomPwd: null
      },
      roomFormRules: {
        roomPwd: [{ validator: checkPwd, trigger: "blur" }],
        roomId: [{ validator: checkId, trigger: "blur" }]
      }
    };
  },
  methods: {
    inBillRoom(){
      this.inRoomDialogVisible = true;
    },
    async creatNewRoomGet() {
      await this.$http.get("NewRoom").then(res => {
        // console.log(res);
        if (res.status != 200) {
          return this.$message.error("创建失败，请重试！");
        }
        this.roomForm = res.data;
        this.roomDialogVisible = true;
         sessionStorage.setItem("token",res.data.token)
      });
    },
    async creatNewRoomPost() {
      this.$refs.roomFormRef.validate(async valid => {
        if (!valid) return;
        await this.$http.post("NewRoom", this.roomForm).then(res => {
          // console.log(res);
          if (res.status != 200) {
            return this.$message.error("创建失败，请重试！");
          }
          //sessionStorage.setItem("token",res.data.data.token)
          this.$router.push("/Bill/" + this.roomForm.roomId);
        });
      });
    }
  }
};
</script>

<style lang="less" scoped>
</style>