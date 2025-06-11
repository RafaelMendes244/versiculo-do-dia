const BIBLE_EDGE_BASE_URL = 'https://bible-edge.onrender.com/api/'; // API utilizada
const BIBLE_VERSION = 'nvi'; // Usando a versão NVI

const verseTextElement = document.getElementById('verseText');
const verseReferenceElement = document.getElementById('verseReference');
const newVerseBtn = document.getElementById('newVerseBtn');
const shareVerseBtn = document.getElementById('shareVerseBtn');
const themeToggle = document.getElementById('themeToggle');

// Versículos locais para fallback
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

// Função para buscar e exibir o versículo
async function fetchAndDisplayVerse() {
    verseTextElement.textContent = "Carregando versículo...";
    verseReferenceElement.textContent = "";
    newVerseBtn.disabled = true;
    shareVerseBtn.disabled = true;

    try {
        // 1. Buscar todos os livros da Bíblia
        console.log("Tentando buscar livros da Bíblia na Bible-Edge API...");
        const booksResponse = await fetch(`${BIBLE_EDGE_BASE_URL}books`);
        if (!booksResponse.ok) {
            throw new Error(`Erro ao buscar livros: ${booksResponse.status} - ${booksResponse.statusText}`);
        }
        const books = await booksResponse.json();
        console.log("Livros recebidos da Bible-Edge:", books);

        if (books.length === 0) {
            throw new Error("Nenhum livro encontrado na API.");
        }

        // 2. Selecionar um livro aleatório
        const randomBookIndex = Math.floor(Math.random() * books.length);
        const randomBook = books[randomBookIndex];
        const bookId = randomBook.id;
        const bookName = randomBook.name;
        console.log(`Livro aleatório selecionado: ${bookName} (ID: ${bookId})`);

        // 3. Buscar capítulos do livro selecionado
        console.log(`Tentando buscar capítulos para o livro ${bookName}...`);
        const chaptersResponse = await fetch(`${BIBLE_EDGE_BASE_URL}books/${bookId}/chapters`);
        if (!chaptersResponse.ok) {
            throw new Error(`Erro ao buscar capítulos para ${bookName}: ${chaptersResponse.status} - ${chaptersResponse.statusText}`);
        }
        const chapters = await chaptersResponse.json();
        console.log("Capítulos recebidos:", chapters);

        if (!chapters || chapters.length === 0) {
            throw new Error(`Nenhum capítulo encontrado para o livro ${bookName}.`);
        }

        // 4. Selecionar um capítulo aleatório
        const randomChapterIndex = Math.floor(Math.random() * chapters.length);
        const selectedChapter = chapters[randomChapterIndex];
        const chapterNumber = selectedChapter.number;
        console.log(`Capítulo aleatório selecionado: ${chapterNumber}`);

        // 5. Buscar os versículos do capítulo selecionado
        console.log(`Tentando buscar versículos para ${bookName} capítulo ${chapterNumber}...`);
        const versesResponse = await fetch(`${BIBLE_EDGE_BASE_URL}books/${bookId}/chapters/${chapterNumber}/verses`);
        if (!versesResponse.ok) {
            throw new Error(`Erro ao buscar versículos: ${versesResponse.status} - ${versesResponse.statusText}`);
        }
        const versesData = await versesResponse.json();
        console.log("Versículos recebidos:", versesData);

        if (!versesData || versesData.length === 0) {
            throw new Error("Nenhum versículo encontrado para o capítulo selecionado.");
        }

        // 6. Selecionar um versículo aleatório
        const randomVerseIndex = Math.floor(Math.random() * versesData.length);
        const selectedVerse = versesData[randomVerseIndex];
        console.log("Versículo selecionado:", selectedVerse);

        // Formatar a referência (ex: "João 3:16")
        const verseReference = `${selectedVerse.book.name} ${selectedVerse.chapter.number}:${selectedVerse.number}`;

        verseTextElement.textContent = `"${selectedVerse.text.trim()}"`; // .trim() para remover espaços extras
        verseReferenceElement.textContent = verseReference;

    } catch (error) {
        console.error("ERRO GERAL no processo de busca do versículo:", error);
        useLocalVerse(); // Em caso de erro, usa um versículo local
    } finally {
        newVerseBtn.disabled = false;
        shareVerseBtn.disabled = false;
        animateVerse();
    }
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

// Funções de compartilhar e copiar
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

// Funções de tema
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

function checkSavedTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeToggle.checked = true;
    }
}

// Adiciona os event listeners
newVerseBtn.addEventListener('click', fetchAndDisplayVerse);
shareVerseBtn.addEventListener('click', shareVerse);
themeToggle.addEventListener('change', toggleTheme);

// Chamadas iniciais ao carregar a página
checkSavedTheme();
fetchAndDisplayVerse();