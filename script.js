// Academic Board Exam Portal - Dynamic App Logic

document.addEventListener('DOMContentLoaded', () => {
  // --- STATE & DATA ---
  const DATA_KEY = "academic_portal_data";
  let appData = JSON.parse(localStorage.getItem(DATA_KEY)) || {
    questions: [],
    history: [],
    plan: { start: '', exam: '' },
    stats: { readDays: 0, readToday: 0, correct: 0, wrong: 0 },
    profile: { name: '', myLevel: '' },
    customLevels: {},
    customSubjects: {}
  };

  // Fallback for older localStorage data
  if (!appData.stats) appData.stats = { readDays: 0, readToday: 0, correct: 0, wrong: 0 };
  if (!appData.history) appData.history = [];
  if (!appData.profile) appData.profile = { name: '', myLevel: '' };
  if (!appData.customLevels) appData.customLevels = {};
  if (!appData.customSubjects) appData.customSubjects = {};
  
  // Update old history dates to indicate they lack time data
  appData.history = appData.history.map(h => {
    if (h.date && !h.date.includes('-') && !h.date.includes('AM') && !h.date.includes('PM') && !h.date.includes('পুরাতন')) {
      h.date = h.date + ' (পুরাতন)';
    }
    return h;
  });
  localStorage.setItem(DATA_KEY, JSON.stringify(appData));

  let levels = {
    "honours_mgt": "অনার্স (ব্যবস্থাপনা)",
    "hsc_humanities": "এইচএসসি (মানবিক)",
    "hsc_science": "এইচএসসি (বিজ্ঞান)",
    "hsc_business": "এইচএসসি (ব্যবসায়)"
  };

  const common_subjects = {
    "bangla_1": "বাংলা ১ম পত্র",
    "bangla_2": "বাংলা ২য় পত্র",
    "english_1": "ইংরেজি ১ম পত্র",
    "english_2": "ইংরেজি ২য় পত্র",
    "ict": "তথ্য ও যোগাযোগ প্রযুক্তি (ICT)"
  };

  let subjects = {
    "honours_mgt": {
      "intro_mgt": "ব্যবস্থাপনার নীতি",
      "principles_mkt": "বাজারজাতকরণ নীতি",
      "fin_acc": "আর্থিক হিসাববিজ্ঞান",
      "bus_law": "ব্যবসায় আইন",
      "org_behavior": "সাংগঠনিক আচরণ",
      "hr_mgt": "মানব সম্পদ ব্যবস্থাপনা"
    },
    "hsc_humanities": { 
      ...common_subjects,
      "eco_1": "অর্থনীতি ১ম পত্র", "eco_2": "অর্থনীতি ২য় পত্র", 
      "civics_1": "পৌরনীতি ও সুশাসন ১ম পত্র", "civics_2": "পৌরনীতি ও সুশাসন ২য় পত্র", 
      "soc_1": "সমাজবিজ্ঞান ১ম পত্র", "soc_2": "সমাজবিজ্ঞান ২য় পত্র", 
      "sw_1": "সমাজকর্ম ১ম পত্র", "sw_2": "সমাজকর্ম ২য় পত্র", 
      "hist_1": "ইতিহাস ১ম পত্র", "hist_2": "ইতিহাস ২য় পত্র", 
      "islamic_hist_1": "ইসলামের ইতিহাস ১ম পত্র", "islamic_hist_2": "ইসলামের ইতিহাস ২য় পত্র", 
      "geo_1": "ভূগোল ১ম পত্র", "geo_2": "ভূগোল ২য় পত্র", 
      "logic_1": "যুক্তিবিদ্যা ১ম পত্র", "logic_2": "যুক্তিবিদ্যা ২য় পত্র", 
      "psychology_1": "মনোবিজ্ঞান ১ম পত্র", "psychology_2": "মনোবিজ্ঞান ২য় পত্র", 
      "islam_1": "ইসলাম শিক্ষা ১ম পত্র", "islam_2": "ইসলাম শিক্ষা ২য় পত্র"
    },
    "hsc_science": { 
      ...common_subjects,
      "phy_1": "পদার্থবিজ্ঞান ১ম পত্র", "phy_2": "পদার্থবিজ্ঞান ২য় পত্র", 
      "chem_1": "রসায়ন ১ম পত্র", "chem_2": "রসায়ন ২য় পত্র", 
      "bio_1": "জীববিজ্ঞান ১ম পত্র", "bio_2": "জীববিজ্ঞান ২য় পত্র", 
      "math_1": "উচ্চতর গণিত ১ম পত্র", "math_2": "উচ্চতর গণিত ২য় পত্র" 
    },
    "hsc_business": { 
      ...common_subjects,
      "acc_1": "হিসাববিজ্ঞান ১ম পত্র", "acc_2": "হিসাববিজ্ঞান ২য় পত্র", 
      "mgt_1": "ব্যবসায় সংগঠন ১ম পত্র", "mgt_2": "ব্যবসায় সংগঠন ২য় পত্র", 
      "fin_1": "ফিন্যান্স ১ম পত্র", "fin_2": "ফিন্যান্স ২য় পত্র", 
      "marketing_1": "উৎপাদন ব্যবস্থাপনা ১ম পত্র", "marketing_2": "উৎপাদন ব্যবস্থাপনা ২য় পত্র" 
    }
  };

  // Merge Custom Data
  Object.assign(levels, appData.customLevels);
  for (const lvl in appData.customSubjects) {
    if (!subjects[lvl]) subjects[lvl] = {};
    Object.assign(subjects[lvl], appData.customSubjects[lvl]);
  }

  function isMatchLevel(qLevel, qSubject, targetLevel) {
    if (common_subjects[qSubject] && qLevel && targetLevel && qLevel.startsWith('hsc_') && targetLevel.startsWith('hsc_')) {
      return true;
    }
    return qLevel === targetLevel;
  }

  function loadDemoData() {
    const demoQuestions = [
      { id: Date.now()+1, level: "hsc_science", subject: "phy_1", type: "study", question: "নিউটনের প্রথম সূত্র কী?", answer: "বাহ্যিক কোনো বল প্রয়োগ না করলে স্থির বস্তু স্থির থাকে এবং গতিশীল বস্তু সুষম বেগে চলতে থাকে।", board: "ঢাকা", year: "2023", isDemo: true },
      { id: Date.now()+2, level: "hsc_science", subject: "chem_1", type: "mcq", question: "পানির রাসায়নিক সংকেত কী?", options: ["H2O", "CO2", "O2", "NaCl"], correct: 0, board: "", year: "", isDemo: true },
      { id: Date.now()+3, level: "hsc_humanities", subject: "hist_1", type: "study", question: "পলাশীর যুদ্ধ কত সালে হয়?", answer: "১৭৫৭ সালে।", board: "", year: "", isDemo: true },
      { id: Date.now()+4, level: "hsc_business", subject: "acc_1", type: "mcq", question: "হিসাববিজ্ঞানের জনক কে?", options: ["লুকা প্যাসিওলি", "অ্যাডাম স্মিথ", "টেইলর", "ফেয়ল"], correct: 0, board: "", year: "", isDemo: true },
      { id: Date.now()+5, level: "hsc_science", subject: "phy_1", type: "mcq", question: "অভিকর্ষজ ত্বরণের মান কত?", options: ["9.8 m/s^2", "10 m/s^2", "8.9 m/s^2", "9.8 km/s^2"], correct: 0, board: "সিলেট", year: "2022", isDemo: true },
      { id: Date.now()+6, level: "honours_mgt", subject: "intro_mgt", type: "study", question: "ব্যবস্থাপনা কাকে বলে?", answer: "অন্যকে দিয়ে কাজ করিয়ে নেওয়ার কৌশলকে ব্যবস্থাপনা বলে।", board: "NU", year: "2021", isDemo: true }
    ];

    if (!appData.questions.some(q => q.isDemo)) {
      appData.questions.push(...demoQuestions);
      appData.history.unshift({ date: getFormattedDateBn(), text: "ডেমো ডেটা লোড করা হয়েছে!" });
      saveData();
      showToast('ডেমো ডেটা সফলভাবে লোড হয়েছে!');
      const levelEl = document.getElementById('courseLevelSelect');
      if (typeof renderSetupSubjects === 'function' && levelEl) renderSetupSubjects(levelEl.value);
      if (typeof renderHistory === 'function') renderHistory();
      if (typeof renderMyQuestionsTabs === 'function') renderMyQuestionsTabs();
    } else {
      showToast('ডেমো ডেটা আগেই লোড করা আছে!');
    }
  }

  function freshAppMode() {
    appData.questions = appData.questions.filter(q => !q.isDemo);
    saveData();
    showToast('ডেমো ডেটা মুছে ফ্রেশ মোড চালু হয়েছে!');
    
    const levelEl = document.getElementById('courseLevelSelect');
    if (typeof renderSetupSubjects === 'function' && levelEl) renderSetupSubjects(levelEl.value);
    if (typeof renderHistory === 'function') renderHistory();
    if (typeof renderMyQuestionsTabs === 'function') renderMyQuestionsTabs();
    
    const myQuestionsModal = document.getElementById('myQuestionsModal');
    if (myQuestionsModal) myQuestionsModal.style.display = 'flex';
  }

  document.getElementById('loadDemoBtn')?.addEventListener('click', loadDemoData);
  document.getElementById('freshAppBtn')?.addEventListener('click', freshAppMode);

  // Insert Demo Data if empty initially
  if (appData.questions.length === 0) {
    loadDemoData();
  }

  function saveData() { localStorage.setItem(DATA_KEY, JSON.stringify(appData)); updateStatsDisplay(); }

  // --- TOAST FUNCTION ---
  function showToast(msg) {
    const toast = document.getElementById('toast');
    if(toast) {
      toast.textContent = msg;
      toast.style.display = 'block';
      setTimeout(() => { toast.style.display = 'none'; }, 3000);
    }
  }

  // --- Date Formatter ---
  function getFormattedDateBn() {
    const d = new Date();
    const days = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
    const dayName = days[d.getDay()];
    
    let h = d.getHours();
    let m = d.getMinutes();
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12;
    
    const toBn = n => String(n).replace(/[0-9]/g, x => '০১২৩৪৫৬৭৮৯'[x]);
    const hStr = toBn(h.toString().padStart(2, '0'));
    const mStr = toBn(m.toString().padStart(2, '0'));
    const dateStr = toBn(d.getDate()) + '/' + toBn(d.getMonth()+1) + '/' + toBn(d.getFullYear());
    
    return `${dateStr} - ${dayName}, ${hStr}:${mStr} ${ampm}`;
  }

  // --- KPI Stats Display ---
  function updateStatsDisplay() {
    const elReadDays = document.getElementById('daysStudiedCount');
    const elReadToday = document.getElementById('todayMcqCount');
    const elCorrect = document.getElementById('todayCorrectCount');
    const elWrong = document.getElementById('todayWrongCount');
    
    // Calculate dynamic distinct read days from history
    const activeDates = new Set();
    appData.history.forEach(h => {
       if (h.date) activeDates.add(h.date.split(' - ')[0]);
    });
    appData.stats.readDays = activeDates.size;

    if(elReadDays) elReadDays.textContent = String(appData.stats.readDays).replace(/[0-9]/g, d=>'০১২৩৪৫৬৭৮৯'[d]);
    if(elReadToday) elReadToday.textContent = String(appData.stats.readToday).replace(/[0-9]/g, d=>'০১২৩৪৫৬৭৮৯'[d]);
    if(elCorrect) elCorrect.textContent = String(appData.stats.correct).replace(/[0-9]/g, d=>'০১২৩৪৫৬৭৮৯'[d]);
    if(elWrong) elWrong.textContent = String(appData.stats.wrong).replace(/[0-9]/g, d=>'০১২৩৪৫৬৭৮৯'[d]);
    
    // Update Data Mode Badge
    const dataBadge = document.getElementById('dataModeBadge');
    if (dataBadge) {
      const isDemo = appData.questions.some(q => q.isDemo);
      if (isDemo) {
        dataBadge.innerHTML = `<i class='bx bx-cloud-download'></i> ডেমো ডেটা`;
        dataBadge.style.background = 'rgba(2, 132, 199, 0.5)'; // Blue tint
        dataBadge.style.borderColor = 'rgba(56, 189, 248, 0.5)';
      } else {
        dataBadge.innerHTML = `<i class='bx bx-server'></i> ফ্রেশ ডেটা (আপনার)`;
        dataBadge.style.background = 'rgba(22, 163, 74, 0.5)'; // Green tint
        dataBadge.style.borderColor = 'rgba(74, 222, 128, 0.5)';
      }
    }
    
    appData.stats.studyAttempts = appData.stats.studyAttempts || 0;
    appData.stats.examAttempts = appData.stats.examAttempts || 0;

    const studyMeta = document.getElementById('studyBtnMeta');
    const examMeta = document.getElementById('examBtnMeta');
    const addMeta = document.getElementById('addBtnMeta');
    const specialMeta = document.getElementById('specialBtnMeta');
    
    const tStudy = appData.questions.filter(q=>q.type==='study').length;
    const tMcq = appData.questions.filter(q=>q.type==='mcq').length;
    const totalQ = appData.questions.length;
    
    const uniqueSubjects = new Set(appData.questions.map(q => q.subject).filter(s => s));
    const totalSubjects = uniqueSubjects.size;

    const toBn = n => String(n).replace(/[0-9]/g, d=>'০১২৩৪৫৬৭৮৯'[d]);

    if (studyMeta) studyMeta.innerHTML = `মোট: ${toBn(tStudy)} টি প্রশ্ন • চেষ্টা: ${toBn(appData.stats.studyAttempts)} বার`;
    if (examMeta) examMeta.innerHTML = `মোট: ${toBn(tMcq)} টি প্রশ্ন • চেষ্টা: ${toBn(appData.stats.examAttempts)} বার`;
    if (specialMeta) specialMeta.innerHTML = `মোট বিষয়: ${toBn(totalSubjects)} টি`;
    if (addMeta) {
      addMeta.innerHTML = `
        <span>মোট: ${toBn(totalQ)} টি</span>
        <span>জ্ঞানমূলক: ${toBn(tStudy)}</span>
        <span>MCQ: ${toBn(tMcq)}</span>
      `;
    }

    // Update Question Count Badge
    const badge = document.getElementById('customCountBadge');
    if (badge) badge.textContent = String(appData.questions.length).replace(/[0-9]/g, d=>'০১২৩৪৫৬৭৮৯'[d]);
  }
  updateStatsDisplay();

  document.getElementById('resetTodayBtn')?.addEventListener('click', () => {
    appData.stats.readToday = 0;
    appData.stats.correct = 0;
    appData.stats.wrong = 0;
    saveData();
    showToast('আজকের হিসাব রিসেট করা হয়েছে!');
  });

  // --- UI Elements ---
  const planModal = document.getElementById('planModal');
  const setupModal = document.getElementById('setupModal');
  const questionModal = document.getElementById('questionModal');

  const fLevel = document.getElementById('fLevel');
  const fSubject = document.getElementById('fSubject');
  const setupLevel = document.getElementById('courseLevelSelect');
  const setupSubjectDash = document.getElementById('dynamicSubjectDashboard');
  
  // Update dropdowns
  function populateDropdowns() {
    const levelSelects = [fLevel, setupLevel, document.getElementById('profileLevelSelect'), document.getElementById('customSubLevelSelect')];
    levelSelects.forEach(sel => {
      if(sel) {
        let oldVal = sel.value;
        sel.innerHTML = '';
        for(let k in levels) sel.innerHTML += `<option value="${k}">${levels[k]}</option>`;
        if(levels[oldVal]) sel.value = oldVal;
      }
    });

    if(fLevel) {
      fLevel.addEventListener('change', () => {
        fSubject.innerHTML = '';
        const subs = subjects[fLevel.value] || {};
        for(let k in subs) fSubject.innerHTML += `<option value="${k}">${subs[k]}</option>`;
      });
      fLevel.dispatchEvent(new Event('change')); // trigger subject load
    }
    if(setupLevel) {
      // re-render subjects if setupLevel value changed due to re-populate
      renderSetupSubjects(setupLevel.value);
    }
  }
  populateDropdowns();

  // --- Theme Toggle Logic ---
  const themeToggleBtn = document.getElementById('themeToggle');
  if (themeToggleBtn) {
    let currentTheme = localStorage.getItem('appTheme') || 'light';
    if(currentTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      themeToggleBtn.innerHTML = "<i class='bx bx-sun'></i>";
    }
    themeToggleBtn.addEventListener('click', () => {
      let th = document.documentElement.getAttribute('data-theme');
      if(th === 'dark') {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('appTheme', 'light');
        themeToggleBtn.innerHTML = "<i class='bx bx-moon'></i>";
      } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('appTheme', 'dark');
        themeToggleBtn.innerHTML = "<i class='bx bx-sun'></i>";
      }
    });
  }

  function renderSetupSubjects(levelKey) {
    if(!setupSubjectDash) return;
    setupSubjectDash.innerHTML = '';
    const subs = subjects[levelKey] || {};
    let first = true;
    const colors = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#eab308', '#6b7280', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];
    let cIdx = 0;
    for(let k in subs) {
      const activeClass = first ? 'active' : '';
      const color = colors[cIdx % colors.length];
      
      let subQs = appData.questions.filter(q => isMatchLevel(q.level, q.subject, levelKey) && q.subject === k);
      let studyC = subQs.filter(q => q.type === 'study').length;
      let mcqC = subQs.filter(q => q.type === 'mcq').length;
      let countText = (studyC === 0 && mcqC === 0) ? `কোনো প্রশ্ন নেই` : `${studyC} জ্ঞানমূলক, ${mcqC} MCQ`;
      
      setupSubjectDash.innerHTML += `<div class="subject-card ${activeClass}" data-subject="${k}">
        <i class='bx bxs-book' style='color:${color}'></i> 
        <div style="flex:1;">
          <div style="font-weight:600; font-size:14px; margin-bottom:2px;">${subs[k]}</div>
          <div style="font-size:11px; opacity:0.8;">${countText}</div>
        </div>
      </div>`;
      first = false; cIdx++;
    }
    
    // Attach click events
    document.querySelectorAll('#dynamicSubjectDashboard .subject-card').forEach(c => {
      c.addEventListener('click', (e) => {
        document.querySelectorAll('#dynamicSubjectDashboard .subject-card').forEach(sc => sc.classList.remove('active'));
        e.currentTarget.classList.add('active');
      });
    });
  }

  if(setupLevel) {
    setupLevel.addEventListener('change', (e) => {
      renderSetupSubjects(e.target.value);
    });
    // init
    renderSetupSubjects(setupLevel.value);
  }

  // --- Add Question Logic ---
  const qTypeRadios = document.querySelectorAll('input[name="qType"]');
  const studyAnsWrap = document.getElementById('studyAnsWrap');
  const mcqOptionsWrap = document.getElementById('mcqOptionsWrap');
  qTypeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      if (e.target.value === 'study') {
        studyAnsWrap.style.display = 'block';
        mcqOptionsWrap.style.display = 'none';
      } else {
        studyAnsWrap.style.display = 'none';
        mcqOptionsWrap.style.display = 'block';
      }
    });
  });

  const questionForm = document.getElementById('questionForm');
  if(questionForm) {
    questionForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const type = document.querySelector('input[name="qType"]:checked').value;
      const qText = document.getElementById('fQuestion').value;
      if(!qText) return alert('প্রশ্ন দিন!');
      
      let newQ = {
        id: Date.now(),
        level: fLevel.value,
        subject: fSubject.value,
        type: type,
        question: qText,
        board: document.getElementById('fBoard').value,
        year: document.getElementById('fYear').value
      };

      if (type === 'study') {
        newQ.answer = document.getElementById('fAnswer').value;
      } else {
        newQ.options = [
          document.getElementById('fOpt0').value,
          document.getElementById('fOpt1').value,
          document.getElementById('fOpt2').value,
          document.getElementById('fOpt3').value
        ];
        newQ.correct = parseInt(document.getElementById('fCorrect').value);
      }
      
      appData.questions.push(newQ);
      saveData();
      showToast('প্রশ্ন সফলভাবে যোগ করা হয়েছে!');
      questionForm.reset();
      questionModal.style.display = 'none';
    });
  }

  // --- Plan Logic ---
  document.getElementById('savePlanBtn')?.addEventListener('click', () => {
    appData.plan.start = document.getElementById('startDateInput').value;
    appData.plan.exam = document.getElementById('examDateInput').value;
    saveData();
    updatePlanDisplay();
    if(planModal) planModal.style.display = 'none';
    showToast('প্ল্যান সেভ হয়েছে!');
  });
  
  function updatePlanDisplay() {
    const cd = document.getElementById('examCountdown');
    const startTxt = document.getElementById('planStartText');
    const examTxt = document.getElementById('planExamText');
    const todayTxt = document.getElementById('planTodayText');
    const fill = document.getElementById('planFill');
    const pctTxt = document.getElementById('planPctText');
    const marker = document.getElementById('planMarker');

    if(appData.plan.exam && appData.plan.start) {
      const start = new Date(appData.plan.start);
      const exam = new Date(appData.plan.exam);
      const today = new Date();
      
      const totalDays = Math.ceil((exam - start) / (1000 * 60 * 60 * 24));
      const passedDays = Math.ceil((today - start) / (1000 * 60 * 60 * 24));
      const leftDays = totalDays - passedDays;
      
      let pct = Math.round((passedDays / totalDays) * 100);
      if (pct < 0) pct = 0;
      if (pct > 100) pct = 100;
      if (isNaN(pct)) pct = 0;
      
      if(startTxt) startTxt.innerHTML = `শুরু: ${start.toLocaleDateString('bn-BD')}`;
      if(examTxt) examTxt.innerHTML = `পরীক্ষা: ${exam.toLocaleDateString('bn-BD')}`;
      if(todayTxt) todayTxt.innerHTML = `আজ`;
      
      if(fill) fill.style.width = pct + '%';
      if(marker) marker.style.left = pct + '%';
      if(pctTxt) pctTxt.innerHTML = `${pct.toString().replace(/[0-9]/g, d=>'০১২৩৪৫৬৭৮৯'[d])}% সম্পন্ন`;
      
      if(cd) {
         if (leftDays > 0) {
            cd.innerHTML = `🎯 পরীক্ষার বাকি <strong>${leftDays.toString().replace(/[0-9]/g, d=>'০১২৩৪৫৬৭৮৯'[d])} দিন</strong> — পরীক্ষা ${appData.plan.exam}`;
         } else if (leftDays === 0) {
            cd.innerHTML = `🎯 আজ পরীক্ষা!`;
         } else {
            cd.innerHTML = `🎯 পরীক্ষা শেষ!`;
         }
      }
    } else {
      if(cd) cd.innerHTML = `🎯 পরীক্ষার তারিখ সেট করুন — কাউন্টডাউন দেখুন`;
      if(fill) fill.style.width = '0%';
      if(marker) marker.style.left = '0%';
      if(pctTxt) pctTxt.innerHTML = `০%`;
      if(startTxt) startTxt.innerHTML = ``;
      if(examTxt) examTxt.innerHTML = ``;
      if(todayTxt) todayTxt.innerHTML = ``;
    }
  }
  updatePlanDisplay();

  // Mode Visual Update
  const modeRadiosInputs = document.querySelectorAll('input[name="appMode"]');
  modeRadiosInputs.forEach(r => {
    r.addEventListener('change', (e) => {
      document.querySelectorAll('.mode-card').forEach(c => c.classList.remove('selected'));
      e.target.closest('.mode-card').classList.add('selected');
    });
  });

  // --- Setup Modal & Action Board ---
  function openSetupModal(mode) {
    if (setupModal) {
      setupModal.style.display = 'flex';
      const radio = document.querySelector(`input[name="appMode"][value="${mode}"]`);
      if (radio) {
        radio.checked = true;
        radio.dispatchEvent(new Event('change'));
      }
    }
  }
  document.getElementById('openPlanSetupBtn')?.addEventListener('click', () => { if(planModal) planModal.style.display = 'flex'; });
  document.getElementById('closePlanModalBtn')?.addEventListener('click', () => { if(planModal) planModal.style.display = 'none'; });

  document.getElementById('openStudyBtn')?.addEventListener('click', () => openSetupModal('study'));
  document.getElementById('emptyStartBtn')?.addEventListener('click', () => openSetupModal('study'));
  document.getElementById('openExamBtn')?.addEventListener('click', () => openSetupModal('exam'));
  document.getElementById('startMonthlyExamBtn')?.addEventListener('click', () => {
    showToast('বিশেষ পরীক্ষা চালু হচ্ছে...');
    openSetupModal('exam');
  });
  
  document.getElementById('closeSetupBtn')?.addEventListener('click', () => { if(setupModal) setupModal.style.display = 'none'; });
  
  // --- My Questions Modal Logic ---
  const myQuestionsModal = document.getElementById('myQuestionsModal');
  const btnManageQuestions = document.getElementById('manageQuestionsBtn');
  const btnCloseMyQuestions = document.getElementById('closeMyQuestionsBtn');
  const myQLevelTabs = document.getElementById('myQuestionsLevelTabs');
  const myQSubTabs = document.getElementById('myQuestionsSubjectTabs');
  const myQList = document.getElementById('myQuestionsList');
  
  let activeLevelTab = null;
  let activeSubTab = null;

  function renderMyQuestionsTabs() {
    const addedLevels = [...new Set(appData.questions.map(q => q.level))];
    if (addedLevels.length === 0) {
      if(myQLevelTabs) myQLevelTabs.innerHTML = '';
      if(myQSubTabs) myQSubTabs.innerHTML = '';
      if(myQList) myQList.innerHTML = '<p style="text-align:center; color:var(--muted); padding:20px;">কোনো প্রশ্ন যোগ করা হয়নি।</p>';
      return;
    }
    
    if(!activeLevelTab || !addedLevels.includes(activeLevelTab)) activeLevelTab = addedLevels[0];
    
    if(myQLevelTabs) {
      myQLevelTabs.innerHTML = addedLevels.map(lvl => {
        const isAct = lvl === activeLevelTab;
        return `<button class="action-btn ${isAct?'':'ghost-btn'}" data-level="${lvl}" style="padding:6px 12px; border-radius:30px; font-size:13px; white-space:nowrap;">${levels[lvl] || lvl}</button>`;
      }).join('');
      
      document.querySelectorAll('#myQuestionsLevelTabs button').forEach(b => b.addEventListener('click', e => {
        activeLevelTab = e.target.dataset.level;
        activeSubTab = null;
        renderMyQuestionsTabs();
      }));
    }

    const lvlQs = appData.questions.filter(q => isMatchLevel(q.level, q.subject, activeLevelTab));
    const addedSubs = [...new Set(lvlQs.map(q => q.subject))];
    if(!activeSubTab || !addedSubs.includes(activeSubTab)) activeSubTab = addedSubs[0];

    if(myQSubTabs) {
      myQSubTabs.innerHTML = addedSubs.map(sub => {
        const isAct = sub === activeSubTab;
        const subName = subjects[activeLevelTab]?.[sub] || sub;
        
        let subQs = appData.questions.filter(q => isMatchLevel(q.level, q.subject, activeLevelTab) && q.subject === sub);
        let studyC = subQs.filter(q => q.type === 'study').length;
        let mcqC = subQs.filter(q => q.type === 'mcq').length;

        return `<button class="action-btn ${isAct?'':'ghost-btn'}" data-sub="${sub}" style="padding:4px 10px; font-size:12px; border-radius:6px; min-height:auto;">${subName} (${studyC} জ্ঞান., ${mcqC} MCQ)</button>`;
      }).join('');

      document.querySelectorAll('#myQuestionsSubjectTabs button').forEach(b => b.addEventListener('click', e => {
        activeSubTab = e.target.dataset.sub;
        renderMyQuestionsTabs();
      }));
    }

    if(myQList) {
      const finalQs = appData.questions.filter(q => isMatchLevel(q.level, q.subject, activeLevelTab) && q.subject === activeSubTab);
      myQList.innerHTML = finalQs.map(q => {
        let badge = q.type === 'study' ? `<span style="background:#e0e7ff; color:#3730a3; font-size:11px; padding:2px 6px; border-radius:4px;">জ্ঞানমূলক</span>` : `<span style="background:#fce7f3; color:#be185d; font-size:11px; padding:2px 6px; border-radius:4px;">MCQ</span>`;
        let ansHtml = q.type === 'study' 
          ? `<p style="font-size:13px; color:var(--text); background:rgba(0,0,0,0.03); padding:8px; border-radius:4px; margin-top:8px;"><strong>উত্তর:</strong> ${q.answer}</p>` 
          : `<p style="font-size:13px; color:var(--text); background:rgba(0,0,0,0.03); padding:8px; border-radius:4px; margin-top:8px;"><strong>অপশন:</strong> ${q.options.join(', ')} <br><strong style="color:var(--correct); display:inline-block; margin-top:4px;">সঠিক: ${q.options[q.correct]}</strong></p>`;
        return `<div style="background:var(--card); padding:14px; border:1px solid var(--line); border-radius:8px; margin-bottom:4px; position:relative;">
          <div style="display:flex; justify-content:space-between; margin-bottom:8px; padding-right:35px;">${badge} <small style="color:var(--muted)">${q.board||''} ${q.year||''}</small></div>
          <div style="font-weight:500; font-size:15px; color:var(--primary-dark); padding-right:35px;">${q.question}</div>
          ${ansHtml}
          <button class="action-btn ghost-btn delete-q-btn" data-id="${q.id}" style="position:absolute; top:10px; right:10px; color:var(--wrong); padding:4px 8px; border-radius:4px;"><i class='bx bx-trash'></i></button>
        </div>`;
      }).join('');
      
      // Delete button listener
      document.querySelectorAll('.delete-q-btn').forEach(btn => btn.addEventListener('click', (e) => {
        const idToDelete = parseInt(e.currentTarget.dataset.id);
        const delModal = document.getElementById('deleteConfirmModal');
        if(delModal) {
          delModal.style.display = 'flex';
          const confirmBtn = document.getElementById('confirmDeleteBtn');
          // replace node to remove old listeners
          const newConfirmBtn = confirmBtn.cloneNode(true);
          confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
          
          newConfirmBtn.addEventListener('click', () => {
            appData.questions = appData.questions.filter(q => q.id !== idToDelete);
            saveData();
            renderMyQuestionsTabs();
            delModal.style.display = 'none';
            showToast('প্রশ্ন মুছে ফেলা হয়েছে!');
          });
          
          document.getElementById('cancelDeleteBtn').onclick = () => delModal.style.display = 'none';
        }
      }));
    }
  }

  if (btnManageQuestions) btnManageQuestions.addEventListener('click', () => {
    renderMyQuestionsTabs();
    if(myQuestionsModal) myQuestionsModal.style.display = 'flex';
  });
  if (btnCloseMyQuestions) btnCloseMyQuestions.addEventListener('click', () => {
    if(myQuestionsModal) myQuestionsModal.style.display = 'none';
  });

  document.getElementById('addQuestionBtn')?.addEventListener('click', () => { if (questionModal) questionModal.style.display = 'flex'; });
  document.getElementById('closeModalBtn')?.addEventListener('click', () => { if (questionModal) questionModal.style.display = 'none'; });
  document.getElementById('cancelModalBtn')?.addEventListener('click', () => { if (questionModal) questionModal.style.display = 'none'; });

  // --- Exam Execution Simulator ---
  let activeExamQuestions = [];
  let currentExamIndex = 0;
  let activeExamMode = '';
  let sessionCorrect = 0;
  let sessionWrong = 0;
  let currentExamMeta = null;
  let sessionStartTime = 0;
  
  function renderExamQuestion() {
    if (currentExamIndex >= activeExamQuestions.length) {
      let timeTaken = Math.floor((Date.now() - sessionStartTime) / 1000);
      let mins = Math.floor(timeTaken / 60);
      let secs = timeTaken % 60;
      let timeStr = `${toBnNumber(mins)} মিনিট ${toBnNumber(secs)} সেকেন্ড`;
      
      if (activeExamMode === 'mcq') {
         appData.history.unshift({ date: getFormattedDateBn(), text: `<strong>${currentExamMeta.levelName} - ${currentExamMeta.subjectName}</strong><br>পরীক্ষা সম্পন্ন: ${sessionCorrect} সঠিক, ${sessionWrong} ভুল <br><small style="color:var(--muted);"><i class='bx bx-time'></i> মোট সময়: ${timeStr}</small>` });
         
         if (currentExamMeta) {
           appData.examHistory = appData.examHistory || [];
           appData.examHistory.unshift({
             id: Date.now(),
             date: getFormattedDateBn(),
             levelName: currentExamMeta.levelName,
             subjectName: currentExamMeta.subjectName,
             total: sessionCorrect + sessionWrong,
             correct: sessionCorrect,
             wrong: sessionWrong,
             timeStr: timeStr
           });
         }
         
         saveData();
         renderHistory();
      } else if (activeExamMode === 'study') {
         appData.history.unshift({ date: getFormattedDateBn(), text: `<strong>${currentExamMeta.levelName} - ${currentExamMeta.subjectName}</strong><br>পড়া সম্পন্ন <br><small style="color:var(--muted);"><i class='bx bx-time'></i> মোট সময়: ${timeStr}</small>` });
         saveData();
         renderHistory();
      }
      
      if (isRunning) togglePomo();
      
      document.querySelector('.empty-state').innerHTML = `<div style="text-align:center; padding:30px;"><h2 style="color:var(--primary); margin-bottom:10px;">🎉 সেশন শেষ!</h2><p>আপনি সব প্রশ্ন সম্পন্ন করেছেন।</p><p style="color:var(--muted); margin-top:5px;"><i class='bx bx-time'></i> সময় লেগেছে: ${timeStr}</p><button id="demoNextBtn" class="action-btn" style="margin-top:20px;">ড্যাশবোর্ডে ফিরে যান</button></div>`;
      document.getElementById('demoNextBtn')?.addEventListener('click', () => document.getElementById('stopResetBtn').click());
      return;
    }
    
    let currentQ = activeExamQuestions[currentExamIndex];
    let headerHtml = `<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; border-bottom:1px solid #eee; padding-bottom:10px;"><h3 style="color:var(--text); margin:0;">প্রশ্ন ${currentExamIndex + 1} / ${activeExamQuestions.length}</h3></div>`;
    
    if(activeExamMode === 'study') {
      document.querySelector('.empty-state').innerHTML = `
        <div style="background:#fff; padding:25px; border-radius:12px; box-shadow:0 4px 6px rgba(0,0,0,0.05); text-align:left;">
           ${headerHtml}
           <h4 style="color:var(--primary-dark); font-size:18px; margin-bottom:15px; line-height:1.4;">${currentQ.question}</h4>
           <button id="showAnsBtn" class="action-btn outline-btn" style="margin-bottom:12px;"><i class='bx bx-show'></i> উত্তর দেখুন</button>
           <div id="ansText" style="display:none; color:var(--text); font-size:15px; font-weight:500; padding:15px; background:var(--bg); border-radius:8px; line-height:1.5;">${currentQ.answer}</div>
           <div style="margin-top:25px; text-align:right;"><button id="demoNextBtn" class="action-btn" style="display:none;">পরবর্তী প্রশ্ন <i class='bx bx-right-arrow-alt'></i></button></div>
        </div>
      `;
      document.getElementById('showAnsBtn').addEventListener('click', (e) => {
        document.getElementById('ansText').style.display = 'block';
        e.target.style.display = 'none';
        appData.stats.readToday += 1;
        saveData();
        document.getElementById('demoNextBtn').style.display = 'inline-block';
      });
    } else {
      let opts = currentQ.options.map((opt, i) => `<label class="mcq-opt-label" style="display:block; margin:8px 0; padding:12px 15px; background:#f9fafb; border:2px solid #e5e7eb; border-radius:8px; cursor:pointer; font-weight:500; transition:all 0.2s;"><input type="radio" name="mcqAns" value="${i}" style="margin-right:10px; transform:scale(1.2);"> ${opt}</label>`).join('');
      document.querySelector('.empty-state').innerHTML = `
        <div style="background:#fff; padding:25px; border-radius:12px; box-shadow:0 4px 6px rgba(0,0,0,0.05); text-align:left;">
           ${headerHtml}
           <h4 style="color:var(--primary-dark); font-size:18px; margin-bottom:15px; line-height:1.4;">${currentQ.question}</h4>
           <div id="mcqOptionsWrapSim">${opts}</div>
           <div id="mcqRes" style="display:none; font-weight:bold; font-size:16px; margin-top:15px; padding:10px; border-radius:6px; text-align:center;"></div>
           <div style="margin-top:25px; display:flex; justify-content:flex-end; gap:10px;">
             <button id="checkAnsBtn" class="action-btn">উত্তর সাবমিট করুন</button> 
             <button id="demoNextBtn" class="action-btn ghost-btn" style="display:none;">পরবর্তী <i class='bx bx-right-arrow-alt'></i></button>
           </div>
        </div>
      `;
      
      // Styling interaction for MCQ labels
      document.querySelectorAll('.mcq-opt-label input').forEach(inp => {
        inp.addEventListener('change', () => {
          document.querySelectorAll('.mcq-opt-label').forEach(l => l.style.borderColor = '#e5e7eb');
          inp.closest('label').style.borderColor = 'var(--primary)';
        });
      });
      
      document.getElementById('checkAnsBtn').addEventListener('click', (e) => {
        let sel = document.querySelector('input[name="mcqAns"]:checked');
        if(!sel) return showToast('একটি অপশন নির্বাচন করুন!');
        let val = parseInt(sel.value);
        let res = document.getElementById('mcqRes');
        document.querySelectorAll('input[name="mcqAns"]').forEach(inp => inp.disabled = true);
        
        if(val === currentQ.correct) {
          res.style.color = 'var(--correct)'; res.style.background = '#dcfce7'; res.innerHTML = '<i class="bx bx-check-circle"></i> সঠিক উত্তর! 🎉'; res.style.display = 'block';
          appData.stats.correct += 1;
          sessionCorrect++;
        } else {
          res.style.color = 'var(--wrong)'; res.style.background = '#fee2e2'; res.innerHTML = '<i class="bx bx-x-circle"></i> ভুল উত্তর! সঠিকটি ছিল: ' + currentQ.options[currentQ.correct]; res.style.display = 'block';
          appData.stats.wrong += 1;
          sessionWrong++;
        }
        saveData();
        e.target.style.display = 'none';
        document.getElementById('demoNextBtn').style.display = 'inline-block';
      });
    }
    
    document.getElementById('demoNextBtn')?.addEventListener('click', () => {
      currentExamIndex++;
      renderExamQuestion();
    });
  }

  // --- Dynamic Count Chips Logic ---
  const countChips = document.querySelectorAll('.count-chips button');
  const questionCountInput = document.getElementById('questionCount');
  
  if (countChips.length > 0 && questionCountInput) {
    countChips.forEach(btn => {
      btn.addEventListener('click', (e) => {
        countChips.forEach(c => c.classList.remove('on'));
        btn.classList.add('on');
        questionCountInput.value = btn.dataset.count;
      });
    });

    questionCountInput.addEventListener('input', (e) => {
      const val = e.target.value;
      countChips.forEach(c => c.classList.remove('on'));
      const matched = Array.from(countChips).find(c => c.dataset.count === val);
      if(matched) matched.classList.add('on');
    });
  }

  // Session seen questions to prevent repeats
  let sessionSeenIds = [];
  let currentExamSetupKey = "";

  function startExamOrNextSet(isNextSet = false) {
    const mode = document.querySelector('input[name="appMode"]:checked').value;
    const qType = mode === 'exam' ? 'mcq' : 'study';
    const count = parseInt(document.getElementById('questionCount').value) || 10;
    const levelKey = setupLevel.value;
    const subjectEl = document.querySelector('#dynamicSubjectDashboard .subject-card.active');
    const subjectKey = subjectEl ? subjectEl.dataset.subject : "";
    const subjectName = subjectEl ? subjectEl.innerText.split('\n')[0].trim() : "সকল বিষয়";
    
    // Maintain set cycles
    const setupKey = `${levelKey}_${subjectKey}_${qType}`;
    if (!isNextSet || currentExamSetupKey !== setupKey) {
        sessionSeenIds = [];
        currentExamSetupKey = setupKey;
    }

    // Fetch relevant questions
    let filtered = appData.questions.filter(q => isMatchLevel(q.level, q.subject, levelKey) && q.subject === subjectKey && q.type === qType);
    if(filtered.length === 0) {
       filtered = appData.questions.filter(q => q.type === qType && isMatchLevel(q.level, q.subject, levelKey));
    }
    
    if(filtered.length === 0) {
      showToast(`এই লেভেলে কোনো ${qType === 'study'?'জ্ঞানমূলক':'MCQ'} প্রশ্ন নেই! দয়া করে প্রশ্ন যোগ করুন।`);
      return;
    }

    // Filter unseen
    let unseen = filtered.filter(q => !sessionSeenIds.includes(q.id));
    if (unseen.length === 0) {
        showToast("সব প্রশ্ন পড়া শেষ! নতুন সাইকেল শুরু হচ্ছে...");
        sessionSeenIds = [];
        unseen = filtered;
    }
    
    if (!isNextSet) {
       sessionCorrect = 0;
       sessionWrong = 0;
       sessionStartTime = Date.now();
       if (!isRunning) togglePomo(); // auto-start pomodoro
       if (qType === 'study') {
         appData.stats.studyAttempts++;
       } else {
         appData.stats.examAttempts++;
       }
       let lvlName = levels[levelKey] || "সকল শ্রেনি";
       currentExamMeta = { levelName: lvlName, subjectName: subjectName };
    }

    // Add to history
    let act = qType === 'study' ? 'পড়া শুরু' : 'পরীক্ষা শুরু';
    appData.history.unshift({ date: getFormattedDateBn(), text: `${subjectName}: ${act} (${Math.min(count, unseen.length)} প্রশ্ন)` });
    appData.stats.readDays += 1;
    saveData();
    renderHistory();
    
    if(setupModal) setupModal.style.display = 'none';
    showToast(`${qType === 'study' ? 'পড়ার মোড' : 'পরীক্ষা মোড'} শুরু হলো!`);
    
    // Update Badge
    const badgeEl = document.getElementById('currentModeBadge');
    if (badgeEl) {
      if (qType === 'study') {
        badgeEl.innerHTML = `<i class='bx bx-book-reader'></i> পড়ার মোড`;
        badgeEl.style.background = 'rgba(255,255,255,0.3)';
        badgeEl.style.borderColor = '#fff';
      } else {
        badgeEl.innerHTML = `<i class='bx bx-edit'></i> পরীক্ষা মোড`;
        badgeEl.style.background = 'var(--wrong)';
        badgeEl.style.borderColor = 'var(--wrong)';
      }
    }

    // Show and Auto-Start Pomodoro
    const p = document.getElementById('pomodoroTimer');
    if(p) p.style.display = 'flex';
    if (!isRunning) togglePomo();

    // Navigate to Question Container
    const fView = document.querySelector('.first-view');
    const qCont = document.getElementById('questionContainer');
    if(fView) fView.style.display = 'none';
    if(qCont) qCont.style.display = 'block';
    
    // Setup Questions Array
    unseen = unseen.sort(() => 0.5 - Math.random());
    activeExamQuestions = unseen.slice(0, count);
    activeExamQuestions.forEach(q => sessionSeenIds.push(q.id));
    
    currentExamIndex = 0;
    activeExamMode = qType;
    renderExamQuestion();
  }

  document.getElementById('startExamBtn')?.addEventListener('click', () => startExamOrNextSet(false));
  document.getElementById('nextQuestionSetBtn')?.addEventListener('click', () => startExamOrNextSet(true));
  
  // Navigation Back (Reset View)
  document.getElementById('stopResetBtn')?.addEventListener('click', () => {
    const fView = document.querySelector('.first-view');
    const qCont = document.getElementById('questionContainer');
    if(qCont) qCont.style.display = 'none';
    if(fView) fView.style.display = 'grid'; // .first-view is a grid
    
    // Reset Badge
    const badgeEl = document.getElementById('currentModeBadge');
    if (badgeEl) {
      badgeEl.innerHTML = `<i class='bx bx-home'></i> হোম ভিউ`;
      badgeEl.style.background = 'rgba(255,255,255,0.2)';
      badgeEl.style.borderColor = 'rgba(255,255,255,0.3)';
    }
    showToast('হোমপেজে ফিরে এসেছেন');
  });

  // --- Render History ---
  function renderHistory() {
    const board = document.getElementById('historyBoard');
    if(!board) return;
    if(appData.history.length === 0) {
      board.innerHTML = `<div class="empty-history"><p>এখনো রেকর্ড নেই — প্রশ্ন পড়ুন বা পরীক্ষা দিন।</p></div>`;
      return;
    }
    board.innerHTML = '';
    appData.history.forEach(h => {
      board.innerHTML += `<div class="history-item" style="padding:10px; border-bottom:1px solid var(--line);">
        <small style="color:var(--muted)">📅 ${h.date}</small>
        <p style="margin:4px 0 0; font-weight:500;">${h.text}</p>
      </div>`;
    });
  }
  renderHistory();
  document.getElementById('clearHistoryBtn')?.addEventListener('click', () => {
    if(confirm('সব রেকর্ড মুছতে চান?')) {
      appData.history = []; saveData(); renderHistory();
    }
  });

  // --- Pomodoro Timer Logic ---
  const pomoTime = document.getElementById('pomoTime');
  const pomoTimeHero = document.getElementById('pomoTimeHero');
  const pomoToggleBtn = document.getElementById('pomoToggleBtn');
  const pomoToggleBtnHero = document.getElementById('pomoToggleBtnHero');

  let timerInterval; let isRunning = false; let timeLeft = 25 * 60;

  function updatePomoDisplay() {
    const min = Math.floor(timeLeft / 60); const sec = timeLeft % 60;
    const ts = `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    if(pomoTime) pomoTime.textContent = ts;
    if(pomoTimeHero) pomoTimeHero.textContent = ts;
  }

  function togglePomo() {
    if (isRunning) {
      clearInterval(timerInterval); isRunning = false;
      if(pomoToggleBtn) pomoToggleBtn.innerHTML = "<i class='bx bx-play'></i>";
      if(pomoToggleBtnHero) pomoToggleBtnHero.innerHTML = "<i class='bx bx-play'></i>";
    } else {
      isRunning = true;
      if(pomoToggleBtn) pomoToggleBtn.innerHTML = "<i class='bx bx-pause'></i>";
      if(pomoToggleBtnHero) pomoToggleBtnHero.innerHTML = "<i class='bx bx-pause'></i>";
      timerInterval = setInterval(() => {
        if (timeLeft > 0) { timeLeft--; updatePomoDisplay(); } 
        else {
          clearInterval(timerInterval); isRunning = false;
          if(pomoToggleBtn) pomoToggleBtn.innerHTML = "<i class='bx bx-play'></i>";
          if(pomoToggleBtnHero) pomoToggleBtnHero.innerHTML = "<i class='bx bx-play'></i>";
          showToast("প্রোমোডোরো সেশন শেষ! বিশ্রাম নিন।"); timeLeft = 25 * 60; updatePomoDisplay();
        }
      }, 1000);
    }
  }
  if(pomoToggleBtn) pomoToggleBtn.addEventListener('click', togglePomo);
  if(pomoToggleBtnHero) pomoToggleBtnHero.addEventListener('click', togglePomo);

  // --- Dynamic Calendar Generator ---
  const calendarGrid = document.getElementById('calendarGrid');
  if (calendarGrid) {
    calendarGrid.innerHTML = '';
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const today = now.getDate();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const activeDates = new Set();
    appData.history.forEach(h => {
       if (h.date) {
           const dPart = h.date.split(' - ')[0];
           activeDates.add(dPart);
       }
    });

    const toBn = n => String(n).replace(/[0-9]/g, d => '০১২৩৪৫৬৭৮৯'[d]);
    
    for (let i = 1; i <= daysInMonth; i++) {
      const dayStr = toBn(i) + '/' + toBn(month+1) + '/' + toBn(year);
      const dayStrPad = toBn(i.toString().padStart(2, '0')) + '/' + toBn((month+1).toString().padStart(2, '0')) + '/' + toBn(year);
      
      const isActive = activeDates.has(dayStr) || activeDates.has(dayStrPad) || activeDates.has(dayStrPad + " (পুরাতন)");
      const isToday = (i === today);
      
      const day = document.createElement('div');
      day.className = 'cal-day' + (isToday ? ' is-today' : '') + (isActive ? ' active-day' : '');
      day.textContent = toBn(i);
      calendarGrid.appendChild(day);
    }
  }

  // --- Result History Modal Logic ---
  const viewResultsBtn = document.getElementById('viewResultsBtn');
  const resultHistoryModal = document.getElementById('resultHistoryModal');
  const closeResultHistoryBtn = document.getElementById('closeResultHistoryBtn');
  const resultSummaryStats = document.getElementById('resultSummaryStats');
  const resultHistoryList = document.getElementById('resultHistoryList');

  function toBnNumber(n) {
    return String(n).replace(/[0-9]/g, d => '০১২৩৪৫৬৭৮৯'[d]);
  }

  function renderResultHistory() {
    if (!appData.examHistory || appData.examHistory.length === 0) {
      resultSummaryStats.innerHTML = `<p style="color:var(--muted); text-align:center; width:100%;">এখনো কোনো পরীক্ষার রেকর্ড নেই।</p>`;
      resultHistoryList.innerHTML = '';
      return;
    }

    let totalExams = appData.examHistory.length;
    let totalQs = appData.examHistory.reduce((sum, e) => sum + e.total, 0);
    let totalCor = appData.examHistory.reduce((sum, e) => sum + e.correct, 0);
    let avgAcc = totalQs > 0 ? Math.round((totalCor / totalQs) * 100) : 0;

    resultSummaryStats.innerHTML = `
      <div style="flex:1; text-align:center;"><div style="font-size:20px; font-weight:bold; color:var(--primary);">${toBnNumber(totalExams)}</div><div style="font-size:12px; color:var(--muted);">মোট পরীক্ষা</div></div>
      <div style="flex:1; text-align:center;"><div style="font-size:20px; font-weight:bold; color:var(--text);">${toBnNumber(totalQs)}</div><div style="font-size:12px; color:var(--muted);">মোট প্রশ্ন</div></div>
      <div style="flex:1; text-align:center;"><div style="font-size:20px; font-weight:bold; color:var(--correct);">${toBnNumber(avgAcc)}%</div><div style="font-size:12px; color:var(--muted);">গড় সঠিকতা</div></div>
    `;

    resultHistoryList.innerHTML = appData.examHistory.map(e => {
      let pct = e.total > 0 ? Math.round((e.correct / e.total) * 100) : 0;
      let clr = pct >= 80 ? 'var(--correct)' : (pct >= 50 ? '#f59e0b' : 'var(--wrong)');
      return `
        <div style="background:var(--card); padding:15px; border-radius:8px; border:1px solid var(--line); display:flex; justify-content:space-between; align-items:center;">
          <div>
            <div style="font-size:14px; font-weight:bold; color:var(--text); margin-bottom:4px;">${e.subjectName}</div>
            <div style="font-size:12px; color:var(--muted);"><i class='bx bxs-graduation'></i> ${e.levelName} &nbsp;|&nbsp; <i class='bx bx-calendar'></i> ${e.date} &nbsp;|&nbsp; <i class='bx bx-time'></i> ${e.timeStr || "জানা নেই"}</div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:18px; font-weight:bold; color:${clr};">${toBnNumber(pct)}%</div>
            <div style="font-size:11px; color:var(--muted);">${toBnNumber(e.correct)} সঠিক, ${toBnNumber(e.wrong)} ভুল</div>
          </div>
        </div>
      `;
    }).join('');
  }

  if(viewResultsBtn) {
    viewResultsBtn.addEventListener('click', () => {
      renderResultHistory();
      if (resultHistoryModal) resultHistoryModal.style.display = 'flex';
    });
  }
  if(closeResultHistoryBtn) {
    closeResultHistoryBtn.addEventListener('click', () => {
      if (resultHistoryModal) resultHistoryModal.style.display = 'none';
    });
  }
  if(resultHistoryModal) {
    resultHistoryModal.addEventListener('click', (e) => {
      if (e.target === resultHistoryModal) resultHistoryModal.style.display = 'none';
    });
  }

  // --- Factory Reset Logic ---
  const factoryResetBtn = document.getElementById('factoryResetBtn');
  const factoryResetModal = document.getElementById('factoryResetModal');
  const cancelFactoryResetBtn = document.getElementById('cancelFactoryResetBtn');
  const confirmFactoryResetBtn = document.getElementById('confirmFactoryResetBtn');
  const factoryResetInput = document.getElementById('factoryResetInput');

  if(factoryResetBtn) {
    factoryResetBtn.addEventListener('click', () => {
      factoryResetInput.value = '';
      confirmFactoryResetBtn.style.opacity = '0.5';
      confirmFactoryResetBtn.style.pointerEvents = 'none';
      if(factoryResetModal) factoryResetModal.style.display = 'flex';
    });
  }

  if(cancelFactoryResetBtn) {
    cancelFactoryResetBtn.addEventListener('click', () => {
      if(factoryResetModal) factoryResetModal.style.display = 'none';
    });
  }

  if(factoryResetInput) {
    factoryResetInput.addEventListener('input', (e) => {
      if(e.target.value === 'DELETE') {
        confirmFactoryResetBtn.style.opacity = '1';
        confirmFactoryResetBtn.style.pointerEvents = 'auto';
      } else {
        confirmFactoryResetBtn.style.opacity = '0.5';
        confirmFactoryResetBtn.style.pointerEvents = 'none';
      }
    });
  }

  if(confirmFactoryResetBtn) {
    confirmFactoryResetBtn.addEventListener('click', () => {
      if(factoryResetInput.value === 'DELETE') {
        localStorage.removeItem(DATA_KEY);
        window.location.reload();
      }
    });
  }
  // --- Settings & Profile Logic ---
  const profileSettingsBtn = document.getElementById('profileSettingsBtn');
  const settingsModal = document.getElementById('settingsModal');
  const closeSettingsBtn = document.getElementById('closeSettingsBtn');
  const profileDisplay = document.getElementById('profileDisplay');
  const profileNameInput = document.getElementById('profileNameInput');
  const profileLevelSelect = document.getElementById('profileLevelSelect');

  function updateProfileUI() {
    if(!profileDisplay) return;
    if(appData.profile && appData.profile.name) {
      let lvlName = levels[appData.profile.myLevel] || '';
      let subText = lvlName ? ` — <span style="font-size:12px; opacity:0.8;">${lvlName}</span>` : '';
      profileDisplay.innerHTML = `<i class='bx bxs-user-circle' style="font-size:18px;"></i> স্বাগতম, ${appData.profile.name} ${subText}`;
    } else {
      profileDisplay.innerHTML = '';
    }
  }
  updateProfileUI(); // init on load

  if(profileSettingsBtn) {
    profileSettingsBtn.addEventListener('click', () => {
      profileNameInput.value = appData.profile.name || '';
      if(appData.profile.myLevel) profileLevelSelect.value = appData.profile.myLevel;
      if(settingsModal) settingsModal.style.display = 'flex';
    });
  }

  if(closeSettingsBtn) {
    closeSettingsBtn.addEventListener('click', () => {
      if(settingsModal) settingsModal.style.display = 'none';
    });
  }

  document.getElementById('saveProfileBtn')?.addEventListener('click', () => {
    appData.profile.name = profileNameInput.value.trim();
    appData.profile.myLevel = profileLevelSelect.value;
    saveData();
    updateProfileUI();
    showToast('প্রোফাইল সেভ হয়েছে!');
  });

  document.getElementById('addCustomLevelBtn')?.addEventListener('click', () => {
    const input = document.getElementById('customLevelInput');
    const val = input.value.trim();
    if(!val) return;
    const key = 'custom_lvl_' + Date.now();
    appData.customLevels[key] = val;
    levels[key] = val; // merge directly
    saveData();
    populateDropdowns();
    input.value = '';
    showToast('নতুন শ্রেণি যোগ করা হয়েছে!');
  });

  document.getElementById('addCustomSubjectBtn')?.addEventListener('click', () => {
    const lvlKey = document.getElementById('customSubLevelSelect').value;
    const input = document.getElementById('customSubjectInput');
    const val = input.value.trim();
    if(!lvlKey || !val) return;
    
    if(!appData.customSubjects[lvlKey]) appData.customSubjects[lvlKey] = {};
    const subKey = 'custom_sub_' + Date.now();
    appData.customSubjects[lvlKey][subKey] = val;
    
    // merge directly
    if(!subjects[lvlKey]) subjects[lvlKey] = {};
    subjects[lvlKey][subKey] = val;
    
    saveData();
    // Re-populate level specific subjects if active
    if(fLevel && fLevel.value === lvlKey) fLevel.dispatchEvent(new Event('change'));
    if(setupLevel && setupLevel.value === lvlKey) renderSetupSubjects(lvlKey);
    
    input.value = '';
    showToast('নতুন বিষয় যোগ করা হয়েছে!');
  });

});
