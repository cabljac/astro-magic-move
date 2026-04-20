const el = document.querySelector('magic-move')

el.step = 2
el.totalSteps // => 4

el.addEventListener('magic-move:step', (e) => {
  console.log(e.detail.step, e.detail.total)
})
