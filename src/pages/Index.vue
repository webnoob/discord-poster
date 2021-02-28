<template>
  <q-page class="text-white discord-frame">
    <q-form @submit="send">
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
            v-model="selectedCategoryIds"
            :options="categoryOptions"
            style="width: 350px"
            class="override-input"
            filled
            use-chips
            multiple
            emit-value
            map-options
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
          <q-btn type="submit" color="discord">Send Message</q-btn>
        </div>
      </div>
    </q-form>
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
  selectedCategoryIds: string[] = []
  categoryOptions: {label: string, id: string}[] = []
  categories: DiscordCategory[] = []

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
    const token = this.$q.localStorage.getItem('token')
    let channels = []

    for (const categoryId of this.selectedCategoryIds) {
      const category = this.categories.find(f => f.id === categoryId)
      if (category) {
        channels = channels.concat(category.children.map(m => m.channelId))
      }
    }

    this.$q.electron.ipcRenderer.send('send-message', {
      token,
      message: this.message,
      channels
    })
  }

  exit () {
    this.$q.electron.remote.getCurrentWindow().close()
  }

  showSettings () {
    this.$q.dialog({
      component: SettingsDialogue
    }).onOk(this.load)
  }

  load () {
    if (this.$q.localStorage.has('categories')) {
      this.categories = this.$q.localStorage.getItem('categories') as DiscordCategory[]
      this.categoryOptions = this.categories.map(m => {
        return {
          label: m.label,
          value: m.id
        }
      })
    }
  }

  keydownHandler(e){
    if (e.keyCode===13 && e.ctrlKey) {
      this.send()
    }
  }

  mounted () {
    this.load()
  }

  created (){
    document.addEventListener('keydown', this.keydownHandler)

    this.$q.electron.ipcRenderer.on('send-message-response', (event, arg) => {
      this.$q.notify({
        message: 'Message Sent',
        color: positive,
        position: 'top'
      })
    })
  }

  beforeDestroy () {
    document.removeEventListener('keydown', this.keydownHandler)
    this.$q.electron.ipcRenderer.removeAllListeners('send-message-response')
  }
}
</script>
