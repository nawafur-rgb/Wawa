const STORAGE_KEY = 'regional_offers_v1';
const SUBSCRIBERS_KEY = 'regional_offers_subscribers_v1';

const els = {
  offersGrid: document.getElementById('offersGrid'),
  emptyState: document.getElementById('emptyState'),
  searchInput: document.getElementById('searchInput'),
  categoryFilter: document.getElementById('categoryFilter'),
  statusFilter: document.getElementById('statusFilter'),
  adminModal: document.getElementById('adminModal'),
  openAdminBtn: document.getElementById('openAdminBtn'),
  heroAdminBtn: document.getElementById('heroAdminBtn'),
  closeAdminBtn: document.getElementById('closeAdminBtn'),
  notifyBtn: document.getElementById('notifyBtn'),
  offerForm: document.getElementById('offerForm'),
  adminTableBody: document.getElementById('adminTableBody'),
  formTitle: document.getElementById('formTitle'),
  offerId: document.getElementById('offerId'),
  title: document.getElementById('title'),
  store: document.getElementById('store'),
  category: document.getElementById('category'),
  startDate: document.getElementById('startDate'),
  endDate: document.getElementById('endDate'),
  discount: document.getElementById('discount'),
  location: document.getElementById('location'),
  image: document.getElementById('image'),
  link: document.getElementById('link'),
  description: document.getElementById('description'),
  featured: document.getElementById('featured'),
  visible: document.getElementById('visible'),
  resetFormBtn: document.getElementById('resetFormBtn'),
  seedDataBtn: document.getElementById('seedDataBtn'),
  exportBtn: document.getElementById('exportBtn'),
  importInput: document.getElementById('importInput'),
  activeCount: document.getElementById('activeCount'),
  expiringCount: document.getElementById('expiringCount'),
  subscriberCount: document.getElementById('subscriberCount'),
  template: document.getElementById('offerCardTemplate')
};

let offers = loadOffers();
let subscribers = loadSubscribers();

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function parseDate(dateString) {
  return new Date(`${dateString}T00:00:00`);
}

function today() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
}

function getOfferStatus(offer) {
  const now = today();
  const start = parseDate(offer.startDate);
  const end = parseDate(offer.endDate);
  const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));

  if (end < now) return 'ended';
  if (diffDays <= 2) return 'expiring';
  if (start > now) return 'upcoming';
  return 'active';
}

function statusLabel(status) {
  switch (status) {
    case 'active': return 'نشط';
    case 'expiring': return 'ينتهي قريبًا';
    case 'ended': return 'منتهي';
    case 'upcoming': return 'قريبًا';
    default: return 'غير معروف';
  }
}

function statusClass(status) {
  if (status === 'ended') return 'status-ended';
  if (status === 'expiring') return 'status-expiring';
  return 'status-active';
}

function loadOffers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveOffers() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(offers));
}

