// URLs das APIs utilizadas
const URL_API_BIBLIA = 'https://bible-api.com/?random=verse';
const URL_API_TRADUCAO = 'https://api.mymemory.translated.net/get';

// Elementos da página
const elementoTextoVersiculo = document.getElementById('textoVersiculo');
const elementoReferenciaVersiculo = document.getElementById('referenciaVersiculo');
const botaoNovoVersiculo = document.getElementById('botaoNovoVersiculo');
const botaoCompartilhar = document.getElementById('botaoCompartilhar');
const alternadorTema = document.getElementById('alternadorTema');

// Lista de versículos para fallback
const versiculosLocais = [
    {
        texto: "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.",
        referencia: "João 3:16"
    },
    {
        texto: "Tudo posso naquele que me fortalece.",
        referencia: "Filipenses 4:13"
    },
    {
        texto: "O Senhor é o meu pastor; nada me faltará.",
        referencia: "Salmos 23:1"
    },
    {
        texto: "Vinde a mim, todos os que estais cansados e oprimidos, e eu vos aliviarei.",
        referencia: "Mateus 11:28"
    },
    {
        texto: "Em tudo dai graças, porque esta é a vontade de Deus em Cristo Jesus para convosco.",
        referencia: "1 Tessalonicenses 5:18"
    }
];

// Mapeamento de nomes de livros (inglês -> português)
const mapaNomesLivros = {
    "Genesis": "Gênesis",
    "Exodus": "Êxodo",
    "Leviticus": "Levítico",
    "Numbers": "Números",
    "Deuteronomy": "Deuteronômio",
    "Joshua": "Josué",
    "Judges": "Juízes",
    "Ruth": "Rute",
    "1 Samuel": "1 Samuel",
    "2 Samuel": "2 Samuel",
    "1 Kings": "1 Reis",
    "2 Kings": "2 Reis",
    "1 Chronicles": "1 Crônicas",
    "2 Chronicles": "2 Crônicas",
    "Ezra": "Esdras",
    "Nehemiah": "Neemias",
    "Esther": "Ester",
    "Job": "Jó",
    "Psalms": "Salmos",
    "Proverbs": "Provérbios",
    "Ecclesiastes": "Eclesiastes",
    "Song of Solomon": "Cântico dos Cânticos",
    "Isaiah": "Isaías",
    "Jeremiah": "Jeremias",
    "Lamentations": "Lamentações",
    "Ezekiel": "Ezequiel",
    "Daniel": "Daniel",
    "Hosea": "Oséias",
    "Joel": "Joel",
    "Amos": "Amós",
    "Obadiah": "Obadias",
    "Jonah": "Jonas",
    "Micah": "Miquéias",
    "Nahum": "Naum",
    "Habakkuk": "Habacuque",
    "Zephaniah": "Sofonias",
    "Haggai": "Ageu",
    "Zechariah": "Zacarias",
    "Malachi": "Malaquias",
    "Matthew": "Mateus",
    "Mark": "Marcos",
    "Luke": "Lucas",
    "John": "João",
    "Acts": "Atos",
    "Romans": "Romanos",
    "1 Corinthians": "1 Coríntios",
    "2 Corinthians": "2 Coríntios",
    "Galatians": "Gálatas",
    "Ephesians": "Efésios",
    "Philippians": "Filipenses",
    "Colossians": "Colossenses",
    "1 Thessalonians": "1 Tessalonicenses",
    "2 Thessalonians": "2 Tessalonicenses",
    "1 Timothy": "1 Timóteo",
    "2 Timothy": "2 Timóteo",
    "Titus": "Tito",
    "Philemon": "Filemom",
    "Hebrews": "Hebreus",
    "James": "Tiago",
    "1 Peter": "1 Pedro",
    "2 Peter": "2 Pedro",
    "1 John": "1 João",
    "2 John": "2 João",
    "3 John": "3 João",
    "Jude": "Judas",
    "Revelation": "Apocalipse"
};

