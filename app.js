// 应用状态
let currentPage = 'home';
let currentQuestions = [];
let currentQuestionIndex = 0;
let currentScore = 0;
let userAnswers = {};
let currentExam = null;

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    // 初始化日期显示
    updateDateDisplay();
    
    // 初始化导航
    initNavigation();
    
    // 初始化首页数据
    updateHomePage();
    
    // 初始化难度滑块
    initDifficultySliders();
    
    // 加载题库列表
    loadQuestionsList();
    
    // 加载错题本
    loadWrongQuestions();
    
    // 加载统计
    updateStatsPage();
}

// 更新日期显示
function updateDateDisplay() {
    const dateEl = document.getElementById('current-date');
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    dateEl.textContent = new Date().toLocaleDateString('zh-CN', options);
}

// 初始化导航
function initNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const page = item.dataset.page;
            showPage(page);
        });
    });
}

// 显示页面
function showPage(page) {
    // 更新导航状态
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.page === page);
    });
    
    // 显示对应页面
    document.querySelectorAll('.page').forEach(p => {
        p.classList.remove('active');
    });
    document.getElementById(`page-${page}`).classList.add('active');
    
    currentPage = page;
    
    // 页面特定初始化
    if (page === 'home') {
        updateHomePage();
    } else if (page === 'stats') {
        updateStatsPage();
    } else if (page === 'questions') {
        loadQuestionsList();
    } else if (page === 'wrong') {
        loadWrongQuestions();
    }
}

// 更新首页数据
function updateHomePage() {
    // 更新打卡数据
    const streakDays = DataManager.getStreakDays();
    const totalDays = DataManager.getCheckins().length;
    const hasCheckedIn = DataManager.hasCheckedInToday();
    
    document.getElementById('streak-days').textContent = streakDays;
    document.getElementById('total-days').textContent = totalDays;
    
    const checkinBtn = document.getElementById('checkin-btn');
    const checkinStatus = document.getElementById('checkin-status');
    
    if (hasCheckedIn) {
        checkinBtn.disabled = true;
        checkinBtn.innerHTML = '<span class="btn-icon">✅</span><span>已打卡</span>';
        checkinStatus.textContent = '今天已完成打卡，继续保持！💪';
        checkinStatus.style.color = 'var(--success-color)';
    } else {
        checkinBtn.disabled = false;
        checkinBtn.innerHTML = '<span class="btn-icon">✅</span><span>今日打卡</span>';
        checkinBtn.onclick = doCheckin;
        checkinStatus.textContent = '今天还没打卡哦，加油！';
        checkinStatus.style.color = 'var(--text-secondary)';
    }
    
    // 更新学习进度
    updateProgressStats();
}

// 执行打卡
function doCheckin() {
    if (DataManager.addCheckin()) {
        showNotification('打卡成功！继续保持！💪');
        updateHomePage();
    }
}

// 更新进度统计
function updateProgressStats() {
    const records = DataManager.getRecords();
    const today = new Date();
    
    // 本周做题数
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weeklyCount = records.filter(r => new Date(r.date) >= weekStart)
        .reduce((sum, r) => sum + (r.total || 0), 0);
    
    // 本月做题数
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthlyCount = records.filter(r => new Date(r.date) >= monthStart)
        .reduce((sum, r) => sum + (r.total || 0), 0);
    
    // 总做题数
    const totalCount = records.reduce((sum, r) => sum + (r.total || 0), 0);
    
    // 正确率
    const totalCorrect = records.reduce((sum, r) => sum + (r.correct || 0), 0);
    const accuracy = totalCount > 0 ? Math.round((totalCorrect / totalCount) * 100) : 0;
    
    document.getElementById('weekly-count').textContent = `${weeklyCount} 题`;
    document.getElementById('monthly-count').textContent = `${monthlyCount} 题`;
    document.getElementById('total-count').textContent = `${totalCount} 题`;
    document.getElementById('accuracy-rate').textContent = `${accuracy}%`;
}

