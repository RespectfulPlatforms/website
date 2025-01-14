class LanguagePicker {
  constructor() {
    this.config = null;
    this.currentLang = null;
  }

  async init() {
    try {
      const response = await fetch('/config.json?v=1');
      this.config = await response.json();
      
      this.currentLang = this.getCurrentLanguage();
      
      this.createLanguagePicker();
      
      this.addEventListeners();
    } catch (error) {
      console.error('Error initializing language picker:', error);
    }
  }

  getCurrentLanguage() {
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    if (pathParts[0] === 'lang' && pathParts[1]) {
      return pathParts[1];
    }
    return this.config.site.defaultLang;
  }

  createLanguagePicker() {
    const template = `
      <div class="relative inline-block text-left" id="language-picker">
        <button
          type="button"
          class="inline-flex items-center justify-between w-32 px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          id="language-button"
          aria-expanded="false"
          aria-haspopup="true"
        >
          <span class="flex items-center">
            <span class="mr-2">${this.config.languages[this.currentLang].flag}</span>
            <span>${this.config.languages[this.currentLang].name}</span>
          </span>
          <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div
          class="absolute right-0 z-50 w-48 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 hidden"
          id="language-dropdown"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="language-button"
        >
          <div class="py-1">
            ${this.createLanguageOptions()}
          </div>
        </div>
      </div>
    `;

    let container = document.getElementById('language-picker-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'language-picker-container';
      container.className = 'fixed top-0 left-0 right-0 bg-white shadow-md z-50 flex justify-end px-4 py-2';
      document.body.appendChild(container);
    }
    
    container.innerHTML = template;
  }

  createLanguageOptions() {
    const currentPath = window.location.pathname;
    const currentLang = this.getCurrentLanguage();
    
    return Object.entries(this.config.languages)
      .map(([code, lang]) => {
        let relativePath = '';
        if (currentLang === this.config.site.defaultLang) {
          relativePath = currentPath;
        } else {
          const pathParts = currentPath.split('/');
          relativePath = '/' + pathParts.slice(3).join('/');
        }

        const targetPath = code === this.config.site.defaultLang 
          ? relativePath || '/'
          : `/lang/${code}${relativePath}`;

        return `
          <a
            href="${targetPath}"
            class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            role="menuitem"
            data-lang="${code}"
          >
            <span class="mr-2">${lang.flag}</span>
            <span>${lang.name}</span>
          </a>
        `;
      })
      .join('');
  }

  addEventListeners() {
    const button = document.getElementById('language-button');
    const dropdown = document.getElementById('language-dropdown');

    button.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('hidden');
      button.setAttribute('aria-expanded', dropdown.classList.contains('hidden') ? 'false' : 'true');
    });

    document.addEventListener('click', () => {
      dropdown.classList.add('hidden');
      button.setAttribute('aria-expanded', 'false');
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const picker = new LanguagePicker();
  picker.init();
});