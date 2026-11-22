
let medicines = JSON.parse(localStorage.getItem("meditimes")) || [];
let historyData = JSON.parse(localStorage.getItem("meditimeHistory")) || [];
let activeAlarmId = null;
let alarmSound = null;
let alarmInterval = null;
let checkedMinute = "";

const $ = id => document.getElementById(id);

function saveData() {
  localStorage.setItem("meditimes", JSON.stringify(medicines));
  localStorage.setItem("meditimeHistory", JSON.stringify(historyData));
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function updateDate() {
  $("todayDate").textContent =
    new Date().toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
}

function showPage(page) {
  document.querySelectorAll(".page").forEach(p => {
    p.classList.remove("active");
  });

  $(page).classList.add("active");

  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.page === page);
  });

  const titles = {
    dashboard: "Good day!",
    medicines: "My Medicines",
    history: "Medicine History",
    settings: "Settings"
  };

  $("pageTitle").textContent = titles[page];
}

document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.addEventListener("click", () => showPage(btn.dataset.page));
});

function openModal(id = null) {
  $("medicineModal").classList.add("show");
  $("medicineForm").reset();
  $("editId").value = "";
  $("photoPreview").style.display = "none";
  $("modalTitle").textContent = "Add New Medicine";

  if (id) {
    const med = medicines.find(m => m.id === id);
    if (!med) return;

    $("modalTitle").textContent = "Edit Medicine";
    $("editId").value = med.id;
    $("medicineName").value = med.name;
    $("medicineDose").value = med.dose;
    $("medicineTime").value = med.time;
    $("medicineRepeat").value = med.repeat;
    $("medicineFood").value = med.food;
    $("medicineStock").value = med.stock;

    if (med.photo) {
      $("photoPreview").src = med.photo;
      $("photoPreview").style.display = "block";
    }
  }
}

function closeModal() {
  $("medicineModal").classList.remove("show");
}

$("medicinePhoto").addEventListener("change", event => {
  const file = event.target.files[0];
  if (!file) return;

  if (file.size > 2 * 1024 * 1024) {
    alert("Please select an image smaller than 2 MB.");
    event.target.value = "";
    return;
  }

  const reader = new FileReader();

  reader.onload = e => {
    $("photoPreview").src = e.target.result;
    $("photoPreview").style.display = "block";
  };

  reader.readAsDataURL(file);
});

$("medicineForm").addEventListener("submit", event => {
  event.preventDefault();

  const id = $("editId").value;
  const oldMedicine = medicines.find(m => m.id === id);

  const photo =
    $("photoPreview").src &&
    $("photoPreview").style.display !== "none"
      ? $("photoPreview").src
      : "";

  const medicine = {
    id: id || Date.now().toString(),
    name: $("medicineName").value.trim(),
    dose: $("medicineDose").value.trim(),
    time: $("medicineTime").value,
    repeat: $("medicineRepeat").value,
    food: $("medicineFood").value,
    stock: Number($("medicineStock").value),
    photo: photo || oldMedicine?.photo || "",
    status: oldMedicine?.status || "pending",
    lastTaken: oldMedicine?.lastTaken || "",
    lastReminder: oldMedicine?.lastReminder || ""
  };

  if (!medicine.name || !medicine.dose || !medicine.time) {
    alert("Please complete all required fields.");
    return;
  }

  if (id) {
    medicines = medicines.map(m => m.id === id ? medicine : m);
  } else {
    medicines.push(medicine);
  }

  saveData();
  closeModal();
  renderApp();
});

function renderApp() {
  renderMedicines();
  renderDashboard();
  renderHistory();
}