// 开始练习
function startPractice() {
    const subject = document.getElementById('practice-subject').value;
    const count = parseInt(document.getElementById('practice-count').value);
    const difficulty = document.getElementById('practice-difficulty').value;
    
    // 筛选题目
    let questions = DataManager.getQuestions();
    
    if (subject !== 'all') {
        questions = questions.filter(q => q.subject === subject);
    }
    
    if (difficulty !== 'all') {
        questions = questions.filter(q => q.difficulty === difficulty);
    }
    
    // 随机选择
    questions = shuffleArray(questions).slice(0, count);
    
    if (questions.length === 0) {
        showNotification('没有符合条件的题目，请调整筛选条件或添加题目。');
        return;
    }
    
    currentQuestions = questions;
    currentQuestionIndex = 0;
    currentScore = 0;
    userAnswers = {};
    
    // 显示练习区域
    document.getElementById('practice-setup').style.display = 'none';
    document.getElementById('practice-area').style.display = 'block';
    document.getElementById('practice-result').style.display = 'none';
    
    // 更新进度显示
    document.getElementById('total-questions').textContent = questions.length;
    document.getElementById('current-score').textContent = '0';
    
    // 显示第一题
    showQuestion(0);
}

// 显示题目
function showQuestion(index) {
    currentQuestionIndex = index;
    const question = currentQuestions[index];
    
    document.getElementById('current-question').textContent = index + 1;
    
    const card = document.getElementById('question-card');
    
    let html = `
        <div class="question-header">
            <span class="question-type-badge">${typeNames[question.type]}</span>
            <span class="question-difficulty difficulty-${question.difficulty}">${difficultyNames[question.difficulty]}</span>
        </div>
        <div class="question-content">${question.content}</div>
    `;
    
    // 根据题型显示不同输入方式
    if (question.type === 'choice') {
        html += '<div class="question-options">';
        question.options.forEach((opt, i) => {
            const selected = userAnswers[question.id] === optionLabels[i] ? 'selected' : '';
            html += `
                <div class="option-item ${selected}" onclick="selectOption('${optionLabels[i]}')">
                    <span class="option-label">${optionLabels[i]}</span>
                    <span class="option-text">${opt}</span>
                </div>
            `;
        });
        html += '</div>';
    } else if (question.type === 'fill') {
        const value = userAnswers[question.id] || '';
        html += `<input type="text" class="fill-input" id="fill-answer" value="${value}" placeholder="请输入答案">`;
    } else if (question.type === 'answer') {
        const value = userAnswers[question.id] || '';
        html += `<textarea class="answer-textarea" id="answer-text" placeholder="请输入解答">${value}</textarea>`;
    }
    
    // 显示答案解析（如果已回答）
    if (userAnswers[question.id] !== undefined) {
        const isCorrect = checkAnswer(question, userAnswers[question.id]);
        html += `
            <div class="question-analysis">
                <div class="analysis-title">${isCorrect ? '✅ 回答正确！' : '❌ 回答错误'}</div>
                <div><strong>正确答案：</strong>${question.answer}</div>
                ${question.analysis ? `<div><strong>解析：</strong>${question.analysis}</div>` : ''}
            </div>
        `;
    }
    
    card.innerHTML = html;
    
    // 更新按钮状态
    document.getElementById('prev-btn').disabled = index === 0;
    
    const isLast = index === currentQuestions.length - 1;
    document.getElementById('next-btn').style.display = isLast ? 'none' : 'inline-flex';
    document.getElementById('submit-btn').style.display = isLast ? 'inline-flex' : 'none';
}

// 选择选项
function selectOption(option) {
    const question = currentQuestions[currentQuestionIndex];
    userAnswers[question.id] = option;
    
    // 更新UI
    document.querySelectorAll('.option-item').forEach((el, i) => {
        el.classList.remove('selected');
        if (optionLabels[i] === option) {
            el.classList.add('selected');
        }
    });
    
    // 检查答案并显示解析
    checkCurrentAnswer();
}

// 检查当前答案
function checkCurrentAnswer() {
    const question = currentQuestions[currentQuestionIndex];
    const userAnswer = userAnswers[question.id];
    
    if (userAnswer !== undefined) {
        const isCorrect = checkAnswer(question, userAnswer);
        
        // 更新分数
        if (isCorrect && !question.scored) {
            currentScore++;
            question.scored = true;
            document.getElementById('current-score').textContent = currentScore;
        }
        
        // 添加到错题本
        if (!isCorrect) {
            DataManager.addWrongQuestion(question);
        }
        
        // 刷新显示
        showQuestion(currentQuestionIndex);
    }
}

