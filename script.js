const BIBLE_API_URL = 'https://bible-api.com/?random=verse'; // Busca um versículo aleatório em inglês
const MYMEMORY_API_URL = 'https://api.mymemory.translated.net/get'; // Para tradução

const verseTextElement = document.getElementById('verseText');
const verseReferenceElement = document.getElementById('verseReference');
const newVerseBtn = document.getElementById('newVerseBtn');
const shareVerseBtn = document.getElementById('shareVerseBtn');
const themeToggle = document.getElementById('themeToggle');

// Versículos locais para fallback (em português, caso as APIs falhem)
const localVerses = [
    {
        text: "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.",
        reference: "João 3:16"
    },
    {
        text: "Tudo posso naquele que me fortalece.",
        reference: "Filipenses 4:13"
    },
    {
        text: "O Senhor é o meu pastor; nada me faltará.",
        reference: "Salmos 23:1"
    },
    {
        text: "Vinde a mim, todos os que estais cansados e oprimidos, e eu vos aliviarei.",
        reference: "Mateus 11:28"
    },
    {
        text: "Em tudo dai graças, porque esta é a vontade de Deus em Cristo Jesus para convosco.",
        reference: "1 Tessalonicenses 5:18"
    }
];

// Mapeamento de nomes de livros do inglês para o português
const bookNameMap = {
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


// Função principal para buscar e traduzir o versículo
async function fetchAndTranslateVerse() {
    verseTextElement.textContent = "Carregando versículo...";
    verseReferenceElement.textContent = "";
    newVerseBtn.disabled = true;
    shareVerseBtn.disabled = true;

    try {
        // 1. Buscar versículo em inglês da Bible API
        console.log("Tentando buscar versículo da Bible API (em inglês)...");
        const verseResponse = await fetch(BIBLE_API_URL);
        if (!verseResponse.ok) {
            throw new Error(`Erro ao buscar versículo (Bible API): ${verseResponse.status} - ${verseResponse.statusText}`);
        }
        const verseData = await verseResponse.json();
        console.log("Dados da Bible API recebidos:", verseData);

        // A Bible API retorna o versículo em 'text' e a referência em 'reference'
        const englishVerseText = verseData.text;
        const englishVerseReference = verseData.reference;
        console.log(`Versículo em inglês: ${englishVerseText} (${englishVerseReference})`);


        // 2. Traduzir o texto do versículo para português via MyMemory API
        console.log("Tentando traduzir texto do versículo...");
        const translatedVerseText = await translateText(englishVerseText, 'en|pt');
        console.log("Texto traduzido:", translatedVerseText);
        
        // 3. Traduzir a referência usando o mapeamento manual
        const correctedReference = translateReference(englishVerseReference);
        console.log("Referência corrigida:", correctedReference);


        verseTextElement.textContent = `"${translatedVerseText.trim()}"`; // .trim() para remover espaços extras
        verseReferenceElement.textContent = correctedReference;

    } catch (error) {
        console.error("ERRO GERAL no processo de busca ou tradução do versículo:", error);
        useLocalVerse(); // Em caso de erro, usa um versículo local
    } finally {
        newVerseBtn.disabled = false;
        shareVerseBtn.disabled = false;
        animateVerse(); // Chama a animação
    }
}

// Função para traduzir texto usando MyMemory API
async function translateText(text, langpair) {
    try {
        const encodedText = encodeURIComponent(text);
        const url = `${MYMEMORY_API_URL}?q=${encodedText}&langpair=${langpair}`;
        // Se a MyMemory API reclamar de limite de IP ou precisar de chave, descomente e adicione sua chave:
        // const url = `${MYMEMORY_API_URL}?q=${encodedText}&langpair=${langpair}&key=SUA_CHAVE_MYMEMORY_AQUI`;

        const response = await fetch(url);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`Erro na API MyMemory: ${response.status} - ${response.statusText}. Detalhes: ${JSON.stringify(errorData)}`);
        }
        const data = await response.json();
        if (data && data.responseData && data.responseData.translatedText) {
            return data.responseData.translatedText;
        } else {
            console.warn("MyMemory API não retornou tradução. Usando texto original.");
            return text;
        }
    } catch (error) {
        console.error("Erro na tradução do texto:", error);
        return text; // Retorna o texto original em caso de erro
    }
}

