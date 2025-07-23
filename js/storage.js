// storage.js - Módulo centralizado para gerenciamento de dados
class DataService {
    constructor() {
        // Configurações
        this.STORAGE_KEY = 'consertosMissaglia';
        this.PREVIEW_DURATION = 5000; // 5 segundos
        this.MAX_PHOTOS = 3;

        // Elementos do DOM
        this.formContainer = document.getElementById('form-container');
        this.confirmButton = document.querySelector('.botao-confirmar');
        
        // Estado
        this.currentFormType = 'relogio';
        this.isEditMode = false;
        this.currentEditId = null;
        
        // Inicialização
        this.init();
    }

    init() {
        // Configura o listener principal
        this.setupConfirmButtonListener();
    }

    // ======================================================================
    // TAREFA 1: ESTRUTURA FUNDAMENTAL
    // ======================================================================

    setupConfirmButtonListener() {
        // Usa event delegation para lidar com botões dinâmicos
        document.addEventListener('click', (e) => {
            if (e.target.closest('.botao-confirmar')) {
                this.handleFormSubmission();
            }
        });
    }

    // ======================================================================
    // TAREFA 2: COLETA DE DADOS
    // ======================================================================

    coletarDadosFormulario() {
        const formType = this.getCurrentFormType();
        const dados = {
            tipo: formType,
            fotos: window.fotosNoFormulario || [],
            dataCadastro: new Date().toISOString(),
            status: 'pendente'
        };

        // Campos comuns a todos os formulários
        this.coletarCamposComuns(dados);
        
        // Campos específicos
        if (formType === 'relogio') {
            this.coletarDadosRelogio(dados);
        } else if (formType === 'joia') {
            this.coletarDadosJoia(dados);
        }

        return dados;
    }

    coletarCamposComuns(dados) {
        dados.nome = document.getElementById('nome')?.value.trim() || '';
        dados.ordem = document.getElementById('ordem')?.value.trim() || '';
        dados.telefone = document.getElementById('telefone')?.value.trim() || '';
        dados.data = document.getElementById('data')?.value.trim() || '';
        dados.sexo = document.querySelector('input[name="sexo"]:checked')?.value || 'F';
        dados.descricao = document.getElementById('descricao')?.value.trim() || '';
        
        // Formata o valor monetário
        const valorInput = document.getElementById('valor');
        if (valorInput) {
            const valorNumerico = parseFloat(
                valorInput.value.replace(/[^\d,]/g, '')
                .replace(',', '.')
            );
            dados.valor = isNaN(valorNumerico) ? 0 : valorNumerico;
        }
    }

    coletarDadosRelogio(dados) {
        dados.marcas = this.getSelectedValues('marcas-relogio-selecionadas');
        dados.cores = this.getSelectedValues('cores-relogio-selecionadas');
        dados.modelos = this.getSelectedValues('modelos-relogio-selecionados');
        
        // Serviços específicos
        dados.servicos = this.getCheckedValues('servicos');
    }

    coletarDadosJoia(dados) {
        dados.modelo = this.getSelectedValues('modelos-selecionados');
        dados.tamanho = document.getElementById('tamanho')?.value.trim() || '';
        dados.peso = document.getElementById('peso')?.value.trim() || '';
        
        // Serviços específicos
        dados.servicos = this.getCheckedValues('servicos');
    }

    getSelectedValues(hiddenInputId) {
        const hiddenInput = document.getElementById(hiddenInputId);
        return hiddenInput?.value.split(',').filter(Boolean) || [];
    }

