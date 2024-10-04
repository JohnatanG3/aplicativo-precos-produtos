const searchForm = document.querySelector('.search-form');
const productList = document.querySelector('.product-list');
const priceChart = document.querySelector('.price-chart');
const searchInput = document.querySelector('.product-input');

let myChart = '';

// Função para buscar produtos ao pressionar Enter no campo de input
searchInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Evita o envio padrão do formulário
        searchForm.dispatchEvent(new Event('submit')); // Dispara o evento de submit
    }
});

// Evento de envio do formulário
searchForm.addEventListener('submit', async function(event) {
    event.preventDefault(); // Evita o comportamento padrão de recarregar a página
    const inputValue = event.target[0].value; // Captura o valor do campo de input

    try {
        // Requisição à API do Mercado Livre com o valor de busca do usuário
        const data = await fetch(`https://api.mercadolibre.com/sites/MLB/search?q=${inputValue}`);
        const products = (await data.json()).results.slice(0, 12); // Obtém os 12 primeiros resultados

        // Se nenhum produto for encontrado, lança um erro
        if (products.length === 0) {
            throw new Error('Nenhum produto encontrado.');
        }

        displayItems(products); // Exibe os produtos na página
        updatePriceChart(products); // Atualiza o gráfico com os preços dos produtos

    } catch (error) {
        // Exibe a mensagem de erro na página, caso ocorra algum problema
        productList.innerHTML = `<p>${error.message}</p>`;
    }
});

// Função para exibir os produtos na página
function displayItems(products) {
    productList.innerHTML = products.map(product => `
        <div class="product-card">
            <img src="${product.thumbnail.replace(/-[A-Z]\.jpg$/gi, '-W.jpg')}" alt="${product.title}">
            <h3>${product.title}</h3>
            <p class="product-price">${product.price.toLocaleString('pt-br', { style: "currency", currency: "BRL" })}</p>
            <p class="product-store"><span>Vendedor:</span> ${product.seller.nickname}</p>
        </div>
    `).join('');
}

// Função para atualizar o gráfico de preços
function updatePriceChart(products) {
    const ctx = priceChart.getContext('2d'); // Certifique-se de que 'priceChart' é o elemento de canvas correto

    // Se já houver um gráfico, destrói-o para evitar sobreposição
    if (myChart) {
        myChart.destroy();
    }

    // Cria um novo gráfico de barras
    myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: products.map(product => product.title.substring(0, 20) + '...'), // Títulos dos produtos como rótulos
            datasets: [{
                label: 'Preço (R$)', // Nome da legenda do gráfico
                data: products.map(product => product.price), // Preços dos produtos
                backgroundColor: 'rgba(46, 204, 113, 0.6)', // Cor de fundo das barras
                borderColor: 'rgba(46, 204, 113, 1)', // Cor da borda das barras
                borderWidth: 1, // Largura da borda
            }],
        },

        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true, // Inicia o eixo Y no zero
                    ticks: {
                        callback: function(value) {
                            // Formata os valores do eixo Y como moeda brasileira
                            return 'R$ ' + value.toLocaleString('pt-br', {
                                style: 'currency',
                                currency: 'BRL',
                            }).replace('R$', ''); // Remove duplicação do 'R$'
                        }
                    }
                },
            },
            plugins: {
                legend: {
                    display: false // Oculta a legenda
                },
                title: {
                    display: true,
                    text: 'Comparador de Preços', // Título do gráfico
                    font: {
                        size: 18 // Tamanho da fonte do título
                    }
                }
            }
        }
    });
}

// Colocando o foco no campo de input de pesquisa ao carregar a página
window.onload = function() {
    searchInput.focus();
}