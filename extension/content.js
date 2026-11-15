// Aura — Content Script
// Injects the Aura suggestion panel next to focused text inputs

let auraPanel = null
let currentElement = null
let debounceTimer = null

function createPanel() {
  if (auraPanel) return
  auraPanel = document.createElement('div')
  auraPanel.id = 'aura-panel'
  auraPanel.setAttribute('aria-label', 'Aura writing suggestions')
  auraPanel.setAttribute('role', 'complementary')
  auraPanel.innerHTML = `
    <div class="aura-header">
      <span class="aura-logo">✨ Aura</span>
      <button class="aura-close" aria-label="Close">×</button>
    </div>
    <div class="aura-content">
      <p class="aura-hint">Select text and press <kbd>Alt+A</kbd> for suggestions</p>
    </div>
  `
  document.body.appendChild(auraPanel)

  auraPanel.querySelector('.aura-close').addEventListener('click', () => {
    auraPanel.style.display = 'none'
  })
}

function positionPanel(el) {
  const rect = el.getBoundingClientRect()
  const scrollY = window.scrollY
  const scrollX = window.scrollX
  auraPanel.style.top = `${rect.bottom + scrollY + 8}px`
  auraPanel.style.left = `${Math.min(rect.left + scrollX, window.innerWidth - 320)}px`
  auraPanel.style.display = 'block'
}

function showLoading() {
  auraPanel.querySelector('.aura-content').innerHTML = `
    <div class="aura-loading">
      <div class="aura-spinner"></div>
      <span>Analysing…</span>
    </div>
  `
}

function showSuggestion(original, result) {
  auraPanel.querySelector('.aura-content').innerHTML = `
    <div class="aura-suggestion">
      <div class="aura-improved">
        <label>Improved</label>
        <p>${result.improved}</p>
      </div>
      <div class="aura-changes">
        ${result.changes?.map(c => `<span class="aura-tag">✓ ${c}</span>`).join('') || ''}
      </div>
      <div class="aura-actions">
        <button class="aura-btn aura-btn-apply">Apply</button>
        <button class="aura-btn aura-btn-dismiss">Dismiss</button>
      </div>
    </div>
  `

  auraPanel.querySelector('.aura-btn-apply').addEventListener('click', () => {
    if (currentElement) {
      if (currentElement.isContentEditable) {
        document.execCommand('insertText', false, result.improved)
      } else {
        const start = currentElement.selectionStart
        const end = currentElement.selectionEnd
        currentElement.value = currentElement.value.slice(0, start) + result.improved + currentElement.value.slice(end)
      }
    }
    auraPanel.style.display = 'none'
  })

  auraPanel.querySelector('.aura-btn-dismiss').addEventListener('click', () => {
    auraPanel.style.display = 'none'
  })
}

function showError(msg) {
  auraPanel.querySelector('.aura-content').innerHTML = `<p class="aura-error">${msg}</p>`
}

async function triggerSuggestion() {
  const selection = window.getSelection()
  const text = selection?.toString().trim()
  if (!text || text.length < 10) return

  createPanel()
  currentElement = document.activeElement
  positionPanel(currentElement)
  showLoading()

  chrome.runtime.sendMessage({ type: 'SUGGEST', text }, (response) => {
    if (chrome.runtime.lastError || !response?.success) {
      showError(response?.error || 'Something went wrong')
    } else {
      showSuggestion(text, response.result)
    }
  })
}

// Keyboard shortcut: Alt+A
document.addEventListener('keydown', (e) => {
  if (e.altKey && e.key === 'a') {
    e.preventDefault()
    triggerSuggestion()
  }
})
