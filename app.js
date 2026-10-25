const express = require('express');
const path = require('path');
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'view'));

app.use(express.urlencoded({ extended: true }));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/innserview', express.static(path.join(__dirname, 'view', 'innserview')));

const transactions = [];
const incomeCategories = ['Salary', 'Freelance', 'Business', 'Other Income'];
const spendingCategories = ['Food', 'Transport', 'Utilities', 'Entertainment', 'Healthcare', 'Other Spending'];
let currentUser = 'Thiha';
let savingsGoal = 0;

app.get('/', (req, res) => {
    res.render('welcome', { name: currentUser });
});

app.get('/welcome', (req, res) => {
    res.render('welcome', { name: currentUser });
});

app.get('/about', (req, res) => {
    res.render('about');
});

app.get('/home', (req, res) => {
    res.render('home', { name: currentUser, transactions, savingsGoal });
});

app.post('/goal', (req, res) => {
    const newGoal = parseFloat(req.body.goal);
    if (!isNaN(newGoal) && newGoal >= 0) {
        savingsGoal = newGoal;
    }
    res.redirect('/home');
});

app.get('/caculation', (req, res) => {
    res.render('caculation', { name: currentUser, transactions, incomeCategories });
});

app.post('/caculation', (req, res) => {
    const record = {};
    record.category    = req.body.category;
    record.amount      = req.body.amount;
    record.description = req.body.description;
    if (req.body.date) {
        record.date = new Date(req.body.date);
    } else {
        record.date = new Date();
    }
    record.type = 'income';
    transactions.push(record);
    res.redirect('/home');
});

app.post('/category/income', (req, res) => {
    const category = req.body.category;
    if (category && !incomeCategories.includes(category)) {
        incomeCategories.push(category);
    }
    res.redirect('/caculation');
});

app.get('/spending', (req, res) => {
    res.render('spending', { name: currentUser, transactions, spendingCategories });
});

app.post('/category/spending', (req, res) => {
    const category = req.body.category;
    if (category && !spendingCategories.includes(category)) {
        spendingCategories.push(category);
    }
    res.redirect('/spending');
});

app.post('/spending', (req, res) => {
    const record = {};
    record.category    = req.body.category;
    record.amount      = req.body.amount;
    record.description = req.body.description;
    if (req.body.date) {
        record.date = new Date(req.body.date);
    } else {
        record.date = new Date();
    }
    record.type = 'spending';
    transactions.push(record);
    res.redirect('/home');
});

app.get('/history', (req, res) => {
    const selectedMonth = req.query.month || '';
    let filtered = transactions.map((t, i) => ({ ...t, originalIndex: i }));
    if (selectedMonth) {
        const [year, month] = selectedMonth.split('-').map(Number);
        filtered = filtered.filter(t => {
            const d = new Date(t.date);
            return d.getFullYear() === year && (d.getMonth() + 1) === month;
        });
    }
    filtered = filtered.reverse();
    res.render('history', { name: currentUser, transactions: filtered, selectedMonth });
});

app.post('/edit/:index', (req, res) => {
    const idx = parseInt(req.params.index);
    if (idx >= 0 && idx < transactions.length) {
        transactions[idx].category    = req.body.category;
        transactions[idx].amount      = req.body.amount;
        transactions[idx].description = req.body.description;
    }
    res.redirect('/history');
});

app.post('/delete/:index', (req, res) => {
    const idx = parseInt(req.params.index);
    if (idx >= 0 && idx < transactions.length) {
        transactions.splice(idx, 1);
    }
    res.redirect('/history');
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
