// Configurações de tempo (em minutos)
let times = {
    pomodoro: 30,
    shortBreak: 5,
    longBreak: 15
};

let currentMode = 'pomodoro';
let timeLeft = times[currentMode] * 60;
let timerId = null;
let isRunning = false;
let targetEndTime = 0; // Cálculo absoluto do tempo para evitar atrasos no mobile

let audioCtx = null;
let activeOscillators = []; // Guarda os osciladores para cancelar o alarme quando pausar

const timerDisplay = document.getElementById('timer');
const startBtn = document.getElementById('start-btn');
const notifBanner = document.getElementById('notif-banner');

// Permissões de Notificação
function checkNotificationPermission() {
    if ("Notification" in window) {
        if (Notification.permission === "default") {
            notifBanner.style.display = 'flex';
        } else {
            notifBanner.style.display = 'none';
        }
    }
}

function requestNotificationPermission() {
    if ("Notification" in window) {
        Notification.requestPermission().then(permission => {
            checkNotificationPermission();
        });
    }
}

// Inicializa o Áudio
function initAudioContext() {
    if (!audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
            audioCtx = new AudioContextClass();
        }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function stopAlarm() {
    activeOscillators.forEach(osc => {
        try { osc.stop(); } catch(e) {}
    });
    activeOscillators = [];
}

// Alarme Digital Estilo Despertador (Alto e Percutível)
function playAlarmSound() {
    stopAlarm();
    
    try {
        initAudioContext();
        if (!audioCtx) return;

        const now = audioCtx.currentTime;
        
        const masterGain = audioCtx.createGain();
        masterGain.gain.value = 0.8;
        masterGain.connect(audioCtx.destination);

        const totalCycles = 6;
        const cycleDuration = 1.2;

        for (let cycle = 0; cycle < totalCycles; cycle++) {
            const cycleStart = now + (cycle * cycleDuration);
            
            for (let beep = 0; beep < 4; beep++) {
                const beepStart = cycleStart + (beep * 0.15);
                
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();

                osc.type = 'square';
                osc.frequency.setValueAtTime(880, beepStart); // Nota A5

                gain.gain.setValueAtTime(0, beepStart);
                gain.gain.linearRampToValueAtTime(1, beepStart + 0.01);
                gain.gain.setValueAtTime(1, beepStart + 0.08);
                gain.gain.linearRampToValueAtTime(0, beepStart + 0.1);

                osc.connect(gain);
                gain.connect(masterGain);

                osc.start(beepStart);
                osc.stop(beepStart + 0.1);
                
                activeOscillators.push(osc);
            }
        }
    } catch (e) {
        console.error("Erro ao reproduzir o alarme:", e);
    }
}

function sendPopupNotification() {
    const titles = {
        pomodoro: "🍅 Pomodoro Concluído!",
        shortBreak: "☕ Pausa Curta Finalizada!",
        longBreak: "🌴 Pausa Longa Finalizada!"
    };

    const messages = {
        pomodoro: "Excelente foco! Hora de descansar alguns minutos.",
        shortBreak: "Sua pausa curta acabou. Pronto para o próximo ciclo?",
        longBreak: "Pausa longa encerrada. Vamos retornar aos trabalhos?"
    };

    if ("Notification" in window && Notification.permission === "granted") {
        new Notification(titles[currentMode] || "Tempo Esgotado!", {
            body: messages[currentMode] || "Seu tempo no Pomodoro acabou.",
            requireInteraction: true
        });
    }
}

function onTimerComplete() {
    pauseTimer();
    playAlarmSound();
    sendPopupNotification();
}

function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    timerDisplay.textContent = formattedTime;
    document.title = `${formattedTime} - Pomodoro`;
}

function switchMode(mode, evt) {
    stopAlarm();
    currentMode = mode;
    
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    if (evt && evt.target) {
        evt.target.classList.add('active');
    }

    pauseTimer();
    timeLeft = times[currentMode] * 60;
    updateDisplay();
}

function toggleTimer() {
    stopAlarm();
    initAudioContext(); 
    
    if ("Notification" in window && Notification.permission === "default") {
        requestNotificationPermission();
    }

    if (isRunning) {
        pauseTimer();
    } else {
        startTimer();
    }
}

function startTimer() {
    if (isRunning) return;
    isRunning = true;
    startBtn.textContent = 'Pausar';
    
    // Define o instante exato de término no relógio do sistema
    targetEndTime = Date.now() + (timeLeft * 1000);
    
    timerId = setInterval(() => {
        const now = Date.now();
        const remaining = Math.round((targetEndTime - now) / 1000);
        
        if (remaining > 0) {
            if (remaining !== timeLeft) {
                timeLeft = remaining;
                updateDisplay();
            }
        } else {
            timeLeft = 0;
            updateDisplay();
            onTimerComplete();
        }
    }, 250);
}

function pauseTimer() {
    isRunning = false;
    startBtn.textContent = 'Iniciar';
    if (timerId) {
        clearInterval(timerId);
        timerId = null;
    }
}

function resetTimer() {
    stopAlarm();
    pauseTimer();
    timeLeft = times[currentMode] * 60;
    updateDisplay();
}

function updateCustomTimes() {
    const pVal = parseInt(document.getElementById('input-pomodoro').value) || 1;
    const sVal = parseInt(document.getElementById('input-short').value) || 1;
    const lVal = parseInt(document.getElementById('input-long').value) || 1;

    times.pomodoro = Math.max(1, pVal);
    times.shortBreak = Math.max(1, sVal);
    times.longBreak = Math.max(1, lVal);

    if (!isRunning) {
        timeLeft = times[currentMode] * 60;
        updateDisplay();
    }
}

function toggleSettings() {
    const panel = document.getElementById('settings-panel');
    const arrow = document.getElementById('toggle-arrow');
    if (panel.classList.contains('hidden')) {
        panel.classList.remove('hidden');
        arrow.textContent = '▲';
    } else {
        panel.classList.add('hidden');
        arrow.textContent = '▼';
    }
}

function exportNotes() {
    const notesText = document.getElementById('notes-input').value;
    
    if (!notesText.trim()) {
        alert('Por favor, digite alguma nota antes de submeter.');
        return;
    }

    const blob = new Blob([notesText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    const now = new Date();
    const filename = `nota-pomodoro-${now.toISOString().slice(0, 10)}.txt`;
    
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Registo do Service Worker para PWA
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js')
    .then(() => console.log('Service Worker registrado com sucesso!'))
    .catch(err => console.error('Erro ao registrar Service Worker:', err));
}

// Inicialização
updateDisplay();
checkNotificationPermission();
