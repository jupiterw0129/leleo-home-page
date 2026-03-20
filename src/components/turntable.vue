<template>
  <div
    class="tech-core"
    :style="rootVars"
    @mousemove="handleMove"
    @mouseleave="resetMove"
  >
    <!-- SVG Scene -->
    <svg class="scene" viewBox="0 0 344 344" aria-hidden="true">
      <defs>
        <!-- 唯一渐变 -->
        <radialGradient :id="gradCoreId" cx="50%" cy="50%" r="50%">
          <stop offset="0%" :stop-color="color3" stop-opacity="1" />
          <stop offset="38%" :stop-color="color2" stop-opacity="0.95" />
          <stop offset="72%" :stop-color="color1" stop-opacity="0.55" />
          <stop offset="100%" :stop-color="color1" stop-opacity="0" />
        </radialGradient>

        <linearGradient :id="gradStrokeId" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" :stop-color="color1" />
          <stop offset="45%" :stop-color="color2" />
          <stop offset="100%" :stop-color="color3" />
        </linearGradient>

        <linearGradient :id="gradScanId" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" :stop-color="color1" stop-opacity="0" />
          <stop offset="50%" :stop-color="color3" stop-opacity="1" />
          <stop offset="100%" :stop-color="color2" stop-opacity="0" />
        </linearGradient>

        <!-- glow filters -->
        <filter :id="glowSoftId" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="1 0 0 0 0
                    0 1 0 0 0
                    0 0 1 0 0
                    0 0 0 18 -7"
            result="glow"
          />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter :id="glowStrongId" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="1 0 0 0 0
                    0 1 0 0 0
                    0 0 1 0 0
                    0 0 0 22 -9"
            result="glow"
          />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <!-- 唯一 mask -->
        <mask fill="white" :id="mask2Id">
          <path d="M102.892 127.966C93.3733 142.905 88.9517 160.527 90.2897 178.19L94.3752 177.88C93.1041 161.1 97.3046 144.36 106.347 130.168L102.892 127.966Z"></path>
          <path d="M93.3401 194.968C98.3049 211.971 108.646 226.908 122.814 237.541L125.273 234.264C111.814 224.163 101.99 209.973 97.2731 193.819L93.3401 194.968Z"></path>
          <path d="M152.707 92.3592C140.33 95.3575 128.822 101.199 119.097 109.421L121.742 112.55C130.981 104.739 141.914 99.1897 153.672 96.3413L152.707 92.3592Z"></path>
          <path d="M253.294 161.699C255.099 175.937 253.132 190.4 247.59 203.639L243.811 202.057C249.075 189.48 250.944 175.74 249.23 162.214L253.294 161.699Z"></path>
          <path d="M172 90.0557C184.677 90.0557 197.18 92.9967 208.528 98.6474C219.875 104.298 229.757 112.505 237.396 122.621L234.126 125.09C226.869 115.479 217.481 107.683 206.701 102.315C195.921 96.9469 184.043 94.1529 172 94.1529V90.0557Z"></path>
          <path d="M244.195 133.235C246.991 138.442 249.216 143.937 250.83 149.623L246.888 150.742C245.355 145.34 243.242 140.12 240.586 135.174L244.195 133.235Z"></path>
          <path d="M234.238 225.304C223.932 237.338 210.358 246.126 195.159 250.604C179.961 255.082 163.79 255.058 148.606 250.534L149.775 246.607C164.201 250.905 179.563 250.928 194.001 246.674C208.44 242.42 221.335 234.071 231.126 222.639L234.238 225.304Z"></path>
        </mask>
      </defs>

      <!-- 背景能量晕 -->
      <g class="bg-energy">
        <circle cx="172" cy="172" r="78" :fill="`url(#${gradCoreId})`" opacity="0.35" />
        <circle cx="172" cy="172" r="54" :fill="`url(#${gradCoreId})`" opacity="0.22" />
      </g>

      <!-- 扫描环 -->
      <g class="scan-layer layer layer-0" style="--i:0;--j:0;">
        <circle
          class="scan-ring"
          cx="172"
          cy="172"
          r="112"
          fill="none"
          :stroke="`url(#${gradScanId})`"
          stroke-width="3"
          stroke-linecap="round"
          stroke-dasharray="34 220"
          :filter="`url(#${glowSoftId})`"
        />
        <circle
          class="scan-ring-secondary"
          cx="172"
          cy="172"
          r="98"
          fill="none"
          :stroke="`url(#${gradStrokeId})`"
          stroke-width="1.4"
          stroke-dasharray="8 16"
          opacity="0.65"
        />
      </g>

      <!-- 外圈 1 -->
      <g class="layer layer-1" style="--i:0;--j:1;">
        <g class="spin-slow">
          <path
            class="main-ring"
            fill="none"
            :stroke="`url(#${gradStrokeId})`"
            stroke-width="2.2"
            d="M72 172C72 116.772 116.772 72 172 72C227.228 72 272 116.772 272 172C272 227.228 227.228 272 172 272C116.772 272 72 227.228 72 172ZM197.322 172C197.322 158.015 185.985 146.678 172 146.678C158.015 146.678 146.678 158.015 146.678 172C146.678 185.985 158.015 197.322 172 197.322C185.985 197.322 197.322 185.985 197.322 172Z"
            :filter="`url(#${glowSoftId})`"
          />
        </g>
      </g>

      <!-- 外圈 2：你原来那层复杂碎片环 -->
      <g class="layer layer-2" style="--i:1;--j:2;">
        <g class="spin-cw">
          <path
            :mask="`url(#${mask2Id})`"
            :fill="`url(#${gradStrokeId})`"
            :filter="`url(#${glowSoftId})`"
            d="M102.892 127.966L105.579 123.75L101.362 121.063L98.6752 125.28L102.892 127.966ZM90.2897 178.19L85.304 178.567L85.6817 183.553L90.6674 183.175L90.2897 178.19ZM94.3752 177.88L94.7529 182.866L99.7386 182.488L99.3609 177.503L94.3752 177.88ZM106.347 130.168L110.564 132.855L113.251 128.638L109.034 125.951L106.347 130.168ZM93.3401 194.968L91.9387 190.168L87.1391 191.569L88.5405 196.369L93.3401 194.968ZM122.814 237.541L119.813 241.54L123.812 244.541L126.813 240.542L122.814 237.541ZM125.273 234.264L129.272 237.265L132.273 233.266L128.274 230.265L125.273 234.264ZM97.2731 193.819L102.073 192.418L100.671 187.618L95.8717 189.02L97.2731 193.819ZM152.707 92.3592L157.567 91.182L156.389 86.3226L151.53 87.4998L152.707 92.3592ZM119.097 109.421L115.869 105.603L112.05 108.831L115.278 112.649L119.097 109.421ZM121.742 112.55L117.924 115.778L121.152 119.596L124.97 116.368L121.742 112.55ZM153.672 96.3413L154.849 101.201L159.708 100.023L158.531 95.1641L153.672 96.3413ZM253.294 161.699L258.255 161.07L257.626 156.11L252.666 156.738L253.294 161.699ZM247.59 203.639L245.66 208.251L250.272 210.182L252.203 205.569L247.59 203.639ZM243.811 202.057L239.198 200.126L237.268 204.739L241.88 206.669L243.811 202.057ZM249.23 162.214L248.601 157.253L243.641 157.882L244.269 162.842L249.23 162.214ZM172 90.0557V85.0557H167V90.0557H172ZM208.528 98.6474L206.299 103.123L206.299 103.123L208.528 98.6474ZM237.396 122.621L240.409 126.611L244.399 123.598L241.386 119.608L237.396 122.621ZM234.126 125.09L230.136 128.103L233.149 132.093L237.139 129.08L234.126 125.09ZM206.701 102.315L204.473 106.791L204.473 106.791L206.701 102.315ZM172 94.1529H167V99.1529H172V94.1529ZM244.195 133.235L248.601 130.87L246.235 126.465L241.83 128.83L244.195 133.235ZM250.83 149.623L252.195 154.433L257.005 153.067L255.64 148.257L250.83 149.623ZM246.888 150.742L242.078 152.107L243.444 156.917L248.254 155.552L246.888 150.742ZM240.586 135.174L238.22 130.768L233.815 133.134L236.181 137.539L240.586 135.174ZM234.238 225.304L238.036 228.556L241.288 224.759L237.491 221.506L234.238 225.304ZM195.159 250.604L196.572 255.4L196.572 255.4L195.159 250.604ZM148.606 250.534L143.814 249.107L142.386 253.899L147.178 255.326L148.606 250.534ZM149.775 246.607L151.203 241.816L146.411 240.388L144.983 245.18L149.775 246.607ZM194.001 246.674L195.415 251.47L195.415 251.47L194.001 246.674ZM231.126 222.639L234.379 218.841L230.581 215.589L227.329 219.386L231.126 222.639Z"
          />
        </g>
      </g>

      <!-- 中层细弧 -->
      <g class="layer layer-3" style="--i:0;--j:3;">
        <g class="spin-ccw">
          <path
            :stroke="`url(#${gradStrokeId})`"
            stroke-width="1.9"
            stroke-linecap="round"
            fill="none"
            class="mid-arc"
            :filter="`url(#${glowSoftId})`"
            d="M240.944 172C240.944 187.951 235.414 203.408 225.295 215.738C215.176 228.068 201.095 236.508 185.45 239.62C169.806 242.732 153.567 240.323 139.5 232.804C125.433 225.285 114.408 213.12 108.304 198.384C102.2 183.648 101.394 167.25 106.024 151.987C110.654 136.723 120.434 123.537 133.696 114.675C146.959 105.813 162.884 101.824 178.758 103.388C194.632 104.951 209.472 111.97 220.751 123.249"
          />
          <path
            :fill="color2"
            opacity="0.9"
            d="M195.136 135.689C188.115 131.215 179.948 128.873 171.624 128.946C163.299 129.019 155.174 131.503 148.232 136.099L148.42 136.382C155.307 131.823 163.368 129.358 171.627 129.286C179.886 129.213 187.988 131.537 194.954 135.975L195.136 135.689Z"
          />
          <path
            :fill="color2"
            opacity="0.9"
            d="M195.136 208.311C188.115 212.784 179.948 215.127 171.624 215.054C163.299 214.981 155.174 212.496 148.232 207.901L148.42 207.618C155.307 212.177 163.368 214.642 171.627 214.714C179.886 214.786 187.988 212.463 194.954 208.025L195.136 208.311Z"
          />
        </g>
      </g>

      <!-- 内层结构 -->
      <g class="layer layer-4" style="--i:1;--j:4;">
        <g class="spin-slow-reverse">
          <path
            :fill="`url(#${gradStrokeId})`"
            opacity="0.95"
            :filter="`url(#${glowSoftId})`"
            d="M145.949 124.51L148.554 129.259C156.575 124.859 165.672 122.804 174.806 123.331C183.94 123.858 192.741 126.944 200.203 132.236C207.665 137.529 213.488 144.815 217.004 153.261C220.521 161.707 221.59 170.972 220.09 179.997L224.108 180.665L224.102 180.699L229.537 181.607C230.521 175.715 230.594 169.708 229.753 163.795L225.628 164.381C224.987 159.867 223.775 155.429 222.005 151.179C218.097 141.795 211.628 133.699 203.337 127.818C195.045 121.937 185.266 118.508 175.118 117.923C165.302 117.357 155.525 119.474 146.83 124.037C146.535 124.192 146.241 124.349 145.949 124.51Z"
          />
          <path
            :fill="`url(#${gradStrokeId})`"
            opacity="0.95"
            :filter="`url(#${glowSoftId})`"
            d="M139.91 220.713C134.922 217.428 130.469 213.395 126.705 208.758L130.983 205.286L130.985 205.288L134.148 202.721C141.342 211.584 151.417 217.642 162.619 219.839C173.821 222.036 185.438 220.232 195.446 214.742L198.051 219.491C197.759 219.651 197.465 219.809 197.17 219.963C186.252 225.693 173.696 227.531 161.577 225.154C154.613 223.789 148.041 221.08 142.202 217.234L139.91 220.713Z"
          />
        </g>
      </g>

      <!-- 中心核心 -->
      <g class="layer layer-5 core-layer" style="--i:2;--j:5;">
        <g class="core-wrap">
          <circle
            cx="172"
            cy="172"
            r="26"
            :fill="`url(#${gradCoreId})`"
            opacity="0.28"
            class="core-halo"
          />
          <path
            class="core-rotor"
            :fill="`url(#${gradStrokeId})`"
            :filter="`url(#${glowStrongId})`"
            d="M180.956 186.056C183.849 184.212 186.103 181.521 187.41 178.349C188.717 175.177 189.013 171.679 188.258 168.332C187.503 164.986 185.734 161.954 183.192 159.65C180.649 157.346 177.458 155.883 174.054 155.46C170.649 155.038 167.197 155.676 164.169 157.288C161.14 158.9 158.683 161.407 157.133 164.468C155.582 167.528 155.014 170.992 155.505 174.388C155.997 177.783 157.524 180.944 159.879 183.439L161.129 182.259C159.018 180.021 157.648 177.186 157.207 174.141C156.766 171.096 157.276 167.989 158.667 165.245C160.057 162.5 162.261 160.252 164.977 158.806C167.693 157.36 170.788 156.788 173.842 157.167C176.895 157.546 179.757 158.858 182.037 160.924C184.317 162.99 185.904 165.709 186.581 168.711C187.258 171.712 186.992 174.849 185.82 177.694C184.648 180.539 182.627 182.952 180.032 184.606L180.956 186.056Z"
          />
          <circle
            class="core-dot"
            cx="172"
            cy="172"
            r="5.4"
            :fill="color3"
            :filter="`url(#${glowStrongId})`"
          />
        </g>
      </g>
    </svg>
  </div>
