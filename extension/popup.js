const input = document.getElementById('apiKey')
const saveBtn = document.getElementById('save')
const status = document.getElementById('status')

// Load saved key (masked)
chrome.storage.sync.get('apiKey', ({ apiKey }) => {
  if (apiKey) input.placeholder = '••••••••••••' + apiKey.slice(-4)
})

saveBtn.addEventListener('click', () => {
  const key = input.value.trim()
  if (!key) return
  chrome.storage.sync.set({ apiKey: key }, () => {
    status.style.display = 'block'
    input.value = ''
    input.placeholder = '••••••••••••' + key.slice(-4)
    setTimeout(() => { status.style.display = 'none' }, 2000)
  })
})
