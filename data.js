// 题库数据
const defaultQuestions = [
    // 数学
    {
        id: 1,
        subject: 'math',
        type: 'choice',
        difficulty: 'easy',
        content: '下列各数中，最小的数是（　　）',
        options: ['-3', '-1', '0', '2'],
        answer: 'A',
        analysis: '负数小于0，-3 < -1，所以最小的数是-3。'
    },
    {
        id: 2,
        subject: 'math',
        type: 'choice',
        difficulty: 'easy',
        content: '若 a = 3，b = -2，则 a + b 的值为（　　）',
        options: ['1', '-1', '5', '-5'],
        answer: 'A',
        analysis: 'a + b = 3 + (-2) = 1'
    },
    {
        id: 3,
        subject: 'math',
        type: 'fill',
        difficulty: 'medium',
        content: '方程 2x + 5 = 15 的解为 x = ______',
        answer: '5',
        analysis: '2x = 15 - 5 = 10，所以 x = 5'
    },
    {
        id: 4,
        subject: 'math',
        type: 'choice',
        difficulty: 'medium',
        content: '一个三角形的三个内角之比为 1:2:3，则这个三角形是（　　）',
        options: ['锐角三角形', '直角三角形', '钝角三角形', '等腰三角形'],
        answer: 'B',
        analysis: '设三个角为 x, 2x, 3x，则 x + 2x + 3x = 180°，解得 x = 30°，三个角分别为 30°, 60°, 90°，所以是直角三角形。'
    },
    {
        id: 5,
        subject: 'math',
        type: 'answer',
        difficulty: 'hard',
        content: '已知二次函数 y = x² - 4x + 3，求：\n(1) 函数图像的顶点坐标；\n(2) 函数与x轴的交点坐标。',
        answer: '(1) 顶点坐标为(2, -1)；(2) 与x轴交点为(1, 0)和(3, 0)',
        analysis: '(1) 配方得 y = (x-2)² - 1，顶点为(2, -1)；\n(2) 令y=0，解x²-4x+3=0得(x-1)(x-3)=0，所以x=1或x=3。'
    },
    {
        id: 6,
        subject: 'math',
        type: 'choice',
        difficulty: 'medium',
        content: '若 x² - 5x + 6 = 0，则 x 的值为（　　）',
        options: ['2或3', '-2或-3', '1或6', '-1或-6'],
        answer: 'A',
        analysis: '因式分解得 (x-2)(x-3)=0，所以 x=2 或 x=3'
    },
    {
        id: 7,
        subject: 'math',
        type: 'fill',
        difficulty: 'easy',
        content: '圆的周长公式为 C = 2πr，当 r = 5 时，C = ______（取π=3.14）',
        answer: '31.4',
        analysis: 'C = 2 × 3.14 × 5 = 31.4'
    },
    {
        id: 8,
        subject: 'math',
        type: 'choice',
        difficulty: 'hard',
        content: '在等差数列 {an} 中，a₁ = 2，a₅ = 10，则公差 d =（　　）',
        options: ['1', '2', '3', '4'],
        answer: 'B',
        analysis: 'a₅ = a₁ + 4d，即 10 = 2 + 4d，解得 d = 2'
    },

    // 语文
    {
        id: 9,
        subject: 'chinese',
        type: 'choice',
        difficulty: 'easy',
        content: '"举头望明月"的下一句是（　　）',
        options: ['低头思故乡', '疑是地上霜', '月是故乡明', '江清月近人'],
        answer: 'A',
        analysis: '出自李白《静夜思》：举头望明月，低头思故乡。'
    },
    {
        id: 10,
        subject: 'chinese',
        type: 'choice',
        difficulty: 'medium',
        content: '下列词语中，没有错别字的一项是（　　）',
        options: ['按步就班', '变本加利', '再接再厉', '走头无路'],
        answer: 'C',
        analysis: 'A应为"按部就班"，B应为"变本加厉"，D应为"走投无路"。'
    },
    {
        id: 11,
        subject: 'chinese',
        type: 'fill',
        difficulty: 'medium',
        content: '"学而时习之，不亦说乎"出自《______》。',
        answer: '论语',
        analysis: '这句话出自《论语·学而》。'
    },
    {
        id: 12,
        subject: 'chinese',
        type: 'choice',
        difficulty: 'hard',
        content: '"先天下之忧而忧，后天下之乐而乐"出自（　　）',
        options: ['《岳阳楼记》', '《醉翁亭记》', '《小石潭记》', '《桃花源记》'],
        answer: 'A',
        analysis: '出自范仲淹的《岳阳楼记》。'
    },

    // 英语
    {
        id: 13,
        subject: 'english',
        type: 'choice',
        difficulty: 'easy',
        content: 'I ______ to school every day.',
        options: ['go', 'goes', 'going', 'went'],
        answer: 'A',
        analysis: '主语是I，一般现在时用动词原形go。'
    },
    {
        id: 14,
        subject: 'english',
        type: 'choice',
        difficulty: 'medium',
        content: 'If it ______ tomorrow, we will stay at home.',
        options: ['rains', 'rain', 'will rain', 'rained'],
        answer: 'A',
        analysis: 'if引导的条件状语从句，主句用将来时，从句用一般现在时。'
    },
    {
        id: 15,
        subject: 'english',
        type: 'fill',
        difficulty: 'medium',
        content: '"I am interested in ______ (read) books."',
        answer: 'reading',
        analysis: 'be interested in 后面接动名词形式。'
    },
    {
        id: 16,
        subject: 'english',
        type: 'choice',
        difficulty: 'hard',
        content: 'By the time I got there, the movie ______.',
        options: ['began', 'has begun', 'had begun', 'begins'],
        answer: 'C',
        analysis: 'By the time + 过去时，主句用过去完成时。'
    },

    // 物理
    {
        id: 17,
        subject: 'physics',
        type: 'choice',
        difficulty: 'easy',
        content: '光在真空中的传播速度约为（　　）',
        options: ['3×10⁸ m/s', '3×10⁶ m/s', '3×10⁴ m/s', '3×10² m/s'],
        answer: 'A',
        analysis: '光在真空中的传播速度约为3×10⁸ m/s。'
    },
    {
        id: 18,
        subject: 'physics',
        type: 'choice',
        difficulty: 'medium',
        content: '一个物体质量为10kg，在地球表面受到的重力约为（　　）',
        options: ['10N', '100N', '1000N', '1N'],
        answer: 'B',
        analysis: 'G = mg = 10kg × 10N/kg = 100N'
    },
    {
        id: 19,
        subject: 'physics',
        type: 'fill',
        difficulty: 'medium',
        content: '力的单位是______（填写单位名称）。',
        answer: '牛顿',
        analysis: '力的国际单位是牛顿，符号为N。'
    },

    // 化学
    {
        id: 20,
        subject: 'chemistry',
        type: 'choice',
        difficulty: 'easy',
        content: '水的化学式是（　　）',
        options: ['HO', 'H₂O', 'H₂O₂', 'OH'],
        answer: 'B',
        analysis: '水的化学式为H₂O。'
    },
    {
        id: 21,
        subject: 'chemistry',
        type: 'choice',
        difficulty: 'medium',
        content: '下列物质中，属于纯净物的是（　　）',
        options: ['空气', '海水', '氧气', '石灰水'],
        answer: 'C',
        analysis: '氧气是纯净物，其他都是混合物。'
    },

    // 历史
    {
        id: 22,
        subject: 'history',
        type: 'choice',
        difficulty: 'easy',
        content: '中国历史上第一个统一的封建王朝是（　　）',
        options: ['夏朝', '商朝', '周朝', '秦朝'],
        answer: 'D',
        analysis: '秦始皇于公元前221年统一六国，建立秦朝。'
    },
    {
        id: 23,
        subject: 'history',
        type: 'fill',
        difficulty: 'medium',
        content: '"贞观之治"是______（填写朝代）的治世。',
        answer: '唐朝',
        analysis: '贞观之治是唐太宗李世民在位期间出现的治世。'
    },

    // 地理
    {
        id: 24,
        subject: 'geography',
        type: 'choice',
        difficulty: 'easy',
        content: '世界上面积最大的大洋是（　　）',
        options: ['大西洋', '印度洋', '太平洋', '北冰洋'],
        answer: 'C',
        analysis: '太平洋是世界上面积最大的大洋。'
    },
    {
        id: 25,
        subject: 'geography',
        type: 'fill',
        difficulty: 'medium',
        content: '中国的首都是______。',
        answer: '北京',
        analysis: '北京是中华人民共和国的首都。'
    }
];

