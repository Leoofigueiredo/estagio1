// Dados Iniciais da Demonstração
const initialDemoData = [
    { id: 1, desc: 'Mensalidade Faculdade', amount: 450.00, date: '2026-03-05', category: 'Educação', paymentMethod: 'Boleto', status: 'Pago', recurring: true },
    { id: 2, desc: 'Supermercado Mensal', amount: 820.50, date: '2026-03-08', category: 'Alimentação', paymentMethod: 'Cartão de Crédito', status: 'Pago', recurring: false },
    { id: 3, desc: 'Assinatura Software (Freelance)', amount: 120.00, date: '2026-03-10', category: 'Ferramentas/Trabalho', paymentMethod: 'Cartão de Crédito', status: 'Pendente', recurring: true },
    { id: 4, desc: 'Conta de Energia', amount: 195.30, date: '2026-03-12', category: 'Moradia', paymentMethod: 'Pix', status: 'Pendente', recurring: true },
    { id: 5, desc: 'Cinema e Lazer', amount: 85.00, date: '2026-03-13', category: 'Lazer', paymentMethod: 'Cartão de Débito', status: 'Pago', recurring: false },
    { id: 6, desc: 'Restaurante Fim de Semana', amount: 310.00, date: '2026-03-14', category: 'Alimentação', paymentMethod: 'Cartão de Crédito', status: 'Pago', recurring: false }
];

let despesas = [...initialDemoData];

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('date').valueAsDate = new Date();
    updateUI();
});

// Alternar entre Telas (Single Page Application)
function switchView(viewName, event) {
    if (event) event.preventDefault();

    // Atualiza estado ativo no menu lateral
    document.querySelectorAll('.menu a').forEach(link => link.classList.remove('active'));
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }

    // Oculta todas as telas
    document.querySelectorAll('.view-section').forEach(section => section.classList.remove('active'));

    // Exibe a tela alvo
    const targetSection = document.getElementById(`view-${viewName}`);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    // Atualiza o título no cabeçalho
    const pageTitle = document.getElementById('pageTitle');
    const titles = {
        'dashboard': 'Visão Geral Financeira',
        'despesas': 'Gerenciamento de Despesas',
        'cartoes': 'Cartões de Crédito',
        'orcamentos': 'Orçamentos & Limites'
    };
    pageTitle.innerText = titles[viewName] || 'Fynance';
}

// Evento: Adicionar Despesa
document.getElementById('expenseForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const expense = {
        id: Date.now(),
        desc: document.getElementById('desc').value,
        amount: parseFloat(document.getElementById('amount').value),
        date: document.getElementById('date').value,
        category: document.getElementById('category').value,
        paymentMethod: document.getElementById('paymentMethod').value,
        status: document.getElementById('status').value,
        recurring: document.getElementById('recurring').checked
    };

    despesas.unshift(expense);
    updateUI();
    document.getElementById('expenseForm').reset();
    document.getElementById('date').valueAsDate = new Date();
});

// Atualização Geral da Interface
function updateUI() {
    renderExpenseTable();
    renderCreditCardTable();
    renderBudgets();
    updateTotalsAndHealth();
}

// Renderiza Tabela Principal de Despesas
function renderExpenseTable() {
    const expenseList = document.getElementById('expenseList');
    const filterCategory = document.getElementById('filterCategory').value;
    expenseList.innerHTML = '';

    const itemsToDisplay = despesas.filter(item => filterCategory === 'Todas' || item.category === filterCategory);

    itemsToDisplay.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${item.desc}</strong></td>
            <td>R$ ${item.amount.toFixed(2)}</td>
            <td>${formatDate(item.date)}</td>
            <td>${item.category}</td>
            <td>${item.paymentMethod}</td>
            <td><span class="status-badge ${item.status === 'Pago' ? 'status-good' : 'status-warning'}">${item.status}</span></td>
            <td>${item.recurring ? '🔄 Sim' : 'Não'}</td>
            <td><button class="btn-danger" onclick="deleteExpense(${item.id})">Excluir</button></td>
        `;
        expenseList.appendChild(row);
    });
}

// Renderiza Tabela de Cartão de Crédito
function renderCreditCardTable() {
    const creditCardList = document.getElementById('creditCardList');
    creditCardList.innerHTML = '';

    const cardExpenses = despesas.filter(item => item.paymentMethod === 'Cartão de Crédito');

    cardExpenses.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${item.desc}</strong></td>
            <td>R$ ${item.amount.toFixed(2)}</td>
            <td>${formatDate(item.date)}</td>
            <td>${item.category}</td>
            <td><span class="status-badge ${item.status === 'Pago' ? 'status-good' : 'status-warning'}">${item.status}</span></td>
        `;
        creditCardList.appendChild(row);
    });
}

