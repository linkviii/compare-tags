/**
 * MIT licensed
 */


import "./jquery.js";
// import "./lib/jquery-ui/jquery-ui.min.js";

// ----------------------------------------------------------------------------
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
        [this.x, this.y] = this.pointerStack.pop();
    }

    applyFont(params: FontParams) {
        for (let key in params) {
            this.ctx[key] = params[key];
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
    answer: string;
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

// const testUrl = "res/20-songs.json";
const testUrl = "res/85-songs.json";
export const testData: AMQRound = await fetch(testUrl).then(response => response.json());
console.log(testData.songs[8]);
// ----------------------------------------------------------------------------

class PngPage {
    readonly inputForm = $("#form") as JQuery<HTMLFormElement>;

    /* Right clicking a <canvas> does not have a copy option. 
     * Instead we draw to an offscreen canvas and draw it to the <img>.
     */
    readonly canvasImg = $("#canvasImg") as JQuery<HTMLImageElement>;

    // ------------------------------------------------------------------------
    readonly offscreenCanvas = new OffscreenCanvas(100, 100);
    pen = new CanvasPen(this.offscreenCanvas.getContext("2d"));
    // ------------------------------------------------------------------------


    clearCanvas(color: string) {
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
function htmlDecode(input) {
    // https://stackoverflow.com/a/34064434/1993919
    var doc = new DOMParser().parseFromString(input, "text/html");
    return doc.documentElement.textContent;
}
// ----------------------------------------------------------------------------

const layout = {
    font: { textAlign: "left", textBaseline: "top", font: "20px serif" } as FontParams,
    fontHeight: NaN,
    /** Horizontal Line thickness */
    hRuleThickness: 3,
    /** Vertical Space to reserve for a horizontal line */
    hRuleVSpace: 2,
    indexWidth: NaN,
    indexX: NaN,
    animeWidth: NaN,
    resultX: NaN,
    guessX: NaN,
    artistX: NaN,
    artistWidth: NaN,
    unitSpace: NaN,
    typeX: NaN,
    typeWidth: NaN,
    songX: NaN,
    songWidth: NaN,
    difficultyX: NaN,
    difficultyWidth: NaN,
    margin: 1,
    textColor: "white",
    lineColor: "gray",
    correctColor: "green",
    wrongColor: "red",


};
function drawRound(amqRound: AMQRound) {
    /* TODO
     * Guess fraction 
     * Difficulty
     * Sample
     * 
     */

    const SONG_TYPES = ["OP", "ED", "INS"] as const;

    const pen = page.pen;
    const ctx = pen.ctx;

    const nSongs = amqRound.songs.length;

    pen.applyFont(layout.font);

    layout.fontHeight = pen.getFontHeight();
    layout.indexWidth = pen.getTxtWidth("0000");
    layout.animeWidth = pen.getTxtWidth("Ms. Vampire Who Lives in My Neighbor.");
    layout.unitSpace = pen.getTxtWidth("M");
    layout.typeWidth = pen.getTxtWidth("Op 10");
    layout.songWidth = pen.getTxtWidth("Aoarashi no Ato de");
    layout.artistWidth = pen.getTxtWidth("Asuka Nishi to Yukai na");
    layout.difficultyWidth = pen.getTxtWidth("00.0");


    let imageHeight = nSongs * layout.fontHeight;
    imageHeight += (nSongs - 1) * layout.hRuleVSpace;
    imageHeight += layout.margin * 2;

    // ---

    let x = 0;
    x += layout.margin;

    /* Index */
    layout.indexX = x;
    x += layout.indexWidth;
    x += layout.unitSpace;

    /* Result */
    layout.resultX = x;
    x += layout.animeWidth;
    x += layout.unitSpace;

    /* Guess */
    layout.guessX = x;
    x += layout.animeWidth;
    x += layout.unitSpace;

    /* Type */
    layout.typeX = x;
    x += layout.typeWidth;
    x += layout.unitSpace;

    /* Artist */
    layout.artistX = x;
    x += layout.artistWidth;
    x += layout.unitSpace;


    /* Song */
    layout.songX = x;
    x += layout.songWidth;
    x += layout.unitSpace;

    /* Difficulty */
    layout.difficultyX = x;
    x += layout.difficultyWidth;
    x += layout.unitSpace;


    /* END */
    x += layout.margin;
    const imageWidth = x;

    // ---


    page.offscreenCanvas.height = imageHeight;
    page.offscreenCanvas.width = imageWidth;

    pen.applyFont(layout.font);

    // ------------------------------------------------------------------------

    page.clearCanvas("black");

    pen.moveToPoint(layout.margin, layout.margin);
    for (let result of amqRound.songs) {
        let txt = "";
        /* Index */
        ctx.fillStyle = result.correctGuess ? layout.correctColor : layout.wrongColor;
        pen.moveToPoint(layout.indexX, null);
        ctx.fillRect(layout.indexX, pen.y, layout.indexWidth, layout.fontHeight);

        ctx.textAlign = "right";
        pen.moveToPoint(layout.indexX + layout.indexWidth, null);
        pen.fillText(`${result.songNumber}`, layout.textColor);

        /* Expected Answer */
        ctx.textAlign = "left";
        pen.moveToPoint(layout.resultX, null);
        pen.fillText(htmlDecode(result.songInfo.animeNames.english), layout.textColor, layout.animeWidth);

        /* Given Answer */
        ctx.textAlign = "left";
        pen.moveToPoint(layout.guessX, null);
        txt = `${result.correctGuess ? "✅" : "❌"}${htmlDecode(result.answer)}`;
        pen.fillText(txt, layout.textColor, layout.animeWidth);

        /* Artist */
        ctx.textAlign = "left";
        pen.moveToPoint(layout.artistX, null);
        pen.fillText(htmlDecode(result.songInfo.artist), layout.textColor, layout.artistWidth);

        /* Type */
        ctx.textAlign = "left";
        pen.moveToPoint(layout.typeX, null);
        txt = `${SONG_TYPES[result.songInfo.type - 1]} ${result.songInfo.typeNumber || ""}`;
        pen.fillText(txt, layout.textColor, layout.typeWidth);

        /* Song */
        ctx.textAlign = "left";
        pen.moveToPoint(layout.songX, null);
        pen.fillText(result.songInfo.songName, layout.textColor, layout.songWidth);


        /* Difficulty */
        ctx.textAlign = "right";
        pen.moveToPoint(layout.difficultyX + layout.difficultyWidth, null);
        txt = `${result.songInfo.animeDifficulty.toFixed(1)}`;
        pen.fillText(txt, layout.textColor, layout.difficultyWidth);

        /* END LINE */
        pen.carriageReturn(layout.fontHeight);

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
