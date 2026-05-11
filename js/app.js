(function () {
  var state = {
    workouts: [],
    currentWorkoutKey: null,
    currentExerciseId: null,
    history: {},
    lastWorkout: null
  };

  function formatDate(date) {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    }).format(date);
  }

  function getInlineWorkouts() {
    return { workouts: [] };
  }

  function loadWorkouts() {
    return fetch("data/treinos.json", { cache: "no-store" })
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Falha ao carregar treinos");
        }
        return response.json();
      })
      .catch(function () {
        return getInlineWorkouts();
      });
  }

  function getWorkoutByKey(workoutKey) {
    return state.workouts.find(function (workout) {
      return workout.key === workoutKey;
    });
  }

  function getExerciseById(workout, exerciseId) {
    return workout.exercises.find(function (exercise) {
      return exercise.id === exerciseId;
    });
  }

  function getCurrentWorkoutSession() {
    if (!state.currentWorkoutKey) {
      return {};
    }
    return StorageService.getWorkoutSession(state.currentWorkoutKey);
  }

  function openExerciseHistory() {
    var workout = getWorkoutByKey(state.currentWorkoutKey);
    var exercise = getExerciseById(workout, state.currentExerciseId);
    UI.renderExerciseHistoryPage(exercise, state.history[state.currentExerciseId]);
    UI.showPage("page-history");
  }

  function renderHome() {
    state.lastWorkout = StorageService.getLastWorkout();
    UI.renderLastWorkout(state.lastWorkout);
    UI.renderWorkoutList(state.workouts);
    UI.showPage("page-home");
  }

  function openWorkout(workoutKey) {
    state.currentWorkoutKey = workoutKey;
    var workout = getWorkoutByKey(workoutKey);
    var session = getCurrentWorkoutSession();
    UI.renderWorkoutPage(workout, session, state.history);
    UI.showPage("page-workout");
  }

  function openExercise(exerciseId) {
    state.currentExerciseId = exerciseId;
    var workout = getWorkoutByKey(state.currentWorkoutKey);
    var exercise = getExerciseById(workout, exerciseId);
    var session = getCurrentWorkoutSession();
    UI.renderExercisePage(exercise, state.history[exerciseId], session[exerciseId]);
    UI.showPage("page-exercise");
  }

  function normalizeNumber(value) {
    return String(value).trim().replace(",", ".");
  }

  function readSetsFromForm() {
    var rows = [];
    var grouped = {};

    document.querySelectorAll("#series-inputs input").forEach(function (input) {
      var index = Number(input.getAttribute("data-index"));
      var role = input.getAttribute("data-role");
      grouped[index] = grouped[index] || {};
      grouped[index][role] = normalizeNumber(input.value);
    });

    Object.keys(grouped).forEach(function (key) {
      var item = grouped[key];
      var hasLoad = Boolean(item.load);
      var hasReps = Boolean(item.reps);

      if (!hasLoad && !hasReps) {
        return;
      }

      if (!hasLoad || !hasReps) {
        throw new Error("Preencha carga e reps na mesma série.");
      }

      rows.push({
        load: Number(item.load),
        reps: Number(item.reps)
      });
    });

    if (!rows.length) {
      throw new Error("Preencha pelo menos uma série.");
    }

    return rows;
  }

  function buildBackupPayload() {
    return {
      exportedAt: new Date().toISOString(),
      app: "app-treino",
      version: 1,
      history: state.history,
      lastWorkout: StorageService.getLastWorkout(),
      sessions: StorageService.getAllWorkoutSessions()
    };
  }

  function triggerDownload(blob, filename) {
    var url = URL.createObjectURL(blob);
    var anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 1000);
  }

  function finishWorkoutAndBackup() {
    try {
      var payload = buildBackupPayload();
      var json = JSON.stringify(payload, null, 2);
      var blob = new Blob([json], { type: "application/json" });
      var now = new Date();
      var filename = "backup-treino-" + now.toISOString().replace(/[:.]/g, "-") + ".json";
      var file = new File([blob], filename, { type: "application/json" });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({
          title: "Backup App Treino",
          text: "Backup do histórico de treino",
          files: [file]
        }).catch(function () {
          triggerDownload(blob, filename);
        });
      } else {
        triggerDownload(blob, filename);
      }

      UI.showToast("Backup gerado.");
    } catch (error) {
      UI.showToast("Erro ao gerar backup.");
    }
  }

  function saveExercise(event) {
    event.preventDefault();

    try {
      var workout = getWorkoutByKey(state.currentWorkoutKey);
      var exercise = getExerciseById(workout, state.currentExerciseId);
      var session = getCurrentWorkoutSession();
      var sets = readSetsFromForm();
      var note = document.getElementById("exercise-note").value.trim();
      var now = new Date();
      var record = {
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        workoutKey: workout.key,
        planned: exercise.sets + "x" + exercise.reps,
        sets: sets,
        note: note,
        notes: note,
        performedAt: now.toISOString()
      };

      session[exercise.id] = record;
      state.history[exercise.id] = state.history[exercise.id] || [];
      state.history[exercise.id].push(record);

      StorageService.saveWorkoutSession(workout.key, session);
      StorageService.saveHistory(state.history);
      StorageService.saveLastWorkout({
        key: workout.key,
        name: workout.name,
        dateLabel: formatDate(now),
        savedAt: now.toISOString()
      });

      UI.showToast("Exercício salvo.");
      openWorkout(workout.key);
    } catch (error) {
      UI.showToast(error.message || "Não foi possível salvar.");
    }
  }

  function registerEvents() {
    document.getElementById("workout-list").addEventListener("click", function (event) {
      var button = event.target.closest("[data-workout-key]");
      if (!button) {
        return;
      }
      openWorkout(button.getAttribute("data-workout-key"));
    });

    document.getElementById("exercise-list").addEventListener("click", function (event) {
      var button = event.target.closest("[data-exercise-id]");
      if (!button) {
        return;
      }
      openExercise(button.getAttribute("data-exercise-id"));
    });

    document.getElementById("back-to-home").addEventListener("click", renderHome);

    document.getElementById("back-to-workout").addEventListener("click", function () {
      openWorkout(state.currentWorkoutKey);
    });

    document.getElementById("back-to-exercise").addEventListener("click", function () {
      openExercise(state.currentExerciseId);
    });

    document.getElementById("view-history-button").addEventListener("click", function () {
      openExerciseHistory();
    });

    document.getElementById("exercise-form").addEventListener("submit", saveExercise);

    document.getElementById("finish-workout-backup").addEventListener("click", finishWorkoutAndBackup);

    document.getElementById("clear-current-workout").addEventListener("click", function () {
      if (!state.currentWorkoutKey && !state.lastWorkout) {
        UI.showToast("Escolha um treino antes de limpar.");
        return;
      }

      var targetWorkoutKey = state.currentWorkoutKey || (state.lastWorkout ? state.lastWorkout.key : null);
      if (!targetWorkoutKey) {
        return;
      }

      StorageService.clearWorkoutSession(targetWorkoutKey);
      if (state.currentWorkoutKey === targetWorkoutKey) {
        openWorkout(targetWorkoutKey);
      } else {
        renderHome();
      }
      UI.showToast("Status atual do treino removido.");
    });
  }

  function registerServiceWorker() {
    var supportedProtocol = window.location.protocol === "https:" || window.location.hostname === "localhost";
    if ("serviceWorker" in navigator && supportedProtocol) {
      navigator.serviceWorker.register("service-worker.js").catch(function () {
        return null;
      });
    }
  }

  function init() {
    state.history = StorageService.getHistory();

    loadWorkouts().then(function (data) {
      state.workouts = data.workouts || [];
      renderHome();
      registerEvents();
      registerServiceWorker();
    }).catch(function () {
      UI.showToast("Não foi possível carregar os treinos.");
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();