function renderMedicines() {
  const container = $("medicineList");

  if (!medicines.length) {
    container.innerHTML = '<div class="empty">No medicines added yet.</div>';
    return;
  }

  container.innerHTML = medicines.map(m => `
    <div class="medicine-card">
      <img class="medicine-photo"
        src="${m.photo || "https://placehold.co/100x100/e7f7f5/13a89e?text=Rx"}"
        alt="Medicine">

      <div class="medicine-info">
        <h3>${escapeHTML(m.name)}</h3>
        <p>${escapeHTML(m.dose)} · ${escapeHTML(m.time)}</p>
        <p>${escapeHTML(m.food)} · ${escapeHTML(m.repeat)}</p>
        <p>Stock: ${m.stock}</p>
        <span class="status ${m.status}">
          ${escapeHTML(m.status)}
        </span>
      </div>

      <div class="medicine-actions">
        <button class="small-btn" onclick="markTaken('${m.id}')">Taken</button>
        <button class="small-btn" onclick="snooze('${m.id}')">Snooze</button>
        <button class="small-btn" onclick="openModal('${m.id}')">Edit</button>
        <button class="small-btn danger" onclick="deleteMedicine('${m.id}')">Delete</button>
      </div>
    </div>
  `).join("");
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function renderDashboard() {
  const total = medicines.length;
  const taken = medicines.filter(m => m.status === "taken").length;
  const remaining = total - taken;
  const percent = total ? Math.round(taken / total * 100) : 0;

  $("totalCount").textContent = total;
  $("takenCount").textContent = taken;
  $("remainingCount").textContent = remaining;
  $("progressBar").style.width = percent + "%";
  $("progressText").textContent = percent + "% completed";

  const list = $("todayList");

  if (!total) {
    list.innerHTML = '<div class="empty">Add your first medicine to get started.</div>';
    return;
  }

  list.innerHTML = medicines
    .slice()
    .sort((a, b) => a.time.localeCompare(b.time))
    .map(m => `
      <div class="medicine-card">
        <div class="medicine-info">
          <h3>${escapeHTML(m.name)}</h3>
          <p>${escapeHTML(m.dose)} · ${escapeHTML(m.time)}</p>
          <p>${escapeHTML(m.food)}</p>
        </div>
        <span class="status ${m.status}">${escapeHTML(m.status)}</span>
        ${m.status !== "taken"
          ? `<button class="small-btn" onclick="markTaken('${m.id}')">Mark Taken</button>`
          : ""}
      </div>
    `).join("");
}

function markTaken(id) {
  const med = medicines.find(m => m.id === id);
  if (!med) return;

  med.status = "taken";
  med.lastTaken = new Date().toISOString();

  if (med.stock > 0) med.stock--;

  historyData.unshift({
    name: med.name,
    dose: med.dose,
    action: "Taken",
    date: new Date().toLocaleString()
  });

  saveData();

  if (activeAlarmId === id) stopAlarm();

  renderApp();
}

function deleteMedicine(id) {
  if (!confirm("Delete this medicine?")) return;

  medicines = medicines.filter(m => m.id !== id);
  saveData();
  renderApp();
}

function snooze(id) {
  const med = medicines.find(m => m.id === id);
  if (!med) return;

  const snoozeTime = Date.now() + 10 * 60 * 1000;

  med.snoozeUntil = snoozeTime;
  saveData();

  if (activeAlarmId === id) stopAlarm();

  alert("Reminder snoozed for 10 minutes.");
}

function startAlarm(med) {
  activeAlarmId = med.id;

  $("alarmMedicineName").textContent = med.name;
  $("alarmMedicineDose").textContent = med.dose;
  $("alarmMedicineFood").textContent = med.food;
  $("alarmModal").classList.add("show");

  playAlarm();

  if ($("voiceToggle").checked && "speechSynthesis" in window) {
    speechSynthesis.cancel();
    speechSynthesis.speak(
      new SpeechSynthesisUtterance(
        "Time to take your medicine " + med.name
      )
    );
  }

  if ("Notification" in window &&
      Notification.permission === "granted") {
    new Notification("MediTime Reminder", {
      body: "Time to take " + med.name
    });
  }
}

function playAlarm() {
  stopSoundOnly();

  try {
    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) return;

    const context = new AudioContextClass();

    alarmSound = context;

    function beep() {
      if (!alarmSound) return;

      const oscillator = context.createOscillator();
      const gain = context.createGain();

      oscillator.connect(gain);
      gain.connect(context.destination);

      oscillator.frequency.value = 880;
      gain.gain.value = 0.2;

      oscillator.start();
      oscillator.stop(context.currentTime + 0.4);
    }

    beep();
    alarmInterval = setInterval(beep, 1200);
  } catch (error) {
    console.log("Audio unavailable:", error);
  }
}

