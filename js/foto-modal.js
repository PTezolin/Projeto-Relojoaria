// foto-modal.js - Versão otimizada e corrigida
class FotoModal {
    constructor() {
        this.modal = document.getElementById('fotoModal');
        if (!this.modal) return;
        
        // Elementos do DOM
        this.fotoInput = document.getElementById('fotoInput');
        this.uploadArea = document.getElementById('uploadArea');
        this.previewContainer = document.getElementById('previewContainer');
        this.limparBtn = document.getElementById('limparFotos');
        this.confirmarBtn = document.getElementById('confirmarFotos');
        this.closeBtn = document.querySelector('.close-modal');
        this.contador = document.querySelector('.contador-fotos');
        
        // Estado do modal
        this.fotosSelecionadas = [];
        this.formularioAtivo = null;
        
        // Inicialização
        this.init();
    }

    init() {
        // Garante que a variável global existe
        window.fotosNoFormulario = window.fotosNoFormulario || [];
        
        // Configura eventos
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Eventos de clique
        document.addEventListener('click', (e) => {
            // Botões de foto nos formulários
            if (e.target.closest('.botao-foto')) {
                this.abrirModal();
            }
            
            // Fechar modal ao clicar fora
            if (e.target === this.modal) {
                this.fecharModal();
            }
        });

        // Eventos do modal
        this.fotoInput.addEventListener('change', (e) => this.handleFileSelect(e));
        this.uploadArea.addEventListener('click', () => this.handleUploadClick());
        this.limparBtn.addEventListener('click', () => this.limparFotos());
        this.confirmarBtn.addEventListener('click', () => this.confirmarFotos());
        this.closeBtn.addEventListener('click', () => this.fecharModal());
        
        // Drag and drop
        this.setupDragAndDrop();
    }

    abrirModal() {
        // Determina qual formulário está ativo
        const botaoAtivo = document.querySelector('.botao-seletor.ativo');
        this.formularioAtivo = botaoAtivo?.dataset.form || 'relogio';
        
        // Carrega fotos existentes
        this.fotosSelecionadas = [...(window.fotosNoFormulario || [])];
        
        // Exibe o modal
        this.modal.classList.add('aberto');
        document.body.style.overflow = 'hidden';
        this.atualizarInterface();
    }

    fecharModal() {
        this.modal.classList.remove('aberto');
        document.body.style.overflow = '';
    }

    atualizarInterface() {
        const totalFotos = this.fotosSelecionadas.length;
        
        // Atualiza contador
        this.contador.textContent = `(${totalFotos}/3)`;
        this.confirmarBtn.disabled = totalFotos === 0;
        
        // Atualiza preview
        this.previewContainer.innerHTML = this.fotosSelecionadas
            .map((foto, index) => `
                <div class="foto-item">
                    <img src="${foto.url}" alt="Preview ${index + 1}">
                    <button class="remover-preview" data-index="${index}">×</button>
                </div>
            `)
            .join('');
        
        // Adiciona eventos de remoção
        this.previewContainer.querySelectorAll('.remover-preview').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.removerFoto(parseInt(btn.dataset.index));
            });
        });
        
        // Atualiza área de upload
        this.uploadArea.classList.toggle('limite-alcancado', totalFotos >= 3);
    }

    setupDragAndDrop() {
        const handleDrag = (e) => {
            e.preventDefault();
            if (this.fotosSelecionadas.length < 3) {
                this.uploadArea.style.borderColor = 'var(--cor-destaque)';
                this.uploadArea.style.backgroundColor = 'rgba(4, 0, 45, 0.1)';
            }
        };

        this.uploadArea.addEventListener('dragover', handleDrag);
        this.uploadArea.addEventListener('dragenter', handleDrag);
        
        this.uploadArea.addEventListener('dragleave', () => {
            this.uploadArea.style.borderColor = 'var(--cor-borda)';
            this.uploadArea.style.backgroundColor = '';
        });
        
        this.uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.uploadArea.style.borderColor = 'var(--cor-borda)';
            this.uploadArea.style.backgroundColor = '';
            
            if (e.dataTransfer.files.length > 0 && this.fotosSelecionadas.length < 3) {
                this.fotoInput.files = e.dataTransfer.files;
                this.fotoInput.dispatchEvent(new Event('change'));
            }
        });
    }

    handleUploadClick() {
        if (this.fotosSelecionadas.length < 3) {
            this.fotoInput.click();
        }
    }

    handleFileSelect(event) {
        if (!event.target.files || event.target.files.length === 0) return;
        
        const files = Array.from(event.target.files)
            .slice(0, 3 - this.fotosSelecionadas.length)
            .filter(file => file.type.match('image.*'));
        
        if (files.length !== event.target.files.length) {
            alert('Por favor, selecione apenas imagens!');
        }
        
        files.forEach(file => this.processarImagem(file));
    }

    async processarImagem(file) {
        try {
            const { url, width, height } = await this.redimensionarImagem(file, 800, 800, 0.7);
            
            this.fotosSelecionadas.push({
                name: file.name,
                type: file.type,
                size: file.size,
                lastModified: file.lastModified,
                url: url,
                dimensions: { width, height }
            });
            
            this.atualizarInterface();
        } catch (error) {
            console.error('Erro ao processar imagem:', error);
            alert('Erro ao processar a imagem. Por favor, tente novamente.');
        }
    }

    redimensionarImagem(file, maxWidth, maxHeight, quality) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const reader = new FileReader();
            
            reader.onload = (e) => {
                img.src = e.target.result;
                
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const { width, height } = this.calcularProporcoes(
                        img.width, 
                        img.height, 
                        maxWidth, 
                        maxHeight
                    );
                    
                    canvas.width = width;
                    canvas.height = height;
                    
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    resolve({
                        url: canvas.toDataURL('image/jpeg', quality),
                        width,
                        height
                    });
                };
                
                img.onerror = reject;
            };
            
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    calcularProporcoes(width, height, maxWidth, maxHeight) {
        const ratio = Math.min(
            maxWidth / width, 
            maxHeight / height
        );
        
        return {
            width: Math.floor(width * ratio),
            height: Math.floor(height * ratio)
        };
    }

    removerFoto(index) {
        if (index >= 0 && index < this.fotosSelecionadas.length) {
            this.fotosSelecionadas.splice(index, 1);
            this.atualizarInterface();
        }
    }

    limparFotos() {
        this.fotosSelecionadas = [];
        window.fotosNoFormulario = [];
        this.atualizarInterface();
    }

    confirmarFotos() {
        window.fotosNoFormulario = [...this.fotosSelecionadas];
        this.fecharModal();
        
        // Aqui você pode adicionar lógica adicional após confirmar
        console.log('Fotos confirmadas:', this.fotosSelecionadas);
    }
}

// Inicialização segura
if (typeof FotoModal !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        try {
            new FotoModal();
        } catch (error) {
            console.error('Erro ao inicializar o modal de fotos:', error);
        }
    });
}