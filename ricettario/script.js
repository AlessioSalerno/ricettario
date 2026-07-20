const recipeForm = document.getElementById('recipe-form');
const recipesContainer = document.getElementById('recipes-container');
const searchInput = document.getElementById('search-input');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');
const editIndexInput = document.getElementById('edit-index');

let recipes = JSON.parse(localStorage.getItem('ricette')) || [];

function renderRecipes(filterText = '') {
  recipesContainer.innerHTML = '';

  const filteredRecipes = recipes.filter(recipe => {
    const term = filterText.toLowerCase();
    return recipe.title.toLowerCase().includes(term) || 
           recipe.ingredients.toLowerCase().includes(term);
  });

  if (filteredRecipes.length === 0) {
    recipesContainer.innerHTML = '<p style="color: #8395a7;">Nessuna ricetta trovata.</p>';
    return;
  }

  filteredRecipes.forEach((recipe) => {
    const originalIndex = recipes.indexOf(recipe);

    const card = document.createElement('div');
    card.classList.add('recipe-card');
    card.id = `recipe-card-${originalIndex}`;

    const ingredientsList = recipe.ingredients
      .split('\n')
      .filter(item => item.trim() !== '')
      .map(item => `<li>${item}</li>`)
      .join('');

    let mediaHtml = '';
    if (recipe.mediaData) {
      if (recipe.mediaType && recipe.mediaType.startsWith('video/')) {
        mediaHtml = `<video src="${recipe.mediaData}" controls class="recipe-media"></video>`;
      } else {
        mediaHtml = `<img src="${recipe.mediaData}" alt="Foto ricetta" class="recipe-media">`;
      }
    }

    card.innerHTML = `
      <div>
        <h3>${recipe.title}</h3>
        ${mediaHtml}
        <h4>Ingredienti:</h4>
        <ul>${ingredientsList}</ul>
        <h4>Procedimento:</h4>
        <p>${recipe.instructions}</p>
      </div>

      <div class="card-actions">
        <button class="action-btn edit-btn" onclick="editRecipe(${originalIndex})">✏️ Modifica</button>
        <button class="action-btn print-btn" onclick="printRecipe(${originalIndex})">🖨️ Stampa / PDF</button>
        <button class="action-btn share-btn" onclick="shareRecipe(${originalIndex})">📲 Invia</button>
        <button class="action-btn delete-btn" onclick="deleteRecipe(${originalIndex})">🗑️ Elimina</button>
      </div>
    `;

    recipesContainer.appendChild(card);
  });
}

searchInput.addEventListener('input', (e) => {
  renderRecipes(e.target.value);
});

recipeForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const title = document.getElementById('title').value;
  const ingredients = document.getElementById('ingredients').value;
  const instructions = document.getElementById('instructions').value;
  const mediaFile = document.getElementById('media-input').files[0];
  const editIndex = parseInt(editIndexInput.value);

  const processAndSave = (mediaData, mediaType) => {
    const recipeData = {
      title,
      ingredients,
      instructions,
      mediaData: mediaData !== undefined ? mediaData : (editIndex >= 0 ? recipes[editIndex].mediaData : null),
      mediaType: mediaType !== undefined ? mediaType : (editIndex >= 0 ? recipes[editIndex].mediaType : null)
    };

    if (editIndex >= 0) {
      recipes[editIndex] = recipeData;
    } else {
      recipes.push(recipeData);
    }

    try {
      localStorage.setItem('ricette', JSON.stringify(recipes));
    } catch (error) {
      alert("Attenzione: Il file multimediale è troppo grande per la memoria locale!");
      return;
    }

    resetForm();
    renderRecipes(searchInput.value);
  };

  if (mediaFile) {
    const reader = new FileReader();
    reader.onload = (event) => processAndSave(event.target.result, mediaFile.type);
    reader.readAsDataURL(mediaFile);
  } else {
    processAndSave();
  }
});

function editRecipe(index) {
  const recipe = recipes[index];
  document.getElementById('title').value = recipe.title;
  document.getElementById('ingredients').value = recipe.ingredients;
  document.getElementById('instructions').value = recipe.instructions;
  editIndexInput.value = index;

  formTitle.textContent = "Modifica Ricetta";
  submitBtn.textContent = "Aggiorna Ricetta";
  cancelEditBtn.style.display = "block";

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

cancelEditBtn.addEventListener('click', resetForm);

function resetForm() {
  recipeForm.reset();
  editIndexInput.value = "-1";
  formTitle.textContent = "Aggiungi una Ricetta";
  submitBtn.textContent = "Salva Ricetta";
  cancelEditBtn.style.display = "none";
}

// Funzione di Stampa con Anteprima integrata
function printRecipe(index) {
  const allCards = document.querySelectorAll('.recipe-card');
  
  // Nasconde temporaneamente le altre ricette per stampare solo quella selezionata
  allCards.forEach((card, i) => {
    if (i !== index) {
      card.style.display = 'none';
    }
  });

  // Apre la finestra di anteprima e stampa del browser
  window.print();

  // Ripristina la visualizzazione di tutte le ricette
  renderRecipes(searchInput.value);
}

function shareRecipe(index) {
  const recipe = recipes[index];
  const shareText = `🍳 *${recipe.title}*\n\n🛒 *Ingredienti:*\n${recipe.ingredients}\n\n👨‍🍳 *Procedimento:*\n${recipe.instructions}`;

  if (navigator.share) {
    navigator.share({
      title: recipe.title,
      text: shareText
    }).catch(() => {});
  } else {
    navigator.clipboard.writeText(shareText);
    alert("Testo della ricetta copiato negli appunti!");
  }
}

function deleteRecipe(index) {
  if (confirm("Sei sicuro di voler eliminare questa ricetta?")) {
    recipes.splice(index, 1);
    localStorage.setItem('ricette', JSON.stringify(recipes));
    renderRecipes(searchInput.value);
  }
}

renderRecipes();