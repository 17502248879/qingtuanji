/**
 * 自己做的组件（纯文字处理，不碰画面，可以单独测）：资料整理、CSS 加范围、会变的字、示例。
 * 画到画面上（HTML 过滤、换图）在 customWidgetRender.ts；存取在 customWidgets.ts。
 */
import { scopeCss, scopeSelector } from './chatCssScope.ts';

export type CustomId = `cw_${string}`;
export interface CustomWidget {
  id: CustomId;
  name: string;
  /** 宽几栏、高几列（1～4） */
  w: number; h: number;
  html: string; css: string;
  /** 点了打开：'' 不做事；chat、diary、space、settings、ledger、memos、world、memories、preset；chat:角色 打开那个人的聊天 */
  open: string;
  /** {{他的名字}} 用哪个角色 */
  who: string;
}
export const CUSTOM_LIMIT = 12, HTML_LIMIT = 20000, CSS_LIMIT = 20000;
export const OPEN_APPS: [string, string][] = [['', '不做事'], ['chat', '聊天 Chat'], ['diary', '日记 Diary'], ['space', '空间 Space'], ['settings', '设置 Settings'],
  ['ledger', '记账 Ledger'], ['memos', '备忘录 Memos'], ['world', '世界书 World'], ['memories', '记忆 Memories'], ['preset', '预设 Preset']];

const clamp = (value: unknown, min: number, max: number, fallback: number) => { const number = Math.round(Number(value)); return Number.isFinite(number) ? Math.max(min, Math.min(max, number)) : fallback; };
const validOpen = (value: unknown) => { const text = String(value || ''); return OPEN_APPS.some(([key]) => key === text) || /^chat:[\w:-]{1,80}$/.test(text) ? text : ''; };
export const cleanId = (value: unknown): CustomId | null => { const text = String(value || ''); return /^cw_[a-z0-9]{4,20}$/.test(text) ? text as CustomId : null; };
export const newCustomId = (): CustomId => `cw_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

/** 一个组件读回来：认得的留下，太长的切掉。 */
export function normalizeOne(raw: unknown, id?: CustomId | null): CustomWidget | null {
  if (!raw || typeof raw !== 'object') return null;
  const data = raw as Record<string, unknown>, key = id ?? cleanId(data.id);
  if (!key) return null;
  return {
    id: key, name: String(data.name || '').replace(/\s+/g, ' ').trim().slice(0, 12) || '我的组件',
    w: clamp(data.w, 1, 4, 2), h: clamp(data.h, 1, 4, 2),
    html: String(data.html || '').slice(0, HTML_LIMIT), css: String(data.css || '').slice(0, CSS_LIMIT),
    open: validOpen(data.open), who: String(data.who || '').slice(0, 80)
  };
}
export function normalizeCustom(raw: unknown): CustomWidget[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>(), out: CustomWidget[] = [];
  for (const item of raw) { const widget = normalizeOne(item); if (widget && !seen.has(widget.id) && out.length < CUSTOM_LIMIT) { seen.add(widget.id); out.push(widget); } }
  return out;
}

/* ---------- CSS：只套在这个组件里面 ---------- */
/** 组件最外面那层：data-cw 是组件的 id（预览用 preview）。 */
export const customScope = (id: string) => `#main-content .home-cw[data-cw="${id}"]`;
const ROOT = /^(?::root|:host|:scope|html|body|\.home-cw)(?![\w-])/i;
/**
 * 检查、加范围（跟美化 CSS 同一套检查：不能连外面的网址、写错说第几行）。
 * 整个组件不让藏起来（藏了就找不到它）；@keyframes 的名字前面加上组件 id，不会盖到小手机原本的动画。
 */
