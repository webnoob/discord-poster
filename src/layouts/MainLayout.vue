<template>
  <q-layout view="lHh Lpr lFf" class="body--light">
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
const linksData = [
  {
    title: 'Docs',
    caption: 'quasar.dev',
    icon: 'school',
    link: 'https://quasar.dev'
  }
]

import { Vue, Component } from 'vue-property-decorator'

@Component
export default class MainLayout extends Vue {
  leftDrawerOpen = false
  essentialLinks = linksData
}
</script>
