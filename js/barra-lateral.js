/**
 * Gera e controla a barra lateral dinâmica
 */
function inicializarBarraLateral() {
  // HTML da barra lateral
  const barraLateralHTML = `
      <!-- Barra lateral (sidebar) com classe "fechado" -->
      <nav class="barra-lateral fechado">
          <header>
              <!-- Logo e texto associado -->
              <div class="imagem-texto">
                  <span class="imagem">
                      <img src="img/logo.png" alt="Logo da Missaglia Presentes">
                  </span>
  
                  <div class="texto logo-texto">
                      <span class="nome">Missaglia</span>
                      <span class="profissao">Consertos Web</span>
                  </div>
              </div>
  
              <!-- Ícone de alternar para abrir/fechar a barra lateral -->
              <i class='bx bx-chevron-right alternar'></i>
          </header>
  
          <!-- Menu da barra lateral -->
          <div class="menu-barra">
              <div class="menu">
  
                  <!-- Caixa de pesquisa -->
                  <li class="caixa-pesquisa">
                      <i class='bx bx-search icone'></i>
                      <input type="text" placeholder="Pesquisar...">
                  </li>
  
                  <!-- Lista de links do menu -->
                  <ul class="links-menu">
                      <li class="link-navegacao">
                          <a href="index.html">
                              <i class='bx bx-plus-circle icone'></i>
                              <span class="texto texto-navegacao">Cadastrar</span>
                          </a>
                      </li>    
  
                      <li class="link-navegacao">
                          <a href="servicos.html">
                              <i class='bx bx-show-alt icone'></i>
                              <span class="texto texto-navegacao">Visualizar</span>
                          </a>
                      </li>
  
                        <li class="link-navegacao">
                            <a href="servicos.html?filtro=relogio" class="link-filtro">
                                <i class='bx bx-time icone'></i>
                                <span class="texto texto-navegacao">Relógios</span>
                            </a>
                        </li>

                        <li class="link-navegacao">
                            <a href="servicos.html?filtro=joia" class="link-filtro">
                                <i class='bx bx-diamond icone'></i>
                                <span class="texto texto-navegacao">Jóias</span>
                            </a>
                        </li>

                        <li class="link-navegacao">
                            <a href="servicos.html?modo=retirados" class="link-filtro">
                                <i class='bx bx-package icone'></i>
                                <span class="texto texto-navegacao">Retirados</span>
                            </a>
                        </li>
  
                      <li class="link-navegacao">
                          <a href="#">
                              <i class='bx bx-calendar icone'></i>
                              <span class="texto texto-navegacao">Calendário</span>
                          </a>
                      </li>      
  
                      <li class="link-navegacao">
                          <a href="#">
                              <i class='bx bxs-star icone'></i>
                              <span class="texto texto-navegacao">Favoritos</span>
                          </a>
                      </li>
                  </ul>
              </div>
          </div>
      </nav>
  `;

  // Insere no DOM
  document.body.insertAdjacentHTML('afterbegin', barraLateralHTML);

  // Elementos
  const elementos = {
    barraLateral: document.querySelector('.barra-lateral'),
    alternar: document.querySelector('.alternar'),
    home: document.querySelector('.home')
  };

  // Função para alternar estado
  const alternarBarraLateral = () => {
    elementos.barraLateral.classList.toggle('fechado');
    ajustarLayoutPagina();
  };

  // Ajusta o layout da página principal
  const ajustarLayoutPagina = () => {
    const estaFechada = elementos.barraLateral.classList.contains('fechado');
    elementos.home.classList.toggle('barra-lateral-fechada', estaFechada);
  };

  // Eventos
  elementos.alternar.addEventListener('click', alternarBarraLateral);
  
  // Abre ao clicar na pesquisa
  document.querySelector('.caixa-pesquisa').addEventListener('click', () => {
    elementos.barraLateral.classList.remove('fechado');
    ajustarLayoutPagina();
  });

  // Estado inicial
  ajustarLayoutPagina();
}

// Inicializa quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', inicializarBarraLateral);