//These store links to the API (a server that gives you meal data).
const SEARCH_API_URL = "https://www.themealdb.com/api/json/v1/1/search.php?s="; //Search meal by name
const RANDOM_API_URL = "https://www.themealdb.com/api/json/v1/1/random.php"; // Get a random meal 
const LOOKUP_API_URL = "https://www.themealdb.com/api/json/v1/1/lookup.php?i="; //

//An API is a server that sends you data when you ask for it
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input"); //Text box
const resultsGrid = document.getElementById("results-grid"); //Where recipes show
const messageArea = document.getElementById("message-area"); //Where msgs/errors show
const randomButton = document.getElementById("random-button");
const modal = document.getElementById("recipe-modal");
const modalContent = document.getElementById("recipe-details-content");
const modalCloseBtn = document.getElementById("modal-close-btn");

searchForm.addEventListener("submit", (e) => { //runs the code when form is submitted
    e.preventDefault(); //stops page from refreshing 
    const searchTerm = searchInput.value.trim(); //Gets what user typed and .trim removes spaces
    console.log("search term", searchTerm);

    if (searchTerm) { //if input is not empty
        searchRecipes(searchTerm); //Call your function to search recipes
    } else {
       showMessage("Please enter a search term", true); //If empty show error msg
    }
});

async function searchRecipes(query) { //async means you can use await inside
    showMessage(`Searching for ${query}...`, false, true); //Shows loading message
    resultsGrid.innerHTML = ""; //Clears old results 

    try {
    const response = await fetch(`${SEARCH_API_URL}${query}`);
    if(!response.ok) throw new Error("Network Error"); //if RQ fails throw error

        const data = await response.json(); //convert response into usable JS object
        clearMessage(); //Remove loading msg
        console.log("data:", data);

        if(data.meals){
            displayRecipes(data.meals);
        } else {
            showMessage(`No recipes found for ${query},`)
        }
    } catch (error) {
        showMessage("Something went wrong, Please Try again", true);
    }
}

function showMessage(message, isError=false, isLoading=false) { // displays messages to the user.
    messageArea.textContent = message;
    if (isError) messageArea.classList.add("error");
    if (isLoading) messageArea.classList.add("loading");
}

function clearMessage() {
    messageArea.textContent = "";
    messageArea.className = "message";
}

function displayRecipes(recipes) { //Takes API data and shows cards on screen
    if(!recipes || recipes.length === 0) {
        showMessage("No recipes to display");
    }
//loops thru each recipe
    recipes.forEach(recipe => {
        const recipeDiv = document.createElement("div"); //build card
        recipeDiv.classList.add("recipe-item");
        recipeDiv.dataset.id = recipe.idMeal; //store hidden recipe ID

        //add image + text
        recipeDiv.innerHTML = `
        <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}" loading="lazy">
        <h3>${recipe.strMeal}</h3> 
        `; 
        
        resultsGrid.appendChild(recipeDiv); //show it on page
    });
}

randomButton.addEventListener("click", getRandomRecipe);

async function getRandomRecipe() { // Gets 1 random recipe
    showMessage("Fetching a random recipe...", false, true);
    resultsGrid.innerHTML = "";

    try {
        const response = await fetch(RANDOM_API_URL);
        if (!response.ok) throw new Error("Something went wrong.");
        const data = await response.json();

        console.log("data: ", data);

        clearMessage();
//data.meals checks if the API actually returns meals
        if (data.meals && data.meals.length > 0) { //safety check before results are displayed.
            displayRecipes(data.meals);
        } else {
            showMessage("Could not fetch a random recipe. Please try again.", true);
        }
    } catch (error) {
showMessage("Failed to fetch a random recipe. Please check your connection and try again.",
    true,
    );
    }
}

function showModal() {
    modal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
}

function closeModal() {
    modal.classList.add("hidden");
    document.body.style.overflow = "";
}

resultsGrid.addEventListener("click", e=> {
    const card = e.target.closest(".recipe-item");

    if (card) {
        const recipeId = card.dataset.id;
        getRecipeDetails(recipeId); //This is what connects UI → correct recipe
    } 
});

async function getRecipeDetails(id) {
    modalContent.innerHTML = '<p class="message loading">Loading details...</p>' //Gets recipe details
    showModal();

    try {
    const response = await fetch(`${LOOKUP_API_URL}${id}`) //Gives the recipe with this ID
    if(!response.ok) throw new Error("Failed to fetch recipe details.")
        const data = await response.json();

    if(data.meals && data.meals.length > 0) {
        displayRecipeDetails(data.meals[0]);
        } else {
            modalContent.innerHTML = '<p class="message error">Could not load recipe details.</p>'
        }
    } catch (error) {
        modalContent.innerHTML = '<p class="message error">Failed to load recipe details. check your connection or try again</p>';
    }
}

modalCloseBtn.addEventListener("click", closeModal);

modal.addEventListener("click", e => {
    if(e.target === modal) {
        closeModal();
    }
});
// This function shows recipes on the page
function displayRecipeDetails(recipe) { //Fetches full recipe info
    const ingrediants = [];
//Ingrediants Loop
    for(let i = 1; i <= 20; i++ ) {
        const ingrediant = recipe[`strIngrediant${i}`]?.trim();
        const measure = recipe[`strMeasure${i}`]?.trim();

        if (ingrediant){
            ingrediants.push(`<li>${measure ? `${measure}` : ""}${ingrediant}</li>`)
        } else {
            break;
        }
    }

    const categoryHTML = recipe.strCategory ? `<h3>Category: ${recipe.strCategory}</
    h3>` : "";

    const areaHTML = recipe.strArea ? `<h3>Area: ${recipe.strArea}` : "";
    const ingrediantsHTML = ingrediants.length ? `<h3>Ingrediants</h3>
    <ul>${ingrediants.join("")}</ul>` : "";
    const instructionsHTML = `<h3>Instructions</h3>
    <p>${recipe.strInstructions ? recipe.strInstructions.replace(/\r?\n/g, "<br>") 
    : "Instructions not availiable"}</p>`;
    const youtubeHTML = recipe.strYoutube ? `<h3>Video Recipe</h3><div class="video-wrapper"><a href="${recipe.strYoutube}" target="_blank">Watch on 
    Youtube</a><div>` 
    : "";
    const sourceHTML = recipe.strSource ? `<div class="source-wrapper><a href="$
    {recipe.strSource} target="_blank">View Original Source</a></div>` 
    : "";

    modalContent.innerHTML = `
    <h2>${recipe.strMeal}</h2>
    <img src="${recipe.strMealThumb} alt="${recipe.strMeal}">
    ${categoryHTML}
    ${areaHTML}
    ${ingrediantsHTML}
    ${instructionsHTML}
    ${youtubeHTML}
    ${sourceHTML}
    `;
}