// datepicker.js
let datePickerAtivo = null;
let dataAtual = new Date();

// Função para inicializar o datepicker em um container
function initDatePicker(container) {
    const input = container.querySelector('.entrada-data');
    const botao = container.querySelector('.botao-calendario');
    const datePicker = container.querySelector('.date-picker');
    
    // Configura eventos
    input.addEventListener('input', formatarDataInput);
    botao.addEventListener('click', (e) => {
        e.stopPropagation();
        mostrarDatePicker(container);
    });
    
    // Inicializa com a data atual se vazio
    if (!input.value) {
        input.value = formatarDataAtual();
    }
}

// Formatar data como DD/MM/AAAA
function formatarDataAtual() {
    const dia = String(dataAtual.getDate()).padStart(2, '0');
    const mes = String(dataAtual.getMonth() + 1).padStart(2, '0');
    const ano = dataAtual.getFullYear();
    return `${dia}/${mes}/${ano}`;
}

// Formatar input enquanto digita
function formatarDataInput(event) {
    const input = event.target;
    let value = input.value.replace(/\D/g, '');
    
    if (value.length > 2) {
        value = value.substring(0, 2) + '/' + value.substring(2);
    }
    if (value.length > 5) {
        value = value.substring(0, 5) + '/' + value.substring(5, 9);
    }
    
    input.value = value;
}

// Mostrar datepicker
function mostrarDatePicker(container) {
    const datePicker = container.querySelector('.date-picker');
    const input = container.querySelector('.entrada-data');
    
    // Se já está aberto, fecha
    if (datePickerAtivo === datePicker) {
        fecharDatePicker();
        return;
    }
    
    // Fecha qualquer outro aberto
    if (datePickerAtivo) {
        fecharDatePicker();
    }
    
    datePickerAtivo = datePicker;
    
    // Atualiza dataAtual com o valor do input
    if (input.value) {
        const partes = input.value.split('/');
        if (partes.length === 3) {
            dataAtual = new Date(partes[2], partes[1] - 1, partes[0]);
        }
    } else {
        dataAtual = new Date();
    }
    
    atualizarDatePicker(container);
    datePicker.style.display = 'block';
    
    // Adiciona listener para fechar ao clicar fora
    setTimeout(() => document.addEventListener('click', fecharDatePickerAoClicarFora), 10);
}

// Atualizar calendário
function atualizarDatePicker(container) {
    const mesAnoElement = container.querySelector('.date-picker-header h4');
    const gridElement = container.querySelector('.date-picker-grid');
    const input = container.querySelector('.entrada-data');
    
    const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", 
                  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    mesAnoElement.textContent = `${meses[dataAtual.getMonth()]} ${dataAtual.getFullYear()}`;
    
    gridElement.innerHTML = '';
    
    // Dias da semana
    const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    diasSemana.forEach(dia => {
        const diaElement = document.createElement('div');
        diaElement.className = 'dia-semana';
        diaElement.textContent = dia;
        gridElement.appendChild(diaElement);
    });
    
    // Dias do mês
    const primeiroDia = new Date(dataAtual.getFullYear(), dataAtual.getMonth(), 1);
    const ultimoDia = new Date(dataAtual.getFullYear(), dataAtual.getMonth() + 1, 0);
    const diaSemanaPrimeiroDia = primeiroDia.getDay();
    const hoje = new Date();
    
    // Dias vazios
    for (let i = 0; i < diaSemanaPrimeiroDia; i++) {
        gridElement.appendChild(document.createElement('div')).className = 'dia-outro-mes';
    }
    
    // Dias do mês
    for (let i = 1; i <= ultimoDia.getDate(); i++) {
        const diaElement = document.createElement('div');
        diaElement.textContent = i;
        diaElement.className = 'dia';
        
        // Dia atual
        if (i === hoje.getDate() && 
            dataAtual.getMonth() === hoje.getMonth() && 
            dataAtual.getFullYear() === hoje.getFullYear()) {
            diaElement.classList.add('dia-atual');
        }
        
        // Dia selecionado
        if (input.value) {
            const partes = input.value.split('/');
            if (partes.length === 3 && 
                i === parseInt(partes[0]) && 
                (dataAtual.getMonth() + 1) === parseInt(partes[1]) && 
                dataAtual.getFullYear() === parseInt(partes[2])) {
                diaElement.classList.add('dia-selecionado');
            }
        }
        
        diaElement.addEventListener('click', () => {
            selecionarDia(i, container);
        });
        gridElement.appendChild(diaElement);
    }
}

// Selecionar dia
function selecionarDia(dia, container) {
    const input = container.querySelector('.entrada-data');
    const mes = dataAtual.getMonth() + 1;
    const ano = dataAtual.getFullYear();
    input.value = `${String(dia).padStart(2, '0')}/${String(mes).padStart(2, '0')}/${ano}`;
    fecharDatePicker();
}

// Mudar mês
function mudarMes(delta) {
    const container = datePickerAtivo.closest('.container-data');
    dataAtual = new Date(dataAtual.getFullYear(), dataAtual.getMonth() + delta, 1);
    atualizarDatePicker(container);
}

// Fechar datepicker
function fecharDatePicker() {
    if (datePickerAtivo) {
        datePickerAtivo.style.display = 'none';
        datePickerAtivo = null;
    }
    document.removeEventListener('click', fecharDatePickerAoClicarFora);
}

// Fechar ao clicar fora
function fecharDatePickerAoClicarFora(event) {
    if (datePickerAtivo && !datePickerAtivo.contains(event.target)) {
        const container = datePickerAtivo.closest('.container-data');
        const input = container.querySelector('.entrada-data');
        const botao = container.querySelector('.botao-calendario');
        
        if (event.target !== input && event.target !== botao && !botao.contains(event.target)) {
            fecharDatePicker();
        }
    }
}

// Exportar funções para uso em outros arquivos
window.initDatePicker = initDatePicker;
window.mostrarDatePicker = mostrarDatePicker;
window.mudarMes = mudarMes;
window.formatarDataInput = formatarDataInput;