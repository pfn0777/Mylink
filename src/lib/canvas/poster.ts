const POSTER_WIDTH = 2480;
const POSTER_HEIGHT = 3508;
const BACKGROUND_COLOR = "#0F172A";

const FRAME_MARGIN = 80;
const FRAME_RADIUS = 64;
const FRAME_BORDER_COLOR = "rgba(255,255,255,0.14)";
const FRAME_BORDER_WIDTH = 4;

const CONTENT_TOP_MARGIN = 260;
const LOGO_DIAMETER = 520;
const LOGO_NAME_GAP = 90;

const CONTENT_SIDE_MARGIN = 300;
const NAME_MAX_WIDTH = POSTER_WIDTH - 2 * CONTENT_SIDE_MARGIN;
const NAME_FONT_MAX = 96;
const NAME_FONT_MIN = 48;
const NAME_FONT_STEP = 4;
const NAME_LINE_HEIGHT_MULTIPLIER = 1.2;
const NAME_COLOR = "#F8FAFC";
const NAME_FONT_WEIGHT = 700;
const FONT_FAMILY =
  'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

const BOTTOM_CONTENT_MARGIN = 260;
const QR_BOX_SIZE = 1600;
const QR_BOX_PADDING = 100;
const QR_BOX_RADIUS = 48;
const QR_BOX_COLOR = "#FFFFFF";

export const QR_PRINT_SIZE = QR_BOX_SIZE - 2 * QR_BOX_PADDING;

interface RenderPosterOptions {
  businessName: string;
  qrDataUrl: string;
  logoDataUrl: string | null;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`loadImage: failed to load ${src.slice(0, 32)}...`));
    img.src = src;
  });
}

function drawFrame(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = BACKGROUND_COLOR;
  ctx.fillRect(0, 0, POSTER_WIDTH, POSTER_HEIGHT);

  ctx.strokeStyle = FRAME_BORDER_COLOR;
  ctx.lineWidth = FRAME_BORDER_WIDTH;
  ctx.beginPath();
  ctx.roundRect(
    FRAME_MARGIN,
    FRAME_MARGIN,
    POSTER_WIDTH - 2 * FRAME_MARGIN,
    POSTER_HEIGHT - 2 * FRAME_MARGIN,
    FRAME_RADIUS,
  );
  ctx.stroke();
}

function drawLogo(ctx: CanvasRenderingContext2D, logo: HTMLImageElement, cursorY: number): number {
  const centerX = POSTER_WIDTH / 2;
  const logoCenterY = cursorY + LOGO_DIAMETER / 2;

  ctx.save();
  ctx.beginPath();
  ctx.arc(centerX, logoCenterY, LOGO_DIAMETER / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();

  const scale = Math.max(LOGO_DIAMETER / logo.naturalWidth, LOGO_DIAMETER / logo.naturalHeight);
  const drawWidth = logo.naturalWidth * scale;
  const drawHeight = logo.naturalHeight * scale;
  ctx.drawImage(logo, centerX - drawWidth / 2, logoCenterY - drawHeight / 2, drawWidth, drawHeight);
  ctx.restore();

  return cursorY + LOGO_DIAMETER + LOGO_NAME_GAP;
}

function drawBusinessName(ctx: CanvasRenderingContext2D, businessName: string, cursorY: number): number {
  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  let fontSize = NAME_FONT_MAX;
  ctx.font = `${NAME_FONT_WEIGHT} ${fontSize}px ${FONT_FAMILY}`;
  while (fontSize > NAME_FONT_MIN && ctx.measureText(businessName).width > NAME_MAX_WIDTH) {
    fontSize -= NAME_FONT_STEP;
    ctx.font = `${NAME_FONT_WEIGHT} ${fontSize}px ${FONT_FAMILY}`;
  }

  let displayName = businessName;
  if (ctx.measureText(displayName).width > NAME_MAX_WIDTH) {
    while (displayName.length > 0 && ctx.measureText(`${displayName}…`).width > NAME_MAX_WIDTH) {
      displayName = displayName.slice(0, -1);
    }
    displayName = `${displayName}…`;
  }

  ctx.fillStyle = NAME_COLOR;
  ctx.fillText(displayName, POSTER_WIDTH / 2, cursorY);

  return cursorY + fontSize * NAME_LINE_HEIGHT_MULTIPLIER;
}

function drawQrBox(ctx: CanvasRenderingContext2D, qr: HTMLImageElement, bandTop: number) {
  const bandBottom = POSTER_HEIGHT - BOTTOM_CONTENT_MARGIN;
  const boxY = bandTop + (bandBottom - bandTop - QR_BOX_SIZE) / 2;
  const boxX = (POSTER_WIDTH - QR_BOX_SIZE) / 2;

  ctx.fillStyle = QR_BOX_COLOR;
  ctx.beginPath();
  ctx.roundRect(boxX, boxY, QR_BOX_SIZE, QR_BOX_SIZE, QR_BOX_RADIUS);
  ctx.fill();

  ctx.drawImage(qr, boxX + QR_BOX_PADDING, boxY + QR_BOX_PADDING, QR_PRINT_SIZE, QR_PRINT_SIZE);
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("canvasToBlob: toBlob returned null"));
    }, "image/png");
  });
}

export async function renderPosterPng({ businessName, qrDataUrl, logoDataUrl }: RenderPosterOptions): Promise<Blob> {
  const [logo, qr] = await Promise.all([
    logoDataUrl ? loadImage(logoDataUrl) : Promise.resolve(null),
    loadImage(qrDataUrl),
  ]);

  const canvas = document.createElement("canvas");
  canvas.width = POSTER_WIDTH;
  canvas.height = POSTER_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("renderPosterPng: failed to get 2d canvas context");

  drawFrame(ctx);

  let cursorY = CONTENT_TOP_MARGIN;
  if (logo) {
    cursorY = drawLogo(ctx, logo, cursorY);
  } else {
    cursorY = CONTENT_TOP_MARGIN + LOGO_DIAMETER / 2 - NAME_FONT_MAX / 2;
  }

  cursorY = drawBusinessName(ctx, businessName, cursorY);
  drawQrBox(ctx, qr, cursorY);

  return canvasToBlob(canvas);
}
