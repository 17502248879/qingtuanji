import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import './HomeCustom.css';
import { CSS_ASSETS_EVENT, loadCssAssets, resolveAssets } from '../../../utils/cssAssets';
import type { CssAssetInfo } from '../../../utils/cssAssets';
import { prepareImage, readImageSlot, saveImageSlots } from '../../../utils/imageAssets';
import { CUSTOM_EXAMPLES, OPEN_APPS, scopeCustomCss, usesClock } from '../../../utils/customWidgetCore';
import type { CustomWidget } from '../../../utils/customWidgetCore';
import { renderCustomHtml } from '../../../utils/customWidgetRender';
import { CUSTOM_EVENT, customImageSlot, readCustomWidgets } from '../../../utils/customWidgets';
import { downloadFile, exportCustom } from '../../../utils/customWidgetFile';
import { helloPeople } from '../../../utils/helloWriter';
import { readMe } from '../../../utils/meStorage';
import { subscribeCatalog } from '../../../utils/catalogStorage';
import { showToast } from '../../../utils/toast';
import { useChoice } from '../../../providers/ChoiceProvider';
import { AssetPicker } from '../../Settings/Appearance/CssWindow';

/**
 * 自己写 HTML、CSS 做的组件：画在主画面上（CustomWidgetView）、编辑窗（CustomWidgetEditor）。
 * 会变的字每半分钟换一次；写 {{图片}} 的地方点了就能换照片；「点了打开」照设定打开 App 或聊天。
 */
const readPhotos = (list: CustomWidget[]) => Object.fromEntries(list.map(item => { try { return [item.id, readImageSlot(customImageSlot(item.id))]; } catch { return [item.id, '']; } })) as Record<string, string>;
/** 全部自己做的组件和它们的照片（有变动就重读）。 */
export function useCustomWidgets() {
  const [state, setState] = useState(() => { const list = readCustomWidgets(); return { list, photos: readPhotos(list) }; });
  useEffect(() => {
    const sync = () => { const list = readCustomWidgets(); setState({ list, photos: readPhotos(list) }); };
    window.addEventListener(CUSTOM_EVENT, sync); return () => window.removeEventListener(CUSTOM_EVENT, sync);
  }, []);
  return state;
}

/** 点了打开：App 照主画面图标、底下那排的按法开；聊天用开消息小窗那一套（没指定人就开聊天列表）。 */
export function openTarget(open: string) {
  if (!open) return;
  if (open === 'chat' || open.startsWith('chat:')) { window.dispatchEvent(new CustomEvent('qingtuan:open-notice-chat', { detail: open.startsWith('chat:') ? open.slice(5) : undefined })); return; }
  if (open === 'diary') { window.dispatchEvent(new CustomEvent('qingtuan:open-diary')); return; }
  if (open === 'memories') { window.dispatchEvent(new CustomEvent('qingtuan:open-memories')); return; }
  const target = document.querySelector<HTMLElement>(open === 'space' || open === 'settings' ? `[data-dock-icon-key="${open}"]` : `.app-item[data-app-icon-key="${open}"]`);
  target?.click();
}

/** 素材有变动时重画（图片网址会换）。 */
function useAssetsVersion() {
  const [version, setVersion] = useState(0);
  useEffect(() => { const bump = () => setVersion(value => value + 1); void loadCssAssets().then(bump); window.addEventListener(CSS_ASSETS_EVENT, bump); return () => window.removeEventListener(CSS_ASSETS_EVENT, bump); }, []);
  return version;
}
/** 半分钟一次（只有用到时间、日期这类字的才需要）。 */
function useTick(on: boolean) {
  const [tick, setTick] = useState(0);
  useEffect(() => { if (!on) return; const timer = window.setInterval(() => setTick(value => value + 1), 30000); return () => window.clearInterval(timer); }, [on]);
  return tick;
}
/** {{他的名字}}：角色资料改了才重读。 */
function useHisName(who: string) {
  const [catalog, setCatalog] = useState(0);
  useEffect(() => subscribeCatalog(() => setCatalog(value => value + 1)), []);
  return useMemo(() => { if (!who) return ''; try { return helloPeople().find(item => item.key === who)?.name || ''; } catch { return ''; } }, [who, catalog]);
}

