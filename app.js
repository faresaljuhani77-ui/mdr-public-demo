const resources = [
  { id: 'bus', name: 'محطة حافلة', price: .5, info: '40 شخصًا · نطاق 600م', icon: '🚌', color: '#148d80' },
  { id: 'metro', name: 'محطة مترو', price: 8, info: '600 شخص · نطاق 2كم', icon: '🚇', color: '#365f91' },
  { id: 'park', name: 'حديقة صغيرة', price: 1, info: '120 زائرًا · حي واحد', icon: '🌳', color: '#5c9857' },
  { id: 'school', name: 'مدرسة', price: 3, info: '450 طالبًا · حي واحد', icon: '🏫', color: '#d2a02d' },
  { id: 'clinic', name: 'عيادة', price: 2, info: '150 مراجعًا · حيّان', icon: '✚', color: '#c94f5d' },
  { id: 'hospital', name: 'مستشفى', price: 5, info: '500 مراجع · المدينة', icon: '🏥', color: '#b43d51' },
  { id: 'youth', name: 'مركز شبابي', price: 2.5, info: '200 شاب · نطاق 1.5كم', icon: '⚽', color: '#7455a5' },
  { id: 'market', name: 'سوق حي', price: 1.5, info: '35 متجرًا · حي واحد', icon: '🛍', color: '#bb6536' },
  { id: 'mall', name: 'مركز تجاري', price: 5, info: '120 متجرًا · المدينة', icon: '🏬', color: '#435a8e' }
];

const labels = [
  ['حي الورود', 18, 63],
  ['حي الياسمين', 43, 42],
  ['حي الأزهار', 65, 55],
  ['حي البستان — الحي الجديد', 57, 86],
  ['المنطقة الصناعية', 84, 30],
  ['وسط البلد', 66, 68]
];

let state =
  JSON.parse(localStorage.getItem('mdr-public-demo') || 'null') || {
    budget: 100,
    items: [],
    team: 'فريق التجربة',
    notice: ''
  };

let selected = null;
let moving = null;

const $ = selector => document.querySelector(selector);

const app = $('#app');

const save = () =>
  localStorage.setItem('mdr-public-demo', JSON.stringify(state));

const rid = id => resources.find(resource => resource.id === id);

const uid = () => Math.random().toString(36).slice(2, 9);

function shell(content, mode) {
  app.innerHTML = `
    <header class="top">
      <img src="./mdr-logo.png" alt="شعار مدار">

      <div>
        <b>مدينة الربيع</b>
        <small>${mode}</small>
      </div>

      <span class="mode">نسخة عامة تجريبية</span>
    </header>

    ${content}
  `;
}

function login() {
  app.innerHTML = `
    <main class="login">
      <section class="card">
        <div class="brand">
          <img src="./mdr-logo.png" alt="شعار مدار">

          <div>
            <b>مدينة الربيع</b>
            <small>نسخة العرض التفاعلية</small>
          </div>
        </div>

        <h1>اختر وضع التجربة</h1>

        <p>
          هذه النسخة تستخدم بيانات تجريبية داخل هذا المتصفح
          ولا تتصل بخرائط الفرق الحقيقية.
        </p>

        <div class="choices">
          <button id="team">دخول الفريق</button>
          <button id="admin">دخول الإدارة</button>
        </div>

        <small class="hint">رمز الإدارة التجريبي: MDR</small>
      </section>
    </main>
  `;

  $('#team').onclick = team;

  $('#admin').onclick = () => {
    const code = prompt('رمز الإدارة');

    if (code === 'MDR') {
      admin();
    } else {
      alert('الرمز غير صحيح');
    }
  };
}

function spent() {
  return state.items.reduce((total, item) => {
    const resource = rid(item.rid);
    return total + (resource ? resource.price : 0);
  }, 0);
}

function toast(message) {
  const element = document.createElement('div');

  element.className = 'toast';
  element.textContent = message;

  document.body.append(element);

  setTimeout(() => element.remove(), 1500);
}

function valid(x, y) {
  return !(y < 18 || (x < 16 && y < 30));
}