// Atualiza a Barra de Orçamentos
function renderBudgets() {
    const totalAlimentacao = sumByCategory('Alimentação');
    const totalEducacao = sumByCategory('Educação');
    const totalLazer = sumByCategory('Lazer');

    updateBudgetProgress('Alimentacao', totalAlimentacao, 1000);
    updateBudgetProgress('Educacao', totalEducacao, 600);
    updateBudgetProgress('Lazer', totalLazer, 300);
}

function updateBudgetProgress(idKey, currentTotal, limit) {
    const percent = Math.min((currentTotal / limit) * 100, 100);
    document.getElementById(`budget${idKey}Text`).innerText = `R$ ${currentTotal.toFixed(2)} / R$ ${limit.toFixed(2)}`;
    
    const bar = document.getElementById(`budget${idKey}Bar`);
    bar.style.width = `${percent}%`;
    bar.style.backgroundColor = percent >= 100 ? 'var(--danger)' : percent >= 80 ? 'var(--warning)' : 'var(--accent)';
}

function sumByCategory(category) {
    return despesas
        .filter(item => item.category === category)
        .reduce((sum, item) => sum + item.amount, 0);
}

// Totais e Indicador de Saúde
function updateTotalsAndHealth() {
    const totalExpenses = despesas.reduce((acc, item) => acc + item.amount, 0);
    const cardExpenses = despesas
        .filter(item => item.paymentMethod === 'Cartão de Crédito')
        .reduce((acc, item) => acc + item.amount, 0);

    // Dashboard Totals
    document.getElementById('dashTotalExpenses').innerText = `R$ ${totalExpenses.toFixed(2)}`;
    document.getElementById('dashCreditCardTotal').innerText = `R$ ${cardExpenses.toFixed(2)}`;

    // Tab Cartões Totals
    document.getElementById('cardFaturaTotal').innerText = `R$ ${cardExpenses.toFixed(2)}`;
    document.getElementById('cardLimitAvailable').innerText = `R$ ${(5000 - cardExpenses).toFixed(2)}`;

    // Cálculo da Saúde Financeira
    const healthStatusEl = document.getElementById('dashHealthStatus');
    const healthTipEl = document.getElementById('dashHealthTip');
    const percent = (totalExpenses / 5000) * 100;

    if (percent > 70) {
        healthStatusEl.className = "status-badge status-danger";
        healthStatusEl.innerText = `Crítica (${Math.max(0, Math.round(100 - percent))}/100)`;
        healthTipEl.innerText = "Alerta: Seus gastos ultrapassaram 70% do saldo!";
    } else if (percent > 40) {
        healthStatusEl.className = "status-badge status-warning";
        healthStatusEl.innerText = `Moderada (${Math.round(100 - percent)}/100)`;
        healthTipEl.innerText = "Atenção com novos gastos este mês.";
    } else {
        healthStatusEl.className = "status-badge status-good";
        healthStatusEl.innerText = `Excelente (${Math.round(100 - percent)}/100)`;
        healthTipEl.innerText = "Seus gastos estão sob controle!";
    }
}

// Apagar Despesa
function deleteExpense(id) {
    despesas = despesas.filter(item => item.id !== id);
    updateUI();
}

// Restaurar Dados Demo
function resetDemoData() {
    despesas = [...initialDemoData];
    document.getElementById('filterCategory').value = 'Todas';
    updateUI();
}

// Auxiliares
function formatDate(dateString) {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
}

function toggleNotifications() {
    const panel = document.getElementById('notificationPanel');
    panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
}

function openAuthModal(tab = 'login') {
    document.getElementById('authModal').style.display = 'flex';
    switchTab(tab);
}

function closeAuthModal() {
    document.getElementById('authModal').style.display = 'none';
}

function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));

    if (tab === 'login') {
        document.getElementById('loginForm').classList.add('active');
        document.getElementById('btnTabLogin').classList.add('active');
    } else if (tab === 'register') {
        document.getElementById('registerForm').classList.add('active');
        document.getElementById('btnTabRegister').classList.add('active');
    } else if (tab === 'recover') {
        document.getElementById('recoverForm').classList.add('active');
        document.getElementById('btnTabRecover').classList.add('active');
    }
}

function handleAuth(e, message) {
    e.preventDefault();
    alert(message);
    closeAuthModal();
}