</template>

<script>
export default {
  name: 'TechCoreFx',
  props: {
    color1: {
      type: String,
      default: '#5B8CFF'
    },
    color2: {
      type: String,
      default: '#35E0FF'
    },
    color3: {
      type: String,
      default: '#D8F6FF'
    },
    interactive: {
      type: Boolean,
      default: true
    },
    size: {
      type: Number,
      default: 280
    }
  },
  data() {
    const uid = `techfx-${Math.random().toString(36).slice(2, 10)}`
    return {
      uid,
      rotateX: 0,
      rotateY: 0
    }
  },
  computed: {
    gradCoreId() {
      return `${this.uid}-grad-core`
    },
    gradStrokeId() {
      return `${this.uid}-grad-stroke`
    },
    gradScanId() {
      return `${this.uid}-grad-scan`
    },
    glowSoftId() {
      return `${this.uid}-glow-soft`
    },
    glowStrongId() {
      return `${this.uid}-glow-strong`
    },
    mask2Id() {
      return `${this.uid}-mask-2`
    },
    rootVars() {
      return {
        '--size': `${this.size}px`,
        '--rx': `${this.rotateX}deg`,
        '--ry': `${this.rotateY}deg`
      }
    }
  },
  methods: {
    handleMove(e) {
      if (!this.interactive) return
      const rect = e.currentTarget.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width - 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5
      this.rotateY = x * 12
      this.rotateX = -y * 12
    },
    resetMove() {
      this.rotateX = 0
      this.rotateY = 0
    }
  }
}
</script>

