// src/components/activity.js

export function addActivity(icon, title, subtitle, bg, color) {
  const list = document.getElementById('activity-list')
  const empty = list.querySelector('.empty-state')
  if (empty) empty.remove()

  const item = document.createElement('div')
  item.className = 'activity-item'
  item.innerHTML = `
    <div class="activity-icon" style="background:${bg}; color:${color};">${icon}</div>
    <div>
      <div style="font-size:0.875rem; font-weight:600;">${title}</div>
      <div class="activity-time">${subtitle} · just now</div>
    </div>`
  list.insertBefore(item, list.firstChild)
  const items = list.querySelectorAll('.activity-item')
  if (items.length > 8) items[items.length - 1].remove()
}