function stopSoundOnly() {
  if (alarmInterval) clearInterval(alarmInterval);
  alarmInterval = null;

  if (alarmSound) {
    alarmSound.close().catch(() => {});
  }

  alarmSound = null;
}

function stopAlarm() {
  stopSoundOnly();
  $("alarmModal").classList.remove("show");
  activeAlarmId = null;
}

function markAlarmTaken() {
  if (activeAlarmId) markTaken(activeAlarmId);
}

function snoozeAlarm() {
  if (activeAlarmId) snooze(activeAlarmId);
}

function enableNotifications() {
  if (!("Notification" in window)) {
    alert("This browser does not support notifications.");
    return;
  }

  Notification.requestPermission().then(permission => {
    alert(
      permission === "granted"
        ? "Notifications enabled."
        : "Notification permission was not granted."
    );
  });
}

function checkReminders() {
  const now = new Date();
  const currentTime =
    String(now.getHours()).padStart(2, "0") + ":" +
    String(now.getMinutes()).padStart(2, "0");

  const currentDate = today();
  const minuteKey = currentDate + " " + currentTime;

  if (checkedMinute !== minuteKey) {
    checkedMinute = minuteKey;

    medicines.forEach(med => {
      const isDue = med.time === currentTime;
      const alreadyReminded = med.lastReminder === minuteKey;
      const snoozed = med.snoozeUntil && Date.now() < med.snoozeUntil;

      if (isDue && !alreadyReminded &&
          med.status !== "taken" && !snoozed) {
        med.lastReminder = minuteKey;
        saveData();
        startAlarm(med);
      }
    });
  }

  medicines.forEach(med => {
    if (med.snoozeUntil &&
        Date.now() >= med.snoozeUntil &&
        med.status !== "taken") {
      med.snoozeUntil = null;
      startAlarm(med);
      saveData();
    }
  });
}

function renderHistory() {
  const container = $("historyList");

  if (!historyData.length) {
    container.innerHTML = '<div class="empty">No history available yet.</div>';
    return;
  }

  container.innerHTML = historyData.map(item => `
    <div class="history-item">
      <strong>${escapeHTML(item.name)}</strong>
      <p>${escapeHTML(item.dose)} · ${escapeHTML(item.action)}</p>
      <small>${escapeHTML(item.date)}</small>
    </div>
  `).join("");
}

function saveCaregiver() {
  localStorage.setItem("caregiverName", $("caregiverName").value);
  localStorage.setItem("caregiverPhone", $("caregiverPhone").value);
  alert("Caregiver details saved on this device.");
}

$("themeBtn").addEventListener("click", () => {
  document.body.classList.toggle("dark");

  const dark = document.body.classList.contains("dark");
  $("themeBtn").textContent = dark ? "☀️" : "🌙";

  localStorage.setItem("meditimeDark", dark ? "yes" : "no");
});

$("voiceToggle").checked =
  localStorage.getItem("meditimeVoice") === "yes";

$("voiceToggle").addEventListener("change", event => {
  localStorage.setItem(
    "meditimeVoice",
    event.target.checked ? "yes" : "no"
  );
});

$("languageSelect").value =
  localStorage.getItem("meditimeLanguage") || "en";

$("languageSelect").addEventListener("change", event => {
  localStorage.setItem("meditimeLanguage", event.target.value);
  alert("Language preference saved. Full Urdu translation needs additional text translations.");
});

$("caregiverName").value =
  localStorage.getItem("caregiverName") || "";

$("caregiverPhone").value =
  localStorage.getItem("caregiverPhone") || "";

if (localStorage.getItem("meditimeDark") === "yes") {
  document.body.classList.add("dark");
  $("themeBtn").textContent = "☀️";
}

updateDate();
renderApp();

setInterval(checkReminders, 1000);