function team() {
  shell(
    `
      <div class="layout">
        <aside class="panel">
          <h2>مكتبة الموارد</h2>
          <p>اسحب المورد إلى الخريطة أو انقر عليه لإضافته.</p>

          <div class="resources">
            ${resources
              .map(
                resource => `
                  <article
                    class="resource"
                    draggable="true"
                    data-r="${resource.id}"
                  >
                    <span
                      class="icon"
                      style="--c:${resource.color}"
                    >
                      ${resource.icon}
                    </span>

                    <div>
                      <b>${resource.name}</b>
                      <small>${resource.info}</small>
                    </div>

                    <strong>${resource.price}م</strong>
                  </article>
                `
              )
              .join('')}
          </div>
        </aside>

        <section class="board">
          <div class="budget">
            <div class="metric">
              <small>تكلفة الخطة</small>
              <b id="spent"></b>
            </div>

            <div class="metric">
              <small>الرصيد المتبقي</small>
              <b id="left"></b>
            </div>

            <div class="metric">
              <small>سقف الميزانية</small>
              <b>${state.budget} مليون</b>
            </div>
          </div>

          ${
            state.notice
              ? `<div class="notice">${state.notice}</div>`
              : ''
          }

          <div class="map-wrap">
            <div class="map" id="map">
              <img
                src="./city-map.jpg"
                alt="خريطة مدينة الربيع"
                draggable="false"
              >

              ${labels
                .map(
                  label => `
                    <span
                      class="label"
                      style="left:${label[1]}%;top:${label[2]}%"
                    >
                      ${label[0]}
                    </span>
                  `
                )
                .join('')}
            </div>
          </div>

          <div class="tools">
            <button id="delete" disabled>حذف واسترداد</button>
            <button id="undo">تراجع</button>
            <button id="resetview">إلغاء التحديد</button>
            <button id="back">تبديل الحساب</button>
          </div>
        </section>
      </div>
    `,
    state.team
  );

  renderItems();

  document.querySelectorAll('.resource').forEach(element => {
    element.ondragstart = event => {
      event.dataTransfer.setData('rid', element.dataset.r);
    };

    element.onclick = () => {
      add(element.dataset.r, 50, 52);
    };
  });

  const map = $('#map');

  map.ondragover = event => {
    event.preventDefault();
  };

  map.ondrop = event => {
    event.preventDefault();

    const bounds = map.getBoundingClientRect();

    const x =
      ((event.clientX - bounds.left) / bounds.width) * 100;

    const y =
      ((event.clientY - bounds.top) / bounds.height) * 100;

    add(event.dataTransfer.getData('rid'), x, y);
  };

  map.onpointermove = event => {
    if (!moving) return;

    const bounds = map.getBoundingClientRect();

    const x =
      ((event.clientX - bounds.left) / bounds.width) * 100;

    const y =
      ((event.clientY - bounds.top) / bounds.height) * 100;

    if (valid(x, y)) {
      const placedItem = state.items.find(
        item => item.id === moving
      );

      if (placedItem) {
        placedItem.x = x;
        placedItem.y = y;

        save();
        renderItems();
      }
    }
  };

  map.onpointerup = () => {
    moving = null;
  };

  map.onpointercancel = () => {
    moving = null;
  };

  $('#delete').onclick = () => {
    state.items = state.items.filter(
      item => item.id !== selected
    );

    selected = null;

    save();
    renderItems();
    toast('عادت قيمة المورد');
  };

  $('#undo').onclick = () => {
    state.items.pop();

    selected = null;

    save();
    renderItems();
  };

  $('#resetview').onclick = () => {
    selected = null;
    moving = null;
    renderItems();
  };

  $('#back').onclick = login;

  metrics();
}

function add(resourceId, x, y) {
  if (!resourceId) return;

  if (!valid(x, y)) {
    toast('لا يمكن وضع المورد في البحر');
    return;
  }

  state.items.push({
    id: uid(),
    rid: resourceId,
    x,
    y
  });

  save();
  renderItems();
  metrics();
}

function renderItems() {
  const map = $('#map');

  if (!map) return;

  map
    .querySelectorAll('.placed')
    .forEach(element => element.remove());

  state.items.forEach(placedItem => {
    const resource = rid(placedItem.rid);

    if (!resource) return;

    const button = document.createElement('button');

    button.className =
      'placed' +
      (selected === placedItem.id ? ' selected' : '');

    button.style.cssText = `
      left:${placedItem.x}%;
      top:${placedItem.y}%;
      --c:${resource.color}
    `;

    button.innerHTML = `
      ${resource.icon}
      <span>
        ${resource.name} · ${resource.price}م
      </span>
    `;

    button.onpointerdown = event => {
      event.stopPropagation();

      selected = placedItem.id;
      moving = placedItem.id;

      button.setPointerCapture(event.pointerId);

      renderItems();

      const deleteButton = $('#delete');

      if (deleteButton) {
        deleteButton.disabled = false;
      }
    };

    map.append(button);
  });

  const deleteButton = $('#delete');

  if (deleteButton) {
    deleteButton.disabled = !selected;
  }

  metrics();
}

function metrics() {
  const spentElement = $('#spent');
  const leftElement = $('#left');

  if (!spentElement || !leftElement) return;

  const totalSpent = spent();
  const remaining = state.budget - totalSpent;

  spentElement.textContent = totalSpent + ' مليون';
  leftElement.textContent = remaining + ' مليون';
  leftElement.className = remaining < 0 ? 'negative' : '';
}

function admin() {
  shell(
    `
      <main class="admin">
        <div>
          <h1>لوحة الإدارة التجريبية</h1>
          <p>التعديلات تخص هذا المتصفح فقط.</p>
        </div>

        <div class="admin-grid">
          <article>
            <h2>الفريق</h2>

            <label>
              اسم الفريق
              <input id="teamname" value="${state.team}">
            </label>

            <button id="savename">حفظ الاسم</button>
          </article>

          <article>
            <h2>الميزانية</h2>

            <p>
              السقف الحالي:
              <b>${state.budget} مليون</b>
            </p>

            <button class="danger" id="cut">
              خفضها إلى 70 مليونًا
            </button>
          </article>

          <article>
            <h2>رسالة للفريق</h2>

            <label>
              التعليمات
              <input id="message" value="${state.notice}">
            </label>

            <button id="send">إرسال</button>
          </article>
        </div>

        <article>
          <h2>ملخص الخريطة</h2>

          <p>
            عدد الموارد:
            <b>${state.items.length}</b>
            · التكلفة:
            <b>${spent()} مليون</b>
            · الرصيد:
            <b>${state.budget - spent()} مليون</b>
          </p>

          <button id="openmap">مشاهدة خريطة الفريق</button>
          <button id="logout">العودة للدخول</button>
        </article>
      </main>
    `,
    'حساب الإدارة'
  );

  $('#savename').onclick = () => {
    state.team = $('#teamname').value;
    save();
    admin();
  };

  $('#cut').onclick = () => {
    state.budget = 70;
    state.notice =
      'خُفضت ميزانية الحل إلى 70 مليونًا. راجعوا الأولويات.';

    save();
    admin();
  };

  $('#send').onclick = () => {
    state.notice = $('#message').value;
    save();
    toast('أُرسلت الرسالة');
  };

  $('#openmap').onclick = team;
  $('#logout').onclick = login;
}

login();
