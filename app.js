const pokemonsTotalNumber = 151;
const typesTotalNumber = 18;

const findPokemonBar = document.getElementById('findPokemonBar');
const pokedex = document.getElementById('pokedex');
const typesList = document.getElementById('typesList');

let pokemonList = [];
let pokemontypesList = [];
let cache = [];

findPokemonBar.addEventListener('keyup', (e) => {
  const search = e.target.value.toLowerCase();
  const filteredPokemons = pokemonList.filter((pokename) => {
    return pokename.name.toLowerCase().includes(search);
  })
  pokemonCard(filteredPokemons);
});


const opts = document.getElementById('typesList').childNodes;
const dinput = document.getElementById('comboType');
let eventSource = null;
let value = '';
let err = '';

dinput.addEventListener('keydown', (e) => {
  eventSource = e.key ? 'input' : 'list';
});

dinput.addEventListener('input', (e) => {
  value = e.target.value.toLowerCase();
  const filteredTypes = pokemonList.filter((pokeType) => {
    return (pokeType.type1.toLowerCase().includes(value) || pokeType.type2.toLowerCase().includes(value));
  })
  pokemonCard(filteredTypes);
});

var error = false;
const fetchPok = async () => {
  const promises = [];
  for (let i = 1; i <= pokemonsTotalNumber; i++) {
    const url = `https://pokeapi.co/api/v2/pokemon/${i}`;
     promises.push(fetch(url).then(response => {
       if(response.ok) {return response.json()}
       else {
            if (response.status == 404) {console.error ('Bad Request');}
            error = true;
            throw Error('Error');
          }
     })
     .catch(err => { console.err("ERROR: ", err)})
   );
}
  await Promise.all(promises)
  .then((results) => {
      if(results == null) alert("Error: something goes wrong. check the console to see the detail error")
    else {
    pokemonList = results.map((data) => ({
      id: data.id,
      name: data.name,
      type1: data.types[0].type.name,
      type2: (data.types.length == 2) ? data.types[1].type.name : 'none',
      image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${data.id}.png`,
      height: data.height,
      weight: data.weight,
    }));
  }
    pokemonCard(pokemonList);
  })
}

const pokemonCard = (pokemonList) => {
  const pokemonHTMLString = pokemonList.reduce((acu, pok) => {
    acu +=
      `
    <li class="card" tabindex = 0 onclick = getPokemon(${pok.id}) onKeyPress=getPokemon(${pok.id}) aria-haspopup = "true">
                <img class="card-image" src="${pok.image}" alt="pokemon image"/>
                <h2 class="card-number"> # ${pok.id}</h2><h2 class="card-title"> ${pok.name}</h2>
                <img class="card-type1" src="types/${pok.type1}.png" alt = "pokemon type 1"/>
                      `
    if (pok.type2 != 'none') {
      acu += `<img class = "card-type2" src="types/${pok.type2}.png" alt = "pokemon type 2"/>`

    }
    acu += `<h2 class = "card-height-weight"> Height:${pok.height}</h2>
            <h2 class = "card-height-weight"> Weight:${pok.weight}</h2>
        </li>`
    return acu
  }, '')
  pokedex.innerHTML = pokemonHTMLString;
};

const getPokemon = async (pokemonID) => {
  const url = `https://pokeapi.co/api/v2/pokemon/${pokemonID}`;
  const response = await fetch(url).then(resp => {
      if (resp.ok){
            return resp.json();
      } else {
          if (response.status == 404) {console.error ('Bad Request');}
        throw Error ('Error');
      }
  }
)
.catch (error => console.error(error.message));
if (response != null) {
  var pokemon = {
    id: response.id,
    name: response.name,
    type1: response.types[0].type.name,
    type2: (response.types.length == 2) ? response.types[1].type.name : 'none',
    image1: response.sprites['front_default'],
    image2: response.sprites['back_default'],
    height: response.height,
    weight: response.weight,
    ability_normal1: (response.abilities.length >= 1) ? response.abilities[0].ability.name : 'none',
    ability_normal2: ((response.abilities.length >= 2) && response.abilities[1].is_hidden == false) ? response.abilities[1].ability.name : 'none',
    ability_hidden: ((response.abilities.length >= 2) && (response.abilities[1].is_hidden == true)) ? response.abilities[1].ability.name : ((response.abilities.length ==2) && (response.abilities[2].is_hidden == true)) ? response.abilities[2].ability.name : 'none',
    especie_url: response.species.url,
    hp: response.stats[0].base_stat,
    attack: response.stats[1].base_stat,
    defense: response.stats[2].base_stat,
    special_attack: response.stats[3].base_stat,
    special_defense: response.stats[4].base_stat,
    speed: response.stats[5].base_stat,
  };
  const especie = await fetch(pokemon.especie_url)
    .then (resp => {
      if (resp.ok) {
        return resp.json();
      }
      else {
        if (response.status == 404) {console.error ('Bad Request');}
        throw Error ('Error');
      }
    })
    .catch (error => console.error (error.message));

  if (especie.evolves_from_species != null) {
    aux = especie.evolves_from_species.url.replace(`https://pokeapi.co/api/v2/pokemon-species/`, ' ');
    aux2 = aux.replace('/', ' ');
    id = aux2.trim();
    var evolve = {
      evolve_name: especie.evolves_from_species.name,
      evolve_id: id,
      evolve_photo: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
    };
  } else {
    evolve = null;
    id = null
  }
  cardPopUp(pokemon, evolve);
}
  else{
    alert('Error: something goes wrong. check the console to see the detail error');
  }
};


const cardPopUp = (pokemon, evolve) => {
  var htmlString = `
    <li class = "popup" aria-hidden = "false" >
    <button id="closeButton" onclick= "closePopUp()">Close</button>
      <h2 class = "card-title-pop">${pokemon.name} </h2>
        <img class = "image-type1-pop" src="types/${pokemon.type1}.png" alt = "Pokemon type 1 "/>`

          if (pokemon.type2 != 'none') {
    		      htmlString += `<img class = "image-type2-pop" src="types/${pokemon.type2}.png" alt = "Pokemon type 2 "/> \n`
  		         }

        htmlString += `
        <h2 class = "card-height-weight-pop"> Height: ${pokemon.height}       Weight: ${pokemon.weight}</h2>
        <img class = "card-image1-pop" src ="${pokemon.image1}" alt = "sprite1"/>
        <img class = "card-image2-pop" src ="${pokemon.image2}" alt = "sprite2"/>
        <h2 class = "normal-abilities"> Normal ability: ${pokemon.ability_normal1}`;

         if (pokemon.ability_normal2 != 'none' ) {htmlString += ` || ${pokemon.ability_normal2}`}

         htmlString += `
                </h2>
        <h2 class = "hidden-ability"> Hidden ability: ${pokemon.ability_hidden} </h2>
        <h2 class = stats > Stats </h2>
        <div class = "stats-box-list" role = "list" >
          <p class = "item" role = "listitem"> Hp : ${pokemon.hp} </p>
            <div class = "item-bar" role = "progressbar" style="width:${150*(pokemon.hp/255)}%"></div>
          <p class = "item" role = "listitem" > Attack : ${pokemon.attack} </p>
              <div class = "item-bar" role = "progressbar" style="width:${150*(pokemon.attack/181)}%"></div>
          <p class = "item" role = "listitem"  > Defense : ${pokemon.defense} </p>
              <div class = "item-bar" role = "progressbar" style="width:${150*(pokemon.defense/230)}%"></div>
          <p class = "item" role = "listitem" > Special Attack : ${pokemon.special_attack} </p>
            <div class = "item-bar"  role = "progressbar" style="width:${150*(pokemon.special_attack/173)}%"></div>
          <p class = "item" role = "listitem"  > Special Defense : ${pokemon.special_defense} </p>
            <div class = "item-bar" role = "progressbar" style="width:${150*(pokemon.special_defense/230)}%"></div>
          <p class = "item" role = "listitem" > Speed : ${pokemon.speed} </p>
            <div class = "item-bar" role = "progressbar" style="width:${150*(pokemon.speed/200)}%"></div>
        </div>`

  if (evolve != null) {
    htmlString +=`
      <img class="image-evolve-pop" src="${evolve.evolve_photo}" alt = "evolve photo"/>
      <h1 class = "title-pop-evolve"> Evolves from : ${evolve.evolve_name} </h1>`

  }
  htmlString += `
        </li>
      `;
  pokedex.innerHTML = htmlString + pokedex.innerHTML;
};

const closePopUp = () => {
  const pop = document.querySelector('.popup');
  pop.parentElement.removeChild(pop);
};

const getTypes = async () => {
  const typePromises = [];
  for (let t = 1; t <= typesTotalNumber; t++) {
    const url = `https://pokeapi.co/api/v2/type/${t}`;
    typePromises.push(fetch(url)
      .then(response => {
        if (response.ok){return response.json();}
        else {
            if (response.status == 404) {console.error ('Bad Request');}
          throw Error ('Error');}
      })
      .catch(err => { console.error(err.message)})
    );
  }
  await Promise.all(typePromises).then((results) => {
    if (results[0] != null){
    pokemontypesList = results.map((data) => ({
      name: data.name,
      pokemon: data.pokemon,
    }));
  addOptionTypes(pokemontypesList);
}else alert('Error: something goes wrong. check the console to see the detail error');
  })
};

const addOptionTypes = (pokemontypesList) => {
  for (value in pokemontypesList) {
    option = document.createElement('option');
    option.text = pokemontypesList[value].name;
    typesList.appendChild(option);
  }
};

 fetchPok();
 getTypes();
