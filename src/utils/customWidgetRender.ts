import { assetUrl, resolveAssets } from './cssAssets';
import { VAR_PATTERN, varValue } from './customWidgetCore';
import type { VarContext } from './customWidgetCore';

/**
 * 自己做的组件的 HTML 画到画面上之前：过滤（不能有 JS、不能连外面）、换掉会变的字和素材。
 * - 认得的标签留下；script、style、iframe、表单这些整个拿掉；其他不认得的拆掉外壳、留里面的字。
 * - 属性只留 class、style、alt、title、aria-*、图片的 src、SVG 画图用的那些；on… 一律拿掉。
 * - 图片只能是素材（asset:名字）、data:image 或 {{图片}}；style 里连到外面的网址整句拿掉。
 * - 写了 {{图片}} 的元素加上 data-cw-photo，点它就能换照片。
 */
const BLANK = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
const KEEP = new Set(['div', 'span', 'p', 'b', 'i', 'em', 'strong', 'small', 'br', 'hr', 'img', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'section', 'header', 'footer', 'article', 'aside', 'figure', 'figcaption', 'blockquote', 'pre', 'code', 's', 'u', 'mark', 'sub', 'sup', 'del', 'ins', 'time', 'label', 'table', 'thead', 'tbody', 'tr', 'td', 'th',
  'svg', 'g', 'path', 'rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon', 'text', 'tspan', 'defs', 'lineargradient', 'radialgradient', 'stop', 'clippath', 'mask', 'pattern']);
const DROP = new Set(['script', 'style', 'iframe', 'frame', 'frameset', 'object', 'embed', 'link', 'meta', 'base', 'form', 'input', 'textarea', 'select', 'option', 'button', 'audio', 'video', 'source', 'track', 'canvas', 'template', 'noscript', 'use', 'image', 'foreignobject', 'animate', 'set', 'animatemotion', 'animatetransform', 'title', 'head']);
const ATTRS = new Set(['class', 'style', 'alt', 'title', 'role', 'colspan', 'rowspan',
  'viewbox', 'd', 'x', 'y', 'x1', 'y1', 'x2', 'y2', 'cx', 'cy', 'r', 'rx', 'ry', 'width', 'height', 'points', 'transform', 'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'stroke-dasharray',
  'opacity', 'fill-opacity', 'stroke-opacity', 'fill-rule', 'clip-rule', 'shape-rendering', 'font-size', 'font-weight', 'text-anchor', 'dominant-baseline', 'offset', 'stop-color', 'stop-opacity', 'gradientunits', 'gradienttransform', 'preserveaspectratio', 'xmlns', 'id', 'clip-path', 'patternunits']);
const BAD_STYLE = /expression\s*\(|javascript:|behavior\s*:|@import|-moz-binding/i;
const okUrl = (value: string) => /^(asset:|data:image\/|\{\{\s*图片\s*\}\})/i.test(value.trim());
/** style 里的 url() 只收素材、data:image、{{图片}}。 */
function okStyle(style: string) {
  if (BAD_STYLE.test(style) || /position\s*:\s*fixed/i.test(style)) return false;
  for (const match of style.matchAll(/url\s*\(\s*(['"]?)([^'")]*)\1\s*\)/gi)) if (!okUrl(match[2])) return false;
  return true;
}

export interface RenderContext extends VarContext { photo: string }
const PHOTO = /\{\{\s*图片\s*\}\}/g;
function fill(text: string, context: RenderContext) {
  return text.replace(VAR_PATTERN, (whole, name: string) => name.trim() === '图片' ? whole : varValue(name, context) ?? whole);
}

/** 过滤 + 换字 + 换图，回传可以直接放进画面的 HTML。 */
export function renderCustomHtml(html: string, context: RenderContext) {
  const template = document.createElement('template');
  template.innerHTML = html;
  const walk = (parent: Node) => {
    for (const node of [...parent.childNodes]) {
      if (node.nodeType === Node.COMMENT_NODE) { node.remove(); continue; }
      if (node.nodeType === Node.TEXT_NODE) { const text = node.textContent || ''; if (text.includes('{{')) node.textContent = fill(text, context).replace(PHOTO, ''); continue; }
      if (node.nodeType !== Node.ELEMENT_NODE) { node.parentNode?.removeChild(node); continue; }
      const element = node as Element, tag = element.tagName.toLowerCase();
      if (DROP.has(tag)) { element.remove(); continue; }
      if (!KEEP.has(tag)) { walk(element); element.replaceWith(...element.childNodes); continue; }
      let photo = false;
      for (const attr of [...element.attributes]) {
        const name = attr.name.toLowerCase();
        let value = attr.value;
        const keep = ATTRS.has(name) || name.startsWith('aria-') || (name === 'src' && tag === 'img');
        if (!keep || name.startsWith('on')) { element.removeAttribute(attr.name); continue; }
        if (name === 'id') { element.setAttribute(attr.name, `cw-${value.replace(/[^\w-]/g, '')}`); continue; } // SVG 渐层要 id：加前缀免得跟小手机撞名
        if (name === 'src') {
          if (!okUrl(value)) { element.removeAttribute(attr.name); continue; }
          if (PHOTO.test(value)) { photo = true; PHOTO.lastIndex = 0; value = context.photo || BLANK; }
          else if (/^asset:/i.test(value)) value = assetUrl(value.trim().slice(6));
          element.setAttribute(attr.name, value); continue;
        }
        if (name === 'style') {
          if (!okStyle(value)) { element.removeAttribute(attr.name); continue; }
          if (PHOTO.test(value)) { photo = true; PHOTO.lastIndex = 0; value = value.replace(PHOTO, context.photo || BLANK); }
          value = resolveAssets(fill(value, context));
          element.setAttribute(attr.name, value); continue;
        }
        if (/url\s*\(\s*['"]?#/.test(value)) value = value.replace(/url\(\s*(['"]?)#([\w-]+)\1\s*\)/g, 'url(#cw-$2)'); // fill="url(#渐层)" 跟着加前缀
        else if (/url\s*\(/i.test(value)) { element.removeAttribute(attr.name); continue; }
        if (value.includes('{{')) value = fill(value, context);
        element.setAttribute(attr.name, value);
      }
      if (photo) { element.setAttribute('data-cw-photo', ''); if (!context.photo) element.classList.add('is-empty-photo'); }
      walk(element);
    }
  };
  walk(template.content);
  return template.innerHTML;
}