<style scoped>
.tech-core {
  position: relative;
  width: var(--size);
  height: var(--size);
  display: inline-flex;
  justify-content: center;
  align-items: center;
  perspective: 1100px;
  transform-style: preserve-3d;
  transform: rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg));
  transition: transform .18s ease-out;
  isolation: isolate;
}

.scene {
  width: 100%;
  height: 100%;
  overflow: visible;
  transform: scale(0.94);
  animation: sceneBreath 4s ease-in-out infinite;
}

/* 所有层 */
.layer {
  transform-origin: center;
  transform-box: fill-box;
  transform-style: preserve-3d;
  transition:
    transform .65s cubic-bezier(.22,.9,.24,1),
    opacity .45s ease,
    filter .45s ease;
  will-change: transform, filter, opacity;
}

/* 背景晕 */
.bg-energy {
  animation: bgPulse 3.6s ease-in-out infinite;
}

/* hover 3D 爆开 */
.tech-core:hover .layer-0 {
  transform: rotateX(68deg) rotateZ(-28deg) translateZ(4px);
}
.tech-core:hover .layer-1 {
  transform: rotateX(68deg) rotateZ(-28deg) translateX(10px) translateY(-8px) translateZ(12px);
}
.tech-core:hover .layer-2 {
  transform: rotateX(68deg) rotateZ(-28deg) translateX(24px) translateY(-18px) translateZ(22px);
}
.tech-core:hover .layer-3 {
  transform: rotateX(68deg) rotateZ(-28deg) translateX(14px) translateY(-10px) translateZ(14px);
}
.tech-core:hover .layer-4 {
  transform: rotateX(68deg) rotateZ(-28deg) translateX(28px) translateY(-22px) translateZ(32px);
}
.tech-core:hover .layer-5 {
  transform: rotateX(68deg) rotateZ(-28deg) translateX(40px) translateY(-28px) translateZ(50px) scale(1.05);
}

