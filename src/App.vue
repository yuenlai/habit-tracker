<template>
  <div id="app">
    <Navbar />
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup>
import Navbar from './components/Navbar.vue'
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: #f5f6f8;
  color: #1a1a1a;
  min-height: 100vh;
}

#app {
  min-height: 100vh;
}

.main-content {
  padding-bottom: 40px;
}

/* Route transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Element Plus overrides */
.el-dialog {
  border-radius: 16px !important;
}

.el-button--primary {
  background: #6366f1 !important;
  border-color: #6366f1 !important;
}

.el-button--primary:hover {
  background: #4f46e5 !important;
  border-color: #4f46e5 !important;
}
</style>
