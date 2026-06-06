<template>
  <div ref="container" class="hero-wrapper">
    <svg viewBox="0 0 800 500" class="hero-svg" preserveAspectRatio="xMidYMid meet">
      <g class="maze" fill="none" stroke="#111111" stroke-width="4" stroke-linecap="round">
        <!-- 外框 -->
        <path class="m-wall" d="M80,40 L720,40" />
        <path class="m-wall" d="M80,460 L720,460" />
        <path class="m-wall" d="M80,40 L80,145" />
        <path class="m-wall" d="M80,250 L80,460" />
        <path class="m-wall" d="M720,40 L720,250" />
        <path class="m-wall" d="M720,355 L720,460" />

        <!-- 横墙 y=145 -->
        <path class="m-wall" d="M80,145 L190,145" />

        <!-- 横墙 y=250 -->
        <path class="m-wall" d="M80,250 L190,250" />
        <path class="m-wall" d="M410,250 L520,250" />

        <!-- 横墙 y=355 -->
        <path class="m-wall" d="M80,355 L190,355" />
        <path class="m-wall" d="M300,355 L520,355" />
        <path class="m-wall" d="M630,355 L720,355" />

        <!-- 竖墙 x=190 -->
        <path class="m-wall" d="M190,40 L190,145" />
        <path class="m-wall" d="M190,250 L190,460" />

        <!-- 竖墙 x=300 -->
        <path class="m-wall" d="M300,40 L300,250" />
        <path class="m-wall" d="M300,355 L300,460" />

        <!-- 竖墙 x=410 -->
        <path class="m-wall" d="M410,40 L410,145" />
        <path class="m-wall" d="M410,250 L410,460" />

        <!-- 竖墙 x=520 -->
        <path class="m-wall" d="M520,145 L520,460" />

        <!-- 竖墙 x=630 -->
        <path class="m-wall" d="M630,40 L630,145" />
        <path class="m-wall" d="M630,250 L630,460" />
      </g>

      <!-- 死胡同「黑」字标记 -->
      <text class="trap1" x="245" y="92" text-anchor="middle" dominant-baseline="central" font-size="20" font-weight="700" fill="#E53935" style="visibility:hidden">黑</text>
      <text class="trap2" x="245" y="407" text-anchor="middle" dominant-baseline="central" font-size="20" font-weight="700" fill="#E53935" style="visibility:hidden">黑</text>
      <text class="trap3" x="355" y="92" text-anchor="middle" dominant-baseline="central" font-size="20" font-weight="700" fill="#E53935" style="visibility:hidden">黑</text>
      <text class="trap4" x="575" y="407" text-anchor="middle" dominant-baseline="central" font-size="20" font-weight="700" fill="#E53935" style="visibility:hidden">黑</text>
      <text class="trap5" x="675" y="92" text-anchor="middle" dominant-baseline="central" font-size="20" font-weight="700" fill="#E53935" style="visibility:hidden">黑</text>

      <!-- 出口小房子 -->
      <g class="house" style="visibility:hidden" transform="translate(735, 278)">
        <rect x="0" y="8" width="24" height="18" fill="none" stroke="#111111" stroke-width="3" />
        <polyline points="-4,8 12,-6 28,8" fill="none" stroke="#111111" stroke-width="3" stroke-linejoin="round" />
        <rect x="8" y="17" width="8" height="9" fill="#111111" />
      </g>

      <!-- 圆点 -->
      <circle class="dot" cx="80" cy="197" r="7" fill="#111111" style="visibility:hidden" />
    </svg>
  </div>
</template>

<script>
import { onMounted, onUnmounted, ref } from 'vue'
import { gsap } from 'gsap'