function loadSubscribers() {
  try {
    const raw = localStorage.getItem(SUBSCRIBERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveSubscribers() {
  localStorage.setItem(SUBSCRIBERS_KEY, JSON.stringify(subscribers));
}

function seedOffers() {
  const sample = [
    {
      id: uid(),
      title: 'عرض نهاية الأسبوع على الوجبات العائلية',
      store: 'مطعم المذاق الريفي',
      category: 'مطاعم',
      startDate: formatDateOffset(0),
      endDate: formatDateOffset(3),
      discount: 'خصم 25%',
      location: 'بريدة - الخليج',
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
      link: 'https://wa.me/966500000000',
      description: 'خصم على الوجبات العائلية مع مشروب مجاني عند الطلب الداخلي.',
      featured: true,
      visible: true,
      createdAt: new Date().toISOString()
    },
    {
      id: uid(),
      title: 'خصومات القهوة المختصة',
      store: 'كافيه الموج',
      category: 'كافيهات',
      startDate: formatDateOffset(-1),
      endDate: formatDateOffset(1),
      discount: 'اشترِ 1 واحصل على 1',
      location: 'بريدة - الإسكان',
      image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80',
      link: 'https://example.com',
      description: 'عرض خاص على المشروبات الباردة والساخنة طوال اليوم.',
      featured: false,
      visible: true,
      createdAt: new Date().toISOString()
    },
    {
      id: uid(),
      title: 'تخفيضات على العطور الفرنسية',
      store: 'لمسة عطر',
      category: 'عطور',
      startDate: formatDateOffset(1),
      endDate: formatDateOffset(8),
      discount: 'حتى 40%',
      location: 'بريدة - طريق الملك عبدالعزيز',
      image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1200&q=80',
      link: 'https://instagram.com',
      description: 'مجموعة مختارة من العطور مع هدايا عند الشراء فوق مبلغ معين.',
      featured: true,
      visible: true,
      createdAt: new Date().toISOString()
    }
  ];
  offers = sample;
  saveOffers();
  renderAll();
  toast('تمت إضافة بيانات تجريبية جاهزة.');
}

function formatDateOffset(offset) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

function renderOffers() {
  const search = els.searchInput.value.trim().toLowerCase();
  const category = els.categoryFilter.value;
  const statusFilter = els.statusFilter.value;

  const filtered = [...offers]
    .filter(offer => offer.visible || statusFilter === 'all')
    .filter(offer => {
      const status = getOfferStatus(offer);
      const matchesSearch = [offer.title, offer.store, offer.location, offer.description]
        .join(' ')
        .toLowerCase()
        .includes(search);
      const matchesCategory = category === 'all' || offer.category === category;
      const matchesStatus = statusFilter === 'all'
        || (statusFilter === 'active' && (status === 'active' || status === 'expiring' || status === 'upcoming'))
        || (statusFilter === 'expiring' && status === 'expiring')
        || (statusFilter === 'ended' && status === 'ended');
      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      if (b.featured !== a.featured) return Number(b.featured) - Number(a.featured);
      return parseDate(a.endDate) - parseDate(b.endDate);
    });

  els.offersGrid.innerHTML = '';
  els.emptyState.classList.toggle('hidden', filtered.length > 0);

  filtered.forEach(offer => {
    const node = els.template.content.firstElementChild.cloneNode(true);
    const status = getOfferStatus(offer);
    const imageEl = node.querySelector('.offer-media');
    const badgeEl = node.querySelector('.offer-badge');
    const linkEl = node.querySelector('.offer-link');

    imageEl.style.backgroundImage = offer.image
      ? `linear-gradient(135deg, rgba(15,118,110,.08), rgba(29,78,216,.08)), url('${offer.image}')`
      : 'linear-gradient(135deg, rgba(15,118,110,.14), rgba(29,78,216,.14))';

    node.querySelector('.offer-category').textContent = offer.category;
    badgeEl.textContent = offer.featured ? 'مميز' : statusLabel(status);
    node.querySelector('.offer-title').textContent = offer.title;
    node.querySelector('.offer-store').textContent = `المتجر: ${offer.store}`;
    node.querySelector('.offer-description').textContent = offer.description;
    node.querySelector('.offer-discount').textContent = offer.discount;
    node.querySelector('.offer-location').textContent = offer.location;
    node.querySelector('.offer-dates').textContent = `من ${offer.startDate} إلى ${offer.endDate}`;
    linkEl.href = offer.link || '#';
    linkEl.style.pointerEvents = offer.link ? 'auto' : 'none';
    linkEl.style.opacity = offer.link ? '1' : '.55';

    node.querySelector('.share-btn').addEventListener('click', async () => {
      const shareData = {
        title: offer.title,
        text: `${offer.store} - ${offer.discount} - حتى ${offer.endDate}`,
        url: offer.link || location.href
      };
      try {
        if (navigator.share) {
          await navigator.share(shareData);
        } else {
          await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
          toast('تم نسخ بيانات العرض للمشاركة.');
        }
      } catch {}
    });

    els.offersGrid.appendChild(node);
  });
}

function renderAdminTable() {
  els.adminTableBody.innerHTML = '';

  [...offers]
    .sort((a, b) => parseDate(a.endDate) - parseDate(b.endDate))
    .forEach(offer => {
      const status = getOfferStatus(offer);
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <strong>${offer.title}</strong><br>
          <span style="color: var(--muted)">${offer.store}</span>
        </td>
        <td>${offer.category}</td>
        <td>${offer.startDate}<br>${offer.endDate}</td>
        <td><span class="status-chip ${statusClass(status)}">${statusLabel(status)}</span></td>
        <td>
          <div class="action-row">
            <button class="btn btn-light edit-btn">تعديل</button>
            <button class="btn btn-secondary toggle-btn">${offer.visible ? 'إخفاء' : 'إظهار'}</button>
            <button class="btn btn-danger delete-btn">حذف</button>
          </div>
        </td>
      `;

      tr.querySelector('.edit-btn').addEventListener('click', () => populateForm(offer.id));
      tr.querySelector('.toggle-btn').addEventListener('click', () => toggleVisibility(offer.id));
      tr.querySelector('.delete-btn').addEventListener('click', () => deleteOffer(offer.id));
      els.adminTableBody.appendChild(tr);
    });
}

function updateStats() {
  const activeOffers = offers.filter(o => {
    const status = getOfferStatus(o);
    return o.visible && (status === 'active' || status === 'expiring' || status === 'upcoming');
  });
  const expiring = offers.filter(o => o.visible && getOfferStatus(o) === 'expiring');
  els.activeCount.textContent = activeOffers.length;
  els.expiringCount.textContent = expiring.length;
  els.subscriberCount.textContent = subscribers.length;
}

function renderAll() {
  renderOffers();
  renderAdminTable();
  updateStats();
}

function resetForm() {
  els.offerForm.reset();
  els.offerId.value = '';
  els.visible.checked = true;
  els.formTitle.textContent = 'إضافة عرض جديد';
}

function populateForm(id) {
  const offer = offers.find(o => o.id === id);
  if (!offer) return;
  els.offerId.value = offer.id;
  els.title.value = offer.title;
  els.store.value = offer.store;
  els.category.value = offer.category;
  els.startDate.value = offer.startDate;
  els.endDate.value = offer.endDate;
  els.discount.value = offer.discount;
  els.location.value = offer.location;
  els.image.value = offer.image || '';
  els.link.value = offer.link || '';
  els.description.value = offer.description;
  els.featured.checked = !!offer.featured;
  els.visible.checked = !!offer.visible;
  els.formTitle.textContent = 'تعديل العرض';
  els.adminModal.querySelector('.modal-content').scrollTo({ top: 0, behavior: 'smooth' });
}

function getFormData() {
  return {
    id: els.offerId.value || uid(),
    title: els.title.value.trim(),
    store: els.store.value.trim(),
    category: els.category.value,
    startDate: els.startDate.value,
    endDate: els.endDate.value,
    discount: els.discount.value.trim(),
    location: els.location.value.trim(),
    image: els.image.value.trim(),
    link: els.link.value.trim(),
    description: els.description.value.trim(),
    featured: els.featured.checked,
    visible: els.visible.checked,
    createdAt: new Date().toISOString()
  };
}

function validateOffer(offer) {
  if (!offer.title || !offer.store || !offer.description || !offer.startDate || !offer.endDate || !offer.discount || !offer.location) {
    toast('فضلاً أكمل جميع الحقول المطلوبة.');
    return false;
  }
  if (parseDate(offer.endDate) < parseDate(offer.startDate)) {
    toast('تاريخ النهاية يجب أن يكون بعد تاريخ البداية.');
    return false;
  }
  return true;
}

function saveOffer(event) {
  event.preventDefault();
  const payload = getFormData();
  if (!validateOffer(payload)) return;

  const existingIndex = offers.findIndex(o => o.id === payload.id);
  if (existingIndex >= 0) {
    payload.createdAt = offers[existingIndex].createdAt;
    offers[existingIndex] = payload;
    toast('تم تحديث العرض بنجاح.');
  } else {
    offers.unshift(payload);
    toast('تمت إضافة العرض بنجاح.');
    maybeSendBrowserNotification(payload);
  }
  saveOffers();
  resetForm();
  renderAll();
}

function deleteOffer(id) {
  const offer = offers.find(o => o.id === id);
  if (!offer) return;
  if (!confirm(`هل تريد حذف العرض: ${offer.title} ؟`)) return;
  offers = offers.filter(o => o.id !== id);
  saveOffers();
  renderAll();
  toast('تم حذف العرض.');
}

function toggleVisibility(id) {
  offers = offers.map(o => o.id === id ? { ...o, visible: !o.visible } : o);
  saveOffers();
  renderAll();
}

function openAdmin() {
  els.adminModal.classList.remove('hidden');
  els.adminModal.setAttribute('aria-hidden', 'false');
}

function closeAdmin() {
  els.adminModal.classList.add('hidden');
  els.adminModal.setAttribute('aria-hidden', 'true');
}

function toast(message) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2400);
}

async function requestNotifications() {
  if (!('Notification' in window)) {
    toast('المتصفح لا يدعم الإشعارات.');
    return;
  }
  const permission = await Notification.requestPermission();
  if (permission === 'granted') {
    if (!subscribers.includes('browser-user')) {
      subscribers.push('browser-user');
      saveSubscribers();
      updateStats();
    }
    toast('تم تفعيل الإشعارات بنجاح.');
    new Notification('تم الاشتراك في تنبيهات العروض 🔔', {
      body: 'سيتم تنبيهك عند إضافة عرض جديد من هذا المتصفح.'
    });
  } else {
    toast('لم يتم السماح بالإشعارات.');
  }
}

function maybeSendBrowserNotification(offer) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('عرض جديد تمت إضافته', {
      body: `${offer.title} - ${offer.discount} - ${offer.store}`
    });
  }
}

function exportData() {
  const blob = new Blob([JSON.stringify(offers, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'offers-data.json';
  a.click();
  URL.revokeObjectURL(url);
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      if (!Array.isArray(parsed)) throw new Error();
      offers = parsed;
      saveOffers();
      renderAll();
      toast('تم استيراد البيانات بنجاح.');
    } catch {
      toast('ملف JSON غير صالح.');
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}

function autoArchiveExpiredNotice() {
  const endingToday = offers.filter(o => o.visible && getOfferStatus(o) === 'ended');
  if (endingToday.length > 0) {
    console.log('عروض منتهية يمكن أرشفتها أو إخفاؤها:', endingToday);
  }
}

els.searchInput.addEventListener('input', renderOffers);
els.categoryFilter.addEventListener('change', renderOffers);
els.statusFilter.addEventListener('change', renderOffers);
els.openAdminBtn.addEventListener('click', openAdmin);
els.heroAdminBtn.addEventListener('click', openAdmin);
els.closeAdminBtn.addEventListener('click', closeAdmin);
els.notifyBtn.addEventListener('click', requestNotifications);
els.offerForm.addEventListener('submit', saveOffer);
els.resetFormBtn.addEventListener('click', resetForm);
els.seedDataBtn.addEventListener('click', seedOffers);
els.exportBtn.addEventListener('click', exportData);
els.importInput.addEventListener('change', importData);
els.adminModal.addEventListener('click', (e) => {
  if (e.target.dataset.close === 'true') closeAdmin();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeAdmin();
});

renderAll();
autoArchiveExpiredNotice();
