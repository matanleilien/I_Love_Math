/**
 * pixel-walk.js  — 480×180 canvas, CSS scaled to 580px.
 * Higher fidelity pixel art with detailed girl character.
 */

class PixelWalk {
  constructor(canvas, data) {
    this.canvas = canvas;
    this.ctx    = canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;

    this.W  = 480;
    this.H  = 180;
    this.GY = 136;

    this.vendor    = data.vendor    || { emoji:'🛒', name:'?', greeting:'...' };
    this.prevEmoji = data.prevEmoji || '🏚️';
    this.isRTL     = (data.language === 'he');

    const margin   = 32;
    const stopDist = 64;  // stop before the stall
    this.charX     = this.isRTL ? this.W - margin : margin;
    this.targetX   = this.isRTL ? margin + stopDist : this.W - margin - stopDist;

    this.marketScroll = 0;
    this.walkTick     = 0;
    this.walkFrame    = 0;
    this.sunAngle     = 0;
    this.cloudX       = [76, 260, 400];
    this.phase        = 'wait';
    this.excScale     = 0;

    this._raf  = null;
    this._prev = 0;
  }

  start() {
    this._prev = performance.now();
    this._raf  = requestAnimationFrame(t => this._tick(t));
    setTimeout(() => { this.phase = 'walk'; }, 400);
  }

  stop() {
    if (this._raf) { cancelAnimationFrame(this._raf); this._raf = null; }
  }

  _tick(now) {
    const dt = Math.min(now - this._prev, 50);
    this._prev = now;
    this._update(dt);
    this._draw();
    this._raf = requestAnimationFrame(t => this._tick(t));
  }

  _update(dt) {
    const speed = (this.W - 64) / 2200;
    const dir   = this.isRTL ? -1 : 1;

    if (this.phase === 'walk') {
      this.charX        += dir * speed * dt;
      this.marketScroll += dir * speed * dt * 0.4;
      this.walkTick     += dt;
      this.walkFrame     = Math.floor(this.walkTick / 190) % 4;
      this.sunAngle     += dt * 0.018;
      this.cloudX        = this.cloudX.map(x => {
        x -= dt * 0.024;
        return x < -50 ? this.W + 50 : x;
      });
      const done = dir > 0 ? this.charX >= this.targetX : this.charX <= this.targetX;
      if (done) {
        this.charX = this.targetX;
        this.phase = 'arrive';
        this.walkFrame = 0;
        setTimeout(() => { this.phase = 'exclaim'; }, 100);
        setTimeout(() => {
          if (typeof window.onVendorArrived === 'function')
            window.onVendorArrived(this.vendor);
        }, 1900);
      }
    }
    if (this.phase === 'exclaim' && this.excScale < 1) {
      this.excScale = Math.min(1, this.excScale + 0.07);
    }
  }

  _draw() {
    this.ctx.clearRect(0, 0, this.W, this.H);
    this._sky();
    this._buildings();
    this._ground();
    this._stalls();
    this._character(Math.round(this.charX), this.GY, this.walkFrame, this.isRTL);
    if (this.excScale > 0) this._exclamation();
  }

  _px(x, y, w, h, col, a) {
    const ctx = this.ctx;
    if (a !== undefined) ctx.globalAlpha = a;
    ctx.fillStyle = col;
    ctx.fillRect(x, y, w, h);
    if (a !== undefined) ctx.globalAlpha = 1;
  }

  /* ── SKY ── */
  _sky() {
    const { W, GY } = this;
    this._px(0, 0,    W, 54, '#2e5ba8');
    this._px(0, 54,   W, 36, '#4a7fc0');
    this._px(0, 90,   W, 28, '#6aaade');
    this._px(0, 118,  W, GY - 118, '#8ec8f0');

    // Sun
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(this.W - 24, 18);
    ctx.rotate(this.sunAngle * Math.PI / 180);
    ctx.fillStyle = '#FFE040';
    [[-16,0],[16,0],[0,-16],[0,16],[-12,-12],[12,-12],[-12,12],[12,12]].forEach(([rx,ry]) => {
      ctx.fillRect(rx-2, ry-2, 4, 4);
    });
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(-8, -8, 16, 16);
    ctx.fillStyle = '#FFF080';
    ctx.fillRect(-6, -6, 8, 8);
    ctx.restore();

    // Clouds
    this.cloudX.forEach((cx, i) => {
      const cy = [16, 30, 12][i];
      const cw = [44, 28, 36][i];
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(Math.round(cx),     cy+6, cw,   8);
      ctx.fillRect(Math.round(cx)+6,   cy,   cw-12, 8);
      ctx.fillRect(Math.round(cx)+Math.floor(cw*.3), cy-4, Math.floor(cw*.4), 6);
      ctx.fillStyle = '#c8dff0';
      ctx.fillRect(Math.round(cx)+4, cy+12, cw-4, 2);
    });
  }