/* 旋转设定 */
.spin-slow {
  transform-origin: center;
  animation: spinCW 10s linear infinite;
}
.spin-cw {
  transform-origin: center;
  animation: spinCW 7s linear infinite;
}
.spin-ccw {
  transform-origin: center;
  animation: spinCCW 5.2s linear infinite;
}
.spin-slow-reverse {
  transform-origin: center;
  animation: spinCCW 8.5s linear infinite;
}

/* 扫描环 */
.scan-ring {
  transform-origin: center;
  animation:
    spinCW 2.6s linear infinite,
    scanOpacity 1.8s ease-in-out infinite;
}

.scan-ring-secondary {
  transform-origin: center;
  animation: spinCCW 9s linear infinite;
}

/* 主环 */
.main-ring {
  opacity: .95;
}

/* 中层弧线 */
.mid-arc {
  stroke-dasharray: 11 9;
  animation:
    spinCW 3.2s linear infinite,
    strokePulse 2.4s ease-in-out infinite;
}

/* 核心 */
.core-layer {
  transform-origin: center;
}
.core-wrap {
  transform-origin: center;
}
.core-halo {
  animation: haloPulse 2.2s ease-in-out infinite;
}
.core-rotor {
  transform-origin: center;
  animation: coreWobble 2s ease-in-out infinite;
}
.core-dot {
  animation: coreDotPulse 1.5s ease-in-out infinite;
}