    getCheckedValues(name) {
        return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`))
            .map(el => el.value);
    }

    getCurrentFormType() {
        const activeButton = document.querySelector('.botao-seletor.ativo');
        return activeButton?.dataset.form || 'relogio';
    }

    // ======================================================================
    // TAREFA 3: VALIDAÇÃO DE DADOS
    // ======================================================================
    validarDados(dados) {
        const form = document.querySelector('.formulario-conteudo') || document.querySelector('form');
        
        // Valida todos os campos obrigatórios
        let valido = true;
        const campos = form.querySelectorAll('input[required], textarea[required]');
        
        campos.forEach(input => {
            const campoValido = validarCampo(input);
            if (!campoValido) {
                valido = false;
                exibirErro(input, false);
                
                // Rola até o primeiro campo inválido
                if (valido === false) { // Apenas o primeiro erro
                    input.closest('.grupo-formulario').scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }
            }
        });
        
        return valido;
    }

    // ======================================================================
    // TAREFA 4: PERSISTÊNCIA NO LOCALSTORAGE
    // ======================================================================

    salvarDados(dados) {
        // Carrega dados existentes
        const todosDados = this.carregarTodosDados();
        
        // Gera um ID único ou usa o ID de edição
        const id = this.isEditMode ? this.currentEditId : this.gerarId();
        dados.id = id;
        
        // Atualiza ou adiciona novo registro
        if (this.isEditMode) {
            const index = todosDados.findIndex(item => item.id === id);
            if (index !== -1) {
                todosDados[index] = dados;
            }
        } else {
            todosDados.push(dados);
        }
        
        // Salva no localStorage
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(todosDados));
        
        return dados;
    }

    carregarTodosDados() {
        const dados = localStorage.getItem(this.STORAGE_KEY);
        return dados ? JSON.parse(dados) : [];
    }

    gerarId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // ======================================================================
    // TAREFA 5: FEEDBACK VISUAL E LIMPEZA
    // ======================================================================

    mostrarPreviewDados(dados) {
        // Cria o elemento preview
        const preview = document.createElement('div');
        preview.className = 'preview-dados';
        
        // Aplica estilos
        Object.assign(preview.style, {
            position: 'fixed',
            bottom: '22px',
            right: '22px',
            width: '350px',
            padding: '15px',
            backgroundColor: '#fff',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: '1000',
            transition: 'all 0.3s ease',
            borderLeft: '4px solid var(--cor-destaque)'
        });
        
        // Constrói o conteúdo
        preview.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <h4 style="margin: 0; color: var(--cor-destaque);">Cadastro realizado!</h4>
                <button class="fechar-preview" style="background: none; border: none; font-size: 18px; cursor: pointer;">×</button>
            </div>
            
            <div style="margin-bottom: 10px;">
                <p style="margin: 5px 0;"><strong>Cliente:</strong> ${dados.nome}</p>
                <p style="margin: 5px 0;"><strong>Ordem:</strong> ${dados.ordem}</p>
                <p style="margin: 5px 0;"><strong>Telefone:</strong> ${dados.telefone}</p>
                <p style="margin: 5px 0;"><strong>Data:</strong> ${dados.data}</p>
                <p style="margin: 5px 0;"><strong>Valor:</strong> R$ ${dados.valor.toFixed(2).replace('.', ',')}</p>
            </div>
            
            ${dados.fotos.length > 0 ? `
                <div style="margin-top: 10px;">
                    <img src="${dados.fotos[0].url}" alt="Preview" style="width: 50%; border-radius: 4px; border: 1px solid #eee;">
                </div>
            ` : ''}
        `;
        
        // Adiciona ao DOM
        document.body.appendChild(preview);
        
        // Configura o botão de fechar
        preview.querySelector('.fechar-preview').addEventListener('click', () => {
            preview.remove();
        });
        
        // Remove automaticamente após o tempo definido
        setTimeout(() => {
            if (document.body.contains(preview)) {
                preview.style.opacity = '0';
                setTimeout(() => preview.remove(), 3000);
            }
        }, this.PREVIEW_DURATION);
    }

    limparFormulario() {
        // Limpa campos comuns
        document.getElementById('nome').value = '';
        document.getElementById('ordem').value = '';
        document.getElementById('telefone').value = '';
        document.getElementById('data').value = this.formatarDataAtual();
        document.getElementById('descricao').value = '';
        document.getElementById('valor').value = '';
        
        // Limpa campos específicos
        if (this.currentFormType === 'relogio') {
            this.limparMultiselect('marca-relogio-multiselect');
            this.limparMultiselect('cor-relogio-multiselect');
            this.limparMultiselect('modelo-relogio-multiselect');
            document.querySelectorAll('input[name="servicos"]').forEach(cb => cb.checked = false);
        } else {
            this.limparMultiselect('modelo-multiselect');
            document.getElementById('tamanho').value = '';
            document.getElementById('peso').value = '';
            document.querySelectorAll('input[name="servicos"]').forEach(cb => cb.checked = false);
        }
        
        // Limpa fotos
        window.fotosNoFormulario = [];
    }

    limparMultiselect(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            const tagsContainer = container.querySelector('.tags-container');
            const hiddenInput = container.querySelector('input[type="hidden"]');
            
            if (tagsContainer) tagsContainer.innerHTML = '';
            if (hiddenInput) hiddenInput.value = '';
            
            // Desmarca checkboxes
            container.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                cb.checked = false;
            });
        }
    }

    formatarDataAtual() {
        const data = new Date();
        const dia = String(data.getDate()).padStart(2, '0');
        const mes = String(data.getMonth() + 1).padStart(2, '0');
        const ano = data.getFullYear();
        return `${dia}/${mes}/${ano}`;
    }

    // ======================================================================
    // FLUXO PRINCIPAL
    // ======================================================================

    handleFormSubmission() {
        // 1. Coleta dados
        const dados = this.coletarDadosFormulario();
        
        // 2. Valida dados
        if (!this.validarDados(dados)) {
            return;
        }
        
        // 3. Salva dados
        const dadosSalvos = this.salvarDados(dados);
        
        // 4. Feedback visual
        this.mostrarPreviewDados(dadosSalvos);
        
        // 5. Limpa formulário
        this.limparFormulario();
        
        // 6. Recarrega o formulário para novo cadastro
        const activeButton = document.querySelector('.botao-seletor.ativo');
        if (activeButton) {
            activeButton.click(); // Dispara o evento para recarregar o form
        }
    }
}

// Inicializa o serviço de dados quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    new DataService();
});