  /* ── BUILDINGS ── */
  _buildings() {
    const { GY } = this;
    const ctx = this.ctx;
    const off = Math.round(this.marketScroll);

    const B = [
      { x:  0, w:52, h:44, col:'#8B3A3A', roof:'#5e1818', win:'#FFD898', awn:'#FF5030' },
      { x: 56, w:40, h:34, col:'#3A608B', roof:'#1e3c62', win:'#A0D8FF', awn:'#2080FF' },
      { x:100, w:48, h:52, col:'#4a7030', roof:'#2a4010', win:'#C0FF80', awn:'#50B820' },
      { x:152, w:36, h:38, col:'#8B5020', roof:'#5c2e08', win:'#FFD898', awn:'#FF7030' },
      { x:192, w:60, h:44, col:'#5e2a8B', roof:'#381260', win:'#DDB0FF', awn:'#A030FF' },
      { x:256, w:44, h:32, col:'#1e7050', roof:'#103820', win:'#80FFD8', awn:'#00C860' },
      { x:304, w:40, h:42, col:'#8B4818', roof:'#5c2808', win:'#FFD898', awn:'#FF5818' },
      { x:348, w:52, h:36, col:'#3a307a', roof:'#201048', win:'#C0B0FF', awn:'#7050FF' },
      { x:404, w:40, h:48, col:'#7a2848', roof:'#4e0e28', win:'#FFB0D8', awn:'#FF3080' },
      { x:448, w:48, h:40, col:'#2a5a8B', roof:'#102e5c', win:'#A0E8FF', awn:'#10A0FF' },
    ];
    const totalW = 500;

    for (let rep = -1; rep <= 1; rep++) {
      const base = off + rep * totalW;
      B.forEach(b => {
        const bx = Math.round(b.x + base);
        const by = GY - b.h;

        ctx.fillStyle = b.col;
        ctx.fillRect(bx, by, b.w, b.h);
        ctx.fillStyle = '#00000022';
        ctx.fillRect(bx + b.w - 6, by, 6, b.h);
        ctx.fillStyle = '#ffffff14';
        ctx.fillRect(bx, by, b.w, 2);
        ctx.fillRect(bx, by, 2, b.h);

        // roof
        ctx.fillStyle = b.roof;
        ctx.fillRect(bx, by, b.w, 6);

        // awning
        ctx.fillStyle = b.awn;
        ctx.fillRect(bx+4, GY-14, b.w-8, 6);
        ctx.fillStyle = '#ffffff44';
        for (let sx = bx+6; sx < bx+b.w-8; sx += 8) ctx.fillRect(sx, GY-14, 4, 6);

        // windows
        ctx.fillStyle = b.win;
        for (let wx = bx+6; wx < bx+b.w-10; wx += 12) {
          for (let wy = by+8; wy < by+b.h-16; wy += 14) {
            ctx.fillRect(wx, wy, 8, 8);
            ctx.fillStyle = b.col;
            ctx.fillRect(wx+3, wy+3, 2, 2);
            ctx.fillStyle = b.win;
          }
        }

        // door
        ctx.fillStyle = '#180800';
        const dx = bx + (b.w >> 1) - 4;
        ctx.fillRect(dx, GY-14, 8, 14);
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(dx+6, GY-8, 2, 2);
      });
    }
  }