// 检查答案
function checkAnswer(question, userAnswer) {
    if (!userAnswer) return false;
    
    const correct = question.answer.toString().trim().toLowerCase();
    const user = userAnswer.toString().trim().toLowerCase();
    
    return correct === user;
}

// 上一题
function prevQuestion() {
    if (currentQuestionIndex > 0) {
        showQuestion(currentQuestionIndex - 1);
    }
}

// 下一题
function nextQuestion() {
    // 保存当前答案
    const question = currentQuestions[currentQuestionIndex];
    
    if (question.type === 'fill') {
        const input = document.getElementById('fill-answer');
        if (input) {
            userAnswers[question.id] = input.value;
        }
    } else if (question.type === 'answer') {
        const textarea = document.getElementById('answer-text');
        if (textarea) {
            userAnswers[question.id] = textarea.value;
        }
    }
    
    // 检查答案
    if (userAnswers[question.id] !== undefined) {
        checkCurrentAnswer();
    }
    
    // 显示下一题
    if (currentQuestionIndex < currentQuestions.length - 1) {
        showQuestion(currentQuestionIndex + 1);
    }
}

// 提交练习
function submitPractice() {
    // 保存最后一题答案
    const question = currentQuestions[currentQuestionIndex];
    
    if (question.type === 'fill') {
        const input = document.getElementById('fill-answer');
        if (input) {
            userAnswers[question.id] = input.value;
        }
    } else if (question.type === 'answer') {
        const textarea = document.getElementById('answer-text');
        if (textarea) {
            userAnswers[question.id] = textarea.value;
        }
    }
    
    // 检查最后一题
    if (userAnswers[question.id] !== undefined) {
        checkCurrentAnswer();
    }
    
    // 计算结果
    let correct = 0;
    currentQuestions.forEach(q => {
        if (userAnswers[q.id] !== undefined && checkAnswer(q, userAnswers[q.id])) {
            correct++;
        }
    });
    
    const total = currentQuestions.length;
    const wrong = total - correct;
    const accuracy = Math.round((correct / total) * 100);
    
    // 保存记录
    DataManager.addRecord({
        type: 'practice',
        total: total,
        correct: correct,
        wrong: wrong,
        accuracy: accuracy
    });
    
    // 显示结果
    document.getElementById('practice-area').style.display = 'none';
    document.getElementById('practice-result').style.display = 'block';
    
    document.getElementById('result-total').textContent = total;
    document.getElementById('result-correct').textContent = correct;
    document.getElementById('result-wrong').textContent = wrong;
    document.getElementById('result-accuracy').textContent = `${accuracy}%`;
}

// 查看错题
function reviewWrong() {
    showPage('wrong');
}

// 重新开始练习
function restartPractice() {
    document.getElementById('practice-result').style.display = 'none';
    document.getElementById('practice-setup').style.display = 'block';
}

// 初始化难度滑块
function initDifficultySliders() {
    const sliders = ['diff-easy', 'diff-medium', 'diff-hard'];
    
    sliders.forEach(id => {
        const slider = document.getElementById(id);
        const valueSpan = slider.nextElementSibling;
        
        slider.addEventListener('input', () => {
            valueSpan.textContent = `${slider.value}%`;
        });
    });
}

// 生成试卷
function generateExam() {
    const subject = document.getElementById('exam-subject').value;
    const name = document.getElementById('exam-name').value || `${subjectNames[subject]}练习卷`;
    const choiceCount = parseInt(document.getElementById('exam-choice-count').value);
    const fillCount = parseInt(document.getElementById('exam-fill-count').value);
    const answerCount = parseInt(document.getElementById('exam-answer-count').value);
    
    // 获取难度分布
    const easyPct = parseInt(document.getElementById('diff-easy').value);
    const mediumPct = parseInt(document.getElementById('diff-medium').value);
    const hardPct = parseInt(document.getElementById('diff-hard').value);
    
    // 获取题库
    const allQuestions = DataManager.getQuestions().filter(q => q.subject === subject);
    
    // 按难度分类
    const byDifficulty = {
        easy: shuffleArray(allQuestions.filter(q => q.difficulty === 'easy')),
        medium: shuffleArray(allQuestions.filter(q => q.difficulty === 'medium')),
        hard: shuffleArray(allQuestions.filter(q => q.difficulty === 'hard'))
    };
    
    // 按难度比例选择题目
    function selectByDifficulty(count) {
        const result = [];
        const easyCount = Math.round(count * easyPct / 100);
        const mediumCount = Math.round(count * mediumPct / 100);
        const hardCount = count - easyCount - mediumCount;
        
        result.push(...byDifficulty.easy.slice(0, easyCount));
        result.push(...byDifficulty.medium.slice(0, mediumCount));
        result.push(...byDifficulty.hard.slice(0, hardCount));
        
        return result;
    }
    
    // 生成试卷
    currentExam = {
        name: name,
        subject: subject,
        choice: selectByDifficulty(choiceCount).slice(0, choiceCount),
        fill: selectByDifficulty(fillCount).slice(0, fillCount),
        answer: selectByDifficulty(answerCount).slice(0, answerCount),
        createdAt: new Date().toLocaleString('zh-CN')
    };
    
    // 显示试卷
    renderExam();
}