export function scopeCustomCss(source: string, id: string) {
  const scope = customScope(id);
  const guarded = (selector: string) => !/::?(before|after)\b/i.test(selector) && scopeSelector(selector, '@', ROOT) === '@';
  let css = scopeCss(source, { scope, root: ROOT, guarded });
  const names = [...new Set([...css.matchAll(/@(?:-webkit-)?keyframes\s+([\w-]+)/g)].map(match => match[1]))];
  if (names.length) {
    const prefix = `${id}-`, pattern = new RegExp(`(?<![\\w-])(${names.map(name => name.replace(/[-]/g, '\\-')).join('|')})(?![\\w-])`, 'g');
    css = css.replace(/(@(?:-webkit-)?keyframes\s+)([\w-]+)/g, (_, head: string, name: string) => head + prefix + name)
      .replace(/(animation(?:-name)?\s*:)([^;}]*)/gi, (_, head: string, value: string) => head + value.replace(pattern, name => prefix + name));
  }
  return css;
}

/* ---------- 会变的字 ---------- */
const WEEK = '日一二三四五六', DAY = 86400000;
const pad = (value: number) => String(value).padStart(2, '0');
const midnight = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
/** 写法：2026-12-07（那一天）或 12-07（每年这天）。 */
function parseDay(text: string, now: Date): { at: number; yearly: boolean } | null {
  const full = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/), yearly = text.match(/^(\d{1,2})-(\d{1,2})$/);
  if (full) { const date = new Date(+full[1], +full[2] - 1, +full[3]); return date.getMonth() === +full[2] - 1 ? { at: date.getTime(), yearly: false } : null; }
  if (yearly) { const date = new Date(now.getFullYear(), +yearly[1] - 1, +yearly[2]); return date.getMonth() === +yearly[1] - 1 ? { at: date.getTime(), yearly: true } : null; }
  return null;
}
export interface VarContext { now: Date; his: string; mine: string }
/** 一个 {{…}} 换成什么；认不得的回传 null（原样留着）。{{图片}} 另外处理。 */
export function varValue(name: string, context: VarContext): string | null {
  const { now } = context, [key, arg = ''] = name.split(/[:：]/).map(part => part.trim());
  switch (key) {
    case '时间': return `${pad(now.getHours())}:${pad(now.getMinutes())}`;
    case '日期': return `${now.getMonth() + 1}月${now.getDate()}日`;
    case '星期': return `星期${WEEK[now.getDay()]}`;
    case '年': return String(now.getFullYear());
    case '月': return String(now.getMonth() + 1);
    case '日': return String(now.getDate());
    case '他的名字': return context.his || '他';
    case '我的名字': return context.mine || '我';
    case '天数': { const day = parseDay(arg, now); return day && !day.yearly ? String(Math.max(0, Math.round((midnight(now) - day.at) / DAY))) : null; }
    case '倒数': {
      const day = parseDay(arg, now); if (!day) return null;
      let at = day.at; const today = midnight(now);
      if (day.yearly && at < today) { const next = new Date(at); next.setFullYear(now.getFullYear() + 1); at = next.getTime(); }
      return String(Math.max(0, Math.round((at - today) / DAY)));
    }
    default: return null;
  }
}
export const VAR_PATTERN = /\{\{\s*([^{}]{1,40}?)\s*\}\}/g;
/** 文字里的 {{…}} 都换掉（{{图片}} 不换，由画面那边处理）。 */
export function fillVars(text: string, context: VarContext) {
  return text.replace(VAR_PATTERN, (whole, name: string) => name.trim() === '图片' ? whole : varValue(name, context) ?? whole);
}
/** 这段有没有会跟着时间变的字（有的话每半分钟重画一次）。 */
export const usesClock = (html: string) => /\{\{\s*(时间|日期|星期|年|月|日|天数|倒数)/.test(html);

/** 用到的素材名字（CSS 的 url(asset:名字)、HTML 的 src="asset:名字" 都算）。 */
export function assetNames(text: string) { return [...new Set([...String(text || '').matchAll(/asset:([\p{L}\p{N}_-]+)/gu)].map(match => match[1]))]; }
export function renameAssetIn(text: string, from: string, to: string) { return text.replace(/asset:([\p{L}\p{N}_-]+)/gu, (whole, name: string) => name === from ? `asset:${to}` : whole); }

/* ---------- 示例 ---------- */
export const CUSTOM_EXAMPLES: { name: string; w: number; h: number; html: string; css: string }[] = [
  { name: '便利贴', w: 2, h: 2, html: `<div class="note">
  <b>备忘</b>
  <p>记得买牛奶 ♡</p>
  <p>周六去看展</p>
  <p>早点睡</p>
</div>`, css: `/* 便利贴：浅浅的主题色，上面一条胶带 */
.note {
  position: absolute;
  inset: 10px 8px 6px;
  padding: 22px 12px 10px;
  background: color-mix(in srgb, var(--theme-color) 22%, #fffdf3);
  box-shadow: var(--win-drop);
  transform: rotate(-2deg);
  color: var(--win-ink);
  font-size: 12px;
  line-height: 1.7;
}
.note::before {
  content: '';
  position: absolute;
  left: 50%;
  top: -7px;
  width: 54px;
  height: 16px;
  margin-left: -27px;
  background: color-mix(in srgb, var(--color-accent) 70%, transparent);
  transform: rotate(3deg);
}
.note b { display: block; margin-bottom: 4px; color: var(--color-accent-strong); font-size: 13px; }
.note p { margin: 0; }` },
  { name: '倒数日', w: 2, h: 2, html: `<div class="box">
  <div class="bar">countdown.exe</div>
  <div class="n">{{倒数:12-25}}</div>
  <div class="t">距离 圣诞节 还有 {{倒数:12-25}} 天</div>
</div>`, css: `/* 倒数日：跟主画面的小窗同一个样子 */
.box {
  position: absolute;
  inset: 10px 6px 6px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--win-deep);
  border-radius: 4px;
  background: var(--color-surface);
  box-shadow: var(--win-drop);
  text-align: center;
}
.bar { height: 17px; background: var(--win-bar); color: var(--win-ink); font-size: 9.5px; font-weight: 700; line-height: 17px; letter-spacing: .4px; }
.n { flex: 1; display: grid; place-items: center; color: var(--color-accent-strong); font-size: 40px; font-weight: 700; line-height: 1; }
.t { padding-bottom: 9px; color: var(--color-muted); font-size: 10px; }` },
  { name: '时钟', w: 4, h: 1, html: `<div class="clock">
  <b>{{时间}}</b>
  <span>{{日期}}<br>{{星期}}</span>
</div>`, css: `/* 时钟：大大的时间，右边日期和星期 */
.clock {
  position: absolute;
  inset: 12px 0 8px;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 0 14px;
  border-bottom: 1px dashed var(--color-muted);
}
.clock b { color: var(--color-accent-strong); font-size: 38px; font-weight: 400; letter-spacing: 1px; }
.clock span { color: var(--win-ink); font-size: 11px; line-height: 1.5; text-align: right; }` },
  { name: '相框', w: 2, h: 2, html: `<div class="frame">
  <img src="{{图片}}" alt="">
  <span>和{{他的名字}}的第 {{天数:2025-01-01}} 天</span>
</div>`, css: `/* 相框：点照片就能换（写 {{图片}} 的地方） */
.frame {
  position: absolute;
  inset: 8px 10px 4px;
  padding: 7px 7px 0;
  background: var(--color-surface);
  box-shadow: var(--win-drop), inset 0 0 0 1px var(--win-shade);
  transform: rotate(1.5deg);
  text-align: center;
}
.frame img { display: block; width: 100%; height: 118px; object-fit: cover; background: var(--win-face); }
.frame span { display: block; padding: 6px 0; color: var(--win-ink); font-size: 10px; }` }
];
