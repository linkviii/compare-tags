/**
 * MIT licensed
 */


import "./jquery.js";
import "./lib/jquery-ui/jquery-ui.min.js";


console.log("did it??");

// ----------------------------------------------------------------------------
// export const usingTestData = false;
export const usingTestData = true;

const testUrl = "res/20-songs.json";
// const testUrl = "res/jam.json";
// const testUrl = "res/85-songs.json";
// ----------------------------------------------------------------------------


$(function () {
    ($("#enabledCol, #disabledCol") as any).sortable({
        connectWith: ".connectedSortable"
    }).disableSelection();

    $("#enabledCol");
});
// ----------------------------------------------------------------------------
const DITTO = "〃";

const TAU = Math.PI * 2;
export type Point = [number, number];

interface FontParams {
    textBaseline: CanvasTextBaseline;
    font: string;
    textAlign: CanvasTextAlign;
}

/**
 * "ToPoint" goes to an absolute canvas coordinate.
 * "Over" moves over relative to the current pen location.
 *
 * When using the lines, remember to call ctx.beginPath() and ctx.stroke()
 */
export class CanvasPen {
    constructor(
        public ctx:
            | CanvasRenderingContext2D
            | OffscreenCanvasRenderingContext2D,
    ) { }
    /** Do not mutate directly. */
    x = 0;
    /** Do not mutate directly. */
    y = 0;
    private set(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    pointerStack: Point[] = [];

    getFontHeight() {
        const tm = this.ctx.measureText("");
        const lineHeight = tm.fontBoundingBoxAscent + tm.fontBoundingBoxDescent;
        return lineHeight;
    }
    getTxtWidth(text: string) {
        const textMetrics = this.ctx.measureText(text);
        return textMetrics.actualBoundingBoxRight + textMetrics.actualBoundingBoxLeft;
    }

    pushStack() {
        this.pointerStack.push([this.x, this.y]);
    }
    popStack() {
        if (this.pointerStack.length !== 0)
            [this.x, this.y] = this.pointerStack.pop() || [0, 0];
    }

    applyFont(params: FontParams) {
        // FontParams is a subset of ctx. 
        // idk how to make strict mode happy about this.
        for (let key in params) {
            (this.ctx as any)[key] = (params as any)[key] as any;
        }
    }

    /** Reference point to return to */
    orig: Point = [0, 0];

    /** Return to x origin, and move down height in the y direction. */
    carriageReturn(height: number) {
        this.moveToPoint(this.orig[0], this.y + height);
        // this.set(this.orig[0], this.y + height);
    }

    /**
     * Lift up pen and move it to the given point.
     *
     * Pass null to not move on an axis.
     */
    moveToPoint(x: number | null, y: number | null) {
        x ??= this.x;
        y ??= this.y;
        this.ctx.moveTo(x, y);
        this.set(x, y);
    }

    /** Lift up and */
    moveOver(x: number, y: number) {
        this.moveToPoint(this.x + x, this.y + y);
    }
    /** Draw */
    lineToPoint(x: number, y: number) {
        this.ctx.lineTo(x, y);
        this.set(x, y);
    }
    lineOver(x: number, y: number) {
        this.lineToPoint(this.x + x, this.y + y);
    }




    /* ----- */
    fillCircleAtPoint(x: number, y: number, radius: number, color: string) {
        this.ctx.beginPath();
        this.ctx.fillStyle = color;
        this.ctx.arc(x, y, radius, 0, TAU);
        this.ctx.fill();
        this.set(x, y);
    }
    fillCircleOver(x: number, y: number, radius: number, color: string) {
        this.fillCircleAtPoint(this.x + x, this.y + y, radius, color);
    }
    /* ----- */
    // x: number, y: number
    fillText(text: string, color: string, maxWidth?: number) {
        this.ctx.fillStyle = color;

        this.ctx.fillText(text, this.x, this.y + 0.5, maxWidth);
        this.moveOver(this.ctx.measureText(text).width, 0);
    }
    fillTextBG(text: string, color: string, bgColor: string) {
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
    loc(): Point {
        return [this.x, this.y];
    }
}
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------

export interface AMQRound {
    roomName: string;
    startTime: string;
    songs: Song[];
}

export interface Song {
    songNumber: number;
    songInfo: SongInfo;
    correctGuess: boolean;
    wrongGuess: boolean;
    /** The text the user put as their guess. `undefined` while spectating. */
    answer?: string;
    correctCount: number;
    wrongCount: number;
    startPoint: number;
    videoLength: number;
    videoUrl: string;
    correctGuessPlayers: string[];
    listStates: ListState[];
}

export interface SongInfo {
    animeNames: AnimeNames;
    artist: string;
    composerInfo: ComposerInfo;
    arrangerInfo: ArrangerInfo;
    songName: string;
    type: number;
    typeNumber: number;
    annId: number;
    highRisk: number;
    animeScore: number;
    animeType: string;
    vintage: string;
    animeDifficulty: number;
    animeTags: string[];
    animeGenre: string[];
    altAnimeNames: string[];
    altAnimeNamesAnswers: string[];
    siteIds: SiteIds;
    rebroadcast: number;
    dub: number;
    seasonInfo?: string;
}

export interface AnimeNames {
    english: string;
    romaji: string;
}

export interface ComposerInfo {
    artistId?: number;
    name: string;
    groupId?: number;
}

export interface ArrangerInfo {
    artistId?: number;
    name: string;
    groupId?: number;
}

export interface SiteIds {
    annId: number;
    malId: number;
    kitsuId: number;
    aniListId: number;
}

export interface ListState {
    name: string;
    status: number;
    score: number;
}

// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------

export const loremIpsumTxt = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. But I must explain to you how all this mistaken idea of denouncing pleasure and praising pain was born and I will give you a complete account of the system, and expound the actual teachings of the great explorer of the truth, the master-builder of human happiness. No one rejects, dislikes, or avoids pleasure itself, because it is pleasure, but because those who do not know how to pursue pleasure rationally encounter consequences that are extremely painful. Nor again is there anyone who loves or pursues or desires to obtain pain of itself, because it is pain, but because occasionally circumstances occur in which toil and pain can procure him some great pleasure. To take a trivial example, which of us ever undertakes laborious physical exercise, except to obtain some advantage from it? But who has any right to find fault with a man who chooses to enjoy a pleasure that has no annoying consequences, or one who avoids a pain that produces no resultant pleasure?";
export const loremIpsumWords = loremIpsumTxt.split(" ");
// ----------------------------------------------------------------------------


export const testData: AMQRound = await fetch(testUrl).then(response => response.json());
export let activeData: AMQRound | null = null;
// ----------------------------------------------------------------------------
type AmqSongSort = (a: Song, b: Song) => number;
const COL_GET_TXT = {
    "Arranger": (s: Song) => s.songInfo.arrangerInfo.name,
    "Artist": (s: Song) => s.songInfo.artist,
    "Composer": (s: Song) => s.songInfo.composerInfo.name,
    // "Difficulty": (s: Song) => s.songInfo.animeDifficulty.toFixed(1),
    "Guess": (s: Song) => s.answer ?? "",
    "Result": (s: Song) => getSongAnimeName(s),
    // "Room Score": (s: Song) => s.correctCount.toString(),
    // "Sample": (s: Song) => s.startPoint.toString(),
    "Season Info": (s: Song) => s.songInfo.seasonInfo || s.songInfo.animeType,
    "Song": (s: Song) => s.songInfo.songName,
    // "Song #": (s: Song) => s.songNumber.toString(),
    "Type": (s: Song) => s.songInfo.type.toString(),
    "Vintage": (s: Song) => s.songInfo.vintage,
    // "": (s:Song) => s.  ,
    // "": (s:Song) => s.  ,

} satisfies Record<string, (s: Song) => string>;

function makeSorter_str(key: keyof typeof COL_GET_TXT) {
    return (a: Song, b: Song) => COL_GET_TXT[key](a).localeCompare(COL_GET_TXT[key](b));
}

const COL_GET_NUM = {
    "Difficulty": (s: Song) => s.songInfo.animeDifficulty,
    "Room Score": (s: Song) => s.correctCount,
    "Sample": (s: Song) => s.startPoint,
    "Song #": (s: Song) => s.songNumber,
    // "Type": (s: Song) => s.songInfo.type,
    "Correct Guess": (s: Song) => {
        if (s.answer === undefined) return -1;
        return s.correctGuess ? 1 : 2;
    }

} satisfies Record<string, (s: Song) => number>;
function makeSorter_num(key: keyof typeof COL_GET_NUM) {
    return (a: Song, b: Song) => COL_GET_NUM[key](a) - (COL_GET_NUM[key](b));
}

/** 
 * Same as `obj[key]`.
 * Widens both `key` and `keyof obj` to `string` to make typescript happy when we know better.
 * Maybe should have a version with a default val...
 */
function getUnchecked<T>(obj: Record<string, T>, key: string) {
    return obj[key];
}

const QUARTERS = {
    "Winter": 1,
    "Spring": 2,
    "Summer": 3,
    "Fall": 4
};

const SORTS: Record<string, AmqSongSort> = {
    "Song #": makeSorter_num("Song #"),
    "Was Correct": makeSorter_num("Correct Guess"),

    "Result": makeSorter_str("Result"),
    "Guess": makeSorter_str("Guess"),

    "Difficulty": makeSorter_num("Difficulty"),
    "Room Score": makeSorter_num("Room Score"),

    "Type": makeSorter_str("Type"),

    "Song": makeSorter_str("Song"),
    "Artist": makeSorter_str("Artist"),
    "Composer": makeSorter_str("Composer"),
    "Arranger": makeSorter_str("Arranger"),

    "Sample": makeSorter_num("Sample"),

    "Season Info": makeSorter_str("Season Info"),

    "Vintage": (a: Song, b: Song) => {
        // "vintage": "Summer 2014",
        const [q_a, y_a] = COL_GET_TXT["Vintage"](a).split(" ");
        const [q_b, y_b] = COL_GET_TXT["Vintage"](b).split(" ");
        return (Number(y_a) - Number(y_b)) || getUnchecked(QUARTERS, q_a) - getUnchecked(QUARTERS, q_b);

    },
};

/**
 * 
 * @param a Primary sorter for type T
 * @param b Secondary sorter for type T
 * @returns New sorter that prioritizes sorter `a` but then sorts by be if `a` 
 *          claims that its inputs are equal.
 */
function mergeSorter<T>(
    a: (_1: T, _2: T) => number,
    b: (_1: T, _2: T) => number,
) {
    return (x: T, y: T) => a(x, y) || b(x, y);
}
// ----------------------------------------------------------------------------

class PngPage {
    readonly inputForm = $("#form") as JQuery<HTMLFormElement>;
    readonly enabledColUI = $("#enabledCol") as JQuery<HTMLUListElement>;
    readonly disabledColUI = $("#disabledCol") as JQuery<HTMLUListElement>;
    readonly stackedUI = $("#stackedCheck") as JQuery<HTMLInputElement>;
    readonly footerUI = $("#footerCheck") as JQuery<HTMLInputElement>;
    readonly sortUI = $("#sorting") as JQuery<HTMLSelectElement>;
    readonly sortUI2 = $("#sorting-2") as JQuery<HTMLSelectElement>;
    readonly languageUI = $("#language") as JQuery<HTMLSelectElement>;

    readonly uploadButton = document.getElementById("json-upload") as HTMLInputElement;



    /* Right clicking a <canvas> does not have a copy option. 
     * Instead we draw to an offscreen canvas and draw it to the <img>.
     */
    readonly outputDiv = $("#outdiv") as JQuery<HTMLDivElement>;
    readonly placeholderDiv = $("#placeholder") as JQuery<HTMLDivElement>;

    // ------------------------------------------------------------------------
    readonly offscreenCanvas = new OffscreenCanvas(100, 100);
    pen = new CanvasPen(this.offscreenCanvas.getContext("2d")!);
    // ------------------------------------------------------------------------


    clearCanvas(color: string) {
        this.pen.ctx.fillStyle = color;
        this.pen.ctx.fillRect(0, 0, this.offscreenCanvas.width, this.offscreenCanvas.height);
    }


    /** Must be called to display anything to the screen. */
    async render() {


        let blob = await this.offscreenCanvas.convertToBlob();
        const img = $("img", this.outputDiv)[0] as HTMLImageElement;
        img.src = URL.createObjectURL(blob);


    }

    drawLoremIspum() {
        const pen = this.pen;
        const ctx = this.pen.ctx;

        const font: FontParams = {
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
        (window as any)["m"] = measure;
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
        const page = this;
        this.outputDiv.hide();
        if (usingTestData) {
            activeData = testData;
            this.placeholderDiv.hide();
            this.outputDiv.show();
        }


        const columns: Record<Column,
            { startEnabled: boolean, isBot?: boolean; myBot?: Column; }
        > = {
            "Song #": { startEnabled: true, },
            Result: { startEnabled: true, myBot: "Guess" },
            Guess: { startEnabled: true, isBot: true },
            Type: { startEnabled: true, },
            Song: { startEnabled: true, myBot: "Artist" },
            "Artist": { startEnabled: true, isBot: true },
            Difficulty: { startEnabled: true, },
            "Room Score": { startEnabled: true, },
            "Sample": { startEnabled: true, },
            Composer: { startEnabled: false, myBot: "Arranger" },
            Arranger: { startEnabled: false, isBot: true },
            Vintage: { startEnabled: false, myBot: "Season Info" },
            "Season Info": { startEnabled: false, isBot: true },
        };

        for (const str in columns) {
            const params = columns[str as Column];
            const li = document.createElement("li");
            li.className = "ui-state-default";
            li.textContent = str;
            li.setAttribute("data-val", str);

            if (params.myBot) { li.setAttribute("data-my-bot", params.myBot); }
            if (params.isBot) { li.setAttribute("data-bot", "true"); }

            if (params.startEnabled) {
                this.enabledColUI.append(li);
            } else {
                this.disabledColUI.append(li);
            }
        }

        const initsortui = (ui: JQuery<HTMLSelectElement>) => {
            for (let col in SORTS) {
                let first = false;
                if (col === "Song #") { first = true; }
                const opt = document.createElement("option");
                if (first) {
                    opt.selected = true;
                }
                opt.textContent = col;

                ui.append(opt);
            }
        };
        initsortui(this.sortUI);
        initsortui(this.sortUI2);

        // --------------------------------------------------------------------
        const onUIChange = () => {
            drawRound(activeData, 1);
        };

        this.uploadButton.onchange = async () => {
            console.log("upload: onchange");
            const f = page.uploadButton.files![0];
            const txt = await f.text();

            const data = JSON.parse(txt);

            activeData = data;

            this.placeholderDiv.hide();
            this.outputDiv.show();


            //
            onUIChange();
        };

        this.languageUI.on("change", () => {
            language = page.languageUI.val() as any;
            console.log(["Set lang", language]);
            onUIChange();
        });

        const onSort = () => {
            console.log(["sort", this.sortUI.val(), this.sortUI2.val()]);
            onUIChange();
        };
        this.sortUI.on("change", onSort);
        this.sortUI2.on("change", onSort);

        const onStack = () => {
            const stacked = this.stackedUI[0].checked;
            console.log(["Stacked", stacked]);
            for (let it of $("[data-my-bot]")) {
                if (stacked) {
                    it.textContent = `${it.getAttribute("data-val")}\n${it.getAttribute("data-my-bot")}`;
                } else {
                    it.textContent = `${it.getAttribute("data-val")}`;
                }
            }

            if (stacked) {
                $("[data-bot]").hide();
            } else {
                $("[data-bot]").show();
            }

            onUIChange();
        };
        this.stackedUI.on("change", onStack);
        onStack();


        this.footerUI.on("change", () => {
            console.log(["footer", this.footerUI[0].checked]);
            onUIChange();
        });


        ($([this.enabledColUI, this.disabledColUI]) as any).sortable({
            connectWith: ".connectedSortable"
        }).disableSelection();

        /* Probably some events that wouldn't require doing this on both */
        this.enabledColUI.on("sortchange sortout", () => {
            console.log("sort change");
            onUIChange();
        });
        this.disabledColUI.on("sortchange sortout", () => {
            console.log("sort change");
            onUIChange();
        });
        // this.firstDraw();
        // this.drawLoremIspum();
        drawRound(activeData, 0);
        console.log(activeData);

    }

}

export const page = new PngPage();
export let language: "english" | "romaji" = "english";

function getSongAnimeName(song: Song) {
    return song.songInfo.animeNames[language];
}

function init(): void {
    page.init();

    if (location.hostname === "127.0.0.1") {
        const favicon = document.getElementById("favicon") as HTMLLinkElement;
        favicon.href = "../favicon_localhost.png";
    }

    // XXX
    // $("#listName").val("ONLOAD");
    // onSubmit();

}

$(document).ready(init);

// ----------------------------------------------------------------------------
function htmlDecode(input: string) {
    // https://stackoverflow.com/a/34064434/1993919
    var doc = new DOMParser().parseFromString(input, "text/html");
    return doc.documentElement.textContent;
}
export function mmss(seconds: number) {
    const m = Math.floor(seconds / 60);
    const fs = Math.floor(seconds - 60 * m);
    return `${m.toString().padStart(2, "0")}:${fs.toString().padStart(2, "0")}`;
}
// ----------------------------------------------------------------------------

interface ColumnLayout {
    X: number;
    Width: number;
}
function nanColumn(): ColumnLayout { return { X: NaN, Width: NaN }; }

export const layout = {
    font: { textAlign: "left", textBaseline: "top", font: "20px serif" } as FontParams,
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
    composer: nanColumn(),
    arranger: nanColumn(),
    vintage: nanColumn(),
    seasonInfo: nanColumn(),


    headerHeight: NaN,
    headerColor: "#d4c2c2ff",
    margin: 1,
    textColor: "white",
    lineColor: "gray",
    correctColor: "green",
    wrongColor: "red",
    divisionColor: "white",
    divisionThick: 1,


};
const COLUMNS = ["Song #", "Result", "Guess",
    "Type", "Song", "Artist",
    "Composer", "Arranger",
    "Difficulty", "Room Score",
    "Sample",
    "Season Info", "Vintage",
] as const;
type Column = typeof COLUMNS[number];
function drawRound(amqRound: AMQRound | null, foo: any) {

    if (null == amqRound) {
        return;
    }

    console.log(foo);
    // const stacked = true;
    // const stacked = false;
    const stacked = page.stackedUI[0].checked;
    const showFooter = page.footerUI[0].checked;

    const SONG_TYPES = ["OP", "ED", "INS"] as const;

    const columns: Partial<Record<Column, boolean>> = {};
    for (const el of page.enabledColUI.children()) {
        const val = el.getAttribute("data-val");
        if (val)
            columns[val as Column] = true;
    }


    if (stacked) {
        /* Bot = Top */
        columns["Guess"] = columns["Result"];
        columns["Artist"] = columns["Song"];
        columns["Arranger"] = columns["Arranger"];
        columns["Season Info"] = columns["Vintage"];
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
    layout.arranger.Width = pen.getTxtWidth("Nobuhiko Okamoto");
    layout.composer.Width = pen.getTxtWidth("Nobuhiko Okamoto");
    layout.vintage.Width = pen.getTxtWidth("Fall 0000");
    layout.seasonInfo.Width = pen.getTxtWidth("Season 1");


    const setToMax = (a: ColumnLayout, b: ColumnLayout) => {
        a.Width = Math.max(a.Width, b.Width);
        b.Width = a.Width;
    };
    if (stacked) {
        layout.type.Width = pen.getTxtWidth("000");

        setToMax(layout.artist, layout.song);
        setToMax(layout.seasonInfo, layout.vintage);

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
    if (showFooter) {
        imageHeight += layout.fontHeight + layout.hRuleThickness;
    }

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


    const insertColumn = (key: Column, cl: ColumnLayout) => {
        if (columns[key]) {
            console.assert(!isNaN(cl.Width));
            cl.X = x;
            x += cl.Width;
            x += layout.unitSpace;
        }
    };
    const insertColumnStacked = (key: Column, cl: ColumnLayout, top: ColumnLayout) => {
        if (columns[key]) {
            if (stacked) {
                cl.X = top.X;
            } else {
                console.assert(!isNaN(cl.Width));
                cl.X = x;
                x += cl.Width;
                x += layout.unitSpace;
            }
        }
    };

    // console.log(columns);
    const mapping: Record<Column, [ColumnLayout] | [ColumnLayout, ColumnLayout]> = {

        "Song #": [layout.index],
        "Result": [layout.result],
        "Guess": [layout.guess, layout.result],
        "Type": [layout.type],
        "Song": [layout.song],
        "Artist": [layout.artist, layout.song],
        "Difficulty": [layout.difficulty],
        "Room Score": [layout.roomScore],
        "Sample": [layout.sample],
        "Composer": [layout.composer],
        "Arranger": [layout.arranger, layout.composer],
        "Vintage": [layout.vintage],
        "Season Info": [layout.seasonInfo, layout.vintage],
    };
    const activeCols = [] as Column[];
    for (let _col in columns) {
        const col = _col as Column;
        if (columns[col]) activeCols.push(col);
    }
    // console.log(activeCols);

    for (let _col of activeCols) {
        const col = _col as Column;
        const cll = mapping[col];
        // console.log([col, cll]);
        if (cll.length === 1) {
            insertColumn(col, ...cll);
        } else {
            insertColumnStacked(col, ...cll);
        }
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
        ctx.fillStyle = layout.headerColor;
        ctx.fillRect(0, 0, imageWidth, layout.headerHeight);
        let baseline1 = layout.margin;
        let baseline2 = baseline1 + layout.fontHeight;
        let baselineMaybeStacked = stacked ? baseline2 : baseline1;


        let headerTextColor = "black";

        if (columns["Song #"]) {
            const cl = layout.index;
            pen.moveToPoint(cl.X, baseline1);
            ctx.textAlign = "left";
            if (stacked) {
                pen.fillText("Song", headerTextColor, cl.Width);
                pen.moveToPoint(cl.X, baseline2);
                pen.fillText("   #", headerTextColor, cl.Width);
            } else {
                pen.fillText("#", headerTextColor, cl.Width);
            }
        }

        if (columns["Result"]) {
            ctx.textAlign = "left";
            const cl = layout.result;
            pen.moveToPoint(cl.X, baseline1);
            pen.fillText("Anime Result", headerTextColor, cl.Width);
        }

        if (columns["Guess"]) {
            ctx.textAlign = "left";
            const cl = layout.guess;
            pen.moveToPoint(cl.X, baselineMaybeStacked);
            pen.fillText("Anime Guess", headerTextColor, cl.Width);
        }

        if (columns["Type"]) {
            ctx.textAlign = "left";
            const cl = layout.type;
            pen.moveToPoint(cl.X, baseline1);
            if (stacked) {
                pen.fillText("Song", headerTextColor, cl.Width);
                pen.moveToPoint(cl.X, baseline2);
                pen.fillText("Type", headerTextColor, cl.Width);
            } else {
                pen.fillText("Type", headerTextColor, cl.Width);
            }
        }
        if (columns["Song"]) {
            ctx.textAlign = "left";
            const cl = layout.song;
            pen.moveToPoint(cl.X, baseline1);
            pen.fillText("Song", headerTextColor, cl.Width);
        }

        if (columns["Artist"]) {
            ctx.textAlign = "left";
            const cl = layout.artist;
            pen.moveToPoint(cl.X, baselineMaybeStacked);
            pen.fillText("Artist", headerTextColor, cl.Width);
        }

        if (columns["Difficulty"]) {
            ctx.textAlign = "left";
            const cl = layout.difficulty;
            pen.moveToPoint(cl.X, baseline1);
            if (stacked) {
                pen.fillText("%", headerTextColor, cl.Width);
                pen.moveToPoint(cl.X, baseline2);
                pen.fillText("Easy", headerTextColor, cl.Width);
            } else {
                pen.fillText("%Easy", headerTextColor, cl.Width);
            }
        }

        if (columns["Room Score"]) {
            ctx.textAlign = "left";
            const cl = layout.roomScore;
            pen.moveToPoint(cl.X, baseline1);
            if (stacked) {
                pen.fillText("Room", headerTextColor, cl.Width);
                pen.moveToPoint(cl.X, baseline2);
                pen.fillText("Score", headerTextColor, cl.Width);
            } else {
                pen.fillText("Room Score", headerTextColor, cl.Width);

            }
        }

        if (columns["Sample"]) {
            ctx.textAlign = "left";
            const cl = layout.sample;
            pen.moveToPoint(cl.X, baseline1);
            if (stacked) {
                pen.fillText("Song", headerTextColor, cl.Width);
                pen.moveToPoint(cl.X, baseline2);
                pen.fillText("Sample", headerTextColor, cl.Width);
            } else {
                pen.fillText("Song Sample", headerTextColor, cl.Width);

            }
        }

        if (columns["Arranger"]) {
            ctx.textAlign = "left";
            const cl = layout.arranger;
            pen.moveToPoint(cl.X, baselineMaybeStacked);
            pen.fillText("Arranger", headerTextColor, cl.Width);
        }

        if (columns["Composer"]) {
            ctx.textAlign = "left";
            const cl = layout.composer;
            pen.moveToPoint(cl.X, baseline1);
            pen.fillText("Composer", headerTextColor, cl.Width);
        }

        if (columns["Vintage"]) {
            ctx.textAlign = "left";
            const cl = layout.vintage;
            pen.moveToPoint(cl.X, baseline1);
            pen.fillText("Vintage", headerTextColor, cl.Width);
        }

        if (columns["Season Info"]) {
            ctx.textAlign = "left";
            const cl = layout.seasonInfo;
            pen.moveToPoint(cl.X, baselineMaybeStacked);
            pen.fillText("Season", headerTextColor, cl.Width);
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

    const dispList: Song[] = [...amqRound.songs];
    dispList.sort(
        mergeSorter(SORTS[page.sortUI.val() as keyof typeof SORTS], SORTS[page.sortUI2.val() as keyof typeof SORTS])
    );

    pen.moveToPoint(layout.margin, layout.margin + layout.headerHeight);
    for (let result of dispList) {
        const baseline = pen.y;
        const baselineMaybeStacked = stacked ? baseline + layout.fontHeight : baseline;
        let txt = "";
        /* Index */
        if (columns["Song #"]) {
            const cl = layout.index;
            if (undefined !== result.answer) {
                ctx.fillStyle = result.correctGuess ? layout.correctColor : layout.wrongColor;
                ctx.fillRect(cl.X, baseline, cl.Width, layout.fontHeight * (Number(stacked) + 1));
            }

            ctx.textAlign = "right";
            pen.moveToPoint(cl.X + cl.Width, baseline);
            pen.fillText(`${result.songNumber}`, layout.textColor);
        }

        /* Expected Answer */
        if (columns["Result"]) {
            const cl = layout.result;
            ctx.textAlign = "left";
            pen.moveToPoint(cl.X, baseline);
            txt = `🔍${htmlDecode(getSongAnimeName(result))}`;
            pen.fillText(txt, layout.textColor, cl.Width);
        }

        /* Given Answer */
        if (columns["Guess"]) {
            const cl = layout.guess;
            ctx.textAlign = "left";
            pen.moveToPoint(cl.X, baselineMaybeStacked);
            if (undefined === result.answer) {
                txt = "";
            } else {
                let tmp = htmlDecode(result.answer);
                if (stacked && tmp === getSongAnimeName(result)) {
                    tmp = DITTO;
                }
                txt = `${result.correctGuess ? "✅" : "❌"}${tmp}`;
            }
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
            } else {
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

            } else {
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

            } else {
                ctx.textAlign = "left";
                pen.moveToPoint(cl.X, baseline);
                txt = `${s}|${f}`;
                pen.fillText(txt, layout.textColor, cl.Width);
            }
        }

        /* Composer */
        if (columns["Composer"]) {
            ctx.textAlign = "left";
            const cl = layout.composer;
            pen.moveToPoint(cl.X, baseline);
            pen.fillText(result.songInfo.composerInfo.name, layout.textColor, cl.Width);
        }
        /* Arranger */
        if (columns["Arranger"]) {
            ctx.textAlign = "left";
            const cl = layout.arranger;
            pen.moveToPoint(cl.X, baselineMaybeStacked);
            txt = result.songInfo.arrangerInfo.name;
            if (stacked && txt === result.songInfo.composerInfo.name) {
                txt = DITTO;
            }
            pen.fillText(txt, layout.textColor, cl.Width);
        }
        /* Vintage */
        if (columns["Vintage"]) {
            ctx.textAlign = "left";
            const cl = layout.vintage;
            pen.moveToPoint(cl.X, baseline);
            pen.fillText(result.songInfo.vintage, layout.textColor, cl.Width);
        }
        /* Season */
        if (columns["Season Info"]) {
            ctx.textAlign = "left";
            const cl = layout.seasonInfo;
            pen.moveToPoint(cl.X, baselineMaybeStacked);
            txt = result.songInfo.seasonInfo || result.songInfo.animeType;
            pen.fillText(txt, layout.textColor, cl.Width);
        }

        /*
         * 
         * END LINE 
         *
         */
        pen.moveToPoint(0, baseline);
        pen.carriageReturn(layout.fontHeight);
        if (stacked) { pen.carriageReturn(layout.fontHeight); }

        ctx.beginPath();
        pen.moveToPoint(0, null);
        const half = layout.hRuleVSpace / 2;
        pen.moveOver(0, half);
        ctx.lineWidth = layout.hRuleThickness;
        ctx.strokeStyle = layout.lineColor;
        pen.lineOver(imageWidth, 0);
        // ctx.closePath();
        ctx.stroke();
        pen.moveOver(0, half);

    } // END for result
    if (showFooter) {

        ctx.fillStyle = layout.headerColor;
        pen.moveToPoint(0, pen.y + layout.hRuleThickness / 2);
        ctx.fillRect(0, pen.y, page.offscreenCanvas.width, layout.fontHeight);
        pen.moveOver(layout.unitSpace, 0);
        pen.fillText(`Made with ${window.location.href}`, "black");
    }

    page.render();

}
