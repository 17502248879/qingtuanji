import { kv } from './kvStorage';
import { setCustomItems } from './homeLayout';
import { normalizeCustom, normalizeOne, CUSTOM_LIMIT } from './customWidgetCore';
import type { CustomId, CustomWidget } from './customWidgetCore';

/** 自己做的组件存在设定里（整机备份一起带）；{{图片}} 那张图存在图片库（customImageSlot）。 */
export const CUSTOM_KEY = 'qingtuan_custom_widgets_v1';
export const CUSTOM_EVENT = 'qingtuan:custom-widgets';
export const customImageSlot = (id: string) => `qingtuan_custom_widget_${id}`;
export const CUSTOM_IMAGE_PREFIX = 'qingtuan_custom_widget_';

export function readCustomWidgets(): CustomWidget[] {
  try { return normalizeCustom(JSON.parse(kv.getItem(CUSTOM_KEY) || '[]')); } catch { return []; }
}
/** 让主画面的格子认得这些组件（名字、大小）。读排法之前要先叫一次。 */
export function syncCustomItems(list = readCustomWidgets()) { setCustomItems(list.map(item => ({ id: item.id, name: item.name, w: item.w, h: item.h }))); }

function save(list: CustomWidget[]) {
  const clean = normalizeCustom(list);
  kv.setItem(CUSTOM_KEY, JSON.stringify(clean));
  syncCustomItems(clean);
  window.dispatchEvent(new CustomEvent(CUSTOM_EVENT));
  return clean;
}
/** 新增或改好一个（同一个 id 就是改）。 */
export function putCustomWidget(widget: CustomWidget) {
  const list = readCustomWidgets(), clean = normalizeOne(widget, widget.id);
  if (!clean) throw new Error('这个组件读不懂');
  const at = list.findIndex(item => item.id === clean.id);
  if (at < 0 && list.length >= CUSTOM_LIMIT) throw new Error(`最多做 ${CUSTOM_LIMIT} 个，先删掉不用的`);
  if (at < 0) list.push(clean); else list[at] = clean;
  return save(list);
}
export function deleteCustomWidget(id: CustomId) { return save(readCustomWidgets().filter(item => item.id !== id)); }
/** 每个组件都改一下（素材改名时用）。 */
export function rewriteCustomWidgets(change: (widget: CustomWidget) => CustomWidget) {
  const list = readCustomWidgets();
  if (list.length) save(list.map(change));
}