// 科目名称映射
const subjectNames = {
    math: '数学',
    chinese: '语文',
    english: '英语',
    physics: '物理',
    chemistry: '化学',
    biology: '生物',
    history: '历史',
    geography: '地理',
    politics: '政治',
    all: '全部'
};

// 题型名称映射
const typeNames = {
    choice: '选择题',
    fill: '填空题',
    answer: '解答题',
    all: '全部'
};

// 难度名称映射
const difficultyNames = {
    easy: '简单',
    medium: '中等',
    hard: '困难',
    all: '全部'
};

// 选项标签
const optionLabels = ['A', 'B', 'C', 'D'];

// 数据管理
const DataManager = {
    // 获取题库
    getQuestions() {
        const saved = localStorage.getItem('study_questions');
        return saved ? JSON.parse(saved) : [...defaultQuestions];
    },

    // 保存题库
    saveQuestions(questions) {
        localStorage.setItem('study_questions', JSON.stringify(questions));
    },

    // 添加题目
    addQuestion(question) {
        const questions = this.getQuestions();
        question.id = Date.now();
        questions.push(question);
        this.saveQuestions(questions);
        return question;
    },

    // 删除题目
    deleteQuestion(id) {
        const questions = this.getQuestions().filter(q => q.id !== id);
        this.saveQuestions(questions);
    },

    // 获取学习记录
    getRecords() {
        const saved = localStorage.getItem('study_records');
        return saved ? JSON.parse(saved) : [];
    },

    // 添加学习记录
    addRecord(record) {
        const records = this.getRecords();
        records.push({
            ...record,
            id: Date.now(),
            date: new Date().toISOString()
        });
        localStorage.setItem('study_records', JSON.stringify(records));
    },

    // 获取打卡记录
    getCheckins() {
        const saved = localStorage.getItem('study_checkins');
        return saved ? JSON.parse(saved) : [];
    },

    // 添加打卡
    addCheckin() {
        const checkins = this.getCheckins();
        const today = new Date().toDateString();
        
        if (!checkins.includes(today)) {
            checkins.push(today);
            localStorage.setItem('study_checkins', JSON.stringify(checkins));
            return true;
        }
        return false;
    },

    // 检查今日是否已打卡
    hasCheckedInToday() {
        const checkins = this.getCheckins();
        const today = new Date().toDateString();
        return checkins.includes(today);
    },

    // 获取连续打卡天数
    getStreakDays() {
        const checkins = this.getCheckins().sort();
        if (checkins.length === 0) return 0;
        
        const today = new Date();
        let streak = 0;
        
        for (let i = 0; i < 365; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toDateString();
            
            if (checkins.includes(dateStr)) {
                streak++;
            } else if (i > 0) {
                break;
            }
        }
        
        return streak;
    },

    // 获取错题本
    getWrongQuestions() {
        const saved = localStorage.getItem('study_wrong');
        return saved ? JSON.parse(saved) : [];
    },

    // 添加错题
    addWrongQuestion(question) {
        const wrong = this.getWrongQuestions();
        const exists = wrong.find(w => w.id === question.id);
        
        if (!exists) {
            wrong.push({
                ...question,
                wrongDate: new Date().toISOString(),
                reviewed: false
            });
            localStorage.setItem('study_wrong', JSON.stringify(wrong));
        }
    },

    // 标记错题已复习
    markWrongReviewed(id) {
        const wrong = this.getWrongQuestions();
        const item = wrong.find(w => w.id === id);
        if (item) {
            item.reviewed = true;
            item.reviewDate = new Date().toISOString();
            localStorage.setItem('study_wrong', JSON.stringify(wrong));
        }
    },

    // 删除错题
    deleteWrongQuestion(id) {
        const wrong = this.getWrongQuestions().filter(w => w.id !== id);
        localStorage.setItem('study_wrong', JSON.stringify(wrong));
    },

    // 重置所有数据
    resetAll() {
        localStorage.removeItem('study_questions');
        localStorage.removeItem('study_records');
        localStorage.removeItem('study_checkins');
        localStorage.removeItem('study_wrong');
    }
};