// 渲染试卷
function renderExam() {
    document.getElementById('exam-preview').style.display = 'block';
    
    const paper = document.getElementById('exam-paper');
    
    let html = `
        <div class="exam-title">
            <h2>${currentExam.name}</h2>
            <div class="exam-info">
                <span>科目：${subjectNames[currentExam.subject]}</span> | 
                <span>生成时间：${currentExam.createdAt}</span>
            </div>
        </div>
    `;
    
    let questionNum = 1;
    
    // 选择题
    if (currentExam.choice.length > 0) {
        html += `
            <div class="exam-section">
                <div class="exam-section-title">一、选择题（共${currentExam.choice.length}题）</div>
        `;
        currentExam.choice.forEach(q => {
            html += `
                <div class="exam-question">
                    <div class="exam-question-number">${questionNum}. ${q.content}</div>
                    <div class="exam-options">
                        ${q.options.map((opt, i) => `
                            <div class="exam-option">${optionLabels[i]}. ${opt}</div>
                        `).join('')}
                    </div>
                </div>
            `;
            questionNum++;
        });
        html += '</div>';
    }
    
    // 填空题
    if (currentExam.fill.length > 0) {
        html += `
            <div class="exam-section">
                <div class="exam-section-title">二、填空题（共${currentExam.fill.length}题）</div>
        `;
        currentExam.fill.forEach(q => {
            html += `
                <div class="exam-question">
                    <div class="exam-question-number">${questionNum}. ${q.content}</div>
                </div>
            `;
            questionNum++;
        });
        html += '</div>';
    }
    
    // 解答题
    if (currentExam.answer.length > 0) {
        html += `
            <div class="exam-section">
                <div class="exam-section-title">三、解答题（共${currentExam.answer.length}题）</div>
        `;
        currentExam.answer.forEach(q => {
            html += `
                <div class="exam-question">
                    <div class="exam-question-number">${questionNum}. ${q.content}</div>
                </div>
            `;
            questionNum++;
        });
        html += '</div>';
    }
    
    paper.innerHTML = html;
    
    // 滚动到试卷
    paper.scrollIntoView({ behavior: 'smooth' });
}

// 打印试卷
function printExam() {
    window.print();
}

// 保存试卷
function saveExam() {
    if (!currentExam) return;
    
    const saved = localStorage.getItem('study_exams');
    const exams = saved ? JSON.parse(saved) : [];
    exams.push({
        ...currentExam,
        id: Date.now()
    });
    localStorage.setItem('study_exams', JSON.stringify(exams));
    
    showNotification('试卷已保存！');
}

// 开始答题
function startExam() {
    if (!currentExam) return;
    
    // 合并所有题目
    currentQuestions = [
        ...currentExam.choice,
        ...currentExam.fill,
        ...currentExam.answer
    ];
    
    currentQuestionIndex = 0;
    currentScore = 0;
    userAnswers = {};
    
    // 切换到练习页面
    document.getElementById('exam-preview').style.display = 'none';
    
    document.getElementById('practice-setup').style.display = 'none';
    document.getElementById('practice-area').style.display = 'block';
    document.getElementById('practice-result').style.display = 'none';
    
    document.getElementById('total-questions').textContent = currentQuestions.length;
    document.getElementById('current-score').textContent = '0';
    
    showQuestion(0);
}

