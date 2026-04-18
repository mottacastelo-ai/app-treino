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
    return {
      "workouts": [
        {
          "key": "A",
          "name": "Treino A",
          "exercises": [
            {
              "id": "extensao-toracica-no-banco-ou-rolo",
              "name": "Extensao toracica no banco ou rolo",
              "sets": 2,
              "reps": "10",
              "section": "Aquecimento",
              "notes": ""
            },
            {
              "id": "rotacao-toracica-em-quadrupede",
              "name": "Rotacao toracica em quadrupede",
              "sets": 2,
              "reps": "8 cada lado",
              "section": "Aquecimento",
              "notes": ""
            },
            {
              "id": "wall-slide-a",
              "name": "Wall slide",
              "sets": 2,
              "reps": "10",
              "section": "Aquecimento",
              "notes": ""
            },
            {
              "id": "dead-bug-a",
              "name": "Dead bug",
              "sets": 2,
              "reps": "10",
              "section": "Aquecimento",
              "notes": ""
            },
            {
              "id": "bird-dog-aquecimento",
              "name": "Bird dog",
              "sets": 2,
              "reps": "8 cada lado",
              "section": "Aquecimento",
              "notes": ""
            },
            {
              "id": "abducao-com-elastico",
              "name": "Abducao com elastico",
              "sets": 2,
              "reps": "20",
              "section": "Ativacao",
              "notes": ""
            },
            {
              "id": "ponte-de-gluteo",
              "name": "Ponte de gluteo",
              "sets": 2,
              "reps": "12",
              "section": "Ativacao",
              "notes": "2s contracao"
            },
            {
              "id": "leg-press-45",
              "name": "Leg press 45",
              "sets": 4,
              "reps": "10-12",
              "section": "Treino principal",
              "notes": "Pes medios alinhados"
            },
            {
              "id": "agachamento-goblet",
              "name": "Agachamento goblet",
              "sets": 3,
              "reps": "10",
              "section": "Treino principal",
              "notes": ""
            },
            {
              "id": "step-up-baixo",
              "name": "Step up baixo",
              "sets": 3,
              "reps": "10 cada perna",
              "section": "Treino principal",
              "notes": ""
            },
            {
              "id": "mesa-flexora-a",
              "name": "Mesa flexora",
              "sets": 3,
              "reps": "12",
              "section": "Treino principal",
              "notes": ""
            },
            {
              "id": "hip-thrust",
              "name": "Hip thrust",
              "sets": 3,
              "reps": "10",
              "section": "Treino principal",
              "notes": "2s topo"
            },
            {
              "id": "panturrilha-em-pe",
              "name": "Panturrilha em pe",
              "sets": 4,
              "reps": "15-20",
              "section": "Treino principal",
              "notes": ""
            },
            {
              "id": "pallof-press-a",
              "name": "Pallof press",
              "sets": 3,
              "reps": "12 cada lado",
              "section": "Core",
              "notes": ""
            },
            {
              "id": "prancha-a",
              "name": "Prancha",
              "sets": 3,
              "reps": "30-40s",
              "section": "Core",
              "notes": ""
            },
            {
              "id": "bird-dog-core",
              "name": "Bird dog",
              "sets": 2,
              "reps": "10 cada lado",
              "section": "Core",
              "notes": ""
            }
          ]
        },
        {
          "key": "B",
          "name": "Treino B",
          "exercises": [
            {
              "id": "rotacao-externa-com-elastico-b",
              "name": "Rotacao externa com elastico",
              "sets": 2,
              "reps": "15",
              "section": "Ativacao",
              "notes": ""
            },
            {
              "id": "wall-slide-b",
              "name": "Wall slide",
              "sets": 2,
              "reps": "10",
              "section": "Ativacao",
              "notes": ""
            },
            {
              "id": "supino-maquina-halteres",
              "name": "Supino maquina/halteres",
              "sets": 4,
              "reps": "10",
              "section": "Treino principal",
              "notes": ""
            },
            {
              "id": "remada-baixa-neutra",
              "name": "Remada baixa neutra",
              "sets": 4,
              "reps": "10-12",
              "section": "Treino principal",
              "notes": "pausa 1s"
            },
            {
              "id": "elevacao-lateral-b",
              "name": "Elevacao lateral",
              "sets": 3,
              "reps": "12-15",
              "section": "Treino principal",
              "notes": ""
            },
            {
              "id": "face-pull-b",
              "name": "Face pull",
              "sets": 4,
              "reps": "12-15",
              "section": "Treino principal",
              "notes": ""
            },
            {
              "id": "triceps-corda-b",
              "name": "Triceps corda",
              "sets": 3,
              "reps": "12-15",
              "section": "Treino principal",
              "notes": ""
            },
            {
              "id": "rosca-direta-barra-w",
              "name": "Rosca direta barra W",
              "sets": 3,
              "reps": "12",
              "section": "Treino principal",
              "notes": ""
            },
            {
              "id": "pallof-press-b",
              "name": "Pallof press",
              "sets": 2,
              "reps": "12 cada lado",
              "section": "Core",
              "notes": ""
            }
          ]
        },
        {
          "key": "C",
          "name": "Treino C",
          "exercises": [
            {
              "id": "face-pull-leve",
              "name": "Face pull leve",
              "sets": 2,
              "reps": "15",
              "section": "Ativacao",
              "notes": ""
            },
            {
              "id": "rotacao-externa-com-elastico-c",
              "name": "Rotacao externa com elastico",
              "sets": 2,
              "reps": "15",
              "section": "Ativacao",
              "notes": ""
            },
            {
              "id": "supino-inclinado-halteres",
              "name": "Supino inclinado halteres",
              "sets": 3,
              "reps": "10",
              "section": "Treino principal",
              "notes": ""
            },
            {
              "id": "pulldown-frente",
              "name": "Pulldown frente",
              "sets": 3,
              "reps": "10-12",
              "section": "Treino principal",
              "notes": ""
            },
            {
              "id": "crucifixo-invertido",
              "name": "Crucifixo invertido",
              "sets": 3,
              "reps": "12-15",
              "section": "Treino principal",
              "notes": ""
            },
            {
              "id": "y-no-banco-inclinado",
              "name": "Y no banco inclinado",
              "sets": 3,
              "reps": "12",
              "section": "Treino principal",
              "notes": ""
            },
            {
              "id": "triceps-unilateral-cabo",
              "name": "Triceps unilateral cabo",
              "sets": 3,
              "reps": "12",
              "section": "Treino principal",
              "notes": ""
            },
            {
              "id": "rosca-martelo-c",
              "name": "Rosca martelo",
              "sets": 3,
              "reps": "12",
              "section": "Treino principal",
              "notes": ""
            },
            {
              "id": "dead-bug-c",
              "name": "Dead bug",
              "sets": 2,
              "reps": "10",
              "section": "Core",
              "notes": ""
            }
          ]
        },
        {
          "key": "D",
          "name": "Treino D",
          "exercises": [
            {
              "id": "mobilidade-toracica",
              "name": "Mobilidade toracica",
              "sets": 2,
              "reps": "10",
              "section": "Ativacao",
              "notes": ""
            },
            {
              "id": "wall-slide-d",
              "name": "Wall slide",
              "sets": 2,
              "reps": "10",
              "section": "Ativacao",
              "notes": ""
            },
            {
              "id": "crucifixo-no-cabo",
              "name": "Crucifixo no cabo",
              "sets": 3,
              "reps": "12",
              "section": "Treino principal",
              "notes": ""
            },
            {
              "id": "flexao-inclinada-no-banco",
              "name": "Flexao inclinada no banco",
              "sets": 3,
              "reps": "12",
              "section": "Treino principal",
              "notes": ""
            },
            {
              "id": "remada-unilateral-halter",
              "name": "Remada unilateral halter",
              "sets": 3,
              "reps": "10 cada lado",
              "section": "Treino principal",
              "notes": ""
            },
            {
              "id": "pulley-triangulo",
              "name": "Pulley triangulo",
              "sets": 3,
              "reps": "12",
              "section": "Treino principal",
              "notes": ""
            },
            {
              "id": "remada-alta-aberta-no-cabo",
              "name": "Remada alta aberta no cabo",
              "sets": 3,
              "reps": "12",
              "section": "Treino principal",
              "notes": ""
            },
            {
              "id": "t-no-banco-inclinado",
              "name": "T no banco inclinado",
              "sets": 3,
              "reps": "12",
              "section": "Treino principal",
              "notes": ""
            },
            {
              "id": "encolhimento-leve-com-pausa",
              "name": "Encolhimento leve com pausa",
              "sets": 3,
              "reps": "15",
              "section": "Treino principal",
              "notes": "1-2s contracao"
            },
            {
              "id": "face-pull-d",
              "name": "Face pull",
              "sets": 3,
              "reps": "15",
              "section": "Treino principal",
              "notes": ""
            },
            {
              "id": "prancha-lateral",
              "name": "Prancha lateral",
              "sets": 2,
              "reps": "30s cada lado",
              "section": "Core",
              "notes": ""
            }
          ]
        }
      ]
    };
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
