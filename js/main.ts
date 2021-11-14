/*  */

//import jquery
import "./jquery.js";

/* GLOBAL */

export const usingTestData = false;
// export const usingTestData = true;

const testUrl = "res/testData.json"
export const testData = await fetch(testUrl).then(response => response.json());
const animeDb = new Map<string, Anime>();

export let app: App; // Don't construct until page ready

/*  */

class App {
  tags = new HTable("tags");
  genres = new HTable("genres");
  years = new TimeLayout("years");

  idInput = document.getElementById("anime-id") as HTMLInputElement;
  addButton = document.getElementById("add-anime") as HTMLButtonElement;
}

/* INIT */

function init() {
  console.log("init page");
  giveFeedback("Page loaded");

  /*  */
  app = new App();

  /*  */

  app.idInput.addEventListener("keyup", function (event) {
    event.preventDefault();
    if (event.keyCode === 13) {
      app.addButton.click();
    }
  });


  app.addButton.addEventListener("click",
    async function () {

      const id = parseInputForId(app.idInput.value);
      if (isNaN(id)) {
        giveFeedback("Invalid anime id or url");
        return;
      }
      if (animeDb.has(id.toString())) {
        const anime = animeDb.get(id.toString());
        if (null === anime) {
          giveFeedback("Invalid anime id or url");

        } else {
          giveFeedback(`${someName(anime)} is already in the tables.`);
        }
        return;
      }

      let anime = await getAniAnime(id);
      if (anime instanceof Error) {
        anime = null as Anime;
        giveFeedback("Invalid anime id or url");
      }
      animeDb.set(id.toString(), anime);
      if (anime === null) {
        return;
      }

      displayAnime(anime);


    });
}

document.addEventListener("DOMContentLoaded", function (event) {
  //do work
  init();

});

$(init);
/* END Init */



export async function getAniList(userName: string): Promise<any | Error> {

  if (usingTestData) {
    console.warn("Using test data.");
    giveFeedback("Using test data");

    const url = "res/anilist_example.json";

    let job = await fetch(url).then(response => response.json());
    return job;

  }

  const query = `
  query ($userName: String) { 
      MediaListCollection(userName: $userName, type: ANIME) {
          hasNextChunk
          user {
              id
          }
          lists {
              name
              status
              entries {
                  mediaId
                  score
                  progress
                  startedAt { year month day } 
                  completedAt { year month day }
                  media {
                      duration
                      episodes
                      format
                      title {
                          romaji english native userPreferred
                      }
                  }
              }
          }
      }
  }
  `; // Could probably munch the whitespace with a regex but no real need to

  const variables = {
    userName: userName
  };


  // Define the config we'll need for our Api request
  const url = 'https://graphql.anilist.co',
    options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query: query,
        variables: variables
      })
    };


  const response = await fetch(url, options);
  const foo = await response.json();

  if (foo.errors) {
    console.error(foo.errors);
    return new Error("Error fetching list");
  }

  const data = foo.data.MediaListCollection;

  if (data.hasNextChunk) {
    console.warn("TODO: next chunk not implemented yet.");
  }


  return data;

}

export function parseInputForId(input: string): number {
  /* https://anilist.co/anime/269/Bleach/ → 269 */

  input = input.trim();

  if (input.length == 0) {
    return NaN;
  }

  input = input.toLocaleLowerCase();
  const asParsed = parseInt(input);
  if (!isNaN(asParsed)) {
    return asParsed;
  }

  // Format so url constructor can parse it
  if (!input.startsWith("http")) {
    input = "https://" + input;
  }

  const url = new URL(input);

  if (url.hostname !== "anilist.co") {
    return NaN;
  }

  const parts = url.pathname.split("/");
  if (parts.length < 3) {
    return NaN;
  }
  return parseInt(parts[2]);

}

// export async function getAniAnime(input: string): Promise<any | Error> {
export async function getAniAnime(id: number): Promise<Anime | Error> {

  if (usingTestData) {
    console.warn("Using test data.");
    giveFeedback("Using test data");

    const url = "res/anilist_example.json";

    let job = await fetch(url).then(response => response.json());
    return job;

  }

  // todo year/season
  const query = `
    query ($id: Int){
      Media(id: $id) {
        id
        title {
          romaji
          english
          native
          userPreferred
        }
        tags {
          id
          name
          rank
        }
        genres 
        season
        seasonYear
        startDate {
          year
          month
          day
        }
      }
    }
  `; // Could probably munch the whitespace with a regex but no real need to

  // const id = parseInputForId(input);
  const variables = {
    id: id
  };


  // Define the config we'll need for our Api request
  const url = 'https://graphql.anilist.co',
    options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query: query,
        variables: variables
      })
    };


  const response = await fetch(url, options);
  const foo = await response.json();

  if (foo.errors) {
    console.error(foo.errors);
    return new Error("Error fetching list");
  }

  const data = foo.data;

  // if (data.hasNextChunk) {
  //   console.warn("TODO: next chunk not implemented yet.");
  // }


  return data.Media as Anime;

}


