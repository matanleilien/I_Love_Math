/**
 * pixel-walk.js  — rollback to 240×90 canvas, CSS 2× scaled to 480×180.
 * Clean integer scaling — no transforms, no offscreen canvas.
 */

class PixelWalk {
  constructor(canvas, data) {
    this.canvas = canvas;
    this.ctx    = canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;

    this.W  = 240;
    this.H  = 90;
    this.GY = 68;

    this.vendor    = data.vendor    || { emoji:'🛒', name:'?', greeting:'...' };
    this.prevEmoji = data.prevEmoji || '🏚️';
    this.isRTL     = (data.language === 'he');

    const margin   = 16;
    this.charX     = this.isRTL ? this.W - margin : margin;
    this.targetX   = this.isRTL ? margin          : this.W - margin;

    this.marketScroll = 0;
    this.walkTick     = 0;
    this.walkFrame    = 0;
    this.sunAngle     = 0;
    this.cloudX       = [38, 130, 200];
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
    const speed = (this.W - 32) / 2200;
    const dir   = this.isRTL ? -1 : 1;

    if (this.phase === 'walk') {
      this.charX        += dir * speed * dt;
      this.marketScroll += dir * speed * dt * 0.4;
      this.walkTick     += dt;
      this.walkFrame     = Math.floor(this.walkTick / 190) % 2;
      this.sunAngle     += dt * 0.018;
      this.cloudX        = this.cloudX.map(x => {
        x -= dt * 0.012;
        return x < -25 ? this.W + 25 : x;
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
    this._px(0, 0,            W, 27, '#2e5ba8');
    this._px(0, 27,           W, 18, '#4a7fc0');
    this._px(0, 45,           W, 14, '#6aaade');
    this._px(0, 59,           W, GY - 59, '#8ec8f0');

    // Sun
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(this.W - 12, 9);
    ctx.rotate(this.sunAngle * Math.PI / 180);
    ctx.fillStyle = '#FFE040';
    [[-8,0],[8,0],[0,-8],[0,8],[-6,-6],[6,-6],[-6,6],[6,6]].forEach(([rx,ry]) => {
      ctx.fillRect(rx-1, ry-1, 2, 2);
    });
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(-4, -4, 8, 8);
    ctx.restore();

    // Clouds
    ctx.fillStyle = '#ffffff';
    this.cloudX.forEach((cx, i) => {
      const cy = [8, 15, 6][i];
      const cw = [22, 14, 18][i];
      ctx.fillRect(Math.round(cx),     cy+3, cw,   4);
      ctx.fillRect(Math.round(cx)+3,   cy,   cw-6, 4);
      ctx.fillRect(Math.round(cx)+Math.floor(cw*.3), cy-2, Math.floor(cw*.4), 3);
      ctx.fillStyle = '#c8dff0';
      ctx.fillRect(Math.round(cx)+2, cy+6, cw-2, 1);
      ctx.fillStyle = '#ffffff';
    });
  }

  /* ── BUILDINGS ── */
  _buildings() {
    const { GY } = this;
    const ctx = this.ctx;
    const off = Math.round(this.marketScroll);

    const B = [
      { x:  0, w:26, h:22, col:'#8B3A3A', roof:'#5e1818', win:'#FFD898', awn:'#FF5030' },
      { x: 28, w:20, h:17, col:'#3A608B', roof:'#1e3c62', win:'#A0D8FF', awn:'#2080FF' },
      { x: 50, w:24, h:26, col:'#4a7030', roof:'#2a4010', win:'#C0FF80', awn:'#50B820' },
      { x: 76, w:18, h:19, col:'#8B5020', roof:'#5c2e08', win:'#FFD898', awn:'#FF7030' },
      { x: 96, w:30, h:22, col:'#5e2a8B', roof:'#381260', win:'#DDB0FF', awn:'#A030FF' },
      { x:128, w:22, h:16, col:'#1e7050', roof:'#103820', win:'#80FFD8', awn:'#00C860' },
      { x:152, w:20, h:21, col:'#8B4818', roof:'#5c2808', win:'#FFD898', awn:'#FF5818' },
      { x:174, w:26, h:18, col:'#3a307a', roof:'#201048', win:'#C0B0FF', awn:'#7050FF' },
      { x:202, w:20, h:24, col:'#7a2848', roof:'#4e0e28', win:'#FFB0D8', awn:'#FF3080' },
      { x:224, w:24, h:20, col:'#2a5a8B', roof:'#102e5c', win:'#A0E8FF', awn:'#10A0FF' },
    ];
    const totalW = 250;

    for (let rep = -1; rep <= 1; rep++) {
      const base = off + rep * totalW;
      B.forEach(b => {
        const bx = Math.round(b.x + base);
        const by = GY - b.h;

        ctx.fillStyle = b.col;
        ctx.fillRect(bx, by, b.w, b.h);
        ctx.fillStyle = '#00000022';
        ctx.fillRect(bx + b.w - 3, by, 3, b.h);
        ctx.fillStyle = '#ffffff14';
        ctx.fillRect(bx, by, b.w, 1);
        ctx.fillRect(bx, by, 1, b.h);

        // roof
        ctx.fillStyle = b.roof;
        ctx.fillRect(bx, by, b.w, 3);

        // awning
        ctx.fillStyle = b.awn;
        ctx.fillRect(bx+2, GY-7, b.w-4, 3);
        ctx.fillStyle = '#ffffff44';
        for (let sx = bx+3; sx < bx+b.w-4; sx += 4) ctx.fillRect(sx, GY-7, 2, 3);

        // windows
        ctx.fillStyle = b.win;
        for (let wx = bx+3; wx < bx+b.w-5; wx += 6) {
          for (let wy = by+4; wy < by+b.h-8; wy += 7) {
            ctx.fillRect(wx, wy, 4, 4);
            ctx.fillStyle = b.col;
            ctx.fillRect(wx+1, wy+1, 2, 1);
            ctx.fillStyle = b.win;
          }
        }

        // door
        ctx.fillStyle = '#180800';
        const dx = bx + (b.w >> 1) - 2;
        ctx.fillRect(dx, GY-7, 4, 7);
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(dx+3, GY-4, 1, 1);
      });
    }
  }

  /* ── GROUND ── */
  _ground() {
    const { W, H, GY } = this;
    const ctx = this.ctx;
    this._px(0, GY,   W, H-GY, '#1a4010');
    this._px(0, GY,   W, 2,    '#0e2808');
    this._px(0, GY+2, W, 4,    '#2a5818');
    this._px(0, GY+2, W, 2,    '#3a6820');

    ctx.fillStyle = '#c8a000';
    const dashOff = ((Math.round(this.marketScroll * .45) % 14) + 14) % 14;
    for (let x = -14 + dashOff; x < W + 14; x += 14)
      ctx.fillRect(Math.round(x), GY+4, 8, 2);
  }

  /* ── STALLS ── */
  _stalls() {
    const { W, GY } = this;
    const ctx = this.ctx;
    ctx.textBaseline = 'bottom';
    ctx.textAlign    = 'center';

    const prevX = this.isRTL ? W-14 : 14;
    const nextX = this.isRTL ? 14    : W-14;

    ctx.globalAlpha = 0.25;
    ctx.font = '11px serif';
    ctx.fillText(this.prevEmoji, prevX, GY-1);
    ctx.globalAlpha = 1;

    ctx.font = '13px serif';
    ctx.fillText(this.vendor.emoji || '🏪', nextX, GY-1);

    ctx.font = '3px "Press Start 2P", monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(this.vendor.name || '', nextX, GY+9);
  }

  /* ── CHARACTER ── */
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

    const lL  = frame === 0;
    const llX = lL ?  2 : -2,  llY = lL ? -2 : 0;
    const rlX = lL ? -2 :  2,  rlY = lL ?  0 : -2;
    const laX = lL ? -2 :  2;
    const raX = lL ?  2 : -2;
    const hob = (this.phase === 'walk') ? (lL ? -1 : 0) : 0;

    // shadow
    p(-6, -1, 12, 2, '#000000', 0.13);

    // BACK LEG
    p(-3+llX, -13+llY, 4, 8, '#FFCB9A');
    p(-3+llX,  -6+llY, 4, 3, '#f0f0f0');
    p(-4+llX,  -4+llY, 5, 4, '#C8102E');
    p(-4+llX,   0+llY, 5, 1, '#8B0010');

    // BACK ARM
    p(-6+laX, -27, 3, 10, '#FFCB9A');
    p(-7+laX, -19, 5,  4, '#f9c060');

    // SKIRT
    p(-6, -20, 13, 6, '#E83E8C');
    p(-7, -15, 15, 5, '#D02878');
    p(-5, -19, 11, 2, '#FF80C0', 0.3);
    p(-4, -17, 2, 2, '#FF99CC', 0.65);
    p(-1, -16, 2, 2, '#FF99CC', 0.65);
    p( 2, -17, 2, 2, '#FF99CC', 0.65);

    // TORSO
    p(-4, -31, 9, 12, '#E83E8C');
    p(-3, -30, 7,  2, '#FF80C0', 0.25);
    // V-neck
    p(-2, -31, 5, 4, '#FFF8EC');
    p(-1, -28, 3, 3, '#FFF8EC');
    p( 0, -26, 1, 2, '#FFF8EC');
    // stars
    p(-3, -25, 1, 4, '#FFD700'); p(-4, -24, 3, 1, '#FFD700');
    p( 3, -25, 1, 4, '#FFD700'); p( 2, -24, 3, 1, '#FFD700');

    // FRONT ARM + BASKET
    p(3+raX, -29, 3, 10, '#FFCB9A');
    p(1+raX, -22, 9,  9, '#D4A017');
    p(1+raX, -23, 9,  2, '#8B6010');
    p(1+raX, -14, 9,  1, '#8B6010');
    ctx.fillStyle = '#8B601055';
    for (let bx = 2+raX; bx < 9+raX; bx += 3) ctx.fillRect(bx, -22, 1, 9);
    for (let by = -20; by < -14; by += 3)      ctx.fillRect(1+raX, by, 9, 1);
    p(3+raX, -27, 1, 3, '#8B6010');
    p(7+raX, -27, 1, 3, '#8B6010');
    p(4+raX, -28, 3, 1, '#8B6010');
    p(3+raX, -19, 3, 3, '#E82020');
    p(6+raX, -19, 3, 3, '#FFD020');

    // FRONT LEG
    p(0+rlX, -13+rlY, 4, 8, '#F5B870');
    p(0+rlX,  -6+rlY, 4, 3, '#f0f0f0');
    p(-1+rlX, -4+rlY, 5, 4, '#C8102E');
    p(-1+rlX,  0+rlY, 5, 1, '#8B0010');

    // HEAD
    const hy = hob;
    p(-5, -44+hy, 11, 14, '#5C3018');         // hair back
    p( 5, -46+hy,  4, 13, '#5C3018');         // ponytail
    p( 6, -45+hy,  3, 10, '#7A4A28');
    p( 4, -48+hy,  6,  4, '#5C3018');         // ponytail root
    p( 4, -49+hy,  6,  4, '#E83E8C');         // ribbon
    p( 5, -48+hy,  4,  2, '#FF99CC');
    p( 6, -48+hy,  1,  1, '#ffffff');

    p(-4, -42+hy, 10, 13, '#FFCB9A');         // face
    p(-5, -44+hy, 11,  3, '#3A1A08');         // fringe
    p(-6, -41+hy,  2,  8, '#5C3018');         // side L
    p( 4, -41+hy,  2,  8, '#5C3018');         // side R

    p(-4, -37+hy, 4, 1, '#3A1A08');           // eyebrow L
    p( 1, -37+hy, 4, 1, '#3A1A08');           // eyebrow R

    // LEFT EYE
    p(-4, -36+hy, 4, 6, '#ffffff');
    p(-4, -35+hy, 4, 4, '#5040B8');
    p(-3, -34+hy, 2, 2, '#18084a');
    p(-4, -35+hy, 2, 2, '#ffffff');
    p(-5, -37+hy, 5, 1, '#2a1008');
    p(-6, -37+hy, 1, 2, '#2a1008');
    p( 0, -37+hy, 1, 2, '#2a1008');
    p(-4, -31+hy, 4, 1, '#c9a060');           // lower lid

    // RIGHT EYE
    p(1, -36+hy, 4, 6, '#ffffff');
    p(1, -35+hy, 4, 4, '#5040B8');
    p(2, -34+hy, 2, 2, '#18084a');
    p(1, -35+hy, 2, 2, '#ffffff');
    p(0, -37+hy, 5, 1, '#2a1008');
    p(-1,-37+hy, 1, 2, '#2a1008');
    p(5, -37+hy, 1, 2, '#2a1008');
    p(1, -31+hy, 4, 1, '#c9a060');

    p(-1, -29+hy, 3, 1, '#c98b3a');           // nose
    p(-3, -27+hy, 7, 1, '#c0614a');           // smile
    p(-4, -28+hy, 1, 1, '#c0614a');
    p( 3, -28+hy, 1, 1, '#c0614a');
    p(-2, -27+hy, 5, 1, '#ffffff88');         // teeth

    p(-5, -31+hy, 3, 3, '#f0a070', 0.3);     // cheek L
    p( 2, -31+hy, 3, 3, '#f0a070', 0.3);     // cheek R

    ctx.restore();
  }

  /* ── EXCLAMATION ── */
  _exclamation() {
    const ctx = this.ctx;
    const cx  = Math.round(this.charX) + (this.isRTL ? 8 : -8);
    const cy  = this.GY - 52;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(this.excScale, this.excScale);
    this._px(-5, -10, 10, 12, '#FFD700');
    this._px(-4,  -9,  8, 10, '#000000');
    this._px(-1,  -8,  3,  5, '#FFD700');
    this._px(-1,  -2,  3,  3, '#FFD700');
    this._px(-1,  -7,  1,  2, '#FFF080', 0.7);
    ctx.restore();
  }
}

window.PixelWalk = PixelWalk;
