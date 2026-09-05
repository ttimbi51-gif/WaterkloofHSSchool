// ── Waterkloof Hills Secondary School – FAQ Chatbot ──

const BOT_NAME  = "Hills Helper";
const SCHOOL    = "Waterkloof Hills Secondary School";
const QUICK_REPLIES = [
  "Admissions",
  "Fees",
  "Subjects",
  "School hours",
  "Contact us"
];

// ─── Knowledge Base ────────────────────────────────────────────────────────
const FAQ = [
  {
    keywords: ["hello","hi","hey","good morning","good afternoon","howzit","hola"],
    answer: `👋 Hello! I'm <strong>${BOT_NAME}</strong>, the ${SCHOOL} virtual assistant. How can I help you today?<br><br>
    You can ask me about:<br>
    • Admissions &amp; fees<br>
    • Subjects offered<br>
    • School hours &amp; term dates<br>
    • Contact &amp; location<br>
    • Extra-curricular activities`
  },
  {
    keywords: ["latest news","news","notice","announcement","important","updates"],
    answer: `📰 <strong>Latest updates</strong><br><br>
    Please check the homepage notices and the school calendar for the newest announcements, deadlines and events.<br><br>
    <a href="index.html" style="color:#f7941d;font-weight:600;">→ Open the homepage</a>`
  },
  {
    keywords: ["admission","apply","enroll","enrol","application","registration","register"],
    answer: `📋 <strong>Admissions at ${SCHOOL}</strong><br><br>
    We accept learners for <strong>Grade 8 – 12</strong>.<br><br>
    <strong>Documents needed:</strong><br>
    • Birth certificate (certified copy)<br>
    • Parent/guardian ID (certified)<br>
    • Previous school report<br>
    • Proof of residence<br>
    • Transfer letter (if from another school)<br>
    • 2 passport photos<br><br>
    Applications open <strong>1 July – 30 September</strong> each year.<br>
    <a href="admissions.html" style="color:#f7941d;font-weight:600;">→ Apply Online Now</a>`
  },
  {
    keywords: ["fee","fees","school fees","cost","pay","payment","amount","price"],
    answer: `💰 <strong>School Fees</strong><br><br>
    For the most up-to-date fee structure, please contact the school directly:<br><br>
    📞 <strong>076 809 0560</strong><br>
    ✉ <strong>admin@waterkloofhillsschool.co.za</strong><br><br>
    Fee exemptions are available for qualifying families — ask the office for the SGB fee exemption form.`
  },
  {
    keywords: ["subject","subjects","what subjects","offered","choose","choices","grade 10","grade 11","grade 12","matric"],
    answer: `📚 <strong>Subjects Offered</strong><br><br>
    <strong>Compulsory (all grades):</strong><br>
    • English Home/First Additional Language<br>
    • Mathematics or Mathematical Literacy<br>
    • Life Orientation<br><br>
    <strong>Electives (Grade 10–12):</strong><br>
    • Physical Sciences • Life Sciences<br>
    • Geography • History<br>
    • Accounting • Business Studies<br>
    • Economics • Tourism<br>
    • Consumer Studies • Agricultural Sciences<br><br>
    <a href="subjects.html" style="color:#f7941d;font-weight:600;">→ View Full Subject List</a>`
  },
  {
    keywords: ["grade 8","grade 9","foundation","junior","intermediate"],
    answer: `📖 <strong>Grade 8 &amp; 9</strong><br><br>
    Our Grade 8 &amp; 9 programme focuses on:<br>
    • Foundation and orientation<br>
    • All CAPS subjects<br>
    • Extra afternoon support classes<br>
    • Learner mentorship programme<br><br>
    Grade 8 intake is our largest — early application is advised!`
  },
  {
    keywords: ["hour","hours","time","open","school time","start","end","open time","close"],
    answer: `🕐 <strong>School Hours</strong><br><br>
    • <strong>Gates open:</strong> 06:30<br>
    • <strong>School starts:</strong> 07:15<br>
    • <strong>School ends:</strong> 14:00<br>
    • <strong>Office hours:</strong> Mon–Fri 07:00 – 15:30<br><br>
    Afternoon extra classes run until <strong>16:00</strong> on selected days.`
  },
  {
    keywords: ["term","term date","holiday","holidays","calendar","vacation","school year","reopen"],
    answer: `📅 <strong>2026 School Term Dates</strong><br><br>
    • <strong>Term 1:</strong> 14 Jan – 27 Mar<br>
    • <strong>Term 2:</strong> 07 Apr – 19 Jun<br>
    • <strong>Term 3:</strong> 14 Jul – 25 Sep<br>
    • <strong>Term 4:</strong> 06 Oct – 04 Dec<br><br>
    <a href="calendar.html" style="color:#f7941d;font-weight:600;">→ View Full School Calendar</a>`
  },
  {
    keywords: ["exam","exams","examination","test","mid year","final","trial"],
    answer: `✍️ <strong>Examinations</strong><br><br>
    • <strong>Mid-year exams:</strong> June (Term 2)<br>
    • <strong>Trial exams (Gr 12):</strong> August (Term 3)<br>
    • <strong>Final exams:</strong> October–November (Term 4)<br><br>
    Timetables are distributed at school and posted on the notice board. Learners must collect timetables from the office.`
  },
  {
    keywords: ["sport","sports","soccer","football","netball","athletics","cricket","team","club"],
    answer: `🏆 <strong>Sports &amp; Co-Curricular</strong><br><br>
    We offer a wide range of activities:<br><br>
    <strong>Sports:</strong><br>
    • Football (boys &amp; girls) • Netball<br>
    • Athletics • Cross country<br><br>
    <strong>Cultural:</strong><br>
    • Drama • Choir • Debates<br>
    • Art Club<br><br>
    <strong>Academic:</strong><br>
    • Mathematics Olympiad<br>
    • Science Expo<br>
    • Spelling Bee`
  },
  {
    keywords: ["uniform","uniform","dress code","clothes","what to wear","school wear"],
    answer: `👔 <strong>School Uniform</strong><br><br>
    <strong>Boys:</strong><br>
    • Navy blue trousers<br>
    • White shirt with school crest<br>
    • Navy blue blazer (Grade 10–12)<br>
    • Black school shoes<br><br>
    <strong>Girls:</strong><br>
    • Navy blue skirt or trousers<br>
    • White blouse with school crest<br>
    • Navy blue blazer (Grade 10–12)<br>
    • Black school shoes<br><br>
    Uniforms are available from the school office.`
  },
  {
    keywords: ["address","location","where","directions","map","find","situated","rustenburg"],
    answer: `📍 <strong>How to Find Us</strong><br><br>
    <strong>${SCHOOL}</strong><br>
    2 Spain Drive<br>
    Waterkloof Ext 5<br>
    Rustenburg, 0299<br><br>
    📞 076 809 0560<br>
    ✉ admin@waterkloofhillsschool.co.za<br><br>
    <a href="index.html#contact" style="color:#f7941d;font-weight:600;">→ Contact Us</a>`
  },
  {
    keywords: ["contact","phone","call","email","reach","number","whatsapp"],
    answer: `📞 <strong>Contact Us</strong><br><br>
    • <strong>Phone:</strong> 076 809 0560<br>
    • <strong>Email:</strong> admin@waterkloofhillsschool.co.za<br>
    • <strong>Office hours:</strong> Mon–Fri 07:00 – 15:30<br><br>
    <a href="index.html#contact" style="color:#f7941d;font-weight:600;">→ Send us a message</a>`
  },
  {
    keywords: ["principal","deputy","teacher","staff","educator","management","who"],
    answer: `👥 <strong>School Management</strong><br><br>
    • <strong>Principal:</strong> Mr. T. Mokoena<br>
    • <strong>Deputy Principal:</strong> Ms. N. Dlamini<br>
    • <strong>HOD Mathematics:</strong> P. Nkwana, T. Mohale, J. Mogale<br><br>
    For staff enquiries contact the office:<br>
    📞 076 809 0560`
  },
  {
    keywords: ["message from principal","principal message","welcome message","principal letter"],
    answer: `📣 <strong>Message from the Principal</strong><br><br>
    Please visit our dedicated school information page to read the full welcome message and vision for the school.<br><br>
    <a href="school-info.html#principal" style="color:#f7941d;font-weight:600;">→ Open Principal’s Message</a>`
  },
  {
    keywords: ["mandate","mission statement","vision statement","values","sasa"],
    answer: `🧭 <strong>School Mandate</strong><br><br>
    The school’s mandate is guided by the South African Schools Act and is built on high standards, holistic development, discipline and equitable access to education.<br><br>
    <a href="school-info.html#mandate" style="color:#f7941d;font-weight:600;">→ Read the Full Mandate</a>`
  },
  {
    keywords: ["code of conduct","school rules","rules","discipline","behaviour","behavior"],
    answer: `📘 <strong>Code of Conduct</strong><br><br>
    The learner code of conduct explains school rules, attendance expectations, cellphone rules, uniform standards and disciplinary procedures.<br><br>
    <a href="school-info.html#conduct" style="color:#f7941d;font-weight:600;">→ View the Code of Conduct</a>`
  },
  {
    keywords: ["uniform rules","school uniform rules","girls uniform","boys uniform","sports uniform","uniform policy"],
    answer: `👔 <strong>School Uniform</strong><br><br>
    We have clear uniform rules for girls, boys and sports wear, and learners are expected to wear the correct uniform neatly and with pride.<br><br>
    <a href="school-info.html#uniform" style="color:#f7941d;font-weight:600;">→ View the Uniform Guide</a>`
  },
  {
    keywords: ["gallery","photo","photos","pictures","images","events"],
    answer: `📸 <strong>School Gallery</strong><br><br>
    View our latest photos from school events, sports days, cultural activities and more!<br><br>
    <a href="gallery.html" style="color:#f7941d;font-weight:600;">→ Visit the Gallery</a>`
  },
  {
    keywords: ["matric","matric results","pass rate","result","nsc","grade 12 results"],
    answer: `🎓 <strong>Matric Results</strong><br><br>
    Waterkloof Hills Secondary School is proud of its learner achievements. Our Grade 12 class works hard throughout the year with the support of dedicated educators and extra classes.<br><br>
    For detailed results enquiries, please contact the office:<br>
    📞 076 809 0560`
  },
  {
    keywords: ["wifi","internet","library","computer","lab","facility","facilities","classroom"],
    answer: `🖥️ <strong>School Facilities</strong><br><br>
    • 32 Smart Classrooms<br>
    • Computer Laboratory<br>
    • School Library<br>
    • Science Laboratory<br>
    • Sports fields<br>
    • Tuck shop / canteen<br>
    • Secure premises with access control`
  },
  {
    keywords: ["thank","thanks","thank you","appreciate","helpful","great","perfect","good"],
    answer: `😊 You're welcome! Is there anything else I can help you with?<br><br>
    Feel free to ask about admissions, subjects, school hours, or anything else about <strong>${SCHOOL}</strong>.`
  },
  {
    keywords: ["bye","goodbye","see you","later","done","exit","close"],
    answer: `👋 Goodbye! Have a wonderful day. Feel free to come back anytime you have questions about <strong>${SCHOOL}</strong>.<br><br>
    <em>Wisdom Is Power!</em>`
  }
];

