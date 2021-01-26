(function(){
  const BACKGROUND_COLOR = `rgba(50, 50, 50, 0.7)`
  const BORDER_WIDTH = 10000
  const weakmap = new WeakMap()

  let startX, startY, currentX, currentY, boxEl, placeholderOverflow, getABoxPr

  const onMouseMoveEvListener = ev => {
    currentX = ev.clientX
    currentY = ev.clientY

    if (boxEl) {
      boxEl.style.top = `${Math.min(currentY - BORDER_WIDTH, startY - BORDER_WIDTH)}px`
      boxEl.style.left = `${Math.min(currentX - BORDER_WIDTH, startX - BORDER_WIDTH)}px`
      boxEl.style.height = `${Math.abs(currentY - startY)}px`
      boxEl.style.width = `${Math.abs(currentX - startX)}px`
    }
  }

  const onMouseUpEvListener = ev => {
    if (boxEl) {
      document.body.removeChild(boxEl)
      boxEl = null
    }

    if (getABoxPr) {
      const obj = weakmap.get(getABoxPr)
      if (obj) {
        const { rs } = obj
        rs({
          start: [ startX, startY ],
          end: [ currentX, currentY ]
        })
        startX = null, startY = null, currentX = null, currentY = null
      }
    }

    document.body.style.overflow = placeholderOverflow
    placeholderOverflow = null
    document.body.removeEventListener('mousemove', onMouseMoveEvListener)
  }

  const onMouseDownEvListener = ev => {
    boxEl = document.createElement('div')
    boxEl.pointerEvents = 'none'
    boxEl.style.border = `${BORDER_WIDTH}px ${BACKGROUND_COLOR} solid`
    boxEl.style.position = `absolute`

    startX = ev.clientX
    startY = ev.clientY

    boxEl.style.top = `${startY - BORDER_WIDTH}px`
    boxEl.style.left = `${startX - BORDER_WIDTH}px`

    placeholderOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    document.body.appendChild(boxEl)

    document.body.addEventListener('mousemove', onMouseMoveEvListener)
    document.body.addEventListener('mouseup', onMouseUpEvListener, { once: true })
  }


  const appendBackdrop = (message) => {
        
    const container = document.createElement('div')
    container.style.width = '100%'
    container.style.height = '100%'
    container.style.backgroundColor = BACKGROUND_COLOR
    container.style.position = 'absolute'
    container.style.top = 0
    container.style.left = 0
    container.style.display = 'flex'
    container.style.justifyContent = 'center'
    container.style.alignItems = 'center'

    let appendedRef
    if (typeof message === 'string') {
      appendedRef = document.createElement('span')
      appendedRef.textContent = message
      appendedRef.style.pointerEvents = 'none'
      appendedRef.style.color = 'white'
    } else if (message instanceof HTMLElement) {
      appendedRef = message
    } else {
      throw new Error('message need to be either a string or a dom elment')
    }

    container.appendChild(appendedRef)
    document.body.appendChild(container)

    return {
      container,
      dismiss: () => {
        if (document.body.contains(container)) document.body.removeChild(container)
      }
    }
  }

  const drawbox = {
    dismiss: function (p) {
      const obj = weakmap.get(p)
      if (!obj) throw new Error(`supplied promise does not exist. did you chain it with .then/.catch ?`)
      const { rj } = obj
      rj({ reason: 'dismiss fn' })
    },
    showMessage: function(message = 'Message to be shown') {
      let rs, rj, dismiss
      const pr = new Promise((resolve, reject) => {
        rs = resolve
        rj = reject
        const { dismiss: _d } = appendBackdrop(message)
        dismiss = _d
      })
      pr.then(dismiss).catch(dismiss)
      weakmap.set(pr, { rs, rj })
      return pr
    },
    getABox: function (message = 'Please draw a box') {
      if (getABoxPr) {
        const obj = weakmap.get(getABoxPr)
        if (obj) {
          const { rj } = obj
          rj({
            reason: 'another getABox has started'
          })
        }
      }
      let rs, rj, dismiss
      const pr = new Promise((resolve, reject) => {
        rs = resolve
        rj = reject

        const { dismiss: _d } = appendBackdrop(message)
        dismiss = _d

        document.body.addEventListener('mousedown', dismiss, { once: true })
        document.body.addEventListener('mousedown', onMouseDownEvListener, { once: true })

      })
      pr.then(dismiss).then(() => document.body.removeEventListener('mousedown', onMouseDownEvListener)).catch(dismiss)
      weakmap.set(pr, { rs, rj })
      getABoxPr = pr
      getABoxPr.then(() => {
        if (pr === getABoxPr) getABoxPr = null
      }).catch(() => {
        if (pr === getABoxPr) getABoxPr = null
      })
      return pr
    }
  }
  window.drawbox = drawbox
})()