// Função para traduzir a referência do versículo usando o mapeamento manual
function translateReference(englishReference) {
    // Regex para encontrar o nome do livro no início da referência (ex: "John 3:16" -> "John")
    // Também trata casos como "1 Corinthians" ou "2 Kings"
    // Captura o nome completo do livro (com ou sem número)
    const bookNameMatch = englishReference.match(/^(\d?\s?[a-zA-Z\s]+?)\s+\d+:\d+/);
    
    if (bookNameMatch && bookNameMatch[1]) {
        let englishBookName = bookNameMatch[1].trim();
        
        // Ajuste para "Song of Solomon" que vem sem espaço e é longo
        if (englishBookName.includes("SongofSolomon")) {
            englishBookName = "Song of Solomon";
        }

        const translatedBookName = bookNameMap[englishBookName] || englishBookName; // Tenta traduzir, se não, usa original
        
        // Substitui o nome do livro original pelo traduzido e mantém o resto da referência
        // Usa uma regex mais robusta para substituir apenas o nome do livro no início
        return englishReference.replace(new RegExp(`^${escapeRegExp(englishBookName)}\\s*`), `${translatedBookName} `);
    }
    return englishReference; // Retorna a referência original se não encontrar nome do livro
}

// Função auxiliar para escapar caracteres especiais em regex
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}


// Função para usar um versículo local (fallback)
function useLocalVerse() {
    const randomIndex = Math.floor(Math.random() * localVerses.length);
    verseTextElement.textContent = `"${localVerses[randomIndex].text}"`;
    verseReferenceElement.textContent = localVerses[randomIndex].reference;
    console.warn("Usando versículo local devido a erro na API.");
}

// Função para animar a transição do versículo
function animateVerse() {
    verseTextElement.classList.remove('fade-in');
    void verseTextElement.offsetWidth; 
    verseTextElement.classList.add('fade-in');

    verseReferenceElement.classList.remove('fade-in');
    void verseReferenceElement.offsetWidth;
    verseReferenceElement.classList.add('fade-in');
}

// Função para compartilhar o versículo
function shareVerse() {
    const currentVerse = verseTextElement.textContent;
    const currentReference = verseReferenceElement.textContent;
    const shareText = `Versículo do Dia: ${currentVerse} ${currentReference} #VersiculoDoDia`;

    if (navigator.share) {
        navigator.share({
            title: 'Versículo do Dia',
            text: shareText,
            url: window.location.href
        }).catch(err => {
            console.log('Erro ao compartilhar via Web Share API:', err);
            copyToClipboard();
        });
    } else {
        copyToClipboard();
    }
}

// Função para copiar o versículo para a área de transferência
function copyToClipboard() {
    const textToCopy = `${verseTextElement.textContent} ${verseReferenceElement.textContent}`;
    navigator.clipboard.writeText(textToCopy).then(() => {
        alert('Versículo copiado para a área de transferência!');
    }).catch(err => {
        console.error('Erro ao copiar:', err);
        const textarea = document.createElement('textarea');
        textarea.value = textToCopy;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        alert('Versículo copiado para a área de transferência! (Fallback)');
    });
}

// Função para alternar entre os temas claro e escuro
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    if (currentTheme === 'dark') {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    }
}

// Função para verificar o tema salvo no localStorage ao carregar a página
function checkSavedTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeToggle.checked = true;
    }
}

// Adiciona os event listeners
newVerseBtn.addEventListener('click', fetchAndTranslateVerse);
shareVerseBtn.addEventListener('click', shareVerse);
themeToggle.addEventListener('change', toggleTheme);

// Chamadas iniciais ao carregar a página
checkSavedTheme(); // Aplica o tema salvo
fetchAndTranslateVerse(); // Busca o primeiro versículo ao carregar