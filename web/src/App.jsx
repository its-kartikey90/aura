import { useMemo, useState } from "react";
import {
  ArrowDownToLine, ArrowRight, Check, ChevronDown, CircleHelp, Clipboard,
  Command, FileText, KeyRound, Lightbulb, LoaderCircle, LockKeyhole,
  MessageSquareText, RefreshCw, Settings2, ShieldCheck, Sparkles, WandSparkles,
  X, Zap
} from "lucide-react";

const TONES = ["Professional", "Friendly", "Academic", "Confident", "Concise", "Persuasive", "Casual"];
const EXAMPLE = "Hey team, I wanted to reach out because I think we should maybe consider moving the deadline a little bit. We have a few things left to finish and I don't want us to rush and miss anything important. Let me know what you think.";

function App() {
  const [view, setView] = useState("home");
  const [text, setText] = useState("");
  const [tone, setTone] = useState("Professional");
  const [result, setResult] = useState(null);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("aura-openai-key") || "");
  const [showKey, setShowKey] = useState(false);
  const [keyDraft, setKeyDraft] = useState(() => localStorage.getItem("aura-openai-key") || "");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("Improve");

  const wordCount = useMemo(() => text.trim() ? text.trim().split(/\s+/).length : 0, [text]);
  const charCount = text.length;

  function saveKey() {
    const value = keyDraft.trim();
    if (value) {
      localStorage.setItem("aura-openai-key", value);
      setApiKey(value);
    } else {
      localStorage.removeItem("aura-openai-key");
      setApiKey("");
    }
    setSettingsOpen(false);
    setError("");
  }

  async function improveText() {
    if (!apiKey) {
      setSettingsOpen(true);
      setError("Add your OpenAI API key to start improving your writing.");
      return;
    }
    if (text.trim().length < 10) {
      setError("Add at least 10 characters so Aura has enough context to help.");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    const modeInstruction = activeTab === "Shorten"
      ? "Make the text substantially more concise while preserving all essential meaning and details."
      : activeTab === "Rewrite"
        ? "Rewrite the text with fresh phrasing and a natural flow while preserving its original meaning and details."
        : "Improve clarity, grammar, flow, and readability while preserving the writer's voice and intent.";
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature: 0.35,
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content: `You are Aura, a thoughtful expert writing editor. ${modeInstruction} Use a ${tone.toLowerCase()} tone. Preserve all original facts and intent; do not invent details. Return only a JSON object with keys: improved (string), changes (array of at most 3 short strings), tone (short description of original tone), and summary (one short sentence describing the overall improvement).`,
            },
            { role: "user", content: text.trim() },
          ],
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        const message = payload?.error?.message || `OpenAI request failed (${response.status}).`;
        throw new Error(message);
      }
      const content = payload?.choices?.[0]?.message?.content;
      if (!content) throw new Error("Aura received an empty response. Please try again.");
      const parsed = JSON.parse(content);
      if (!parsed.improved) throw new Error("Aura could not read the response. Please try again.");
      setResult({
        improved: parsed.improved,
        changes: Array.isArray(parsed.changes) ? parsed.changes.slice(0, 3) : [],
        tone: parsed.tone || "Not detected",
        summary: parsed.summary || "Your writing has been refined.",
      });
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function copyResult() {
    if (!result?.improved) return;
    try {
      await navigator.clipboard.writeText(result.improved);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Clipboard access was blocked by your browser.");
    }
  }

  function useExample() {
    setText(EXAMPLE);
    setResult(null);
    setError("");
  }

  function clearWorkspace() {
    setText("");
    setResult(null);
    setError("");
  }

  return view === "home" ? (
    <div className="marketing-shell">
      <nav className="marketing-nav">
        <a className="brand" href="#" onClick={(e) => e.preventDefault()}><span className="brand-mark"><Sparkles size={19}/></span><span>Aura<span className="brand-period">.</span></span></a>
        <div className="marketing-nav-links"><a href="#features">Features</a><a href="#how-it-works">How it works</a><a href="https://github.com/its-kartikey90/aura" target="_blank" rel="noreferrer">GitHub <ArrowRight size={13}/></a></div>
        <button className="nav-cta" onClick={() => setView("studio")}>Open writing studio <ArrowRight size={15}/></button>
      </nav>
      <main className="marketing-main">
        <section className="marketing-hero">
          <div className="marketing-copy">
            <div className="marketing-kicker"><span/> YOUR THOUGHTS, AT THEIR BEST</div>
            <h1>Write with clarity.<br/><span>Sound like you.</span></h1>
            <p className="marketing-lede">Meet your thoughtful AI writing partner. Refine rough drafts, find the right tone, and turn good ideas into words that work.</p>
            <div className="marketing-actions"><button className="hero-primary" onClick={() => setView("studio")}><Sparkles size={17}/> Try Aura <ArrowRight size={16}/></button><a href="#features" className="hero-secondary">Explore features <ArrowRight size={15}/></a></div>
            <div className="hero-trust"><span><ShieldCheck size={15}/> You control your API key</span><span><LockKeyhole size={14}/> Private by design</span></div>
          </div>
          <div className="hero-preview"><div className="preview-top"><div className="preview-brand"><span><Sparkles size={14}/></span> Aura <small>WRITING STUDIO</small></div><span className="preview-status"><i/> READY TO WRITE</span></div><div className="preview-label">YOUR DRAFT <span>✦</span></div><div className="preview-draft">I wanted to reach out and see if we could possibly move our meeting to another day. Something came up and I want to make sure we have enough time to discuss everything.</div><div className="preview-divider"><span/> AURA REFINEMENT <span/></div><div className="preview-result">Could we reschedule our meeting for another day? Something unexpected came up, and I’d like to ensure we have enough time for a thoughtful discussion.</div><div className="preview-footer"><span><Check size={13}/> Clearer, more confident, still you</span><span className="preview-copy">Copy text <Clipboard size={12}/></span></div><div className="preview-glow"/></div>
        </section>
        <section className="proof-strip"><div><strong>01</strong><span>Write naturally</span></div><div><strong>02</strong><span>Choose your tone</span></div><div><strong>03</strong><span>Keep your voice</span></div><div><strong>04</strong><span>Make every word count</span></div></section>
        <section className="feature-section" id="features"><div className="section-heading"><span className="marketing-kicker">A SMALL TOOL WITH A BIG IMPACT</span><h2>Everything you need to<br/><em>say it better.</em></h2><p>Simple controls. Thoughtful results. No complicated workflow.</p></div><div className="feature-grid"><article className="feature-card"><div className="feature-icon"><WandSparkles size={19}/></div><h3>Improve your writing</h3><p>Fix grammar, sharpen clarity, and smooth out the flow without losing your original intent.</p><span>01 / REFINE</span></article><article className="feature-card"><div className="feature-icon"><RefreshCw size={19}/></div><h3>Find a fresh angle</h3><p>Rewrite your draft with natural phrasing that feels right for the person reading it.</p><span>02 / REWRITE</span></article><article className="feature-card"><div className="feature-icon"><ArrowDownToLine size={19}/></div><h3>Make it concise</h3><p>Remove unnecessary words while keeping the details and meaning that matter.</p><span>03 / SHORTEN</span></article></div></section>
        <section className="how-section" id="how-it-works"><div><span className="marketing-kicker">YOUR WORKFLOW, SIMPLIFIED</span><h2>From first draft<br/>to <em>just right.</em></h2></div><div className="steps-list"><div><b>01</b><span><strong>Bring your words</strong><small>Paste a draft or start with a rough idea.</small></span></div><div><b>02</b><span><strong>Choose how it should sound</strong><small>Pick a tone that fits your audience and purpose.</small></span></div><div><b>03</b><span><strong>Refine and make it yours</strong><small>Review, copy, and keep editing whenever you like.</small></span></div></div></section>
        <section className="final-cta"><div className="cta-spark"><Sparkles size={22}/></div><div><span className="marketing-kicker">READY WHEN YOU ARE</span><h2>Your next great message<br/>starts with a first draft.</h2></div><button className="hero-primary" onClick={() => setView("studio")}>Open Aura <ArrowRight size={16}/></button></section>
      </main>
      <footer className="marketing-footer"><a className="brand" href="#"><span className="brand-mark"><Sparkles size={16}/></span><span>Aura<span className="brand-period">.</span></span></a><span>Thoughtful writing, made simple.</span><span>© 2026 Aura Studio</span></footer>
    </div>
  ) : (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#" aria-label="Aura home" onClick={(e) => { e.preventDefault(); setView("home"); }}>
          <span className="brand-mark"><Sparkles size={19} /></span>
          <span>Aura<span className="brand-period">.</span></span>
        </a>
        <div className="workspace-label">WORKSPACE</div>
        <button className="side-link active" onClick={() => setView("studio")}><WandSparkles size={17} /> Writing studio <span className="side-indicator" /></button>
        <button className="side-link" onClick={() => setSettingsOpen(true)}><Settings2 size={17} /> Preferences</button>
        <div className="sidebar-bottom">
          <div className="privacy-card">
            <div className="privacy-icon"><ShieldCheck size={16} /></div>
            <div><strong>Your words stay yours</strong><p>Text is processed for your request and isn't saved by Aura.</p></div>
          </div>
          <button className="profile-button" onClick={() => setSettingsOpen(true)}>
            <div className="avatar">K</div>
            <div className="profile-copy"><strong>Your workspace</strong><span>Personal plan</span></div>
            <ChevronDown size={15} />
          </button>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumbs"><button className="crumb-home" onClick={() => setView("home")}>Aura</button><span className="crumb-slash">/</span><strong>Writing studio</strong></div>
          <div className="topbar-actions">
            <span className="secure-label"><LockKeyhole size={13} /> Private session</span>
            <button className="icon-button" aria-label="Settings" onClick={() => setSettingsOpen(true)}><Settings2 size={18} /></button>
            <button className="avatar small" aria-label="Open settings" onClick={() => setSettingsOpen(true)}>K</button>
          </div>
        </header>

        <section className="content">
          <div className="page-intro">
            <div>
              <div className="eyebrow"><span className="eyebrow-dot" /> YOUR AI WRITING PARTNER</div>
              <h1>Make every word <span>work better.</span></h1>
              <p>Clearer thoughts. Stronger messages. Your voice, just refined.</p>
            </div>
            <div className="intro-sparkle"><Sparkles size={27} /></div>
          </div>

          <div className="mode-tabs">
            {["Improve", "Rewrite", "Shorten"].map((tab) => (
              <button key={tab} className={activeTab === tab ? "mode-tab selected" : "mode-tab"} onClick={() => { setActiveTab(tab); if (tab === "Shorten") setTone("Concise"); }}>
                {tab === "Improve" ? <WandSparkles size={15} /> : tab === "Rewrite" ? <RefreshCw size={15} /> : <ArrowDownToLine size={15} />}{tab}
              </button>
            ))}
            <div className="tabs-spacer" />
            <span className="model-label"><span className="model-dot" /> GPT-4o mini</span>
          </div>

          <div className="editor-grid">
            <section className="panel editor-panel">
              <div className="panel-heading">
                <div className="panel-title"><div className="panel-icon"><FileText size={16} /></div><div><h2>Your draft</h2><p>Start with what you have. Aura will take it from here.</p></div></div>
                <button className="text-button" onClick={clearWorkspace}>Clear <X size={14} /></button>
              </div>
              <textarea
                value={text}
                onChange={(e) => { setText(e.target.value); setResult(null); setError(""); }}
                placeholder="Write or paste your text here…&#10;&#10;A rough draft is perfectly fine. Aura can help you make it clearer, more confident, and more you."
                maxLength={12000}
                aria-label="Your draft"
              />
              <div className="editor-footer">
                <span>{wordCount} words <span className="muted-separator">·</span> {charCount.toLocaleString()} / 12,000 characters</span>
                <button className="example-button" onClick={useExample}><Lightbulb size={14} /> Try an example</button>
              </div>
              <div className="controls-row">
                <div className="tone-control">
                  <span className="control-label">WRITE IN A</span>
                  <div className="select-wrap">
                    <select value={tone} onChange={(e) => setTone(e.target.value)} aria-label="Writing tone">
                      {TONES.map((item) => <option key={item}>{item}</option>)}
                    </select>
                    <ChevronDown size={14} />
                  </div>
                </div>
                <button className="improve-button" onClick={improveText} disabled={loading || !text.trim()}>
                  {loading ? <><LoaderCircle className="spin" size={17} /> Working on it…</> : <><Sparkles size={16} /> {activeTab === "Shorten" ? "Make it concise" : activeTab === "Rewrite" ? "Rewrite my text" : "Improve writing"} <ArrowRight size={16} /></>}
                </button>
              </div>
              {error && <div className="error-message" role="alert"><CircleHelp size={15} />{error}</div>}
            </section>

            <section className="panel result-panel">
              <div className="panel-heading">
                <div className="panel-title"><div className="panel-icon result-icon"><Sparkles size={16} /></div><div><h2>Aura's refinement</h2><p>Your improved version will appear here.</p></div></div>
                {result && <span className="ready-pill"><Check size={12} /> Ready</span>}
              </div>
              {loading ? (
                <div className="empty-state loading-state"><div className="loading-orbit"><Sparkles size={23} /></div><h3>Finding the right words</h3><p>Aura is refining your draft with care.</p><div className="loading-line"><span /></div></div>
              ) : result ? (
                <div className="result-content">
                  <div className="result-meta"><span>REFINED VERSION</span><span className="tone-detected">Original tone: {result.tone}</span></div>
                  <div className="improved-copy">{result.improved}</div>
                  <div className="result-summary"><Zap size={14} /><span>{result.summary}</span></div>
                  {result.changes.length > 0 && <div className="changes-block"><span className="control-label">WHAT CHANGED</span><ul>{result.changes.map((change, index) => <li key={index}><Check size={13} />{change}</li>)}</ul></div>}
                  <div className="result-actions">
                    <button className="copy-button" onClick={copyResult}>{copied ? <Check size={15} /> : <Clipboard size={15} />}{copied ? "Copied" : "Copy result"}</button>
                    <button className="secondary-button" onClick={() => setText(result.improved)}>Use as draft</button>
                  </div>
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-illustration"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="empty-sparkle"><Sparkles size={25} /></div><span className="float-dot dot-one" /><span className="float-dot dot-two" /></div>
                  <h3>A little clarity goes a long way.</h3>
                  <p>Your refined writing will show up here, ready to copy and share.</p>
                  <div className="empty-tip"><Lightbulb size={14} /><span>Tip: Pick a tone that fits your audience.</span></div>
                </div>
              )}
            </section>
          </div>

          <div className="bottom-note"><ShieldCheck size={14} /><span>Your draft is sent directly to OpenAI using your API key. Aura doesn't store your writing.</span><button onClick={() => setSettingsOpen(true)}>API settings <ArrowRight size={13} /></button></div>
          <footer><span>© 2026 Aura Studio</span><span>Thoughtful writing, made simple.</span><a href="https://github.com/its-kartikey90/aura" target="_blank" rel="noreferrer">Open source <ArrowRight size={12} /></a></footer>
        </section>
      </main>

      {settingsOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setSettingsOpen(false); }}>
          <section className="settings-modal" role="dialog" aria-modal="true" aria-labelledby="settings-title">
            <div className="modal-heading"><div className="modal-icon"><KeyRound size={18} /></div><button className="icon-button" onClick={() => setSettingsOpen(false)} aria-label="Close settings"><X size={18} /></button></div>
            <h2 id="settings-title">Connect your AI</h2>
            <p className="modal-description">Add your OpenAI API key to power Aura's writing suggestions. Your key stays in this browser.</p>
            <label className="input-label" htmlFor="api-key">OPENAI API KEY</label>
            <div className="key-input-wrap"><input id="api-key" type={showKey ? "text" : "password"} value={keyDraft} onChange={(e) => setKeyDraft(e.target.value)} placeholder="sk-…" autoComplete="off" /><button onClick={() => setShowKey(!showKey)}>{showKey ? "Hide" : "Show"}</button></div>
            <div className="key-warning"><LockKeyhole size={14} /><span>Stored in local browser storage. Never commit your key to GitHub or share it publicly.</span></div>
            <button className="save-key-button" onClick={saveKey}>Save API key <ArrowRight size={15} /></button>
            {apiKey && <button className="remove-key-button" onClick={() => { setKeyDraft(""); localStorage.removeItem("aura-openai-key"); setApiKey(""); setSettingsOpen(false); }}>Remove saved key</button>}
            <a className="get-key-link" href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer">Get an API key <ArrowRight size={13} /></a>
          </section>
        </div>
      )}
    </div>
  );
}

export default App;