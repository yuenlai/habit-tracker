<template>
  <nav class="navbar">
    <div class="navbar-content">
      <router-link to="/" class="navbar-brand">
        <span class="brand-icon">✅</span>
        <span class="brand-text">习惯打卡</span>
      </router-link>
      <div class="navbar-links">
        <router-link to="/" class="nav-link" active-class="active" exact>
          <el-icon><HomeFilled /></el-icon>
          <span>首页</span>
        </router-link>
        <router-link to="/stats" class="nav-link" active-class="active">
          <el-icon><DataAnalysis /></el-icon>
          <span>统计</span>
        </router-link>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { HomeFilled, DataAnalysis } from '@element-plus/icons-vue'
</script>

<style scoped>
.navbar {
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: #1a1a1a;
  font-size: 20px;
  font-weight: 700;
}

.brand-icon {
  font-size: 24px;
}

.navbar-links {
  display: flex;
  gap: 8px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 8px;
  text-decoration: none;
  color: #666;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.nav-link:hover {
  background: #f5f5f5;
  color: #333;
}

.nav-link.active {
  background: #e8f5e9;
  color: #2e7d32;
}

.nav-link .el-icon {
  font-size: 18px;
}
</style>
