<template>
  <q-page class="text-white discord-frame">
    <div class="flex q-pa-lg discord-message-container relative-position" style="width: 800px; height: 300px">
      <q-btn icon="settings" class="absolute-top-right q-mt-sm" @click="showSettings" flat />

      <div
        class="uploader"
        :class="{'uploader--has-image': hasImage}"
      >
        <q-uploader
          ref="uploader"
          @added="imageAdded"
          @removed="imageRemoved"
        />
      </div>

      <div class="full-width flex justify-between" style="margin-top: 100px">
        <div class="image-info">
          {{imageFile.name}}
        </div>

        <q-select
          label="Select categories"
          v-model="categories"
          :options="categoryOptions"
          style="width: 350px"
          class="override-input"
          filled
          use-input
          use-chips
          multiple
        />
      </div>

      <div style="font-size: 12px;">ADD A COMMENT <span style="font-size: 10px">(OPTIONAL)</span></div>
      <q-input
        v-model="message"
        class="full-width message q-mt-none q-pt-none override-input"
        filled
        autogrow
      />
    </div>

    <div class="full-width flex justify-between q-pa-lg button-container">
      <q-btn color="negative" @click="exit" flat>Exit App</q-btn>
      <div>
        <q-btn color="white" class="on-left q-pa-xs" @click="reset" flat>Cancel</q-btn>
        <q-btn color="discord" @click="send">Send Message</q-btn>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { QUploader } from 'quasar'
import SettingsDialogue from 'components/SettingsDialogue.vue'
import { DiscordCategory } from '../types'

@Component
export default class PageIndex extends Vue {
  message = ''
  imageFile = {}
  hasImage = false
  categories = []
  categoryOptions = []

  imageAdded (files: any[]) {
    this.hasImage = true
    this.imageFile = files[0]
  }

  imageRemoved (e: any) {
    this.hasImage = false
    this.imageFile = {}
  }

  reset () {
    (this.$refs.uploader as QUploader).reset()
    this.message = ''
    this.imageFile = {}
  }

  send () {
    this.$q.notify('Message Sent (well, not yet - Waiting...)')
  }

  exit () {
    this.$q.electron.remote.getCurrentWindow().close()
  }

  showSettings () {
    this.$q.dialog({
      component: SettingsDialogue
    })
  }

  mounted () {
    if (this.$q.localStorage.has('categories')) {
      const categories = this.$q.localStorage.getItem('categories') as DiscordCategory[]
      this.categoryOptions = categories.map(m => {
        return {
          label: m.label,
          value: m.id
        }
      })
    }
  }
}
</script>
