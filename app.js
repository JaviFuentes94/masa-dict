document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const resultsArea = document.getElementById('resultsArea');
    const alphabeticalIndexNav = document.getElementById('alphabeticalIndexNav');
    const letterButtonsContainer = document.getElementById('letterButtons');
    const showAllTermsFromLettersButton = document.getElementById('showAllTermsFromLetters');

    let termsData = [];
    let currentLetterFilter = null;

    // Fetch the dictionary data
    fetch('terms.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            termsData = data.sort((a, b) => a.term.localeCompare(b.term, 'es', { sensitivity: 'base' }));
            generateLetterButtons();
            displayAllTerms();
        })
        .catch(error => {
            console.error("Error loading terms.json:", error);
            resultsArea.innerHTML = `
                <div class="col-span-full text-center py-16">
                    <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded-md inline-block">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <i class="fas fa-exclamation-circle text-red-500 text-xl"></i>
                            </div>
                            <div class="ml-3">
                                <p class="text-red-700">Error al cargar el diccionario. Por favor, revisa que el archivo 'terms.json' exista y esté accesible.</p>
                            </div>
                        </div>
                    </div>
                </div>`;
        });

    function generateLetterButtons() {
        letterButtonsContainer.innerHTML = '';
        const letters = [...new Set(termsData.map(term => term.term[0].toUpperCase()))].sort((a,b) => a.localeCompare(b, 'es'));
        letters.forEach(letter => {
            const button = document.createElement('button');
            button.textContent = letter;
            button.className = 'w-10 h-10 flex items-center justify-center border border-tierra-200 rounded-md hover:bg-tierra-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-tierra-600 transition-colors duration-200 text-lg font-medium';
            button.addEventListener('click', () => {
                filterByLetter(letter);
            });
            letterButtonsContainer.appendChild(button);
        });
    }

    function setActiveLetterButton(activeLetter) {
        document.querySelectorAll('#letterButtons button').forEach(btn => {
            btn.classList.remove('active-letter');
        });
        
        if (activeLetter) {
            const buttonToActivate = Array.from(document.querySelectorAll('#letterButtons button'))
                                    .find(btn => btn.textContent === activeLetter);
            if (buttonToActivate) {
                buttonToActivate.classList.add('active-letter');
            }
        }
    }

    function displayTerms(termsToDisplay) {
        resultsArea.innerHTML = '';
        
        if (termsToDisplay.length === 0) {
            resultsArea.innerHTML = `
                <div class="col-span-full text-center py-16">
                    <div class="inline-block p-6 bg-white rounded-lg shadow-md border border-gray-200">
                        <i class="fas fa-search text-4xl text-gray-400 mb-4"></i>
                        <p class="text-gray-600 text-xl">No se encontraron términos.</p>
                    </div>
                </div>`;
            return;
        }

        termsToDisplay.forEach(term => {
            const termElement = document.createElement('article');
            termElement.className = 'bg-white p-6 rounded-xl border border-gray-100 shadow-md hover:shadow-lg transition-all duration-300';

            let synonymsHTML = '';
            if (term.synonyms && term.synonyms.length > 0) {
                synonymsHTML = `
                    <div class="mt-3 pt-3 border-t border-gray-100">
                        <p class="text-sm text-gray-600">
                            <span class="font-medium text-tierra-600">Sinónimos:</span> 
                            ${term.synonyms.join(', ')}
                        </p>
                    </div>`;
            }

            let crossReferencesHTML = '';
            if (term.crossReferences && term.crossReferences.length > 0) {
                crossReferencesHTML = `
                    <div class="mt-2">
                        <p class="text-sm text-gray-600">
                            <span class="font-medium text-tierra-600">Ver también:</span> 
                            ${term.crossReferences.join(', ')}
                        </p>
                    </div>`;
            }

            termElement.innerHTML = `
                <div class="flex justify-between items-start">
                    <h3 class="text-2xl font-serif font-bold text-tierra-700">${term.term}</h3>
                    <span class="text-xs uppercase tracking-wider text-gray-500 bg-gray-100 px-2 py-1 rounded">${term.grammaticalType}</span>
                </div>
                <div class="mt-4">
                    <p class="text-gray-800">${term.definition}</p>
                </div>
                ${term.example ? `
                <div class="mt-3 italic text-gray-600 bg-tierra-50 p-3 rounded-md">
                    <i class="fas fa-quote-left text-xs text-tierra-400 mr-1"></i>
                    ${term.example}
                    <i class="fas fa-quote-right text-xs text-tierra-400 ml-1"></i>
                </div>` : ''}
                ${synonymsHTML}
                ${crossReferencesHTML}
            `;
            resultsArea.appendChild(termElement);
        });
    }

    function displayAllTerms() {
        currentLetterFilter = null;
        searchInput.value = '';
        setActiveLetterButton(null);
        displayTerms(termsData);
    }

    function filterByLetter(letter) {
        currentLetterFilter = letter;
        searchInput.value = '';
        const filteredTerms = termsData.filter(term => term.term[0].toUpperCase() === letter);
        displayTerms(filteredTerms);
        setActiveLetterButton(letter);
        window.scrollTo({
            top: alphabeticalIndexNav.offsetTop + alphabeticalIndexNav.offsetHeight,
            behavior: 'smooth'
        });
    }

    // Event Listeners
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        
        if (searchTerm === '') {
            if (currentLetterFilter) {
                filterByLetter(currentLetterFilter);
            } else {
                displayAllTerms();
            }
            return;
        }

        currentLetterFilter = null;
        setActiveLetterButton(null);

        const filteredTerms = termsData.filter(item =>
            item.term.toLowerCase().includes(searchTerm) ||
            item.definition.toLowerCase().includes(searchTerm) ||
            (item.example && item.example.toLowerCase().includes(searchTerm)) ||
            (item.synonyms && item.synonyms.some(s => s.toLowerCase().includes(searchTerm)))
        );
        displayTerms(filteredTerms);
    });

    showAllTermsFromLettersButton.addEventListener('click', () => {
        displayAllTerms();
    });
});