// 加载题库列表
function loadQuestionsList() {
    const list = document.getElementById('questions-list');
    const questions = DataManager.getQuestions();
    
    if (questions.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📭</div>
                <div class="empty-state-text">暂无题目，点击"添加题目"开始创建</div>
            </div>
        `;
        return;
    }
    
    renderQuestionsList(questions);
}

// 渲染题目列表
function renderQuestionsList(questions) {
    const list = document.getElementById('questions-list');
    
    const filterSubject = document.getElementById('filter-subject').value;
    const filterType = document.getElementById('filter-type').value;
    const filterDifficulty = document.getElementById('filter-difficulty').value;
    
    // 筛选
    let filtered = questions;
    if (filterSubject !== 'all') {
        filtered = filtered.filter(q => q.subject === filterSubject);
    }
    if (filterType !== 'all') {
        filtered = filtered.filter(q => q.type === filterType);
    }
    if (filterDifficulty !== 'all') {
        filtered = filtered.filter(q => q.difficulty === filterDifficulty);
    }
    
    if (filtered.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🔍</div>
                <div class="empty-state-text">没有符合条件的题目</div>
            </div>
        `;
        return;
    }
    
    list.innerHTML = filtered.map(q => `
        <div class="question-list-item" onclick="showQuestionDetail(${q.id})">
            <div class="question-list-header">
                <div class="question-list-meta">
                    <span class="question-type-badge">${typeNames[q.type]}</span>
                    <span class="question-difficulty difficulty-${q.difficulty}">${difficultyNames[q.difficulty]}</span>
                    <span style="color: var(--text-secondary); font-size: 12px;">${subjectNames[q.subject]}</span>
                </div>
            </div>
            <div class="question-list-content">${q.content}</div>
        </div>
    `).join('');
}

// 筛选题目
function filterQuestions() {
    loadQuestionsList();
}

// 显示添加题目弹窗
function showAddQuestionModal() {
    document.getElementById('add-question-modal').classList.add('active');
}

// 关闭弹窗
function closeModal() {
    document.getElementById('add-question-modal').classList.remove('active');
    // 清空表单
    document.getElementById('new-question-content').value = '';
    document.getElementById('new-question-answer').value = '';
    document.getElementById('new-question-analysis').value = '';
    document.getElementById('option-a').value = '';
    document.getElementById('option-b').value = '';
    document.getElementById('option-c').value = '';
    document.getElementById('option-d').value = '';
}

// 题型改变时更新UI
function onQuestionTypeChange() {
    const type = document.getElementById('new-question-type').value;
    const optionsGroup = document.getElementById('choice-options-group');
    
    if (type === 'choice') {
        optionsGroup.style.display = 'block';
    } else {
        optionsGroup.style.display = 'none';
    }
}

// 保存新题目
function saveNewQuestion() {
    const subject = document.getElementById('new-question-subject').value;
    const type = document.getElementById('new-question-type').value;
    const difficulty = document.getElementById('new-question-difficulty').value;
    const content = document.getElementById('new-question-content').value.trim();
    const answer = document.getElementById('new-question-answer').value.trim();
    const analysis = document.getElementById('new-question-analysis').value.trim();
    
    if (!content || !answer) {
        showNotification('请填写题目内容和正确答案');
        return;
    }
    
    const question = {
        subject,
        type,
        difficulty,
        content,
        answer,
        analysis
    };
    
    if (type === 'choice') {
        const options = [
            document.getElementById('option-a').value.trim(),
            document.getElementById('option-b').value.trim(),
            document.getElementById('option-c').value.trim(),
            document.getElementById('option-d').value.trim()
        ].filter(o => o);
        
        if (options.length < 2) {
            showNotification('选择题至少需要2个选项');
            return;
        }
        
        question.options = options;
    }
    
    DataManager.addQuestion(question);
    showNotification('题目添加成功！');
    closeModal();
    loadQuestionsList();
}