// Fallback answer
const FALLBACK = `🤔 I'm not sure about that one. Please contact us directly:<br><br>
📞 <strong>076 809 0560</strong><br>
✉ <strong>admin@waterkloofhillsschool.co.za</strong><br>
🕐 Mon–Fri: 07:00 – 15:30<br><br>
Or try asking about: <em>admissions, fees, subjects, school hours, sports, contact details</em>.`;

// ─── Match engine ───────────────────────────────────────────────────────────
function getAnswer(input) {
  const lower = input.toLowerCase().trim();
  if (!lower) {
    return `👋 I’m here to help with admissions, subjects, fees, school hours and contact details. Ask me anything about <strong>${SCHOOL}</strong>.`;
  }

  for (const faq of FAQ) {
    if (faq.keywords.some(k => lower.includes(k))) {
      return faq.answer;
    }
  }

  if (lower.includes("help") || lower.includes("support")) {
    return `💬 I can help with admissions, fees, subjects, school hours, contact details and general school information for <strong>${SCHOOL}</strong>.`;
  }

  if (lower.includes("application") || lower.includes("online")) {
    return `📝 Applications can be submitted through our admissions page. You can also contact the office for guidance if you need help with the documents.`;
  }

  return FALLBACK;
}

// ─── UI ─────────────────────────────────────────────────────────────────────
(function buildChat() {
  // Inject styles
  const style = document.createElement("style");
  style.textContent = `
    #cb-bubble {
      position: fixed;
      bottom: 28px;
      right: 28px;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: #f7941d;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 4px 16px rgba(0,0,0,.25);
      z-index: 9999;
      transition: transform 0.2s;
    }
    #cb-bubble:hover { transform: scale(1.08); }
    #cb-bubble svg { width: 28px; height: 28px; fill: white; }
    #cb-badge {
      position: absolute;
      top: -4px;
      right: -4px;
      background: #e53e3e;
      color: white;
      font-size: 11px;
      font-weight: 700;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Poppins', sans-serif;
    }
    #cb-window {
      position: fixed;
      bottom: 100px;
      right: 28px;
      width: 380px;
      max-width: calc(100vw - 40px);
      height: 500px;
      max-height: calc(100vh - 130px);
      background: white;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,.2);
      display: flex;
      flex-direction: column;
      z-index: 9998;
      overflow: hidden;
      font-family: 'Poppins', sans-serif;
      transform: scale(0.85);
      opacity: 0;
      pointer-events: none;
      transform-origin: bottom right;
      transition: transform 0.25s ease, opacity 0.25s ease;
    }
    #cb-window.open {
      transform: scale(1);
      opacity: 1;
      pointer-events: all;
    }
    #cb-header {
      background: #0c2d5a;
      color: white;
      padding: 14px 16px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    #cb-header-avatar {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: #f7941d;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
    }
    #cb-header-info { flex: 1; }
    #cb-header-info strong { display: block; font-size: 15px; }
    #cb-header-info span { font-size: 12px; color: #a0c4ff; }
    #cb-close-btn {
      background: none;
      border: none;
      color: white;
      font-size: 22px;
      cursor: pointer;
      line-height: 1;
      padding: 0 4px;
    }
    #cb-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      background: #f5f7fa;
    }
    .cb-msg {
      max-width: 90%;
      padding: 10px 14px;
      border-radius: 14px;
      font-size: 13.5px;
      line-height: 1.65;
    }
    .cb-msg.bot {
      background: white;
      color: #222;
      align-self: flex-start;
      border-bottom-left-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,.06);
    }
    .cb-msg.user {
      background: #0c2d5a;
      color: white;
      align-self: flex-end;
      border-bottom-right-radius: 4px;
    }
    .cb-msg a { color: #f7941d; }
    .cb-typing {
      display: flex;
      gap: 5px;
      align-items: center;
      padding: 10px 14px;
      background: white;
      border-radius: 14px;
      border-bottom-left-radius: 4px;
      align-self: flex-start;
      box-shadow: 0 2px 8px rgba(0,0,0,.06);
    }
    .cb-typing span {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #bbb;
      animation: cbBounce 1.2s infinite;
    }
    .cb-typing span:nth-child(2) { animation-delay: 0.2s; }
    .cb-typing span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes cbBounce {
      0%, 80%, 100% { transform: translateY(0); }
      40% { transform: translateY(-6px); background: #f7941d; }
    }
    #cb-quick-replies {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      padding: 8px 16px;
      background: #f5f7fa;
      border-top: 1px solid #e8e8e8;
    }
    .cb-quick {
      background: white;
      border: 1.5px solid #0c2d5a;
      color: #0c2d5a;
      font-size: 12px;
      padding: 6px 12px;
      border-radius: 20px;
      cursor: pointer;
      font-family: 'Poppins', sans-serif;
      transition: all 0.2s;
    }
    .cb-quick:hover {
      background: #0c2d5a;
      color: white;
    }
    #cb-input-area {
      display: flex;
      border-top: 1px solid #eee;
      background: white;
      padding: 10px 12px;
      gap: 8px;
      align-items: center;
    }
    #cb-input {
      flex: 1;
      border: 1.5px solid #ddd;
      border-radius: 22px;
      padding: 9px 15px;
      font-family: 'Poppins', sans-serif;
      font-size: 14px;
      outline: none;
    }
    #cb-input:focus { border-color: #f7941d; }
    #cb-send {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #f7941d;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: background 0.2s;
    }
    #cb-send:hover { background: #d97d10; }
    #cb-send svg { width: 18px; height: 18px; fill: white; }
  `;
  document.head.appendChild(style);

  // Build HTML
  const bubble = document.createElement("div");
  bubble.id = "cb-bubble";
  bubble.setAttribute("role", "button");
  bubble.setAttribute("aria-label", "Open school chatbot");
  bubble.innerHTML = `
    <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>
    <div id="cb-badge">1</div>
  `;

  const devCredit = document.createElement("div");
  devCredit.style.position = "fixed";
  devCredit.style.right = "28px";
  devCredit.style.bottom = "100px";
  devCredit.style.zIndex = "9997";
  devCredit.style.background = "rgba(12,45,90,0.96)";
  devCredit.style.color = "#fff";
  devCredit.style.borderRadius = "12px";
  devCredit.style.padding = "10px 12px";
  devCredit.style.fontSize = "11px";
  devCredit.style.fontFamily = "'Poppins', sans-serif";
  devCredit.style.boxShadow = "0 8px 30px rgba(0,0,0,0.18)";
  devCredit.style.maxWidth = "230px";
  devCredit.style.lineHeight = "1.5";
  devCredit.innerHTML = '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;"><img src="timbi%20logo/07CA41AA-2DFF-49DC-8356-94378EE87466.png" alt="TIMBI OMNI GROUP logo" style="width:32px;height:32px;border-radius:10px;background:rgba(255,255,255,0.08);padding:3px;" /><strong style="font-size:11px; color:#f3d58b;">Developed by TIMBI OMNI GROUP</strong></div><div style="font-size:10px; color:#dfe7ff;">IT specialists</div>';
  document.body.appendChild(devCredit);

  const win = document.createElement("div");
  win.id = "cb-window";
  win.innerHTML = `
    <div id="cb-header">
      <div id="cb-header-avatar">🎓</div>
      <div id="cb-header-info">
        <strong>${BOT_NAME}</strong>
        <span>● Online – ask me anything</span>
      </div>
      <button id="cb-close-btn" aria-label="Close chat">×</button>
    </div>
    <div id="cb-messages"></div>
    <div id="cb-quick-replies">
      <button class="cb-quick" data-q="Admissions">Admissions</button>
      <button class="cb-quick" data-q="School fees">School Fees</button>
      <button class="cb-quick" data-q="School hours">School Hours</button>
      <button class="cb-quick" data-q="Subjects offered">Subjects</button>
      <button class="cb-quick" data-q="Sports and activities">Sports</button>
      <button class="cb-quick" data-q="Contact details">Contact</button>
    </div>
    <div id="cb-input-area">
      <input id="cb-input" type="text" placeholder="Type your question…" autocomplete="off">
      <button id="cb-send" aria-label="Send">
        <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
      </button>
    </div>
  `;

  document.body.appendChild(bubble);
  document.body.appendChild(win);

  const messages  = win.querySelector("#cb-messages");
  const input     = win.querySelector("#cb-input");
  const sendBtn   = win.querySelector("#cb-send");
  const closeBtn  = win.querySelector("#cb-close-btn");
  const badge     = bubble.querySelector("#cb-badge");

  // Open / close
  function toggleChat() {
    win.classList.toggle("open");
    if (win.classList.contains("open")) {
      badge.style.display = "none";
      input.focus();
    }
  }
  bubble.addEventListener("click", toggleChat);
  closeBtn.addEventListener("click", toggleChat);

  // Append message
  function appendMsg(html, who) {
    const d = document.createElement("div");
    d.className = `cb-msg ${who}`;
    d.innerHTML = html;
    messages.appendChild(d);
    messages.scrollTop = messages.scrollHeight;
  }

  // Typing indicator
  function showTyping() {
    const t = document.createElement("div");
    t.className = "cb-typing";
    t.id = "cb-typing";
    t.innerHTML = "<span></span><span></span><span></span>";
    messages.appendChild(t);
    messages.scrollTop = messages.scrollHeight;
  }
  function hideTyping() {
    const t = document.getElementById("cb-typing");
    if (t) t.remove();
  }

  // Send message
  function sendMessage(text) {
    const q = (text || input.value).trim();
    if (!q) return;
    input.value = "";
    appendMsg(q, "user");
    showTyping();
    setTimeout(() => {
      hideTyping();
      appendMsg(getAnswer(q), "bot");
    }, 700 + Math.random() * 400);
  }

  sendBtn.addEventListener("click", () => sendMessage());
  input.addEventListener("keydown", e => { if (e.key === "Enter") sendMessage(); });

  // Quick replies
  win.querySelectorAll(".cb-quick").forEach(btn => {
    btn.addEventListener("click", () => sendMessage(btn.dataset.q));
  });

  // Welcome message on load
  setTimeout(() => {
    appendMsg(`👋 Hi there! I'm <strong>${BOT_NAME}</strong>, your virtual assistant for <strong>${SCHOOL}</strong>.<br><br>
    How can I help you today? You can type a question or tap one of the quick buttons below.`, "bot");
  }, 600);
})();
