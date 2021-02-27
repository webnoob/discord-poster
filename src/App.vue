<template>
  <div style="width: 800px; height: 600px; border-radius: 5px;" class="bg-transparent relative-position" id="q-app">
    <div class="absolute-top-right" style="width: 450px; height: 45px; -webkit-app-region: drag"></div>
    <router-view />
  </div>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

@Component
export default class App extends Vue {}
</script>
