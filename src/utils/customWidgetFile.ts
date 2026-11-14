import { blobDataUrl, readImageSlot, saveImageSlots } from './imageAssets';
import { packAssets, unpackAssets } from './cssAssets';
import { assetNames, newCustomId, normalizeOne, renameAssetIn } from './customWidgetCore';
import type { CustomWidget } from './customWidgetCore';
import { customImageSlot, putCustomWidget } from './customWidgets';

/**
 * 自己做的组件导出、导入：一个 .json 文件，{{图片}} 那张照片、用到的美化素材都打包在里面。
 * 「打开某个人的聊天」换成打开聊天（别人那边没有这个人）；{{他的名字}} 用哪个角色不带。
 */
interface WidgetFile { app: 'qingtuan-widget'; version: 1; widget: Omit<CustomWidget, 'id' | 'who'>; photo?: string; assets?: Record<string, string> }

export async function exportCustom(widget: CustomWidget) {
  const file: WidgetFile = { app: 'qingtuan-widget', version: 1, widget: { name: widget.name, w: widget.w, h: widget.h, html: widget.html, css: widget.css, open: widget.open.startsWith('chat:') ? 'chat' : widget.open } };
  try { const photo = readImageSlot(customImageSlot(widget.id)); if (photo) file.photo = photo.startsWith('data:') ? photo : await blobDataUrl(await fetch(photo).then(response => response.blob())); } catch { /* 没有照片就不带 */ }
  const names = assetNames(`${widget.html}\n${widget.css}`);
  if (names.length) file.assets = await packAssets(names);
  const safe = widget.name.replace(/[\\/:*?"<>|]/g, '').trim() || '组件';
  return { blob: new Blob([JSON.stringify(file)], { type: 'application/json' }), fileName: `青团组件-${safe}.json` };
}

export function downloadFile(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob), link = document.createElement('a');
  link.href = url; link.download = name; document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/** 读进一个组件文件，存成新的组件（素材放回素材库，名字被占了会换名字，写法跟着改）。 */
export async function importCustom(picked: File) {
  if (picked.size > 20 * 1024 * 1024) throw new Error('文件太大了');
  let raw: Partial<WidgetFile>;
  try { raw = JSON.parse(await picked.text()); } catch { throw new Error('这不是青团机的组件文件'); }
  if (!raw || raw.app !== 'qingtuan-widget' || !raw.widget) throw new Error('这不是青团机的组件文件');
  const renamed = raw.assets && typeof raw.assets === 'object' ? await unpackAssets(raw.assets) : {};
  const rename = (text: string) => Object.entries(renamed).reduce((next, [from, to]) => from === to ? next : renameAssetIn(next, from, to), String(text || ''));
  const widget = normalizeOne({ ...raw.widget, html: rename(String(raw.widget.html || '')), css: rename(String(raw.widget.css || '')), who: '' }, newCustomId());
  if (!widget) throw new Error('这个组件读不懂');
  putCustomWidget(widget);
  if (typeof raw.photo === 'string' && /^data:image\/(png|jpe?g|webp|gif|avif);base64,/i.test(raw.photo)) {
    try { await saveImageSlots({ [customImageSlot(widget.id)]: raw.photo }); } catch { /* 照片放不进去就算了 */ }
  }
  return widget;
}