// 显示题目详情
function showQuestionDetail(id) {
    const questions = DataManager.getQuestions();
    const question = questions.find(q => q.id === id);
    
    if (!question) return;
    
    const content = document.getElementById('question-detail-content');
    
    let html = `
        <div class="question-header" style="margin-bottom: 16px;">
            <span class="question-type-badge">${typeNames[question.type]}</span>
            <span class="question-difficulty difficulty-${question.difficulty}">${difficultyNames[question.difficulty]}</span>
        </div>
        <div class="question-content" style="margin-bottom: 16px;">${question.content}</div>
    `;
    
    if (question.type === 'choice' && question.options) {
        html += '<div class="question-options" style="margin-bottom: 16px;">';
        question.options.forEach((opt, i) => {
            html += `
                <div class="option-item">
                    <span class="option-label">${optionLabels[i]}</span>
                    <span class="option-text">${opt}</span>
                </div>
            `;
        });
        html += '</div>';
    }
    
    html += `
        <div style="padding: 12px; background-color: var(--bg-color); border-radius: var(--radius); margin-bottom: 12px;">
            <strong>正确答案：</strong>${question.answer}
        </div>
    `;
    
    if (question.analysis) {
        html += `
            <div class="question-analysis">
                <div class="analysis-title">解析</div>
                <div>${question.analysis}</div>
            </div>
        `;
    }
    
    content.innerHTML = html;
    document.getElementById('question-detail-modal').classList.add('active');
}

// 关闭详情弹窗
function closeDetailModal() {
    document.getElementById('question-detail-modal').classList.remove('active');
}

// 加载错题本
function loadWrongQuestions() {
    const wrong = DataManager.getWrongQuestions();
    const list = document.getElementById('wrong-list');
    
    // 更新统计
    document.getElementById('wrong-total').textContent = wrong.length;
    document.getElementById('wrong-reviewed').textContent = wrong.filter(w => w.reviewed).length;
    document.getElementById('wrong-pending').textContent = wrong.filter(w => !w.reviewed).length;
    
    if (wrong.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🎉</div>
                <div class="empty-state-text">太棒了！还没有错题记录</div>
            </div>
        `;
        return;
    }
    
    // 按时间倒序
    const sorted = [...wrong].sort((a, b) => new Date(b.wrongDate) - new Date(a.wrongDate));
    
    list.innerHTML = sorted.map(w => `
        <div class="wrong-item">
            <div class="wrong-item-header">
                <div class="question-list-meta">
                    <span class="question-type-badge">${typeNames[w.type]}</span>
                    <span style="color: var(--text-secondary); font-size: 12px;">${subjectNames[w.subject]}</span>
                    ${w.reviewed ? '<span style="color: var(--success-color); font-size: 12px;">✅ 已复习</span>' : '<span style="color: var(--warning-color); font-size: 12px;">⏳ 待复习</span>'}
                </div>
                <span style="color: var(--text-secondary); font-size: 12px;">${new Date(w.wrongDate).toLocaleDateString('zh-CN')}</span>
            </div>
            <div class="wrong-item-content">${w.content}</div>
            <div class="wrong-item-answer">
                <strong>正确答案：</strong>${w.answer}
            </div>
            <div class="wrong-item-actions">
                ${!w.reviewed ? `<button class="btn btn-primary" onclick="reviewWrongItem(${w.id})">标记已复习</button>` : ''}
                <button class="btn btn-secondary" onclick="deleteWrongItem(${w.id})">删除</button>
            </div>
        </div>
    `).join('');
}

// 复习错题
function reviewWrongItem(id) {
    DataManager.markWrongReviewed(id);
    loadWrongQuestions();
    showNotification('已标记为复习完成！');
}

// 删除错题
function deleteWrongItem(id) {
    if (confirm('确定要删除这道错题吗？')) {
        DataManager.deleteWrongQuestion(id);
        loadWrongQuestions();
    }
}

// 更新统计页面
function updateStatsPage() {
    const records = DataManager.getRecords();
    const wrong = DataManager.getWrongQuestions();
    
    // 基本统计
    const total = records.reduce((sum, r) => sum + (r.total || 0), 0);
    const correct = records.reduce((sum, r) => sum + (r.correct || 0), 0);
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
    const streak = DataManager.getStreakDays();
    
    document.getElementById('stats-total-questions').textContent = total;
    document.getElementById('stats-correct').textContent = correct;
    document.getElementById('stats-accuracy').textContent = `${accuracy}%`;
    document.getElementById('stats-streak').textContent = streak;
    
    // 绘制图表（使用简单的文本表示）
    drawWeeklyChart(records);
    drawSubjectChart(records);
    
    // 学习记录
    const historyList = document.getElementById('history-list');
    const sorted = [...records].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 20);
    
    if (sorted.length === 0) {
        historyList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-text">暂无学习记录</div>
            </div>
        `;
    } else {
        historyList.innerHTML = sorted.map(r => `
            <div class="history-item">
                <span class="history-date">${new Date(r.date).toLocaleDateString('zh-CN')}</span>
                <div class="history-info">
                    <span>总题: ${r.total}</span>
                    <span style="color: var(--success-color);">正确: ${r.correct}</span>
                    <span style="color: var(--danger-color);">错误: ${r.wrong}</span>
                    <span>正确率: ${r.accuracy}%</span>
                </div>
            </div>
        `).join('');
    }
}

