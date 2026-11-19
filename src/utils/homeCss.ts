import { createCssStore } from './cssStore';
import { scopeHomeCss } from './homeCssScope';

/** 美化设置的「主画面美化 CSS」：只改主画面，各个 App 里面不受影响。 */
export const homeCssStore = createCssStore({ applied: 'qingtuan_home_css_v1', draft: 'qingtuan_home_css_draft_v1', templates: 'qingtuan_home_css_templates_v1', event: 'qingtuan:home-css' }, scopeHomeCss);
export const HOME_CSS_EVENT = homeCssStore.event;
export const readHomeCss = () => homeCssStore.read();
export const writeHomeCss = (css: string) => homeCssStore.write(css);
export { scopeHomeCss } from './homeCssScope';

/* ---------- 类名小抄 ---------- */
export const HOME_CLASS_GROUPS: { label: string; items: [string, string][] }[] = [
  { label: '颜色（只想换颜色，改这几个就好）', items: [
    ['#main-content { --theme-accent: ; }', '主画面的主题色（框线、图标、按钮、播放器一起换）'],
    ['#main-content { --home-ink: ; }', '主画面的字'],
    ['#main-content { background: ; }', '整个主画面的底（会盖过壁纸）']] },
  { label: '最上面', items: [
    ['.ios-status-bar', '状态栏（时间、电量那一条）'], ['.status-time', '状态栏的时间']] },
  { label: '上面的小组件', items: [
    ['.widget-card', '整块小组件'], ['.avatar-frame-container', '头像框'], ['.avatar-inner-circle', '头像框里面'],
    ['.speech-bubble-container', '头像上面的对话框'], ['.bubble-text', '对话框里的字'], ['.subtitle', '中间那行小字'],
    ['.heart-icon', '两个头像中间的爱心'], ['.earphone-wires', '耳机线']] },
  { label: '音乐播放器', items: [
    ['.mp3-player', '整台播放器'], ['.mp3-screen', '播放器的屏幕'], ['.song-details', '屏幕上歌名那行'],
    ['.mp3-player .controls', '右边的圆形按钮盘'], ['.mp3-player .btn', '播放器的按钮'], ['.mp3-brand', '下面那行小字']] },
  { label: '图标', items: [
    ['.app-item', '一个图标（连名字）'], ['.app-card', '图标的底'], ['.icon-box', '图标的图案'], ['.app-label-cn', '图标的名字'],
    ['.tama-widget', '电子宠物整台'], ['.tama-screen', '电子宠物的屏幕'], ['.tama-btn', '电子宠物的按钮']] },
  { label: '第二页和小点', items: [
    ['.home-notice', '消息卡'], ['.home-notice-bar', '消息卡的标题栏'], ['.home-notice-text', '消息卡的字'],
    ['.home-dot', '页数小点'], ['.home-dot.active', '现在这页的小点']] },
  { label: '加进来的组件', items: [
    ['.home-hello', '一句话整块'], ['.home-hello-name', '一句话的名字'], ['.home-hello-text', '一句话那行字'], ['.home-hello-link', '「回复」'],
    ['.home-login-frame', '登录框的大头像框'], ['.home-login-field', '登录框的两栏'], ['.home-login-go', '登录框的箭头钮'],
    ['.home-cal', '日历整块'], ['.home-cal-title', '日历的标题栏'], ['.home-cal-pic', '日历左边的图'], ['.home-cal-month', '日历的月份'],
    ['.home-cal-day', '日历的日期'], ['.home-cal-day.is-today', '今天那一格'], ['.home-cal-status', '日历最底下那栏']] },
  { label: '底下那排', items: [
    ['.dock-bar', '整排（不能藏起来）'], ['.dock-item', '每一颗'], ['.dock-item.active', '现在这一页的那颗'], ['.dock-item span', '每一颗下面的字']] }
];

