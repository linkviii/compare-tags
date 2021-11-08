/*  */
document.addEventListener("DOMContentLoaded", function (event) {
    //do work
    console.log("init page");
    const table = document.getElementById("tag-table");
    const tableBody = document.getElementById("table-body");
    const headerRow = document.getElementById("header-row");
    const button = document.getElementById("button");
    const buttonRow = document.getElementById("row-button");
    const buttonCol = document.getElementById("col-button");
    let numRow = 0;
    let numCol = 0;
    // map header to column number
    const colMap = new Map();
    button.addEventListener("click", function () {
        console.log("ay, got clicked");
        numRow++;
        numCol++;
        console.log(`row ${numRow}, col ${numCol}`);
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
    });
    // ------------------
    buttonCol.addEventListener("click", function () {
        console.log("ay, got clicked");
        numCol++;
        console.log(`row ${numRow}, col ${numCol}`);
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
    });
    // ------------------
    // ------------------
    buttonRow.addEventListener("click", function () {
        console.log("ay, got clicked");
        numRow++;
        console.log(`row ${numRow}, col ${numCol}`);
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
    });
});
//# sourceMappingURL=main.js.map