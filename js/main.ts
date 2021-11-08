/*  */

//import jquery
import "./jquery.js";

/* GLOBAL */

export const usingTestData = false;
// export const usingTestData = true;

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