// 
function giveFeedback(str: string, sec = 5) {

  const time = sec * 1000;

  const feedback = $("#feedback");
  feedback.text(str);
  // feedback[0].textContent = str;
  setTimeout(function () {
    feedback.text("");
  }, time);

}

interface ColDescription {
  name: string;
  id: string;
}

interface ColData extends ColDescription {
  index: number;
}

class HTable {
  parent: HTMLElement;
  table: HTMLTableElement;
  headRow: HTMLTableRowElement;
  body: HTMLTableSectionElement;

  //
  columns: Map<string, ColData> = new Map();
  rows: Map<string, ColData> = new Map();
  //

  constructor(parentId: string) {

    //
    this.parent = document.getElementById(parentId);

    this.table = document.createElement("table");

    this.parent.append(this.table);
    {
      const head = document.createElement("thead");
      this.table.append(head);

      {
        this.headRow = document.createElement("tr");
        head.append(this.headRow);
        {
          const spacer = document.createElement("th");
          this.headRow.append(spacer);
        }

      }
      this.body = document.createElement("tbody");
      this.table.append(this.body);
    }

  }

  addCol(desc: ColDescription): void {

    const data = desc as ColData;
    /* Make header */
    {
      data.index = this.headRow.children.length;
      const head = document.createElement("th");
      head.textContent = desc.name;
      this.headRow.append(head);
    }
    /* Fix old rows */
    for (let rowVal = 0; rowVal < this.body.children.length; rowVal++) {
      // for (let row of tableBody.children){
      const row = this.body.children[rowVal];
      let rowColCount = row.children.length;
      for (; rowColCount <= data.index; rowColCount++) {
        const data = document.createElement("td");
        // data.textContent = "x";
        row.append(data);
      }

    }
    this.columns.set(data.id, data);

  }

  addRow(desc: ColDescription): void {
    const data = desc as ColData;
    data.index = this.body.children.length;

    const row = document.createElement("tr");
    {
      const box = document.createElement("th");
      box.textContent = data.name;
      row.append(box);
    }

    for (let i = 1; i < this.headRow.children.length; ++i) {
      const box = document.createElement("td");
      // box.textContent = 'x';
      row.append(box);
    }


    this.body.append(row);

    this.rows.set(data.id, data);


  }

}

interface SeasonData {
  div: HTMLElement;
}
interface SeasonMap {
  WINTER: SeasonData;
  SPRING: SeasonData;
  SUMMER: SeasonData;
  FALL: SeasonData;
}

interface YearData {
  year: number;
  div: HTMLElement;
  seasons: SeasonMap;
}


function newYear(year: number): YearData {
  const data = {} as YearData;
  data.year = year;
  data.div = document.createElement("div");
  data.seasons = {} as SeasonMap;

  const yearLabel = document.createElement("h3");
  yearLabel.classList.add("year-label");
  yearLabel.textContent = year.toString();
  data.div.append(yearLabel);

  for (let seasonName of SeasonSet) {
    const season = document.createElement("div");
    const seasonLabel = document.createElement("h4");
    seasonLabel.classList.add("season-label");
    seasonLabel.textContent = seasonName;
    season.append(seasonLabel);
    season.style.display = "none";

    data.div.append(season);
    data.seasons[seasonName] = { div: season };
  }
  return data;
}

class TimeLayout {
  top: HTMLElement;
  yearList: YearData[] = [];

  constructor(parentId: string) {

    const parent = document.getElementById(parentId);

    this.top = document.createElement("div");
    parent.append(this.top);


  }

  getYear(year: number): YearData {


    let searchIdx = 0;
    for (; searchIdx < this.yearList.length; ++searchIdx) {
      if (this.yearList[searchIdx].year >= year) {
        break;
      }
    }
    // At end or of empty list
    if (searchIdx >= this.yearList.length) {
      const data = newYear(year);
      this.top.append(data.div);
      this.yearList.push(data);
      return data;
    }

    const closest = this.yearList[searchIdx];
    if (closest.year == year) {
      return closest;
    }
    const data = newYear(year);
    this.top.insertBefore(data.div, closest.div);

    this.yearList.splice(searchIdx, 0, data);
    return data;


  }

