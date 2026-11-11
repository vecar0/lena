import numpy as np, json
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage as nd
src = Image.open('/home/user/haru/art/new/avatar/cat_pin_5.png').convert('RGB'); a = np.asarray(src).astype(int)
W, H0 = src.size; H = 1064; INK = (45, 45, 45); SS = 3
# 1) 민트 배경 지우기 (가장자리와 이어진 것 + 몸 사이에 갇힌 민트)
mint = (np.abs(a - np.array([146, 235, 197])).sum(2) < 75)
lab, n = nd.label(mint); e = set(lab[0]) | set(lab[-1]) | set(lab[:, 0]) | set(lab[:, -1]); e.discard(0)
sz = nd.sum(mint, lab, range(1, n + 1)); big = {i + 1 for i, v in enumerate(sz) if v > 4000}
mint = np.isin(lab, list(e | big)); mint = nd.binary_dilation(mint, iterations=1)
alpha = np.where(mint, 0, 255).astype('uint8')
im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); rgba = np.dstack([a, alpha]).astype('uint8'); im.paste(Image.fromarray(rgba, 'RGBA'), (0, 0))
px = np.asarray(im).copy(); yy, xx = np.mgrid[0:H, 0:W]
# 2) 전화선 지우기: 선이 지나던 곳은 몸 안이면 흰색, 밖이면 투명 (몸 왼쪽 선은 다시 그림)
def edgeX(y): return np.interp(y, [692, 735, 790, 845], [205, 188, 170, 152])
reg = ((yy >= 692) & (yy < 742) & (xx >= 215) & (xx < 305)) | ((yy >= 742) & (yy < 862) & (xx >= 60) & (xx < 305))
inside = xx > edgeX(yy)
px[reg & inside] = [255, 255, 255, 255]; px[reg & ~inside] = [0, 0, 0, 0]
# 3) 잘린 아래쪽 비우기
px[(yy >= 862) & (xx < 792)] = [0, 0, 0, 0]; px[yy >= 946] = [0, 0, 0, 0]
im = Image.fromarray(px, 'RGBA')
def over(base, fn):
    big = Image.new('RGBA', (W * SS, H * SS), (0, 0, 0, 0)); fn(ImageDraw.Draw(big), SS); base.alpha_composite(big.resize((W, H), Image.LANCZOS)); return base
CX, CY, RX, RY = 478, 846, 327, 146
def bottom(d, s):
    d.pieslice([(CX - RX) * s, (CY - RY) * s, (CX + RX) * s, (CY + RY) * s], 0, 180, fill=(255, 255, 255, 255))
    d.arc([(CX - RX) * s, (CY - RY) * s, (CX + RX) * s, (CY + RY) * s], -4, 184, fill=INK + (255,), width=13 * s)
    d.line([(190 * s, 728 * s), (170 * s, 790 * s), (152 * s, 846 * s)], fill=INK + (255,), width=13 * s, joint='curve')
    d.ellipse([(730) * s, 800 * s, 860 * s, 930 * s], fill=(255, 255, 255, 255))            # 꼬리 뿌리 밑 흰 바탕
whole = over(im.copy(), bottom)
# 꼬리 뿌리 흰 바탕이 선을 덮지 않게 원본 선을 다시 올림
whole.alpha_composite(Image.fromarray(np.where((px[..., :3].sum(2) < 200)[..., None] & (px[..., 3:] > 0), px, 0).astype('uint8'), 'RGBA'))
W8 = np.asarray(whole).copy()
# 4) 층 나누기
def poly(pts, blur=1.0):
    m = Image.new('L', (W, H), 0); ImageDraw.Draw(m).polygon(pts, fill=255); return np.asarray(m.filter(ImageFilter.GaussianBlur(blur))).astype(float) / 255
tailm = poly([(778, 428), (1024, 428), (1024, 950), (772, 950), (748, 770), (736, 716), (762, 700), (852, 560), (792, 452)])
face = np.zeros((H, W), bool); dark = (W8[..., :3].sum(2) < 330) | ((W8[..., 0] > 200) & (W8[..., 1] < 190))
for (cx, cy, rx, ry) in ((345, 410, 44, 46), (557, 437, 44, 46), (447, 495, 66, 78)):
    face |= (((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2 < 1)
facem = face & dark; facem = nd.binary_dilation(facem, iterations=2) & face
mouthm = facem & (((xx - 447) / 66.0) ** 2 + ((yy - 495) / 78.0) ** 2 < 1)
def layer(mask, name, rgb=None):
    o = W8.copy() if rgb is None else rgb.copy(); o[..., 3] = (o[..., 3] * mask).astype('uint8'); Image.fromarray(o, 'RGBA').save(name); return o
body = W8.copy(); body[facem] = [255, 255, 255, 255]
root = (((xx - 790) / 64.0) ** 2 + ((yy - 825) / 112.0) ** 2 < 1) & (W8[..., :3].sum(2) > 600)
bm = np.maximum(1 - tailm, root.astype(float)); layer(bm, 'C_body.png', body); layer(tailm, 'C_arm.png'); layer(facem.astype(float), 'C_head.png')
def eyes_closed(d, s):
    for cx, cy in ((345, 412), (557, 439)): d.arc([(cx - 36) * s, (cy - 30) * s, (cx + 36) * s, (cy + 22) * s], 20, 160, fill=INK + (255,), width=12 * s)
hc = Image.fromarray(layer(mouthm.astype(float), 'C_headc.png'), 'RGBA'); over(hc, eyes_closed).save('C_headc.png')
def foot(cx):
    return lambda d, s: d.ellipse([(cx - 64) * s, 976 * s, (cx + 64) * s, 1046 * s], fill=(255, 255, 255, 255), outline=INK + (255,), width=12 * s)
over(Image.new('RGBA', (W, H), (0, 0, 0, 0)), foot(352)).save('C_legl.png'); over(Image.new('RGBA', (W, H), (0, 0, 0, 0)), foot(598)).save('C_legr.png')
pc = lambda x, y: [round(x / W * 100, 2), round(y / H * 100, 2)]
meta = dict(w=356, h=round(356 * H / W), neck=pc(450, 450), hipL=pc(352, 985), hipR=pc(598, 985), feet=pc(476, 1044), sh=pc(772, 846), top=pc(450, 120), ak=-.18, wave=[-16, 9], wag=5, hk=.5)
json.dump(meta, open('meta.json', 'w')); print(meta)
out = Image.new('RGBA', (W * 2, H), (255, 61, 154, 255))
for n in ('C_legl', 'C_legr', 'C_body', 'C_arm', 'C_head'): out.alpha_composite(Image.open(n + '.png'), (0, 0))
for n, dx, dy in (('C_legl', -30, 30), ('C_legr', 30, 30), ('C_body', 0, 0), ('C_arm', 40, -10), ('C_headc', 0, 0)): out.alpha_composite(Image.open(n + '.png'), (W + dx, dy))
out.convert('RGB').crop((0, 380, 2048, 1064)).resize((1200, 401)).save('chk.jpg', quality=92)
for n in ('head', 'headc', 'body', 'arm', 'legl', 'legr'): Image.open('C_%s.png' % n).resize((meta['w'], meta['h']), Image.LANCZOS).save('%s.webp' % n, quality=92, method=6)
