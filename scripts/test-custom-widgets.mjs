// 自己做的组件：node --experimental-strip-types scripts/test-custom-widgets.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeCustom, normalizeOne, scopeCustomCss, varValue, fillVars, usesClock, assetNames, renameAssetIn, customScope, CUSTOM_EXAMPLES } from '../src/utils/customWidgetCore.ts';

const scope = customScope('cw_test1');
const ctx = { now: new Date(2026, 10, 14, 9, 5), his: '齐司礼', mine: '青团' };

test('CSS 只套在这个组件里，:root 当成组件本身', () => {
  const css = scopeCustomCss('.box { color: red; }\n:root { background: blue; }', 'cw_test1');
  assert.ok(css.includes(`${scope} .box{color: red !important`));
  assert.ok(css.includes(`${scope}{background: blue !important`));
});

test('整个组件不让藏起来；里面的可以', () => {
  const css = scopeCustomCss(':root { display: none; color: red; }\n.x { display: none; }', 'cw_test1');
  assert.ok(!css.includes(`${scope}{display`));
  assert.ok(css.includes(`${scope} .x{display: none !important}`));
});

test('外面的网址挡掉；素材、data:image 可以', () => {
  assert.throws(() => scopeCustomCss('.a { background: url(https://x.com/a.png); }', 'cw_test1'), /第 1 行/);
  assert.doesNotThrow(() => scopeCustomCss('.a { background: url(asset:云朵) center; }', 'cw_test1'));
  assert.throws(() => scopeCustomCss('@import "x.css";', 'cw_test1'));
});

test('@keyframes 名字加上组件 id，不会盖到小手机原本的动画', () => {
  const css = scopeCustomCss('@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }\n.a { animation: fadeIn 1s infinite; }', 'cw_test1');
  assert.ok(css.includes('@keyframes cw_test1-fadeIn'));
  assert.ok(css.includes('animation: cw_test1-fadeIn 1s infinite'));
});

test('会变的字', () => {
  assert.equal(varValue('时间', ctx), '09:05');
  assert.equal(varValue('日期', ctx), '11月14日');
  assert.equal(varValue('星期', ctx), '星期六');
  assert.equal(varValue('他的名字', ctx), '齐司礼');
  assert.equal(varValue('我的名字', ctx), '青团');
  assert.equal(varValue('天数:2026-11-01', ctx), '13');
  assert.equal(varValue('倒数:2026-12-25', ctx), '41');
  assert.equal(varValue('倒数:12-25', ctx), '41');
  assert.equal(varValue('倒数:01-01', ctx), '48', '过了就算明年');
  assert.equal(varValue('倒数:2026-11-01', ctx), '0', '过了的那一天是 0');
  assert.equal(varValue('倒数:2026-02-30', ctx), null, '没有这天');
  assert.equal(varValue('不认得', ctx), null);
  assert.equal(fillVars('现在 {{时间}}，{{图片}} {{乱写}}', ctx), '现在 09:05，{{图片}} {{乱写}}');
  assert.ok(usesClock('<b>{{时间}}</b>')); assert.ok(!usesClock('<b>{{他的名字}}</b>'));
});

test('读回来：坏掉的拿掉、太长的切掉、id 重复只留一个', () => {
  const list = normalizeCustom([{ id: 'cw_abcd1', name: '  便利贴  ', w: 9, h: 0, html: '<b>x</b>', css: '', open: 'evil' }, { id: 'cw_abcd1' }, { id: 'bad' }, null]);
  assert.equal(list.length, 1);
  assert.deepEqual(list[0], { id: 'cw_abcd1', name: '便利贴', w: 4, h: 1, html: '<b>x</b>', css: '', open: '', who: '' });
  assert.equal(normalizeOne({ open: 'chat:c1' }, 'cw_abcd2').open, 'chat:c1');
});

test('用到的素材、改名', () => {
  const text = '<img src="asset:合照"> .a{background:url(asset:云朵)}';
  assert.deepEqual(assetNames(text), ['合照', '云朵']);
  assert.equal(renameAssetIn(text, '云朵', '白云'), '<img src="asset:合照"> .a{background:url(asset:白云)}');
});

test('示例的 CSS 都写对了', () => {
  for (const example of CUSTOM_EXAMPLES) assert.doesNotThrow(() => scopeCustomCss(example.css, 'cw_test1'), example.name);
});
