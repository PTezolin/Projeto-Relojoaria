document.addEventListener('DOMContentLoaded', () => {
    const botoes = document.querySelectorAll('.botao-seletor');
    const container = document.getElementById('form-container');

    // HTML base COMUM com placeholders estratégicos
    const htmlBase = `
    <div class="formulario-conteudo">
        <!-- Primeira Linha (Nome e Ordem) -->
        <div class="linha-formulario linha-nome-ordem">
            <!-- Campo Nome -->
            <div class="grupo-formulario grupo-nome">
                <label for="nome">Nome:</label>
                <input type="text" id="nome" class="entrada-formulario" name="nome" required
                    placeholder="Insira o nome do cliente"   
                    oninput="this.value=this.value.replace(/[^a-zA-ZÀ-ÿ ]/g,'')">
            </div>
            
            <!-- Campo Número de Ordem -->
            <div class="grupo-formulario grupo-ordem">
                <div class="container-icone-foto">
                    <button type="button" class="botao-foto" title="Adicionar foto">
                        <i class='bx bxs-camera-plus'></i>
                    </button>
                </div>
                <label for="ordem">N° Ordem:</label>
                <input type="text" id="ordem" class="entrada-formulario" name="ordem"
                    inputmode="numeric" required
                    pattern="\\d+"
                    placeholder="XXX"
                    oninput="this.value=this.value.replace(/\\D/g,'')">
            </div>
        </div>

        <!-- Segunda Linha (Telefone, Data, Sexo) -->
        <div class="linha-formulario linha-telefone-data-sexo">
            <!-- Campo Telefone -->
            <div class="grupo-formulario grupo-telefone">
                <label for="telefone">Telefone:</label>
                <input type="tel" id="telefone" class="entrada-formulario" 
                    placeholder="(XX) XXXXX-XXXX" required
                    maxlength="15"
                    pattern="\(\d{2}\) \d{4,5}-\d{4}"
                    oninput="formatarTelefone(this)">
            </div>
            
            <!-- Campo Data -->
            <div class="grupo-formulario grupo-data">
                <label for="data">Data:</label>
                <div class="container-data">
                    <input type="text" id="data" class="entrada-formulario entrada-data" 
                        placeholder="DD/MM/AAAA" maxlength="10"
                        oninput="formatarDataInput(event)">
                    <button type="button" class="botao-calendario" onclick="mostrarDatePicker(this)">
                        <i class='bx bx-calendar'></i>
                    </button>
                    <div id="datePicker" class="date-picker">
                        <div class="date-picker-header">
                            <button type="button" onclick="mudarMes(-1)"><i class='bx bx-chevron-left'></i></button>
                            <h4 id="mesAnoAtual"></h4>
                            <button type="button" onclick="mudarMes(1)"><i class='bx bx-chevron-right'></i></button>
                        </div>
                        <div class="date-picker-grid" id="datePickerGrid">
                            <!-- Dias serão gerados por JavaScript -->
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Campo Sexo -->
            <div class="grupo-formulario grupo-sexo">
                <label>Sexo:</label>
                <div class="grupo-radio">
                    <label class="opcao-radio">
                        <input type="radio" name="sexo" class="entrada-radio" value="F"> F
                    </label>
                    <label class="opcao-radio">
                        <input type="radio" name="sexo" class="entrada-radio" value="M"> M
                    </label>
                </div>
            </div>
        </div>

        <!-- Container para campos ESPECÍFICOS (será injetado aqui) -->
        <div id="campos-meio-formulario"></div>

        <!-- Descrição -->
        <div class="linha-formulario">
            <div class="grupo-formulario largura-total">
                <label for="descricao">Descrição:</label>
                <textarea id="descricao" class="textarea-fixo" 
                          name="descricao" 
                          placeholder="Descreva o problema ou serviço necessário..."></textarea>
            </div>
        </div>

        <!-- Linha Final (Valor e Botão) -->
        <div class="linha-formulario ultima-linha">
            <!-- Campo Valor -->
            <div class="grupo-formulario grupo-valor">
                <label for="valor">Valor:</label>
                <div class="container-input-valor">
                    <input 
                        type="text" 
                        id="valor" 
                        class="entrada-formulario entrada-valor" 
                        placeholder="R$ 0,00" 
                        required
                        inputmode="numeric"
                        pattern="^R\\$\\s?\\d{1,3}(?:\\.\\d{3})*,\\d{2}$"
                        oninput="formatarValorDinamico(this)"
                        onfocus="this.select()"
                        aria-label="Valor"
                        autocomplete="off">
                </div>
            </div>

            <!-- Container para checkboxes ESPECÍFICOS -->
            <div id="checkboxes-especificos" class="grupo-formulario grupo-materiais"></div>

            <!-- Botão Confirmar -->
            <button type="button" class="botao-formulario botao-confirmar">
                Confirmar
            </button>
        </div>
    </div>
    `;

    // Templates ESPECÍFICOS
    const templates = {
        relogio: `
            <!-- Campos específicos de relógio -->
            <div class="linha-formulario">
                <!-- Campo de Marcas -->
                <div class="grupo-formulario grupo-marca">
                    <label>Marcas:</label>
                    <div class="container-multiselect" id="marca-relogio-multiselect">
                        <div class="input-tags-wrapper">
                            <input type="text" id="marca-relogio-input" class="tag-input" placeholder="Digite ou selecione" autocomplete="off">
                            <div class="tags-container" id="marca-relogio-tags"></div>
                            <div class="dropdown-icon">
                                <i class='bx bx-chevron-down'></i>
                            </div>
                        </div>
                        
                        <div class="dropdown-multiselect" id="marca-relogio-dropdown">
                            <div class="dropdown-content">
                                <div class="dropdown-item" data-value="Orient">
                                    <input type="checkbox" id="marca-relogio-Orient" data-value="Orient">
                                    <label for="marca-relogio-Orient">Orient</label>
                                </div>
                                <div class="dropdown-item" data-value="Champion">
                                    <input type="checkbox" id="marca-relogio-Champion" data-value="Champion">
                                    <label for="marca-relogio-Champion">Champion</label>
                                </div>
                                <div class="dropdown-item" data-value="Mondaine">
                                    <input type="checkbox" id="marca-relogio-Mondaine" data-value="Mondaine">
                                    <label for="marca-relogio-Mondaine">Mondaine</label>
                                </div>
                                <div class="dropdown-item" data-value="Technos">
                                    <input type="checkbox" id="marca-relogio-Technos" data-value="Technos">
                                    <label for="marca-relogio-Technos">Technos</label>
                                </div>
                                <div class="dropdown-item" data-value="Casio">
                                    <input type="checkbox" id="marca-relogio-Casio" data-value="Casio">
                                    <label for="marca-relogio-Casio">Casio</label>
                                </div>
                                <div class="dropdown-item" data-value="Tomy">
                                    <input type="checkbox" id="marca-relogio-Tomy" data-value="Tomy">
                                    <label for="marca-relogio-Tomy">Tomy</label>
                                </div>
                            </div>
                        </div>
                        
                        <input type="hidden" id="marcas-relogio-selecionadas" name="marcas-relogio">
                    </div>
                </div>
                
                <!-- Campo de Cores -->
                <div class="grupo-formulario grupo-cor">
                    <label>Cores:</label>
                    <div class="container-multiselect" id="cor-relogio-multiselect">
                        <div class="input-tags-wrapper">
                            <input type="text" id="cor-relogio-input" class="tag-input" placeholder="Digite ou selecione" autocomplete="off">
                            <div class="tags-container" id="cor-relogio-tags"></div>
                            <div class="dropdown-icon">
                                <i class='bx bx-chevron-down'></i>
                            </div>
                        </div>
                        
                        <div class="dropdown-multiselect" id="cor-relogio-dropdown">
                            <div class="dropdown-content">
                                <div class="dropdown-item" data-value="prateado">
                                    <input type="checkbox" id="cor-relogio-prateado" data-value="prateado">
                                    <label for="cor-relogio-prateado">Prateado</label>
                                </div>
                                <div class="dropdown-item" data-value="dourado">
                                    <input type="checkbox" id="cor-relogio-dourado" data-value="dourado">
                                    <label for="cor-relogio-dourado">Dourado</label>
                                </div>
                                <div class="dropdown-item" data-value="misto">
                                    <input type="checkbox" id="cor-relogio-misto" data-value="misto">
                                    <label for="cor-relogio-misto">Misto</label>
                                </div>
                                <div class="dropdown-item" data-value="preto">
                                    <input type="checkbox" id="cor-relogio-preto" data-value="preto">
                                    <label for="cor-relogio-preto">Preto</label>
                                </div>
                                <div class="dropdown-item" data-value="branco">
                                    <input type="checkbox" id="cor-relogio-branco" data-value="branco">
                                    <label for="cor-relogio-branco">Branco</label>
                                </div>
                            </div>
                        </div>
                        
                        <input type="hidden" id="cores-relogio-selecionadas" name="cores-relogio">
                    </div>
                </div>
                
                <!-- Campo de Modelos -->
                <div class="grupo-formulario grupo-modelo">
                    <label>Modelos:</label>
                    <div class="container-multiselect" id="modelo-relogio-multiselect">
                        <div class="input-tags-wrapper">
                            <input type="text" id="modelo-relogio-input" class="tag-input" placeholder="Digite ou selecione" autocomplete="off">
                            <div class="tags-container" id="modelo-relogio-tags"></div>
                            <div class="dropdown-icon">
                                <i class='bx bx-chevron-down'></i>
                            </div>
                        </div>
                        
                        <div class="dropdown-multiselect" id="modelo-relogio-dropdown">
                            <div class="dropdown-content">
                                <div class="dropdown-item" data-value="pulso">
                                    <input type="checkbox" id="modelo-relogio-pulso" data-value="pulso">
                                    <label for="modelo-relogio-pulso">Pulso</label>
                                </div>
                                <div class="dropdown-item" data-value="parede">
                                    <input type="checkbox" id="modelo-relogio-parede" data-value="parede">
                                    <label for="modelo-relogio-parede">Parede</label>
                                </div>
                                <div class="dropdown-item" data-value="despertador">
                                    <input type="checkbox" id="modelo-relogio-despertador" data-value="despertador">
                                    <label for="modelo-relogio-despertador">Despertador</label>
                                </div>
                            </div>
                        </div>
                        
                        <input type="hidden" id="modelos-relogio-selecionados" name="modelos-relogio">
                    </div>
                </div>
            </div>
        `,

        joia: `
            <!-- Linha de Características da Joia -->
            <div class="linha-formulario">
                <div class="grupo-formulario grupo-modelo">
                    <label>Modelo:</label>
                    <div class="container-multiselect" id="modelo-multiselect">
                        <div class="input-tags-wrapper">
                            <input type="text" id="modelo-input" class="tag-input" placeholder="Digite ou selecione" autocomplete="off">
                            <div class="tags-container" id="modelo-tags"></div>
                            <div class="dropdown-icon">
                                <i class='bx bx-chevron-down'></i>
                            </div>
                        </div>
                        
                        <div class="dropdown-multiselect" id="modelo-dropdown">
                            <div class="dropdown-content">
                                <div class="dropdown-item" data-value="anel">
                                    <input type="checkbox" id="modelo-anel" data-value="anel">
                                    <label for="modelo-anel">Anel</label>
                                </div>
                                <div class="dropdown-item" data-value="corrente">
                                    <input type="checkbox" id="modelo-corrente" data-value="corrente">
                                    <label for="modelo-corrente">Corrente</label>
                                </div>
                                <div class="dropdown-item" data-value="brinco">
                                    <input type="checkbox" id="modelo-brinco" data-value="brinco">
                                    <label for="modelo-brinco">Brinco</label>
                                </div>
                                <div class="dropdown-item" data-value="pulseira">
                                    <input type="checkbox" id="modelo-pulseira" data-value="pulseira">
                                    <label for="modelo-pulseira">Pulseira</label>
                                </div>
                                <div class="dropdown-item" data-value="pingente">
                                    <input type="checkbox" id="modelo-pingente" data-value="pingente">
                                    <label for="modelo-pingente">Pingente</label>
                                </div>
                            </div>
                        </div>
                        
                        <input type="hidden" id="modelos-selecionados" name="modelos">
                    </div>
                </div>
                
                <div class="grupo-formulario grupo-tamanho">
                    <label for="tamanho">Tamanho:</label>
                    <input type="text" id="tamanho" class="entrada-formulario" 
                        placeholder="Ex: X cm, nº X" name="tamanho">
                </div>
                
                <div class="grupo-formulario grupo-peso">
                    <label for="peso">Peso:</label>
                    <input type="text" id="peso" class="entrada-formulario" 
                        placeholder="Ex: X g" name="peso">
                </div>
            </div>
        `
    };

    // Checkboxes específicos
    const checkboxes = {
        relogio: `
            <!-- Serviços para Relógios -->
            <div class="grupo-formulario grupo-materiais">
                <label>Serviços:</label>
                <div class="grupo-checkbox">
                    <label class="opcao-checkbox">
                        <input type="checkbox" class="entrada-checkbox" name="servicos" value="pilha">
                        <span>Pilha</span>
                    </label>
                    <label class="opcao-checkbox">
                        <input type="checkbox" class="entrada-checkbox" name="servicos" value="rgeral">
                        <span>R. Geral</span>
                    </label>
                    <label class="opcao-checkbox">
                        <input type="checkbox" class="entrada-checkbox" name="servicos" value="vidro">
                        <span>Vidro</span>
                    </label>
                </div>
            </div>
        `,
        
        joia: `
            <!-- Serviços para Joias -->
            <div class="grupo-formulario grupo-materiais">
                <label>Serviços:</label>
                <div class="grupo-checkbox">
                    <label class="opcao-checkbox">
                        <input type="checkbox" class="entrada-checkbox" name="servicos" value="ouro">
                        <span>Ouro</span>
                    </label>
                    <label class="opcao-checkbox">
                        <input type="checkbox" class="entrada-checkbox" name="servicos" value="prata">
                        <span>Prata</span>
                    </label>
                    <label class="opcao-checkbox">
                        <input type="checkbox" class="entrada-checkbox" name="servicos" value="banhado">
                        <span>S. Joia</span>
                    </label>
                </div>
            </div>
        `
};

    // Carrega o formulário completo
    function carregarFormulario(tipo) {
        // 1. Carrega a base comum
        container.innerHTML = htmlBase;
        
        // 2. Injeta os campos específicos no meio do formulário
        const containerMeio = document.getElementById('campos-meio-formulario');
        containerMeio.innerHTML = templates[tipo];
        
        // 3. Injeta os checkboxes específicos
        const containerCheckboxes = document.getElementById('checkboxes-especificos');
        containerCheckboxes.innerHTML = checkboxes[tipo];
        
        // 4. Inicializa componentes
        initComponentes();
    }

    // Inicializa componentes dinâmicos
    function initComponentes() {
        // Datepicker
        if (typeof initDatePicker === 'function') {
            document.querySelectorAll('.container-data').forEach(initDatePicker);
        }
        
        // Multiselect
        if (typeof initMultiSelect === 'function') {
            document.querySelectorAll('.container-multiselect').forEach(initMultiSelect);
        }
        
        // Máscaras
        if (typeof formatarTelefone === 'function') {
            document.getElementById('telefone').addEventListener('input', (e) => {
                formatarTelefone(e.target);
            });
        }
    }
    
    // Eventos dos botões
    botoes.forEach(botao => {
        botao.addEventListener('click', () => {
            botoes.forEach(b => b.classList.remove('ativo'));
            botao.classList.add('ativo');
            carregarFormulario(botao.dataset.form);
        });
    });

    // Carrega o formulário padrão
    carregarFormulario('relogio');

});
