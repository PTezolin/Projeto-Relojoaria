class TabelaMinimalista {
    constructor() {
        this.container = document.querySelector('.moldura-tabela');
        this.dadosOriginais = [];
        this.dadosFiltrados = [];
    }

    inicializar() {
        if (!this.container) {
            console.error('Container da tabela não encontrado');
            return;
        }
        
        this.carregarDados();
        this.criarEstruturaHTML();
        this.configurarPesquisa();
        this.renderizarTabela();
        this.aplicarEstilosScroll();
    }

    criarEstruturaHTML() {
        this.container.innerHTML = `
            <div class="tabela-minimalista-container">
                <div class="tabela-header">
                    <div class="tabela-titulo-container">
                        <h3 class="tabela-titulo">Consertos Pendentes</h3>
                        <a href="servicos.html" class="botao-ver-todos" title="Ver tabela completa">
                            <i class='bx bx-table'></i>
                        </a>
                    </div>
                </div>
                
                <div class="tabela-wrapper">
                    <table class="tabela-consertos">
                        <thead>
                            <tr>
                                <th style="width: 15%">Nº</th>
                                <th style="width: 35%">Cliente</th>
                                <th style="width: 25%">Data</th>
                                <th style="width: 25%">Tipo</th>
                            </tr>
                        </thead>
                        <tbody id="corpo-tabela">
                            <!-- Dados serão injetados aqui -->
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    configurarPesquisa() {
        const campoPesquisa = document.querySelector('.entrada-pesquisa');
        const botaoPesquisa = document.querySelector('.botao-pesquisar');

        if (!campoPesquisa || !botaoPesquisa) {
            console.warn('Elementos de pesquisa não encontrados');
            return;
        }

        const executarPesquisa = () => {
            const termo = campoPesquisa.value.toLowerCase().trim();
            this.dadosFiltrados = termo 
                ? this.filtrarDados(termo) 
                : [...this.dadosOriginais];
            this.renderizarTabela();
        };

        campoPesquisa.addEventListener('input', this.debounce(executarPesquisa, 300));
        botaoPesquisa.addEventListener('click', executarPesquisa);
    }

    filtrarDados(termo) {
        return this.dadosOriginais.filter(item => {
            return (
                (item.ordem && item.ordem.toString().includes(termo)) ||
                (item.nome && item.nome.toLowerCase().includes(termo)) ||
                (item.telefone && item.telefone.includes(termo)) ||
                (item.tipo && item.tipo.toLowerCase().includes(termo)) ||
                (item.data && this.formatarData(item.data).includes(termo))
            );
        });
    }

    debounce(func, wait) {
        let timeout;
        return function() {
            const context = this, args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                func.apply(context, args);
            }, wait);
        };
    }

    renderizarTabela() {
        const tbody = document.getElementById('corpo-tabela');
        if (!tbody) return;

        const dados = this.dadosFiltrados.length > 0 ? this.dadosFiltrados : this.dadosOriginais;
        const itensOrdenados = this.ordenarConsertosAntigosPrimeiro(dados);

        if (itensOrdenados.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="sem-itens">
                        ${document.querySelector('.entrada-pesquisa')?.value 
                            ? 'Nenhum resultado encontrado' 
                            : 'Nenhum conserto cadastrado'}
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = itensOrdenados.map(item => `
            <tr data-id="${item.id}">
                <td>${item.ordem || '--'}</td>
                <td class="nome-cliente" title="${item.nome || ''}">${this.truncarNome(item.nome)}</td>
                <td>${this.formatarData(item.data)}</td>
                <td>
                    <span class="tipo-${item.tipo || ''}">
                        ${item.tipo === 'relogio' ? 'Relógio' : 'Joia'}
                    </span>
                </td>
            </tr>
        `).join('');
    }

    aplicarEstilosScroll() {
        const style = document.createElement('style');
        style.textContent = `
            .tabela-wrapper::-webkit-scrollbar {
                width: 8px;
                height: 8px;
            }
            .tabela-wrapper::-webkit-scrollbar-thumb {
                background-color: var(--cor-borda);
                border-radius: 4px;
            }
            .tabela-wrapper::-webkit-scrollbar-track {
                background-color: var(--cor-fundo);
            }
        `;
        document.head.appendChild(style);
    }

    formatarData(dataString) {
        if (!dataString) return '--';
        
        try {
            const data = new Date(dataString);
            if (isNaN(data.getTime())) return dataString;
            
            const dia = data.getDate().toString().padStart(2, '0');
            const mes = (data.getMonth() + 1).toString().padStart(2, '0');
            return `${dia}/${mes}`;
        } catch {
            return dataString;
        }
    }

    truncarNome(nome) {
        if (!nome) return '--';
        return nome.length > 20 ? `${nome.substring(0, 17)}...` : nome;
    }

    carregarDados() {
        const dadosSalvos = localStorage.getItem('consertosMissaglia');
        this.dadosOriginais = dadosSalvos ? JSON.parse(dadosSalvos) : [];
        this.dadosFiltrados = [...this.dadosOriginais];
    }

    ordenarConsertosAntigosPrimeiro(dados) {
        return dados.filter(item => {
            const status = item.status ? item.status.toLowerCase() : '';
            return !status.includes('retirado');
        }).sort((a, b) => {
            const dataA = a.dataCadastro || a.data || '';
            const dataB = b.dataCadastro || b.data || '';
            return new Date(dataA) - new Date(dataB);
        });
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    const tabela = new TabelaMinimalista();
    tabela.inicializar();
});