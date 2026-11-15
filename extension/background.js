// Aura — Background Service Worker
// Handles API calls to OpenAI to avoid CORS in content scripts

const API_URL = 'https://api.openai.com/v1/chat/completions'

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SUGGEST') {
    handleSuggestion(message.text, message.style)
      .then(result => sendResponse({ success: true, result }))
      .catch(err => sendResponse({ success: false, error: err.message }))
    return true // keep message channel open for async
  }
})

async function handleSuggestion(text, style = 'professional') {
  const { apiKey } = await chrome.storage.sync.get('apiKey')
  if (!apiKey) throw new Error('No API key set. Please configure Aura in the popup.')

  const systemPrompt = `You are Aura, an expert writing assistant. 
Improve the given text for clarity, grammar, and ${style} tone.
Return a JSON object with:
- improved: the improved text
- changes: array of short change descriptions (max 3)
- tone: detected tone of original text`

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text }
      ],
      response_format: { type: 'json_object' },
      max_tokens: 500,
      temperature: 0.3
    })
  })

  if (!response.ok) throw new Error(`API error: ${response.status}`)
  const data = await response.json()
  return JSON.parse(data.choices[0].message.content)
}
