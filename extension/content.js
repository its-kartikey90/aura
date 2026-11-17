// Aura — Content Script
// Injects the Aura suggestion panel next to focused text inputs

let auraPanel = null
let currentElement = null

function createPanel() {
  if (auraPanel) return
  auraPanel = document.createElement('div')
  auraPanel.id = 'aura-panel'
  auraPanel.setAttribute('aria-label', 'Aura writing suggestions')
  auraPanel.setAttribute('role', 'complementary')

  const header = document.createElement('div')
  header.className = 'aura-header'
  const logo = document.createElement('span')
  logo.className = 'aura-logo'
  logo.textContent = '✨ Aura'
  const close = document.createElement('button')
  close.className = 'aura-close'
  close.setAttribute('aria-label', 'Close')
  close.textContent = '×'
  close.addEventListener('click', () => { auraPanel.style.display = 'none' })
  header.append(logo, close)

  const content = document.createElement('div')
  content.className = 'aura-content'
  const hint = document.createElement('p')
  hint.className = 'aura-hint'
  hint.append('Select text and press ')
  const shortcut = document.createElement('kbd')
  shortcut.textContent = 'Alt+A'
  hint.append(shortcut, ' for suggestions')
  content.append(hint)

  auraPanel.append(header, content)
  document.body.appendChild(auraPanel)
}

function positionPanel(el) {
  const rect = el.getBoundingClientRect()
  const scrollY = window.scrollY
  const scrollX = window.scrollX
  auraPanel.style.top = `${rect.bottom + scrollY + 8}px`
  auraPanel.style.left = `${Math.max(8, Math.min(rect.left + scrollX, window.innerWidth - 320))}px`
  auraPanel.style.display = 'block'
}

function setPanelContent(node) {
  const content = auraPanel.querySelector('.aura-content')
  content.replaceChildren(node)
}

function showLoading() {
  const loading = document.createElement('div')
  loading.className = 'aura-loading'
  const spinner = document.createElement('div')
  spinner.className = 'aura-spinner'
  const label = document.createElement('span')
  label.textContent = 'Analysing…'
  loading.append(spinner, label)
  setPanelContent(loading)
}

function showSuggestion(original, result) {
  const suggestion = document.createElement('div')
  suggestion.className = 'aura-suggestion'

  const improved = document.createElement('div')
  improved.className = 'aura-improved'
  const label = document.createElement('label')
  label.textContent = 'Improved'
  const paragraph = document.createElement('p')
  paragraph.textContent = String(result?.improved ?? '')
  improved.append(label, paragraph)

  const changes = document.createElement('div')
  changes.className = 'aura-changes'
  const changeList = Array.isArray(result?.changes) ? result.changes : []
  changeList.slice(0, 3).forEach((change) => {
    const tag = document.createElement('span')
    tag.className = 'aura-tag'
    tag.textContent = `✓ ${String(change)}`
    changes.append(tag)
  })

  const actions = document.createElement('div')
  actions.className = 'aura-actions'
  const apply = document.createElement('button')
  apply.className = 'aura-btn aura-btn-apply'
  apply.textContent = 'Apply'
  const dismiss = document.createElement('button')
  dismiss.className = 'aura-btn aura-btn-dismiss'
  dismiss.textContent = 'Dismiss'

  apply.addEventListener('click', () => {
    if (currentElement) {
      if (currentElement.isContentEditable) {
        document.execCommand('insertText', false, paragraph.textContent)
      } else if (typeof currentElement.selectionStart === 'number' && typeof currentElement.selectionEnd === 'number') {
        const start = currentElement.selectionStart
        const end = currentElement.selectionEnd
        currentElement.setRangeText(paragraph.textContent, start, end, 'end')
        currentElement.dispatchEvent(new Event('input', { bubbles: true }))
      }
    }
    auraPanel.style.display = 'none'
  })
  dismiss.addEventListener('click', () => { auraPanel.style.display = 'none' })

  actions.append(apply, dismiss)
  suggestion.append(improved, changes, actions)
  setPanelContent(suggestion)
}

function showError(msg) {
  const error = document.createElement('p')
  error.className = 'aura-error'
  error.textContent = String(msg || 'Something went wrong')
  setPanelContent(error)
}

function triggerSuggestion() {
  const selection = window.getSelection()
  const text = selection?.toString().trim()
  if (!text || text.length < 10) return

  createPanel()
  currentElement = document.activeElement
  if (!currentElement || typeof currentElement.getBoundingClientRect !== 'function') return
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
  if (e.altKey && e.key.toLowerCase() === 'a') {
    e.preventDefault()
    triggerSuggestion()
  }
})