export default {
  name: 'HeroAnimation',
  setup() {
    const container = ref(null)
    let ctx

    function initWalls() {
      const walls = container.value.querySelectorAll('.m-wall')
      walls.forEach(wall => {
        const len = wall.getTotalLength()
        wall.style.strokeDasharray = len
        wall.style.strokeDashoffset = len
      })
    }

    onMounted(() => {
      if (!container.value) return
      ctx = gsap.context(() => {
        const walls = container.value.querySelectorAll('.m-wall')
        const tl = gsap.timeline({ repeat: -1 })

        const dot = '.dot'
        const house = '.house'

        gsap.set(dot, { attr: { cx: 80, cy: 197 }, autoAlpha: 0 })
        gsap.set(house, { visibility: 'hidden', scale: 1, transformOrigin: 'center center' })
        gsap.set('.trap1,.trap2,.trap3,.trap4,.trap5', { visibility: 'hidden' })

        // === 阶段1：迷宫绘制 0-2.5s ===
        walls.forEach((wall, i) => {
          tl.to(wall, { strokeDashoffset: 0, duration: 0.35, ease: 'power2.out' }, i * 0.06)
        })

        // === 阶段2：圆点+房子出现 2.5s ===
        tl.to(dot, { autoAlpha: 1, duration: 0.3 }, 2.5)
        tl.set(house, { visibility: 'visible' }, 2.5)
        tl.from(house, { scale: 0, duration: 0.3, ease: 'back.out(2)' }, 2.5)

        // === 阶段3：寻路 ===
        // 路径：进入→右→上(黑1)→退→下→下(黑2)→退→右→上→上(黑3)→退→右→上→右→下→下(黑4)→退→退→右→上(黑5)→退→下→出口

        const speed = 0.35
        const deadSpeed = 0.3

        // 1. 进入，向右
        tl.to(dot, { attr: { cx: 245 }, duration: 0.6, ease: 'none' }, 2.8)

        // 2. 上探死胡同1
        tl.to(dot, { attr: { cy: 92 }, duration: deadSpeed, ease: 'power1.inOut' }, 3.4)
        tl.set('.trap1', { visibility: 'visible' }, 3.65)
        tl.from('.trap1', { scale: 0, duration: 0.12, transformOrigin: '245px 92px', ease: 'back.out(3)' }, 3.65)
        tl.to({}, { duration: 0.2 })
        tl.to(dot, { attr: { cy: 197 }, duration: deadSpeed, ease: 'power1.inOut' }, 4.0)

        // 3. 下探死胡同2
        tl.to(dot, { attr: { cy: 407 }, duration: 0.5, ease: 'power1.inOut' }, 4.35)
        tl.set('.trap2', { visibility: 'visible' }, 4.75)
        tl.from('.trap2', { scale: 0, duration: 0.12, transformOrigin: '245px 407px', ease: 'back.out(3)' }, 4.75)
        tl.to({}, { duration: 0.2 })
        tl.to(dot, { attr: { cy: 302 }, duration: 0.35, ease: 'power1.inOut' }, 5.1)

        // 4. 向右
        tl.to(dot, { attr: { cx: 355 }, duration: speed, ease: 'none' }, 5.5)

        // 5. 向上
        tl.to(dot, { attr: { cy: 197 }, duration: speed, ease: 'power1.inOut' }, 5.85)

        // 6. 上探死胡同3
        tl.to(dot, { attr: { cy: 92 }, duration: deadSpeed, ease: 'power1.inOut' }, 6.2)
        tl.set('.trap3', { visibility: 'visible' }, 6.45)
        tl.from('.trap3', { scale: 0, duration: 0.12, transformOrigin: '355px 92px', ease: 'back.out(3)' }, 6.45)
        tl.to({}, { duration: 0.2 })
        tl.to(dot, { attr: { cy: 197 }, duration: deadSpeed, ease: 'power1.inOut' }, 6.8)

        // 7. 向右
        tl.to(dot, { attr: { cx: 465 }, duration: speed, ease: 'none' }, 7.15)

        // 8. 向上
        tl.to(dot, { attr: { cy: 92 }, duration: speed, ease: 'power1.inOut' }, 7.5)

        // 9. 向右
        tl.to(dot, { attr: { cx: 575 }, duration: speed, ease: 'none' }, 7.85)

        // 10. 向下
        tl.to(dot, { attr: { cy: 197 }, duration: speed, ease: 'power1.inOut' }, 8.2)
        tl.to(dot, { attr: { cy: 302 }, duration: speed, ease: 'power1.inOut' }, 8.55)

        // 11. 下探死胡同4
        tl.to(dot, { attr: { cy: 407 }, duration: deadSpeed, ease: 'power1.inOut' }, 8.9)
        tl.set('.trap4', { visibility: 'visible' }, 9.15)
        tl.from('.trap4', { scale: 0, duration: 0.12, transformOrigin: '575px 407px', ease: 'back.out(3)' }, 9.15)
        tl.to({}, { duration: 0.2 })
        tl.to(dot, { attr: { cy: 197 }, duration: 0.5, ease: 'power1.inOut' }, 9.5)

        // 12. 向右
        tl.to(dot, { attr: { cx: 675 }, duration: speed, ease: 'none' }, 10.05)

        // 13. 上探死胡同5
        tl.to(dot, { attr: { cy: 92 }, duration: deadSpeed, ease: 'power1.inOut' }, 10.4)
        tl.set('.trap5', { visibility: 'visible' }, 10.65)
        tl.from('.trap5', { scale: 0, duration: 0.12, transformOrigin: '675px 92px', ease: 'back.out(3)' }, 10.65)
        tl.to({}, { duration: 0.2 })
        tl.to(dot, { attr: { cy: 197 }, duration: deadSpeed, ease: 'power1.inOut' }, 11.0)

        // 14. 向下到出口
        tl.to(dot, { attr: { cy: 302 }, duration: speed, ease: 'power1.inOut' }, 11.35)
        tl.to(dot, { attr: { cx: 720 }, duration: 0.3, ease: 'power1.in' }, 11.7)

        // === 阶段4：到达房子 12s ===
        tl.to(house, { scale: 1.12, duration: 0.15, ease: 'power2.out' }, 12.0)
        tl.to(house, { scale: 1, duration: 0.15, ease: 'power2.in' }, 12.15)
        tl.to(dot, { autoAlpha: 0, duration: 0.2 }, 12.05)

        tl.to({}, { duration: 0.6 })

        // === 循环重置 ===
        tl.to([house, '.trap1,.trap2,.trap3,.trap4,.trap5'], { autoAlpha: 0, duration: 0.4 }, 12.8)
        tl.to('.maze', { autoAlpha: 0, duration: 0.3 }, 12.8)
        tl.add(() => initWalls())
        tl.set('.maze', { autoAlpha: 1 }, 13.3)
        tl.set(dot, { autoAlpha: 0, attr: { cx: 80, cy: 197 } }, 13.3)
        tl.set(house, { visibility: 'hidden', autoAlpha: 1, scale: 1 }, 13.3)
        tl.set('.trap1,.trap2,.trap3,.trap4,.trap5', { visibility: 'hidden', autoAlpha: 1, scale: 1 }, 13.3)
        tl.to({}, { duration: 0.3 })
      }, container.value)
    })

    onUnmounted(() => { ctx?.revert() })

    return { container }
  }
}
</script>

<style scoped>
.hero-wrapper {
  width: 100%;
  background: #FFFFFF;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px 16px;
}
.hero-svg {
  display: block;
  width: 100%;
  max-width: 800px;
  height: auto;
}
@media (min-width: 768px) {
  .hero-wrapper { padding: 40px 24px; }
}
</style>