// 绘制周统计图表
function drawWeeklyChart(records) {
    const canvas = document.getElementById('weekly-chart');
    const ctx = canvas.getContext('2d');
    
    // 设置canvas大小
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    const width = canvas.width;
    const height = canvas.height;
    
    // 清空
    ctx.clearRect(0, 0, width, height);
    
    // 获取最近7天数据
    const days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toDateString();
        
        const dayRecords = records.filter(r => new Date(r.date).toDateString() === dateStr);
        const count = dayRecords.reduce((sum, r) => sum + (r.total || 0), 0);
        
        days.push({
            label: `${date.getMonth() + 1}/${date.getDate()}`,
            value: count
        });
    }
    
    const maxValue = Math.max(...days.map(d => d.value), 10);
    
    // 绘制柱状图
    const barWidth = (width - 60) / days.length - 10;
    const chartHeight = height - 60;
    
    days.forEach((day, i) => {
        const x = 40 + i * (barWidth + 10);
        const barHeight = (day.value / maxValue) * chartHeight;
        const y = height - 40 - barHeight;
        
        // 柱子
        ctx.fillStyle = day.value > 0 ? 'var(--primary-color)' : '#e5e7eb';
        ctx.fillRect(x, y, barWidth, barHeight);
        
        // 数值
        ctx.fillStyle = 'var(--text-primary)';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(day.value, x + barWidth / 2, y - 5);
        
        // 日期
        ctx.fillText(day.label, x + barWidth / 2, height - 20);
    });
    
    // Y轴标签
    ctx.fillStyle = 'var(--text-secondary)';
    ctx.textAlign = 'right';
    ctx.fillText(maxValue, 35, 20);
    ctx.fillText(0, 35, height - 40);
}

// 绘制科目分布图表
function drawSubjectChart(records) {
    const canvas = document.getElementById('subject-chart');
    const ctx = canvas.getContext('2d');
    
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 40;
    
    ctx.clearRect(0, 0, width, height);
    
    // 统计各科做题数
    const subjectCount = {};
    records.forEach(r => {
        if (r.questions) {
            r.questions.forEach(q => {
                subjectCount[q.subject] = (subjectCount[q.subject] || 0) + 1;
            });
        }
    });
    
    // 如果没有数据，显示提示
    const total = Object.values(subjectCount).reduce((a, b) => a + b, 0);
    if (total === 0) {
        ctx.fillStyle = 'var(--text-secondary)';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('暂无数据', centerX, centerY);
        return;
    }
    
    // 绘制饼图
    const colors = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];
    let currentAngle = -Math.PI / 2;
    
    Object.entries(subjectCount).forEach(([subject, count], i) => {
        const angle = (count / total) * Math.PI * 2;
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + angle);
        ctx.closePath();
        ctx.fillStyle = colors[i % colors.length];
        ctx.fill();
        
        currentAngle += angle;
    });
    
    // 绘制图例
    let legendY = 20;
    Object.entries(subjectCount).forEach(([subject, count], i) => {
        const color = colors[i % colors.length];
        
        ctx.fillStyle = color;
        ctx.fillRect(10, legendY, 12, 12);
        
        ctx.fillStyle = 'var(--text-primary)';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`${subjectNames[subject]}: ${count}`, 28, legendY + 10);
        
        legendY += 20;
    });
}

// 工具函数：随机打乱数组
function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// 显示通知
function showNotification(message) {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: var(--primary-color);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 9999;
        font-size: 14px;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // 3秒后移除
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// 添加动画样式
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);
