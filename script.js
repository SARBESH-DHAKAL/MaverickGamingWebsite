/* ============================================================
   MAVERICK GAMING — script.js
   ============================================================ */

/* ---- 1. NAVBAR SCROLL ------------------------------------ */
(function () {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  function onScroll() {
    if (window.scrollY > 30) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load
})();


/* ---- 2. HAMBURGER / MOBILE MENU ------------------------- */
(function () {
  const btn  = document.getElementById('hamburger');
  const menu = document.getElementById('mobileMenu');
  if (!btn || !menu) return;

  btn.addEventListener('click', function () {
    const isOpen = menu.classList.toggle('open');
    btn.setAttribute('aria-expanded', isOpen);
    btn.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  });

  // Close menu when a link inside it is clicked
  menu.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      menu.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-label', 'Open menu');
    });
  });
})();


/* ---- 3. FAQ ACCORDION ------------------------------------ */
(function () {
  const questions = document.querySelectorAll('.faq-question');

  questions.forEach(function (btn) {
    btn.addEventListener('click', function () {
      const isExpanded = btn.getAttribute('aria-expanded') === 'true';
      const answer     = btn.nextElementSibling; // .faq-answer

      if (isExpanded) {
        // Close this one
        btn.setAttribute('aria-expanded', 'false');
        answer.classList.remove('open');
      } else {
        // Close all others first
        questions.forEach(function (other) {
          if (other !== btn) {
            other.setAttribute('aria-expanded', 'false');
            if (other.nextElementSibling) {
              other.nextElementSibling.classList.remove('open');
            }
          }
        });
        // Open this one
        btn.setAttribute('aria-expanded', 'true');
        answer.classList.add('open');
      }
    });
  });
})();


/* ---- 4. CHATBOT WIDGET TOGGLE --------------------------- */
(function () {
  const toggleBtn = document.getElementById('chatbotToggle');
  const closeBtn  = document.getElementById('chatbotClose');
  const box       = document.getElementById('chatbotBox');
  if (!toggleBtn || !box) return;

  toggleBtn.addEventListener('click', function () {
    const isOpen = box.classList.toggle('open');
    toggleBtn.setAttribute('aria-expanded', isOpen);
    if (isOpen) {
      document.getElementById('chatbotInput')?.focus();
    }
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', function () {
      box.classList.remove('open');
      toggleBtn.setAttribute('aria-expanded', 'false');
    });
  }
})();


/* ---- 5. AI CHATBOT — CLAUDE API ------------------------- */
(function () {
  const sendBtn  = document.getElementById('chatbotSend');
  const input    = document.getElementById('chatbotInput');
  const messages = document.getElementById('chatbotMessages');
  if (!sendBtn || !input || !messages) return;

  // Conversation history for context
  const history = [];

  const SYSTEM_PROMPT = `You are the friendly AI assistant for Maverick Gaming, a premium online sweepstakes casino. Keep answers short (2–4 sentences max) and warm. Always point customers to WhatsApp (+1 929-280-7481) for account setup, payments, or anything needing a human agent.

Key facts:
- Games: Juwa, Orion Stars, Game Vault (and others on request)
- Payments: Chime and PayPal only (no Cash App or Zelle)
- Minimum deposit: $20
- Withdrawals: same-day via Chime or PayPal — message your agent on WhatsApp
- Account setup: message WhatsApp, agents create it within minutes
- Hours: daily, agents respond as soon as possible
- Support: WhatsApp at +1 (929) 280-7481

Never make up promotions, odds, or payout percentages. If unsure, direct them to WhatsApp.`;

  function appendMessage(text, role) {
    const div = document.createElement('div');
    div.className = 'chat-msg ' + (role === 'user' ? 'user-msg' : 'bot-msg');
    const p = document.createElement('p');
    p.textContent = text;
    div.appendChild(p);
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
    return div;
  }

  function showTyping() {
    const div = document.createElement('div');
    div.className = 'chat-msg bot-msg typing-indicator';
    div.id = 'typingIndicator';
    div.innerHTML = '<span></span><span></span><span></span>';
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  function removeTyping() {
    const t = document.getElementById('typingIndicator');
    if (t) t.remove();
  }

  async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    input.value = '';
    sendBtn.disabled = true;

    // Show user message
    appendMessage(text, 'user');
    history.push({ role: 'user', content: text });

    showTyping();

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: history
        })
      });

      if (!response.ok) {
        throw new Error('API request failed: ' + response.status);
      }

      const data = await response.json();
      removeTyping();

      const reply = data.content
        .filter(function (b) { return b.type === 'text'; })
        .map(function (b) { return b.text; })
        .join('');

      if (reply) {
        appendMessage(reply, 'bot');
        history.push({ role: 'assistant', content: reply });
      }

    } catch (err) {
      removeTyping();
      console.error('Chatbot error:', err);
      appendMessage(
        "I'm having a little trouble right now. For instant help, please message us on WhatsApp at +1 (929) 280-7481!",
        'bot'
      );
    } finally {
      sendBtn.disabled = false;
      input.focus();
    }
  }

  sendBtn.addEventListener('click', sendMessage);

  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
})();
