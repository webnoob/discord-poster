<template>
  <q-dialog
    ref="thisDialog"
    @hide="onDialogHide"
    persistent
  >
    <div class="q-pa-lg" style="background: #2f3136; color: white; width: 600px;">
      <div class="flex justify-end">
        <q-btn icon="close" @click="close" flat></q-btn>
      </div>

      <q-input v-model="token" class="override-input text-white q-mt-lg" color="white" label="Discord Token" filled />

      <div class="full-width flex q-mt-lg">
        <q-btn color="discord" icon="add" @click="addCategory">Category</q-btn>
        <q-btn color="discord" icon="add" class="on-right" @click="addDiscord">Discord</q-btn>
        <q-space />
        <q-btn color="negative" icon="delete" @click="deleteCategoryOrDiscord" />
      </div>

      <q-tree
        :nodes.sync="categories"
        node-key="id"
        selected-color="primary"
        class="q-mt-lg"
        text-color="white"
        no-nodes-label="No categories defined"
        :selected.sync="selectedNode"
        accordion
      />

      <div class="flex justify-end">
        <q-btn icon="save" color="positive" @click="save">Save Changes</q-btn>
      </div>
    </div>
  </q-dialog>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { QDialog } from 'quasar'
import { DiscordCategory, DiscordChannel } from '../types'
import { v4 as uuidv4 } from 'uuid'

@Component
export default class SettingsDialogue extends Vue {
  token = ''

  categories: DiscordCategory[] | undefined = []
  selectedNode = ''

  get dialog (): QDialog {
    return this.$refs.thisDialog as QDialog
  }

  get selectedCategory () {
    return this.findCategory(this.selectedNode)
  }

  get selectedDiscord () {
    return this.findDiscord(this.selectedNode)
  }

  findCategory (id: string): DiscordCategory | undefined {
    return this.categories?.find(f => f.id === id)
  }

  findDiscord (id: string): DiscordChannel | undefined {
    if (!this.categories) return void 0

    for (const category of this.categories) {
      const discord = category.children.find(f => f.id === id)
      if (discord) {
        return discord
      }
    }
  }

  addDiscord () {
    if (!this.selectedCategory) {
      return this.showError('No category selected.')
    }

    this.$q.dialog({
      title: 'Enter discord channel id',
      prompt: {
        model: '',
        type: 'text' // optional
      },
      cancel: true,
      persistent: true
    }).onOk((data: string) => {
      if (this.selectedCategory?.children.find(f => f.channelId === data)) {
        return this.showError('Channel already in this group.')
      }

      this.selectedCategory?.children.push({
        id: uuidv4(),
        channelId: data,
        label: data,
        serverId: ''
      })
      this.$set(this, 'categories', this.categories)
    })
  }

  addCategory () {
    this.$q.dialog({
      title: 'Enter Category name',
      prompt: {
        model: '',
        type: 'text' // optional
      },
      cancel: true,
      persistent: true
    }).onOk((data: string) => {
      if (this.findCategory(data)) {
        return this.showError('Category name already in use.')
      }

      this.categories?.push({
        id: uuidv4(),
        label: data,
        children: []
      })
      this.$set(this, 'categories', this.categories)
    })
  }

  deleteCategoryOrDiscord () {
    if (!this.selectedNode) {
      return this.showError('Nothing selected.')
    } else if (this.selectedCategory) {
      this.categories?.splice(this.categories.indexOf(this.selectedCategory), 1)
      this.$set(this, 'categories', this.categories)
    } else if (this.selectedDiscord) {
      if (this.categories) {
        for (const category of this.categories) {
          const index = category.children.indexOf(this.selectedDiscord)
          if (index > -1) {
            category.children.splice(index, 1)
          }
        }
        this.$set(this, 'categories', this.categories)
      }
    }
  }

  close () {
    const token = this.$q.localStorage.getItem('token')
    const categories = this.$q.localStorage.getItem('categories')

    if (JSON.stringify(categories) !== JSON.stringify(this.categories) || token !== this.token) {
      this.$q.dialog({
        title: 'Confirm',
        message: 'You have unsaved changes, continue?',
        cancel: true,
        persistent: true
      }).onOk(() => {
        this.cancel()
      }).onOk(() => {
        this.cancel()
      })
    } else {
      this.cancel()
    }
  }

  save () {
    this.$q.localStorage.set('token', this.token)
    if (this.categories) {
      this.$q.localStorage.set('categories', this.categories)
    }
    this.confirm()
  }

  load () {
    if (this.$q.localStorage.has('token')) {
      this.token = this.$q.localStorage.getItem('token') || ''
    }

    if (this.$q.localStorage.has('categories')) {
      this.categories = this.$q.localStorage.getItem('categories') as DiscordCategory[]
    }
  }

  showError (message: string) {
    this.$q.notify({
      message,
      color: 'negative',
      position: 'top'
    })
  }

  show () {
    this.dialog.show()
  }

  hide () {
    this.dialog.hide()
  }

  onDialogHide () {
    this.$emit('hide')
  }

  cancel () {
    this.hide()
  }

  confirm () {
    this.$emit('ok')
    this.hide()
  }

  mounted () {
    this.load()
  }
}
</script>