  /* ── GROUND ── */
  _ground() {
    const { W, H, GY } = this;
    const ctx = this.ctx;
    this._px(0, GY,   W, H-GY, '#1a4010');
    this._px(0, GY,   W, 4,    '#0e2808');
    this._px(0, GY+4, W, 8,    '#2a5818');
    this._px(0, GY+4, W, 4,    '#3a6820');

    // road dashes
    ctx.fillStyle = '#c8a000';
    const dashOff = ((Math.round(this.marketScroll * .45) % 28) + 28) % 28;
    for (let x = -28 + dashOff; x < W + 28; x += 28)
      ctx.fillRect(Math.round(x), GY+8, 16, 4);

    // grass tufts
    ctx.fillStyle = '#4a8828';
    for (let x = 10; x < W; x += 37) {
      ctx.fillRect(x, GY + 16, 2, 6);
      ctx.fillRect(x+3, GY + 14, 2, 8);
      ctx.fillRect(x+6, GY + 16, 2, 6);
    }
  }

  /* ── STALLS ── */
  _stalls() {
    const { W, GY } = this;
    const ctx = this.ctx;
    ctx.textBaseline = 'bottom';
    ctx.textAlign    = 'center';

    const prevX = this.isRTL ? W-28 : 28;
    const nextX = this.isRTL ? 28    : W-28;

    // previous stall (faded)
    ctx.globalAlpha = 0.25;
    ctx.font = '22px serif';
    ctx.fillText(this.prevEmoji, prevX, GY-2);
    ctx.globalAlpha = 1;

    // ── next stall: draw a visible market booth ──
    const sx = nextX;
    const sy = GY;

    // stall counter / table
    ctx.fillStyle = '#8B5E3C';
    ctx.fillRect(sx-46, sy-32, 92, 32);
    ctx.fillStyle = '#A0703C';
    ctx.fillRect(sx-46, sy-32, 92, 6);
    ctx.fillStyle = '#6B3E1C';
    ctx.fillRect(sx-46, sy-2, 92, 3);
    // table legs
    ctx.fillStyle = '#5C2E0C';
    ctx.fillRect(sx-44, sy-2, 6, 6);
    ctx.fillRect(sx+38, sy-2, 6, 6);

    // awning / roof
    ctx.fillStyle = '#E83030';
    ctx.fillRect(sx-52, sy-82, 104, 22);
    ctx.fillStyle = '#FF6040';
    for (let ax = sx-50; ax < sx+50; ax += 12) {
      ctx.fillRect(ax, sy-82, 6, 22);
    }
    // awning border
    ctx.fillStyle = '#A01818';
    ctx.fillRect(sx-52, sy-62, 104, 3);
    // scalloped edge
    ctx.fillStyle = '#E83030';
    for (let ax = sx-50; ax < sx+50; ax += 12) {
      ctx.fillRect(ax, sy-59, 10, 6);
    }
    // awning poles
    ctx.fillStyle = '#5C2E0C';
    ctx.fillRect(sx-50, sy-82, 5, 82);
    ctx.fillRect(sx+45, sy-82, 5, 82);

    // vendor emoji (large)
    ctx.font = '52px serif';
    ctx.fillText(this.vendor.emoji || '🏪', sx, sy-30);

    // name sign
    ctx.fillStyle = '#FFF8E0';
    const nameW = Math.max(96, (this.vendor.name || '').length * 10 + 24);
    ctx.fillRect(sx - nameW/2, sy-102, nameW, 20);
    ctx.fillStyle = '#5C2E0C';
    ctx.fillRect(sx - nameW/2, sy-102, nameW, 3);
    ctx.fillRect(sx - nameW/2, sy-84, nameW, 3);
    ctx.font = '12px "Press Start 2P", monospace';
    ctx.fillStyle = '#2a1008';
    ctx.fillText(this.vendor.name || '', sx, sy-85);
  }

  /* ── CHARACTER (high fidelity) ── */
  _character(cx, cy, frame, flipX) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(cx, cy);
    if (flipX) ctx.scale(-1, 1);

    const p = (x, y, w, h, col, a) => {
      if (a !== undefined) ctx.globalAlpha = a;
      ctx.fillStyle = col;
      ctx.fillRect(x, y, w, h);
      if (a !== undefined) ctx.globalAlpha = 1;
    };