// Função principal para buscar e exibir o versículo
async function buscarVersiculo() {
    elementoTextoVersiculo.textContent = "Carregando versículo...";
    elementoReferenciaVersiculo.textContent = "";
    botaoNovoVersiculo.disabled = true;
    botaoCompartilhar.disabled = true;

    try {
        // Busca o versículo em inglês
        const resposta = await fetch(URL_API_BIBLIA);
        if (!resposta.ok) throw new Error("Erro ao buscar versículo");
        
        const dados = await resposta.json();
        const textoIngles = dados.text;
        const referenciaIngles = dados.reference;

        // Traduz o texto
        const textoTraduzido = await traduzirTexto(textoIngles, 'en|pt');
        
        // Corrige a referência
        const referenciaTraduzida = traduzirReferencia(referenciaIngles);

        // Atualiza a página
        elementoTextoVersiculo.textContent = `"${textoTraduzido.trim()}"`;
        elementoReferenciaVersiculo.textContent = referenciaTraduzida;

    } catch (erro) {
        console.error("Erro:", erro);
        usarVersiculoLocal();
    } finally {
        botaoNovoVersiculo.disabled = false;
        botaoCompartilhar.disabled = false;
        animarVersiculo();
    }
}

// Função para traduzir texto
async function traduzirTexto(texto, parIdiomas) {
    try {
        const resposta = await fetch(`${URL_API_TRADUCAO}?q=${encodeURIComponent(texto)}&langpair=${parIdiomas}`);
        if (!resposta.ok) throw new Error("Erro na tradução");
        
        const dados = await resposta.json();
        return dados.responseData?.translatedText || texto;
    } catch (erro) {
        console.error("Erro na tradução:", erro);
        return texto;
    }
}

// Função para traduzir referência
function traduzirReferencia(referencia) {
    const regex = /^(\d?\s?[a-zA-Z\s]+?)\s+\d+:\d+/;
    const resultado = referencia.match(regex);
    
    if (resultado && resultado[1]) {
        const livroIngles = resultado[1].trim();
        const livroPortugues = mapaNomesLivros[livroIngles] || livroIngles;
        return referencia.replace(livroIngles, livroPortugues);
    }
    return referencia;
}

// Função para usar versículo local
function usarVersiculoLocal() {
    const indice = Math.floor(Math.random() * versiculosLocais.length);
    elementoTextoVersiculo.textContent = `"${versiculosLocais[indice].texto}"`;
    elementoReferenciaVersiculo.textContent = versiculosLocais[indice].referencia;
}

// Função para animar o versículo
function animarVersiculo() {
    elementoTextoVersiculo.classList.remove('aparecer');
    void elementoTextoVersiculo.offsetWidth;
    elementoTextoVersiculo.classList.add('aparecer');

    elementoReferenciaVersiculo.classList.remove('aparecer');
    void elementoReferenciaVersiculo.offsetWidth;
    elementoReferenciaVersiculo.classList.add('aparecer');
}

// Função para compartilhar
function compartilharVersiculo() {
    const texto = `${elementoTextoVersiculo.textContent} ${elementoReferenciaVersiculo.textContent}`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Versículo do Dia',
            text: texto,
            url: window.location.href
        }).catch(erro => {
            console.error("Erro ao compartilhar:", erro);
            copiarTexto(texto);
        });
    } else {
        copiarTexto(texto);
    }
}

// Função para copiar texto
function copiarTexto(texto) {
    navigator.clipboard.writeText(texto).then(() => {
        alert("Versículo copiado!");
    }).catch(() => {
        const area = document.createElement('textarea');
        area.value = texto;
        document.body.appendChild(area);
        area.select();
        document.execCommand('copy');
        document.body.removeChild(area);
        alert("Versículo copiado!");
    });
}

// Função para alternar tema
function alternarTema() {
    const temaAtual = document.documentElement.getAttribute('data-tema');
    if (temaAtual === 'escuro') {
        document.documentElement.removeAttribute('data-tema');
        localStorage.setItem('tema', 'claro');
    } else {
        document.documentElement.setAttribute('data-tema', 'escuro');
        localStorage.setItem('tema', 'escuro');
    }
}

// Função para verificar tema salvo
function verificarTema() {
    const temaSalvo = localStorage.getItem('tema');
    if (temaSalvo === 'escuro') {
        document.documentElement.setAttribute('data-tema', 'escuro');
        alternadorTema.checked = true;
    }
}

// Eventos
botaoNovoVersiculo.addEventListener('click', buscarVersiculo);
botaoCompartilhar.addEventListener('click', compartilharVersiculo);
alternadorTema.addEventListener('change', alternarTema);

// Inicialização
verificarTema();
buscarVersiculo();