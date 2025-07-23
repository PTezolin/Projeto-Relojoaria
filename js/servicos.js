// servicos.js - Sistema unificado de visualização de serviços
document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const tituloPagina = document.getElementById('texto-titulo');
    const contadorItens = document.getElementById('contador-itens');
    const acoesCabecalho = document.getElementById('acoes-cabecalho');
    const campoBusca = document.getElementById('campo-busca');
    const limparBusca = document.getElementById('limpar-busca');
    const filtros = document.querySelectorAll('input[name="filtro-servico"]');
    const mensagemVazia = document.getElementById('mensagem-lista-vazia');
    const iconeVazio = document.getElementById('icone-vazio');
    const textoVazio = document.getElementById('texto-vazio');
    const tabelaContainer = document.getElementById('tabela-container');

    // Estado da aplicação
    const estado = {
        modo: 'ativos', // 'ativos' ou 'retirados'
        filtroTipo: 'todos', // 'todos', 'relogio', 'joia'
        termoBusca: '',
        dadosCompletos: [],
        dadosFiltrados: []
    };

    // Inicialização
    init();

    function init() {
        const urlParams = new URLSearchParams(window.location.search);
        estado.modo = urlParams.get('modo') === 'retirados' ? 'retirados' : 'ativos'; // Adicione esta linha
        estado.filtroTipo = urlParams.get('filtro') || 'todos';
    
        // Configura a interface baseada no modo
        configurarInterface();
        
        // Carrega e processa os dados
        carregarEProcessarDados();
        
        // Configura os event listeners
        configurarEventos();
    }

    function configurarInterface() {
        if (estado.modo === 'retirados') {
            tituloPagina.textContent = 'Serviços Retirados';
            iconeVazio.className = 'bx bx-package servicos-vazio-icone';
            textoVazio.textContent = 'Nenhum item retirado';
            
            // Botão para voltar aos ativos
            acoesCabecalho.innerHTML = `
                <a href="servicos.html" class="servicos-botao servicos-botao--primario">
                    <i class='bx bx-arrow-back'></i>
                    Ver Serviços Ativos
                </a>
            `;
        } else {
            tituloPagina.textContent = 'Serviços em Aberto';
            iconeVazio.className = 'bx bx-time-five servicos-vazio-icone';
            textoVazio.textContent = 'Nenhum serviço em aberto';
            
            // Botão para ver retirados
            acoesCabecalho.innerHTML = `
                <a href="servicos.html?modo=retirados" class="servicos-botao servicos-botao--primario">
                    <i class='bx bx-check-circle'></i>
                    Ver Serviços Retirados
                </a>
            `;
        }
    }

    function carregarEProcessarDados() {
        // Carrega todos os dados do localStorage
        const dadosSalvos = localStorage.getItem('consertosMissaglia');
        estado.dadosCompletos = dadosSalvos ? JSON.parse(dadosSalvos) : [];
        
        // Aplica os filtros
        aplicarFiltros();
    }

    // Modifique a função aplicarFiltros() para usar o filtro da URL:
    function aplicarFiltros() {
        // Filtra pelo modo (ativos/retirados) - mantido do original
        let dadosFiltrados = estado.dadosCompletos.filter(item => {
            const status = item.status ? item.status.toLowerCase() : '';
            if (estado.modo === 'retirados') {
                return status.includes('retirado');
            } else {
                return !status.includes('retirado');
            }
        });

        // Filtra pelo tipo da URL (adicionado)
        if (estado.filtroTipo !== 'todos') {
            dadosFiltrados = dadosFiltrados.filter(item => 
                item.tipo && item.tipo.toLowerCase() === estado.filtroTipo.toLowerCase()
            );
        }

        // Filtra pelo termo de busca (mantido do original)
        if (estado.termoBusca) {
            const termo = estado.termoBusca.toLowerCase();
            dadosFiltrados = dadosFiltrados.filter(item => 
                (item.nome && item.nome.toLowerCase().includes(termo)) ||
                (item.ordem && item.ordem.toString().includes(termo)) ||
                (item.telefone && item.telefone.includes(termo)) ||
                (item.status && item.status.toLowerCase().includes(termo))
            );
        }

        estado.dadosFiltrados = dadosFiltrados;
        renderizarTabela();
        atualizarUI();
    }

    function renderizarTabela() {
        if (estado.dadosFiltrados.length === 0) {
            tabelaContainer.innerHTML = '';
            return;
        }

        // Cria o HTML da tabela
        tabelaContainer.innerHTML = `
            <div class="tabela-wrapper">
                <table class="tabela-consertos">
                    <thead>
                        <tr>
                            <th>Nº</th>
                            <th>Cliente</th>
                            <th>Telefone</th>
                            <th>Tipo</th>
                            ${estado.modo === 'retirados' ? '<th>Data Retirada</th>' : '<th>Status</th>'}
                            <th>Data</th>
                            <th>Valor</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${estado.dadosFiltrados.map(item => `
                            <tr data-id="${item.id}">
                                <td>${item.ordem || ''}</td>
                                <td>${item.nome || ''}</td>
                                <td>${item.telefone || ''}</td>
                                <td>
                                    <span class="tag-tipo tipo-${item.tipo || ''}">
                                        ${item.tipo === 'relogio' ? 'Relógio' : 'Joia'}
                                    </span>
                                </td>
                                ${estado.modo === 'retirados' ? 
                                    `<td>${item.dataRetirada || item.data || ''}</td>` : 
                                    `<td>
                                        <span class="tag-status status-${getStatusClass(item.status)}">
                                            ${item.status || 'Pendente'}
                                        </span>
                                    </td>`
                                }
                                <td>${item.data || ''}</td>
                                <td>${item.valor || ''}</td>
                                <td class="celula-acoes">
                                    <div class="acoes-container">
                                        <button class="acao-btn whatsapp" title="Enviar WhatsApp">
                                            <i class='bx bxl-whatsapp'></i>
                                        </button>
                                        <button class="acao-btn visualizar" title="Visualizar">
                                            <i class='bx bx-show'></i>
                                        </button>
                                        ${estado.modo === 'ativos' ? `
                                        <button class="acao-btn editar" title="Editar">
                                            <i class='bx bx-edit'></i>
                                        </button>
                                        <button class="acao-btn retirar" title="Retirar">
                                            <i class='bx bx-check-circle'></i>
                                        </button>
                                        ` : ''}
                                        <button class="acao-btn deletar" title="Excluir">
                                            <i class='bx bx-trash'></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        // Adiciona eventos aos botões
        adicionarEventosBotoes();
    }

    function adicionarEventosBotoes() {
        // WhatsApp
        document.querySelectorAll('.acao-btn.whatsapp').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.closest('tr').dataset.id;
                enviarWhatsApp(id);
            });
        });

        // Visualizar
        document.querySelectorAll('.acao-btn.visualizar').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.closest('tr').dataset.id;
                visualizarItem(id);
            });
        });

        // Editar (apenas para ativos)
        if (estado.modo === 'ativos') {
            document.querySelectorAll('.acao-btn.editar').forEach(btn => {
                btn.addEventListener('click', function() {
                    const id = this.closest('tr').dataset.id;
                    editarItem(id);
                });
            });

            // Retirar (apenas para ativos)
            document.querySelectorAll('.acao-btn.retirar').forEach(btn => {
                btn.addEventListener('click', function() {
                    const id = this.closest('tr').dataset.id;
                    marcarComoRetirado(id);
                });
            });
        }

        // Excluir
        document.querySelectorAll('.acao-btn.deletar').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.closest('tr').dataset.id;
                excluirItem(id);
            });
        });
    }

    function atualizarUI() {
        // Atualiza contador
        contadorItens.textContent = `${estado.dadosFiltrados.length} ${estado.dadosFiltrados.length === 1 ? 'item' : 'itens'}`;
        
        // Mostra/oculta mensagem de vazio
        if (estado.dadosFiltrados.length === 0) {
            mensagemVazia.style.display = 'flex';
            tabelaContainer.style.display = 'none';
        } else {
            mensagemVazia.style.display = 'none';
            tabelaContainer.style.display = 'block';
        }
        
        // Mostra/oculta botão de limpar busca
        limparBusca.hidden = !estado.termoBusca;
    }

    function configurarEventos() {
        // Busca
        campoBusca.addEventListener('input', debounce(function() {
            estado.termoBusca = this.value;
            aplicarFiltros();
        }, 300));
    
        // Limpar busca
        limparBusca.addEventListener('click', function() {
            campoBusca.value = '';
            estado.termoBusca = '';
            aplicarFiltros();
        });
    
        // Filtros
        filtros.forEach(filtro => {
            filtro.addEventListener('change', function() {
                estado.filtroTipo = this.value;
                aplicarFiltros();
            });
        });
    }

    // Funções auxiliares
    function getStatusClass(status) {
        if (!status) return 'pendente';
        const statusLower = status.toLowerCase();
        if (statusLower.includes('pendente')) return 'pendente';
        if (statusLower.includes('andamento')) return 'andamento';
        if (statusLower.includes('concluído') || statusLower.includes('concluido')) return 'concluido';
        if (statusLower.includes('retirado')) return 'retirado';
        return 'pendente';
    }

    function debounce(func, wait) {
        let timeout;
        return function() {
            const context = this, args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                func.apply(context, args);
            }, wait);
        };
    }

    // Funções de ação (implementações simplificadas)
    function enviarWhatsApp(id) {
        const item = estado.dadosFiltrados.find(item => item.id == id);
        if (!item || !item.telefone) return;

        const phone = item.telefone.replace(/\D/g, '');
        if (!phone) return;

        const message = `Olá ${item.nome || 'Cliente'}, aqui está a informação sobre seu serviço:\n\n` +
                       `Nº Ordem: ${item.ordem || 'N/A'}\n` +
                       `Tipo: ${item.tipo === 'relogio' ? 'Relógio' : 'Joia'}\n` +
                       `Status: ${item.status || 'Pendente'}\n` +
                       `Valor: ${item.valor || 'N/A'}\n\n` +
                       `Atenciosamente, Missaglia Relojoaria.`;
        
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    }

    function visualizarItem(id) {
        const item = estado.dadosFiltrados.find(item => item.id == id);
        if (!item) return;
    
        // Implementação do modal de visualização (similar ao código anterior)
        // ...
    }

    function editarItem(id) {
        const item = estado.dadosFiltrados.find(item => item.id == id);
        if (!item) return;
        window.location.href = `index.html?edit=${id}&tipo=${item.tipo}`;
    }

    function marcarComoRetirado(id) {
        if (confirm('Deseja realmente marcar este item como retirado?')) {
            const dadosAtuais = JSON.parse(localStorage.getItem('consertosMissaglia'));
            const itemIndex = dadosAtuais.findIndex(item => item.id == id);
            
            if (itemIndex !== -1) {
                dadosAtuais[itemIndex].status = 'Retirado';
                dadosAtuais[itemIndex].dataRetirada = new Date().toLocaleDateString();
                localStorage.setItem('consertosMissaglia', JSON.stringify(dadosAtuais));
                carregarEProcessarDados();
            }
        }
    }

    function excluirItem(id) {
        if (confirm('Deseja realmente excluir este item permanentemente?')) {
            const dadosAtuais = JSON.parse(localStorage.getItem('consertosMissaglia'));
            const novosDados = dadosAtuais.filter(item => item.id != id);
            localStorage.setItem('consertosMissaglia', JSON.stringify(novosDados));
            carregarEProcessarDados();
        }
    }

    // Inicializa a tabela recente
    const tabelaRecente = new TabelaRecente();
    tabelaRecente.inicializar();
});