/**
 * MIT licensed
 */
import "./jquery.js";
// import "./lib/jquery-ui/jquery-ui.min.js";
// ----------------------------------------------------------------------------
const TAU = Math.PI * 2;
/**
 * "ToPoint" goes to an absolute canvas coordinate.
 * "Over" moves over relative to the current pen location.
 *
 * When using the lines, remember to call ctx.beginPath() and ctx.stroke()
 */
export class CanvasPen {
    constructor(ctx) {
        this.ctx = ctx;
        /** Do not mutate directly. */
        this.x = 0;
        /** Do not mutate directly. */
        this.y = 0;
        this.pointerStack = [];
        /** Reference point to return to */
        this.orig = [0, 0];
    }
    set(x, y) {
        this.x = x;
        this.y = y;
    }
    getFontHeight() {
        const tm = this.ctx.measureText("");
        const lineHeight = tm.fontBoundingBoxAscent + tm.fontBoundingBoxDescent;
        return lineHeight;
    }
    getTxtWidth(text) {
        const textMetrics = this.ctx.measureText(text);
        return textMetrics.actualBoundingBoxRight + textMetrics.actualBoundingBoxLeft;
    }
    pushStack() {
        this.pointerStack.push([this.x, this.y]);
    }
    popStack() {
        [this.x, this.y] = this.pointerStack.pop();
    }
    applyFont(params) {
        for (let key in params) {
            this.ctx[key] = params[key];
        }
    }
    /** Return to x origin, and move down height in the y direction. */
    carriageReturn(height) {
        this.moveToPoint(this.orig[0], this.y + height);
        // this.set(this.orig[0], this.y + height);
    }
    /**
     * Lift up pen and move it to the given point.
     *
     * Pass null to not move on an axis.
     */
    moveToPoint(x, y) {
        x !== null && x !== void 0 ? x : (x = this.x);
        y !== null && y !== void 0 ? y : (y = this.y);
        this.ctx.moveTo(x, y);
        this.set(x, y);
    }
    /** Lift up and */
    moveOver(x, y) {
        this.moveToPoint(this.x + x, this.y + y);
    }
    /** Draw */
    lineToPoint(x, y) {
        this.ctx.lineTo(x, y);
        this.set(x, y);
    }
    lineOver(x, y) {
        this.lineToPoint(this.x + x, this.y + y);
    }
    /* ----- */
    fillCircleAtPoint(x, y, radius, color) {
        this.ctx.beginPath();
        this.ctx.fillStyle = color;
        this.ctx.arc(x, y, radius, 0, TAU);
        this.ctx.fill();
        this.set(x, y);
    }
    fillCircleOver(x, y, radius, color) {
        this.fillCircleAtPoint(this.x + x, this.y + y, radius, color);
    }
    /* ----- */
    // x: number, y: number
    fillText(text, color, maxWidth) {
        this.ctx.fillStyle = color;
        this.ctx.fillText(text, this.x, this.y + 0.5, maxWidth);
        this.moveOver(this.ctx.measureText(text).width, 0);
    }
    fillTextBG(text, color, bgColor) {
        const ctx = this.ctx;
        const tm = ctx.measureText(text);
        ctx.fillStyle = bgColor;
        const x = this.x - tm.actualBoundingBoxLeft;
        const y = this.y - tm.fontBoundingBoxAscent;
        const h = tm.fontBoundingBoxAscent + tm.fontBoundingBoxDescent;
        ctx.fillRect(x, y, tm.width, h);
        ctx.fillStyle = color;
        ctx.fillText(text, this.x, this.y + 0.5);
        this.moveOver(tm.width, 0);
    }
    /* ----- */
    loc() {
        return [this.x, this.y];
    }
}
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
export const loremIpsumTxt = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. But I must explain to you how all this mistaken idea of denouncing pleasure and praising pain was born and I will give you a complete account of the system, and expound the actual teachings of the great explorer of the truth, the master-builder of human happiness. No one rejects, dislikes, or avoids pleasure itself, because it is pleasure, but because those who do not know how to pursue pleasure rationally encounter consequences that are extremely painful. Nor again is there anyone who loves or pursues or desires to obtain pain of itself, because it is pain, but because occasionally circumstances occur in which toil and pain can procure him some great pleasure. To take a trivial example, which of us ever undertakes laborious physical exercise, except to obtain some advantage from it? But who has any right to find fault with a man who chooses to enjoy a pleasure that has no annoying consequences, or one who avoids a pain that produces no resultant pleasure?";
export const loremIpsumWords = loremIpsumTxt.split(" ");
// ----------------------------------------------------------------------------
const testUrl = "res/20-songs.json";
// const testUrl = "res/85-songs.json";
export const testData = await fetch(testUrl).then(response => response.json());
console.log(testData.songs[8]);
// ----------------------------------------------------------------------------
class PngPage {
    constructor() {
        this.inputForm = $("#form");
        /* Right clicking a <canvas> does not have a copy option.
         * Instead we draw to an offscreen canvas and draw it to the <img>.
         */
        this.canvasImg = $("#canvasImg");
        // ------------------------------------------------------------------------
        this.offscreenCanvas = new OffscreenCanvas(100, 100);
        this.pen = new CanvasPen(this.offscreenCanvas.getContext("2d"));
    }
    // ------------------------------------------------------------------------
    clearCanvas(color) {
        this.pen.ctx.fillStyle = color;
        this.pen.ctx.fillRect(0, 0, this.offscreenCanvas.width, this.offscreenCanvas.height);
    }
    /** Must be called to display anything to the screen. */
    async render() {
        let blob = await this.offscreenCanvas.convertToBlob();
        this.canvasImg[0].src = URL.createObjectURL(blob);
    }
    drawLoremIspum() {
        const pen = this.pen;
        const ctx = this.pen.ctx;
        const font = {
            font: "20px serif",
            textAlign: "left",
            textBaseline: "top"
        };
        pen.applyFont(font);
        const tm = ctx.measureText("");
        const lineHeight = tm.fontBoundingBoxAscent + tm.fontBoundingBoxDescent;
        /* !!! Changing height resets ctx state !!! */
        this.offscreenCanvas.height = lineHeight * 85.5;
        pen.applyFont(font);
        // ---------------
        this.clearCanvas("black");
        pen.moveToPoint(0, 0);
        pen.orig = pen.loc();
        let i = 0;
        while (pen.y < this.offscreenCanvas.height) {
            const word = loremIpsumWords[i];
            const txt = `${i}: ${word} ${word} ${word}`;
            const bgcolor = i % 2 ? "green" : "blue";
            {
                pen.pushStack();
                pen.moveToPoint(200, i * lineHeight);
                ctx.fillStyle = bgcolor;
                ctx.fillRect(...pen.loc(), 100, lineHeight);
                pen.fillText(`${i}`, "pink");
                console.log([i, bgcolor]);
                pen.popStack();
            }
            pen.fillTextBG(txt, "white", bgcolor);
            pen.carriageReturn(lineHeight);
            ++i;
        }
        this.render();
    }
    firstDraw() {
        const pen = this.pen;
        const ctx = this.pen.ctx;
        ctx.font = "15px serif";
        const measure = ctx.measureText("H");
        window["m"] = measure;
        console.log(measure);
        const lineHeight = measure.fontBoundingBoxAscent + measure.fontBoundingBoxDescent;
        ctx.textBaseline = "top";
        ctx.fillStyle = "black";
        page.clearCanvas("black");
        pen.moveToPoint(10, 10);
        pen.orig = pen.loc();
        pen.fillTextBG("hello", "white", "green");
        pen.carriageReturn(lineHeight);
        pen.fillTextBG("world", "white", "blue");
        // --
        this.render();
    }
    init() {
        // this.firstDraw();
        // this.drawLoremIspum();
        drawRound(testData);
        console.log(testData);
    }
}
export const page = new PngPage();
function init() {
    page.init();
    if (location.hostname === "127.0.0.1") {
        const favicon = document.getElementById("favicon");
        favicon.href = "../favicon_localhost.png";
    }
    // XXX
    // $("#listName").val("ONLOAD");
    // onSubmit();
}
$(document).ready(init);
// ----------------------------------------------------------------------------
function htmlDecode(input) {
    // https://stackoverflow.com/a/34064434/1993919
    var doc = new DOMParser().parseFromString(input, "text/html");
    return doc.documentElement.textContent;
}
export function mmss(seconds) {
    const m = Math.floor(seconds / 60);
    const fs = Math.floor(seconds - 60 * m);
    return `${m.toString().padStart(2, "0")}:${fs.toString().padStart(2, "0")}`;
}
function nanColumn() { return { X: NaN, Width: NaN }; }
const layout = {
    font: { textAlign: "left", textBaseline: "top", font: "20px serif" },
    fontHeight: NaN,
    /** Horizontal Line thickness */
    hRuleThickness: 3,
    /** Vertical Space to reserve for a horizontal line */
    hRuleVSpace: 2,
    unitSpace: NaN,
    index: nanColumn(),
    result: nanColumn(),
    guess: nanColumn(),
    artist: nanColumn(),
    type: nanColumn(),
    song: nanColumn(),
    difficulty: nanColumn(),
    roomScore: nanColumn(),
    sample: nanColumn(),
    headerHeight: NaN,
    margin: 1,
    textColor: "white",
    lineColor: "gray",
    correctColor: "green",
    wrongColor: "red",
    divisionColor: "white",
    divisionThick: 1,
};
function drawRound(amqRound) {
    /* TODO
     * Guess fraction
     * Sample
     */
    const stacked = true;
    // const stacked = false;
    const SONG_TYPES = ["OP", "ED", "INS"];
    const COLUMNS = ["Song #", "Result", "Guess",
        "Type", "Song", "Artist",
        "Difficulty", "Room Score",
        "Sample"
    ];
    const columns 
    // Partial<Record<Column, true>>
    = {
        "Song #": true,
        "Artist": true,
        Difficulty: true,
        Guess: true,
        Result: true,
        Song: true,
        Type: true,
        "Room Score": true,
        "Sample": true,
    };
    if (stacked) {
        /* Bot = Top */
        columns["Guess"] = columns["Result"];
        columns["Artist"] = columns["Song"];
    }
    const pen = page.pen;
    const ctx = pen.ctx;
    const nSongs = amqRound.songs.length;
    pen.applyFont(layout.font);
    layout.unitSpace = pen.getTxtWidth("M");
    {
        const animeWidth = pen.getTxtWidth("Ms. Vampire Who Lives in My Neighbor.");
        layout.guess.Width = animeWidth;
        layout.result.Width = animeWidth;
    }
    layout.fontHeight = pen.getFontHeight();
    layout.index.Width = pen.getTxtWidth("0000");
    layout.type.Width = pen.getTxtWidth("Op 10");
    layout.song.Width = pen.getTxtWidth("Aoarashi no Ato de");
    layout.artist.Width = pen.getTxtWidth("Asuka Nishi to Yukai na");
    layout.difficulty.Width = pen.getTxtWidth("00.0");
    layout.roomScore.Width = pen.getTxtWidth("000 /000");
    layout.sample.Width = pen.getTxtWidth("00:00|00:00");
    if (stacked) {
        layout.type.Width = pen.getTxtWidth("000");
        layout.artist.Width = Math.max(layout.artist.Width, layout.song.Width);
        layout.song.Width = layout.artist.Width;
        layout.roomScore.Width = pen.getTxtWidth("000");
        layout.sample.Width = pen.getTxtWidth("00:00");
    }
    layout.headerHeight = 2 * layout.fontHeight + layout.hRuleThickness * 2;
    let imageHeight = (nSongs) * (stacked ? 2 : 1) * layout.fontHeight;
    imageHeight += (nSongs - 1) * layout.hRuleVSpace;
    imageHeight += layout.margin * 2;
    imageHeight += layout.headerHeight;
    // ---
    /* Stacked pairs:
     * ---
     * Result / Guess
     * Song / Artist
     * Composer / Arranger
     *
     */
    let x = 0;
    x += layout.margin;
    /* Index */
    if (columns["Song #"]) {
        const cl = layout.index;
        console.assert(!isNaN(cl.Width));
        cl.X = x;
        x += cl.Width;
        x += layout.unitSpace;
    }
    /* Result */
    if (columns["Result"]) {
        const cl = layout.result;
        console.assert(!isNaN(cl.Width));
        cl.X = x;
        x += cl.Width;
        x += layout.unitSpace;
    }
    /* Guess */
    if (columns["Guess"]) {
        if (stacked) {
            layout.guess.X = layout.result.X;
        }
        else {
            layout.guess.X = x;
            x += layout.result.Width;
            x += layout.unitSpace;
        }
    }
    /* Type */
    if (columns["Type"]) {
        const cl = layout.type;
        console.assert(!isNaN(cl.Width));
        cl.X = x;
        x += cl.Width;
        x += layout.unitSpace;
    }
    /* Song */
    if (columns["Song"]) {
        const cl = layout.song;
        console.assert(!isNaN(cl.Width));
        cl.X = x;
        x += cl.Width;
        x += layout.unitSpace;
    }
    /* Artist */
    if (columns["Artist"]) {
        if (stacked) {
            layout.artist.X = layout.song.X;
        }
        else {
            layout.artist.X = x;
            x += layout.artist.Width;
            x += layout.unitSpace;
        }
    }
    /* Difficulty */
    if (columns["Difficulty"]) {
        const cl = layout.difficulty;
        console.assert(!isNaN(cl.Width));
        cl.X = x;
        x += cl.Width;
        x += layout.unitSpace;
    }
    /* Room Score */
    if (columns["Room Score"]) {
        const cl = layout.roomScore;
        console.assert(!isNaN(cl.Width));
        cl.X = x;
        x += cl.Width;
        x += layout.unitSpace;
    }
    /* Sample */
    if (columns["Sample"]) {
        const cl = layout.sample;
        console.assert(!isNaN(cl.Width));
        cl.X = x;
        x += cl.Width;
        x += layout.unitSpace;
    }
    /* END */
    x += layout.margin;
    const imageWidth = x;
    // ---
    page.offscreenCanvas.height = imageHeight;
    page.offscreenCanvas.width = imageWidth;
    pen.applyFont(layout.font);
    // ------------------------------------------------------------------------
    page.clearCanvas("black");
    // ------------------------------------------------------------------------
    {
        /* Header */
        ctx.fillStyle = "#d4c2c2ff";
        ctx.fillRect(0, 0, imageWidth, layout.headerHeight);
        let baseline1 = layout.margin;
        let baseline2 = baseline1 + layout.fontHeight;
        let baselineMaybeStacked = stacked ? baseline2 : baseline1;
        let headerTextColor = "black";
        if (columns["Song #"]) {
            const cl = layout.index;
            pen.moveToPoint(cl.X, baseline1);
            if (stacked) {
                pen.fillText("Song", headerTextColor, cl.Width);
                pen.moveToPoint(cl.X, baseline2);
                pen.fillText("   #", headerTextColor, cl.Width);
            }
            else {
                pen.fillText("#", headerTextColor, cl.Width);
            }
        }
        if (columns["Result"]) {
            const cl = layout.result;
            pen.moveToPoint(cl.X, baseline1);
            pen.fillText("Anime Result", headerTextColor, cl.Width);
        }
        if (columns["Guess"]) {
            const cl = layout.guess;
            pen.moveToPoint(cl.X, baselineMaybeStacked);
            pen.fillText("Anime Guess", headerTextColor, cl.Width);
        }
        if (columns["Type"]) {
            const cl = layout.type;
            pen.moveToPoint(cl.X, baseline1);
            if (stacked) {
                pen.fillText("Song", headerTextColor, cl.Width);
                pen.moveToPoint(cl.X, baseline2);
                pen.fillText("Type", headerTextColor, cl.Width);
            }
            else {
                pen.fillText("Type", headerTextColor, cl.Width);
            }
        }
        if (columns["Song"]) {
            const cl = layout.song;
            pen.moveToPoint(cl.X, baseline1);
            pen.fillText("Song", headerTextColor, cl.Width);
        }
        if (columns["Artist"]) {
            const cl = layout.artist;
            pen.moveToPoint(cl.X, baselineMaybeStacked);
            pen.fillText("Artist", headerTextColor, cl.Width);
        }
        if (columns["Difficulty"]) {
            const cl = layout.difficulty;
            pen.moveToPoint(cl.X, baseline1);
            if (stacked) {
                pen.fillText("%", headerTextColor, cl.Width);
                pen.moveToPoint(cl.X, baseline2);
                pen.fillText("Easy", headerTextColor, cl.Width);
            }
            else {
                pen.fillText("%Easy", headerTextColor, cl.Width);
            }
        }
        if (columns["Room Score"]) {
            const cl = layout.roomScore;
            pen.moveToPoint(cl.X, baseline1);
            if (stacked) {
                pen.fillText("Room", headerTextColor, cl.Width);
                pen.moveToPoint(cl.X, baseline2);
                pen.fillText("Score", headerTextColor, cl.Width);
            }
            else {
                pen.fillText("Room Score", headerTextColor, cl.Width);
            }
        }
        if (columns["Sample"]) {
            const cl = layout.sample;
            pen.moveToPoint(cl.X, baseline1);
            if (stacked) {
                pen.fillText("Song", headerTextColor, cl.Width);
                pen.moveToPoint(cl.X, baseline2);
                pen.fillText("Sample", headerTextColor, cl.Width);
            }
            else {
                pen.fillText("Song Sample", headerTextColor, cl.Width);
            }
        }
        /* --- */
        let half_header_line = layout.hRuleThickness;
        ctx.lineWidth = layout.hRuleThickness * 2;
        ctx.strokeStyle = "white";
        ctx.beginPath();
        pen.moveToPoint(0, layout.margin + layout.headerHeight - half_header_line);
        pen.lineOver(imageWidth, 0);
        ctx.stroke();
    }
    // ------------------------------------------------------------------------
    pen.moveToPoint(layout.margin, layout.margin + layout.headerHeight);
    for (let result of amqRound.songs) {
        const baseline = pen.y;
        const baselineMaybeStacked = stacked ? baseline + layout.fontHeight : baseline;
        let txt = "";
        /* Index */
        if (columns["Song #"]) {
            const cl = layout.index;
            ctx.fillStyle = result.correctGuess ? layout.correctColor : layout.wrongColor;
            ctx.fillRect(cl.X, baseline, cl.Width, layout.fontHeight * (Number(stacked) + 1));
            ctx.textAlign = "right";
            pen.moveToPoint(cl.X + cl.Width, baseline);
            pen.fillText(`${result.songNumber}`, layout.textColor);
        }
        /* Expected Answer */
        if (columns["Result"]) {
            const cl = layout.result;
            ctx.textAlign = "left";
            pen.moveToPoint(cl.X, baseline);
            txt = `🔍${htmlDecode(result.songInfo.animeNames.english)}`;
            pen.fillText(txt, layout.textColor, cl.Width);
        }
        /* Given Answer */
        if (columns["Guess"]) {
            const cl = layout.guess;
            ctx.textAlign = "left";
            pen.moveToPoint(cl.X, baselineMaybeStacked);
            txt = `${result.correctGuess ? "✅" : "❌"}${htmlDecode(result.answer)}`;
            pen.fillText(txt, layout.textColor, cl.Width);
        }
        /* Artist */
        if (columns["Artist"]) {
            const cl = layout.artist;
            ctx.textAlign = "left";
            pen.moveToPoint(cl.X, baselineMaybeStacked);
            pen.fillText(htmlDecode(result.songInfo.artist), layout.textColor, cl.Width);
        }
        /* Type */
        if (columns["Type"]) {
            const cl = layout.type;
            ctx.textAlign = "left";
            pen.moveToPoint(cl.X, baseline);
            let songKind = SONG_TYPES[result.songInfo.type - 1];
            let songOrdinal = `${result.songInfo.typeNumber || ""}`;
            if (stacked) {
                pen.fillText(songKind, layout.textColor, cl.Width);
                ctx.textAlign = "right";
                pen.moveToPoint(cl.X + cl.Width, baselineMaybeStacked);
                pen.fillText(songOrdinal, layout.textColor, cl.Width);
            }
            else {
                txt = `${songKind} ${songOrdinal}`;
                pen.fillText(txt, layout.textColor, cl.Width);
            }
        }
        /* Song */
        if (columns["Song"]) {
            const cl = layout.song;
            ctx.textAlign = "left";
            pen.moveToPoint(cl.X, baseline);
            pen.fillText(result.songInfo.songName, layout.textColor, cl.Width);
        }
        /* Difficulty */
        if (columns["Difficulty"]) {
            const cl = layout.difficulty;
            ctx.textAlign = "right";
            pen.moveToPoint(cl.X + cl.Width, baseline);
            txt = `${result.songInfo.animeDifficulty.toFixed(1)}`;
            pen.fillText(txt, layout.textColor, cl.Width);
        }
        /* Room Score */
        if (columns["Room Score"]) {
            const cl = layout.roomScore;
            let count = result.correctCount + result.wrongCount;
            let countStr = count.toString().padStart(3, " ");
            let yesStr = result.correctCount.toString().padStart(3, " ");
            if (stacked) {
                ctx.lineWidth = layout.divisionThick;
                ctx.strokeStyle = layout.divisionColor;
                ctx.beginPath();
                pen.moveToPoint(cl.X, baseline + layout.fontHeight - 0.5);
                pen.lineOver(cl.Width, 0);
                ctx.stroke();
                ctx.textAlign = "left";
                pen.moveToPoint(cl.X, baseline);
                pen.fillText(countStr, layout.textColor, cl.Width);
                pen.moveToPoint(cl.X, baselineMaybeStacked);
                pen.fillText(countStr, layout.textColor, cl.Width);
            }
            else {
                ctx.textAlign = "left";
                pen.moveToPoint(cl.X, baseline);
                txt = `${yesStr} /${countStr}`;
                pen.fillText(txt, layout.textColor, cl.Width);
            }
        }
        /* Sample */
        if (columns["Sample"]) {
            const cl = layout.sample;
            const s = mmss(result.startPoint);
            const f = mmss(result.videoLength);
            if (stacked) {
                ctx.lineWidth = layout.divisionThick;
                ctx.strokeStyle = layout.divisionColor;
                ctx.beginPath();
                pen.moveToPoint(cl.X, baseline + layout.fontHeight - 0.5);
                pen.lineOver(cl.Width, 0);
                ctx.stroke();
                ctx.textAlign = "left";
                pen.moveToPoint(cl.X, baseline);
                pen.fillText(s, layout.textColor, cl.Width);
                pen.moveToPoint(cl.X, baselineMaybeStacked);
                pen.fillText(f, layout.textColor, cl.Width);
            }
            else {
                ctx.textAlign = "left";
                pen.moveToPoint(cl.X, baseline);
                txt = `${s}|${f}`;
                pen.fillText(txt, layout.textColor, cl.Width);
            }
        }
        /*
         *
         * END LINE
         *
         */
        pen.moveToPoint(0, baseline);
        pen.carriageReturn(layout.fontHeight);
        if (stacked) {
            pen.carriageReturn(layout.fontHeight);
        }
        ctx.beginPath();
        pen.moveToPoint(0, null);
        const half = layout.hRuleVSpace / 2;
        pen.moveOver(null, half);
        ctx.lineWidth = layout.hRuleThickness;
        ctx.strokeStyle = layout.lineColor;
        pen.lineOver(imageWidth, 0);
        // ctx.closePath();
        ctx.stroke();
        pen.moveOver(null, half);
    }
    page.render();
}
//# sourceMappingURL=amq-png.js.map