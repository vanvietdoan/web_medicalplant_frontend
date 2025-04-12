<script setup lang="ts">
import { onMounted, onBeforeMount } from 'vue'
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'

console.log('App component setup')

onBeforeMount(() => {
  console.log('App component before mount')
})

onMounted(() => {
  console.log('App component mounted')
})
</script>

<template>
  <div class="app">
    <Header />
    <main class="main-content">
      <router-view></router-view>
    </main>
    <Footer />
  </div>
</template>

<style>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding-top: 60px;
}

/* Reset and base styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  line-height: 1.6;
  color: #2c3e50;
  background-color: #f5f5f5;
}

a {
  text-decoration: none;
  color: inherit;
}

button {
  cursor: pointer;
  font-family: inherit;
}
</style>
