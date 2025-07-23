// multiselect.js - Versão refatorada para melhor integração
class MultiSelect {
    constructor(container) {
        this.container = container;
        this.inputWrapper = container.querySelector('.input-tags-wrapper');
        this.input = container.querySelector('.tag-input');
        this.dropdown = container.querySelector('.dropdown-multiselect');
        this.tagsContainer = container.querySelector('.tags-container');
        this.hiddenInput = container.querySelector('input[type="hidden"]');
        this.dropdownIcon = container.querySelector('.dropdown-icon');
        this.dropdownItems = Array.from(this.dropdown.querySelectorAll('.dropdown-item'));
        
        this.selectedValues = this.hiddenInput.value ? 
            this.hiddenInput.value.split(',').filter(Boolean) : [];
        this.isDropdownOpen = false;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.updateDisplay();
    }
    
    setupEventListeners() {
        // Click no wrapper (exceto tags e ícone)
        this.inputWrapper.addEventListener('click', (e) => {
            if (!e.target.closest('.tag') && !e.target.closest('.dropdown-icon')) {
                this.input.focus();
                this.toggleDropdown(true);
            }
        });

        // Click no ícone do dropdown
        this.dropdownIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleDropdown(!this.isDropdownOpen);
        });

        // Filtro ao digitar
        this.input.addEventListener('input', () => {
            this.filterOptions(this.input.value);
            this.toggleDropdown(true);
        });

        // Interação com itens do dropdown
        this.dropdownItems.forEach(item => {
            const checkbox = item.querySelector('input[type="checkbox"]');
            const value = item.dataset.value;
            
            item.addEventListener('click', (e) => {
                if (e.target !== checkbox) {
                    checkbox.checked = !checkbox.checked;
                    checkbox.dispatchEvent(new Event('change'));
                }
            });
            
            checkbox.addEventListener('change', () => {
                if (checkbox.checked) {
                    this.addTag(value);
                } else {
                    this.removeTag(value);
                }
                this.input.value = '';
                this.filterOptions('');
            });
        });

        // Remover tag pelo botão '×'
        this.tagsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('tag-remove')) {
                const value = e.target.closest('.tag').dataset.value;
                this.removeTag(value);
                e.stopPropagation();
            }
        });

        // Teclado
        this.input.addEventListener('keydown', (e) => {
            // Enter para adicionar tag customizada
            if (e.key === 'Enter' && this.input.value.trim()) {
                e.preventDefault();
                this.addTag(this.input.value.trim());
                this.input.value = '';
                this.filterOptions('');
            }
            
            // Backspace remove última tag se input estiver vazio
            if (e.key === 'Backspace' && !this.input.value && this.selectedValues.length > 0) {
                this.removeTag(this.selectedValues[this.selectedValues.length - 1]);
            }
        });

        // Fechar dropdown ao clicar fora
        document.addEventListener('click', (e) => {
            if (!this.container.contains(e.target)) {
                this.toggleDropdown(false);
            }
        });
    }
    
    updateDisplay() {
        this.tagsContainer.innerHTML = this.selectedValues.map(value => {
            const item = this.dropdownItems.find(item => item.dataset.value === value);
            const label = item ? item.querySelector('label').textContent : value;
            return `
                <span class="tag" data-value="${value}">
                    ${label}
                    <button class="tag-remove" data-value="${value}">×</button>
                </span>
            `;
        }).join('');

        this.hiddenInput.value = this.selectedValues.join(',');
        
        // Ajusta o placeholder e borda quando há tags
        if (this.selectedValues.length > 0) {
            this.input.placeholder = '';
            this.inputWrapper.style.borderColor = 'var(--cor-destaque)';
        } else {
            this.input.placeholder = 'Digite ou selecione...';
            this.inputWrapper.style.borderColor = 'var(--cor-borda)';
        }
    }
    
    addTag(value) {
        const trimmedValue = value.trim();
        if (trimmedValue && !this.selectedValues.includes(trimmedValue)) {
            this.selectedValues.push(trimmedValue);
            this.updateDisplay();
            
            // Marca o checkbox correspondente se for uma opção pré-definida
            const checkbox = this.dropdown.querySelector(`input[data-value="${trimmedValue}"]`);
            if (checkbox) checkbox.checked = true;
        }
    }
    
    removeTag(value) {
        this.selectedValues = this.selectedValues.filter(v => v !== value);
        this.updateDisplay();
        
        // Desmarca o checkbox correspondente se for uma opção pré-definida
        const checkbox = this.dropdown.querySelector(`input[data-value="${value}"]`);
        if (checkbox) checkbox.checked = false;
    }
    
    filterOptions(searchTerm) {
        const term = searchTerm.toLowerCase();
        
        this.dropdownItems.forEach(item => {
            const value = item.dataset.value.toLowerCase();
            const label = item.querySelector('label').textContent.toLowerCase();
            item.style.display = (value.includes(term) || label.includes(term)) ? 'flex' : 'none';
        });
    }
    
    toggleDropdown(open) {
        this.isDropdownOpen = open;
        this.container.classList.toggle('active', open);
        
        if (open) {
            this.input.focus();
            this.filterOptions(this.input.value);
        }
    }
}

// Função para inicializar todos os multiselects
function initMultiSelect(container) {
    try {
        new MultiSelect(container);
    } catch (error) {
        console.error('Error initializing multiselect:', error);
    }
}

// Exporta a função para uso global
window.initMultiSelect = initMultiSelect;