/* 动画 */
@keyframes spinCW {
  to {
    transform: rotate(360deg);
  }
}

@keyframes spinCCW {
  to {
    transform: rotate(-360deg);
  }
}

@keyframes sceneBreath {
  0%, 100% {
    transform: scale(0.94);
    filter: brightness(1);
  }
  50% {
    transform: scale(0.97);
    filter: brightness(1.08);
  }
}

@keyframes bgPulse {
  0%, 100% {
    opacity: .78;
  }
  50% {
    opacity: 1;
  }
}

@keyframes scanOpacity {
  0%, 100% {
    opacity: .65;
  }
  50% {
    opacity: 1;
  }
}

@keyframes strokePulse {
  0%, 100% {
    opacity: .72;
    stroke-width: 1.7;
  }
  50% {
    opacity: 1;
    stroke-width: 2.3;
  }
}

@keyframes haloPulse {
  0%, 100% {
    transform: scale(1);
    opacity: .28;
  }
  50% {
    transform: scale(1.22);
    opacity: .48;
  }
}

@keyframes coreWobble {
  0%, 100% {
    transform: rotate(0deg) scale(1);
  }
  50% {
    transform: rotate(20deg) scale(1.08);
  }
}

@keyframes coreDotPulse {
  0%, 100% {
    transform: scale(1);
    opacity: .88;
  }
  50% {
    transform: scale(1.28);
    opacity: 1;
  }
}

/* 减少动态 */
@media (prefers-reduced-motion: reduce) {
  .tech-core,
  .scene,
  .layer,
  .spin-slow,
  .spin-cw,
  .spin-ccw,
  .spin-slow-reverse,
  .scan-ring,
  .scan-ring-secondary,
  .mid-arc,
  .core-halo,
  .core-rotor,
  .core-dot,
  .bg-energy {
    animation: none !important;
    transition: none !important;
    transform: none !important;
  }
}
</style>