/* ---------- 示例 ---------- */
export const HOME_EXAMPLES: { name: string; css: string }[] = [
  { name: '原本的', css: '' },
  { name: '只换颜色', css: `/* 只想换颜色：改这几行，删掉不想改的 */
#main-content {
  --theme-accent: #e3c6b0;  /* 主画面的主题色：框线、图标、按钮、播放器一起换 */
}` },
  { name: '推し杂志', css: `/* 推し杂志风：粉 + 黑 + 一点蓝，粗黑框、错开的粉色投影、黑底白字标签、斜纹和网点 */
#main-content {
  --theme-accent: #f19cbc;
  --home-ink: #2b2228;
  --color-text: #2b2228;
  --color-muted: #c47e9c;
  --color-surface: #fffafc;
  --color-surface-rgb: 255, 250, 252;
  background:
    radial-gradient(#f6c4d8 1px, transparent 1.3px) 0 0 / 14px 14px,
    repeating-linear-gradient(135deg, #fff8fb 0 12px, #fdeff5 12px 24px);
}

/* 最上面：杂志的刊头小字 */
.ios-status-bar::after {
  content: 'PRIVATE OSHI COLLECTION · VOL.01';
  position: absolute;
  left: 0; right: 0; top: 33px;
  color: #e0558f;
  font: italic 700 7.5px/1 Georgia, 'Times New Roman', serif;
  letter-spacing: 2px;
  text-align: center;
}

/* 头像：白边相片、粗黑框、粉色投影，上面贴一条胶带，两张歪一点 */
.earphone-wires { display: none; }
.avatar-inner-circle {
  border: 2px solid #2b2228;
  border-radius: 0;
  background: #fff;
  box-shadow: 4px 4px 0 #f19cbc;
}
.avatar-inner-circle img { border-radius: 0; }
#starAvatarWrap { transform: rotate(-3deg); }
#moonAvatarWrap { transform: rotate(3deg); }
.avatar-frame-container::before {
  content: '';
  position: absolute;
  left: 50%; top: 2px; z-index: 3;
  width: 46px; height: 14px;
  margin-left: -23px;
  background: rgba(124, 156, 242, .55);
  transform: rotate(-4deg);
}
/* 头像上面的话：黑底白字的标签 */
.bubble-text-layer {
  background: #2b2228;
  border-radius: 0;
  box-shadow: 3px 3px 0 #f19cbc;
}
.bubble-text { color: #fff; font-style: italic; }
.heart-icon { color: #e0558f; }
.subtitle {
  color: #e0558f;
  font: italic 700 12px Georgia, 'Times New Roman', serif;
  letter-spacing: .5px;
}

/* 播放器：白纸卡片 + 粗黑框 + 粉色投影，左上角一张 ISSUE 标签 */
.mp3-player {
  border: 2px solid #2b2228;
  border-radius: 4px;
  background: #fff;
  box-shadow: 5px 5px 0 #f19cbc;
  overflow: visible;
}
.mp3-player::before {
  content: 'ISSUE 01';
  position: absolute;
  inset: auto;
  left: 14px; top: -9px; z-index: 2;
  width: auto; height: auto;
  border: 0;
  border-radius: 0;
  box-shadow: none;
  opacity: 1;
  -webkit-mask: none;
  mask: none;
  filter: none;
  padding: 2px 7px;
  background: #e0558f;
  color: #fff;
  font: italic 700 8px/1.2 Georgia, serif;
  letter-spacing: 1.5px;
}
.mp3-screen {
  border: 2px solid #2b2228;
  border-radius: 2px;
  background: radial-gradient(#f6c4d8 1px, transparent 1.3px) 0 0 / 6px 6px, #fff6fa;
  box-shadow: none;
  color: #2b2228;
}
/* 屏幕外面原本那圈塑料边、斜斜的反光拿掉 */
.mp3-player .mp3-screen::before,
.mp3-player .mp3-screen::after { display: none; }
/* 状态行：PAUSE 变成黑底白字小标签，下面一条粗黑线 */
.mp3-player .mp3-status { border-bottom: 1.5px solid #2b2228; }
.mp3-mode { flex: 0 0 auto; padding: 0 5px; background: #2b2228; color: #fff; font-style: italic; letter-spacing: 1px; }
.song-title { color: #e0558f; font-style: italic; }
.song-details { color: #2b2228; }
/* 进度条：黑框，走过的是粉色 */
.mp3-player .progress-bar-bg { border: 1.5px solid #2b2228; border-radius: 0; background: #fff; }
.mp3-player .progress-bar-fill { border-radius: 0; background: #e0558f; }
.mp3-player .player-mini-cover { border: 1.5px solid #2b2228; border-radius: 0; box-shadow: 2px 2px 0 #f19cbc; }
.mp3-brand { color: #2b2228; font-style: italic; letter-spacing: 2px; }
/* 右边的按钮盘：斜纹底、粗黑框；播放键是黑底白字的圆，其他按钮黑色 */
.mp3-player .controls {
  border: 2px solid #2b2228;
  background: repeating-linear-gradient(135deg, #fff 0 6px, #fde4ee 6px 12px);
  box-shadow: 3px 3px 0 #2b2228;
}
.mp3-player .controls .btn { color: #2b2228; }
.mp3-player .controls .btn svg { color: #2b2228; fill: currentColor; }
.mp3-player .controls .btn-play {
  border: 2px solid #2b2228;
  background: #2b2228;
  box-shadow: 2px 2px 0 #f19cbc;
  color: #fff;
}
.mp3-player .controls .btn-play svg { color: #fff; fill: #fff; }
.mp3-player .controls .btn-star.starred svg,
.mp3-player .controls .btn-heart.liked svg { color: #e0558f; fill: #e0558f; }

/* 图标：白卡 + 粗黑框 + 投影（记账、世界书粉色，备忘录、记忆蓝色），名字是黑底白字小标签 */
.app-card {
  border: 2px solid #2b2228;
  border-radius: 6px;
  background: #fff;
  box-shadow: 3px 3px 0 #f19cbc;
}
.app-item[data-app-icon-key="memos"] .app-card,
.app-item[data-app-icon-key="memories"] .app-card { background: #eef2ff; box-shadow: 3px 3px 0 #7c9cf2; }
.icon-box { background: none; box-shadow: none; }
.app-label-cn {
  margin-top: 5px;
  padding: 1px 6px;
  background: #2b2228;
  color: #fff;
  font: italic 9.5px/1.5 Georgia, 'Times New Roman', serif;
  letter-spacing: .5px;
}

/* 电子宠物：白色蛋壳、粗黑框、粉色投影，上面一张 OSHI PET 标签；屏幕黑框网点底，按钮是白圆黑框 */
.tama-widget {
  border: 2px solid #2b2228;
  background: radial-gradient(#f6c4d8 1px, transparent 1.3px) 0 0 / 9px 9px, #fff;
  box-shadow: 4px 4px 0 #f19cbc;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}
.tama-widget::after { display: none; }
.tama-widget::before {
  content: 'OSHI PET';
  position: absolute;
  left: 50%; top: 20px;
  padding: 1px 7px;
  background: #e0558f;
  color: #fff;
  font: italic 700 8px/1.4 Georgia, 'Times New Roman', serif;
  letter-spacing: 1.5px;
  white-space: nowrap;
  transform: translateX(-50%) rotate(-3deg);
}
.tama-screen {
  border: 2px solid #2b2228;
  border-radius: 2px;
  background: radial-gradient(#f6c4d8 1px, transparent 1.3px) 0 0 / 6px 6px, #fff6fa;
  box-shadow: none;
}
.tama-screen::before { inset: -5px; border: 0; border-radius: 3px; background: #fde4ee; box-shadow: none; }
.tama-btn {
  border: 2px solid #2b2228;
  background: #fff;
  box-shadow: 2px 2px 0 #f19cbc;
}
.tama-btn .tb-x { fill: #2b2228; }
.tama-btn .tb-w { fill: #fff; }

/* 消息小窗：黑色标题栏 */
.home-notice { border: 2px solid #2b2228; box-shadow: 4px 4px 0 #f19cbc; }
.home-notice-bar { background: #2b2228; color: #fff; border-bottom: 0; }
.home-notice-title, .home-notice-title em { color: #fff; font-style: italic; }
.home-notice-btns { background: #fff; }

/* 页数小点：粉色小菱形 */
.home-dot { border-color: #2b2228; transform: rotate(45deg); }
.home-dot.active { background: #e0558f; }

/* 底下那排：白卡粗黑框，现在这页是粉色 */
.dock-bar {
  border: 2px solid #2b2228;
  border-radius: 10px;
  background: #fff;
  box-shadow: 4px 4px 0 #f19cbc;
}
.dock-item { border-radius: 6px; }
.dock-item.active { border: 1.5px solid #2b2228; background: #fde4ee; box-shadow: 2px 2px 0 #2b2228; }
.dock-item span { color: #2b2228; font-style: italic; }` },
  { name: '水光玻璃', css: `/* 水光玻璃：天空蓝 + 一点草绿，透明玻璃卡片、上半截一道亮面、圆润的水珠按钮，背景飘着泡泡 */
#main-content {
  --theme-accent: #7cc8f2;
  --home-ink: #1d4e6e;
  --color-text: #1d4e6e;
  --color-muted: #5fa3c7;
  --color-surface: #f5fbff;
  --color-surface-rgb: 245, 251, 255;
  background:
    radial-gradient(circle at 18% 22%, rgba(255, 255, 255, .9) 0 3px, rgba(255, 255, 255, .25) 4px 14px, transparent 15px),
    radial-gradient(circle at 84% 14%, rgba(255, 255, 255, .9) 0 2px, rgba(255, 255, 255, .2) 3px 9px, transparent 10px),
    radial-gradient(circle at 72% 46%, rgba(255, 255, 255, .85) 0 4px, rgba(255, 255, 255, .2) 5px 22px, transparent 23px),
    radial-gradient(circle at 10% 68%, rgba(255, 255, 255, .85) 0 3px, rgba(255, 255, 255, .2) 4px 16px, transparent 17px),
    radial-gradient(circle at 92% 78%, rgba(255, 255, 255, .8) 0 2px, rgba(255, 255, 255, .2) 3px 11px, transparent 12px),
    radial-gradient(ellipse 120% 45% at 20% 108%, rgba(138, 214, 118, .75), transparent 60%),
    radial-gradient(ellipse 90% 35% at 90% 104%, rgba(96, 196, 160, .6), transparent 62%),
    radial-gradient(ellipse 80% 40% at 50% -5%, #ffffff, transparent 70%),
    linear-gradient(180deg, #a9dcfb 0%, #d4efff 45%, #eefaff 100%);
}

/* 头像：圆形水泡框，外面一圈淡蓝光 */
.earphone-wires { opacity: .9; }
.avatar-inner-circle {
  border: 3px solid rgba(255, 255, 255, .95);
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 0 0 4px rgba(124, 200, 242, .35), 0 6px 14px rgba(29, 110, 170, .3);
  overflow: hidden;
}
.avatar-inner-circle img { border-radius: 50%; }
.avatar-inner-circle::after {
  content: '';
  position: absolute;
  left: 14%; top: 6%;
  width: 72%; height: 38%;
  border-radius: 50%;
  background: linear-gradient(rgba(255, 255, 255, .7), rgba(255, 255, 255, 0));
  pointer-events: none;
}
/* 头像上的话：水蓝色的亮面胶囊 */
.bubble-text-layer {
  border: 1px solid rgba(255, 255, 255, .95);
  border-radius: 999px;
  background: linear-gradient(180deg, #ffffff 0%, #e4f6ff 48%, #a9dcf8 52%, #d6f1ff 100%);
  box-shadow: 0 3px 8px rgba(29, 110, 170, .25);
}
.bubble-text { color: #1d4e6e; }
.heart-icon { color: #4fb3e8; }
.subtitle { color: #1d4e6e; text-shadow: 0 0 6px #fff, 0 0 2px #fff; }

/* 播放器：透明玻璃卡片，上半截一道亮面 */
.mp3-player {
  border: 1px solid rgba(255, 255, 255, .95);
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(255, 255, 255, .85) 0%, rgba(255, 255, 255, .45) 48%, rgba(190, 230, 255, .4) 52%, rgba(255, 255, 255, .6) 100%);
  box-shadow: 0 8px 20px rgba(29, 110, 170, .28), inset 0 1px 0 #fff;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
.mp3-screen {
  border: 1px solid #5fa3c7;
  border-radius: 8px;
  background: linear-gradient(180deg, rgba(255, 255, 255, .55) 0%, rgba(255, 255, 255, 0) 50%), linear-gradient(180deg, #d8f3ff, #9fd8f5);
  box-shadow: inset 0 2px 4px rgba(29, 110, 170, .25);
  color: #1d4e6e;
}
.mp3-player .mp3-screen::before { border: 1px solid rgba(255, 255, 255, .9); border-radius: 12px; background: linear-gradient(180deg, #ffffff, #cbe9fa); box-shadow: 0 1px 3px rgba(29, 110, 170, .3); }
.mp3-player .mp3-status { border-bottom-color: rgba(29, 78, 110, .35); }
.song-title { color: #0f5d8c; }
.mp3-player .progress-bar-bg { border-radius: 99px; background: rgba(255, 255, 255, .7); box-shadow: inset 0 1px 2px rgba(29, 110, 170, .3); }
.mp3-player .progress-bar-fill { border-radius: 99px; background: linear-gradient(180deg, #b7f08f, #4fbf4a); }
.mp3-brand { color: #3f86ad; letter-spacing: 2px; }
/* 按钮盘：一颗亮晶晶的水珠；播放键是绿色的水珠 */
.mp3-player .controls {
  border: 1px solid rgba(255, 255, 255, .95);
  background: radial-gradient(ellipse 70% 45% at 50% 22%, rgba(255, 255, 255, .95), rgba(255, 255, 255, 0) 70%), radial-gradient(circle at 50% 80%, #bfe8ff, #7cc8f2);
  box-shadow: 0 6px 14px rgba(29, 110, 170, .35), inset 0 -4px 8px rgba(29, 110, 170, .25);
}
.mp3-player .controls .btn { color: #1d4e6e; }
.mp3-player .controls .btn svg { color: #1d4e6e; fill: currentColor; }
.mp3-player .controls .btn-play {
  border: 1px solid rgba(255, 255, 255, .95);
  background: radial-gradient(ellipse 70% 45% at 50% 25%, rgba(255, 255, 255, .9), rgba(255, 255, 255, 0) 70%), radial-gradient(circle at 50% 80%, #a6ec7c, #3fae3c);
  box-shadow: 0 3px 8px rgba(40, 120, 40, .35);
}
.mp3-player .controls .btn-play svg { color: #fff; fill: #fff; filter: drop-shadow(0 1px 1px rgba(20, 80, 20, .5)); }

/* 图标：圆角水蓝玻璃块，上半截亮面；名字白色描一圈蓝 */
.app-card {
  border: 1px solid rgba(255, 255, 255, .95);
  border-radius: 14px;
  background: linear-gradient(180deg, rgba(255, 255, 255, .9) 0%, rgba(255, 255, 255, .5) 48%, rgba(124, 200, 242, .45) 52%, rgba(205, 238, 255, .8) 100%);
  box-shadow: 0 4px 10px rgba(29, 110, 170, .28), inset 0 1px 0 #fff;
}
.app-item[data-app-icon-key="memos"] .app-card,
.app-item[data-app-icon-key="memories"] .app-card { background: linear-gradient(180deg, rgba(255, 255, 255, .9) 0%, rgba(255, 255, 255, .5) 48%, rgba(132, 214, 112, .45) 52%, rgba(214, 245, 205, .85) 100%); }
.icon-box { background: none; box-shadow: none; }
.app-label-cn { color: #fff; text-shadow: 0 0 3px #1d6e9e, 0 1px 2px #1d4e6e; }

/* 电子宠物：透明的水蓝玻璃蛋，屏幕跟播放器同一种亮面液晶，按钮是小水珠 */
.tama-widget {
  border: 1px solid rgba(255, 255, 255, .95);
  background: radial-gradient(ellipse 55% 32% at 34% 16%, rgba(255, 255, 255, .9), rgba(255, 255, 255, 0) 70%), linear-gradient(165deg, rgba(190, 232, 255, .55), rgba(124, 200, 242, .75));
  box-shadow: 0 8px 18px rgba(29, 110, 170, .3), inset 0 -8px 14px rgba(29, 110, 170, .2), inset 0 2px 0 #fff;
}
.tama-screen {
  border: 1px solid #5fa3c7;
  border-radius: 6px;
  background: linear-gradient(180deg, rgba(255, 255, 255, .55) 0%, rgba(255, 255, 255, 0) 50%), linear-gradient(180deg, #e2f7ff, #a9dcf8);
}
.tama-screen::before { border: 1px solid rgba(255, 255, 255, .9); border-radius: 10px; background: linear-gradient(180deg, #ffffff, #cbe9fa); }
.tama-btn {
  border: 1px solid rgba(255, 255, 255, .95);
  background: radial-gradient(ellipse 70% 45% at 50% 25%, rgba(255, 255, 255, .95), rgba(255, 255, 255, 0) 70%), radial-gradient(circle at 50% 80%, #c9eeff, #7cc8f2);
  box-shadow: 0 3px 6px rgba(29, 110, 170, .3);
}
.tama-btn .tb-x { fill: #1d4e6e; }

/* 消息小窗：玻璃小窗，标题栏是水蓝亮面 */
.home-notice {
  border: 1px solid rgba(255, 255, 255, .95);
  border-radius: 10px;
  overflow: hidden;
  background: rgba(255, 255, 255, .7);
  box-shadow: 0 6px 16px rgba(29, 110, 170, .25);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
.home-notice-bar { border-bottom: 1px solid rgba(255, 255, 255, .9); background: linear-gradient(180deg, #ffffff 0%, #d9f2ff 48%, #9fd7f5 52%, #c6ebff 100%); color: #1d4e6e; }

/* 页数小点：小泡泡 */
.home-dot { border: 1px solid rgba(255, 255, 255, .95); border-radius: 50%; background: rgba(124, 200, 242, .45); box-shadow: 0 1px 3px rgba(29, 110, 170, .3); }
.home-dot.active { background: radial-gradient(circle at 40% 35%, #fff 0 20%, #4fb3e8 60%); }

/* 底下那排：一整条玻璃，现在这页那颗是亮晶晶的水珠底 */
.dock-bar {
  border: 1px solid rgba(255, 255, 255, .95);
  border-radius: 22px;
  background: linear-gradient(180deg, rgba(255, 255, 255, .85) 0%, rgba(255, 255, 255, .5) 48%, rgba(170, 222, 250, .45) 52%, rgba(255, 255, 255, .65) 100%);
  box-shadow: 0 8px 20px rgba(29, 110, 170, .3), inset 0 1px 0 #fff;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}
.dock-item { border-radius: 16px; }
.dock-item.active {
  border: 1px solid rgba(255, 255, 255, .95);
  background: radial-gradient(ellipse 80% 45% at 50% 20%, rgba(255, 255, 255, .95), rgba(255, 255, 255, 0) 70%), linear-gradient(180deg, #c3ecff, #7cc8f2);
  box-shadow: 0 3px 8px rgba(29, 110, 170, .3);
}
.dock-item span { color: #1d4e6e; }` }
];