    // 4-frame walk cycle
    const f = frame; // 0,1,2,3
    const legPhase = [0, 1, 2, 1][f]; // 0=neutral, 1=left forward, 2=right forward
    const lL = legPhase === 1;
    const lR = legPhase === 2;
    const isWalk = this.phase === 'walk';

    const llX = lL ?  4 : (lR ? -4 : 0);
    const llY = lL ? -4 : 0;
    const rlX = lR ?  4 : (lL ? -4 : 0);
    const rlY = lR ? -4 : 0;
    const laX = lL ? -4 : (lR ?  4 : 0);
    const raX = lR ? -4 : (lL ?  4 : 0);
    const hob = isWalk ? (legPhase === 1 || legPhase === 2 ? -2 : 0) : 0;

    // shadow
    p(-12, -2, 24, 4, '#000000', 0.13);

    // ── BACK LEG ──
    p(-6+llX, -26+llY, 8, 16, '#FFCB9A');  // skin
    p(-6+llX, -12+llY, 8, 6,  '#f0f0f0');  // sock
    p(-8+llX, -8+llY,  10, 8, '#C8102E');   // shoe
    p(-8+llX,  0+llY,  10, 2, '#8B0010');   // sole
    p(-6+llX, -8+llY,  8, 2,  '#ff2040', 0.3); // shoe highlight

    // ── BACK ARM ──
    p(-12+laX, -54+hob, 6, 20, '#FFCB9A');
    p(-14+laX, -38+hob, 10, 8, '#f9c060');  // sleeve cuff

    // ── SKIRT ──
    p(-12, -40+hob, 26, 12, '#E83E8C');
    p(-14, -30+hob, 30, 10, '#D02878');
    p(-10, -38+hob, 22, 4,  '#FF80C0', 0.3); // highlight
    // polka dots
    p(-8,  -34+hob, 4, 4, '#FF99CC', 0.65);
    p(-2,  -32+hob, 4, 4, '#FF99CC', 0.65);
    p( 4,  -34+hob, 4, 4, '#FF99CC', 0.65);
    p(10,  -32+hob, 4, 4, '#FF99CC', 0.65);
    // skirt hem
    p(-14, -22+hob, 30, 2, '#b81860');

    // ── TORSO ──
    p(-8, -62+hob, 18, 24, '#E83E8C');
    p(-6, -60+hob, 14, 4,  '#FF80C0', 0.25);  // highlight
    // V-neck collar
    p(-4, -62+hob, 10, 8, '#FFF8EC');
    p(-2, -56+hob, 6,  6, '#FFF8EC');
    p( 0, -52+hob, 2,  4, '#FFF8EC');
    // star decorations
    p(-6, -50+hob, 2, 8, '#FFD700'); p(-8, -48+hob, 6, 2, '#FFD700');
    p( 6, -50+hob, 2, 8, '#FFD700'); p( 4, -48+hob, 6, 2, '#FFD700');

    // ── FRONT ARM + BASKET ──
    p(6+raX, -58+hob, 6, 20, '#FFCB9A');
    // basket
    p(2+raX, -44+hob, 18, 18, '#D4A017');
    p(2+raX, -46+hob, 18, 4,  '#8B6010');
    p(2+raX, -28+hob, 18, 2,  '#8B6010');
    // basket weave
    ctx.fillStyle = '#8B601055';
    for (let bx = 4+raX; bx < 18+raX; bx += 6) ctx.fillRect(bx, -44+hob, 2, 18);
    for (let by = -42+hob; by < -28+hob; by += 6) ctx.fillRect(2+raX, by, 18, 2);
    // basket handle
    p(6+raX, -54+hob, 2, 6, '#8B6010');
    p(14+raX,-54+hob, 2, 6, '#8B6010');
    p(8+raX, -56+hob, 6, 2, '#8B6010');
    // items in basket
    p(6+raX, -38+hob, 6, 6, '#E82020');  // apple
    p(12+raX,-38+hob, 6, 6, '#FFD020');  // orange
    p(8+raX, -44+hob, 4, 4, '#50C020');  // leaf

