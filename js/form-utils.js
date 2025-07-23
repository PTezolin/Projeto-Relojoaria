// form-utils.js - Módulo unificado de formatação e validação
document.addEventListener('DOMContentLoaded', function() {
    // ======================================================================
    // MÓDULO DE FORMATAÇÃO
    // ======================================================================

    /**
     * Formata um número de telefone conforme o usuário digita
     * @param {HTMLInputElement} input - Campo de entrada do telefone
     */
    function formatarTelefone(input) {
        // Remove todos os caracteres não numéricos
        let valor = input.value.replace(/\D/g, '');

        // Limpa o campo se estiver vazio
        if (valor.length === 0) {
            input.value = '';
            return;
        }

        // Aplica a formatação progressiva conforme o tamanho do valor
        if (valor.length <= 2) {
            input.value = `(${valor}`;
        } else if (valor.length <= 6) {
            input.value = `(${valor.slice(0, 2)}) ${valor.slice(2)}`;
        } else if (valor.length <= 10) {
            input.value = `(${valor.slice(0, 2)}) ${valor.slice(2, 6)}-${valor.slice(6)}`;
        } else {
            input.value = `(${valor.slice(0, 2)}) ${valor.slice(2, 7)}-${valor.slice(7, 11)}`;
        }
    }

    /**
     * Configura os eventos necessários para um campo de telefone
     * @param {HTMLInputElement} input - Elemento input a ser configurado
     */
    function configurarTelefone(input) {
        // Evento para formatação automática durante a digitação
        input.addEventListener('input', function() {
            formatarTelefone(this);
            if (this.value.length > 0) {
                this.classList.remove('erro');
                const erroElement = document.getElementById(`${this.id}-erro`);
                if (erroElement) erroElement.style.display = 'none';
            }
        });

        // Evento para tratamento especial do Backspace
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Backspace' && this.selectionStart === this.selectionEnd) {
                const pos = this.selectionStart;
                const val = this.value;
                const char = val[pos - 1];

                // Verifica se está apagando um caractere de formatação
                if (['(', ')', ' ', '-'].includes(char)) {
                    e.preventDefault();
                    const newPos = pos - 1;
                    
                    // Tratamento especial para posições específicas
                    if ([3, 8, 10].includes(pos)) {
                        this.value = val.slice(0, newPos) + val.slice(pos);
                        formatarTelefone(this);
                    }
                    this.setSelectionRange(newPos, newPos);
                }
            }
        });
    }

    /**
     * Formata valor monetário (R$ 1.234,56)
     * @param {string} valor - Valor a ser formatado
     * @returns {string} Valor formatado
     */
    function formatarValor(valor) {
        const numero = valor.replace(/\D/g, '').replace(/^0+/, '') || '0';
        return `R$ ${parseInt(numero, 10).toLocaleString('pt-BR')}`;
    }

    /**
     * Formata dinamicamente o valor monetário e move o cursor ao final
     * @param {HTMLInputElement} input - Campo de entrada do valor
     */
    function formatarValorDinamico(input) {
        input.value = formatarValor(input.value);
        requestAnimationFrame(() => {
            input.setSelectionRange(input.value.length, input.value.length);
        });
    }

    // ======================================================================
    // MÓDULO DE VALIDAÇÃO
    // ======================================================================

    /**
     * Valida um campo de formulário
     * @param {HTMLInputElement} input - Campo a ser validado
     * @returns {boolean} True se válido, False se inválido
     */
    function validarCampo(input) {
        const tipo = input.id.split('-')[0];
        const validador = validadores[tipo];
        const valor = input.value.trim();
        let valido = false;

        if (validador) {
            valido = valor && validador.regex.test(valor);
            if (valido && validador.validacaoExtra) {
                valido = validador.validacaoExtra(valor);
            }
        }

        return valido;
    }

    // Módulo de Validação
    const validadores = {
        'nome': {
            regex: /^[a-zA-ZÀ-ÿ\s]{2,}$/,
            mensagem: 'Por favor, insira um nome válido (mínimo 2 caracteres)'
        },
        'ordem': {
            regex: /^\d+$/,
            mensagem: 'Por favor, informe um número de ordem válido'
        },
        'telefone': {
            regex: /^\(\d{2}\) \d{4,5}-\d{4}$/,
            mensagem: 'Por favor, informe um telefone válido'
        },
        'valor': {
            regex: /^R\$\s?\d{1,3}(?:\.\d{3})*(?:,\d{2})?$/,
            mensagem: 'Valor válido',
            validacaoExtra: (valor) => {
                const valorNumerico = parseFloat(valor.replace(/[^\d,]/g, '').replace(',', '.'));
                return !isNaN(valorNumerico) && valorNumerico > 0;
            }
        }
    };

    // Adicione isso na seção de exportação
    window.validadores = validadores;

    // Adicionar no início do módulo de validação em form-utils.js
    const criarElementoErro = (container) => {
        const erroElement = document.createElement('div');
        erroElement.className = 'balao-erro';
        erroElement.innerHTML = `
            <i class='bx bxs-error-circle'></i>
            <span class="mensagem-erro"></span>
        `;
        container.appendChild(erroElement);
        return erroElement;
    };

    // Modificar a função exibirErro para ser mais completa
    function exibirErro(input, valido, mensagemPersonalizada = null) {
        const grupo = input.closest('.grupo-formulario');
        let balaoErro = grupo.querySelector('.balao-erro');
        
        if (!balaoErro) {
            balaoErro = criarElementoErro(grupo);
        }
        
        grupo.classList.toggle('invalido', !valido);
        
        if (!valido) {
            const mensagem = mensagemPersonalizada || validadores[input.id.split('-')[0]]?.mensagem || 'Campo inválido';
            balaoErro.querySelector('.mensagem-erro').textContent = mensagem;
            balaoErro.style.display = 'flex';
        } else {
            balaoErro.style.display = 'none';
        }
    }

    // Adicionar função de validação completa que pode ser usada externamente
    function validarFormularioCompleto(form) {
        let valido = true;
        const campos = form.querySelectorAll('input[required], textarea[required]');
        
        campos.forEach(input => {
            const campoValido = validarCampo(input);
            if (!campoValido) {
                valido = false;
                // Rola até o primeiro campo inválido
                input.closest('.grupo-formulario').scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }
        });
        
        return valido;
    }

    // Exportar as novas funções
    window.validarFormularioCompleto = validarFormularioCompleto;
    window.exibirErro = exibirErro;

    // ======================================================================
    // INICIALIZAÇÃO DOS COMPONENTES
    // ======================================================================

    /**
     * Inicializa todos os campos de telefone da página
     */
    function inicializarCamposTelefone() {
        document.querySelectorAll('input[type="tel"]').forEach(input => {
            formatarTelefone(input);
            configurarTelefone(input);
        });
    }

    /**
     * Configura eventos de validação para campos obrigatórios
     */
    function configurarValidacao() {
        // Configuração especial para campos de valor
        document.querySelectorAll('.entrada-valor').forEach(input => {
            input.addEventListener('input', function() {
                if (typeof formatarValorDinamico === 'function') {
                    formatarValorDinamico(this);
                }
                exibirErro(this, validarCampo(this));
            });
        });

        // Configuração para outros campos obrigatórios
        document.querySelectorAll('input[required], textarea[required]').forEach(input => {
            // Validação ao sair do campo
            input.addEventListener('blur', function() {
                exibirErro(this, validarCampo(this));
            });

            // Feedback durante a digitação
            input.addEventListener('input', function() {
                exibirErro(this, true); // Remove erro enquanto digita
            });
        });

        // Validação ao enviar o formulário
        document.querySelectorAll('.botao-confirmar').forEach(botao => {
            botao.addEventListener('click', function(e) {
                e.preventDefault();
                const form = this.closest('form') || this.closest('.formulario-conteudo');
                let formValido = true;
                const primeirosInvalidos = [];

                // Valida todos os campos obrigatórios
                form.querySelectorAll('input[required], textarea[required]').forEach(input => {
                    const valido = validarCampo(input);
                    if (!valido) {
                        formValido = false;
                        primeirosInvalidos.push(input.closest('.grupo-formulario'));
                        exibirErro(input, false);
                    }
                });

                if (formValido) {
                    alert('Formulário válido! Pronto para enviar.');
                    // form.submit(); // Descomente para enviar
                } else if (primeirosInvalidos.length > 0) {
                    primeirosInvalidos[0].scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }
            });
        });
    }

    // Inicializa tudo quando o DOM estiver pronto
    inicializarCamposTelefone();
    configurarValidacao();

    // ======================================================================
    // EXPORTAÇÃO DE FUNÇÕES PARA USO GLOBAL
    // ======================================================================

    window.formatarTelefone = formatarTelefone;
    window.formatarValorDinamico = formatarValorDinamico;
    window.configurarTelefone = configurarTelefone;
    window.validarCampo = validarCampo;  // Adicione esta linha
    window.validarFormularioCompleto = validarFormularioCompleto;
    window.exibirErro = exibirErro;
    window.validadores = validadores;
});