/** 画一个自己做的组件。scope：CSS 加范围用的名字（主画面用组件 id，预览用 preview）。 */
export function CustomWidgetView({ widget, photo, scope, onPhoto }: { widget: CustomWidget; photo: string; scope: string; onPhoto?: () => void }) {
  const assets = useAssetsVersion(), tick = useTick(usesClock(widget.html)), his = useHisName(widget.who);
  const css = useMemo(() => {
    try { return resolveAssets(scopeCustomCss(widget.css, scope)); } catch { return ''; }
  }, [widget.css, scope, assets]);
  const html = useMemo(() => renderCustomHtml(widget.html, { now: new Date(), his, mine: String(readMe().name || ''), photo }), [widget.html, his, photo, assets, tick]);
  const style = { '--cw-photo': photo ? `url("${photo.replace(/"/g, '%22')}")` : 'none' } as CSSProperties;
  return <div className="home-cw" data-cw={scope} style={style} onClick={event => {
    const target = event.target as Element;
    if (onPhoto && target.closest('[data-cw-photo]')) { event.stopPropagation(); onPhoto(); return; }
    if (widget.open && scope !== 'preview') { event.stopPropagation(); openTarget(widget.open); }
  }}>
    {css && <style>{css}</style>}
    <div className="home-cw-body" dangerouslySetInnerHTML={{ __html: html }} />
  </div>;
}

/** 主画面上的那个（写 {{图片}} 的地方点了就选照片，马上存）。 */
export function HomeCustomWidget({ widget, photo }: { widget: CustomWidget; photo: string }) {
  const input = useRef<HTMLInputElement>(null);
  async function pick(file?: File) {
    if (!file) return;
    try { await saveImageSlots({ [customImageSlot(widget.id)]: await prepareImage(file, 640, .88) }); window.dispatchEvent(new CustomEvent(CUSTOM_EVENT)); showToast('照片换好了'); }
    catch (error) { showToast((error as Error).message || '照片没存成'); }
  }
  return <>
    <CustomWidgetView widget={widget} photo={photo} scope={widget.id} onPhoto={() => { if (input.current) { input.current.value = ''; input.current.click(); } }} />
    <input ref={input} type="file" accept="image/*" hidden onChange={event => void pick(event.currentTarget.files?.[0])} />
  </>;
}

