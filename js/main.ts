/*  */

//import jquery
import "./jquery.js";

/* GLOBAL */

export const usingTestData = false;
// export const usingTestData = true;

const testUrl = "res/testData.json"
export const testData = await fetch(testUrl).then(response => response.json());


/* INIT */

document.addEventListener("DOMContentLoaded", function (event) {
  //do work
  console.log("init page");
  giveFeedback("Page loaded");


  const table = document.getElementById("tag-table");
  const tableBody = document.getElementById("table-body");
  const headerRow = document.getElementById("header-row");

  const button = document.getElementById("button");
  const buttonRow = document.getElementById("row-button");
  const buttonCol = document.getElementById("col-button");

  let numRow = 0;
  let numCol = 0;

  // map header to column number
  const colMap = new Map<string, number>();

  function newCol(numCol: number) {

    /* Make header */
    {
      const head = document.createElement("th");
      head.textContent = `${numCol}`;
      headerRow.append(head);
    }

    /* Fix old rows */
    for (let rowVal = 1; rowVal <= tableBody.children.length; rowVal++) {
      // for (let row of tableBody.children){
      const row = tableBody.children[rowVal - 1];
      let rowColCount = row.children.length;
      for (; rowColCount <= numCol; rowColCount++) {
        const data = document.createElement("td");
        // data.textContent = `${rowVal}, ${rowColCount}`;
        data.textContent = `${rowVal * rowColCount}`;
        row.append(data);
      }

    }

  };

  function newRow(numRow: number) {
    /* new row */
    const row = document.createElement("tr");
    {
      // const data = document.createElement("td");
      const data = document.createElement("th");
      data.textContent = `${numRow}`;
      row.append(data);
    }
    for (let i = 1; i <= numCol; i++) {
      const data = document.createElement("td");
      data.textContent = `${i * numRow}`;
      row.append(data);

    }
    tableBody.append(row);
  };

  button.addEventListener("click", function () {
    console.log("ay, got clicked");
    numRow++;
    numCol++;
    console.log(`row ${numRow}, col ${numCol}`);


    newCol(numCol);


    newRow(numRow);


  });


  // ------------------
  buttonCol.addEventListener("click", function () {
    console.log("ay, got clicked");

    numCol++;
    console.log(`row ${numRow}, col ${numCol}`);

    newCol(numCol);

  });

  // ------------------
  // ------------------

  buttonRow.addEventListener("click", function () {
    console.log("ay, got clicked");
    numRow++;
    console.log(`row ${numRow}, col ${numCol}`);

    newRow(numRow);


  });


});
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

export async function getAniAnime(input: string): Promise<any | Error> {

  if (usingTestData) {
    console.warn("Using test data.");
    giveFeedback("Using test data");

    const url = "res/anilist_example.json";

    let job = await fetch(url).then(response => response.json());
    return job;

  }

  const query = `
    query ($id: Int){
      Media(id: $id) {
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
      }
    }
  `; // Could probably munch the whitespace with a regex but no real need to

  const id = parseInputForId(input);
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


  return data.Media;

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
        data.textContent = "x";
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
      box.textContent = 'x';
      row.append(box);
    }


    this.body.append(row);

    this.rows.set(data.id, data);


  }

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
}

export function test() {

  for (let [id, anime] of Object.entries(testData) as any) {
    anime.id = parseInt(id);
  }

  const table = new HTable("test");
  for (let anime of Object.values(testData) as Anime[]) {
    for (let tag of anime.tags) {
      if (tag.rank > 50 && !table.columns.has(tag.id.toString())) {
        table.addCol({ id: tag.id.toString(), name: tag.name });
      }
    }
    table.addRow({ id: anime.id.toString(), name: anime.title.english });
  }

}