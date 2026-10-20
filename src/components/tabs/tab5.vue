<template>
  <div class="folia-tab">
    <div v-if="!foliaUrl" class="folia-setup">
      <v-icon size="52" color="var(--leleo-vcard-color)" class="mb-4">mdi-music-box-multiple</v-icon>
      <p class="text-body-2 mb-6" style="opacity:0.65;text-align:center;max-width:360px;">
        将 Folia Major 部署到 Vercel 或 Cloudflare，然后填入访问地址即可嵌入。
      </p>
      <v-text-field
        v-model="inputUrl"
        label="Folia Major 地址"
        placeholder="https://your-folia.vercel.app"
        variant="outlined"
        density="compact"
        style="max-width:380px;width:100%"
        clearable
        @keyup.enter="save"
      />
      <v-btn variant="tonal" color="var(--leleo-vcard-color)" class="mt-3" @click="save">
        保存并打开
      </v-btn>
      <div class="folia-deploy-links mt-6">
        <span class="text-caption" style="opacity:0.5;">快速部署 Folia Major：</span>
        <div class="mt-2" style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;">
          <v-btn
            size="small" variant="tonal" density="compact"
            href="https://vercel.com/new/clone?repository-url=https://github.com/chthollyphile/folia-major"
            target="_blank" rel="noopener noreferrer"
            prepend-icon="mdi-rocket-launch"
          >Vercel</v-btn>
          <v-btn
            size="small" variant="tonal" density="compact"
            href="https://deploy.workers.cloudflare.com/?url=https://github.com/chthollyphile/folia-major"
            target="_blank" rel="noopener noreferrer"
            prepend-icon="mdi-cloud-upload"
          >Cloudflare</v-btn>
        </div>
      </div>
    </div>

    <div v-else class="folia-frame-wrapper">
      <div class="folia-bar">
        <span class="text-caption folia-url-text">{{ foliaUrl }}</span>
        <v-btn
          size="x-small" variant="text" icon="mdi-pencil-outline"
          class="folia-edit-btn"
          aria-label="修改地址"
          @click="resetUrl"
        />
      </div>
      <iframe
        :src="foliaUrl"
        class="folia-iframe"
        allow="autoplay; fullscreen; clipboard-write"
        referrerpolicy="no-referrer"
        title="Folia Major"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'tab5',
  props: {
    defaultUrl: { type: String, default: '' },
  },
  data() {
    return {
      foliaUrl: localStorage.getItem('folia-url') || this.defaultUrl,
      inputUrl: '',
    }
  },
  methods: {
    save() {
      const url = this.inputUrl.trim().replace(/\/$/, '')
      if (!url) return
      this.foliaUrl = url
      localStorage.setItem('folia-url', url)
    },
    resetUrl() {
      this.inputUrl = this.foliaUrl
      this.foliaUrl = ''
    },
  },
}
</script>

<style scoped>
.folia-tab {
  height: 560px;
  display: flex;
  flex-direction: column;
}
.folia-setup {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}
.folia-deploy-links {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.folia-frame-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.folia-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 4px 10px;
  border-bottom: 1px solid rgba(128, 128, 128, 0.15);
  flex-shrink: 0;
}
.folia-url-text {
  opacity: 0.55;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.folia-edit-btn {
  opacity: 0.55;
  flex-shrink: 0;
}
.folia-iframe {
  flex: 1;
  width: 100%;
  border: none;
}
</style>