const CHEVRON = (open: boolean) => <svg viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true"><path d={open ? 'M1 5l4-4 4 4' : 'M1 1l4 4 4-4'} /></svg>;
const today = () => { const now = new Date(); return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`; };
/** 会变的字：[按钮上的字, 插进 HTML 的写法, 插进 CSS 的写法, 插进去后的提示] */
const VARS: [string, string, string, string][] = [
  ['时间', '{{时间}}', '', ''], ['日期', '{{日期}}', '', ''], ['星期', '{{星期}}', '', ''],
  ['他的名字', '{{他的名字}}', '', '上面「他的名字」选是哪个角色'], ['我的名字', '{{我的名字}}', '', ''],
  ['在一起天数', `{{天数:${today()}}}`, '', '把日期改成在一起那天（年-月-日）'],
  ['倒数', '{{倒数:12-25}}', '', '改成要倒数的日子：月-日 每年都算，年-月-日 只算那一天'],
  ['图片', '<img src="{{图片}}" alt="">', 'var(--cw-photo)', '在主画面点这张图就能换照片']
];

/** 编辑窗：上面预览，下面名字、大小、点了打开、他的名字、照片、示例、会变的字、HTML / CSS。按「好了」才存。 */
export function CustomWidgetEditor({ initial, isNew, onSave, onCancel, onDelete }: {
  initial: CustomWidget; isNew: boolean; onSave: (widget: CustomWidget) => void; onCancel: () => void; onDelete: () => void;
}) {
  const choice = useChoice();
  const [draft, setDraft] = useState(initial), [tab, setTab] = useState<'html' | 'css'>('html'), [picking, setPicking] = useState<'' | 'open' | 'who'>('');
  const [photo, setPhoto] = useState(() => { try { return readImageSlot(customImageSlot(initial.id)); } catch { return ''; } });
  const code = useRef<HTMLTextAreaElement>(null), photoInput = useRef<HTMLInputElement>(null), stage = useRef<HTMLDivElement>(null), [box, setBox] = useState({ w: 330, h: 130 });
  const people = useMemo(() => { try { return helloPeople(); } catch { return []; } }, []);
  const set = (patch: Partial<CustomWidget>) => setDraft(current => ({ ...current, ...patch }));
  /** CSS 写错了：说第几行，「好了」先不能按。 */
  const error = useMemo(() => { try { scopeCustomCss(draft.css, 'preview'); return ''; } catch (problem) { return (problem as Error).message; } }, [draft.css]);
  useEffect(() => {
    const key = (event: KeyboardEvent) => { if (event.key === 'Escape' && !document.querySelector('#viChoiceModal.open')) { event.stopImmediatePropagation(); onCancel(); } };
    window.addEventListener('keydown', key, true); return () => window.removeEventListener('keydown', key, true);
  }, [onCancel]);
  useEffect(() => { const node = stage.current; if (node) setBox({ w: node.clientWidth, h: node.clientHeight }); }, []);

  /** 插在游标的位置（换到对的分页）。 */
  function insert(html: string, css: string, tip = '') {
    const field: 'html' | 'css' = css && tab === 'css' ? 'css' : 'html', text = field === 'css' ? css : html;
    if (!text) return;
    if (field !== tab) setTab(field);
    const area = code.current, value = draft[field], at = area && field === tab ? area.selectionStart : value.length, end = area && field === tab ? area.selectionEnd : value.length;
    set({ [field]: value.slice(0, at) + text + value.slice(end) });
    window.requestAnimationFrame(() => { const next = code.current; if (next) { next.focus(); next.setSelectionRange(at + text.length, at + text.length); } });
    if (tip) showToast(tip);
  }
  function assets() {
    choice.openChoice({ style: 'settings', title: '美化素材', options: [], selected: '', confirmText: '好了', confirm: () => {},
      content: <AssetPicker key={Date.now()} where="widget" pick={(item: CssAssetInfo) => { choice.close(); insert(`<img src="asset:${item.name}" alt="">`, `url(asset:${item.name})`); }} menu={() => showToast('改名、删除素材请到美化设置')} /> });
  }
  async function pickPhoto(file?: File) {
    if (!file) return;
    try { const data = await prepareImage(file, 640, .88); await saveImageSlots({ [customImageSlot(draft.id)]: data }); setPhoto(data); window.dispatchEvent(new CustomEvent(CUSTOM_EVENT)); }
    catch (problem) { showToast((problem as Error).message || '照片没存成'); }
  }
  async function clearPhoto() { try { await saveImageSlots({ [customImageSlot(draft.id)]: '' }); setPhoto(''); window.dispatchEvent(new CustomEvent(CUSTOM_EVENT)); } catch { showToast('照片拿不掉，等一下再试'); } }
  function applyExample(example: typeof CUSTOM_EXAMPLES[number]) {
    set({ html: example.html, css: example.css, w: example.w, h: example.h, ...(draft.name === '我的组件' || CUSTOM_EXAMPLES.some(item => item.name === draft.name) ? { name: example.name } : {}) });
    showToast(`换成「${example.name}」了，按 × 可以不存`);
  }
  function remove() {
    choice.openChoice({ style: 'settings', title: '删掉这个组件', options: [], selected: '', confirmText: '删掉', content: <p className="choice-message">{`删掉「${initial.name}」？主画面上的也会拿掉，删了就找不回来。`}</p>, confirm: () => { onDelete(); } });
  }
  async function exportIt() {
    try { const result = await exportCustom(draft); downloadFile(result.blob, result.fileName); showToast('导出了'); } catch (problem) { showToast((problem as Error).message || '没导出成'); }
  }

  const width = draft.w * 82.5, height = draft.h * 88, scale = Math.min(1, (box.w - 12) / width, (box.h - 12) / height);
  const openLabel = draft.open.startsWith('chat:') ? `${people.find(item => item.key === draft.open.slice(5))?.name || '某人'} 的聊天` : OPEN_APPS.find(([key]) => key === draft.open)?.[1] || '不做事';
  const whoLabel = people.find(item => item.key === draft.who)?.name || '没选';
  const options: [string, string][] = picking === 'open' ? [...OPEN_APPS, ...people.map(item => [`chat:${item.key}`, `${item.name} 的聊天`] as [string, string])] : [['', '没选'], ...people.map(item => [item.key, item.name] as [string, string])];
  const seg = (key: 'w' | 'h') => <span className="home-cw-seg" role="radiogroup" aria-label={key === 'w' ? '宽' : '高'}>{[1, 2, 3, 4].map(size => <button type="button" role="radio" aria-checked={draft[key] === size} key={size} className={draft[key] === size ? 'is-on' : ''} onClick={() => set({ [key]: size })}>{size}</button>)}</span>;
  const pick = (kind: 'open' | 'who', label: string) => <div className="home-widget-pick">
    <button type="button" className="home-widget-pick-btn" aria-haspopup="listbox" aria-expanded={picking === kind} onClick={() => setPicking(current => current === kind ? '' : kind)}><span>{label}</span>{CHEVRON(picking === kind)}</button>
    {picking === kind && <div className="home-widget-pick-list" role="listbox">{options.map(([key, name]) => <button type="button" role="option" aria-selected={(kind === 'open' ? draft.open : draft.who) === key} key={key || 'none'} className={(kind === 'open' ? draft.open : draft.who) === key ? 'is-on' : ''}
      onClick={() => { setPicking(''); set(kind === 'open' ? { open: key } : { who: key }); }}>{name}</button>)}</div>}
  </div>;

  return <div className="home-cw-editor" role="dialog" aria-label={isNew ? '自己做组件' : `改「${initial.name}」`} onPointerDown={event => event.stopPropagation()} onClick={event => event.stopPropagation()}>
    <div className="home-edit-sheet-head"><span>{isNew ? '自己做组件' : `改「${initial.name}」`}</span><button type="button" aria-label="不存，关掉" onClick={onCancel}>×</button></div>
    <div className="home-cw-editor-body">
      <div className="home-cw-preview" ref={stage}>
        <span className="home-cw-preview-tag">{`预览 · ${draft.w}×${draft.h}${scale < 1 ? ` · 缩到 ${Math.round(scale * 100)}%` : ''}`}</span>
        <div className="home-cw-stage" style={{ width, height, transform: `translate(-50%, -50%) scale(${scale})` }}>
          <CustomWidgetView widget={draft} photo={photo} scope="preview" />
        </div>
      </div>
      <label className="home-widget-field"><span>名字</span><input type="text" value={draft.name} maxLength={12} onChange={event => set({ name: event.currentTarget.value })} /></label>
      <div className="home-widget-field"><span>大小</span>{seg('w')}<em className="home-cw-times">×</em>{seg('h')}</div>
      <div className="home-widget-field"><span>点了打开</span>{pick('open', openLabel)}</div>
      <div className="home-widget-field"><span>他的名字</span>{pick('who', whoLabel)}</div>
      <div className="home-widget-field"><span>照片</span>
        <i className={'home-cw-photo' + (photo ? '' : ' is-empty')} style={photo ? { backgroundImage: `url("${photo}")` } : undefined} />
        <button type="button" className="home-edit-btn" onClick={() => { if (photoInput.current) { photoInput.current.value = ''; photoInput.current.click(); } }}>{photo ? '换一张' : '选照片'}</button>
        {photo && <button type="button" className="home-edit-btn" onClick={() => void clearPhoto()}>拿掉</button>}
        <input ref={photoInput} type="file" accept="image/*" hidden onChange={event => void pickPhoto(event.currentTarget.files?.[0])} />
      </div>
      <div className="home-cw-chips"><span>示例</span>{CUSTOM_EXAMPLES.map(example => <button type="button" key={example.name} onClick={() => applyExample(example)}>{example.name}</button>)}</div>
      <div className="home-cw-chips"><span>会变的字</span>{VARS.map(([label, html, css, tip]) => <button type="button" key={label} onClick={() => insert(html, css, tip)}>{label}</button>)}</div>
      <div className="home-cw-tabs" role="tablist">
        {(['html', 'css'] as const).map(name => <button type="button" role="tab" aria-selected={tab === name} key={name} className={tab === name ? 'is-on' : ''} onClick={() => setTab(name)}>{name.toUpperCase()}</button>)}
        <span className="home-cw-tabs-gap" />
        <button type="button" className="home-edit-btn home-cw-assets" onClick={assets}>素材</button>
      </div>
      <textarea ref={code} className="home-cw-code" spellCheck={false} autoCapitalize="off" autoCorrect="off" value={draft[tab]} placeholder={tab === 'html' ? '在这里写 HTML，例如：\n<div class="box">你好</div>' : '在这里写 CSS，例如：\n.box {\n  color: var(--theme-color);\n}'}
        onChange={event => set({ [tab]: event.currentTarget.value })} />
      {error && <p className="home-cw-error">{`CSS ${error}`}</p>}
    </div>
    <div className="home-cw-editor-foot">
      {isNew ? <span /> : <button type="button" className="home-edit-btn" onClick={remove}>删掉这个组件</button>}
      <span className="home-cw-editor-actions">
        <button type="button" className="home-edit-btn" onClick={() => void exportIt()}>导出</button>
        <button type="button" className="home-edit-btn is-done" disabled={!!error} onClick={() => onSave({ ...draft, name: draft.name.trim() || '我的组件' })}>好了</button>
      </span>
    </div>
  </div>;
}
