<template>
  <el-container>
    <el-header height="80px">
      <div class="container">
        <div class="logo">
          <img src="../assets/logo.png" alt="logo" />
          <h1>AABill</h1>
        </div>
      </div>
    </el-header>
    <el-main>
      <router-view></router-view>
    </el-main>
  </el-container>
</template>

<script>
export default {};
</script>

<style lang="less" scoped>

.container {
  height: 100%;
  box-sizing: border-box;
  border-bottom: 1px solid #dcdfe6;
  width: 1140px;
  // display: flex;
}

.logo {
  width: 500px;
  height: 100%;
  display: flex;
  align-items: center;
  margin-left: 5px;
  > img {
    width: 35px;
  }
  > h1 {
    margin: 10px;
  }
}
</style>