  addAnime(anime: Anime) {
    const year = this.getYear(anime.seasonYear);
    const season = year.seasons[anime.season];
    season.div.style.display = "inherit";

    const animeLabel = document.createElement("div");
    const date = asYYYYMMDD(anime.startDate);
    animeLabel.textContent = `${someName(anime)}: ${date}`;

    season.div.append(animeLabel);
  }

}

interface ADate {
  year: number;
  month: number;
  day: number;
}

interface Tag {
  id: number;
  name: string;
  rank: number;
}
interface Title {
  romaji: string;
  english: string;
  native: string;
}
interface Anime {
  id: number;
  title: Title;
  tags: Tag[];
  genres: string[];
  season: "WINTER" | "SPRING" | "SUMMER" | "FALL";
  seasonYear: number;
  startDate: ADate;
}

function someName(title: Title | Anime): string {

  if ("title" in title) {
    title = title.title;
  }

  return title.english || title.romaji || title.romaji;
}

const SeasonSet = ["WINTER", "SPRING", "SUMMER", "FALL"];

const tagThreshold = 50;

const zeroPad = (num: number, places: number) => String(num).padStart(places, '0');

function asYYYYMMDD(date: ADate): string {
  const mm = zeroPad(date.month, 2);
  const dd = zeroPad(date.day, 2);
  return `${date.year}-${mm}-${dd}`;
}

function displayAnime(anime: Anime) {
  // Tags
  for (let tag of anime.tags) {
    if (tag.rank > tagThreshold && !app.tags.columns.has(tag.id.toString())) {
      app.tags.addCol({ id: tag.id.toString(), name: tag.name });
    }
  }
  app.tags.addRow({ id: anime.id.toString(), name: someName(anime) });

  // Genres
  for (let genre of anime.genres) {
    if (!app.genres.columns.has(genre)) {
      app.genres.addCol({ id: genre, name: genre });
    }
  }
  app.genres.addRow({ id: anime.id.toString(), name: someName(anime) });

  // Years 
  app.years.addAnime(anime);

  //
  fillTables();

}

function fillAnimeRows(anime: Anime) {
  const tagTable = app.tags;
  const genreTable = app.genres;


  // Tags
  {
    const row = tagTable.rows.get(anime.id.toString());
    const tr = tagTable.body.children[row.index];
    for (let tag of anime.tags) {
      if (tag.rank > tagThreshold) {
        const box = tr.children[tagTable.columns.get(tag.id.toString()).index];
        box.textContent = "X";
      }
    }
  }

  // Genres
  {
    const row = genreTable.rows.get(anime.id.toString());

    const tr = genreTable.body.children[row.index];
    for (let genre of anime.genres) {
      const box = tr.children[genreTable.columns.get(genre).index];
      box.textContent = "X";
    }
  }
}

function fillTables() {
  const tagTable = app.tags;
  const genreTable = app.genres;

  for (let row of tagTable.rows.values()) {
    let anime = animeDb.get(row.id);
    fillAnimeRows(anime);
  }

}

export function test() {

  for (let [id, anime] of Object.entries(testData) as any) {
    anime.id = parseInt(id);
    animeDb.set(id, anime);
  }

  for (let anime of animeDb.values()) {
    displayAnime(anime);
  }

}

export function test0() {

  for (let [id, anime] of Object.entries(testData) as any) {
    anime.id = parseInt(id);
  }

  const tagTable = app.tags;
  const genreTable = app.genres;

  const yearThing = app.years;

  for (let anime of Object.values(testData) as Anime[]) {
    for (let tag of anime.tags) {
      if (tag.rank > tagThreshold && !tagTable.columns.has(tag.id.toString())) {
        tagTable.addCol({ id: tag.id.toString(), name: tag.name });
      }
    }
    for (let genre of anime.genres) {
      genreTable.addCol({ id: genre, name: genre });
    }
    tagTable.addRow({ id: anime.id.toString(), name: someName(anime) });
    genreTable.addRow({ id: anime.id.toString(), name: someName(anime) });
  }

  for (let row of tagTable.rows.values()) {
    let anime = testData[row.id] as Anime;
    // for (let col of table.columns.values()){
    //   let tag 
    // }
    const tr = tagTable.body.children[row.index];
    for (let tag of anime.tags) {
      if (tag.rank > tagThreshold) {
        const box = tr.children[tagTable.columns.get(tag.id.toString()).index];
        box.textContent = "X";
      }
    }

  }
  //
  for (let row of genreTable.rows.values()) {
    let anime = testData[row.id] as Anime;
    const tr = genreTable.body.children[row.index];
    for (let genre of anime.genres) {
      const box = tr.children[genreTable.columns.get(genre).index];
      box.textContent = "X";
    }

  }

  for (let anime of Object.values(testData) as Anime[]) {
    yearThing.addAnime(anime);
  }

}