    // ── FRONT LEG ──
    p(0+rlX, -26+rlY, 8, 16, '#F5B870');
    p(0+rlX, -12+rlY, 8, 6,  '#f0f0f0');
    p(-2+rlX,-8+rlY,  10, 8, '#C8102E');
    p(-2+rlX, 0+rlY,  10, 2, '#8B0010');
    p(0+rlX, -8+rlY,  8, 2,  '#ff2040', 0.3);

    // ── HEAD ──
    const hy = hob;
    // hair back
    p(-10, -88+hy, 22, 28, '#5C3018');
    // ponytail
    p(10, -92+hy,  8, 26, '#5C3018');
    p(12, -90+hy,  6, 20, '#7A4A28');
    // ponytail root
    p( 8, -96+hy, 12, 8, '#5C3018');
    // ribbon
    p( 8, -98+hy, 12, 8, '#E83E8C');
    p(10, -96+hy,  8, 4, '#FF99CC');
    p(12, -96+hy,  2, 2, '#ffffff');

    // face
    p(-8, -84+hy, 20, 26, '#FFCB9A');
    // fringe
    p(-10,-88+hy, 22, 6,  '#3A1A08');
    // side hair
    p(-12,-82+hy, 4, 16,  '#5C3018');
    p( 8, -82+hy, 4, 16,  '#5C3018');

    // eyebrows
    p(-8, -74+hy, 8, 2, '#3A1A08');
    p( 2, -74+hy, 8, 2, '#3A1A08');

    // LEFT EYE
    p(-8, -72+hy, 8, 12, '#ffffff');
    p(-8, -70+hy, 8, 8,  '#5040B8');
    p(-6, -68+hy, 4, 4,  '#18084a');
    p(-8, -70+hy, 4, 4,  '#ffffff');       // highlight
    p(-10,-74+hy, 10, 2, '#2a1008');       // lash top
    p(-12,-74+hy, 2, 4,  '#2a1008');       // lash corner L
    p( 0, -74+hy, 2, 4,  '#2a1008');       // lash corner R
    p(-8, -62+hy, 8, 2,  '#c9a060');       // lower lid

    // RIGHT EYE
    p(2, -72+hy, 8, 12, '#ffffff');
    p(2, -70+hy, 8, 8,  '#5040B8');
    p(4, -68+hy, 4, 4,  '#18084a');
    p(2, -70+hy, 4, 4,  '#ffffff');
    p(0, -74+hy, 10, 2, '#2a1008');
    p(-2,-74+hy, 2, 4,  '#2a1008');
    p(10,-74+hy, 2, 4,  '#2a1008');
    p(2, -62+hy, 8, 2,  '#c9a060');

    // nose
    p(-2, -58+hy, 6, 2, '#c98b3a');
    // mouth / smile
    p(-6, -54+hy, 14, 2, '#c0614a');
    p(-8, -56+hy, 2, 2,  '#c0614a');
    p( 6, -56+hy, 2, 2,  '#c0614a');
    p(-4, -54+hy, 10, 2, '#ffffff88');     // teeth

    // cheeks
    p(-10,-62+hy, 6, 6, '#f0a070', 0.3);
    p( 4, -62+hy, 6, 6, '#f0a070', 0.3);

    // hair strand detail
    p(-10,-86+hy, 2, 4, '#7A4A28', 0.5);
    p( 8, -86+hy, 2, 4, '#7A4A28', 0.5);

    ctx.restore();
  }

  /* ── EXCLAMATION ── */
  _exclamation() {
    const ctx = this.ctx;
    const cx  = Math.round(this.charX) + (this.isRTL ? 16 : -16);
    const cy  = this.GY - 110;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(this.excScale, this.excScale);
    // background bubble (white, larger)
    this._px(-16, -32, 32, 42, '#FFFFFF');
    // border
    this._px(-16, -32, 32, 3, '#333333');
    this._px(-16, 7, 32, 3, '#333333');
    this._px(-16, -32, 3, 42, '#333333');
    this._px(13, -32, 3, 42, '#333333');
    // vertical bar of "!" (red, thick)
    this._px(-4, -26, 8, 22, '#E83030');
    // dot of "!" (red)
    this._px(-4, 0, 8, 8, '#E83030');
    ctx.restore();
  }
}

window.PixelWalk = PixelWalk;
